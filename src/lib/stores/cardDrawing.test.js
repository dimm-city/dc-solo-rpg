import { test, describe, expect, vi, beforeEach } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import {
	drawCard,
	confirmCard,
	getFailureCheckRoll,
	applyFailureCheckResult,
	applyPendingDiceRoll,
	confirmFailureCheck,
	rollForTasks,
	successCheck,
	applyPendingSuccessCheck
} from './gameActions.svelte.js';

/**
 * Test suite for card drawing and failure check flow
 *
 * This test suite specifically addresses the bug where:
 * 1. Cards were not shown before failure checks
 * 2. Card information was missing from journal summaries
 *
 * The fix ensures that when a card is drawn:
 * - The card is set in gameState.currentCard
 * - The state remains 'drawCard' to allow the UI to display the card
 * - Only after confirmCard() is called does the state transition occur
 * - For odd cards, the transition goes to 'failureCheck' with card still available
 */

describe('Card Drawing and Failure Check Flow', () => {
	beforeEach(() => {
		// Reset gameState to known values
		gameState.state = 'drawCard';
		gameState.currentCard = null;
		gameState.cardsToDraw = 3;
		gameState.deck = [
			{ card: '5', suit: 'hearts', description: 'Test odd card' },
			{ card: '4', suit: 'clubs', description: 'Test even card' },
			{ card: 'K', suit: 'spades', description: 'Test king card' }
		];
		gameState.log = [];
		gameState.round = 1;
		gameState.tower = 20; // D20 system: starts at 20 stability
		gameState.bonus = 0;
		gameState.kingsRevealed = 0;
		gameState.gameOver = false;
	});

	describe('drawCard()', () => {
		test('should set currentCard and NOT change state', async () => {
			const initialState = gameState.state;

			await drawCard();

			// Card should be set
			expect(gameState.currentCard).toBeDefined();
			expect(gameState.currentCard).not.toBeNull();

			// State should remain 'drawCard' to allow UI to show the card
			expect(gameState.state).toBe(initialState);
		});

		test('should add card to log with round information', async () => {
			const initialLogLength = gameState.log.length;

			await drawCard();

			expect(gameState.log.length).toBe(initialLogLength + 1);

			const loggedCard = gameState.log[gameState.log.length - 1];
			expect(loggedCard.round).toBe(gameState.round);
			expect(loggedCard.id).toBeDefined();
			expect(loggedCard.id).toMatch(/^\d+\.\d+$/); // Format: round.cardNumber
		});

		test('should decrement cardsToDraw counter', async () => {
			const initialCardsToDraw = gameState.cardsToDraw;

			await drawCard();

			expect(gameState.cardsToDraw).toBe(initialCardsToDraw - 1);
		});

		test('should track king cards correctly', async () => {
			// Set up deck with a king
			gameState.deck = [{ card: 'K', suit: 'hearts', description: 'King test' }];
			gameState.kingsRevealed = 0;

			await drawCard();

			// Kings are now tracked in pending state until confirmed
			expect(gameState.pendingUpdates.kingsChange).toBe(1);
			expect(gameState.pendingUpdates.kingsSuit).toBe('hearts');

			// Confirm the card to apply pending updates
			await confirmCard();

			// Now the actual state should be updated
			expect(gameState.kingsRevealed).toBe(1);
			expect(gameState.kingOfHearts).toBe(true);
		});
	});

	describe('confirmCard() - Odd Cards (Failure Check)', () => {
		test('should transition to failureCheck for odd cards', async () => {
			// Draw an odd card (5)
			gameState.deck = [{ card: '5', suit: 'hearts', description: 'Odd card' }];
			gameState.cardsToDraw = 1;

			await drawCard();

			// Verify card is available before confirmation
			expect(gameState.currentCard).toBeDefined();
			expect(gameState.currentCard.card).toBe('5');

			// Confirm the card
			await confirmCard();

			// Should transition to failureCheck
			expect(gameState.state).toBe('failureCheck');

			// Card should be cleared after confirmation
			expect(gameState.currentCard).toBeNull();
		});

		test('should preserve card in log for journal display', async () => {
			// Draw an odd card
			gameState.deck = [{ card: '3', suit: 'clubs', description: 'Odd card for journal test' }];
			gameState.cardsToDraw = 1;

			await drawCard();
			await confirmCard();

			// Card should be in the log
			const loggedCard = gameState.log[gameState.log.length - 1];
			expect(loggedCard).toBeDefined();
			expect(loggedCard.card).toBe('3');
			expect(loggedCard.suit).toBe('clubs');
			expect(loggedCard.description).toBe('Odd card for journal test');
			expect(loggedCard.round).toBe(gameState.round);
		});
	});

	describe('confirmCard() - Even Cards', () => {
		test('should transition to drawCard if more cards remain', async () => {
			// Draw an even card with more cards to draw
			// Note: Array.pop() removes from END of array
			gameState.deck = [
				{ card: '4', suit: 'clubs', description: 'Next card' },
				{ card: '2', suit: 'hearts', description: 'Even card' }
			];
			gameState.cardsToDraw = 2;

			await drawCard();
			expect(gameState.currentCard.card).toBe('2');

			await confirmCard();

			// Should stay in drawCard state
			expect(gameState.state).toBe('drawCard');
			expect(gameState.cardsToDraw).toBe(1);
		});

		test('should transition to log when no cards remain', async () => {
			// Draw last card (even)
			gameState.deck = [{ card: '4', suit: 'diamonds', description: 'Last card' }];
			gameState.cardsToDraw = 1;

			await drawCard();
			await confirmCard();

			// Should transition to log screen
			expect(gameState.state).toBe('log');
			expect(gameState.cardsToDraw).toBe(0);
		});
	});

	describe('Failure Check Flow', () => {
		test('should display card info during failure check', async () => {
			// Simulate the full flow: draw odd card, confirm, check state
			gameState.deck = [{ card: '7', suit: 'spades', description: 'Failure check card' }];
			gameState.cardsToDraw = 1;

			// Draw the card
			await drawCard();

			// At this point, FailureCheck component should be able to display:
			// - gameState.currentCard.description
			// - gameState.currentCard.card
			// - gameState.currentCard.suit

			// Verify card is still available
			expect(gameState.currentCard).toBeDefined();
			expect(gameState.currentCard.card).toBe('7');

			// User confirms card (simulating clicking CONTINUE)
			await confirmCard();

			// Now we're in failureCheck state
			expect(gameState.state).toBe('failureCheck');

			// The card info should be in the log for the FailureCheck component to reference
			const loggedCard = gameState.log[gameState.log.length - 1];
			expect(loggedCard.card).toBe('7');
			expect(loggedCard.description).toBe('Failure check card');
		});

		test('should apply damage after failure check roll', () => {
			// Setup: Card already in log from previous draw
			gameState.log = [
				{
					card: '5',
					suit: 'hearts',
					description: 'Test card',
					round: 1,
					id: '1.1'
				}
			];
			gameState.tower = 20; // D20 system: starts at 20
			gameState.bonus = 0;

			// Roll a 3 (D20 system: roll 3 in range 2-5 → -2 stability)
			const rollResult = 3;
			applyFailureCheckResult(rollResult);

			// Damage should be stored in pending state, not applied yet
			expect(gameState.pendingUpdates.diceRoll).toBe(3);
			expect(gameState.pendingUpdates.towerDamage).toBe(2); // D20 system: roll 2-5 → -2 stability
			expect(gameState.tower).toBe(20); // Tower not updated yet

			// Now apply the pending updates
			applyPendingDiceRoll();

			// Stability should now be reduced
			expect(gameState.tower).toBe(18); // 20 - 2

			// Log should be updated with dice roll
			expect(gameState.log[0].diceRoll).toBe(3);
		});

		test('should transition correctly after failure check', () => {
			gameState.state = 'failureCheck';
			gameState.log = [{ card: '5', suit: 'hearts', description: 'Test', round: 1, id: '1.1' }];
			gameState.tower = 20; // D20 system: starts at 20 stability
			gameState.bonus = 0;
			gameState.cardsToDraw = 2; // More cards to draw

			// Apply failure check with roll of 2 (stores in pending state)
			applyFailureCheckResult(2);

			// Now apply the pending updates
			applyPendingDiceRoll();

			// Should transition back to drawCard since more cards remain
			expect(gameState.state).toBe('drawCard');
			expect(gameState.cardsToDraw).toBe(2);
		});

		test('should transition to log after failure check if no cards remain', () => {
			gameState.state = 'failureCheck';
			gameState.log = [{ card: '5', suit: 'hearts', description: 'Test', round: 1, id: '1.1' }];
			gameState.tower = 20; // D20 system: starts at 20 stability
			gameState.bonus = 0;
			gameState.cardsToDraw = 0; // No more cards

			// Apply failure check (stores in pending state)
			applyFailureCheckResult(2);

			// Now apply the pending updates
			applyPendingDiceRoll();

			// Should transition to log screen
			expect(gameState.state).toBe('log');
		});
	});

	describe('Regression Prevention - Timing Issues', () => {
		test('card should be available in currentCard when transitioning to failureCheck', async () => {
			// This test specifically prevents the regression where cards
			// were not displayed before failure checks

			gameState.deck = [{ card: '9', suit: 'diamonds', description: 'Timing test card' }];
			gameState.cardsToDraw = 1;

			// Draw card
			await drawCard();

			// CRITICAL: At this point, before confirmCard() is called,
			// the card MUST be available in gameState.currentCard
			// This allows the CardDeck component to display it
			expect(gameState.currentCard).toBeDefined();
			expect(gameState.currentCard.card).toBe('9');
			expect(gameState.state).toBe('drawCard'); // Still in drawCard state

			// Now user clicks CONTINUE
			await confirmCard();

			// State changes to failureCheck
			expect(gameState.state).toBe('failureCheck');
		});

		test('journal should contain all cards including those with failure checks', async () => {
			// This test prevents regression where failure check cards
			// were missing from journal summaries

			// Array.pop() removes from END, so reverse order
			gameState.deck = [
				{ card: '7', suit: 'spades', description: 'Odd card 2' },
				{ card: '4', suit: 'clubs', description: 'Even card' },
				{ card: '5', suit: 'hearts', description: 'Odd card 1' }
			];
			gameState.cardsToDraw = 3;
			gameState.log = [];

			// Draw and confirm first card (odd - failure check)
			await drawCard();
			expect(gameState.currentCard.card).toBe('5');
			await confirmCard();
			expect(gameState.state).toBe('failureCheck');

			// Simulate failure check completion
			gameState.state = 'drawCard'; // Reset for next card

			// Draw and confirm second card (even)
			await drawCard();
			expect(gameState.currentCard.card).toBe('4');
			await confirmCard();

			// Draw and confirm third card (odd - failure check)
			await drawCard();
			expect(gameState.currentCard.card).toBe('7');
			await confirmCard();

			// All three cards should be in the log
			expect(gameState.log.length).toBe(3);
			expect(gameState.log[0].card).toBe('5');
			expect(gameState.log[1].card).toBe('4');
			expect(gameState.log[2].card).toBe('7');

			// All cards should have round information
			expect(gameState.log[0].round).toBe(1);
			expect(gameState.log[1].round).toBe(1);
			expect(gameState.log[2].round).toBe(1);
		});
	});

	describe('Edge Cases', () => {
		test('should handle Ace cards correctly (treated as odd per SRD)', async () => {
			gameState.deck = [{ card: 'A', suit: 'hearts', description: 'Ace of Hearts' }];
			gameState.cardsToDraw = 1;
			gameState.aceOfHeartsRevealed = false;

			await drawCard();

			// Ace should set the aceOfHeartsRevealed flag
			expect(gameState.aceOfHeartsRevealed).toBe(true);

			await confirmCard();

			// Per Wretched & Alone SRD: Aces are odd-ranked and trigger failure check
			expect(gameState.state).toBe('failureCheck');
		});

		test('should handle multiple kings triggering game over', async () => {
			// Setup config to avoid null reference
			gameState.config = {
				labels: {
					failureCounterLoss: 'All kings revealed - game over'
				}
			};

			gameState.deck = [{ card: 'K', suit: 'hearts', description: 'Fourth King' }];
			gameState.kingsRevealed = 3; // Already have 3 kings
			gameState.cardsToDraw = 1;

			await drawCard();

			// Should trigger game over
			expect(gameState.kingsRevealed).toBe(4);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
		});
	});

	describe('rollForTasks() - D20 Card Draw System', () => {
		beforeEach(() => {
			gameState.isLucid = false;
			gameState.isSurreal = false;
			gameState.cardsToDraw = 0;
			gameState.pendingUpdates.diceRoll = null;
		});

		test('should roll d20 and convert to card count', async () => {
			// Mock rollWithModifiers to return a specific value
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 15, wasLucid: false, wasSurreal: false }));

			const roll = await rollForTasks();

			// Should return the d20 roll
			expect(roll).toBe(15);

			// Should convert to 4 cards (15 is in range 11-15)
			expect(gameState.cardsToDraw).toBe(4);

			// Should store roll in pending updates
			expect(gameState.pendingUpdates.diceRoll).toBe(15);

			// Restore original function
			gameState.rollWithModifiers = originalRoll;
		});

		test('should set Lucid state on natural 20', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 20, wasLucid: false, wasSurreal: false }));

			await rollForTasks();

			// Should set Lucid state for next roll
			expect(gameState.isLucid).toBe(true);

			// Should set 6 cards (max)
			expect(gameState.cardsToDraw).toBe(6);

			gameState.rollWithModifiers = originalRoll;
		});

		test('should set Surreal state on natural 1', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 1, wasLucid: false, wasSurreal: false }));

			await rollForTasks();

			// Should set Surreal state for next roll
			expect(gameState.isSurreal).toBe(true);

			// Should set 1 card (min)
			expect(gameState.cardsToDraw).toBe(1);

			gameState.rollWithModifiers = originalRoll;
		});

		test('should handle Lucid roll (advantage)', async () => {
			gameState.isLucid = true;

			// Let it roll naturally with advantage
			const roll = await rollForTasks();

			// Roll should be in valid range
			expect(roll).toBeGreaterThanOrEqual(1);
			expect(roll).toBeLessThanOrEqual(20);

			// Cards should be in valid range
			expect(gameState.cardsToDraw).toBeGreaterThanOrEqual(1);
			expect(gameState.cardsToDraw).toBeLessThanOrEqual(6);

			// Lucid state should be cleared (rollWithModifiers clears it)
			expect(gameState.isLucid).toBe(false);
		});

		test('should handle Surreal roll (disadvantage)', async () => {
			gameState.isSurreal = true;

			// Let it roll naturally with disadvantage
			const roll = await rollForTasks();

			// Roll should be in valid range
			expect(roll).toBeGreaterThanOrEqual(1);
			expect(roll).toBeLessThanOrEqual(20);

			// Cards should be in valid range
			expect(gameState.cardsToDraw).toBeGreaterThanOrEqual(1);
			expect(gameState.cardsToDraw).toBeLessThanOrEqual(6);

			// Surreal state should be cleared
			expect(gameState.isSurreal).toBe(false);
		});

		test('should clear currentCard', async () => {
			gameState.currentCard = { card: '5', suit: 'hearts' };

			await rollForTasks();

			expect(gameState.currentCard).toBeNull();
		});

		test('should convert d20 rolls correctly to card counts', async () => {
			const originalRoll = gameState.rollWithModifiers;

			// Test each range
			const testCases = [
				{ roll: 1, expectedCards: 1 },
				{ roll: 2, expectedCards: 2 },
				{ roll: 5, expectedCards: 2 },
				{ roll: 6, expectedCards: 3 },
				{ roll: 10, expectedCards: 3 },
				{ roll: 11, expectedCards: 4 },
				{ roll: 15, expectedCards: 4 },
				{ roll: 16, expectedCards: 5 },
				{ roll: 19, expectedCards: 5 },
				{ roll: 20, expectedCards: 6 }
			];

			for (const testCase of testCases) {
				gameState.rollWithModifiers = vi.fn(() => ({
					roll: testCase.roll,
					wasLucid: false,
					wasSurreal: false
				}));

				await rollForTasks();

				expect(gameState.cardsToDraw).toBe(testCase.expectedCards);
			}

			gameState.rollWithModifiers = originalRoll;
		});
	});

	describe('Salvation System - D20 Ace-Dependent Thresholds', () => {
		beforeEach(() => {
			// Setup game config
			gameState.config = {
				labels: {
					successCheckWin: 'Victory! You have escaped!'
				}
			};
			gameState.isLucid = false;
			gameState.isSurreal = false;
			gameState.tokens = 10;
			gameState.acesRevealed = 0;
			gameState.aceOfHeartsRevealed = true; // Salvation is active
			gameState.gameOver = false;
			gameState.win = false;
			gameState.pendingUpdates.diceRoll = null;
			gameState.pendingUpdates.tokenChange = null;
		});

		describe('Ace Tracking', () => {
			test('should track Aces using aceChange pending update', async () => {
				gameState.deck = [{ card: 'A', suit: 'diamonds', description: 'Ace of Diamonds' }];
				gameState.cardsToDraw = 1;
				gameState.acesRevealed = 0;

				await drawCard();

				// Should set aceChange in pending updates
				expect(gameState.pendingUpdates.aceChange).toBe(1);

				// acesRevealed should not be updated yet
				expect(gameState.acesRevealed).toBe(0);

				await confirmCard();

				// Now acesRevealed should be incremented
				expect(gameState.acesRevealed).toBe(1);
				expect(gameState.pendingUpdates.aceChange).toBeNull();
			});

			test('should track Ace of Hearts separately', async () => {
				gameState.deck = [{ card: 'A', suit: 'hearts', description: 'Ace of Hearts' }];
				gameState.cardsToDraw = 1;
				gameState.aceOfHeartsRevealed = false;
				gameState.acesRevealed = 0;

				await drawCard();

				// Ace of Hearts flag should be set immediately
				expect(gameState.aceOfHeartsRevealed).toBe(true);

				// aceChange should still be pending
				expect(gameState.pendingUpdates.aceChange).toBe(1);

				await confirmCard();

				// acesRevealed should be incremented
				expect(gameState.acesRevealed).toBe(1);
			});

			test('should increment acesRevealed for each Ace', async () => {
				gameState.acesRevealed = 2;
				gameState.deck = [{ card: 'A', suit: 'clubs', description: 'Third Ace' }];
				gameState.cardsToDraw = 1;

				await drawCard();
				await confirmCard();

				expect(gameState.acesRevealed).toBe(3);
			});
		});

		describe('successCheck() - With 1 Ace Revealed', () => {
			beforeEach(() => {
				gameState.acesRevealed = 1; // Threshold = 17
			});

			test('should remove 2 tokens on natural 20 and set Lucid', () => {
				const originalRoll = gameState.rollWithModifiers;
				gameState.rollWithModifiers = vi.fn(() => ({ roll: 20, wasLucid: false, wasSurreal: false }));

				successCheck();

				// Should store pending token change
				expect(gameState.pendingUpdates.tokenChange).toBe(-2);

				// Should set Lucid state for next roll
				expect(gameState.isLucid).toBe(true);

				gameState.rollWithModifiers = originalRoll;
			});

			test('should remove 1 token on rolls 17-19', () => {
				const originalRoll = gameState.rollWithModifiers;

				for (let roll = 17; roll <= 19; roll++) {
					gameState.rollWithModifiers = vi.fn(() => ({
						roll,
						wasLucid: false,
						wasSurreal: false
					}));

					successCheck();

					expect(gameState.pendingUpdates.tokenChange).toBe(-1);

					// Clear for next test
					gameState.pendingUpdates.tokenChange = null;
					gameState.isLucid = false;
					gameState.isSurreal = false;
				}

				gameState.rollWithModifiers = originalRoll;
			});

			test('should not change tokens on near-miss (6-16)', () => {
				const originalRoll = gameState.rollWithModifiers;

				for (let roll = 6; roll <= 16; roll++) {
					gameState.rollWithModifiers = vi.fn(() => ({
						roll,
						wasLucid: false,
						wasSurreal: false
					}));

					successCheck();

					expect(gameState.pendingUpdates.tokenChange).toBe(0);

					// Clear for next test
					gameState.pendingUpdates.tokenChange = null;
				}

				gameState.rollWithModifiers = originalRoll;
			});

			test('should add 1 token on failure (2-5)', () => {
				const originalRoll = gameState.rollWithModifiers;

				for (let roll = 2; roll <= 5; roll++) {
					gameState.rollWithModifiers = vi.fn(() => ({
						roll,
						wasLucid: false,
						wasSurreal: false
					}));

					successCheck();

					expect(gameState.pendingUpdates.tokenChange).toBe(1);

					// Clear for next test
					gameState.pendingUpdates.tokenChange = null;
				}

				gameState.rollWithModifiers = originalRoll;
			});

			test('should add 2 tokens on natural 1 and set Surreal', () => {
				const originalRoll = gameState.rollWithModifiers;
				gameState.rollWithModifiers = vi.fn(() => ({ roll: 1, wasLucid: false, wasSurreal: false }));

				successCheck();

				expect(gameState.pendingUpdates.tokenChange).toBe(2);
				expect(gameState.isSurreal).toBe(true);

				gameState.rollWithModifiers = originalRoll;
			});
		});

		describe('successCheck() - With Multiple Aces', () => {
			test('should use threshold 14 with 2 Aces (35% success)', () => {
				gameState.acesRevealed = 2;
				const originalRoll = gameState.rollWithModifiers;

				// Test threshold boundary (14 should succeed)
				gameState.rollWithModifiers = vi.fn(() => ({ roll: 14, wasLucid: false, wasSurreal: false }));
				successCheck();
				expect(gameState.pendingUpdates.tokenChange).toBe(-1);

				// Clear and test just below threshold (13 should be near-miss)
				gameState.pendingUpdates.tokenChange = null;
				gameState.rollWithModifiers = vi.fn(() => ({ roll: 13, wasLucid: false, wasSurreal: false }));
				successCheck();
				expect(gameState.pendingUpdates.tokenChange).toBe(0);

				gameState.rollWithModifiers = originalRoll;
			});

			test('should use threshold 11 with 3 Aces (50% success)', () => {
				gameState.acesRevealed = 3;
				const originalRoll = gameState.rollWithModifiers;

				// Test threshold boundary (11 should succeed)
				gameState.rollWithModifiers = vi.fn(() => ({ roll: 11, wasLucid: false, wasSurreal: false }));
				successCheck();
				expect(gameState.pendingUpdates.tokenChange).toBe(-1);

				// Clear and test just below threshold (10 should be near-miss)
				gameState.pendingUpdates.tokenChange = null;
				gameState.rollWithModifiers = vi.fn(() => ({ roll: 10, wasLucid: false, wasSurreal: false }));
				successCheck();
				expect(gameState.pendingUpdates.tokenChange).toBe(0);

				gameState.rollWithModifiers = originalRoll;
			});

			test('should auto-succeed with 4 Aces (threshold 0)', () => {
				gameState.acesRevealed = 4;
				const originalRoll = gameState.rollWithModifiers;

				// Any roll should succeed with 4 Aces
				const testRolls = [1, 5, 10, 15, 20];

				for (const roll of testRolls) {
					gameState.rollWithModifiers = vi.fn(() => ({
						roll,
						wasLucid: false,
						wasSurreal: false
					}));

					successCheck();

					// Should always remove 1 token
					expect(gameState.pendingUpdates.tokenChange).toBe(-1);

					// Clear for next test
					gameState.pendingUpdates.tokenChange = null;
				}

				gameState.rollWithModifiers = originalRoll;
			});
		});

		describe('applyPendingSuccessCheck() - Token Application', () => {
			beforeEach(() => {
				// Set up config with slug for saveGame
				gameState.config = {
					slug: 'test-game',
					labels: {
						successCheckWin: 'Victory! You have escaped!'
					}
				};
			});

			test('should apply positive token change (failure adds tokens)', () => {
				gameState.tokens = 5;
				gameState.pendingUpdates.diceRoll = 3;
				gameState.pendingUpdates.tokenChange = 1;
				gameState.state = 'successCheck';

				applyPendingSuccessCheck();

				// Should add 1 token
				expect(gameState.tokens).toBe(6);

				// Should clear pending updates
				expect(gameState.pendingUpdates.diceRoll).toBeNull();
				expect(gameState.pendingUpdates.tokenChange).toBeNull();
			});

			test('should apply negative token change (success removes tokens)', () => {
				gameState.tokens = 5;
				gameState.pendingUpdates.diceRoll = 18;
				gameState.pendingUpdates.tokenChange = -1;
				gameState.state = 'successCheck';

				applyPendingSuccessCheck();

				// Should remove 1 token
				expect(gameState.tokens).toBe(4);
			});

			test('should apply -2 token change on natural 20', () => {
				gameState.tokens = 5;
				gameState.pendingUpdates.diceRoll = 20;
				gameState.pendingUpdates.tokenChange = -2;
				gameState.state = 'successCheck';

				applyPendingSuccessCheck();

				// Should remove 2 tokens
				expect(gameState.tokens).toBe(3);
			});

			test('should apply +2 token change on natural 1', () => {
				gameState.tokens = 5;
				gameState.pendingUpdates.diceRoll = 1;
				gameState.pendingUpdates.tokenChange = 2;
				gameState.state = 'successCheck';

				applyPendingSuccessCheck();

				// Should add 2 tokens
				expect(gameState.tokens).toBe(7);
			});

			test('should not allow tokens to go below 0', () => {
				gameState.tokens = 1;
				gameState.pendingUpdates.diceRoll = 20;
				gameState.pendingUpdates.tokenChange = -2;

				applyPendingSuccessCheck();

				// Should stop at 0
				expect(gameState.tokens).toBe(0);
			});
		});

		describe('applyPendingSuccessCheck() - Victory Condition', () => {
			test('should trigger victory when tokens reach 0', () => {
				gameState.tokens = 1;
				gameState.pendingUpdates.diceRoll = 18;
				gameState.pendingUpdates.tokenChange = -1;
				gameState.state = 'successCheck';

				applyPendingSuccessCheck();

				// Should set victory flags
				expect(gameState.tokens).toBe(0);
				expect(gameState.win).toBe(true);
				expect(gameState.gameOver).toBe(true);
				expect(gameState.state).toBe('gameOver');
			});

			test('should NOT transition to final damage roll (D20 system)', () => {
				gameState.tokens = 2;
				gameState.pendingUpdates.diceRoll = 20;
				gameState.pendingUpdates.tokenChange = -2;
				gameState.state = 'successCheck';

				applyPendingSuccessCheck();

				// Should go directly to game over (victory)
				expect(gameState.tokens).toBe(0);
				expect(gameState.state).toBe('gameOver');
				expect(gameState.win).toBe(true);
			});

			test('should continue game if tokens remain', () => {
				gameState.tokens = 5;
				gameState.pendingUpdates.diceRoll = 18;
				gameState.pendingUpdates.tokenChange = -1;
				gameState.state = 'successCheck';
				gameState.round = 5;

				applyPendingSuccessCheck();

				// Should NOT be game over
				expect(gameState.tokens).toBe(4);
				expect(gameState.gameOver).toBe(false);
				expect(gameState.win).toBe(false);

				// Should start next round
				expect(gameState.state).toBe('startRound');
				expect(gameState.round).toBe(6);
			});
		});

		describe('Lucid/Surreal Integration', () => {
			test('should handle Lucid roll in successCheck', () => {
				gameState.acesRevealed = 1;
				gameState.isLucid = true;

				// Let it roll naturally with advantage
				const roll = successCheck();

				// Roll should be in valid range
				expect(roll).toBeGreaterThanOrEqual(1);
				expect(roll).toBeLessThanOrEqual(20);

				// Lucid state should be cleared (rollWithModifiers clears it)
				expect(gameState.isLucid).toBe(false);
			});

			test('should handle Surreal roll in successCheck', () => {
				gameState.acesRevealed = 1;
				gameState.isSurreal = true;

				// Let it roll naturally with disadvantage
				const roll = successCheck();

				// Roll should be in valid range
				expect(roll).toBeGreaterThanOrEqual(1);
				expect(roll).toBeLessThanOrEqual(20);

				// Surreal state should be cleared
				expect(gameState.isSurreal).toBe(false);
			});
		});
	});
});
