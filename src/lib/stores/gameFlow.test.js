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
		gameState.tower = 54;
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
		// When passing full config, startGame uses initializeGame which sets state to 'options'
		startGame(mockPlayer, mockGameConfig, {
			difficulty: 3,
			initialDamage: false
		});

		expect(gameState.round).toBe(1);
		expect(gameState.player).toStrictEqual(mockPlayer);
		expect(gameState.player.name).toBe(mockPlayer.name);
		expect(gameState.deck).toBeDefined();
		expect(gameState.deck.length).toBe(52);
		// initializeGame sets state to 'options' (initial state)
		expect(gameState.state).toBe('options');
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

	// Test rollForTasks
	test('rollForTasks', async () => {
		// Set initial state for this test
		gameState.state = 'rollForTasks';

		// Mock the getRandomNumber function
		gameState.getRandomNumber = vi.fn(() => 5);

		const result = await rollForTasks();

		// Assert that the tokens in the gameState are updated correctly
		expect(gameState).toBeDefined();
		expect(result).toBe(5);
		expect(gameState.cardsToDraw).toBe(5);
		// rollForTasks() no longer transitions state - it just updates cardsToDraw
		expect(gameState.state).toBe('rollForTasks');

		// confirmTaskRoll() transitions to drawCard
		confirmTaskRoll();
		expect(gameState.state).toBe('drawCard');
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
	// Test failureCheck
	describe('failureCheck', () => {
		test('should perform the failure check and update the game state (tower collapsed)', async () => {
			// Mock the getRandomNumber function
			gameState.getRandomNumber = vi.fn(() => 5);
			gameState.state = 'failureCheck';
			gameState.gameOver = false;
			gameState.diceRoll = 0;
			gameState.bonus = 1;
			gameState.tower = 3;
			gameState.cardsToDraw = 0;
			gameState.log = [];
			gameState.round = 1;
			gameState.config = {
				labels: {
					failureCheckLoss: 'Custom Loss Label'
				}
			};

			const result = await failureCheck();

			expect(result).toBe(5);
			expect(gameState.diceRoll).toBe(result);
			expect(gameState.tower).toBe(0);
			expect(gameState.status).toBe('Custom Loss Label');
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
		});

		test('should perform the failure check and update the game state (tower not collapsed)', async () => {
			// Mock the getRandomNumber function
			gameState.getRandomNumber = vi.fn(() => 2);
			gameState.state = 'failureCheck';
			gameState.gameOver = false;
			gameState.diceRoll = 0;
			gameState.bonus = 1;
			gameState.tower = 5;
			gameState.cardsToDraw = 1;
			gameState.log = [];
			gameState.round = 1;
			gameState.config = {};

			const result = await failureCheck();

			expect(result).toBe(2);
			expect(gameState.diceRoll).toBe(result);
			expect(gameState.tower).toBe(4); // 5 - (2 - 1) = 4
			expect(gameState.gameOver).toBe(false);
			expect(gameState.state).toBe('drawCard');
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

	//Test successCheck
	describe('successCheck', () => {
		test('should transition to finalDamageRoll when all tokens removed', async () => {
			// Mock the getRandomNumber function
			gameState.getRandomNumber = vi.fn(() => 6);
			const initialState = {
				diceRoll: 0,
				tokens: 1,
				state: 'successCheck',
				bonus: 0,
				config: {
					difficulty: 0,
					labels: {
						successCheckWin: 'Custom Win Label'
					}
				}
			};

			Object.assign(gameState, initialState);

			const roll = await successCheck();

			expect(roll).toBe(6);
			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tokens).toBe(0);
			expect(gameState.win).toBe(false); // Not won yet - must pass final damage roll
			expect(gameState.gameOver).toBe(false); // Not over yet
			expect(gameState.state).toBe('finalDamageRoll');
		});

		test('should perform the success check and update the game state (failure)', async () => {
			// Mock the getRandomNumber function
			gameState.getRandomNumber = vi.fn(() => 4);
			gameState.state = 'successCheck';
			gameState.diceRoll = 0;
			gameState.tokens = 2;
			gameState.win = false;
			gameState.gameOver = false;
			gameState.bonus = 0;
			gameState.config = {
				difficulty: 1,
				labels: {}
			};

			const roll = await successCheck();

			expect(roll).toBe(4);
			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tokens).toBe(2);
			expect(gameState.win).toBe(false);
			expect(gameState.gameOver).toBe(false);
			expect(gameState.state).toBe('startRound');
		});
	});

	// Test restartGame
	test('restartGame', () => {
		const player = { name: 'John Doe' };
		const options = { difficulty: 1, initialDamage: false };
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
		expect(gameState.config.options).toStrictEqual(options);
		// restartGame uses initializeGame which sets state to 'options'
		expect(gameState.state).toBe('options');
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
