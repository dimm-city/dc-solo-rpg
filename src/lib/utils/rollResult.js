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
 *   The fourth Ace's check on Easy (the final roll: no modifier note, the game is over either way):
 *               "Rolled 13 · no Stability lost · 16/20 · you escape"
 *               "Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to" (the fatal roll)
 *   Tasks       "Rolled 17 · Draw 5 cards"
 *   Salvation   "Rolled 18 · −1 token · 9 left"
 *               "Rolled 9 · needed 14+ · no token lost"
 *               "Natural 1 · no token lost · Surreal: your next roll keeps the lower of two dice"
 *   Salvation on Hard, where a miss adds a token:
 *               "Rolled 9 · needed 14+ · +1 token · 11 left"
 *               "Natural 1 · +2 tokens · 12 left · Surreal: your next roll keeps the lower of two dice"
 *   Salvation with four Aces (Normal and Hard: a Stability check, then the token comes off):
 *               "Rolled 14 · no Stability lost · −1 token · 3 left"
 *               "Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to" (the fatal roll)
 *
 * A roll made with two dice (Lucid or Surreal) names both and which one counted:
 *   "Rolled 19 (high of 19, 5) · Draw 5 cards"
 */

import {
	calculateStabilityLoss,
	calculateSalvationResult,
	calculateAutomaticSalvation
} from '../services/d20Mechanics.js';

export const LUCID_NOTE = 'Lucid: your next roll keeps the higher of two dice';
export const SURREAL_NOTE = 'Surreal: your next roll keeps the lower of two dice';
/** The roll button's label while the player is Lucid or Surreal (the only place it shows) */
export const LUCID_HINT = 'Lucid: 2 dice, keep high';
export const SURREAL_HINT = 'Surreal: 2 dice, keep low';
export const FATAL_NOTE = 'nothing left to hold on to';
/** The fourth Ace's Stability check held (Easy): the game is won */
export const ESCAPE_NOTE = 'you escape';
/** The step button's label while the dice are on the table, on every step */
export const ROLLING_LABEL = 'Rolling…';
/** The roll button on the fourth Ace's Stability check (Easy), the last roll of the game */
export const FINAL_CHECK_LABEL = 'Roll for Stability · survive this and you escape';

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

/** What a Stability roll did, in words: "+1 Stability", "−2 Stability", "no Stability lost" */
function stabilityChange({ stabilityLoss, stabilityGain, stabilityBefore, max }) {
	if (stabilityGain > 0) {
		const gained = Math.min(stabilityBefore + stabilityGain, max) - stabilityBefore;
		return gained > 0 ? `+${gained} Stability` : 'Stability already full';
	}
	return stabilityLoss > 0 ? `${MINUS}${stabilityLoss} Stability` : 'no Stability lost';
}

/**
 * Result line for a Stability check (also the initial instability roll)
 * @param {number} roll - Kept d20 value
 * @param {number} towerBefore - Stability before the result was applied
 * @param {number} towerAfter - Stability after the result was applied
 * @param {number} [max=20] - Stability cap
 * @param {Throw} [thrown] - The dice, for a two-dice roll
 * @param {{ final?: boolean }} [options] - final: the fourth Ace's check on Easy, which the
 *   player has survived if any Stability is left (the game is over, so no modifier note)
 */
export function formatStabilityResult(
	roll,
	towerBefore,
	towerAfter,
	max = 20,
	thrown,
	{ final = false } = {}
) {
	const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(roll);
	const parts = [rolled(roll, thrown)];
	const change = stabilityChange({
		stabilityLoss: loss,
		stabilityGain: optionalGain,
		stabilityBefore: towerBefore,
		max
	});

	if (towerAfter <= 0) {
		// The fatal roll: no modifier note, the game is over
		parts.push(`${MINUS}${loss} Stability`, `0/${max}`, FATAL_NOTE);
	} else if (final) {
		// The fourth Ace's check held (Easy): the game is won
		parts.push(change, `${towerAfter}/${max}`, ESCAPE_NOTE);
	} else if (gainedLucid) {
		parts.push(change, LUCID_NOTE);
	} else if (gainedSurreal) {
		parts.push(change, SURREAL_NOTE);
	} else {
		parts.push(change, `${towerAfter}/${max}`);
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
 * Result line for a Salvation check. On Normal tokens only ever fall: a miss (a natural 1
 * included) loses none, and the line says so instead of a count. On Hard a miss adds tokens.
 * @param {number} roll - Kept d20 value
 * @param {number} threshold - From getSalvationThreshold (17, 14 or 11; 0 = four Aces: a
 *   Stability check, then the token)
 * @param {number} tokensAfter - Tokens left after the result was applied
 * @param {Throw} [thrown] - The dice, for a two-dice roll
 * @param {{ hard?: boolean, stabilityBefore?: number, max?: number }} [rules] - hard: the Hard
 *   rules; stabilityBefore and max: four Aces only, Stability before the roll and its cap
 */
export function formatSalvationResult(
	roll,
	threshold,
	tokensAfter,
	thrown,
	{ hard = false, stabilityBefore = 20, max = 20 } = {}
) {
	if (threshold === 0) {
		return formatAutomaticSalvation(roll, tokensAfter, thrown, stabilityBefore, max);
	}

	const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold, {
		hard
	});
	const parts = [rolled(roll, thrown)];
	if (tokenChange < 0) {
		parts.push(`${MINUS}${count(-tokenChange, 'token')}`, `${tokensAfter} left`);
	} else {
		// A miss: the target it needed (a natural 1 needs no explaining), then the cost
		if (!gainedSurreal) parts.push(`needed ${threshold}+`);
		if (tokenChange > 0) parts.push(`+${count(tokenChange, 'token')}`, `${tokensAfter} left`);
		else parts.push('no token lost');
	}
	if (gainedLucid) parts.push(LUCID_NOTE);
	if (gainedSurreal) parts.push(SURREAL_NOTE);
	return parts.join(SEP);
}

/** Four Aces: the Stability check first, then the token (unless Stability ran out) */
function formatAutomaticSalvation(roll, tokensAfter, thrown, stabilityBefore, max) {
	const outcome = calculateAutomaticSalvation(roll, stabilityBefore, max);
	const parts = [rolled(roll, thrown)];

	if (outcome.stabilityAfter <= 0) {
		// The fatal roll: the token stays, the game is over
		parts.push(`${MINUS}${outcome.stabilityLoss} Stability`, `0/${max}`, FATAL_NOTE);
		return parts.join(SEP);
	}
	parts.push(
		stabilityChange({ ...outcome, stabilityBefore, max }),
		`${MINUS}${count(1, 'token')}`,
		`${tokensAfter} left`
	);
	if (outcome.gainedLucid) parts.push(LUCID_NOTE);
	if (outcome.gainedSurreal) parts.push(SURREAL_NOTE);
	return parts.join(SEP);
}

/**
 * Label for the Salvation button: shows the target before the player rolls. With four Aces
 * there is none: the roll is a Stability check, and the token comes off if Stability holds.
 * @param {number} threshold - From getSalvationThreshold (0 = four Aces)
 */
export function formatSalvationButton(threshold) {
	return threshold === 0
		? 'Roll for Stability · Salvation is assured'
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
