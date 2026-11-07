/**
 * rollDice: which dice were thrown (LS-03), resolving once the dice are at rest (LS-05),
 * skipping to the result (LS-05), reduced motion (AC-04), and the staging: landed dice stay
 * on top for one beat, then sink beneath the board in the moment the roll resolves.
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
	renderer = { render: vi.fn(), domElement: { width: 0, height: 0 } };
	setDimensions = vi.fn();
	// A 393 x 851 phone, in dice-box's terms (world units are half CSS px)
	display = {
		currentWidth: 196.5,
		currentHeight: 425.5,
		containerWidth: 393,
		containerHeight: 851
	};
	strength = 1.5;
	baseScale = 100;
	/** As dice-box's own: each die starts 0.9 of the half-size out, at the edge opposite the target */
	getNotationVectors = vi.fn((notation, target) => ({
		vectors: [
			{
				pos: {
					x: this.display.containerWidth * (target.x > 0 ? -0.9 : 0.9),
					y: this.display.containerHeight * (target.y > 0 ? -0.9 : 0.9),
					z: 300
				},
				velocity: { x: 500, y: -500, z: -10 },
				axis: { x: 0.9, y: 0.9, z: 0.9, a: 0.5 }
			}
		]
	}));
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
	diceScreenCentre,
	reportShortThrow,
	SETTLE_HOLD_MS,
	DICE_HOLD_MS,
	STATIC_ROLL_MS,
	SPAWN_MARGIN,
	MIN_THROW
} = await import('./diceStore.svelte.js');
const { ANIMATION_DURATION } = await import('../constants/animations.js');

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
	diceState.sinkOrigin = null;

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

describe('dice canvas size', () => {
	function setContainerSize(width, height) {
		const container = document.getElementById('dice-roller-container');
		Object.defineProperty(container, 'clientWidth', { value: width, configurable: true });
		Object.defineProperty(container, 'clientHeight', { value: height, configurable: true });
	}

	it('resizes a canvas stuck at the wrong size to its container before the throw', async () => {
		// Measured while the container was small: the browser's 300x150 canvas default
		box.renderer.domElement = { width: 300, height: 150 };
		setContainerSize(1280, 800);
		const order = [];
		box.setDimensions.mockImplementation(() => order.push('size'));
		box.roll.mockImplementation(async () => {
			order.push('roll');
			return realResult;
		});

		await rollDice(19, { isLucid: true });

		expect(box.setDimensions).toHaveBeenCalledWith({ x: 1280, y: 800 });
		expect(order).toEqual(['size', 'roll']);
	});

	it('resizes when the canvas fits but the dice world is still the old size', async () => {
		box.renderer.domElement = { width: 1280, height: 800 };
		box.display = { containerWidth: 300, containerHeight: 150 };
		setContainerSize(1280, 800);

		await rollDice(12);

		expect(box.setDimensions).toHaveBeenCalledWith({ x: 1280, y: 800 });
	});

	it('leaves dice that already fit alone', async () => {
		box.renderer.domElement = { width: 1280, height: 800 };
		box.display = { containerWidth: 1280, containerHeight: 800 };
		setContainerSize(1280, 800);

		await rollDice(12);

		expect(box.setDimensions).not.toHaveBeenCalled();
	});
});

describe('the throw', () => {
	const phone = {
		currentWidth: 196.5,
		currentHeight: 425.5,
		containerWidth: 393,
		containerHeight: 851
	};

	it('initializeDiceBox takes over the throw: every die starts clear of the walls, thrown from far enough', () => {
		box.display = { ...phone };
		expect(typeof box.startClickThrow).toBe('function');
		const vectors = box.startClickThrow('1d20@10');
		const [notation, target, magnitude, distance] = box.getNotationVectors.mock.calls.at(-1);
		expect(notation).toBe('1d20@10');
		expect(Math.hypot(target.x, target.y)).toBeGreaterThanOrEqual(MIN_THROW * 196.5 - 1e-9);
		expect(distance).toBeCloseTo(Math.hypot(target.x, target.y) + 100);
		expect(magnitude).toBeGreaterThan(0);
		// dice-box's 0.9 start would be inside its 0.93 wall by most of the die's radius (100)
		const [die] = vectors.vectors;
		expect(Math.abs(die.pos.x)).toBeLessThanOrEqual(0.93 * 393 - 100 - SPAWN_MARGIN);
		expect(Math.abs(die.pos.y)).toBeLessThanOrEqual(0.93 * 851 - 100 - SPAWN_MARGIN);
		expect(die.pos.z).toBe(300);
		// dice-box's spin axis (random each way) is made a unit vector, so the die's first
		// physics step sees it at its own size
		expect(Math.hypot(die.axis.x, die.axis.y, die.axis.z)).toBeCloseTo(1);
		expect(die.axis.a).toBe(0.5);
	});

	it('logs a throw whose dice stayed in one corner, with the throw that did it', async () => {
		box.display = { ...phone };
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		box.roll.mockImplementation(() => {
			box.startClickThrow('1d20@10'); // as dice-box's roll() does
			return new Promise(() => {});
		});
		// A die resting where it started, in the top-left corner
		box.diceList = [{ body: { sleepState: 1, position: { x: -280, y: 740 } } }];

		await rollDice(10, {});

		const line = warn.mock.calls.map((c) => c.join(' ')).find((t) => t.includes('Short throw'));
		expect(line).toContain('0% x 0% of the table');
		expect(line).toContain('"starts"');
		warn.mockRestore();
	});

	it('says nothing about a throw that crossed the table', async () => {
		box.display = { ...phone };
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		box.roll.mockImplementation(() => new Promise(() => {}));
		let x = -300;
		box.diceList = [
			{
				body: {
					sleepState: 1,
					position: {
						get x() {
							return (x += 300);
						},
						y: 0
					}
				}
			}
		];

		await rollDice(10, {});

		expect(warn.mock.calls.map((c) => c.join(' ')).some((t) => t.includes('Short throw'))).toBe(
			false
		);
		warn.mockRestore();
	});

	it('reportShortThrow measures the path against the table', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		reportShortThrow({ display: phone }, { minX: -300, maxX: -250, minY: 600, maxY: 700 });
		expect(warn.mock.calls.at(-1).join(' ')).toContain('6% x 6% of the table');
		warn.mockClear();
		reportShortThrow({ display: phone }, { minX: -300, maxX: 100, minY: 600, maxY: 700 });
		expect(warn).not.toHaveBeenCalled();
		reportShortThrow({ display: phone }, { minX: Infinity }); // nothing tracked
		reportShortThrow(null, { minX: 0, maxX: 0, minY: 0, maxY: 0 });
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
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

describe('the dice staging: on top, then sinking as the result appears', () => {
	it('rests the landed dice for one beat in all', () => {
		expect(SETTLE_HOLD_MS + DICE_HOLD_MS).toBe(ANIMATION_DURATION.BEAT);
	});

	it('keeps the landed dice up for the hold, then sinks them in the moment the roll resolves', async () => {
		vi.useFakeTimers();
		let resolved = false;
		const rolling = rollDice(11, {}).then((r) => {
			resolved = true;
			return r;
		});
		expect(diceState.isRolling).toBe(true);
		await vi.advanceTimersByTimeAsync(0); // the throw lands (the fake dice-box resolves at once)
		await vi.advanceTimersByTimeAsync(DICE_HOLD_MS - 1);
		expect(resolved).toBe(false);
		expect(diceState.isRolling).toBe(true); // still on top
		await vi.advanceTimersByTimeAsync(1);
		const result = await rolling;
		expect(result.finalValue).toBe(11);
		// The sink (isRolling false) and the result are the same moment: nothing waits after it
		expect(diceState.isRolling).toBe(false);
	});

	it('a tap while the landed dice are held sinks them at once', async () => {
		vi.useFakeTimers();
		let resolved = false;
		const rolling = rollDice(6, {}).then(() => (resolved = true));
		await vi.advanceTimersByTimeAsync(0);
		expect(resolved).toBe(false);
		expect(skipRoll()).toBe(true);
		await rolling;
		expect(resolved).toBe(true);
		expect(diceState.isRolling).toBe(false);
		expect(skipRoll()).toBe(false);
	});

	it('a finished roll never sinks the dice of a roll thrown after it', async () => {
		vi.useFakeTimers();
		const half = Math.round(DICE_HOLD_MS / 2);
		const first = rollDice(3, {});
		await vi.advanceTimersByTimeAsync(half);
		const second = rollDice(15, {}); // thrown while the first is still held
		await vi.advanceTimersByTimeAsync(DICE_HOLD_MS - half);
		await first;
		expect(diceState.isRolling).toBe(true); // the second roll's dice stay up
		expect(skipRoll()).toBe(true); // and a tap still reaches them
		await second;
		expect(diceState.isRolling).toBe(false);
		expect(diceState.lastRoll.finalValue).toBe(15);
	});

	it('finds where the dice landed on screen, so they shrink in place', () => {
		// dice-box projects world positions through its camera to -1..1 on each axis
		const at = (x, y) => ({ clone: () => ({ project: () => ({ x, y }) }) });
		const box = {
			camera: {},
			renderer: { domElement: { clientWidth: 400, clientHeight: 800 } },
			diceList: [{ position: at(0, 0) }, { position: at(0.5, -0.5) }]
		};
		// (200, 400) and (300, 600): the middle is (250, 500)
		expect(diceScreenCentre(box)).toBe('250px 500px');
		expect(diceScreenCentre({ ...box, diceList: [] })).toBeNull();
		expect(diceScreenCentre(null)).toBeNull();
	});
});
