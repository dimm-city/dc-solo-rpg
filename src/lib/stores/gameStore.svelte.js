/**
 * Core game state using Svelte 5 runes
 * This replaces the old gameStore and eliminates the StateMachine class
 */
import { transitionGraph } from './transitions.js';
import { rollDie, rollAdvantage, rollDisadvantage } from '../services/random.js';

// Helper for random number generation
// D20 system: returns 1-20
let getRandomNumber = () => {
	return rollDie(20);
};

/**
 * Roll with Lucid/Surreal modifiers
 * Lucid (advantage): Roll 2d20, keep highest
 * Surreal (disadvantage): Roll 2d20, keep lowest
 * @returns {Object} { roll: number, wasLucid: boolean, wasSurreal: boolean }
 */
let rollWithModifiers = () => {
	// Check for Lucid state (advantage)
	if (gameState.isLucid) {
		const roll = rollAdvantage(20);
		console.log(`[rollWithModifiers] Lucid roll (advantage): ${roll}`);
		gameState.isLucid = false; // Clear state after use
		return { roll, wasLucid: true, wasSurreal: false };
	}

	// Check for Surreal state (disadvantage)
	if (gameState.isSurreal) {
		const roll = rollDisadvantage(20);
		console.log(`[rollWithModifiers] Surreal roll (disadvantage): ${roll}`);
		gameState.isSurreal = false; // Clear state after use
		return { roll, wasSurreal: true, wasLucid: false };
	}

	// Normal roll
	const roll = rollDie(20);
	return { roll, wasLucid: false, wasSurreal: false };
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
	tower: 20, // D20 system: Stability starts at 20 (was 54 in d6 system)
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

	// D20 Mechanics: Lucid/Surreal states
	isLucid: false, // True if next roll should be 2d20 keep high
	isSurreal: false, // True if next roll should be 2d20 keep low

	// D20 Mechanics: Ace tracking (for salvation threshold)
	acesRevealed: 0, // 0-4, determines salvation success threshold

	// Pending state updates (deferred until animations complete)
	pendingUpdates: {
		diceRoll: null, // Pending dice roll result
		towerDamage: null, // Pending tower damage
		towerGain: null, // Pending tower gain (from natural 20 on stability checks)
		tokenChange: null, // Pending token change from success check
		aceChange: null, // Pending ace reveal (replaces bonusChange)
		kingsChange: null, // Pending king reveal
		kingsSuit: null, // Suit of pending king reveal
		isLucid: null, // Pending Lucid state (advantage for next roll)
		isSurreal: null // Pending Surreal state (disadvantage for next roll)
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
	getRandomNumber: getRandomNumber,
	rollWithModifiers: rollWithModifiers
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
	// Silently ignore self-transitions (already on target screen)
	if (gameState.state === newState) {
		return;
	}

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
