/**
 * The check composables roll once, publish a result line and wait; a second press continues.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState } from '../../stores/gameStore.svelte.js';
import { mockDieRoll, resetRNG } from '../../services/random.js';
import { useFailureCheck } from './useFailureCheck.svelte.js';
import { useSuccessCheck } from './useSuccessCheck.svelte.js';
import { useRollForTasks } from './useRollForTasks.svelte.js';

vi.mock('../../stores/diceStore.svelte.js', () => ({ rollDice: vi.fn(async () => {}) }));
vi.mock('../../stores/indexedDBStorage.js', () => ({
	saveGame: vi.fn(),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));

beforeEach(() => {
	resetRNG();
	for (const key of Object.keys(gameState.pendingUpdates)) gameState.pendingUpdates[key] = null;
	Object.assign(gameState, {
		tower: 20,
		tokens: 10,
		cardsToDraw: 2,
		acesRevealed: 2,
		aceOfHeartsRevealed: true,
		isLucid: false,
		isSurreal: false,
		gameOver: false,
		config: { labels: {} },
		log: []
	});
});

describe('useFailureCheck', () => {
	it('applies and explains the roll, then continues on the second press', async () => {
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		mockDieRoll(4);

		await check.handleFailureCheck();
		expect(gameState.tower).toBe(18);
		expect(gameState.state).toBe('failureCheck');
		expect(check.resultLine).toBe('Rolled 4 · −2 Stability · 18/20');
		expect(check.buttonText).toBe('Continue');
		expect(check.rolling).toBe(false);

		await check.handleFailureCheck();
		expect(gameState.state).toBe('drawCard');
	});

	it('clears the result line on reset', async () => {
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		mockDieRoll(12);
		await check.handleFailureCheck();
		check.resetState();
		expect(check.resultLine).toBe('');
	});
});

describe('useSuccessCheck', () => {
	it('shows the target before rolling and the outcome after', async () => {
		gameState.state = 'successCheck';
		const check = useSuccessCheck();
		expect(check.buttonText).toBe('Roll to remove a token · need 14+');
		mockDieRoll(2);

		await check.handleSuccessCheck();
		expect(gameState.tokens).toBe(11);
		expect(gameState.state).toBe('successCheck');
		expect(check.resultLine).toBe('Rolled 2 · needed 14+ · +1 token · 11 left');
		expect(check.buttonText).toBe('Continue');

		await check.handleSuccessCheck();
		expect(gameState.state).toBe('log');
	});
});

describe('useRollForTasks', () => {
	it('publishes the cards to draw', async () => {
		gameState.state = 'rollForTasks';
		const tasks = useRollForTasks();
		mockDieRoll(17);

		await tasks.handleRollForTasks();
		expect(tasks.resultLine).toBe('Rolled 17 · Draw 5 cards');
		expect(gameState.state).toBe('rollForTasks');
	});
});
