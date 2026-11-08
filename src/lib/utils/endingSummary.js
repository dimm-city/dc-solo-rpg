/**
 * Pure helpers for the ending screens: why the game ended, a recap of the run, and the
 * journal's status line. They take plain state objects so they are easy to test.
 * (The final log's timeline is built in gameTimeline.js.)
 */

import { fourthAceWins } from '../constants/difficulty.js';
import {
	DECK_SIZE,
	DEFAULT_STARTING_TOKENS,
	acesTier,
	kingsTier,
	stabilityTier,
	tokensTier
} from '../components/status/hudTiers.js';

export const MAX_STABILITY = 20;

const DEFAULT_KINGS_CAUSE = 'The fourth King was revealed.';
const DEFAULT_STABILITY_CAUSE = 'Your Stability reached 0.';
const DEFAULT_ACES_CAUSE = 'The fourth Ace was revealed.';
const DEFAULT_TOKENS_CAUSE = 'The last Token was removed.';
const DEFAULT_AFTERWORD = 'Winning was never likely. What you wrote along the way is the story.';
/** Easy is the level where escape is likely, so its afterword does not say it never was */
const EASY_AFTERWORD = 'What you wrote along the way is the story.';

/**
 * Work out why the game ended, from game state.
 * @param {{kingsRevealed?: number, tower?: number, win?: boolean}} state
 * @returns {'kings'|'stability'|null} null for a win or an unknown ending
 */
export function getEndingCause(state) {
	if (state.win) return null;
	if ((state.kingsRevealed ?? 0) >= 4) return 'kings';
	if ((state.tower ?? 1) <= 0) return 'stability';
	return null;
}

/**
 * Text for the ending screen: the author's main line, a game-written cause line
 * and (on a loss) the afterword. A win names what brought it: the fourth Ace (Easy, tokens
 * still left) or the last Token. On Easy the afterword drops "Winning was never likely".
 * @param {{kingsRevealed?: number, tower?: number, win?: boolean, status?: string,
 *   acesRevealed?: number, tokens?: number, config?: object}} state
 * @param {object} [labels] - game labels from the game config
 */
export function getEndingText(state, labels = {}) {
	const cause = getEndingCause(state);
	if (state.win) {
		const tokens = state.tokens ?? 0;
		let causeLine = '';
		if ((state.acesRevealed ?? 0) >= 4 && tokens > 0) {
			causeLine = labels.acesCauseLine ?? DEFAULT_ACES_CAUSE;
		} else if (tokens <= 0) {
			causeLine = labels.tokensCauseLine ?? DEFAULT_TOKENS_CAUSE;
		}
		return {
			cause,
			message: labels.successCheckWin ?? state.status ?? '',
			causeLine,
			afterword: ''
		};
	}
	const message =
		(cause === 'kings' ? labels.failureCounterLoss : labels.failureCheckLoss) ?? state.status ?? '';
	const causeLine =
		cause === 'kings'
			? (labels.kingsCauseLine ?? DEFAULT_KINGS_CAUSE)
			: cause === 'stability'
				? (labels.stabilityCauseLine ?? DEFAULT_STABILITY_CAUSE)
				: '';
	const afterword =
		labels.gameOverAfterword ?? (fourthAceWins(state) ? EASY_AFTERWORD : DEFAULT_AFTERWORD);
	return { cause, message, causeLine, afterword };
}

/** Cards drawn this run (log also holds roll entries, which have no rank). */
function drawnCards(log = []) {
	return log.filter((entry) => entry.card);
}

/**
 * One recap tile: "Kings 1/4", spoken "1 of 4" (with `suffix`: "30 of 52 cards"). The visible
 * label is the tile's spoken name, so the spoken value does not repeat it (game-copy-s-13).
 * `tier` is the HUD tile's tier for the final value (hudTiers.js); null for a neutral count.
 * `spoken` replaces the spoken value outright (a locked tile).
 */
function tile(key, label, n, max, { suffix = '', tier = null, spoken = null } = {}) {
	const count = max === undefined ? `${n}` : `${n} of ${max}`;
	return {
		key,
		label,
		n,
		max,
		value: max === undefined ? String(n) : `${n}/${max}`,
		spoken: spoken ?? `${count}${suffix ? ` ${suffix}` : ''}`,
		tier
	};
}

/**
 * Recap of the whole run, from real game state, read as the HUD (game-copy-s-09): the tiles in
 * its order, Stability, Kings | Rounds (in the Roll slot), Drawn | Aces, Tokens, each resource
 * in its HUD tier's colour for its final value; Rounds and Drawn are neutral counts. "Drawn"
 * counts the cards drawn (game-copy-s-08): the HUD's "Cards" counts the cards left.
 * Tokens are always there, as in the HUD (game-copy-s-14): when the Ace of Hearts was never
 * found the tile is "locked" (the HUD's locked look) and says so to a screen reader.
 * @returns {{key: string, label: string, n: number, max?: number, value: string,
 *   spoken: string, tier: string|null}[]}
 */
export function getRunRecap(state) {
	const stability = Math.max(0, state.tower ?? 0);
	const kings = state.kingsRevealed ?? 0;
	const aces = state.acesRevealed ?? 0;
	const recap = [
		tile('stability', 'Stability', stability, MAX_STABILITY, { tier: stabilityTier(stability) }),
		tile('kings', 'Kings', kings, 4, { tier: kingsTier(kings) }),
		tile('rounds', 'Rounds', state.round ?? 0),
		tile('cards', 'Drawn', drawnCards(state.log).length, DECK_SIZE, { suffix: 'cards' }),
		tile('aces', 'Aces', aces, 4, {
			tier: acesTier({
				count: aces,
				heartsAce: !!state.aceOfHeartsRevealed,
				fourthWins: fourthAceWins(state)
			})
		})
	];
	const start = state.config?.options?.startingTokens || DEFAULT_STARTING_TOKENS;
	const tokens = Math.max(0, state.tokens ?? 0);
	const unlocked = !!state.aceOfHeartsRevealed;
	recap.push(
		tile('tokens', 'Tokens', tokens, start, {
			suffix: 'left',
			tier: tokensTier({ unlocked, tokens, start }),
			spoken: unlocked ? null : 'locked, the Ace of Hearts never found'
		})
	);
	return recap;
}

/**
 * One-line status, label first like the HUD's spoken text, e.g.
 * "Stability 9 of 20 · Kings 3 of 4 · Tokens 11 left". Tokens have no fixed max (on Hard
 * they can pass the start), so they read "n left". The journal keeps each ' · ' clause whole
 * on a line.
 */
export function getStatusLine(state) {
	const parts = [
		`Stability ${Math.max(0, state.tower ?? 0)} of ${MAX_STABILITY}`,
		`Kings ${state.kingsRevealed ?? 0} of 4`
	];
	if (state.aceOfHeartsRevealed) parts.push(`Tokens ${state.tokens ?? 0} left`);
	return parts.join(' · ');
}
