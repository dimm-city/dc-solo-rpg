import { default as yaml } from 'js-yaml';

/**
 * This class handles loading and retrieving configuration settings for a web-based game.
 * Settings are loaded in layers: system settings, game settings, and user settings.
 * System settings are loaded during application startup and cannot be overridden.
 * Game settings are loaded on game startup and can override system settings.
 * User settings are loaded when the user logs in, and can override both system and game settings.
 */
export class ConfigurationLoader {
	/**
	 * Create a ConfigurationLoader.
	 * @param {SystemSettings} systemSettings - The initial system settings.
	 */
	constructor(systemSettings = {}) {
		// immutable system settings
		this.systemSettings = this.loadSystemSettings(systemSettings);
		// mutable settings
		this.gameSettings = {};
		this.userSettings = {};
	}

	/**
	 * Load system settings.
	 * @param {SystemSettings} systemSettings - The initial system settings.
	 */
	loadSystemSettings(systemSettings = {}) {
		// If the systemSettings parameter is not provided, use the default values
		if (Object.keys(systemSettings).length === 0) {
			systemSettings = {
				stylesheet: 'game.css',
				options: {
					difficulty: 0,
					rollDuration: 3000,
					dice: {
						key: null,
						name: 'Pink Dreams',
						category: 'Custom Sets',
						foreground: 'white',
						background: ['#ff007c', '#df73ff', '#f400a1', '#df00ff', '#ff33cc'],
						outline: '#570000',
						texture: 'glass',
						description: 'Pink Dreams, for Ethan'
					}
				},
				labels: {
					introNextButtonText: 'Next',
					introBackButtonText: 'Back',
					introStartButtonText: 'Start',
					introExitButtonText: 'Exit',
					toolbarExitButtonText: 'Exit',
					journalEntryHeader: 'Record your journal entry',
					journalEntrySubHeader: 'Summary of events',
					journalEntryNextButtonText: 'Continue',
					journalEntrySaveButtonText: 'Record',
					journalEntryRestartButtonText: 'Restart',
					journalEntryExitButtonText: 'New Game',
					rollForTasksHeader: 'Roll for tasks',
					rollForTasksResultHeader: 'Click to continue',
					drawCardButtonText: 'Draw Card',
					successCheckHeader: 'Roll success check',
					successCheckResultHeader: 'Click to continue',
					failureCheckHeader: 'Failure Check',
					failureCheckLoss: 'The time machine has been damaged beyond repair',
					successCheckWin:
						'You have managed to repair the time machine and are able to return home!',
					gameOverHeader: 'Game Over',
					gameOverButtonText: 'Record your final log',
					statusDisplayRoundText: 'Round: ',
					healthMeterHeader: 'Health Meter',
					healthMeterSvg: null,
					failureCounterHeader: 'Failure Counters',
					failureCounterSvg: null
				}
			};
		}

		// Freeze the systemSettings object to prevent modification
		this.systemSettings = Object.freeze(systemSettings);

		return this.systemSettings;
	}

	/**
	 * Load game settings. These can override system settings.
	 * @param {GameSettings} gameSettings - The game settings.
	 */
	async loadGameSettings(gameSettings = {}) {
		//if config.url does not end with '/config.yml' add it to the end of the string
		if (!gameSettings.url.endsWith('config.yml')) {
			gameSettings.url += gameSettings.url.endsWith('/') ? 'config.yml' : '/' + 'config.yml';
		}
		const response = await fetch(gameSettings.url);

		const configYaml = await response.text();
		const configJson = yaml.load(configYaml);

		//if config.deck is null, fetch it from config.url but replace 'config.yml' with deck.csv
		if (!configJson.deck) {
			const deckUrl = gameSettings.url.replace('config.yml', 'deck.csv');

			//fetch deck csv from the deckUrl and convert it to a deck array
			const deckResponse = await fetch(deckUrl);
			const deckCsv = await deckResponse.text();
			const deckArray = deckCsv
				.split('\n')
				.map((line) => {
					const [card, suit, description, action] = line.split(',');
					return { card, suit, description: description?.replaceAll('"', ''), action };
				})
				.filter((line) => line.card && !line.card.includes('card'));
			configJson.deck = deckArray;
		}

		//if config.introduction ends with '.md', fetch it from config.url but replace 'config.yml' with the value of config.introduction
		if (!configJson.introduction || configJson.introduction?.endsWith('.md')) {
			const introductionUrl = gameSettings.url.replace(
				'config.yml',
				configJson.introduction ?? 'intro.md'
			);

			//fetch introduction from the introductionUrl and convert it to a string
			const introductionResponse = await fetch(introductionUrl);
			const introduction = await introductionResponse.text();
			configJson.introduction = introduction;
		}

		//check to see if config.url + "/game.css" exits via a fetch call. if so, assign config.stylesheet to the value of config.url + "/game.css"
		if (!configJson.stylesheet || configJson.stylesheet?.endsWith('.css')) {
			const stylesheetUrl = gameSettings.url.replace(
				'config.yml',
				configJson.stylesheet ?? 'game.css'
			);

			//fetch stylesheet from the stylesheetUrl and convert it to a string
			const stylesheetResponse = await fetch(stylesheetUrl);
			if (stylesheetResponse.status == 404) {
				configJson.stylesheet = '';
			} else {
				//const stylesheet = await stylesheetResponse.text();
				configJson.stylesheet = stylesheetUrl;
			}
		}

		gameSettings = Object.assign(gameSettings, configJson);
		console.log('gameSettings', gameSettings, configJson);

		// Merge system settings with game settings, overwriting system settings with game settings if necessary.
		// This is to allow game settings to overwrite system settings, but not vice versa.
		// This is to allow system settings to be changed by the user, but not changed by the game.

		this.gameSettings = { ...this.systemSettings, ...gameSettings };
		return this.gameSettings;
	}

	/**
	 * Load user settings. These can override both system and game settings.
	 * @param {GameOptions} userSettings - The user settings.
	 */
	loadUserSettings(userSettings = {}) {
		this.userSettings = { ...userSettings };
		this.gameSettings.options = { ...this.gameSettings.options, ...userSettings.options };

		if (this.gameSettings.options.difficulty == undefined) this.gameSettings.options.difficulty = 0;

		return this.gameSettings;
	}

	/**
	 * Get a configuration value, with user settings taking precedence over game settings, which in turn take precedence over system settings.
	 * @param {string} key - The key of the setting.
	 * @return {*} The configuration value.
	 */
	getConfigValue(key) {
		// return value based on priority: userSettings -> gameSettings -> systemSettings
		return this.userSettings[key] || this.gameSettings[key] || this.systemSettings[key];
	}

	/**
	 * Get all settings, with user settings taking precedence over game settings, which in turn take precedence over system settings.
	 * @return {Object} The merged settings.
	 */
	getAllSettings() {
		// Merge all settings with priority: userSettings -> gameSettings -> systemSettings
		return { ...this.systemSettings, ...this.gameSettings, ...this.userSettings };
	}
}
