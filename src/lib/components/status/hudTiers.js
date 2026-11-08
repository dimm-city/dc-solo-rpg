/**
 * Shared HUD helpers: the tiers of all six tiles (design polish DP-1-02), what each tile says
 * to a screen reader and in its tooltip (DP-1-03), the Aces and their suits, the token and
 * card meters, and the roll modifiers. Pure functions, so the HUD cells and their tests agree.
 *
 * Every tile has tiers that fit what its value means to the player. A tier changes only
 * colour: the tile's tint, its value, its label and its bar (never size, weight or spacing).
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
 * Kings tier: calm (0-2), urgent (3-4: one more ends the game, or it has ended).
 * @param {number} kings
 * @returns {'calm'|'urgent'}
 */
export function kingsTier(kings) {
	return kings >= 3 ? 'urgent' : 'calm';
}

/**
 * Roll tier: a pending modifier first (Lucid wins if a state has both), then a plain last
 * roll, else idle (no roll yet). Lucid comes on with a natural 20 and stays until the next
 * result lands, so "natural 20" and "Lucid pending" are one span of play.
 * @param {{ hasRolled?: boolean, isLucid?: boolean, isSurreal?: boolean }} state
 * @returns {'lucid'|'surreal'|'plain'|'idle'}
 */
export function rollTier({ hasRolled = false, isLucid = false, isSurreal = false } = {}) {
	if (isLucid) return 'lucid';
	if (isSurreal) return 'surreal';
	return hasRolled ? 'plain' : 'idle';
}

/**
 * Cards tier: the deck running out is pressure, never danger (no red).
 * full (13 and up), low (7-12), out (6 or fewer).
 * @param {number} cards Cards left in the deck
 * @returns {'full'|'low'|'out'}
 */
export function cardsTier(cards) {
	if (cards >= 13) return 'full';
	if (cards >= 7) return 'low';
	return 'out';
}

/**
 * Aces tier: rising is hope. 'none' before the first Ace; 'final' with all four on Easy (the
 * fourth Ace ends the game); 'four' with all four otherwise; 'locked' for Aces drawn before
 * the Ace of Hearts (Salvation is still locked); then one, two or three.
 * @param {{ count: number, heartsAce?: boolean, fourthWins?: boolean }} state
 * @returns {'none'|'locked'|'one'|'two'|'three'|'four'|'final'}
 */
export function acesTier({ count, heartsAce = false, fourthWins = false }) {
	if (!count || count <= 0) return 'none';
	if (count >= 4) return fourthWins ? 'final' : 'four';
	if (!heartsAce) return 'locked';
	return ['one', 'two', 'three'][count - 1];
}

/**
 * Tokens tier: falling is good news. 'locked' until the Ace of Hearts; 'over' past the start
 * (Hard); 'clear' at 0; 'near' at 2 or fewer; 'half' at half the start or fewer; else 'full'.
 * @param {{ unlocked?: boolean, tokens: number, start?: number }} state
 * @returns {'locked'|'over'|'clear'|'near'|'half'|'full'}
 */
export function tokensTier({ unlocked = false, tokens, start = DEFAULT_STARTING_TOKENS }) {
	if (!unlocked) return 'locked';
	const max = start > 0 ? start : DEFAULT_STARTING_TOKENS;
	if (tokens > max) return 'over';
	if (tokens <= 0) return 'clear';
	if (tokens <= 2) return 'near';
	if (tokens <= max / 2) return 'half';
	return 'full';
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
/** The same targets as numbers (getSalvationThreshold in services/d20Mechanics.js) */
const SALVATION_TARGET = { 1: 17, 2: 14, 3: 11 };

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
 * 0. On Normal and Hard the game goes on: each Salvation is a Stability check, and a Token
 * comes off if Stability holds (GD-1-01).
 * @param {{ config?: { options?: { difficulty?: number } } } | null} [state] gameState, or
 *   anything carrying the game's config
 * @returns {string} A clause that follows "All four Aces: "
 */
export function fourAcesRule(state) {
	return fourthAceWins(state)
		? 'survive the final Stability check and you escape'
		: 'each Salvation is a Stability check; hold on and a Token comes off';
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
 * label carries the state, so a screen reader hears "off" on a dim icon (CP-1-16: the long
 * form when on, "Lucid: off" when off).
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
			label: lucid ? 'Lucid: your next roll uses two dice and keeps the higher.' : 'Lucid: off'
		},
		{
			kind: 'surreal',
			on: surreal,
			label: surreal ? 'Surreal: your next roll uses two dice and keeps the lower.' : 'Surreal: off'
		}
	];
}

// ============================================
// SPOKEN TEXT AND TOOLTIPS (DP-1-03): the tile's visible label first, then its value, then
// a word for its tier
// ============================================

const STABILITY_WORD = { caution: ', falling', danger: ', low', critical: ', critical' };

/** "Stability 8 of 20, low" */
export function stabilitySpoken(stability) {
	return `Stability ${stability} of ${MAX_STABILITY}${STABILITY_WORD[stabilityTier(stability)] ?? ''}`;
}

/** "Kings 3 of 4, one more ends the game" (the label can be the game's own) */
export function kingsSpoken(kings, label = 'Kings') {
	const word = kings >= 4 ? ', all four revealed' : kings === 3 ? ', one more ends the game' : '';
	return `${label} ${kings} of 4${word}`;
}

/**
 * "Roll: none yet", "Roll: rolling", "Roll 20, natural 20", "Roll 6, low of 6 and 15"
 * @param {{ inFlight?: boolean, value?: number, last?: {rolls:number[], isLucid:boolean,
 *   isSurreal:boolean, finalValue:number}|null }} state value is gameState.diceRoll (0 before
 *   the first roll); last is diceState.lastRoll, for a two-dice roll
 */
export function rollSpoken({ inFlight = false, value = 0, last = null } = {}) {
	if (inFlight) return 'Roll: rolling';
	if (!value) return 'Roll: none yet';
	const two =
		last &&
		last.rolls?.length === 2 &&
		last.finalValue === value &&
		(last.isLucid || last.isSurreal)
			? `, ${last.isLucid ? 'high' : 'low'} of ${last.rolls[0]} and ${last.rolls[1]}`
			: '';
	const natural = value === 20 || value === 1 ? `, natural ${value}` : '';
	return `Roll ${value}${two}${natural}`;
}

/** "Cards 9 of 52 left, running low" */
export function cardsSpoken(cards) {
	const tier = cardsTier(cards);
	const word = tier === 'low' ? ', running low' : tier === 'out' ? ', running out' : '';
	return `Cards ${cards} of ${DECK_SIZE} left${word}`;
}

/**
 * What the Aces tile says, by tier
 * @param {{ count: number, heartsAce?: boolean, fourthWins?: boolean }} state
 */
export function acesSpoken({ count, heartsAce = false, fourthWins = false }) {
	switch (acesTier({ count, heartsAce, fourthWins })) {
		case 'none':
			return 'Aces 0 of 4';
		case 'locked':
			return `Aces ${count} of 4, Salvation locked until the Ace of Hearts`;
		case 'four':
			return 'Aces 4 of 4, Salvation has no target: each roll is a Stability check';
		case 'final':
			return 'Aces 4 of 4, survive the final Stability check and you escape';
		default:
			return `Aces ${count} of 4, Salvation needs ${SALVATION_TARGET[count]} or more`;
	}
}

/**
 * The Aces tile's tooltip, by tier
 * @param {{ count: number, heartsAce?: boolean, fourthWins?: boolean }} state
 * @param {string} rule fourAcesRule(gameState), for four Aces
 */
export function acesTooltip({ count, heartsAce = false, fourthWins = false }, rule) {
	switch (acesTier({ count, heartsAce, fourthWins })) {
		case 'none':
			return 'Each Ace makes Salvation easier';
		case 'locked':
			return 'Salvation unlocks with the Ace of Hearts';
		case 'four':
		case 'final':
			return `All four Aces: ${rule}`;
		default:
			return `Salvation needs ${SALVATION_TARGET[count]}+`;
	}
}

/**
 * What the Tokens tile says, by tier (the label can be the game's own)
 * @param {{ unlocked?: boolean, tokens: number, start?: number, label?: string }} state
 */
export function tokensSpoken({
	unlocked = false,
	tokens,
	start = DEFAULT_STARTING_TOKENS,
	label = 'Tokens'
}) {
	const tier = tokensTier({ unlocked, tokens, start });
	if (tier === 'locked') return `${label} locked until the Ace of Hearts`;
	const left = `${label} ${tokens} of ${start} left`;
	switch (tier) {
		case 'half':
			return `${left}, halfway there`;
		case 'near':
			return `${left}, ${tokens === 1 ? 'one' : 'two'} to go`;
		case 'clear':
			return `${left}, all cleared`;
		case 'over':
			return `${left}, ${tokens - start} more than at the start`;
		default:
			return left;
	}
}
