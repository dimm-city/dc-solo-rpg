/**
 * Shared HUD helpers: Stability tiers, the Aces and their suits, the token and card meters,
 * and the roll modifiers and caption. Pure functions, so the HUD cells and their tests agree.
 */

import { fourthAceWins } from '../../constants/difficulty.js';

export const MAX_STABILITY = 20;

/** Cards in a full deck (the Oracle) */
export const DECK_SIZE = 52;

/** Tokens a game starts with when it does not say */
export const DEFAULT_STARTING_TOKENS = 10;

/**
 * Stability tier: steady (16-20), caution (11-15), danger (5-10), critical (4 or less).
 * @param {number} stability
 * @returns {'steady'|'caution'|'danger'|'critical'}
 */
export function stabilityTier(stability) {
	if (stability <= 4) return 'critical';
	if (stability <= 10) return 'danger';
	if (stability <= 15) return 'caution';
	return 'steady';
}

/**
 * Describe a 2d20 roll, e.g. "high of 15, 6". Returns null when the dice are
 * unknown or the kept die does not match the displayed roll.
 * @param {{rolls:number[], isLucid:boolean, isSurreal:boolean, finalValue:number}|null} last
 * @param {number} shown The roll shown in the HUD
 */
export function describeTwoDiceRoll(last, shown) {
	if (!last || last.rolls?.length !== 2 || last.finalValue !== shown) return null;
	if (!last.isLucid && !last.isSurreal) return null;
	return `${last.isLucid ? 'high' : 'low'} of ${last.rolls[0]}, ${last.rolls[1]}`;
}

/** Salvation needs this roll or better for 1-3 Aces; with all four there is no target */
const SALVATION_NEED = { 1: '17+', 2: '14+', 3: '11+', 4: 'all' };

/**
 * What the Aces mean for Salvation, e.g. { count: 2, need: '14+' }.
 * `need` is null before the first Ace (no Salvation threshold yet) and 'all' at 4, when there
 * is no roll to beat (see fourAcesRule). Mirrors getSalvationThreshold() in
 * services/d20Mechanics.js.
 * @param {number} aces Aces revealed (0-4)
 * @returns {{count:number, need:string|null}}
 */
export function acesSummary(aces) {
	const count = Math.max(0, Math.min(4, aces || 0));
	return { count, need: SALVATION_NEED[count] ?? null };
}

/**
 * What all four Aces mean, by difficulty (fourthAceWins reads config.options.difficulty;
 * anything but Easy reads as Normal). On Easy the fourth Ace ends the game: after its own
 * Stability check the player escapes if Stability is still above 0, and is lost if it reaches
 * 0. On Normal and Hard the game goes on: Salvation is automatic after a Stability check.
 * @param {{ config?: { options?: { difficulty?: number } } } | null} [state] gameState, or
 *   anything carrying the game's config
 * @returns {string} A clause that follows "All four Aces: "
 */
export function fourAcesRule(state) {
	return fourthAceWins(state)
		? 'survive the final Stability check and you escape'
		: 'Salvation is automatic after a Stability check';
}

/** The Ace pips, in order: the Ace of Hearts (it unlocks Salvation) first, red and black alternating */
export const ACE_SUITS = ['hearts', 'spades', 'diamonds', 'clubs'];

/**
 * Which Aces are out, by suit. The suits come from the cards drawn so far (the log, which
 * includes a card still on screen) plus the Ace of Hearts flag (Easy mode removes that card
 * from the deck). A state that knows only the count (a forced or older state) lights the
 * other suits in order, so the pips always agree with the number.
 * @param {{count:number, aceOfHeartsRevealed?:boolean, log?:Array<{card?:string, suit?:string}>}} state
 * @returns {Array<{suit:string, lit:boolean}>}
 */
export function aceSuits({ count, aceOfHeartsRevealed = false, log = [] }) {
	const out = new Set(
		(log ?? []).filter((card) => card?.card === 'A' && card.suit).map((card) => card.suit)
	);
	if (aceOfHeartsRevealed) out.add('hearts');
	for (const suit of ACE_SUITS) {
		if (out.size >= count) break;
		if (suit !== 'hearts') out.add(suit);
	}
	return ACE_SUITS.map((suit) => ({ suit, lit: out.has(suit) }));
}

/**
 * The token meter: tokens left out of the tokens the game started with, the same reading as
 * Stability's bar. On Hard a failed Salvation roll adds a token, so tokens can pass the
 * start: the bar stays full and `over` says by how many.
 * @param {number} tokens
 * @param {number} start
 * @returns {{fraction:number, over:number}}
 */
export function tokenMeter(tokens, start) {
	const max = start > 0 ? start : DEFAULT_STARTING_TOKENS;
	const left = Math.max(0, tokens || 0);
	return { fraction: Math.min(1, left / max), over: Math.max(0, left - max) };
}

/**
 * The two roll modifiers under the LED, both always shown: Lucid (the next roll keeps the
 * higher of two dice) and Surreal (the lower), each on or off. A natural 20 turns Lucid on
 * and a natural 1 turns Surreal on; the modifier applies to, and is used up by, the next d20
 * roll, whichever roll that is, and the two never stack (Lucid wins if a state has both). The
 * label carries the state, so a screen reader hears "off" on a dim icon, and the off label
 * says how to earn it.
 * @param {{isLucid?:boolean, isSurreal?:boolean}} state
 * @returns {Array<{kind:'lucid'|'surreal', on:boolean, label:string}>}
 */
export function rollModifiers({ isLucid, isSurreal }) {
	const lucid = !!isLucid;
	const surreal = !!isSurreal && !lucid;
	return [
		{
			kind: 'lucid',
			on: lucid,
			label: lucid
				? 'Lucid: next roll keeps the higher of two dice'
				: 'Lucid (off): a natural 20 makes the next roll keep the higher of two dice'
		},
		{
			kind: 'surreal',
			on: surreal,
			label: surreal
				? 'Surreal: next roll keeps the lower of two dice'
				: 'Surreal (off): a natural 1 makes the next roll keep the lower of two dice'
		}
	];
}
