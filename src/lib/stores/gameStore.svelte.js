/**
 * Core game state using Svelte 5 runes
 * This replaces the old gameStore and eliminates the StateMachine class
 */
import { transitionGraph } from './transitions.js';
import { convertD20ToD6 } from '../utils/diceConversion.js';

// Helper for random number generation - returns d20 value (1-20)
let getRandomNumber = () => {
	return Math.floor(Math.random() * 20) + 1;
};

/**
 * Single source of truth for game state
 * Uses Svelte 5 $state rune for reactivity
 */
let gameState = $state({
	// Screen state
	state: 'loadGame',

	// Player state
	playerName: '',
	tower: 54,
	tokens: 10,

	// Round state
	round: 0,
	cardsToDraw: 0,
	cardsDrawn: 0,

	// Card state
	deck: [],
	discard: [],
	log: [],
	currentCard: null,

	// Roll state
	diceRoll: 0,

	// Pending state updates (deferred until animations complete)
	pendingUpdates: {
		diceRoll: null, // Pending dice roll result
		towerDamage: null, // Pending tower damage
		tokenChange: null, // Pending token change from success check
		bonusChange: null, // Pending bonus change from aces
		kingsChange: null, // Pending king reveal
		kingsSuit: null // Suit of pending king reveal
	},

	// King tracking
	kingsRevealed: 0,
	kingOfHearts: false,
	kingOfDiamonds: false,
	kingOfClubs: false,
	kingOfSpades: false,

	// Ace of hearts tracking
	aceOfHeartsRevealed: false,

	// Game over state
	gameOver: false,
	win: false,
	bonus: 0,

	// Journal
	journalEntries: [],

	// Config
	config: null,
	originalConfig: null, // Pristine copy for restart
	systemConfig: null,
	stylesheet: '',

	// UI state
	status: '',
	player: null,

	// Functions
	getRandomNumber: getRandomNumber
});

/**
 * Computed values - exported as getter functions
 * In Svelte 5 runes mode, you can't export $derived from modules
 * Instead, export getter functions or access gameState directly in components
 */
export function getCurrentScreen() {
	return gameState.state;
}

// For backwards compatibility with components expecting currentScreen
export const currentScreen = {
	get value() {
		return gameState.state;
	},
	valueOf() {
		return gameState.state;
	},
	toString() {
		return gameState.state;
	}
};

export function getGameStats() {
	return {
		tower: gameState.tower,
		tokens: gameState.tokens,
		round: gameState.round,
		cardsRemaining: gameState.deck.length
	};
}

export function getHasWon() {
	return gameState.tokens === 0 && gameState.tower > 0;
}

export function getHasLost() {
	return gameState.tower <= 0 || gameState.kingsRevealed >= 4;
}

export function getCurrentEvents() {
	return gameState.log.filter((l) => l.round === gameState.round);
}

// For compatibility with old code
export const currentEvents = {
	get value() {
		return gameState.log.filter((l) => l.round === gameState.round);
	}
};

/**
 * Export reactive state for component use
 */
export { gameState };

/**
 * Validate state transition
 * Pure function - no side effects
 * @param {string} fromState - Current state
 * @param {string} toState - Target state
 * @throws {Error} If transition is invalid
 */
export function validateTransition(fromState, toState) {
	const validStates = transitionGraph[fromState];

	// Allow emergency exits
	if (toState === 'exitGame' || toState === 'errorScreen') {
		return true;
	}

	if (!validStates?.includes(toState)) {
		const validList = validStates?.join(', ') || 'none';
		throw new Error(
			`Invalid transition: ${fromState} → ${toState}\n` +
				`Valid transitions from ${fromState}: ${validList}`
		);
	}

	return true;
}

/**
 * Update screen state with validation
 * @param {string} newState - Target state
 */
export function transitionTo(newState) {
	validateTransition(gameState.state, newState);
	gameState.state = newState;
}

/**
 * Update game state
 * @param {Partial<typeof gameState>} updates - State updates
 */
export function updateGameState(updates) {
	Object.assign(gameState, updates);
}
