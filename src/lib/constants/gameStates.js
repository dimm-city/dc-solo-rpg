/**
 * Game State Constants
 *
 * Centralized state names to avoid magic strings and typos.
 * Use these constants instead of raw strings throughout the codebase.
 *
 * @module gameStates
 */

/**
 * All possible game states
 * @enum {string}
 */
export const GAME_STATES = {
	/** Initial game loading state */
	LOAD_GAME: 'loadGame',

	/** Show game introduction/instructions */
	SHOW_INTRO: 'showIntro',

	/** Initial damage roll (SRD digital enhancement) */
	INITIAL_DAMAGE_ROLL: 'initialDamageRoll',

	/** Start a new round */
	START_ROUND: 'startRound',

	/** Roll d20 to determine number of cards to draw */
	ROLL_FOR_TASKS: 'rollForTasks',

	/** Draw a card from the deck */
	DRAW_CARD: 'drawCard',

	/** Failure check (stability loss from odd-ranked cards) */
	FAILURE_CHECK: 'failureCheck',

	/** End of turn state (legacy, may be unused) */
	END_TURN: 'endTurn',

	/** Journal entry screen */
	LOG: 'log',

	/** Salvation check (Ace of Hearts unlocks token removal) */
	SUCCESS_CHECK: 'successCheck',

	/** Final damage roll (legacy d6 system, deprecated in D20) */
	FINAL_DAMAGE_ROLL: 'finalDamageRoll',

	/** Game over state */
	GAME_OVER: 'gameOver',

	/** Final journal entry after game over */
	FINAL_LOG: 'finalLog',

	/** Exit game and return to game selection */
	EXIT_GAME: 'exitGame',

	/** Error screen state */
	ERROR_SCREEN: 'errorScreen'
};

/**
 * Helper to get state constant value by key
 * @param {string} key - State key (e.g., 'DRAW_CARD')
 * @returns {string} State value (e.g., 'drawCard')
 */
export function getStateValue(key) {
	return GAME_STATES[key];
}

/**
 * Helper to check if a value is a valid state
 * @param {string} value - State value to check
 * @returns {boolean} True if value is a valid state
 */
export function isValidState(value) {
	return Object.values(GAME_STATES).includes(value);
}
