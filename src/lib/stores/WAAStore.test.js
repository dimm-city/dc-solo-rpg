import { test, describe, expect, vi } from 'vitest';
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



// Mock ConfigurationLoader.loadSystemSettings and ConfigurationLoader.loadGameSettings

vi.mock('./WAAStore.js', () => {

	return {
		configLoader: {
			loadSystemSettings: vi.fn(() => {
				return new SystemSettings({
					gameConfigUrl: 'test-game/config.yaml'
				});
			}),
			loadGameSettings: vi.fn((gameConfigUrl) => {
				console.log('MOCKED');
				// Return a mock game configuration
				const config = new GameSettings();
				config.stylesheet = 'game.css';
				return config;
			})
		}
	};
});

describe('WAAStore', () => {
	// Test loadSystemConfig
	test('loadSystemConfig', async () => {
		const systemConfig = {
			gameConfigUrl: './static/games/simple-example/config.yml'
		};

		try {
			await loadSystemConfig(systemConfig);
		} catch (error) {
			expect(error).toBe(undefined);
		}

		expect(gameConfig).toBeDefined();
		expect(gameConfig.stylesheet).toBe('./static/games/simple-example/game.css');
		expect(gameConfig.deck?.length).toBe(52);
		expect(get(currentScreen)).toBe('options');
	
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
