import { default as yaml } from 'js-yaml';
import { SystemSettings } from './SystemSettings.js';

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
		this.systemSettings = new SystemSettings(systemSettings);
		// mutable settings
		this.gameSettings = {};
		this.userSettings = {};
	}

	loadYaml(configYaml) {
		return yaml.load(configYaml);
	}

	// /**
	//  * Load system settings.
	//  * @param {SystemSettings} systemSettings - The initial system settings.
	//  */
	loadSystemSettings(systemSettings = {}) {
		// Freeze the systemSettings object to prevent modification
		this.systemSettings = new SystemSettings(systemSettings);
		return this.systemSettings;
	}

	/**
	 * Load game settings. These can override system settings.
	 * @param {string} gameConfigUrl - The URL to the game configuration file.
	 */
	async loadGameSettings(gameConfigUrl) {
		//if gameConfigUrl is null or not a string, return
		if (!gameConfigUrl || typeof gameConfigUrl !== 'string') {
			return;
		}

		//if config.url does not end with '/config.yml' add it to the end of the string
		if (!gameConfigUrl?.endsWith('config.yml')) {
			gameConfigUrl += gameConfigUrl.endsWith('/') ? 'config.yml' : '/' + 'config.yml';
		}

		let text = await readUrlAsText(gameConfigUrl);

		const configJson = this.loadYaml(text);

		//if configJson is not an object, throw an error
		if (!configJson || typeof configJson !== 'object') {
			throw new Error('Could not load config.yml');
		}

		//if config.deck is null, fetch it from config.url but replace 'config.yml' with deck.csv
		if (!configJson.deck) {
			const deckUrl = gameConfigUrl.replace('config.yml', 'deck.csv');

			//fetch deck csv from the deckUrl and convert it to a deck array

			const deckCsv = await readUrlAsText(deckUrl);

			if (deckCsv?.split) {
				try {
					const deckArray = deckCsv
						.split('\n')
						.map((line) => {
							const [card, suit, description, action] = line.split(',');
							return { card, suit, description: description?.replaceAll('"', ''), action };
						})
						.filter((line) => line.card && !line.card.includes('card'));
					configJson.deck = deckArray;
				} catch (error) {
					throw new Error('Could not load deck', error);
				}
			} //else throw new Error('deckCsv is not a string', deckCsv);
		}

		//if config.introduction ends with '.md', fetch it from config.url but replace 'config.yml' with the value of config.introduction
		if (!configJson.introduction || configJson.introduction?.endsWith('.md')) {
			const introductionUrl = gameConfigUrl.replace(
				'config.yml',
				configJson.introduction ?? 'intro.md'
			);

			//fetch introduction from the introductionUrl and convert it to a string
			const introductionResponse = await fetch(introductionUrl);
			const introduction = await introductionResponse.text();
			configJson.introduction = introduction;
		}

		//check to see if config.url + "/game.css" exits via a fetch call. if so, assign config.stylesheet to the value of config.url + "/game.css"
		const stylesheetUrl = gameConfigUrl.replace('config.yml', configJson.stylesheet ?? 'game.css');

		//fetch stylesheet from the stylesheetUrl and convert it to a string
		if (stylesheetUrl.startsWith('http')) {
			const stylesheetResponse = await fetch(stylesheetUrl);
			if (stylesheetResponse.status == 404) {
				configJson.stylesheet = '';
			} else {
				configJson.stylesheet = stylesheetUrl;
			}
			// } else if (existsSync(stylesheetUrl)) {
			// 	//const stylesheet = readFileSync(stylesheetUrl);
			// 	configJson.stylesheet = stylesheetUrl;
		} else {
			configJson.stylesheet = stylesheetUrl;
			console.error('stylesheetUrl', stylesheetUrl);
		}

		//console.debug('gameSettings', gameConfigUrl, this.systemSettings, configJson);

		// Merge system settings with game settings, overwriting system settings with game settings if necessary.
		// This is to allow game settings to overwrite system settings, but not vice versa.
		// This is to allow system settings to be changed by the user, but not changed by the game.

		this.gameSettings = { ...this.systemSettings, ...configJson };
		this.gameSettings.loaded = true;

		return this.gameSettings;
	}

	/**
	 * Load user settings. These can override both system and game settings.
	 * @param {GameOptions} options - The user settings.
	 */
	loadUserSettings(options = {}) {
		this.userSettings = { ...options };
		this.gameSettings.options = { ...this.gameSettings.options, ...options };

		if (this.gameSettings.options.difficulty == undefined) this.gameSettings.options.difficulty = 0;

		//console.debug('loadUserSettings', this.userSettings, this.gameSettings);
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
async function readUrlAsText(filePath) {
	let text;

	//if (filePath.startsWith('./') || filePath.startsWith('http')) {
	const response = await fetch(filePath);
	text = await response.text();
	//}

	if (!text?.split) console.warn('Loaded empty file:', filePath, text);
	return text;
}
