/**
 * Tests for gameActions.svelte.js
 * Tests all game mechanics and actions
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	startGame,
	startRound,
	rollForTasks,
	applyPendingTaskRoll,
	confirmTaskRoll,
	drawCard,
	confirmCard,
	getFailureCheckRoll,
	applyFailureCheckResult,
	applyPendingDiceRoll,
	failureCheck,
	confirmFailureCheck,
	recordRound,
	successCheck,
	applyPendingSuccessCheck,
	confirmSuccessCheck,
	restartGame,
	exitGame,
	services
} from './gameActions.svelte.js';
import { gameState, transitionTo } from './gameStore.svelte.js';

describe('gameActions - Core Game Mechanics', () => {
	// Mock game configuration
	const mockGameConfig = {
		title: 'Test Game',
		deck: [
			{ card: 'A', suit: 'hearts', description: 'Ace of Hearts' },
			{ card: 'K', suit: 'spades', description: 'King of Spades' },
			{ card: 'K', suit: 'hearts', description: 'King of Hearts' },
			{ card: 'K', suit: 'diamonds', description: 'King of Diamonds' },
			{ card: 'K', suit: 'clubs', description: 'King of Clubs' },
			{ card: '3', suit: 'clubs', description: 'Three of Clubs' },
			{ card: '4', suit: 'diamonds', description: 'Four of Diamonds' },
			{ card: '2', suit: 'clubs', description: 'Two of Clubs' },
			{ card: 'A', suit: 'diamonds', description: 'Ace of Diamonds' }
		],
		options: { startingTokens: 10, difficulty: 1 },
		labels: {
			statusDisplayRoundText: 'ROUND:',
			successCounters: 'SUCCESS',
			failureCounters: 'FAILURE',
			successCheckWin: 'Salvation has arrived',
			failureCheckLoss: 'The tower has fallen',
			failureCounterLoss: 'All kings revealed'
		}
	};

	beforeEach(() => {
		// Reset game state
		gameState.state = 'options'; // Start from options state for valid transitions
		gameState.round = 0;
		gameState.tower = 20; // D20 system: starts at 20 Stability
		gameState.tokens = 10;
		gameState.kingsRevealed = 0;
		gameState.acesRevealed = 0; // D20 system: tracks Aces for Salvation
		gameState.isLucid = false; // D20 system: advantage state
		gameState.isSurreal = false; // D20 system: disadvantage state
		gameState.kingOfHearts = false;
		gameState.kingOfDiamonds = false;
		gameState.kingOfClubs = false;
		gameState.kingOfSpades = false;
		gameState.aceOfHeartsRevealed = false;
		gameState.deck = [];
		gameState.discard = [];
		gameState.log = [];
		gameState.currentCard = null;
		gameState.cardsToDraw = 0;
		gameState.cardsDrawn = 0;
		gameState.diceRoll = 0;
		gameState.gameOver = false;
		gameState.win = false;
		gameState.bonus = 0;
		gameState.journalEntries = [];
		gameState.config = null;
		gameState.player = null;

		// Set up the configuration loader with game settings
		services.gameSettings = { ...mockGameConfig };

		vi.clearAllMocks();
	});

	describe('Game Initialization', () => {
		it('should start game with player and initial state', () => {
			const player = { name: 'Test Player' };
			const options = { difficulty: 1 };

			// Use the full config from services.gameSettings (set in beforeEach)
			startGame(player, mockGameConfig, options);

			expect(gameState.player).toEqual(player);
			expect(gameState.playerName).toBe('Test Player');
			expect(gameState.round).toBe(1);
			// D20 system: Tower (Stability) starts at 20
			expect(gameState.tower).toBe(20);
			expect(gameState.tokens).toBe(10);
			expect(gameState.deck.length).toBeGreaterThan(0);
			// State should be 'showIntro' after initialization
			expect(gameState.state).toBe('showIntro');
		});

		it('should initialize deck by shuffling config deck', () => {
			const player = { name: 'Test' };

			startGame(player, mockGameConfig, {});

			// Deck should be shuffled and have cards
			expect(gameState.deck.length).toBeGreaterThan(0);
		});

		it('should handle easy difficulty by removing Ace of Hearts', () => {
			const player = { name: 'Test' };

			startGame(player, mockGameConfig, { difficulty: 0 });

			// Ace of Hearts should be marked as revealed
			expect(gameState.aceOfHeartsRevealed).toBe(true);

			// Deck should not contain Ace of Hearts
			const hasAceOfHearts = gameState.deck.some((c) => c.card === 'A' && c.suit === 'hearts');
			expect(hasAceOfHearts).toBe(false);

			// Tokens should be set to 0 (success checks already passed)
			expect(gameState.tokens).toBe(0);
		});

		it('should reset all game state when starting', () => {
			const player = { name: 'Test' };

			// Set some existing state
			gameState.kingsRevealed = 2;
			gameState.tower = 10;
			gameState.log = [{ card: 'K', suit: 'hearts' }];

			startGame(player, mockGameConfig, {});

			expect(gameState.kingsRevealed).toBe(0);
			// D20 system: Tower (Stability) resets to 20
			expect(gameState.tower).toBe(20);
			// D20 system: No initial damage roll, so log should be empty
			expect(gameState.log.length).toBe(0);
		});
	});

	describe('Round Management', () => {
		it('should increment round number', async () => {
			gameState.state = 'log';
			gameState.round = 1;

			await startRound();

			expect(gameState.round).toBe(2);
		});

		it('should transition to rollForTasks state', async () => {
			gameState.state = 'log';
			gameState.round = 1;

			await startRound();

			expect(gameState.state).toBe('startRound');
		});
	});

	describe('D20 Rolling - Card Count Conversion', () => {
		beforeEach(() => {
			gameState.state = 'rollForTasks';
		});

		it('should roll d20 and convert to card count', async () => {
			// Mock rollWithModifiers to return specific d20 roll
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 15, wasLucid: false, wasSurreal: false }));

			const result = await rollForTasks();

			// Roll 15 should convert to 4 cards (range 11-15)
			expect(result.roll).toBe(15);
			expect(gameState.cardsToDraw).toBe(4);

			gameState.rollWithModifiers = originalRoll;
		});

		it('should transition to drawCard state after confirming roll', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 10, wasLucid: false, wasSurreal: false }));

			await rollForTasks();
			await confirmTaskRoll();

			expect(gameState.state).toBe('drawCard');

			gameState.rollWithModifiers = originalRoll;
		});

		it('should handle natural 1 (minimum cards)', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 1, wasLucid: false, wasSurreal: false }));

			await rollForTasks();

			expect(gameState.cardsToDraw).toBe(1);

			gameState.rollWithModifiers = originalRoll;
		});

		it('should handle natural 20 (maximum cards)', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 20, wasLucid: false, wasSurreal: false }));

			await rollForTasks();

			expect(gameState.cardsToDraw).toBe(6);

			gameState.rollWithModifiers = originalRoll;
		});

		it('should convert d20 ranges correctly', async () => {
			const originalRoll = gameState.rollWithModifiers;
			const testCases = [
				{ roll: 1, expectedCards: 1 },
				{ roll: 3, expectedCards: 2 },   // 2-5 → 2 cards
				{ roll: 8, expectedCards: 3 },   // 6-10 → 3 cards
				{ roll: 13, expectedCards: 4 },  // 11-15 → 4 cards
				{ roll: 17, expectedCards: 5 },  // 16-19 → 5 cards
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

	describe('Card Drawing Mechanics', () => {
		beforeEach(() => {
			gameState.state = 'drawCard';
			gameState.deck = [
				{ card: 'A', suit: 'hearts', description: 'Primary success card' },
				{ card: 'K', suit: 'spades', description: 'King of failure' },
				{ card: '3', suit: 'clubs', description: 'Odd card - failure check' },
				{ card: '4', suit: 'diamonds', description: 'Even card - safe' }
			];
			gameState.cardsToDraw = 2;
			gameState.round = 1;
		});

		it('should draw card from deck', async () => {
			const deckSize = gameState.deck.length;

			await drawCard();

			expect(gameState.currentCard).toBeDefined();
			expect(gameState.deck.length).toBe(deckSize - 1);
			expect(gameState.cardsToDraw).toBe(1);
		});

		it('should add drawn card to log with round info', async () => {
			await drawCard();

			expect(gameState.log.length).toBe(1);
			expect(gameState.log[0].round).toBe(gameState.round);
			expect(gameState.log[0].card).toBe(gameState.currentCard.card);
		});

		it('should track King of Hearts when drawn', async () => {
			gameState.deck = [{ card: 'K', suit: 'hearts', description: 'King' }];

			drawCard();
			confirmCard();

			expect(gameState.kingOfHearts).toBe(true);
			expect(gameState.kingsRevealed).toBe(1);
		});

		it('should track King of Diamonds when drawn', async () => {
			gameState.deck = [{ card: 'K', suit: 'diamonds', description: 'King' }];

			drawCard();
			confirmCard();

			expect(gameState.kingOfDiamonds).toBe(true);
			expect(gameState.kingsRevealed).toBe(1);
		});

		it('should track King of Clubs when drawn', async () => {
			gameState.deck = [{ card: 'K', suit: 'clubs', description: 'King' }];

			drawCard();
			confirmCard();

			expect(gameState.kingOfClubs).toBe(true);
			expect(gameState.kingsRevealed).toBe(1);
		});

		it('should track King of Spades when drawn', async () => {
			gameState.deck = [{ card: 'K', suit: 'spades', description: 'King' }];

			drawCard();
			confirmCard();

			expect(gameState.kingOfSpades).toBe(true);
			expect(gameState.kingsRevealed).toBe(1);
		});

		it('should trigger failure check for odd cards', async () => {
			gameState.deck = [{ card: '3', suit: 'clubs', description: 'Odd' }];
			gameState.cardsToDraw = 1;

			await drawCard();
			await confirmCard();

			expect(gameState.state).toBe('failureCheck');
		});

		it('should not trigger failure check for even cards', async () => {
			gameState.deck = [{ card: '4', suit: 'diamonds', description: 'Even' }];
			gameState.cardsToDraw = 1;

			await drawCard();
			await confirmCard();

			// Should go to log, not failureCheck
			expect(gameState.state).toBe('log');
		});

		it('should handle Ace of Hearts (primary success)', async () => {
			gameState.deck = [{ card: 'A', suit: 'hearts', description: 'Primary success' }];

			await drawCard();

			expect(gameState.aceOfHeartsRevealed).toBe(true);
		});

		it('should add bonus for all Aces', async () => {
			gameState.deck = [{ card: 'A', suit: 'diamonds', description: 'Bonus ace' }];
			gameState.bonus = 0;

			drawCard();
			confirmCard();

			expect(gameState.bonus).toBe(1);
		});

		it('should allow drawing multiple cards in one turn', async () => {
			gameState.cardsToDraw = 3;

			await drawCard();
			expect(gameState.cardsToDraw).toBe(2);

			await drawCard();
			expect(gameState.cardsToDraw).toBe(1);

			await drawCard();
			expect(gameState.cardsToDraw).toBe(0);
		});

		it('should trigger game over when 4 kings revealed', async () => {
			gameState.kingsRevealed = 3;
			gameState.deck = [{ card: 'K', suit: 'spades', description: 'Final king' }];
			gameState.cardsToDraw = 1;
			gameState.config = {
				labels: {
					failureCounterLoss: 'All kings revealed'
				}
			};

			await drawCard();

			expect(gameState.kingsRevealed).toBe(4);
			expect(gameState.gameOver).toBe(true);
		});
	});

	describe('D20 Stability Check Mechanics', () => {
		beforeEach(() => {
			gameState.state = 'failureCheck';
			gameState.tower = 20; // D20 system: starts at 20 Stability
			gameState.bonus = 0;
			gameState.cardsToDraw = 0;
			gameState.config = {
				labels: {
					failureCheckLoss: 'The tower has fallen'
				}
			};
		});

		it('should reduce Stability on roll 2-5 (-2 Stability)', () => {
			const roll = 3; // Roll in range 2-5 → -2 Stability
			applyFailureCheckResult(roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tower).toBe(18); // 20 - 2
		});

		it('should reduce Stability on roll 6-10 (-1 Stability)', () => {
			const roll = 8; // Roll in range 6-10 → -1 Stability
			applyFailureCheckResult(roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tower).toBe(19); // 20 - 1
		});

		it('should not reduce Stability on roll 11-19', () => {
			const roll = 15; // Roll in range 11-19 → 0 damage
			applyFailureCheckResult(roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tower).toBe(20); // No damage
		});

		it('should grant +1 Stability on natural 20 (max 20)', () => {
			gameState.tower = 15;
			const roll = 20; // Natural 20 → +1 Stability
			applyFailureCheckResult(roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tower).toBe(16); // 15 + 1
		});

		it('should not exceed 20 Stability on natural 20', () => {
			gameState.tower = 20;
			const roll = 20;
			applyFailureCheckResult(roll);
			applyPendingDiceRoll();

			expect(gameState.tower).toBe(20); // Capped at 20
		});

		it('should lose 3 Stability on natural 1', () => {
			const roll = 1; // Natural 1 → -3 Stability
			applyFailureCheckResult(roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tower).toBe(17); // 20 - 3
		});

		it('should trigger game over when Stability reaches 0', async () => {
			gameState.tower = 2;
			applyFailureCheckResult(3); // -2 Stability → 0
			applyPendingDiceRoll();

			expect(gameState.tower).toBe(0);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
		});

		it('should continue to log if no more cards to draw', () => {
			gameState.cardsToDraw = 0;

			applyFailureCheckResult(5);
			applyPendingDiceRoll();

			expect(gameState.state).toBe('log');
		});

		it('should continue to drawCard if more cards to draw', () => {
			gameState.cardsToDraw = 2;

			applyFailureCheckResult(5);
			applyPendingDiceRoll();

			expect(gameState.state).toBe('drawCard');
		});

		it('should update log with dice roll', () => {
			gameState.log = [{ card: '3', suit: 'clubs', round: 1 }];

			applyFailureCheckResult(8);
			applyPendingDiceRoll();

			expect(gameState.log[0].diceRoll).toBe(8);
		});
	});

	describe('D20 Salvation System', () => {
		beforeEach(() => {
			gameState.state = 'successCheck';
			gameState.tokens = 10;
			gameState.tower = 20; // D20 system: 20 Stability
			gameState.acesRevealed = 1; // Default to 1 Ace (threshold 17)
			gameState.aceOfHeartsRevealed = true;
			gameState.config = {
				difficulty: 1,
				labels: {
					successCheckWin: 'Salvation has arrived'
				},
				slug: 'test-game'
			};
		});

		it('should remove 1 token on successful roll (1 Ace, roll 17)', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 17, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(9);

			gameState.rollWithModifiers = originalRoll;
		});

		it('should remove 2 tokens on natural 20', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 20, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(8); // 10 - 2

			gameState.rollWithModifiers = originalRoll;
		});

		it('should add 1 token on failure (roll 2-5)', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 3, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(11); // 10 + 1

			gameState.rollWithModifiers = originalRoll;
		});

		it('should add 2 tokens on natural 1', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 1, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(12); // 10 + 2

			gameState.rollWithModifiers = originalRoll;
		});

		it('should not change tokens on near-miss (6-16 with threshold 17)', async () => {
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 10, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(10); // No change

			gameState.rollWithModifiers = originalRoll;
		});

		it('should use threshold 14 with 2 Aces', async () => {
			gameState.acesRevealed = 2;
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 14, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(9); // Success

			gameState.rollWithModifiers = originalRoll;
		});

		it('should use threshold 11 with 3 Aces', async () => {
			gameState.acesRevealed = 3;
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 11, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(9); // Success

			gameState.rollWithModifiers = originalRoll;
		});

		it('should auto-succeed with 4 Aces (threshold 0)', async () => {
			gameState.acesRevealed = 4;
			const originalRoll = gameState.rollWithModifiers;
			// Any roll should succeed
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 5, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(9); // Success

			gameState.rollWithModifiers = originalRoll;
		});

		it('should trigger victory when tokens reach 0', async () => {
			gameState.tokens = 1;
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 18, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(0);
			expect(gameState.win).toBe(true);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');

			gameState.rollWithModifiers = originalRoll;
		});

		it('should continue to log if tokens remain', async () => {
			gameState.tokens = 5;
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 18, wasLucid: false, wasSurreal: false }));

			successCheck();
			applyPendingSuccessCheck();

			expect(gameState.tokens).toBe(4);
			expect(gameState.state).toBe('log');

			gameState.rollWithModifiers = originalRoll;
		});
	});

	describe('Token Management', () => {
		it('should start with 10 tokens', () => {
			const player = { name: 'Test' };

			startGame(player, mockGameConfig, {});

			expect(gameState.tokens).toBe(10);
		});
	});

	describe('Journal Entry Recording', () => {
		beforeEach(() => {
			gameState.state = 'log';
			gameState.round = 2;
			gameState.log = [
				{ round: 2, card: 'A', suit: 'hearts', description: 'Event 1' },
				{ round: 2, card: '3', suit: 'clubs', description: 'Event 2' }
			];
			gameState.aceOfHeartsRevealed = false;
			gameState.gameOver = false;
		});

		it('should record journal entry for current round', async () => {
			const entry = { text: 'This round was challenging...' };

			await recordRound(entry);

			expect(gameState.journalEntries.length).toBe(1);
			expect(gameState.journalEntries[0].round).toBe(2);
			expect(gameState.journalEntries[0].text).toBe(entry.text);
		});

		it('should add timestamp to journal entry', async () => {
			const entry = { text: 'My entry' };

			await recordRound(entry);

			expect(gameState.journalEntries[0].dateRecorded).toBeDefined();
		});

		it('should transition to success check if Ace of Hearts revealed', async () => {
			gameState.aceOfHeartsRevealed = true;

			await recordRound({ text: 'Entry' });

			expect(gameState.state).toBe('successCheck');
		});

		it('should start new round if Ace not yet revealed', async () => {
			gameState.aceOfHeartsRevealed = false;

			await recordRound({ text: 'Entry' });

			// startRound transitions to startRound state first, then to rollForTasks
			expect(gameState.state).toBe('startRound');
		});

		it('should throw error if no journal entry provided', async () => {
			await expect(recordRound()).rejects.toThrow('Journal entry object is required');
		});

		it('should accept empty journal entry (text and audio are optional)', async () => {
			// Set up valid initial state
			gameState.state = 'log';
			gameState.round = 1;
			gameState.journalEntries = [];
			gameState.gameOver = false;

			// Empty journal entry should be accepted (both text and audio are optional)
			await expect(recordRound({})).resolves.not.toThrow();
			expect(gameState.journalEntries).toHaveLength(1);
			expect(gameState.journalEntries[0].text).toBe('');
		});
	});

	describe('Game Restart and Exit', () => {
		beforeEach(() => {
			gameState.state = 'gameOver';
			gameState.round = 5;
			gameState.tower = 10;
			gameState.tokens = 3;
			gameState.kingsRevealed = 2;
			gameState.player = { name: 'Test Player' };
			gameState.config = {
				deck: mockGameConfig.deck,
				options: { difficulty: 1, initialDamage: false }
			};
		});

		it('should restart game and reset state', () => {
			restartGame();

			// restartGame() sets state to 'showIntro' (initial state after game init)
			expect(gameState.state).toBe('showIntro');
			expect(gameState.round).toBe(1);
			// Tower starts at 54 minus initial 1d6 roll (48-53)
			expect(gameState.tower).toBeGreaterThanOrEqual(48);
			expect(gameState.tower).toBeLessThanOrEqual(53);
			expect(gameState.tokens).toBe(10);
		});

		it('should exit game and transition to exitGame state', async () => {
			await exitGame();

			expect(gameState.state).toBe('exitGame');
		});
	});

	describe('State Transitions - transitionTo', () => {
		it('should transition to specified screen', () => {
			gameState.state = 'startRound';

			transitionTo('rollForTasks');

			expect(gameState.state).toBe('rollForTasks');
		});
	});
});
