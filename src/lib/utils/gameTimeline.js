/**
 * The game timeline shown beside the final log: one block per round, in order, each a short
 * list of the round's important events, read from the game log and the final state.
 *
 * Events: a King (Kings n of 4), an Ace (and the Salvation target it set), a Stability check and
 * its result, Lucid or Surreal gained (a natural 20 or 1 on any roll), a Salvation roll and
 * its result, a skip-damage or return-king card, and the ending. Ordinary even cards are not
 * events. Pure: it takes a plain state (gameState, or anything with `log`), so it is easy to
 * test.
 *
 * Rolls read as the board's result line does ("Rolled 9 · missed 14+", "Natural 20",
 * "no Stability lost", Token capitalised), plus a running total as the last clause before
 * Lucid or Surreal: the final log has no HUD beside it. Counts take the final log header's
 * forms ("17 of 20" after the Stability clause that names it, "Kings 2 of 4", "Aces 2 of 4",
 * "Tokens 6 left"). Clauses are joined by ' · '; the timeline keeps each one whole on a line,
 * and a total is held to the clause before it (by no-break spaces round its ' · '), so it
 * never sits alone on a line.
 */
import { getEndingText, MAX_STABILITY } from './endingSummary.js';
import { getSalvationThreshold } from '../services/d20Mechanics.js';
import { fourthAceWins } from '../constants/difficulty.js';
import { cardShort, modifierLine } from '../components/story/storyCards.js';

const MINUS = '−';
/** Joins a running total to the clause before it: ' · ' with no-break spaces never splits */
const HOLD = '\u00a0·\u00a0';
const LAST_TOKEN_CAUSE = 'The last Token was removed.';

/**
 * @typedef {{kind: 'opening'|'king'|'ace'|'check'|'salvation'|'note'|'end', label: string, text: string}} TimelineEvent
 * @typedef {{round: number, title: string, events: TimelineEvent[]}} TimelineBlock
 */

const clamp = (value) => Math.max(0, Math.min(MAX_STABILITY, value));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "Rolled 9", "Natural 20" or "Natural 1": the board's head for a d20 */
function rollHead(roll) {
	return roll === 20 || roll === 1 ? `Natural ${roll}` : `Rolled ${roll}`;
}

/** "−2 Stability" / "+1 Stability" / "Stability already full" / "no Stability lost" */
function stabilityChange(change, roll) {
	if (change < 0) return `${MINUS}${-change} Stability`;
	if (change > 0) return `+${change} Stability`;
	return roll === 20 ? 'Stability already full' : 'no Stability lost';
}

/** "−1 Token", "+2 Tokens" */
function tokenChange(change) {
	return `${change < 0 ? MINUS : '+'}${plural(Math.abs(change), 'Token')}`;
}

/** "Tokens 6 left", "Tokens 1 left": the final log header's form */
function tokensLeft(tokens) {
	return `Tokens ${tokens} left`;
}

/** "17 of 20": the clause before it names Stability */
function stabilityTotal(after) {
	return `${clamp(after)} of ${MAX_STABILITY}`;
}

/** Add a running total to the last clause, held to it so it never starts a line alone */
function holdTotal(parts, total) {
	parts[parts.length - 1] += `${HOLD}${total}`;
}

/** "Lucid" after a natural 20, "Surreal" after a natural 1, else nothing */
function modifierGained(roll) {
	if (roll === 20) return ['Lucid'];
	if (roll === 1) return ['Surreal'];
	return [];
}

/** A d20 read on the Stability table: "Rolled 4 · −2 Stability · 14 of 20" (· Lucid / Surreal) */
function stabilityRoll(roll, change, after) {
	const parts = [rollHead(roll), stabilityChange(change, roll)];
	if (typeof after === 'number') holdTotal(parts, stabilityTotal(after));
	return [...parts, ...modifierGained(roll)];
}

/** The opening instability roll (logged with the Stability it left) */
function openingEvent(entry) {
	const after = entry.tower;
	const change = typeof after === 'number' ? after - MAX_STABILITY : -(entry.damage ?? 0);
	return {
		kind: 'opening',
		label: 'Instability',
		text: stabilityRoll(entry.roll, change, after).join(' · ')
	};
}

/**
 * A Salvation roll (logged by applyPendingSuccessCheck with its result):
 * "Rolled 17 · −1 Token · Tokens 6 left", "Rolled 9 · missed 14+ · Tokens 6 left",
 * "Natural 1 · missed · Tokens 6 left · Surreal"; on Hard a miss adds "· +1 Token".
 */
function salvationEvent(entry) {
	const parts = [rollHead(entry.roll)];
	const automatic = entry.threshold === 0;
	// Four Aces: the roll is a Stability check first
	if (automatic || entry.stabilityChange) {
		parts.push(stabilityChange(entry.stabilityChange ?? 0, entry.roll));
		if (typeof entry.tower === 'number') holdTotal(parts, stabilityTotal(entry.tower));
	}
	const change = entry.tokenChange ?? 0;
	// A miss: a natural 1 is a miss whatever the target, so it needs no number
	if (change >= 0 && !automatic)
		parts.push(entry.roll === 1 ? 'missed' : `missed ${entry.threshold}+`);
	if (change !== 0) parts.push(tokenChange(change));
	if (typeof entry.tokens === 'number' && (change !== 0 || !automatic)) {
		holdTotal(parts, tokensLeft(entry.tokens));
	}
	return {
		kind: 'salvation',
		label: 'Salvation',
		text: [...parts, ...modifierGained(entry.roll)].join(' · ')
	};
}

/**
 * The events of one drawn card: a King or Ace line, a modifier note, and the Stability check
 * that followed (two lines for an Ace with a check).
 * @param {object} entry - A card entry of the log, with its draw-time snapshot
 * @param {object} state - The game (for the difficulty's fourth-Ace rule)
 * @param {{kings: number, aces: number, hearts: boolean}} seen - Running counts, for a log
 *   without snapshots
 * @returns {TimelineEvent[]}
 */
function cardEvents(entry, state, seen) {
	const label = cardShort(entry);
	const snapshot = entry.gameState ?? null;
	const events = [];

	if (entry.card === 'K') {
		const kings = (snapshot?.kingsRevealed ?? seen.kings) + 1;
		seen.kings = kings;
		events.push({ kind: 'king', label, text: `Kings ${kings} of 4` });
	} else if (entry.card === 'A') {
		const aces = (snapshot?.acesRevealed ?? seen.aces) + 1;
		const unlockedNow = entry.suit === 'hearts';
		const unlocked = unlockedNow || (snapshot?.aceOfHeartsRevealed ?? seen.hearts);
		seen.aces = aces;
		seen.hearts = unlocked;
		const parts = [];
		if (unlockedNow) parts.push('Salvation unlocked');
		if (!unlockedNow || aces > 1) parts.push(`Aces ${aces} of 4`);
		if (unlocked) {
			// The card face's words: "needs 14+", "no target"
			const threshold = getSalvationThreshold(aces);
			if (threshold > 0) parts.push(`needs ${threshold}+`);
			else if (!fourthAceWins(state)) parts.push('no target');
		}
		events.push({ kind: 'ace', label, text: parts.join(' · ') });
	}

	// The board's notice, after the card label: "A♣ · skipped its Stability check"
	if (entry.modifier === 'skip-damage' && entry.diceRoll == null) {
		events.push({ kind: 'note', label, text: 'skipped its Stability check' });
	}

	// "6♠ · K♥ went back into the deck · 0 of 4 Kings out", as the board logged it; a King
	// return with no King out did nothing, and no screen states a non-event
	if (entry.modifier === 'return-king') {
		const text = modifierLine(entry);
		if (text) events.push({ kind: 'note', label, text });
	}

	if (entry.diceRoll != null) {
		// The loss is the table's (what the check screen showed), even past 0; a natural 20
		// restores 1 Stability, never past 20
		const before = snapshot?.tower;
		const loss = entry.damageDealt ?? 0;
		let change = -loss;
		let after;
		if (typeof before === 'number') {
			after = clamp(before + (entry.diceRoll === 20 ? 1 : 0) - loss);
			if (entry.diceRoll === 20) change = after - before;
		} else if (entry.diceRoll === 20) {
			change = 1;
		}
		events.push({
			kind: 'check',
			label,
			text: stabilityRoll(entry.diceRoll, change, after).join(' · ')
		});
	}

	return events;
}

/** How the game ended, as the last line of the timeline, or null while it is still on */
function endingEvent(state) {
	if (!state.gameOver) return null;
	const { causeLine } = getEndingText(state, state.config?.labels);
	return {
		kind: 'end',
		label: state.win ? 'Escaped' : 'The end',
		text: causeLine || (state.win ? LAST_TOKEN_CAUSE : '')
	};
}

/**
 * Build the timeline: the opening roll, then every round up to the current one (a quiet round
 * has no events), the ending on the last.
 * @param {object} state - gameState, or a plain object with log, round, gameOver, win, config…
 * @returns {TimelineBlock[]}
 */
export function buildTimeline(state = {}) {
	const log = state.log ?? [];
	const blocks = new Map();
	const block = (round) => {
		if (!blocks.has(round)) {
			blocks.set(round, { round, title: round === 0 ? 'Opening' : `Round ${round}`, events: [] });
		}
		return blocks.get(round);
	};

	const lastRound = Math.max(state.round ?? 0, ...log.map((entry) => entry.round ?? 0));
	for (let round = 1; round <= lastRound; round++) block(round);

	const seen = { kings: 0, aces: 0, hearts: false };
	for (const entry of log) {
		const round = entry.round ?? 0;
		if (entry.type === 'initial-damage') block(round).events.push(openingEvent(entry));
		else if (entry.type === 'salvation') block(round).events.push(salvationEvent(entry));
		else if (entry.card) block(round).events.push(...cardEvents(entry, state, seen));
	}

	const ending = endingEvent(state);
	if (ending) block(lastRound).events.push(ending);

	return [...blocks.values()].sort((a, b) => a.round - b.round);
}
