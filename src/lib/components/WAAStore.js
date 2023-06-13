// Write a svelte component to allow a player to play the
// wretched and alone solor RPG. Be sure to include all possible
// win and loss conditions. Also write the store in such a way that
// the play must click to draw cards and roll dice. instead of using
// the block tower, implement a new mechanic that is statistically similiar
// but uses six or 20 sided dice
import { writable, get, derived } from 'svelte/store';
import { ConfigurationLoader } from "../configuration/ConfigurationLoader.js";
import { StateMachine, transitions } from './WAAStateMachine.js';

const configLoader = new ConfigurationLoader();

// Define the initial state of the game
const initialState = {
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
	diceRoll: 0 // Dice roll result
};
const stateMachine = new StateMachine('loadGame', transitions);

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

export const gameStylesheet = writable('');

/** @property {GameSettings} gameConfig */
export let gameConfig = {};
export const gameStore = writable({ ...initialState });
export const currentEvents = derived([gameStore], ([$gameStore]) => {
	console.log('currentEvents');
	return $gameStore.log.filter((l) => l.round == $gameStore.round);
});

export const currentScreen = writable('loadGame');

export const nextScreen = (action) => {
	currentScreen.update((state) => {
		if (action) stateMachine.next(action);

		state = stateMachine.state;
		return state;
	});
};

// Define actions
export const loadSystemConfig = (systemConfig) => {
	gameConfig = configLoader.loadSystemSettings(systemConfig);
	//gameConfig = { ...systemConfig };
};
export const loadGame = async (config, player) => {
	if (!config || !config.url) throw new Error('Must provide a valid game configuration and url');

	//Load configuration
	gameConfig = await configLoader.loadGameSettings(config);
	gameStylesheet.set(gameConfig.stylesheet);
	
	//ToDo: add user settings screen
	stateMachine.next('options');
	startGame(player, config.options);
};

export const startGame = (player, options = {}) => {
	if (!player || !player.name) throw new Error('Must provide a valid player');

	//Set game options
	// gameConfig.options = { ...gameConfig.options, ...options };
	// gameConfig.options.difficulty = options?.difficulty ?? 0;
	gameConfig = configLoader.loadUserSettings(options);


	gameStore.update((state) => {
		state = { ...initialState };
		state.round = 1;
		state.player = player;

		state.deck = [...gameConfig.deck];

		if (gameConfig.options.difficulty === 0) {
			state.aceOfHeartsRevealed = true;
			state.deck = [...state.deck.filter((c) => c.card != 'A' && c.suit != 'hearts')];
		}

		//Shuffledeck
		state.deck = shuffle(state.deck);

		//Start intro
		state.state = stateMachine.next('intro');

		return state;
	});
	nextScreen();
};

export const startRound = () => {
	gameStore.update((state) => {
		console.log('starting round', state.round, get(currentScreen));
		state.round += 1;
		state.state = stateMachine.next('rollForTasks');
		nextScreen();
		return state;
	});
};

export const rollForTasks = async (result) => {
	//Roll dice
	//let result = await rollDice();
	gameStore.update((state) => {
		state.cardsToDraw = result;
		//Go to draw cards
		state.currentCard = null;
		state.state = stateMachine.next('drawCard');
		console.log('task this round', state.cardsToDraw);
		//nextScreen();
		return state;
	});
	return result;
};

export const confirmTaskRoll = () => {
	nextScreen();
};

export const drawCard = () => {
	gameStore.update((state) => {
		if (state.deck.length === 0) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
			nextScreen();
			return state;
		}

		// Draw a card
		//const cardIndex = Math.floor(Math.random() * state.deck.length);
		const card = state.deck.pop(); // state.deck.splice(cardIndex, 1)[0];
		state.currentCard = card;
		console.debug('drew card', card);

		// Decrease the number of cards to draw
		state.cardsToDraw -= 1;

		// Add the card to the log
		card.round = state.round;
		state.log.push(card);

		// Check if the card is a King
		if (card.card === 'K') {
			state.kingsRevealed += 1;
		}

		// Check if the card is an Ace
		if (card.card === 'A') {
			state.bonus += 1;
			if (card.suit === 'hearts') state.aceOfHeartsRevealed = true;
		}

		// Check if the game is over
		if (state.kingsRevealed === 4) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
			return state;
		}

		// If the card is odd, set the state to 'failureCheck'
		if (parseInt(card.card) % 2 !== 0) {
			stateMachine.next('failureCheck');
		} else if (state.cardsToDraw > 0) {
			stateMachine.next('drawCard');
		} else {
			stateMachine.next('log');
		}
		state.state = stateMachine.state;
		//nextScreen();
		return state;
	});
};

export const confirmCard = () => {
	gameStore.update((state) => {
		state.currentCard = null;
		return state;
	});
	nextScreen();
};

export const failureCheck = async (result) => {
	// Roll a die
	//let roll = await rollDice();

	//Very short game: roll = 20;

	result = 20;
	gameStore.update((state) => {
		if (state.gameOver) throw new Error('The game is over, stop playing with the tower!');
		state.diceRoll = result;

		// Calculate the number of blocks to remove
		const blocksToRemove = Math.max(result - state.bonus, 0);

		// Decrease the number of blocks in the tower
		state.tower -= blocksToRemove;

		console.log('current tower score', result, state.tower);
		// Check if the tower has collapsed
		if (state.tower <= 0) {
			state.tower = 0;
			state.status = gameConfig.labels?.failureCheckLoss ?? 'The tower has fallen';
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
	//nextScreen();
	return result;
};

export const confirmFailureCheck = () => {
	nextScreen();
};
export const recordRound = (journalEntry) => {
	if (journalEntry == null || journalEntry.text == null) {
		throw new Error('No journal entries provided for this round');
	}

	gameStore.update((state) => {
		journalEntry.round = state.round;
		journalEntry.dateRecorded = journalEntry.dateRecorded || new Date().toISOString();
		state.journalEntries.push(journalEntry);

		if (!state.gameOver) {
			if (state.aceOfHeartsRevealed) state.state = stateMachine.next('successCheck');
			else state.state = stateMachine.next('startRound');
			nextScreen();
		}
		return state;
	});
};

export const successCheck = async (roll) => {
	// Roll a die
	//const roll = await rollDice();
	console.log('success roll', roll);
	gameStore.update((state) => {
		//ToDo use random.org

		// Store the dice roll result
		state.diceRoll = roll;

		// Check if the roll is a 6
		if (roll === 6 || (gameConfig.difficulty > 0 && roll + state.bonus === 6)) {
			state.tokens -= 1;
		}

		// Check if the game is won
		if (state.tokens === 0) {
			state.win = true;
			state.status = gameConfig.labels?.successCheckWin ?? 'Salvation has arrived';
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
		} else {
			state.state = stateMachine.next('startRound');
		}

		return state;
	});

	return roll;
};

export const restartGame = () => {
	const currentState = get(gameStore);
	startGame(currentState.player, gameConfig.options);
};
export const exitGame = async () => {
	const currentState = get(gameStore);
	const newState = { ...initialState };
	newState.player = currentState.player;
	gameStore.set({ ...newState });
	gameConfig = {};
	gameStylesheet.set('');
	stateMachine.state = 'loadGame';
	nextScreen();
};
