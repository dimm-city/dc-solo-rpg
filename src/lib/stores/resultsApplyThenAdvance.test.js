/**
 * A check's result is applied after the dice animation (so the HUD updates), and the game
 * moves on separately: when the result hold runs out, or at once on a press (see the step
 * composables). An ending reached this way is shown first, then the ending screen.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import {
	applyPendingDiceRoll,
	applyPendingSuccessCheck,
	applyPendingInitialDamageRoll,
	advanceAfterFailureCheck,
	advanceAfterSuccessCheck,
	advanceAfterInitialDamage
} from './gameActions.svelte.js';

vi.mock('./indexedDBStorage.js', () => ({
	saveGame: vi.fn(),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));

function resetPending() {
	for (const key of Object.keys(gameState.pendingUpdates)) gameState.pendingUpdates[key] = null;
}

describe('Stability check', () => {
	beforeEach(() => {
		resetPending();
		gameState.state = 'failureCheck';
		gameState.tower = 20;
		gameState.cardsToDraw = 2;
		gameState.gameOver = false;
		gameState.config = { labels: {} };
		gameState.pendingUpdates.diceRoll = 4;
		gameState.pendingUpdates.towerDamage = 2;
	});

	it('applies the result but stays on the screen', () => {
		applyPendingDiceRoll({ advance: false });
		expect(gameState.tower).toBe(18);
		expect(gameState.state).toBe('failureCheck');
	});

	it('moves to the next card only when advanced', () => {
		applyPendingDiceRoll({ advance: false });
		advanceAfterFailureCheck();
		expect(gameState.state).toBe('drawCard');
	});

	it('goes to Salvation after the last card when the Ace of Hearts is out', () => {
		gameState.cardsToDraw = 0;
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 5;
		applyPendingDiceRoll({ advance: false });
		advanceAfterFailureCheck();
		expect(gameState.state).toBe('successCheck');
	});

	it('shows 0 Stability first and ends the game only when advanced', () => {
		gameState.tower = 2;
		applyPendingDiceRoll({ advance: false });
		expect(gameState.tower).toBe(0);
		expect(gameState.state).toBe('failureCheck');
		advanceAfterFailureCheck();
		expect(gameState.state).toBe('gameOver');
	});
});

describe('Salvation check', () => {
	beforeEach(() => {
		resetPending();
		gameState.state = 'successCheck';
		gameState.tokens = 10;
		gameState.gameOver = false;
		gameState.win = false;
		gameState.config = { labels: {} };
		gameState.pendingUpdates.diceRoll = 18;
		gameState.pendingUpdates.tokenChange = -1;
	});

	it('removes the token but waits on the screen', () => {
		applyPendingSuccessCheck({ advance: false });
		expect(gameState.tokens).toBe(9);
		expect(gameState.state).toBe('successCheck');
		advanceAfterSuccessCheck();
		expect(gameState.state).toBe('log');
	});

	it('shows the last token gone first, then the ending when advanced', () => {
		gameState.tokens = 1;
		applyPendingSuccessCheck({ advance: false });
		expect(gameState.tokens).toBe(0);
		expect(gameState.state).toBe('successCheck');
		advanceAfterSuccessCheck();
		expect(gameState.state).toBe('gameOver');
		expect(gameState.win).toBe(true);
	});
});

describe('Initial instability roll', () => {
	it('applies the loss, then starts round 1 when advanced', () => {
		resetPending();
		gameState.state = 'initialDamageRoll';
		gameState.tower = 20;
		gameState.log = [];
		gameState.pendingUpdates.diceRoll = 4;
		gameState.pendingUpdates.towerDamage = 2;

		applyPendingInitialDamageRoll({ advance: false });
		expect(gameState.tower).toBe(18);
		expect(gameState.state).toBe('initialDamageRoll');
		advanceAfterInitialDamage();
		// Round 1 opens straight on Roll for Tasks
		expect(gameState.state).toBe('rollForTasks');
	});
});
