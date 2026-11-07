/**
 * Pure helpers for the ending screens: why the game ended, a recap of the run, and the
 * journal's status line. They take plain state objects so they are easy to test.
 * (The final log's timeline is built in gameTimeline.js.)
 */

export const MAX_STABILITY = 20;

const DEFAULT_KINGS_CAUSE = 'The fourth King was revealed.';
const DEFAULT_STABILITY_CAUSE = 'Your Stability reached 0.';
const DEFAULT_ACES_CAUSE = 'The fourth Ace was revealed.';
const DEFAULT_AFTERWORD = 'Winning was never likely. What you wrote along the way is the story.';

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
 * and (on a loss) the afterword. A win through the fourth Ace (Easy: tokens still left) names
 * it; a win through the last token needs no cause line, the message says it.
 * @param {{kingsRevealed?: number, tower?: number, win?: boolean, status?: string,
 *   acesRevealed?: number, tokens?: number}} state
 * @param {object} [labels] - game labels from the game config
 */
export function getEndingText(state, labels = {}) {
	const cause = getEndingCause(state);
	if (state.win) {
		return {
			cause,
			message: labels.successCheckWin ?? state.status ?? '',
			causeLine:
				(state.acesRevealed ?? 0) >= 4 && (state.tokens ?? 0) > 0
					? (labels.acesCauseLine ?? DEFAULT_ACES_CAUSE)
					: '',
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
	return { cause, message, causeLine, afterword: labels.gameOverAfterword ?? DEFAULT_AFTERWORD };
}

/** Cards drawn this run (log also holds roll entries, which have no rank). */
function drawnCards(log = []) {
	return log.filter((entry) => entry.card);
}

/**
 * Recap of the whole run, from real game state.
 * Tokens are only included once Salvation was unlocked (Ace of Hearts revealed).
 * @returns {{label: string, value: string|number, danger?: boolean}[]}
 */
export function getRunRecap(state) {
	const cards = drawnCards(state.log);
	const recap = [
		{ key: 'rounds', label: 'Rounds survived', value: state.round ?? 0 },
		{ key: 'cards', label: 'Cards drawn', value: cards.length },
		{
			key: 'kings',
			label: 'Kings revealed',
			value: `${state.kingsRevealed ?? 0} of 4`,
			danger: true
		},
		{ key: 'aces', label: 'Aces revealed', value: `${state.acesRevealed ?? 0} of 4` },
		{
			key: 'stability',
			label: 'Final Stability',
			value: `${Math.max(0, state.tower ?? 0)}/${MAX_STABILITY}`
		}
	];
	if (state.aceOfHeartsRevealed) {
		recap.push({ key: 'tokens', label: 'Tokens left', value: state.tokens ?? 0 });
	}
	return recap;
}

/** One-line status, e.g. "Stability 9/20 · 3 of 4 Kings · 11 tokens left". */
export function getStatusLine(state) {
	const parts = [
		`Stability ${Math.max(0, state.tower ?? 0)}/${MAX_STABILITY}`,
		`${state.kingsRevealed ?? 0} of 4 Kings`
	];
	if (state.aceOfHeartsRevealed) {
		const tokens = state.tokens ?? 0;
		parts.push(`${tokens} ${tokens === 1 ? 'token' : 'tokens'} left`);
	}
	return parts.join(' · ');
}
