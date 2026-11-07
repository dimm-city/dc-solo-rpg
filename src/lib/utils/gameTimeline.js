/**
 * The game timeline shown beside the final log: one block per round, in order, each a short
 * list of the round's important events, read from the game log and the final state.
 *
 * Events: a King (n of 4), an Ace (and the Salvation target it set), a Stability check and
 * its result, Lucid or Surreal gained (a natural 20 or 1 on any roll), a Salvation roll and
 * its result, a skip-damage or return-king card, and the ending. Ordinary even cards are not
 * events. Pure: it takes a plain state (gameState, or anything with `log`), so it is easy to
 * test.
 */
import { getEndingText, MAX_STABILITY } from './endingSummary.js';
import { getSalvationThreshold } from '../services/d20Mechanics.js';
import { fourthAceWins } from '../constants/difficulty.js';
import { cardShort, modifierLabel } from '../components/story/storyCards.js';

const MINUS = '−';
const LAST_TOKEN_CAUSE = 'The last token was removed.';

/**
 * @typedef {{kind: 'opening'|'king'|'ace'|'check'|'salvation'|'note'|'end', label: string, text: string}} TimelineEvent
 * @typedef {{round: number, title: string, events: TimelineEvent[]}} TimelineBlock
 */

const clamp = (value) => Math.max(0, Math.min(MAX_STABILITY, value));
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "−2 Stability" / "+1 Stability" / "no loss" */
function stabilityChange(change) {
	if (change < 0) return `${MINUS}${-change} Stability`;
	if (change > 0) return `+${change} Stability`;
	return 'no loss';
}

/** "Lucid" after a natural 20, "Surreal" after a natural 1, else nothing */
function modifierGained(roll) {
	if (roll === 20) return ['Lucid'];
	if (roll === 1) return ['Surreal'];
	return [];
}

/** A d20 read on the Stability table: "rolled 4 · −2 Stability · 14/20" (· Lucid / Surreal) */
function stabilityRoll(roll, change, after) {
	const parts = [`rolled ${roll}`, stabilityChange(change)];
	if (typeof after === 'number') parts.push(`${clamp(after)}/${MAX_STABILITY}`);
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

/** A Salvation roll (logged by applyPendingSuccessCheck with its result) */
function salvationEvent(entry) {
	const parts = [`rolled ${entry.roll}`];
	const automatic = entry.threshold === 0;
	// Four Aces: the roll is a Stability check first
	if (automatic || entry.stabilityChange) {
		parts.push(stabilityChange(entry.stabilityChange ?? 0));
		if (typeof entry.tower === 'number') parts.push(`${clamp(entry.tower)}/${MAX_STABILITY}`);
	}
	const change = entry.tokenChange ?? 0;
	if (change < 0) parts.push(`${MINUS}${plural(-change, 'token')}`);
	else if (change > 0) parts.push(`+${plural(change, 'token')}`);
	else if (!automatic) parts.push(`missed ${entry.threshold}+`);
	if (typeof entry.tokens === 'number' && (change !== 0 || !automatic)) {
		parts.push(`${entry.tokens} left`);
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
		events.push({ kind: 'king', label, text: `${kings} of 4 Kings` });
	} else if (entry.card === 'A') {
		const aces = (snapshot?.acesRevealed ?? seen.aces) + 1;
		const unlockedNow = entry.suit === 'hearts';
		const unlocked = unlockedNow || (snapshot?.aceOfHeartsRevealed ?? seen.hearts);
		seen.aces = aces;
		seen.hearts = unlocked;
		const parts = [];
		if (unlockedNow) parts.push('Salvation unlocked');
		if (!unlockedNow || aces > 1) parts.push(`${aces} of 4 Aces`);
		if (unlocked) {
			const threshold = getSalvationThreshold(aces);
			if (threshold > 0) parts.push(`roll ${threshold}+`);
			else if (!fourthAceWins(state)) parts.push('no target');
		}
		if (entry.modifier === 'skip-damage') parts.push('no Stability check');
		events.push({ kind: 'ace', label, text: parts.join(' · ') });
	} else if (entry.modifier === 'skip-damage' && entry.diceRoll == null) {
		events.push({ kind: 'note', label, text: 'no Stability check' });
	}

	if (entry.modifier === 'return-king') {
		events.push({
			kind: 'note',
			label,
			text: entry.modifierResult ?? modifierLabel(entry.modifier)
		});
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
