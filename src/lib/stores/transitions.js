import { GAME_STATES as S } from '../constants/gameStates.js';

/**
 * Pure state transition graph for the game
 * Defines all valid state transitions using state constants
 */
export const transitionGraph = {
	[S.LOAD_GAME]: [S.SHOW_INTRO],
	[S.SHOW_INTRO]: [S.INITIAL_DAMAGE_ROLL],
	[S.INITIAL_DAMAGE_ROLL]: [S.START_ROUND],
	[S.START_ROUND]: [S.ROLL_FOR_TASKS],
	[S.ROLL_FOR_TASKS]: [S.DRAW_CARD],
	[S.DRAW_CARD]: [S.FAILURE_CHECK, S.DRAW_CARD, S.END_TURN, S.LOG, S.SUCCESS_CHECK, S.GAME_OVER],
	[S.FAILURE_CHECK]: [S.DRAW_CARD, S.END_TURN, S.LOG, S.SUCCESS_CHECK, S.GAME_OVER],
	[S.END_TURN]: [S.LOG],
	[S.LOG]: [S.START_ROUND],
	[S.SUCCESS_CHECK]: [S.LOG, S.FINAL_DAMAGE_ROLL, S.GAME_OVER],
	[S.FINAL_DAMAGE_ROLL]: [S.FINAL_LOG, S.GAME_OVER],
	[S.GAME_OVER]: [S.FINAL_LOG],
	[S.FINAL_LOG]: [S.EXIT_GAME],
	[S.EXIT_GAME]: [S.LOAD_GAME],
	[S.ERROR_SCREEN]: [S.LOAD_GAME]
};

/**
 * Get valid next states for a given state
 * @param {string} state - Current state
 * @returns {string[]} Array of valid next states
 */
export function getValidNextStates(state) {
	return transitionGraph[state] || [];
}

/**
 * Check if a transition is valid
 * @param {string} from - Current state
 * @param {string} to - Target state
 * @returns {boolean} True if transition is valid
 */
export function isValidTransition(from, to) {
	const validStates = transitionGraph[from];
	return validStates?.includes(to) || to === S.EXIT_GAME || to === S.ERROR_SCREEN;
}
