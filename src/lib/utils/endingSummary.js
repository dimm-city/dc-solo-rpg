/**
 * Pure helpers for the ending screens: why the game ended, a recap of the run, and the
 * journal's status line. They take plain state objects so they are easy to test.
 * (The final log's timeline is built in gameTimeline.js.)
 */

import { fourthAceWins } from '../constants/difficulty.js';
import { DECK_SIZE, DEFAULT_STARTING_TOKENS } from '../components/status/hudTiers.js';

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

/** One recap tile: "Kings 1/4", spoken "Kings 1 of 4" */
function tile(key, label, n, max, { spokenLabel = label, danger = false } = {}) {
	return {
		key,
		label,
		n,
		max,
		value: max === undefined ? String(n) : `${n}/${max}`,
		spoken: max === undefined ? `${spokenLabel} ${n}` : `${spokenLabel} ${n} of ${max}`,
		danger
	};
}

/**
 * Recap of the whole run, from real game state, in the HUD's words and its n/max counts.
 * Tokens are only included once Salvation was unlocked (Ace of Hearts revealed).
 * @returns {{key: string, label: string, n: number, max?: number, value: string,
 *   spoken: string, danger?: boolean}[]}
 */
export function getRunRecap(state) {
	const recap = [
		tile('rounds', 'Rounds', state.round ?? 0),
		tile('cards', 'Cards', drawnCards(state.log).length, DECK_SIZE, { spokenLabel: 'Cards drawn' }),
		tile('kings', 'Kings', state.kingsRevealed ?? 0, 4, { danger: true }),
		tile('aces', 'Aces', state.acesRevealed ?? 0, 4),
		tile('stability', 'Stability', Math.max(0, state.tower ?? 0), MAX_STABILITY)
	];
	if (state.aceOfHeartsRevealed) {
		const start = state.config?.options?.startingTokens || DEFAULT_STARTING_TOKENS;
		recap.push(tile('tokens', 'Tokens', Math.max(0, state.tokens ?? 0), start));
	}
	return recap;
}

/**
 * One-line status, e.g. "Stability 9/20 · 3 of 4 Kings · 11 Tokens left". The journal keeps
 * each ' · ' clause whole on a line.
 */
export function getStatusLine(state) {
	const parts = [
		`Stability ${Math.max(0, state.tower ?? 0)}/${MAX_STABILITY}`,
		`${state.kingsRevealed ?? 0} of 4 Kings`
	];
	if (state.aceOfHeartsRevealed) {
		const tokens = state.tokens ?? 0;
		parts.push(`${tokens} ${tokens === 1 ? 'Token' : 'Tokens'} left`);
	}
	return parts.join(' · ');
}
