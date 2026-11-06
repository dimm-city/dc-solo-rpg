/**
 * Result lines - one plain sentence that says what a roll just did.
 *
 * Built from the real roll and the real game values, shown at full contrast until
 * the player continues, and read out through the aria-live region.
 *
 * Formats:
 *   Stability   "Rolled 4 · −2 Stability · 14/20"
 *               "Rolled 13 · no Stability lost · 16/20"
 *               "Natural 20 · +1 Stability · Lucid: your next roll keeps the higher of two dice"
 *               "Natural 1 · −3 Stability · Surreal: your next roll keeps the lower of two dice"
 *               "Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to" (the fatal roll)
 *   Tasks       "Rolled 17 · Draw 5 cards"
 *   Salvation   "Rolled 18 · −1 token · 9 left"
 *               "Rolled 2 · needed 14+ · +1 token · 11 left"
 *               "Automatic · −1 token · 9 left"
 *
 * A roll made with two dice (Lucid or Surreal) names both and which one counted:
 *   "Rolled 19 (high of 19, 5) · Draw 5 cards"
 */

import { calculateStabilityLoss, calculateSalvationResult } from '../services/d20Mechanics.js';

export const LUCID_NOTE = 'Lucid: your next roll keeps the higher of two dice';
export const SURREAL_NOTE = 'Surreal: your next roll keeps the lower of two dice';
/** The roll button's label while the player is Lucid or Surreal (the only place it shows) */
export const LUCID_HINT = 'Lucid: 2 dice, keep high';
export const SURREAL_HINT = 'Surreal: 2 dice, keep low';
export const FATAL_NOTE = 'nothing left to hold on to';
/** The step button's label while the dice are on the table, on every step */
export const ROLLING_LABEL = 'Rolling…';

const SEP = ' · ';
const MINUS = '−';

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * @typedef {Object} Throw - How a roll was made (from gameState.rollWithModifiers)
 * @property {number[]} [dice] - Every die thrown, in throw order
 * @property {boolean} [wasLucid] - Two dice, the higher kept
 * @property {boolean} [wasSurreal] - Two dice, the lower kept
 */

/**
 * "(high of 19, 5)" for a two-dice roll, '' otherwise
 * @param {Throw} [thrown]
 */
export function describeDice(thrown = {}) {
	const { dice = [], wasLucid = false, wasSurreal = false } = thrown;
	if (dice.length !== 2 || !(wasLucid || wasSurreal)) return '';
	return `(${wasLucid ? 'high' : 'low'} of ${dice[0]}, ${dice[1]})`;
}

/** "Natural 20" / "Natural 1" / "Rolled N", plus the dice when two were thrown */
const rolled = (roll, thrown) => {
	const head = roll === 20 || roll === 1 ? `Natural ${roll}` : `Rolled ${roll}`;
	const dice = describeDice(thrown);
	return dice ? `${head} ${dice}` : head;
};

/**
 * Result line for a Stability check (also the initial instability roll)
 * @param {number} roll - Kept d20 value
 * @param {number} towerBefore - Stability before the result was applied
 * @param {number} towerAfter - Stability after the result was applied
 * @param {number} [max=20] - Stability cap
 * @param {Throw} [thrown] - The dice, for a two-dice roll
 */
export function formatStabilityResult(roll, towerBefore, towerAfter, max = 20, thrown) {
	const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(roll);
	const parts = [rolled(roll, thrown)];

	if (towerAfter <= 0) {
		// The fatal roll: no modifier note, the game is over
		parts.push(`${MINUS}${loss} Stability`, `0/${max}`, FATAL_NOTE);
	} else if (gainedLucid) {
		const gained = Math.min(towerBefore + optionalGain, max) - towerBefore;
		parts.push(gained > 0 ? `+${gained} Stability` : 'Stability already full', LUCID_NOTE);
	} else if (gainedSurreal) {
		parts.push(`${MINUS}${loss} Stability`, SURREAL_NOTE);
	} else {
		parts.push(
			loss > 0 ? `${MINUS}${loss} Stability` : 'no Stability lost',
			`${towerAfter}/${max}`
		);
	}
	return parts.join(SEP);
}

/**
 * Result line for the roll for tasks
 * @param {number} roll - Kept d20 value
 * @param {number} cards - Cards to draw
 * @param {Throw} [thrown] - The dice, for a two-dice roll
 */
export function formatTaskResult(roll, cards, thrown) {
	const parts = [rolled(roll, thrown), `Draw ${count(cards, 'card')}`];
	if (roll === 20) parts.push(LUCID_NOTE);
	if (roll === 1) parts.push(SURREAL_NOTE);
	return parts.join(SEP);
}

/**
 * Result line for a Salvation check
 * @param {number|null} roll - Kept d20 value (null when automatic)
 * @param {number} threshold - From getSalvationThreshold (0 = automatic)
 * @param {number} tokensAfter - Tokens left after the result was applied
 * @param {Throw} [thrown] - The dice, for a two-dice roll
 */
export function formatSalvationResult(roll, threshold, tokensAfter, thrown) {
	const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold);
	const change = `${tokenChange < 0 ? MINUS : '+'}${count(Math.abs(tokenChange), 'token')}`;
	const parts = [];

	if (threshold === 0) {
		parts.push('Automatic', change, `${tokensAfter} left`);
	} else {
		parts.push(rolled(roll, thrown));
		if (tokenChange > 0 && !gainedSurreal) parts.push(`needed ${threshold}+`);
		parts.push(change, `${tokensAfter} left`);
	}
	if (gainedLucid) parts.push(LUCID_NOTE);
	if (gainedSurreal) parts.push(SURREAL_NOTE);
	return parts.join(SEP);
}

/**
 * Label for the Salvation button: shows the target before the player rolls
 * @param {number} threshold - From getSalvationThreshold (0 = automatic)
 */
export function formatSalvationButton(threshold) {
	return threshold === 0
		? 'Remove a token · automatic'
		: `Roll to remove a token · need ${threshold}+`;
}

/**
 * The modifier the next roll will use, for the roll button's label (null when none)
 * @param {{ isLucid?: boolean, isSurreal?: boolean }} state
 */
export function formatModifierHint({ isLucid = false, isSurreal = false } = {}) {
	if (isLucid) return LUCID_HINT;
	if (isSurreal) return SURREAL_HINT;
	return null;
}

/**
 * The intro's closing line: what the player holds on to, and what winning takes.
 * @param {{ stability: number, tokens: number, aceRevealed: boolean }} game
 *   aceRevealed is true on Easy, where the Ace of Hearts starts revealed
 */
export function formatIntroGoal({ stability, tokens, aceRevealed }) {
	const hold = `Hold on to your ${stability} Stability.`;
	const clear =
		tokens === 1 ? 'clear the one token to escape.' : `clear all ${tokens} tokens to escape.`;
	return aceRevealed
		? `${hold} The Ace of Hearts is already revealed: ${clear}`
		: `${hold} Find the Ace of Hearts, then ${clear}`;
}
