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
	services
} from './WAAStore.js';

// vi.mock('./WAAStore.js', () => {
// 	return {
// 		getRandomNumber: vi.fn(() => 5),
// 		failure: vi.fn()
// 	};
// });

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
	});

	// Test drawCard
	test('drawCard', () => {
		// Call drawCard
		// Assert that a card is drawn from the deck in the gameStore
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
