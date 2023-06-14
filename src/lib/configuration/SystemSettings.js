import { GameLabels } from './GameLabels.js';

const defaultDiceThemes = [
	{
		name: 'default',
		foreground: 'white',
		background: '#1387b9',
		texture: 'glass',
		description: 'Default dice'
	},
	{
		name: 'Pink Dreams',
		category: 'Custom Sets',
		foreground: 'white',
		background: ['#ff007c', '#df73ff', '#f400a1', '#df00ff', '#ff33cc'],
		outline: '#570000',
		texture: 'glass',
		description: 'Pink Dreams, for Ethan'
	},
	{
		name: 'Fire',
		category: 'Damage Types',
		foreground: '#f8d84f',
		background: ['#f8d84f', '#f9b02d', '#f43c04', '#910200', '#4c1009'],
		outline: 'black',
		texture: 'fire',
		description: 'Fire'
	},
	{
		name: 'Ice',
		category: 'Damage Types',
		foreground: '#60E9FF',
		background: ['#214fa3', '#3c6ac1', '#253f70', '#0b56e2', '#09317a'],
		outline: 'black',
		texture: 'ice',
		description: 'Ice'
	},
	{
		name: 'Poison',
		category: 'Damage Types',
		foreground: '#D6A8FF',
		background: ['#313866', '#504099', '#66409e', '#934fc3', '#c949fc'],
		outline: 'black',
		texture: 'cloudy',
		description: 'Poison'
	},
	{
		name: 'Acid',
		category: 'Damage Types',
		foreground: '#A9FF70',
		background: ['#a6ff00', '#83b625', '#5ace04', '#69f006', '#b0f006', '#93bc25'],
		outline: 'black',
		texture: 'marble',
		description: 'Acid'
	}
];

/**
 * This class encapsulates the system settings for the game.
 * It includes properties like dice themes and available games.
 * @exports
 */
export class SystemSettings {
	/**
	 * Create a SystemSettings.
	 * @param {Array} diceThemes - The list of available dice themes.
	 * @param {Array} availableGames - The list of available games.
	 */
	constructor(config = {}) {
		/** @property {Array} availableDiceThemes - The available dice themes in the system. */
		this.availableDiceThemes = config.availableDiceThemes ?? defaultDiceThemes;

		/** @property {string} gameConfigUrl - The URL of the game config file. */
		this.gameConfigUrl = config.gameConfigUrl;

		/**
		 * @property {Object} player - The player object.
		 * @property {string} player.name - The player name.
		 */
		this.player = config.player;

		/**
		 * @property {number} rollDuration - The duration of a dice roll.
		 */
		this.rollDuration = config.rollDuration;

		this.labels = new GameLabels({
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
			failureCheckLoss: 'You have failed to complete your quest.',
			successCheckWin: 'Congratulations! You have succeeded in your quest!',
			gameOverHeader: 'Game Over',
			gameOverButtonText: 'Record your final log',
			statusDisplayRoundText: 'Round: ',
			healthMeterHeader: 'Health Meter',
			healthMeterSvg: null,
			failureCounterHeader: 'Failure Counters',
			failureCounterSvg: null
		});
	}
}
