import { test, expect, describe } from 'vitest';
import { ConfigurationLoader } from './ConfigurationLoader.js';
import { SystemSettings } from './SystemSettings.js';
import { GameOptions } from './GameOptions.js';

describe('ConfigurationLoader', () => {
	// Test constructor
	test('constructor', () => {
		const loader = new ConfigurationLoader(new SystemSettings({}));
		// Assert that the loader is an instance of ConfigurationLoader
		expect(loader).toBeInstanceOf(ConfigurationLoader);

		// Assert that the systemSettings, gameSettings, and userSettings are initialized correctly
		expect(loader.systemSettings).toBeInstanceOf(SystemSettings);
		expect(loader.systemSettings.availableDiceThemes?.length == 6);
		expect(loader.gameSettings).toEqual({});
		expect(loader.userSettings).toEqual({});
	});

	// Test loadSystemSettings
	test('loadSystemSettings', () => {
		const loader = new ConfigurationLoader();

		// Call loadSystemSettings with the mock
		loader.loadSystemSettings({
			availableDiceThemes: [
				{
					name: 'default'
				}
			]
		});

		// Assert that the systemSettings are updated correctly
		expect(loader.systemSettings?.availableDiceThemes?.length).toBe(1);
		expect(loader.systemSettings?.availableDiceThemes?.[0]?.name).toBe('default');
	});

	// Test loadGameSettings
	test('loadGameSettings', async () => {
		// Mock fetch and yaml.load
		const originalFetch = global.fetch;
		const mockResponses = [
			{ text: () => Promise.resolve('configYaml') },
			{ text: () => Promise.resolve('deckCsv') },
			{ text: () => Promise.resolve('introduction') },
			{ status: 404 }
		];
		let callCount = 0;
		global.fetch = () => Promise.resolve(mockResponses[callCount++]);

		const loader = new ConfigurationLoader(new SystemSettings({}));

		const originalYamlLoad = loader.loadYaml;
		const exampleConfig = {
			deck: [{ card: 'A', suite: 'spades', description: 'card text' }],
			introduction: 'intro text',
			stylesheet: 'custom.css',
			labels: {
				introNextButtonText: 'Skip'
			}
		};
		loader.loadYaml = () => exampleConfig;

		// Call loadGameSettings with a mock URL
		await loader.loadGameSettings('http://example.com');

		// Assert that the gameSettings are updated correctly

		expect(loader.gameSettings.deck?.length).toBe(1);

		//Verify custom labels are loaded
		expect(loader.gameSettings.labels).toContain({ ...exampleConfig.labels });

		//Verify default labels are loaded
		//expect(loader.gameSettings.labels).toContain({ ...new GameLabels()});
		expect(loader.gameSettings.labels.introBackButtonText).toBe('Back');
		expect(loader.gameSettings.labels.introStartButtonText).toBe('Start');
		expect(loader.gameSettings.labels.introExitButtonText).toBe('Exit');
		expect(loader.gameSettings.labels.toolbarExitButtonText).toBe('Exit');
		expect(loader.gameSettings.labels.journalEntryHeader).toBe('Record your journal entry');
		expect(loader.gameSettings.labels.journalEntrySubHeader).toBe('Summary of events');
		expect(loader.gameSettings.labels.journalEntryNextButtonText).toBe('Continue');
		expect(loader.gameSettings.labels.journalEntrySaveButtonText).toBe('Record');
		expect(loader.gameSettings.labels.journalEntryRestartButtonText).toBe('Restart');
		expect(loader.gameSettings.labels.journalEntryExitButtonText).toBe('New Game');
		expect(loader.gameSettings.labels.rollForTasksHeader).toBe('Roll for tasks');
		expect(loader.gameSettings.labels.rollForTasksResultHeader).toBe('Click to continue');
		expect(loader.gameSettings.labels.drawCardButtonText).toBe('Draw Card');
		expect(loader.gameSettings.labels.successCheckHeader).toBe('Roll success check');
		expect(loader.gameSettings.labels.successCheckResultHeader).toBe('Click to continue');
		expect(loader.gameSettings.labels.failureCheckHeader).toBe('Roll failure check');
		expect(loader.gameSettings.labels.failureCheckLoss).toBe(
			'You have failed to complete your quest.'
		);
		expect(loader.gameSettings.labels.successCheckWin).toBe(
			'Congratulations! You have succeeded in your quest!'
		);
		expect(loader.gameSettings.labels.gameOverHeader).toBe('Game Over');
		expect(loader.gameSettings.labels.gameOverButtonText).toBe('Record your final log');
		expect(loader.gameSettings.labels.statusDisplayRoundText).toBe('Round: ');
		expect(loader.gameSettings.labels.healthMeterHeader).toBe('Health Meter');
		expect(loader.gameSettings.labels.healthMeterSvg).toBeNull();
		expect(loader.gameSettings.labels.failureCounterLoss).toBe(
			'You have failed suffer a catastrophic failure.'
		);

		// Restore original functions
		global.fetch = originalFetch;
		loader.loadYaml = originalYamlLoad;
	});
	// Test loadUserSettings
	test('loadUserSettings', () => {
		const loader = new ConfigurationLoader(new SystemSettings({}));
		// Call loadUserSettings with a mock options object
		loader.loadUserSettings(
			new GameOptions({
				dice: 'default'
			})
		);
		// Assert that the userSettings and gameSettings.options are updated correctly
		expect(loader.userSettings).toEqual({ dice: 'default', difficulty: 0 });
	});

	// Test getConfigValue
	test('getConfigValue', () => {
		const loader = new ConfigurationLoader(
			new SystemSettings({
				gameConfigUrl: 'http://example.com/config.yaml'
			})
		);

		// Call getConfigValue with a key
		loader.getConfigValue('gameConfigUrl');

		// Assert that the correct value is returned
		expect(loader.getConfigValue('gameConfigUrl')).toEqual('http://example.com/config.yaml');
	});

	// Test getAllSettings
	test('getAllSettings', () => {
		// Set some settings
		// Call getAllSettings

		const configLoader = new ConfigurationLoader(
			new SystemSettings({
				availableDiceThemes: []
			})
		);
		configLoader.loadGameSettings('');
		configLoader.loadUserSettings(
			new GameOptions({
				dice: 'default'
			})
		);
		// Assert that the correct merged settings object is returned

		const allSettings = configLoader.getAllSettings();
		expect(allSettings.availableDiceThemes).toEqual([]);
		expect(allSettings.options.dice).toEqual('default');
	});
});
