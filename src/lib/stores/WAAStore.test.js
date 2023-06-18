import { test, describe, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { get } from 'svelte/store';
import {
	gameStore,
	configLoader,
	gameConfig,
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
	currentScreen
} from './WAAStore.js';
import { GameSettings } from '$lib/configuration/GameSettings.js';
import { SystemSettings } from '$lib/configuration/SystemSettings.js';
import { GameLabels } from '$lib/configuration/GameLabels.js';

// vi.stubGlobal(
// 	'fetch',
// 	vi.fn((url) => {
// 		console.log('Mocking fetch');
// 		return Promise.resolve({
// 			text: () => {
// 				console.log('mocking fetch text');
// 				// 	gameConfigUrl: './static/games/simple-example/config.yml'

// 				const buffer = readFileSync(url);
// 				const text = buffer.toString();
// 				return Promise.resolve(text);
// 			}
// 		});
// 	})
// );

// global.fetch = vi.fn(
// 	(url) =>
// 		new Promise(() => {
// 			return {
// 				json: () => new Promise((resolve) => resolve({})),
// 				text: () =>
// 					new Promise((resolve) => {
// 						// // Return a mock game configuration
// 						// const config = new GameSettings();
// 						// config.stylesheet = 'game.css';
// 						// return config;
// 						const buffer = readFileSync(url);
// 						const output = buffer.toString();

// 						console.log('MOCKED', url); //, output);
// 						return resolve(output);
// 					})
// 			};
// 		})
// );

global.fetch = vi.fn(); //(url) => {
// 	console.log('MOCKING FETCH', url);
// 	return Promise.resolve(createFetchResponse(url));

// });

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
// Mock ConfigurationLoader.loadSystemSettings and ConfigurationLoader.loadGameSettings

// vi.mock('./WAAStore.js', () => {
// 	return {
// 		configLoader: {
// 			loadSystemSettings: vi.fn(() => {
// 				return new SystemSettings({
// 					gameConfigUrl: 'test-game/config.yaml'
// 				});
// 			}),
// 			loadGameSettings: vi.fn((gameConfigUrl) => {
// 				console.log('MOCKED');
// 				// Return a mock game configuration
// 				const config = new GameSettings();
// 				config.stylesheet = 'game.css';
// 				return config;
// 			})
// 		}
// 	};
// });

describe('WAAStore', () => {
	beforeEach(() => {
		global.fetch.mockReset();
	});
	// Test loadSystemConfig
	test('loadSystemConfig', async () => {
		const gameUrl = './static/games/simple-example/config.yml';
		const systemConfig = {
			gameConfigUrl: gameUrl
		};

		fetch.mockImplementation((url) => createFetchResponse(url));

		try {
			await loadSystemConfig(systemConfig);
		} catch (error) {
			console.error('loadSystemConfig error', error);
			expect(error).toBe(undefined);
		}

		expect(fetch).toHaveBeenCalledWith(gameUrl);

		expect(gameConfig).toBeDefined();
		expect(gameConfig.stylesheet).toBe(gameUrl.replace('config.yml', 'game.css'));
		expect(gameConfig.deck?.length).toBe(52);
		expect(get(currentScreen)).toBe('options');

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
		// Call startGame with a mock player and options
		// Assert that the gameStore is updated correctly
	});

	// Test startRound
	test('startRound', () => {
		// Call startRound
		// Assert that the round number in the gameStore is incremented
	});

	// Test rollForTasks
	test('rollForTasks', async () => {
		// Call rollForTasks with a mock result
		// Assert that the cardsToDraw in the gameStore is updated correctly
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
