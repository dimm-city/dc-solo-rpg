import { test, describe, expect, vi, beforeEach } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import {
	drawCard,
	confirmCard,
	getFailureCheckRoll,
	applyFailureCheckResult,
	confirmFailureCheck
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
		gameState.tower = 54;
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
			gameState.log = [{
				card: '5',
				suit: 'hearts',
				description: 'Test card',
				round: 1,
				id: '1.1'
			}];
			gameState.tower = 54;
			gameState.bonus = 0;
			
			// Roll a 3 (will remove 3 blocks)
			const rollResult = 3;
			applyFailureCheckResult(rollResult);
			
			// Tower should be reduced
			expect(gameState.tower).toBe(51); // 54 - 3
			
			// Log should be updated with dice roll
			expect(gameState.log[0].diceRoll).toBe(3);
		});

		test('should transition correctly after failure check', () => {
			gameState.state = 'failureCheck';
			gameState.log = [{ card: '5', suit: 'hearts', description: 'Test', round: 1, id: '1.1' }];
			gameState.tower = 54;
			gameState.bonus = 0;
			gameState.cardsToDraw = 2; // More cards to draw
			
			// Apply failure check with roll of 2
			applyFailureCheckResult(2);
			
			// Should transition back to drawCard since more cards remain
			expect(gameState.state).toBe('drawCard');
			expect(gameState.cardsToDraw).toBe(2);
		});

		test('should transition to log after failure check if no cards remain', () => {
			gameState.state = 'failureCheck';
			gameState.log = [{ card: '5', suit: 'hearts', description: 'Test', round: 1, id: '1.1' }];
			gameState.tower = 54;
			gameState.bonus = 0;
			gameState.cardsToDraw = 0; // No more cards
			
			// Apply failure check
			applyFailureCheckResult(2);
			
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
});
