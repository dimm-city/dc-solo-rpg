/**
 * Result lines - one plain line that says what a roll just did (design polish DP-1-07).
 *
 * Built from the real roll and the real game values, shown at full contrast until the player
 * continues. One grammar, clauses joined by " · ": the head, what changed, then the one-word
 * modifier the roll earned. No totals: the HUD shows them, and GameScreen adds them to the
 * live announcement only.
 *
 * Formats:
 *   Stability   "Rolled 8 · −1 Stability"
 *               "Rolled 15 · no Stability lost"
 *               "Natural 20 · +1 Stability · Lucid"
 *               "Natural 1 · −3 Stability · Surreal"
 *               "Rolled 3 · −2 Stability · nothing left to hold on to" (the fatal roll)
 *   The fourth Ace's check on Easy (the final roll: no modifier, the game is over either way):
 *               "Rolled 15 · no Stability lost · you escape"
 *   Tasks       "Rolled 16 · 5 cards this round"
 *   Salvation   "Rolled 17 · −1 Token"
 *               "Natural 20 · −2 Tokens · Lucid"
 *               "Rolled 16 · missed 17+"
 *               "Natural 1 · missed · Surreal"
 *   Salvation on Hard, where a miss adds Tokens:
 *               "Rolled 9 · missed 17+ · +1 Token"
 *               "Natural 1 · missed · +2 Tokens · Surreal"
 *   Salvation with four Aces (Normal and Hard: a Stability check, then the Token comes off):
 *               "Rolled 14 · no Stability lost · −1 Token"
 *               "Rolled 3 · −2 Stability · nothing left to hold on to" (the fatal roll)
 *   The winning roll (the last Token): "Rolled 15 · the last Token is gone · you escape"
 *               (four Aces: "Rolled 15 · no Stability lost · the last Token is gone · you escape")
 *
 * A roll made with two dice (Lucid or Surreal) names both and which one counted:
 *   "Rolled 6 (low of 6, 15) · −1 Stability"
 */

import {
	calculateStabilityLoss,
	calculateSalvationResult,
	calculateAutomaticSalvation
} from '../services/d20Mechanics.js';

/** The modifier a roll earned, as the last clause of its result line (the rule is in the hint) */
export const LUCID_NOTE = 'Lucid';
export const SURREAL_NOTE = 'Surreal';
/** The hint line above the roll button while the player is Lucid or Surreal (DP-1-05) */
export const LUCID_HINT = 'Lucid · two dice, keep the higher';
export const SURREAL_HINT = 'Surreal · two dice, keep the lower';
export const FATAL_NOTE = 'nothing left to hold on to';
/** The game is won: the fourth Ace's check held (Easy) or the last Token came off */
export const ESCAPE_NOTE = 'you escape';
/** The Token clause of the winning Salvation roll */
export const LAST_TOKEN_NOTE = 'the last Token is gone';
/** The step button's label while the dice are on the table, on every step */
export const ROLLING_LABEL = 'Rolling…';
/** The roll button on the fourth Ace's Stability check (Easy), the last roll of the game */
export const FINAL_CHECK_LABEL = 'Roll for Stability';
/** The roll button on every Salvation step */
export const SALVATION_LABEL = 'Roll for Salvation';

const SEP = ' · ';
const MINUS = '−';

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
/** The one-word modifier a roll earned, or nothing */
const modifier = ({ gainedLucid, gainedSurreal }) =>
	gainedLucid ? [LUCID_NOTE] : gainedSurreal ? [SURREAL_NOTE] : [];

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
		// The fatal roll: no modifier, the game is over
		parts.push(`${MINUS}${loss} Stability`, FATAL_NOTE);
	} else if (final) {
		// The fourth Ace's check held (Easy): the game is won
		parts.push(change, ESCAPE_NOTE);
	} else {
		parts.push(change, ...modifier({ gainedLucid, gainedSurreal }));
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
	const parts = [rolled(roll, thrown), `${count(cards, 'card')} this round`];
	parts.push(...modifier({ gainedLucid: roll === 20, gainedSurreal: roll === 1 }));
	return parts.join(SEP);
}

/**
 * Result line for a Salvation check. On Normal Tokens only ever fall: a miss (a natural 1
 * included) loses none, and the line names the target it missed. On Hard a miss adds Tokens.
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
		// The winning roll: the game is over, so no modifier
		if (tokensAfter <= 0) return [...parts, LAST_TOKEN_NOTE, ESCAPE_NOTE].join(SEP);
		parts.push(`${MINUS}${count(-tokenChange, 'Token')}`);
	} else {
		// A miss: the target it missed (a natural 1 misses whatever the target), then the cost
		parts.push(gainedSurreal ? 'missed' : `missed ${threshold}+`);
		if (tokenChange > 0) parts.push(`+${count(tokenChange, 'Token')}`);
	}
	parts.push(...modifier({ gainedLucid, gainedSurreal }));
	return parts.join(SEP);
}

/** Four Aces: the Stability check first, then the token (unless Stability ran out) */
function formatAutomaticSalvation(roll, tokensAfter, thrown, stabilityBefore, max) {
	const outcome = calculateAutomaticSalvation(roll, stabilityBefore, max);
	const parts = [rolled(roll, thrown)];

	if (outcome.stabilityAfter <= 0) {
		// The fatal roll: the Token stays, the game is over
		parts.push(`${MINUS}${outcome.stabilityLoss} Stability`, FATAL_NOTE);
		return parts.join(SEP);
	}
	parts.push(stabilityChange({ ...outcome, stabilityBefore, max }));
	// The winning roll: the game is over, so no modifier
	if (tokensAfter <= 0) return [...parts, LAST_TOKEN_NOTE, ESCAPE_NOTE].join(SEP);
	parts.push(`${MINUS}${count(1, 'Token')}`, ...modifier(outcome));
	return parts.join(SEP);
}

/**
 * Label for the Salvation roll button. One verb at every threshold and with four Aces: the
 * target (or, with four Aces, the Stability check) is in the description, one job per element
 * (DP-1-06).
 * Callers may still pass the threshold (from getSalvationThreshold); the label is the same.
 */
export function formatSalvationButton() {
	return SALVATION_LABEL;
}

/**
 * The step button once a result is on screen, named by where it goes (DP-1-06): never
 * "Continue". An ending is named for itself.
 * @param {{ gameOver?: boolean, win?: boolean, next: 'round'|'cards'|'draw'|'salvation'|'journal',
 *   round?: number, cards?: number, skipJournal?: boolean }} step
 *   next: 'round' after the opening roll; 'cards' after the task roll (cards is how many);
 *   'draw' when cards are left this round; 'salvation' when the round's checks are done and
 *   Salvation is unlocked; 'journal' otherwise, or after Salvation. skipJournal is
 *   Settings › Journal set to skip, where the journal saves itself and the next round begins.
 */
export function formatNextStepLabel({
	gameOver = false,
	win = false,
	next,
	round = 0,
	cards = 0,
	skipJournal = false
}) {
	if (gameOver) return win ? 'Escape' : 'Face the end';
	switch (next) {
		case 'round':
			return `Begin round ${round + 1}`;
		case 'cards':
			return cards === 1 ? 'Draw the card' : 'Draw the cards';
		case 'draw':
			return 'Draw the next card';
		case 'salvation':
			return 'Go to Salvation';
		default:
			return skipJournal ? `Begin round ${round + 1}` : 'Open your journal';
	}
}

/**
 * What a card modifier did, for the board's notice (OWN-4), or null when it did nothing. A card
 * modifier's result is a past-tense statement ("K♥ went back into the deck · 0 of 4 Kings out",
 * "A♣ skipped its Stability check"); a non-event is phrased "No …" ("No King was out to
 * return"), and the board never states a non-event.
 * @param {string|null|undefined} modifierResult - The card's modifierResult (gameActions)
 * @returns {string|null}
 */
export function formatModifierNotice(modifierResult) {
	const text = (modifierResult ?? '').trim();
	if (!text || /^No\b/.test(text)) return null;
	return text;
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
 * @param {{ stability: number, tokens: number, aceRevealed: boolean, fourthAceWins?: boolean }} game
 *   aceRevealed is true on Easy, where the Ace of Hearts starts revealed; fourthAceWins is the
 *   Easy rule (fourthAceWins(gameState)): surviving the fourth Ace is the other way out
 */
export function formatIntroGoal({ stability, tokens, aceRevealed, fourthAceWins = false }) {
	const hold = `Hold on to your ${stability} Stability.`;
	const clear = tokens === 1 ? 'clear the one Token' : `clear all ${tokens} Tokens`;
	const escape = fourthAceWins
		? `${clear}, or survive the fourth Ace, to escape.`
		: `${clear} to escape.`;
	return aceRevealed
		? `${hold} The Ace of Hearts is already revealed: ${escape}`
		: `${hold} Find the Ace of Hearts, then ${escape}`;
}

/**
 * What the live region adds after a result line: the totals the HUD shows on screen
 * (DP-1-07). Stability after a Stability roll (and a four-Ace Salvation, which is one), the
 * Tokens left after Salvation, nothing after the task roll.
 * @param {'stability'|'salvation'|'salvation-four'|'tasks'} kind
 * @param {{ stability?: number, max?: number, tokens?: number, start?: number }} totals
 * @returns {string} e.g. ". Stability 14 of 20." or ". 6 of 10 Tokens left."
 */
export function formatResultTotals(kind, { stability = 0, max = 20, tokens = 0, start = 10 } = {}) {
	const stabilityTotal = ` Stability ${stability} of ${max}.`;
	const tokensTotal = ` ${tokens} of ${start} Tokens left.`;
	switch (kind) {
		case 'stability':
			return `.${stabilityTotal}`;
		case 'salvation':
			return `.${tokensTotal}`;
		case 'salvation-four':
			return `.${stabilityTotal}${tokensTotal}`;
		default:
			return '';
	}
}
