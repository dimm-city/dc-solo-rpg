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
 *   Tasks       "Rolled 17 · Draw 5 cards"
 *   Salvation   "Rolled 18 · −1 token · 9 left"
 *               "Rolled 2 · needed 14+ · +1 token · 11 left"
 *               "Automatic · −1 token · 9 left"
 */

import { calculateStabilityLoss, calculateSalvationResult } from '../services/d20Mechanics.js';

export const LUCID_NOTE = 'Lucid: your next roll keeps the higher of two dice';
export const SURREAL_NOTE = 'Surreal: your next roll keeps the lower of two dice';

const SEP = ' · ';
const MINUS = '−';

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "Natural 20" / "Natural 1" / "Rolled N" */
const rolled = (roll) => (roll === 20 || roll === 1 ? `Natural ${roll}` : `Rolled ${roll}`);

/**
 * Result line for a Stability check (also the initial instability roll)
 * @param {number} roll - Kept d20 value
 * @param {number} towerBefore - Stability before the result was applied
 * @param {number} towerAfter - Stability after the result was applied
 * @param {number} [max=20] - Stability cap
 */
export function formatStabilityResult(roll, towerBefore, towerAfter, max = 20) {
	const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(roll);
	const parts = [];

	if (gainedLucid) {
		const gained = Math.min(towerBefore + optionalGain, max) - towerBefore;
		parts.push(rolled(roll), gained > 0 ? `+${gained} Stability` : 'Stability already full');
		parts.push(LUCID_NOTE);
	} else if (gainedSurreal) {
		parts.push(rolled(roll), `${MINUS}${loss} Stability`, SURREAL_NOTE);
	} else {
		parts.push(
			rolled(roll),
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
 */
export function formatTaskResult(roll, cards) {
	const parts = [rolled(roll), `Draw ${count(cards, 'card')}`];
	if (roll === 20) parts.push(LUCID_NOTE);
	if (roll === 1) parts.push(SURREAL_NOTE);
	return parts.join(SEP);
}

/**
 * Result line for a Salvation check
 * @param {number} roll - Kept d20 value
 * @param {number} threshold - From getSalvationThreshold (0 = automatic)
 * @param {number} tokensAfter - Tokens left after the result was applied
 */
export function formatSalvationResult(roll, threshold, tokensAfter) {
	const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold);
	const change = `${tokenChange < 0 ? MINUS : '+'}${count(Math.abs(tokenChange), 'token')}`;
	const parts = [];

	if (threshold === 0) {
		parts.push('Automatic', change, `${tokensAfter} left`);
	} else {
		parts.push(rolled(roll));
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
