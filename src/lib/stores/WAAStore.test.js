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
	test('drawCard - final king', () => {
		const card = { card: 'K', suit: 'hearts' };
		const initialState = {
			kingsRevealed: 3,
			cardsToDraw: 1,
			log: [],
			deck: [card]
		};
		services.stateMachine = new StateMachine('drawCard');
		gameStore.set({ ...initialState });
		drawCard();

		validateDrawCard(initialState, card);
	});

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
	  });

	  test('should draw a card and update the game state (ace of hearts)', () => {
		const card = { card: 'A', suit: 'hearts' };
		const initialState = {
		  state: 'drawCard',
		  kingsRevealed: 3,
		  cardsToDraw: 1,
		  log: [],
		  deck: [card],
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
		  deck: [],
		};
		services.stateMachine = new StateMachine('drawCard');
		gameStore.set({ ...initialState });
		drawCard();
	
		const updatedState = get(gameStore);
	
		expect(updatedState.gameOver).toBe(true);
		expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw );		
		expect(updatedState.bonus).toBe(initialState.bonus);
		expect(updatedState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
		expect(updatedState.tower).toBe(initialState.tower);
		expect(updatedState.state).toBe('gameOver');
	  });
	// Test failureCheck
	test('failureCheck', async () => {
		// Call failureCheck with a mock result
		// Assert that the tower in the gameStore is updated correctly
	});

	// Test recordRound
	test('recordRound', () => {
		// Call recordRound with a mock journalEntry
		// Assert that the journalEntry is added to the journalEntries in the gameStore
	});

	// Test successCheck
	test('successCheck', async () => {
		// Call successCheck with a mock roll
		// Assert that the tokens in the gameStore are updated correctly
	});

	// Test restartGame
	test('restartGame', () => {
		// Call restartGame
		// Assert that the gameStore is reset to the initial state
	});

	// Test exitGame
	test('exitGame', async () => {
		// Call exitGame
		// Assert that the gameStore is reset to the initial state
	});
});
function validateDrawCard(initialState, card) {
	const updatedState = get(gameStore);

	// Check if the current card is correct
	expect(updatedState.currentCard).toEqual(card);

	// Check if the cardsToDraw is decreased by 1
	expect(updatedState.cardsToDraw).toBe(initialState.cardsToDraw - 1);

	// Check if the log contains the drawn card
	expect(updatedState.log).toEqual([{ ...card, round: initialState.round }]);

	// Check if the kingsRevealed is incremented
	if (card.card === 'K') {
		expect(updatedState.kingsRevealed).toBe(initialState.kingsRevealed + 1);
	} else {
		expect(updatedState.kingsRevealed).toBe(initialState.kingsRevealed);
	}

	// Check if the bonus is updated correctly for an Ace
	if (card.card === 'A') {
		expect(updatedState.bonus).toBe(initialState.bonus + 1);
		if (card.suit === 'hearts') {
			expect(updatedState.aceOfHeartsRevealed).toBe(true);
		}
	} else {
		expect(updatedState.bonus).toBe(initialState.bonus);
		expect(updatedState.aceOfHeartsRevealed).toBe(initialState.aceOfHeartsRevealed);
	}

	// Check if the game state is updated correctly based on the drawn card
	if (card.card === 'K' && updatedState.kingsRevealed === 4) {
		expect(updatedState.gameOver).toBe(true);
	} else if (parseInt(card.card) % 2 !== 0) {
		// Odd card
		expect(updatedState.state).toBe('failureCheck');
	} else if (updatedState.cardsToDraw > 0) {
		expect(updatedState.state).toBe('drawCard');
	} else {
		expect(updatedState.state).toBe('log');
	}
}
