/**
 * Unit tests for pending state system
 * Tests the deferred state update pattern used to ensure visual consistency
 * with animations (dice rolls, card reveals, etc.)
 *
 * CRITICAL ISSUE #3: Add tests for pending state system
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gameState, transitionTo } from './gameStore.svelte.js';
import {
	applyPendingTaskRoll,
	applyPendingDiceRoll,
	applyPendingSuccessCheck,
	applyPendingInitialDamageRoll,
	applyPendingFinalDamageRoll,
	confirmCard
} from './gameActions.svelte.js';

describe('Pending State System', () => {
	describe('applyPendingTaskRoll', () => {
		beforeEach(() => {
			// Reset relevant state
			gameState.diceRoll = 0;
			gameState.isLucid = false;
			gameState.isSurreal = false;
			gameState.pendingUpdates.diceRoll = null;
			gameState.pendingUpdates.isLucid = null;
			gameState.pendingUpdates.isSurreal = null;
		});

		it('should apply pending dice roll', () => {
			// Setup: Set pending dice roll
			gameState.pendingUpdates.diceRoll = 15;

			// Execute
			applyPendingTaskRoll();

			// Verify: Dice roll should be applied
			expect(gameState.diceRoll).toBe(15);
		});

		it('should clear pending dice roll after applying', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 15;

			// Execute
			applyPendingTaskRoll();

			// Verify: Pending state should be cleared
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
		});

		it('should apply pending Lucid state', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.isLucid = true;

			// Execute
			applyPendingTaskRoll();

			// Verify: Lucid state should be applied
			expect(gameState.isLucid).toBe(true);
		});

		it('should clear pending Lucid state after applying', () => {
			// Setup
			gameState.pendingUpdates.isLucid = true;

			// Execute
			applyPendingTaskRoll();

			// Verify: Pending Lucid state should be cleared
			expect(gameState.pendingUpdates.isLucid).toBe(null);
		});

		it('should apply pending Surreal state', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 1;
			gameState.pendingUpdates.isSurreal = true;

			// Execute
			applyPendingTaskRoll();

			// Verify: Surreal state should be applied
			expect(gameState.isSurreal).toBe(true);
		});

		it('should clear pending Surreal state after applying', () => {
			// Setup
			gameState.pendingUpdates.isSurreal = true;

			// Execute
			applyPendingTaskRoll();

			// Verify: Pending Surreal state should be cleared
			expect(gameState.pendingUpdates.isSurreal).toBe(null);
		});

		it('should handle no pending state gracefully', () => {
			// Setup: No pending state
			const originalRoll = gameState.diceRoll;

			// Execute
			applyPendingTaskRoll();

			// Verify: State should be unchanged
			expect(gameState.diceRoll).toBe(originalRoll);
		});

		it('should apply all pending states in one call', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 18;
			gameState.pendingUpdates.isLucid = true;

			// Execute
			applyPendingTaskRoll();

			// Verify: All pending states should be applied
			expect(gameState.diceRoll).toBe(18);
			expect(gameState.isLucid).toBe(true);
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
			expect(gameState.pendingUpdates.isLucid).toBe(null);
		});
	});

	describe('applyPendingDiceRoll', () => {
		beforeEach(() => {
			// Reset relevant state
			gameState.state = 'failureCheck';
			gameState.tower = 20;
			gameState.diceRoll = 0;
			gameState.cardsToDraw = 3;
			gameState.aceOfHeartsRevealed = false;
			gameState.tokens = 10;
			gameState.gameOver = false;
			gameState.isLucid = false;
			gameState.isSurreal = false;
			gameState.log = [];
			gameState.pendingUpdates.diceRoll = null;
			gameState.pendingUpdates.towerDamage = null;
			gameState.pendingUpdates.towerGain = null;
			gameState.pendingUpdates.isLucid = null;
			gameState.pendingUpdates.isSurreal = null;

			// Add minimal config for game over tests
			gameState.config = {
				labels: {
					failureCheckLoss: 'Stability collapsed completely'
				}
			};
		});

		it('should apply pending dice roll', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Dice roll should be applied
			expect(gameState.diceRoll).toBe(15);
		});

		it('should apply pending tower damage', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 5;
			gameState.pendingUpdates.towerDamage = 2; // Roll 2-5 = 2 damage

			// Execute
			applyPendingDiceRoll();

			// Verify: Tower should be reduced by damage
			expect(gameState.tower).toBe(18); // 20 - 2
		});

		it('should apply pending tower gain', () => {
			// Setup: Natural 20 gives +1 Stability (max 20)
			gameState.tower = 18;
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.towerGain = 1;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Tower should gain stability
			expect(gameState.tower).toBe(19); // 18 + 1
		});

		it('should cap tower gain at 20', () => {
			// Setup: Natural 20 when already at 20
			gameState.tower = 20;
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.towerGain = 1;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Tower should not exceed 20
			expect(gameState.tower).toBe(20);
		});

		it('should clear all pending updates after applying', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 10;
			gameState.pendingUpdates.towerDamage = 1;
			gameState.pendingUpdates.towerGain = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: All pending updates should be cleared
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
			expect(gameState.pendingUpdates.towerDamage).toBe(null);
			expect(gameState.pendingUpdates.towerGain).toBe(null);
		});

		it('should trigger game over when tower reaches 0', () => {
			// Setup: Damage that brings tower to 0
			gameState.tower = 2;
			gameState.pendingUpdates.diceRoll = 2;
			gameState.pendingUpdates.towerDamage = 2;

			// Execute
			applyPendingDiceRoll();

			// Verify: Game over should be triggered
			expect(gameState.tower).toBe(0);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
		});

		it('should apply pending Lucid state', () => {
			// Setup: Natural 20 grants Lucid state
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.towerGain = 1;
			gameState.pendingUpdates.towerDamage = 0;
			gameState.pendingUpdates.isLucid = true;

			// Execute
			applyPendingDiceRoll();

			// Verify: Lucid state should be applied
			expect(gameState.isLucid).toBe(true);
			expect(gameState.pendingUpdates.isLucid).toBe(null);
		});

		it('should apply pending Surreal state', () => {
			// Setup: Natural 1 grants Surreal state
			gameState.pendingUpdates.diceRoll = 1;
			gameState.pendingUpdates.towerDamage = 3;
			gameState.pendingUpdates.isSurreal = true;

			// Execute
			applyPendingDiceRoll();

			// Verify: Surreal state should be applied
			expect(gameState.isSurreal).toBe(true);
			expect(gameState.pendingUpdates.isSurreal).toBe(null);
		});

		it('should transition to drawCard when more cards to draw', () => {
			// Setup
			gameState.cardsToDraw = 2;
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Should transition to drawCard
			expect(gameState.state).toBe('drawCard');
		});

		it('should transition to successCheck when Ace of Hearts revealed and tokens > 0', () => {
			// Setup
			gameState.cardsToDraw = 0;
			gameState.aceOfHeartsRevealed = true;
			gameState.tokens = 5;
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Should transition to successCheck
			expect(gameState.state).toBe('successCheck');
		});

		it('should transition to log when no more cards and no success check', () => {
			// Setup
			gameState.cardsToDraw = 0;
			gameState.aceOfHeartsRevealed = false;
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Should transition to log
			expect(gameState.state).toBe('log');
		});

		it('should handle no pending dice roll gracefully', () => {
			// Setup: No pending dice roll
			const originalTower = gameState.tower;

			// Execute (should log warning but not crash)
			applyPendingDiceRoll();

			// Verify: State should be unchanged
			expect(gameState.tower).toBe(originalTower);
		});

		it('should update log entry with dice roll and damage', () => {
			// Setup: Add a log entry first
			gameState.log = [
				{
					round: 1,
					card: 'A',
					suit: 'hearts',
					diceRoll: null,
					damageDealt: null
				}
			];
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 0;

			// Execute
			applyPendingDiceRoll();

			// Verify: Last log entry should be updated
			const lastLog = gameState.log[gameState.log.length - 1];
			expect(lastLog.diceRoll).toBe(15);
			expect(lastLog.damageDealt).toBe(0);
		});
	});

	describe('applyPendingSuccessCheck', () => {
		beforeEach(() => {
			// Reset relevant state
			gameState.state = 'successCheck';
			gameState.tokens = 10;
			gameState.diceRoll = 0;
			gameState.gameOver = false;
			gameState.win = false;
			gameState.isLucid = false;
			gameState.isSurreal = false;
			gameState.pendingUpdates.diceRoll = null;
			gameState.pendingUpdates.tokenChange = null;
			gameState.pendingUpdates.isLucid = null;
			gameState.pendingUpdates.isSurreal = null;

			// Add minimal config for game over tests
			gameState.config = {
				labels: {
					successCheckWin: 'Victory! Against all odds, you escaped.'
				}
			};
		});

		it('should apply pending dice roll', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 17;
			gameState.pendingUpdates.tokenChange = -1;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Dice roll should be applied
			expect(gameState.diceRoll).toBe(17);
		});

		it('should apply pending token change (success)', () => {
			// Setup: Successful roll removes 1 token
			gameState.pendingUpdates.diceRoll = 17;
			gameState.pendingUpdates.tokenChange = -1;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Token should be removed
			expect(gameState.tokens).toBe(9); // 10 - 1
		});

		it('should apply pending token change (failure)', () => {
			// Setup: Failed roll adds 1 token
			gameState.pendingUpdates.diceRoll = 10;
			gameState.pendingUpdates.tokenChange = 1;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Token should be added
			expect(gameState.tokens).toBe(11); // 10 + 1
		});

		it('should apply pending token change (critical success)', () => {
			// Setup: Natural 20 removes 2 tokens
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.tokenChange = -2;

			// Execute
			applyPendingSuccessCheck();

			// Verify: 2 tokens should be removed
			expect(gameState.tokens).toBe(8); // 10 - 2
		});

		it('should apply pending token change (critical failure)', () => {
			// Setup: Natural 1 adds 2 tokens
			gameState.pendingUpdates.diceRoll = 1;
			gameState.pendingUpdates.tokenChange = 2;

			// Execute
			applyPendingSuccessCheck();

			// Verify: 2 tokens should be added
			expect(gameState.tokens).toBe(12); // 10 + 2
		});

		it('should floor tokens at 0 (cannot go negative)', () => {
			// Setup: Large token removal
			gameState.tokens = 1;
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.tokenChange = -2;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Tokens should be floored at 0
			expect(gameState.tokens).toBe(0); // max(1 - 2, 0) = 0
		});

		it('should trigger victory when tokens reach 0', () => {
			// Setup: Last token removed
			gameState.tokens = 1;
			gameState.pendingUpdates.diceRoll = 17;
			gameState.pendingUpdates.tokenChange = -1;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Victory should be triggered
			expect(gameState.tokens).toBe(0);
			expect(gameState.win).toBe(true);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
		});

		it('should transition to log when tokens > 0', () => {
			// Setup
			gameState.tokens = 5;
			gameState.pendingUpdates.diceRoll = 17;
			gameState.pendingUpdates.tokenChange = -1;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Should transition to log
			expect(gameState.tokens).toBe(4);
			expect(gameState.state).toBe('log');
		});

		it('should apply pending Lucid state', () => {
			// Setup: Natural 20 grants Lucid state
			gameState.pendingUpdates.diceRoll = 20;
			gameState.pendingUpdates.tokenChange = -2;
			gameState.pendingUpdates.isLucid = true;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Lucid state should be applied
			expect(gameState.isLucid).toBe(true);
			expect(gameState.pendingUpdates.isLucid).toBe(null);
		});

		it('should apply pending Surreal state', () => {
			// Setup: Natural 1 grants Surreal state
			gameState.pendingUpdates.diceRoll = 1;
			gameState.pendingUpdates.tokenChange = 2;
			gameState.pendingUpdates.isSurreal = true;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Surreal state should be applied
			expect(gameState.isSurreal).toBe(true);
			expect(gameState.pendingUpdates.isSurreal).toBe(null);
		});

		it('should clear all pending updates after applying', () => {
			// Setup
			gameState.pendingUpdates.diceRoll = 17;
			gameState.pendingUpdates.tokenChange = -1;

			// Execute
			applyPendingSuccessCheck();

			// Verify: All pending updates should be cleared
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
			expect(gameState.pendingUpdates.tokenChange).toBe(null);
		});

		it('should handle no pending state gracefully', () => {
			// Setup: No pending state
			const originalTokens = gameState.tokens;

			// Execute (should log warning but not crash)
			applyPendingSuccessCheck();

			// Verify: State should be unchanged
			expect(gameState.tokens).toBe(originalTokens);
		});

		it('should handle zero token change', () => {
			// Setup: Partial failure (6 to threshold-1) = 0 change
			gameState.pendingUpdates.diceRoll = 12;
			gameState.pendingUpdates.tokenChange = 0;

			// Execute
			applyPendingSuccessCheck();

			// Verify: Tokens should be unchanged
			expect(gameState.tokens).toBe(10);
		});
	});

	describe('confirmCard - Pending Card State', () => {
		beforeEach(() => {
			// Reset relevant state
			gameState.state = 'drawCard';
			gameState.currentCard = null;
			gameState.cardsToDraw = 3;
			gameState.acesRevealed = 0;
			gameState.kingsRevealed = 0;
			gameState.kingOfHearts = false;
			gameState.kingOfDiamonds = false;
			gameState.kingOfClubs = false;
			gameState.kingOfSpades = false;
			gameState.gameOver = false;
			gameState.pendingUpdates.aceChange = null;
			gameState.pendingUpdates.kingsChange = null;
			gameState.pendingUpdates.kingsSuit = null;
			gameState.pendingUpdates.gameOverCondition = null;
		});

		it('should apply pending ace change', () => {
			// Setup: Ace was drawn
			gameState.currentCard = { card: 'A', suit: 'diamonds' };
			gameState.pendingUpdates.aceChange = 1;

			// Execute
			confirmCard();

			// Verify: Aces revealed should increment
			expect(gameState.acesRevealed).toBe(1);
			expect(gameState.pendingUpdates.aceChange).toBe(null);
		});

		it('should apply pending king change', () => {
			// Setup: King of Hearts was drawn
			gameState.currentCard = { card: 'K', suit: 'hearts' };
			gameState.pendingUpdates.kingsChange = 1;
			gameState.pendingUpdates.kingsSuit = 'hearts';

			// Execute
			confirmCard();

			// Verify: Kings revealed should increment and specific king should be tracked
			expect(gameState.kingsRevealed).toBe(1);
			expect(gameState.kingOfHearts).toBe(true);
			expect(gameState.pendingUpdates.kingsChange).toBe(null);
			expect(gameState.pendingUpdates.kingsSuit).toBe(null);
		});

		it('should track multiple kings correctly', () => {
			// Setup: First king
			gameState.currentCard = { card: 'K', suit: 'hearts' };
			gameState.pendingUpdates.kingsChange = 1;
			gameState.pendingUpdates.kingsSuit = 'hearts';

			// Execute first king
			confirmCard();

			// Setup: Second king
			gameState.currentCard = { card: 'K', suit: 'diamonds' };
			gameState.pendingUpdates.kingsChange = 1;
			gameState.pendingUpdates.kingsSuit = 'diamonds';

			// Execute second king
			confirmCard();

			// Verify: Both kings should be tracked
			expect(gameState.kingsRevealed).toBe(2);
			expect(gameState.kingOfHearts).toBe(true);
			expect(gameState.kingOfDiamonds).toBe(true);
		});

		it('should trigger game over when 4 kings revealed', () => {
			// Setup: 4th king pending
			gameState.kingsRevealed = 3;
			gameState.currentCard = { card: 'K', suit: 'spades' };
			gameState.pendingUpdates.gameOverCondition = {
				type: 'kingsRevealed',
				win: false,
				status: 'All four Kings revealed. Game over.'
			};

			// Execute
			confirmCard();

			// Verify: Game over should be triggered
			expect(gameState.gameOver).toBe(true);
			expect(gameState.win).toBe(false);
			expect(gameState.state).toBe('gameOver');
			expect(gameState.pendingUpdates.gameOverCondition).toBe(null);
		});

		it('should transition to failureCheck for odd-ranked cards', () => {
			// Setup: Odd card (7)
			gameState.currentCard = { card: '7', suit: 'hearts' };

			// Execute
			confirmCard();

			// Verify: Should transition to failureCheck
			expect(gameState.state).toBe('failureCheck');
		});

		it('should transition to drawCard when more cards to draw and even card', () => {
			// Setup: Even card with more cards to draw
			gameState.currentCard = { card: '4', suit: 'hearts' };
			gameState.cardsToDraw = 2;

			// Execute
			confirmCard();

			// Verify: Should transition to drawCard
			expect(gameState.state).toBe('drawCard');
		});

		it('should transition to successCheck when Ace of Hearts revealed and tokens > 0', () => {
			// Setup: Last card, Ace of Hearts revealed
			gameState.currentCard = { card: '4', suit: 'hearts' };
			gameState.cardsToDraw = 0;
			gameState.aceOfHeartsRevealed = true;
			gameState.tokens = 5;

			// Execute
			confirmCard();

			// Verify: Should transition to successCheck
			expect(gameState.state).toBe('successCheck');
		});

		it('should transition to log when no more cards and no success check available', () => {
			// Setup: Last card, no Ace of Hearts
			gameState.currentCard = { card: '4', suit: 'hearts' };
			gameState.cardsToDraw = 0;
			gameState.aceOfHeartsRevealed = false;

			// Execute
			confirmCard();

			// Verify: Should transition to log
			expect(gameState.state).toBe('log');
		});

		it('should clear current card after confirming', () => {
			// Setup
			gameState.currentCard = { card: '4', suit: 'hearts' };

			// Execute
			confirmCard();

			// Verify: Current card should be cleared
			expect(gameState.currentCard).toBe(null);
		});
	});

	describe('Pending State Integration', () => {
		beforeEach(() => {
			// Reset state for integration tests
			gameState.state = 'failureCheck';
			gameState.tower = 20;
			gameState.tokens = 10;
			gameState.diceRoll = 0;
			gameState.cardsToDraw = 1; // Set to 1 to enable drawCard transitions
			gameState.aceOfHeartsRevealed = false;
			gameState.isLucid = false;
			gameState.isSurreal = false;
			gameState.log = [];

			// Clear all pending updates
			gameState.pendingUpdates.diceRoll = null;
			gameState.pendingUpdates.towerDamage = null;
			gameState.pendingUpdates.towerGain = null;
			gameState.pendingUpdates.tokenChange = null;
			gameState.pendingUpdates.isLucid = null;
			gameState.pendingUpdates.isSurreal = null;

			// Add minimal config
			gameState.config = {
				labels: {
					failureCheckLoss: 'Stability collapsed completely'
				}
			};
		});

		it('should maintain pending state across multiple operations', () => {
			// Setup: Multiple pending updates
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 1;
			gameState.pendingUpdates.isLucid = true;

			// Execute: Apply dice roll
			applyPendingDiceRoll();

			// Verify: All pending state should be applied and cleared
			expect(gameState.diceRoll).toBe(15);
			expect(gameState.tower).toBe(19); // 20 - 1
			expect(gameState.isLucid).toBe(true);
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
			expect(gameState.pendingUpdates.towerDamage).toBe(null);
			expect(gameState.pendingUpdates.isLucid).toBe(null);
		});

		it('should isolate pending state between different types', () => {
			// Setup: Pending task roll
			gameState.pendingUpdates.diceRoll = 10;

			// Execute: Apply task roll
			applyPendingTaskRoll();

			// Verify: Only task roll state should be affected
			expect(gameState.diceRoll).toBe(10);

			// Setup: Pending success check (different state)
			gameState.state = 'successCheck'; // Ensure we're in correct state
			gameState.pendingUpdates.diceRoll = 17;
			gameState.pendingUpdates.tokenChange = -1;

			// Execute: Apply success check
			applyPendingSuccessCheck();

			// Verify: Success check state should be applied
			expect(gameState.diceRoll).toBe(17);
			expect(gameState.tokens).toBe(9);
		});

		it('should handle rapid pending state changes', () => {
			// Setup: Set pending state with cardsToDraw > 0 to enable drawCard transitions
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 2; // Keep it > 0 for both calls
			gameState.pendingUpdates.diceRoll = 15;
			gameState.pendingUpdates.towerDamage = 2;

			// Execute: Apply first time
			applyPendingDiceRoll();

			// Verify: State applied and cleared, transitioned to drawCard
			expect(gameState.tower).toBe(18);
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
			expect(gameState.state).toBe('drawCard');

			// Setup: New pending state - reset to failureCheck and keep cardsToDraw > 0
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 1; // Still > 0
			gameState.pendingUpdates.diceRoll = 10;
			gameState.pendingUpdates.towerDamage = 1;

			// Execute: Apply second time
			applyPendingDiceRoll();

			// Verify: New state applied correctly
			expect(gameState.tower).toBe(17); // 18 - 1
			expect(gameState.pendingUpdates.diceRoll).toBe(null);
			expect(gameState.state).toBe('drawCard');
		});
	});
});
