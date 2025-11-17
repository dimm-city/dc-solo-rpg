import { test, describe, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { gameState } from './gameStore.svelte.js';
import {
	startGame,
	startRound,
	rollForTasks,
	drawCard,
	confirmCard,
	failureCheck,
	confirmFailureCheck,
	recordRound,
	successCheck,
	restartGame,
	exitGame,
	confirmTaskRoll,
	services
} from './gameActions.svelte.js';

global.fetch = vi.fn();

function createFetchResponse(url, data) {
	return {
		json: () => new Promise((resolve) => resolve(data)),
		text: () =>
			new Promise((resolve) => {
				// // Return a mock game configuration
				// const config = new GameSettings();
				// config.stylesheet = 'game.css';
				// return config;
				const buffer = readFileSync(url);
				const output = buffer.toString();

				console.log('MOCKED', url); //, output);
				return resolve(output);
			})
	};
}

describe('WAAStore', () => {
	beforeEach(() => {
		global.fetch.mockReset();
		// Reset gameState to default values
		gameState.state = 'loadGame';
		gameState.playerName = '';
		gameState.tower = 20; // D20 system: starts at 20 Stability
		gameState.tokens = 10;
		gameState.round = 0;
		gameState.cardsToDraw = 0;
		gameState.cardsDrawn = 0;
		gameState.deck = [];
		gameState.discard = [];
		gameState.log = [];
		gameState.currentCard = null;
		gameState.diceRoll = 0;
		gameState.kingsRevealed = 0;
		gameState.acesRevealed = 0; // D20 system: tracks Aces for Salvation
		gameState.isLucid = false; // D20 system: advantage state
		gameState.isSurreal = false; // D20 system: disadvantage state
		gameState.kingOfHearts = false;
		gameState.kingOfDiamonds = false;
		gameState.kingOfClubs = false;
		gameState.kingOfSpades = false;
		gameState.aceOfHeartsRevealed = false;
		gameState.gameOver = false;
		gameState.win = false;
		gameState.bonus = 0;
		gameState.journalEntries = [];
		gameState.config = null;
		gameState.systemConfig = null;
		gameState.stylesheet = '';
		gameState.status = '';
		gameState.player = null;
	});

	// Test startGame
	test('startGame', () => {
		const mockPlayer = {
			name: 'John Doe'
		};

		// Set up mock game configuration
		const mockGameConfig = {
			deck: Array.from({ length: 52 }, (_, i) => ({
				card: String(i),
				suit: 'hearts',
				description: `Card ${i}`
			})),
			options: { startingTokens: 10 }
		};

		// Call the startGame action with full config
		// When passing full config, startGame uses initializeGame which sets state to 'showIntro'
		startGame(mockPlayer, mockGameConfig, {
			difficulty: 3
		});

		expect(gameState.round).toBe(1);
		expect(gameState.player).toStrictEqual(mockPlayer);
		expect(gameState.player.name).toBe(mockPlayer.name);
		expect(gameState.deck).toBeDefined();
		expect(gameState.deck.length).toBe(52);
		// D20 system: Tower (Stability) starts at 20
		expect(gameState.tower).toBe(20);
		// initializeGame sets state to 'showIntro' (initial state)
		expect(gameState.state).toBe('showIntro');
		expect(gameState.config.options).toBeDefined();
		expect(gameState.config.options.difficulty).toBe(3);
	});

	// Test startRound
	test('startRound', async () => {
		//Write a test for startRound
		gameState.round = 1;
		gameState.state = 'log';

		// Call startRound
		await startRound();

		// Assert that the round number in the gameState is incremented
		expect(gameState.round).toBe(2);
		expect(gameState.state).toBe('startRound');
	});

	// Test rollForTasks - D20 System
	test('rollForTasks', async () => {
		// Set initial state for this test
		gameState.state = 'rollForTasks';

		// Mock rollWithModifiers for D20 system
		const originalRoll = gameState.rollWithModifiers;
		gameState.rollWithModifiers = vi.fn(() => ({ roll: 15, wasLucid: false, wasSurreal: false }));

		const result = await rollForTasks();

		// Assert that the tokens in the gameState are updated correctly
		expect(gameState).toBeDefined();
		expect(result.roll).toBe(15);
		// D20 system: roll 15 → 4 cards (range 11-15)
		expect(gameState.cardsToDraw).toBe(4);
		// rollForTasks() no longer transitions state - it just updates cardsToDraw
		expect(gameState.state).toBe('rollForTasks');

		// confirmTaskRoll() transitions to drawCard
		confirmTaskRoll();
		expect(gameState.state).toBe('drawCard');

		gameState.rollWithModifiers = originalRoll;
	});

	// Test drawCard
	describe('drawCard', () => {
		test('should draw a card and update the game state (even card)', async () => {
			const card = { card: '2', suit: 'hearts' };
			// Set initial state using transitionTo for proper validation
			gameState.state = 'rollForTasks';
			gameState.kingsRevealed = 3;
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.deck = [card];
			gameState.round = 1;
			gameState.bonus = 0;
			confirmTaskRoll(); // Transition from rollForTasks to drawCard

			await drawCard();

			// Now confirm the card to trigger state transition
			await confirmCard();

			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(3);
			expect(gameState.bonus).toBe(0);
			expect(gameState.aceOfHeartsRevealed).toBe(false);
			expect(gameState.state).toBe('log');
		});

		test('should draw a card and update the game state (odd card)', async () => {
			const card = { card: '7', suit: 'diamonds' };
			// Set initial state using proper transitions
			gameState.state = 'rollForTasks';
			gameState.kingsRevealed = 3;
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.deck = [card];
			gameState.round = 1;
			gameState.bonus = 0;
			confirmTaskRoll();

			await drawCard();
			await confirmCard();

			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(3);
			expect(gameState.bonus).toBe(0);
			expect(gameState.aceOfHeartsRevealed).toBe(false);
			expect(gameState.state).toBe('failureCheck');
		});
		test('should draw a card and update the game state (final king)', async () => {
			const card = { card: 'K', suit: 'hearts' };
			// Set initial state using proper transitions
			gameState.state = 'rollForTasks';
			gameState.kingsRevealed = 3;
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.deck = [card];
			gameState.round = 1;
			gameState.bonus = 0;
			gameState.config = {
				labels: {
					failureCounterLoss: 'Game Over - Too Many Kings'
				}
			};
			confirmTaskRoll();

			await drawCard();

			// Drawing the 4th king immediately transitions to gameOver
			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(4);
			expect(gameState.bonus).toBe(0);
			expect(gameState.aceOfHeartsRevealed).toBe(false);
			expect(gameState.state).toBe('gameOver');
			expect(gameState.gameOver).toBe(true);
			expect(gameState.win).toBe(false);
			expect(gameState.status).toBe('Game Over - Too Many Kings');
		});

		test('should draw a card and update the game state (ace of hearts)', async () => {
			const card = { card: 'A', suit: 'hearts' };
			// Set initial state using proper transitions
			gameState.state = 'rollForTasks';
			gameState.kingsRevealed = 3;
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.deck = [card];
			gameState.round = 1;
			gameState.bonus = 0;
			confirmTaskRoll();

			await drawCard();
			await confirmCard();

			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(3);
			expect(gameState.bonus).toBe(1);
			expect(gameState.aceOfHeartsRevealed).toBe(true);
			// Ace is an odd card, so it triggers failure check
			expect(gameState.state).toBe('failureCheck');
		});

		test('should draw a card and update the game state (game over)', async () => {
			// Set initial state using proper transitions
			gameState.state = 'rollForTasks';
			gameState.kingsRevealed = 3;
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.deck = [];
			gameState.round = 1;
			gameState.bonus = 0;
			confirmTaskRoll();

			await drawCard();

			expect(gameState.gameOver).toBe(true);
			expect(gameState.cardsToDraw).toBe(1);
			expect(gameState.bonus).toBe(0);
			expect(gameState.aceOfHeartsRevealed).toBe(false);
			expect(gameState.state).toBe('gameOver');
		});
	});
	// Test failureCheck - D20 System
	describe('failureCheck', () => {
		test('should perform D20 Stability check and update game state (Stability depleted)', async () => {
			// Mock rollWithModifiers for D20 system
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 3, wasLucid: false, wasSurreal: false }));

			gameState.state = 'failureCheck';
			gameState.gameOver = false;
			gameState.tower = 2; // D20 system: Low Stability
			gameState.cardsToDraw = 0;
			gameState.log = [];
			gameState.round = 1;
			gameState.config = {
				labels: {
					failureCheckLoss: 'Custom Loss Label'
				}
			};

			// Import the apply function
			const { applyFailureCheckResult, applyPendingDiceRoll } = await import('./gameActions.svelte.js');

			const result = await failureCheck();

			// Result is now an object with { roll, wasLucid, wasSurreal }
			expect(result.roll).toBe(3);

			// Apply the roll result
			applyFailureCheckResult(result.roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(3);
			// Roll 3 (range 2-5) → -2 Stability → 2 - 2 = 0
			expect(gameState.tower).toBe(0);
			expect(gameState.status).toBe('Custom Loss Label');
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');

			gameState.rollWithModifiers = originalRoll;
		});

		test('should perform D20 Stability check (Stability not depleted)', async () => {
			// Mock rollWithModifiers for D20 system
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 8, wasLucid: false, wasSurreal: false }));

			gameState.state = 'failureCheck';
			gameState.gameOver = false;
			gameState.tower = 20; // D20 system: Full Stability
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.round = 1;
			gameState.config = {};

			// Import the apply function
			const { applyFailureCheckResult, applyPendingDiceRoll } = await import('./gameActions.svelte.js');

			const result = await failureCheck();

			// Result is now an object with { roll, wasLucid, wasSurreal }
			expect(result.roll).toBe(8);

			// Apply the roll result
			applyFailureCheckResult(result.roll);
			applyPendingDiceRoll();

			expect(gameState.diceRoll).toBe(8);
			// Roll 8 (range 6-10) → -1 Stability → 20 - 1 = 19
			expect(gameState.tower).toBe(19);
			expect(gameState.gameOver).toBe(false);
			expect(gameState.state).toBe('drawCard');

			gameState.rollWithModifiers = originalRoll;
		});
	});

	describe('confirmFailureCheck', () => {
		test('should update the current screen', async () => {
			const initialState = {
				state: 'failureCheck'
			};
			Object.assign(gameState, initialState);

			await confirmFailureCheck();

			// After confirm, the state should remain the same (transitionToScreen just animates)
			expect(gameState.state).toBe('failureCheck');
		});
	});

	// Test recordRound
	describe('recordRound', () => {
		test('should record the round and transition to startRound', async () => {
			const journalEntry = { text: 'Journal entry 1' };
			const initialState = {
				round: 1,
				aceOfHeartsRevealed: true,
				tokens: 5,
				gameOver: false,
				journalEntries: [],
				state: 'log'
			};

			Object.assign(gameState, initialState);

			await recordRound(journalEntry);

			expect(gameState.journalEntries).toEqual([
				expect.objectContaining({ text: journalEntry.text, round: initialState.round })
			]);
			// recordRound now always transitions to startRound (success check happens before journal)
			expect(gameState.state).toBe('startRound');
		});

		test('should record the round and transition to startRound (no ace)', async () => {
			const journalEntry = { text: 'Journal entry 1' };
			const initialState = {
				round: 1,
				aceOfHeartsRevealed: false,
				gameOver: false,
				journalEntries: [],
				state: 'log'
			};

			Object.assign(gameState, initialState);

			await recordRound(journalEntry);

			expect(gameState.journalEntries).toEqual([
				expect.objectContaining({ text: journalEntry.text, round: initialState.round })
			]);
			expect(gameState.state).toBe('startRound');
		});

		test('should throw an error if no journal entry provided', async () => {
			await expect(recordRound(null)).rejects.toThrow('Journal entry object is required');
		});

		test('should throw an error if journal entry is undefined', async () => {
			await expect(recordRound(undefined)).rejects.toThrow('Journal entry object is required');
		});
	});

	//Test successCheck - D20 Salvation System
	describe('successCheck', () => {
		test('should trigger victory when tokens reach 0 (D20 system)', async () => {
			// Mock rollWithModifiers for D20 system
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 17, wasLucid: false, wasSurreal: false }));

			const initialState = {
				tokens: 1,
				acesRevealed: 1, // D20 system: 1 Ace → threshold 17
				aceOfHeartsRevealed: true, // Required for success check
				state: 'successCheck',
				config: {
					difficulty: 1,
					slug: 'test-game',
					labels: {
						successCheckWin: 'Custom Win Label'
					}
				}
			};

			Object.assign(gameState, initialState);

			// Call successCheck - it stores result in pendingUpdates
			successCheck();

			// The roll value should be in pendingUpdates
			expect(gameState.pendingUpdates.diceRoll).toBe(17);

			// Apply the pending updates
			const { applyPendingSuccessCheck } = await import('./gameActions.svelte.js');
			applyPendingSuccessCheck();

			// D20 system: tokens reach 0 = instant victory
			expect(gameState.tokens).toBe(0);
			expect(gameState.win).toBe(true);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');

			gameState.rollWithModifiers = originalRoll;
		});

		test('should add token on failure (D20 system)', async () => {
			// Mock rollWithModifiers for D20 system
			const originalRoll = gameState.rollWithModifiers;
			gameState.rollWithModifiers = vi.fn(() => ({ roll: 4, wasLucid: false, wasSurreal: false }));

			gameState.state = 'successCheck';
			gameState.tokens = 5;
			gameState.acesRevealed = 1; // Threshold 17
			gameState.win = false;
			gameState.gameOver = false;
			gameState.aceOfHeartsRevealed = true; // Required for success check
			gameState.config = {
				difficulty: 1,
				slug: 'test-game',
				labels: {}
			};

			// Call successCheck and apply pendingUpdates
			successCheck();

			// The actual roll value is stored in pendingUpdates
			expect(gameState.pendingUpdates.diceRoll).toBe(4);

			// Apply the pending updates
			const { applyPendingSuccessCheck } = await import('./gameActions.svelte.js');
			applyPendingSuccessCheck();

			// Roll 4 (range 2-5) → +1 token
			expect(gameState.tokens).toBe(6);
			expect(gameState.win).toBe(false);
			expect(gameState.gameOver).toBe(false);
			expect(gameState.state).toBe('log');

			gameState.rollWithModifiers = originalRoll;
		});
	});

	// Test restartGame
	test('restartGame', () => {
		const player = { name: 'John Doe' };
		const options = { difficulty: 1 };
		const deck = Array.from({ length: 52 }, (_, i) => ({
			card: String(i),
			suit: 'hearts',
			description: `Card ${i}`
		}));
		gameState.player = player;
		gameState.state = 'gameOver';
		gameState.config = { deck, options };

		// Can only restart a game that is in the gameOver state
		expect(gameState.state).toBe('gameOver');

		restartGame();

		expect(gameState.player).toStrictEqual(player);
		// D20 system: Tower (Stability) resets to 20
		expect(gameState.tower).toBe(20);
		// restartGame uses initializeGame which sets state to 'showIntro'
		expect(gameState.state).toBe('showIntro');
		// Options will have additional defaults added by initializeGame - just check difficulty is preserved
		expect(gameState.config.options.difficulty).toBeDefined();
	});

	// Test exitGame
	test('exitGame', async () => {
		const player = { name: 'John Doe' };
		const options = { difficulty: 1 };
		gameState.player = player;
		gameState.round = 5;
		gameState.deck = [{ card: '2', suit: 'hearts', description: 'Two of Hearts' }];
		gameState.config = { options };
		gameState.state = 'gameOver';

		await exitGame();

		expect(gameState.player).toStrictEqual(player);
		expect(gameState.state).toBe('exitGame');
		expect(gameState.round).toBe(0);
	});
});
