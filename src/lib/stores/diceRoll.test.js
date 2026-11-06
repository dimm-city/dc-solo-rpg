/**
 * rollDice: which dice were thrown (LS-03), resolving once the dice are at rest (LS-05),
 * skipping to the result (LS-05), and reduced motion (AC-04).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/** What dice-box-threejs's roll() resolves with (getDiceResults(), no argument) */
const realResult = {
	notation: '2d20@19,5',
	sets: [
		{
			num: 2,
			type: 'd20',
			sides: 20,
			rolls: [
				{ type: 'd20', sides: 20, id: 0, value: 19, label: '19', reason: '' },
				{ type: 'd20', sides: 20, id: 1, value: 5, label: '5', reason: '' }
			],
			total: 24
		}
	],
	modifier: 0,
	total: 24
};

// A class instance, like the real DiceBox (a plain object would be wrapped in a $state proxy)
class FakeDiceBox {
	initialize = vi.fn(async () => {});
	resizeWorld = vi.fn();
	clearDice = vi.fn();
	roll = vi.fn(async () => realResult);
	diceList = [];
	world = { step: vi.fn() };
	iteration = 0;
	iterationLimit = 1000;
	framerate = 1 / 60;
	animstate = 'throw';
	throwFinished = vi.fn(() => true);
	renderer = { render: vi.fn() };
}
const box = new FakeDiceBox();

vi.mock('@3d-dice/dice-box-threejs', () => ({
	default: vi.fn(function () {
		return box;
	})
}));

const {
	rollDice,
	skipRoll,
	readDiceValues,
	diceState,
	initializeDiceBox,
	SETTLE_HOLD_MS,
	STATIC_ROLL_MS
} = await import('./diceStore.svelte.js');

let reducedMotion = false;

beforeEach(async () => {
	reducedMotion = false;
	window.matchMedia = vi.fn((query) => ({
		matches: query.includes('reduce') ? reducedMotion : false,
		addListener() {},
		removeListener() {}
	}));
	vi.clearAllMocks();
	box.roll.mockImplementation(async () => realResult);
	box.diceList = [];
	diceState.lastRoll = null;
	diceState.staticRoll = null;

	if (!document.getElementById('dice-roller-container')) {
		const container = document.createElement('div');
		container.id = 'dice-roller-container';
		document.body.appendChild(container);
		await initializeDiceBox(container);
	}
});

afterEach(() => vi.useRealTimers());

describe('readDiceValues', () => {
	it('reads every die from the dice-box result sets', () => {
		expect(readDiceValues(realResult)).toEqual([19, 5]);
	});

	it('is empty for a result without sets (the old result.rolls read)', () => {
		expect(readDiceValues({ total: 24 })).toEqual([]);
		expect(readDiceValues(null)).toEqual([]);
	});
});

describe('rollDice', () => {
	it('throws the dice the game rolled and records both, with the kept one', async () => {
		const result = await rollDice(19, { isLucid: true, dice: [19, 5] });
		expect(box.roll).toHaveBeenCalledWith('2d20@19,5');
		expect(result.rolls).toEqual([19, 5]);
		expect(result.finalValue).toBe(19);
		expect(diceState.lastRoll).toEqual({
			rolls: [19, 5],
			finalValue: 19,
			isLucid: true,
			isSurreal: false
		});
	});

	it('keeps the lower die when Surreal', async () => {
		const result = await rollDice(5, { isSurreal: true, dice: [19, 5] });
		expect(result.finalValue).toBe(5);
	});

	it('resolves as soon as every die has been at rest a moment, without waiting on dice-box', async () => {
		box.roll.mockImplementation(() => new Promise(() => {})); // dice-box never finishes
		box.diceList = [{ body: { sleepState: 0 } }, { body: { sleepState: 0 } }];
		let resolved = false;
		const rolling = rollDice(12, { isLucid: true, dice: [12, 3] }).then((r) => {
			resolved = true;
			return r;
		});

		await new Promise((r) => setTimeout(r, SETTLE_HOLD_MS + 50));
		expect(resolved).toBe(false); // still tumbling

		box.diceList.forEach((die) => (die.body.sleepState = 1)); // below dice-box's speed limit
		const result = await rolling;
		expect(result.rolls).toEqual([12, 3]); // the forced faces
		expect(result.finalValue).toBe(12);
	});

	it('a skip jumps to the result: the physics is stepped to rest, silently', async () => {
		box.roll.mockImplementation(() => new Promise(() => {}));
		box.diceList = [
			{
				body: { sleepState: 0, position: 'p', quaternion: 'q' },
				position: { copy: vi.fn() },
				quaternion: { copy: vi.fn() }
			}
		];
		let finished = 0;
		box.throwFinished.mockImplementation(() => ++finished > 3);
		let animstateDuringStep;
		box.world.step.mockImplementation(() => (animstateDuringStep = box.animstate));

		const rolling = rollDice(7, {});
		expect(skipRoll()).toBe(true);
		const result = await rolling;

		expect(box.world.step).toHaveBeenCalledTimes(3);
		expect(animstateDuringStep).toBe('simulate');
		expect(box.animstate).toBe('throw');
		expect(box.diceList[0].position.copy).toHaveBeenCalledWith('p');
		expect(box.renderer.render).toHaveBeenCalled();
		expect(result.finalValue).toBe(7);
		expect(skipRoll()).toBe(false); // nothing in flight any more
	});

	it('AC-04: under reduced motion there is no 3D throw, only the number for a moment', async () => {
		vi.useFakeTimers();
		reducedMotion = true;
		let resolved = false;
		const rolling = rollDice(14, { isSurreal: true, dice: [14, 18] }).then(() => (resolved = true));

		expect(box.roll).not.toHaveBeenCalled();
		expect(diceState.staticRoll).toEqual({ rolls: [14, 18], kept: 14 });
		await vi.advanceTimersByTimeAsync(STATIC_ROLL_MS - 1);
		expect(resolved).toBe(false);
		await vi.advanceTimersByTimeAsync(1);
		await rolling;
		expect(resolved).toBe(true);
		await vi.advanceTimersByTimeAsync(1); // no hold: the result line follows at once
		expect(diceState.staticRoll).toBeNull();
		expect(diceState.isRolling).toBe(false);
	});

	it('a skip under reduced motion shows the result at once', async () => {
		reducedMotion = true;
		const rolling = rollDice(9, {});
		expect(skipRoll()).toBe(true);
		const result = await rolling;
		expect(result.finalValue).toBe(9);
	});
});
