// Write a svelte component to allow a player to play the
// wretched and alone solor RPG. Be sure to include all possible
// win and loss conditions. Also write the store in such a way that
// the play must click to draw cards and roll dice. instead of using
// the block tower, implement a new mechanic that is statistically similiar
// but uses six or 20 sided dice
import { writable } from 'svelte/store';
import { StateMachine, transitions } from './WAAStateMachine.js';

// Define the initial state of the game
const initialState = {
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
	cardsToDraw: 1, // Number of cards to draw
	diceRoll: 0 // Dice roll result
};
const stateMachine = new StateMachine('loadGame', transitions);

async function rollDice(max = 6) {
	return Math.floor(Math.random() * max) + 1;
}

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

export let gameConfig = {};
export const gameStore = writable(initialState);

export const currentScreen = writable('loadGame');

export const next = () => {
	currentScreen.update((state) => {
		state = stateMachine.state;
		return state;
	});
};

// Define actions
export const loadGame = (config) => {
	//Load configuration
	this.gameConfig = config;
	stateMachine.next('options');
};

export const startGame = (options = {}) => {
	//Set game options
	this.gameConfig.options = options;
	this.gameConfig.difficulty = options?.difficulty ?? 0;

	gameStore.update((state) => {
		state.deck = [...this.gameConfig.deck];

		if (this.gameConfig.difficulty === 0) {
			state.aceOfHeartsRevealed = true;
			state.deck = [...state.deck.filter((c) => c.card != 'A' && c.suit != 'hearts')];
		}

		//Shuffledeck
		state.deck = shuffle(state.deck);

		//Start intro
		state.state = stateMachine.next('intro');
	});
};

export const startRound = () => {
	gameStore.update((state) => {
		state.round++;
		state.state = stateMachine.next('rollForTasks');
	});
};

export const rollForTasks = async () => {
	//Roll dice
	gameStore.update(async (state) => {
		state.cardsToDraw = await rollDice();
		//Go to draw cards
		state.state = stateMachine.next('drawCard');
		return state;
	});
};

export const drawCard = () => {
	gameStore.update((state) => {
		if (state.deck.length === 0) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
			return state;
		}

		// Draw a card
		//const cardIndex = Math.floor(Math.random() * state.deck.length);
		const card = state.deck.pop(); // state.deck.splice(cardIndex, 1)[0];

		// Add the card to the log
		card.round = state.currentRound;
		state.log.push(card);

		// Check if the card is a King
		if (card.card === 'K') {
			state.kingsRevealed += 1;
		}

		// Check if the card is an Ace
		if (card.card === 'A') {
			state.bonus += 1;
			if (card.suit === 'hears') state.aceOfHeartsRevealed = true;
		}

		// Check if the game is over
		if (state.kingsRevealed === 4) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
			return state;
		}

		// Decrease the number of cards to draw
		state.cardsToDraw -= 1;

		// If the card is odd, set the state to 'pullFromTower'
		if (parseInt(card.card) % 2 !== 0) {
			stateMachine.next('pullFromTower');
		} else if (state.cardsToDraw > 0) {
			stateMachine.next('drawCard');
		} else {
			stateMachine.next('endTurn');
		}
		state.state = stateMachine.state;
		return state;
	});
};

export const pullFromTower = () => {
	gameStore.update(async (state) => {
		// Roll a die
		const roll = await rollDice();
		state.diceRoll = roll;

		// Calculate the number of blocks to remove
		const blocksToRemove = Math.max(roll - state.bonus, 0);

		// Decrease the number of blocks in the tower
		state.tower -= blocksToRemove;

		// Check if the tower has collapsed
		if (state.tower <= 0) {
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
		}

		if (state.cardsToDraw > 0) {
			state.state = stateMachine.next('drawCard');
		} else {
			state.state = stateMachine.next('endTurn');
		}

		return state;
	});
};

export const recordRound = async (journalEntry) => {
	if (journalEntry == null || journalEntry.text == null) {
		throw new Error('No journal entries provided for this round');
	}

	gameStore.update(async (state) => {
		journalEntry.round = state.round;
		journalEntry.dateRecorded = journalEntry.dateRecorded || new Date().toISOString();
		state.journalEntries.push(journalEntry);

		if (state.aceOfHeartsRevealed) state.state = stateMachine.next('successCheck');
		else state.state = stateMachine.next('startRound');
		return state;
	});
	next();
};

export const successCheck = () => {
	gameStore.update(async (state) => {
		// Roll a die
		const roll = await rollDice();
		//ToDo use random.org

		// Store the dice roll result
		state.diceRoll = roll;

		// Check if the roll is a 6
		if (roll === 6) {
			//ToDo: add bonus of 5 or greater
			state.tokens -= 1;
		}

		// Check if the game is won
		if (state.tokens === 0) {
			state.win = true;
			state.gameOver = true;
			state.state = stateMachine.next('gameOver');
		} else {
			state.state = stateMachine.next('startRound');
		}

		return state;
	});
};
