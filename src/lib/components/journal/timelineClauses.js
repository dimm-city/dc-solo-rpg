/**
 * How a final-log timeline row breaks across lines. A row is the card label, then clauses
 * joined by ' · '; a line breaks only after a ' ·', so each clause stays whole. A running total
 * is held to the clause before it by no-break spaces ("−2 Stability · 14 of 20"), so a count
 * never sits alone on a line.
 *
 * A long clause holding a total ("K♥ went back into the deck · Kings 0 of 4") can be wider
 * than the row beside its label, and then the label was left alone on the first line
 * (game-copy-s-12). Such a clause breaks at its own spaces instead, keeping only its last word
 * with the total ("deck · Kings 0 of 4"). A short one (three words or fewer before the total)
 * stays whole, as before.
 */

/** Joins a running total to the clause before it: ' · ' with no-break spaces */
export const HOLD = ' · ';
/** A clause with more words than this before its total may break at its own spaces */
const SHORT_WORDS = 3;

/** A row's clauses, split at its ' · ' separators (a held total stays in its clause) */
export function rowClauses(text) {
	return text ? text.split(' · ') : [];
}

/**
 * One clause, as the words that may wrap and the run that never does.
 * @param {string} clause - e.g. "K♥ went back into the deck · Kings 0 of 4"
 * @returns {{ lead: string, held: string[] }} lead: words that may wrap, ending in a space
 *   ('' when the clause stays whole); held: the pieces kept on one line, joined by ' · '
 */
export function clauseRuns(clause) {
	const pieces = clause.split(HOLD);
	if (pieces.length < 2) return { lead: '', held: pieces };
	const words = pieces[0].split(' ');
	if (words.length <= SHORT_WORDS) return { lead: '', held: pieces };
	return {
		lead: `${words.slice(0, -1).join(' ')} `,
		held: [words[words.length - 1], ...pieces.slice(1)]
	};
}
