/**
 * Pure state transition graph for the game
 * Defines all valid state transitions
 */
export const transitionGraph = {
	loadGame: ['showIntro'],
	showIntro: ['rollForTasks'],
	startRound: ['rollForTasks'],
	rollForTasks: ['drawCard'],
	drawCard: ['failureCheck', 'drawCard', 'endTurn', 'log', 'gameOver'],
	failureCheck: ['drawCard', 'endTurn', 'log', 'gameOver'],
	endTurn: ['log'],
	log: ['successCheck', 'startRound'],
	successCheck: ['startRound', 'finalDamageRoll', 'gameOver'],
	finalDamageRoll: ['gameOver'],
	gameOver: ['finalLog'],
	finalLog: ['exitGame'],
	exitGame: ['loadGame'],
	errorScreen: ['loadGame']
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
	return validStates?.includes(to) || to === 'exitGame' || to === 'errorScreen';
}
