/**
 * Core game state using Svelte 5 runes
 * This replaces the old gameStore and eliminates the StateMachine class
 */
import { GAME_STATES } from '../constants/gameStates.js';
import { transitionGraph } from './transitions.js';
import { logger } from '../utils/logger.js';
import { rollDie } from '../services/random.js';

// Helper for random number generation
// D20 system: returns 1-20
let getRandomNumber = () => {
	return rollDie(20);
};

/**
 * Roll the d20 for any check, with the Lucid/Surreal modifier.
 *
 * Every d20 roll in the game goes through here (the opening instability roll, Roll for
 * Tasks, the Stability check and Salvation), so a modifier always applies to, and is used
 * up by, the next roll, whichever roll that is.
 * Lucid (advantage): 2d20, keep the higher. Surreal (disadvantage): 2d20, keep the lower.
 * @returns {{ roll: number, dice: number[], wasLucid: boolean, wasSurreal: boolean }}
 *   roll is the kept die; dice lists every die thrown, in throw order
 */
let rollWithModifiers = () => {
	const wasLucid = gameState.isLucid;
	const wasSurreal = !wasLucid && gameState.isSurreal;
	gameState.isLucid = false;
	gameState.isSurreal = false;

	if (wasLucid || wasSurreal) {
		const dice = [rollDie(20), rollDie(20)];
		const roll = wasLucid ? Math.max(...dice) : Math.min(...dice);
		logger.debug(`[rollWithModifiers] ${wasLucid ? 'Lucid' : 'Surreal'} roll ${dice} → ${roll}`);
		return { roll, dice, wasLucid, wasSurreal };
	}

	const roll = rollDie(20);
	return { roll, dice: [roll], wasLucid: false, wasSurreal: false };
};

/**
 * Fresh per-run state: everything a new game (or leaving one) must reset.
 * Used by initializeGame and exitGame so no Lucid, Surreal or pending update
 * can leak from one game into the next.
 */
export function createRunState() {
	return {
		round: 0,
		cardsToDraw: 0,
		cardsDrawn: 0,
		deck: [],
		discard: [],
		log: [],
		currentCard: null,
		lastCard: null,
		taskRoll: null,
		diceRoll: 0,
		isLucid: false,
		isSurreal: false,
		acesRevealed: 0,
		pendingUpdates: createPendingUpdates(),
		kingsRevealed: 0,
		kingOfHearts: false,
		kingOfDiamonds: false,
		kingOfClubs: false,
		kingOfSpades: false,
		aceOfHeartsRevealed: false,
		gameOver: false,
		win: false,
		journalEntries: [],
		tower: 20,
		tokens: 10,
		status: ''
	};
}

/** Pending updates, applied after the dice or card animation completes */
export function createPendingUpdates() {
	return {
		diceRoll: null, // Pending dice roll result
		towerDamage: null, // Pending tower damage
		towerGain: null, // Pending tower gain (from natural 20 on stability checks)
		tokenChange: null, // Pending token change from success check
		aceChange: null, // Pending ace reveal
		kingsChange: null, // Pending king reveal
		kingsSuit: null, // Suit of pending king reveal
		gameOverCondition: null, // Pending game over (4th King), applied when the card is confirmed
		isLucid: null, // Pending Lucid state (advantage for next roll)
		isSurreal: null // Pending Surreal state (disadvantage for next roll)
	};
}

/**
 * Single source of truth for game state
 * Uses Svelte 5 $state rune for reactivity
 */
let gameState = $state({
	// Screen state
	state: GAME_STATES.LOAD_GAME,

	// Player state
	playerName: '',
	tower: 20, // D20 system: Stability starts at 20
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
	lastCard: null, // The card confirmed last (shown on the Stability check it causes)

	// Roll for Tasks result this round: { roll, dice, cards } (the card overlay reads it)
	taskRoll: null,

	// Roll state
	diceRoll: 0,

	// D20 Mechanics: Lucid/Surreal states
	isLucid: false, // True if next roll should be 2d20 keep high
	isSurreal: false, // True if next roll should be 2d20 keep low

	// D20 Mechanics: Ace tracking (for salvation threshold)
	acesRevealed: 0, // 0-4, determines salvation success threshold

	// Pending state updates (deferred until animations complete)
	pendingUpdates: createPendingUpdates(),

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

/**
 * Where the player is in this round's deal, for the card overlay:
 * "Rolled 17 · 5 cards" before the first card, "Card 2 of 5" after.
 * @returns {{ roll: number, dice: number[], total: number, current: number } | null}
 *   current is the number of cards drawn so far this round (0 before the first)
 */
export function getDealProgress() {
	const deal = gameState.taskRoll;
	if (!deal) return null;
	return {
		roll: deal.roll,
		dice: deal.dice,
		total: deal.cards,
		current: Math.max(0, deal.cards - gameState.cardsToDraw)
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
