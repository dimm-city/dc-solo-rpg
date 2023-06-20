import { test, describe, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { get } from 'svelte/store';
import {
	gameStore,
	loadSystemConfig,
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
	currentScreen,
	services,
	confirmTaskRoll
} from './WAAStore.js';
import { StateMachine } from './WAAStateMachine.js';

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
		gameStore.set({});
		currentScreen.set('');
	});

	// Test loadSystemConfig
	test('loadSystemConfig', async () => {
		const gameUrl = './static/games/simple-example/config.yml';
		const systemConfig = {
			gameConfigUrl: gameUrl
		};

		fetch.mockImplementation((url) => createFetchResponse(url));

		await loadSystemConfig(systemConfig);

		expect(fetch).toHaveBeenCalledWith(gameUrl);

		const store = get(gameStore);
		expect(store).toBeDefined();

		const gameConfig = store.config;
		expect(gameConfig).toBeDefined();
		expect(gameConfig.stylesheet).toBe(gameUrl.replace('config.yml', 'game.css'));
		expect(gameConfig.deck?.length).toBe(52);
		expect(store.state).toBeDefined();
		expect(store.state).toBe('options');

		expect(gameConfig.labels).toContain({
			failureCheckLoss: 'You have lost the game',
			successCheckWin: 'You have won the game!'
		});

		// expect(gameConfig.deck).toContain(
		// 	{
		// 		card: '"A"',
		// 		suit: '"hearts"',
		// 		description: 'Ace of Hearts: Salvation Mechanism',
		// 		action: ''
		// 	});
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

		const store = get(gameStore);
		expect(store.round).toBe(1);
		expect(store.player).toBe(mockPlayer);
		expect(store.player.name).toBe(mockPlayer.name);
		expect(store.deck).toBeDefined();
		expect(store.deck.length).toBe(52);
		expect(store.state).toBe('intro');
		expect(store.config.options).toBeDefined();
		expect(store.config.options.difficulty).toBe(3);
	});

	// Test startRound
	test('startRound', () => {
		//Write a test for startRound
		gameStore.set({
			round: 1,
			state: 'intro'
		});

		// Call startRound
		startRound();

		// Assert that the round number in the gameStore is incremented
		const store = get(gameStore);
		expect(store.round).toBe(2);
		expect(store.state).toBe('rollForTasks');
		expect(get(currentScreen)).toBe('rollForTasks');
	});

	// Test rollForTasks
	test('rollForTasks', async () => {
		gameStore.set({});
		services.getRandomNumber = () => 5;
		const result = await rollForTasks();

		// Assert that the tokens in the gameStore are updated correctly
		const store = get(gameStore);
		expect(store).toBeDefined();
		expect(result).toBe(5);
		expect(store.cardsToDraw).toBe(5);
		expect(store.state).toBe('drawCard');
		expect(get(currentScreen)).toBe('');

		confirmTaskRoll();
		expect(get(currentScreen)).toBe('drawCard');
	});

	// Test drawCard
	describe('drawCard', () => {		

		test('should draw a card and update the game state (even card)', () => {
			const card = { card: '2', suit: 'hearts' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card]
			};
			services.stateMachine = new StateMachine('drawCard');
			gameStore.set({ ...initialState });
			drawCard();

			const updatedState = get(gameStore);

			expect(updatedState.currentCard).toEqual(card);
			expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(updatedState.log).toEqual([{ ...card, round: initialState.round }]);
			expect(updatedState.kingsRevealed).toBe(initialState.kingsRevealed);
			expect(updatedState.bonus).toBe(initialState.bonus);
			expect(updatedState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(updatedState.tower).toBe(initialState.tower);
			expect(updatedState.state).toBe('log');
		});

		test('should draw a card and update the game state (odd card)', () => {
			const card = { card: '7', suit: 'diamonds' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card]
			};
			services.stateMachine = new StateMachine('drawCard');
			gameStore.set({ ...initialState });
			drawCard();

			const updatedState = get(gameStore);

			expect(updatedState.currentCard).toEqual(card);
			expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(updatedState.log).toEqual([{ ...card, round: initialState.round }]);
			expect(updatedState.kingsRevealed).toBe(initialState.kingsRevealed);
			expect(updatedState.bonus).toBe(initialState.bonus);
			expect(updatedState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(updatedState.tower).toBe(initialState.tower);
			expect(updatedState.state).toBe('failureCheck');
		});
		test('should draw a card and update the game state (final king)', () => {
			const card = { card: 'K', suit: 'hearts' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card],
				config: {
					labels: {
						kingsRevealed: 'King Revealed'
					}
				}
			};
			services.stateMachine = new StateMachine('drawCard');
			gameStore.set({ ...initialState });
			drawCard();

			const updatedState = get(gameStore);

			expect(updatedState.currentCard).toEqual(card);
			expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(updatedState.log).toEqual([{ ...card, round: initialState.round }]);
			expect(updatedState.kingsRevealed).toBe(initialState.kingsRevealed + 1);
			expect(updatedState.bonus).toBe(initialState.bonus);
			expect(updatedState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(updatedState.tower).toBe(initialState.tower);
			expect(updatedState.state).toBe('gameOver');
			expect(updatedState.gameOver).toBe(true);
			expect(updatedState.win).toBe(false);
			expect(updatedState.status).toBe(initialState.config.labels.failureCounterLoss);
		});

		test('should draw a card and update the game state (ace of hearts)', () => {
			const card = { card: 'A', suit: 'hearts' };
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: [card]
			};
			services.stateMachine = new StateMachine('drawCard');
			gameStore.set({ ...initialState });
			drawCard();

			const updatedState = get(gameStore);

			expect(updatedState.currentCard).toEqual(card);
			expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw - 1);
			expect(updatedState.log).toEqual([{ ...card, round: initialState.round }]);
			expect(updatedState.kingsRevealed).toBe(initialState.kingsRevealed);
			expect(updatedState.bonus).toBe(initialState.bonus + 1);
			expect(updatedState.aceOfHeartsRevealed).toBe(true);
			expect(updatedState.tower).toBe(initialState.tower);
			expect(updatedState.state).toBe('log');
		});

		test('should draw a card and update the game state (game over)', () => {
			const initialState = {
				state: 'drawCard',
				kingsRevealed: 3,
				cardsToDraw: 1,
				log: [],
				deck: []
			};
			services.stateMachine = new StateMachine('drawCard');
			gameStore.set({ ...initialState });
			drawCard();

			const updatedState = get(gameStore);

			expect(updatedState.gameOver).toBe(true);
			expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw);
			expect(updatedState.bonus).toBe(initialState.bonus);
			expect(updatedState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
			expect(updatedState.tower).toBe(initialState.tower);
			expect(updatedState.state).toBe('gameOver');
		});
	});
	// Test failureCheck
	describe('failureCheck', () => {
		test('should perform the failure check and update the game state (tower collapsed)', async () => {
			services.stateMachine = new StateMachine('failureCheck');
			services.getRandomNumber = () => 5;
			const initialState = {
				gameOver: false,
				diceRoll: 0,
				bonus: 1,
				tower: 3,
				cardsToDraw: 0,
				config: {
					labels: {
						failureCheckLoss: 'Custom Loss Label'
					}
				}
			};

			gameStore.set({ ...initialState });

			const result = await failureCheck();

			const updatedState = get(gameStore);

			expect(result).toBe(5);
			expect(updatedState.diceRoll).toBe(result);
			expect(updatedState.tower).toBe(0);
			expect(updatedState.status).toBe('Custom Loss Label');
			expect(updatedState.gameOver).toBe(true);
			expect(updatedState.state).toBe('gameOver');
		});

		test('should perform the failure check and update the game state (tower not collapsed)', async () => {
			services.stateMachine = new StateMachine('failureCheck');
			services.getRandomNumber = () => 2;
			const initialState = {
				gameOver: false,
				diceRoll: 0,
				bonus: 1,
				tower: 5,
				cardsToDraw: 1,
				config: {}
			};

			gameStore.set({ ...initialState });

			const result = await failureCheck(2, services);

			const updatedState = get(gameStore);

			expect(result).toBe(2);
			expect(updatedState.diceRoll).toBe(result);
			expect(updatedState.tower).toBe(initialState.tower - (result - initialState.bonus));
			expect(updatedState.status).toBeUndefined();
			expect(updatedState.gameOver).toBe(false);
			expect(updatedState.state).toBe('drawCard');
		});
	});

	describe('confirmFailureCheck', () => {
		test('should update the current screen', () => {
			const initialState = {
				state: 'failureCheck'
			};
			gameStore.set({ ...initialState });

			//Failure check game not over, no cards left to draw this round
			services.stateMachine = new StateMachine('failureCheck');
			services.stateMachine.next('log');

			confirmFailureCheck();

			const updatedState = get(currentScreen);

			expect(updatedState).toBe('log');
		});
	});

	// Test recordRound
	describe('recordRound', () => {
		test('should record the round and update the game state (ace of hearts revealed)', () => {
			const journalEntry = { text: 'Journal entry 1' };
			const initialState = {
				round: 1,
				aceOfHeartsRevealed: true,
				gameOver: false,
				journalEntries: [],
				state: 'log'
			};

			services.stateMachine = new StateMachine('log');

			gameStore.set({ ...initialState });

			recordRound(journalEntry, services);

			const updatedState = get(gameStore);

			expect(updatedState.journalEntries).toEqual([
				{ ...journalEntry, round: initialState.round, dateRecorded: expect.any(String) }
			]);
			expect(updatedState.state).toBe('successCheck');
		});

		test('should record the round and update the game state (ace of hearts not revealed)', () => {
			const journalEntry = { text: 'Journal entry 1' };
			const initialState = {
				round: 1,
				aceOfHeartsRevealed: false,
				gameOver: false,
				journalEntries: [],
				state: 'log'
			};
			services.stateMachine = new StateMachine('log');

			gameStore.set({ ...initialState });

			recordRound(journalEntry, services);

			const updatedState = get(gameStore);

			expect(updatedState.journalEntries).toEqual([
				{ ...journalEntry, round: initialState.round, dateRecorded: expect.any(String) }
			]);
			expect(updatedState.state).toBe('startRound');
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
			services.getRandomNumber = vi.fn().mockResolvedValueOnce(6);
			services.stateMachine = new StateMachine('successCheck');
			const initialState = {
				diceRoll: 0,
				tokens: 1,
				state: 'successCheck',
				config: {
					difficulty: 0,
					labels: {
						successCheckWin: 'Custom Win Label'
					}
				}
			};

			gameStore.set({ ...initialState });

			const roll = await successCheck(services);

			const updatedState = get(gameStore);

			expect(roll).toBe(6);
			expect(updatedState.diceRoll).toBe(roll);
			expect(updatedState.tokens).toBe(initialState.tokens - 1);
			expect(updatedState.win).toBe(true);
			expect(updatedState.status).toBe('Custom Win Label');
			expect(updatedState.gameOver).toBe(true);
			expect(updatedState.state).toBe('gameOver');
		});

		test('should perform the success check and update the game state (failure)', async () => {
			services.getRandomNumber = vi.fn().mockResolvedValueOnce(4);
			services.stateMachine = new StateMachine('successCheck');
			const initialState = {
				diceRoll: 0,
				tokens: 2,
				state: 'successCheck',
				win: false,
				gameOver: false,
				config: {
					difficulty: 1,
					labels: {}
				}
			};

			gameStore.set({ ...initialState });

			const roll = await successCheck(services);

			const updatedState = get(gameStore);

			expect(roll).toBe(4);
			expect(updatedState.diceRoll).toBe(roll);
			expect(updatedState.tokens).toBe(initialState.tokens);
			expect(updatedState.win).toBe(false);
			expect(updatedState.status).toBeUndefined();
			expect(updatedState.gameOver).toBe(false);
			expect(updatedState.state).toBe('startRound');
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
		services.stateMachine = new StateMachine('gameOver');
		gameStore.set({ ...currentState });

		//Can only restart a game that is in the gameOver state
		expect(currentState.state).toBe('gameOver');

		restartGame();

		const store = get(gameStore);
		expect(store.player).toBe(player);
		expect(store.config.options).toStrictEqual(options);
		expect(store.state).toBe('intro');
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

		gameStore.set({ ...currentState });

		exitGame();

		const store = get(gameStore);
		expect(store.player).toBe(player);
		expect(store.state).toBe('loadGame');
		expect(store.round).toBe(0);
	});
});
