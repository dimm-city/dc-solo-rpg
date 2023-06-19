import { writable, derived, get } from 'svelte/store';
import { ConfigurationLoader } from '../configuration/ConfigurationLoader.js';
import { StateMachine, transitions } from './WAAStateMachine.js';

let getRandomNumber = () => {
	return Math.floor(Math.random() * 6) + 1;
};

function shuffle(array) {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}
export const nextScreen = (action) => {
	currentScreen.update((screen) => {
		if (action) stateMachine.next(action);

		screen = stateMachine.state;
		return screen;
	});
};
/**
 * Represents the initial state of the game.
 * @typedef {Object} InitialState
 * @property {object} config - The game configuration.
 * @property {object} player - The player object.
 * @property {Array} deck - The deck of cards.
 * @property {number} tokens - The number of tokens on the Ace of Hearts.
 * @property {number} kingsRevealed - The number of Kings revealed.
 * @property {boolean} aceOfHeartsRevealed - Indicates if the Ace of Hearts is revealed.
 * @property {boolean} gameOver - Indicates if the game is over.
 * @property {boolean} win - Indicates if the game is won.
 * @property {number} tower - The number of blocks in the tower.
 * @property {number} bonus - The bonus points.
 * @property {Array} log - The log of drawn cards.
 * @property {Array} journalEntries - The journal entries.
 * @property {number} round - The current round.
 * @property {string} state - The current state.
 * @property {string} status - The status message for the player.
 * @property {number} cardsToDraw - The number of cards to draw.
 * @property {object|null} currentCard - The current card that was drawn.
 * @property {number} diceRoll - The dice roll result.
 * @function getRandomNumber
 * @function
 */

/** Define the initial state of the game
 * @type {InitialState}
 */
const initialState = {
	config: {},
	player: null,
	deck: [
		//{ card: 'A', suit: 'hearts', description: 'Ace of Hearts description', action: "" }
		// ... add the rest of the cards with their descriptions and suits
	],
	tokens: 10, // Tokens on the Ace of Hearts
	kingsRevealed: 0, // Number of Kings revealed
	aceOfHeartsRevealed: false,
	gameOver: false, // Game over flag
	win: false, // Win flag
	tower: 54, // Number of blocks in the tower
	bonus: 0, // Bonus points
	log: [], // Log of drawn cards
	journalEntries: [],
	round: 0, // Current round
	state: 'loadGame', // Current state
	status: '', // Status message for the player
	cardsToDraw: 0, // Number of cards to draw
	currentCard: null, //The current card that was drawn
	diceRoll: 0, // Dice roll result,
	getRandomNumber: getRandomNumber
};

/**
 * Represents the game store.
 * @type {Writable<InitialState>}
 */
export const gameStore = writable(initialState);

export const services = {
	getRandomNumber: getRandomNumber
}

/**
 * Represents the game stylesheet store.
 * @type {Writable<string>}
 */
export const gameStylesheet = writable('');

/**
 * Represents the current events derived store.
 * @type {Readable<Array>}
 */
export const currentEvents = derived(gameStore, ($gameStore) => {
	return $gameStore.log.filter((l) => l.round === $gameStore.round);
});

/**
 * Represents the current screen store.
 * @type {Writable<string>}
 */
export const currentScreen = writable('loadGame');

/**
 * Represents the configuration loader instance.
 * @type {ConfigurationLoader}
 */
export const configLoader = new ConfigurationLoader();

/**
 * Represents the state machine instance.
 * @type {StateMachine}
 */
export const stateMachine = new StateMachine('loadGame', transitions);

/**
 * Loads the system configuration.
 * @param {object} systemConfig - The system configuration object.
 * @param {string} systemConfig.gameConfigUrl - The URL of the game configuration.
 * @returns {Promise<void>}
 */
export const loadSystemConfig = async (systemConfig) => {
	if (!systemConfig || !systemConfig.gameConfigUrl) {
		throw new Error('Must provide a valid game configuration and URL');
	}

	await configLoader.loadSystemSettings(systemConfig);
	const gameConfig = await configLoader.loadGameSettings(systemConfig.gameConfigUrl);

	gameStylesheet.set(gameConfig.stylesheet);

	gameStore.update((store) => {
		store.config = gameConfig;
		store.state = stateMachine.next('options');
		return store;
	});

	nextScreen();
};

/**
 * Starts the game.
 * @param {object} player - The player object.
 * @param {object} options - The game options.
 * @returns {void}
 */
export const startGame = (player, options = {}) => {
	if (!player || !player.name) {
		throw new Error('Must provide a valid player');
	}

	const gameConfig = configLoader.loadUserSettings(options);

	gameStore.update((state) => {
		state.config = gameConfig;
		state.round = 1;
		state.player = player;
		state.deck = [...state.config.deck];

		if (state.config.options.difficulty === 0) {
			state.aceOfHeartsRevealed = true;
			state.deck = state.deck.filter((c) => c.card !== 'A' && c.suit !== 'hearts');
		}

		state.deck = shuffle(state.deck);

		state.state = stateMachine.next('intro');

		return state;
	});

	nextScreen();
};

/**
 * Starts the next round.
 * @returns {void}
 */
export const startRound = () => {
	gameStore.update((state) => {
		state.round += 1;
		state.state = stateMachine.next('rollForTasks');
		nextScreen();
		return state;
	});
};

/**
 * Rolls for tasks.
 * @param {number} result - The result of the dice roll.
 * @returns {Promise<number>}
 */
export const rollForTasks = async (result) => {
	const roll = await services.getRandomNumber();

	gameStore.update((store) => {
		store.cardsToDraw = roll;
		store.currentCard = null;
		store.state = stateMachine.next('drawCard');
		return store;
	});
	return roll;
};

/**
 * Confirms the task roll.
 * @returns {void}
 */
export const confirmTaskRoll = () => {
	nextScreen();
};

/**
 * Draws a card.
 * @returns {void}
 */
export const drawCard = () => {
	gameStore.update((state) => {
		if (state.deck.length === 0) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
			nextScreen();
			return state;
		}

		const card = state.deck.pop();
		state.currentCard = card;
		state.cardsToDraw -= 1;

		card.round = state.round;
		state.log.push(card);

		if (card.card === 'K') {
			state.kingsRevealed += 1;
		}

		if (card.card === 'A') {
			state.bonus += 1;
			if (card.suit === 'hearts') {
				state.aceOfHeartsRevealed = true;
			}
		}

		if (state.kingsRevealed === 4) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
			return state;
		}

		if (parseInt(card.card) % 2 !== 0) {
			stateMachine.next('failureCheck');
		} else if (state.cardsToDraw > 0) {
			stateMachine.next('drawCard');
		} else {
			stateMachine.next('log');
		}
		state.state = stateMachine.state;
		return state;
	});
};

/**
 * Confirms the drawn card.
 * @returns {void}
 */
export const confirmCard = () => {
	gameStore.update((state) => {
		state.currentCard = null;
		return state;
	});
	nextScreen();
};

/**
 * Performs the failure check.
 * @param {number} result - The result of the dice roll.
 * @returns {Promise<number>}
 */
export const failureCheck = async (result) => {
	gameStore.update((state) => {
		if (state.gameOver) {
			throw new Error('The game is over, stop playing with the tower!');
		}
		state.diceRoll = result;

		const blocksToRemove = Math.max(result - state.bonus, 0);
		state.tower -= blocksToRemove;

		if (state.tower <= 0) {
			state.tower = 0;
			state.status = state.config.labels?.failureCheckLoss ?? 'The tower has fallen';
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
		} else {
			if (state.cardsToDraw > 0) {
				state.state = stateMachine.next('drawCard');
			} else {
				state.state = stateMachine.next('log');
			}
		}

		return state;
	});

	return result;
};

/**
 * Confirms the failure check.
 * @returns {void}
 */
export const confirmFailureCheck = () => {
	nextScreen();
};

/**
 * Records the round.
 * @param {object} journalEntry - The journal entry object.
 * @param {string} journalEntry.text - The journal entry text.
 * @param {string} [journalEntry.dateRecorded] - The date the entry was recorded.
 * @returns {void}
 */
export const recordRound = (journalEntry) => {
	if (journalEntry == null || journalEntry.text == null) {
		throw new Error('No journal entries provided for this round');
	}

	gameStore.update((state) => {
		journalEntry.round = state.round;
		journalEntry.dateRecorded = journalEntry.dateRecorded || new Date().toISOString();
		state.journalEntries.push(journalEntry);

		if (!state.gameOver) {
			if (state.aceOfHeartsRevealed) {
				state.state = stateMachine.next('successCheck');
			} else {
				state.state = stateMachine.next('startRound');
			}
			nextScreen();
		}
		return state;
	});
};

/**
 * Performs the success check.
 * @param {number} roll - The result of the dice roll.
 * @returns {Promise<number>}
 */
export const successCheck = async (roll) => {
	gameStore.update((state) => {
		state.diceRoll = roll;

		if (roll === 6 || (state.config.difficulty > 0 && roll + state.bonus === 6)) {
			state.tokens -= 1;
		}

		if (state.tokens === 0) {
			state.win = true;
			state.status = state.config.labels?.successCheckWin ?? 'Salvation has arrived';
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
		} else {
			state.state = stateMachine.next('startRound');
		}

		return state;
	});

	return roll;
};

/**
 * Restarts the game.
 * @returns {void}
 */
export const restartGame = () => {
	const currentState = get(gameStore);
	startGame(currentState.player, currentState.config.options);
};

/**
 * Exits the game.
 * @returns {void}
 */
export const exitGame = async () => {
	const currentState = get(gameStore);
	const newState = { ...initialState };
	newState.player = currentState.player;
	gameStore.set(newState);
	gameStylesheet.set('');
	nextScreen('loadGame');
};