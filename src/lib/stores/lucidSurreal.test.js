/**
 * Owner decision: any natural 20 makes the player Lucid and any natural 1 makes them
 * Surreal, on every d20 roll (the opening instability roll, Roll for Tasks, the Stability
 * check and Salvation). The modifier applies to, and is used up by, the next roll,
 * whichever roll that is. A new game, or leaving one, starts with neither.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gameState, createPendingUpdates } from './gameStore.svelte.js';
import { initializeGame } from './gameInit.js';
import {
	performInitialDamageRoll,
	applyPendingInitialDamageRoll,
	rollForTasks,
	applyPendingTaskRoll,
	getFailureCheckRoll,
	applyFailureCheckResult,
	applyPendingDiceRoll,
	getSalvationCheckRoll,
	applyPendingSuccessCheck,
	exitGame
} from './gameActions.svelte.js';
import { mockDieRoll, mockDieRollSequence, resetRNG } from '../services/random.js';

vi.mock('./indexedDBStorage.js', () => ({
	saveGame: vi.fn(),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));

const player = { name: 'Tester' };
const deck = ['hearts', 'diamonds', 'clubs', 'spades'].flatMap((suit) =>
	['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((card) => ({
		card,
		suit,
		type: 'event'
	}))
);

/** The four roll paths, each made and applied as the screens do */
const ROLLS = {
	opening() {
		gameState.state = 'initialDamageRoll';
		const thrown = performInitialDamageRoll();
		applyPendingInitialDamageRoll({ advance: false });
		return thrown;
	},
	async tasks() {
		gameState.state = 'rollForTasks';
		const thrown = await rollForTasks();
		applyPendingTaskRoll();
		return thrown;
	},
	stability() {
		gameState.state = 'failureCheck';
		const thrown = getFailureCheckRoll();
		applyFailureCheckResult(thrown.roll);
		applyPendingDiceRoll({ advance: false });
		return thrown;
	},
	salvation() {
		gameState.state = 'successCheck';
		const thrown = getSalvationCheckRoll();
		applyPendingSuccessCheck({ advance: false });
		return thrown;
	}
};

function freshTable() {
	initializeGame({ slug: 'test', deck: [...deck] }, player);
	Object.assign(gameState, {
		tower: 15,
		tokens: 10,
		cardsToDraw: 0,
		acesRevealed: 2,
		aceOfHeartsRevealed: true,
		config: { labels: {} }
	});
}

describe('Lucid and Surreal on every d20 roll', () => {
	beforeEach(freshTable);
	afterEach(() => resetRNG());

	describe.each(Object.keys(ROLLS))('%s roll', (name) => {
		it('a natural 20 makes the player Lucid', async () => {
			mockDieRoll(20);
			await ROLLS[name]();
			expect(gameState.isLucid).toBe(true);
			expect(gameState.isSurreal).toBe(false);
		});

		it('a natural 1 makes the player Surreal', async () => {
			mockDieRoll(1);
			await ROLLS[name]();
			expect(gameState.isSurreal).toBe(true);
			expect(gameState.isLucid).toBe(false);
		});

		it('uses up a Lucid modifier: two dice, the higher kept', async () => {
			gameState.isLucid = true;
			mockDieRollSequence([7, 15]);
			const thrown = await ROLLS[name]();
			expect(thrown.dice).toEqual([7, 15]);
			expect(thrown.roll).toBe(15);
			expect(thrown.wasLucid).toBe(true);
			expect(gameState.isLucid).toBe(false);
		});

		it('uses up a Surreal modifier: two dice, the lower kept', async () => {
			gameState.isSurreal = true;
			mockDieRollSequence([7, 15]);
			const thrown = await ROLLS[name]();
			expect(thrown.dice).toEqual([7, 15]);
			expect(thrown.roll).toBe(7);
			expect(thrown.wasSurreal).toBe(true);
			expect(gameState.isSurreal).toBe(false);
		});

		it('a natural 20 kept from a Surreal roll turns Surreal into Lucid', async () => {
			gameState.isSurreal = true;
			mockDieRollSequence([20, 20]);
			await ROLLS[name]();
			expect(gameState.isLucid).toBe(true);
			expect(gameState.isSurreal).toBe(false);
		});
	});

	it('the modifier carries to the next roll, whichever roll that is', async () => {
		// Opening roll: natural 20 → Lucid, used by Roll for Tasks
		mockDieRoll(20);
		await ROLLS.opening();
		expect(gameState.isLucid).toBe(true);

		mockDieRollSequence([1, 6]); // Lucid keeps 6; no natural 1 kept
		expect((await ROLLS.tasks()).roll).toBe(6);
		expect(gameState.isLucid).toBe(false);
		expect(gameState.isSurreal).toBe(false);

		// Roll for Tasks: natural 1 → Surreal, used by the Stability check
		mockDieRoll(1);
		await ROLLS.tasks();
		expect(gameState.isSurreal).toBe(true);
		mockDieRollSequence([12, 4]);
		expect((await ROLLS.stability()).roll).toBe(4);
		expect(gameState.isSurreal).toBe(false);

		// Stability natural 20 → Lucid, used by Salvation
		mockDieRoll(20);
		await ROLLS.stability();
		mockDieRollSequence([3, 16]);
		const salvation = await ROLLS.salvation();
		expect(salvation.roll).toBe(16);
		expect(salvation.wasLucid).toBe(true);
		expect(gameState.isLucid).toBe(false);
	});

	it('an automatic Salvation (four Aces) throws no die and keeps the modifier for the next roll', async () => {
		gameState.acesRevealed = 4;
		gameState.isLucid = true;
		const thrown = await ROLLS.salvation();
		expect(thrown.automatic).toBe(true);
		expect(thrown.dice).toEqual([]);
		expect(gameState.tokens).toBe(9);
		expect(gameState.isLucid).toBe(true);
	});

	it('a roll that earns nothing leaves no stale pending modifier behind', async () => {
		gameState.pendingUpdates.isLucid = true; // left over from an interrupted roll
		mockDieRoll(12);
		await ROLLS.stability();
		expect(gameState.isLucid).toBe(false);
		expect(gameState.pendingUpdates.isLucid).toBeNull();
	});
});

describe('LS-02: a new game, or leaving one, resets Lucid, Surreal and every pending update', () => {
	afterEach(() => resetRNG());

	function dirty() {
		Object.assign(gameState, {
			isLucid: true,
			isSurreal: true,
			taskRoll: { roll: 17, dice: [17], cards: 5 },
			lastCard: { card: '7', suit: 'spades' },
			pendingUpdates: {
				...createPendingUpdates(),
				diceRoll: 4,
				towerDamage: 2,
				towerGain: 1,
				tokenChange: -1,
				aceChange: 1,
				kingsChange: 1,
				kingsSuit: 'hearts',
				gameOverCondition: { type: 'kingsRevealed' },
				isLucid: true,
				isSurreal: true
			}
		});
	}

	it('initializeGame starts clean', () => {
		dirty();
		initializeGame({ slug: 'test', deck: [...deck] }, player);
		expect(gameState.isLucid).toBe(false);
		expect(gameState.isSurreal).toBe(false);
		expect(gameState.taskRoll).toBeNull();
		expect(gameState.lastCard).toBeNull();
		expect(gameState.pendingUpdates).toEqual(createPendingUpdates());
	});

	it('the opening roll of a new game throws one die', async () => {
		dirty();
		initializeGame({ slug: 'test', deck: [...deck] }, player);
		mockDieRoll(15);
		const thrown = await ROLLS.opening();
		expect(thrown.dice).toEqual([15]);
		expect(thrown.wasLucid).toBe(false);
	});

	it('exitGame resets the run and drops the config, so the next game initializes afresh', async () => {
		initializeGame({ slug: 'test', deck: [...deck] }, player);
		dirty();
		gameState.acesRevealed = 3;
		gameState.kingOfHearts = true;
		await exitGame();
		expect(gameState.state).toBe('exitGame');
		expect(gameState.isLucid).toBe(false);
		expect(gameState.isSurreal).toBe(false);
		expect(gameState.acesRevealed).toBe(0);
		expect(gameState.kingOfHearts).toBe(false);
		expect(gameState.pendingUpdates).toEqual(createPendingUpdates());
		expect(gameState.config).toBeNull();
		expect(gameState.originalConfig).not.toBeNull();
	});
});
