import { test, describe, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { gameState } from './gameStore.svelte.js';
import {
	startGame,
	startRound,
	rollForTasks,
	drawCard,
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

	// loadSystemConfig has been removed - configuration now loaded via SvelteKit +page.server.js
	// This test is no longer needed as configuration loading is handled server-side
	test.skip('loadSystemConfig (deprecated - using SvelteKit server-side loading)', async () => {
		// Test skipped - functionality moved to routes/game/[slug]/+page.server.js
	});

	// Test startGame
	test('startGame', () => {
		const mockPlayer = {
			name: 'John Doe'
		};

		// Call the startGame action
		startGame(mockPlayer, {
			difficulty: 3
		});

		expect(gameState.round).toBe(1);
		expect(gameState.player).toBe(mockPlayer);
		expect(gameState.player.name).toBe(mockPlayer.name);
		expect(gameState.deck).toBeDefined();
		expect(gameState.deck.length).toBe(52);
		expect(gameState.state).toBe('intro');
		expect(gameState.config.options).toBeDefined();
		expect(gameState.config.options.difficulty).toBe(3);
	});

	// Test startRound
	test('startRound', async () => {
		//Write a test for startRound
		gameState.round = 1;
		gameState.state = 'intro';

		// Call startRound
		await startRound();

		// Assert that the round number in the gameState is incremented
		expect(gameState.round).toBe(2);
		expect(gameState.state).toBe('rollForTasks');
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
		await confirmTaskRoll();
		expect(gameState.state).toBe('drawCard');
	});

	// Test drawCard
	describe('drawCard', () => {
		test('should draw a card and update the game state (even card)', async () => {
			const card = { card: '2', suit: 'hearts' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card],
				round: 1
			};
			// Set initial state directly on gameState
			Object.assign(gameState, initialState);

			await drawCard();

			expect(gameState.currentCard).toEqual(card);
			expect(gameState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(initialState.kingsRevealed);
			expect(gameState.bonus).toBe(initialState.bonus);
			expect(gameState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(gameState.tower).toBe(initialState.tower);
			expect(gameState.state).toBe('log');
		});

		test('should draw a card and update the game state (odd card)', async () => {
			const card = { card: '7', suit: 'diamonds' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card],
				round: 1
			};
			// Set initial state directly on gameState
			Object.assign(gameState, initialState);

			await drawCard();

			expect(gameState.currentCard).toEqual(card);
			expect(gameState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(initialState.kingsRevealed);
			expect(gameState.bonus).toBe(initialState.bonus);
			expect(gameState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(gameState.tower).toBe(initialState.tower);
			expect(gameState.state).toBe('failureCheck');
		});
		test('should draw a card and update the game state (final king)', async () => {
			const card = { card: 'K', suit: 'hearts' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card],
				round: 1,
				config: {
					labels: {
						failureCounterLoss: 'Game Over - Too Many Kings'
					}
				}
			};
			// Set initial state directly on gameState
			Object.assign(gameState, initialState);

			await drawCard();

			expect(gameState.currentCard).toEqual(card);
			expect(gameState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(initialState.kingsRevealed + 1);
			expect(gameState.bonus).toBe(initialState.bonus);
			expect(gameState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(gameState.tower).toBe(initialState.tower);
			expect(gameState.state).toBe('gameOver');
			expect(gameState.gameOver).toBe(true);
			expect(gameState.win).toBe(false);
			expect(gameState.status).toBe(initialState.config.labels.failureCounterLoss);
		});

		test('should draw a card and update the game state (ace of hearts)', async () => {
			const card = { card: 'A', suit: 'hearts' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card],
				round: 1
			};
			// Set initial state directly on gameState
			Object.assign(gameState, initialState);

			await drawCard();

			expect(gameState.currentCard).toEqual(card);
			expect(gameState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(gameState.log).toEqual([expect.objectContaining({ ...card, round: 1 })]);
			expect(gameState.kingsRevealed).toBe(initialState.kingsRevealed);
			expect(gameState.bonus).toBe(initialState.bonus + 1);
			expect(gameState.aceOfHeartsRevealed).toBe(true);
			expect(gameState.tower).toBe(initialState.tower);
			expect(gameState.state).toBe('log');
		});

		test('should draw a card and update the game state (game over)', async () => {
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [],
				round: 1
			};
			// Set initial state directly on gameState
			Object.assign(gameState, initialState);

			await drawCard();

			expect(gameState.gameOver).toBe(true);
			expect(gameState.cardsToDraw).toBe(initialState.cardsToDraw);
			expect(gameState.bonus).toBe(initialState.bonus);
			expect(gameState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(gameState.tower).toBe(initialState.tower);
			expect(gameState.state).toBe('gameOver');
		});
	});
	// Test failureCheck
	describe('failureCheck', () => {
		test('should perform the failure check and update the game state (tower collapsed)', async () => {
			// Mock the getRandomNumber function
			gameState.getRandomNumber = vi.fn(() => 5);
			const initialState = {
				gameOver: false,
				diceRoll: 0,
				bonus: 1,
				tower: 3,
				cardsToDraw: 0,
				log: [],
				round: 1,
				config: {
					labels: {
						failureCheckLoss: 'Custom Loss Label'
					}
				}
			};

			Object.assign(gameState, initialState);

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
			const initialState = {
				gameOver: false,
				diceRoll: 0,
				bonus: 1,
				tower: 5,
				cardsToDraw: 1,
				log: [],
				round: 1,
				config: {}
			};

			Object.assign(gameState, initialState);

			const result = await failureCheck();

			expect(result).toBe(2);
			expect(gameState.diceRoll).toBe(result);
			expect(gameState.tower).toBe(initialState.tower - (result - initialState.bonus));
			expect(gameState.status).toBeUndefined();
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
		test('should record the round and update the game state (ace of hearts revealed)', async () => {
			const journalEntry = { text: 'Journal entry 1' };
			const initialState = {
				round: 1,
				aceOfHeartsRevealed: true,
				gameOver: false,
				journalEntries: [],
				state: 'log'
			};

			Object.assign(gameState, initialState);

			await recordRound(journalEntry);

			expect(gameState.journalEntries).toEqual([
				expect.objectContaining({ text: journalEntry.text, round: initialState.round })
			]);
			expect(gameState.state).toBe('successCheck');
		});

		test('should record the round and update the game state (ace of hearts not revealed)', async () => {
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

		test('should throw an error if no journal entry provided', () => {
			expect(() => recordRound(null)).toThrow('No journal entries provided for this round');
		});

		test('should throw an error if journal entry text is null', () => {
			const journalEntry = { text: null };

			expect(() => recordRound(journalEntry)).toThrow('No journal entries provided for this round');
		});
	});

	//Test successCheck
	describe('successCheck', () => {
		test('should perform the success check and update the game state (success)', async () => {
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
			expect(gameState.tokens).toBe(initialState.tokens - 1);
			expect(gameState.win).toBe(true);
			expect(gameState.status).toBe('Custom Win Label');
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
		});

		test('should perform the success check and update the game state (failure)', async () => {
			// Mock the getRandomNumber function
			gameState.getRandomNumber = vi.fn(() => 4);
			const initialState = {
				diceRoll: 0,
				tokens: 2,
				state: 'successCheck',
				win: false,
				gameOver: false,
				bonus: 0,
				config: {
					difficulty: 1,
					labels: {}
				}
			};

			Object.assign(gameState, initialState);

			const roll = await successCheck();

			expect(roll).toBe(4);
			expect(gameState.diceRoll).toBe(roll);
			expect(gameState.tokens).toBe(initialState.tokens);
			expect(gameState.win).toBe(false);
			expect(gameState.status).toBeUndefined();
			expect(gameState.gameOver).toBe(false);
			expect(gameState.state).toBe('startRound');
		});
	});

	// Test restartGame
	test('restartGame', () => {
		const player = { name: 'John Doe' };
		const options = { difficulty: 1 };
		const currentState = {
			player,
			state: 'gameOver',
			config: { options }
		};
		Object.assign(gameState, currentState);

		// Can only restart a game that is in the gameOver state
		expect(currentState.state).toBe('gameOver');

		restartGame();

		expect(gameState.player).toBe(player);
		expect(gameState.config.options).toStrictEqual(options);
		expect(gameState.state).toBe('intro');
	});

	// Test exitGame
	test('exitGame', async () => {
		const player = { name: 'John Doe' };
		const options = { difficulty: 1 };
		const currentState = {
			player,
			round: 5,
			deck: [{ card: '2', suit: 'hearts', description: 'Two of Hearts' }],
			config: { options }
		};

		Object.assign(gameState, currentState);

		await exitGame();

		expect(gameState.player).toBe(player);
		expect(gameState.state).toBe('exitGame');
		expect(gameState.round).toBe(0);
	});
});
