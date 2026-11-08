/**
 * How a finished run ended, in a few words, for the Story Library and story mode.
 * Takes a completed save (see indexedDBStorage getSerializableState).
 */
import { getEndingCause } from './endingSummary.js';

/** @typedef {'escaped'|'kings'|'stability'|'lost'} OutcomeKind */

const LABELS = {
	escaped: 'Escaped',
	kings: 'Taken by the fourth King',
	stability: 'Fell when Stability reached 0',
	lost: 'Did not escape'
};

/**
 * @param {{isWon?: boolean, win?: boolean, kingsRevealed?: number, finalTower?: number, tower?: number}} save
 * @returns {{kind: OutcomeKind, label: string, won: boolean}}
 */
export function getStoryOutcome(save = {}) {
	const won = save.isWon ?? save.win ?? false;
	if (won) return { kind: 'escaped', label: LABELS.escaped, won: true };
	const cause = getEndingCause({
		win: false,
		kingsRevealed: save.kingsRevealed,
		tower: save.finalTower ?? save.tower
	});
	const kind = cause ?? 'lost';
	return { kind, label: LABELS[kind], won: false };
}

/**
 * "1 round" / "5 rounds"
 * @param {number} [rounds]
 */
export function formatRounds(rounds) {
	const n = rounds ?? 0;
	return `${n} ${n === 1 ? 'round' : 'rounds'}`;
}
