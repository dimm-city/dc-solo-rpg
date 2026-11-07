/**
 * Difficulty levels
 *
 * An author sets a game's default in the `.game.md` frontmatter (`difficulty: easy|normal|hard`,
 * Normal when absent); the player can override it in Settings, and an explicit `options`
 * argument to startGame beats both (see initializeGame).
 *
 * - Easy: the Normal rules, with the Ace of Hearts already revealed when the game starts, and
 *   the fourth Ace ends the game: survive its Stability check and you escape.
 * - Normal: tokens only ever fall (a missed Salvation roll adds none). The fourth Ace does not
 *   end the game: with four Aces each Salvation is a Stability check, then a token comes off,
 *   and the game is won by clearing every token.
 * - Hard: Normal, except that a missed Salvation roll adds a token (two on a natural 1).
 *
 * @module difficulty
 */

export const DIFFICULTY = Object.freeze({ EASY: 0, NORMAL: 1, HARD: 2 });

/** Frontmatter and settings names, lower case */
export const DIFFICULTY_BY_NAME = Object.freeze({
	easy: DIFFICULTY.EASY,
	normal: DIFFICULTY.NORMAL,
	hard: DIFFICULTY.HARD
});

/** @returns {boolean} whether value is one of the three levels */
export function isDifficulty(value) {
	return Object.values(DIFFICULTY).includes(value);
}

/**
 * Whether a game (or a save of one) plays by the Hard rules
 * @param {{ config?: { options?: { difficulty?: number } } } | null} [state] - gameState, or
 *   anything carrying the game's config
 */
export function isHardGame(state) {
	return state?.config?.options?.difficulty === DIFFICULTY.HARD;
}

/**
 * Whether the fourth Ace ends the game (Easy only): its Stability check is the last roll, and
 * the game is won if Stability holds. On Normal and Hard the fourth Ace only removes the
 * Salvation target: each Salvation is then a Stability check, and the token comes off if
 * Stability holds (see calculateAutomaticSalvation). The one source of truth for that rule.
 * @param {{ config?: { options?: { difficulty?: number } } } | null} [state] - gameState, or
 *   anything carrying the game's config
 */
export function fourthAceWins(state) {
	return state?.config?.options?.difficulty === DIFFICULTY.EASY;
}
