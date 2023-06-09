import { GameLabels } from './GameLabels.js';
import { GameOptions } from './GameOptions.js';

/**
 * This class encapsulates the game settings derived from a YAML configuration file.
 * It provides all the configurable properties required by the game.
 */
export class GameSettings {
	/**
	 * Create a GameSettings.
	 * @param {Object} config - The YAML configuration.
	 */
	constructor(config) {
		/** @property {boolean} loaded - Whether the game settings have been loaded.	 */
		this.loaded = false;

		/** @property {string} title - The game's main title. */
		this.title = config.title;

		/** @property {string} subtitle - The game's subtitle. */
		this.subtitle = config.subtitle;

		/** @property {string} introduction - The Markdown file containing the game's introduction. */
		this.introduction = config.introduction;

		/** @property {string} stylesheet - The CSS file to style the game. */
		this.stylesheet = config.stylesheet;

		/** @property {Array} deck - The deck of cards represented as an array of strings. */
		this.deck = config.deck;

		/**
		 * @property {GameOptions} options - Various gameplay options.
		 */
		this.options = new GameOptions(config.options);

		/** @property {GameLabels} labels - The UI labels used in the game. */
		this.labels = new GameLabels(config.labels);
	}
}
