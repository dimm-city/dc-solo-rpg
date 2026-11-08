/**
 * Words and symbols for cards in story mode: "J♣", "Jack of Clubs", what the card was,
 * and what its Stability check did. Card types use the card face's one table (cardInfo.js).
 */
import { TYPE_LABELS } from '../card/cardInfo.js';
import { formatModifierNotice } from '../../utils/rollResult.js';

// U+FE0E asks for the text glyph: without it some systems draw ♥ as a pink emoji
const SUITS = { hearts: '♥\uFE0E', diamonds: '♦\uFE0E', clubs: '♣\uFE0E', spades: '♠\uFE0E' };
const RANKS = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
/** What a special card did, as the board's notice says it (used when none was logged) */
const MODIFIERS = {
	'skip-damage': 'Skipped its Stability check',
	'return-king': 'A King went back into the deck'
};

const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

/** "J♣" (with the text-style selector) */
export function cardShort(card) {
	return `${card.card}${SUITS[card.suit] ?? ''}`;
}

/** "Jack of Clubs" */
export function cardName(card) {
	return `${RANKS[card.card] ?? card.card} of ${capitalize(card.suit)}`;
}

/** "Event", "Challenge", "King"… */
export function cardTypeLabel(type) {
	return TYPE_LABELS[type] ?? 'Card';
}

/** Red suits read red */
export function isRedSuit(card) {
	return card.suit === 'hearts' || card.suit === 'diamonds';
}

/** Plain words for a card's special rule, past tense, or '' */
export function modifierLabel(modifier) {
	return MODIFIERS[modifier] ?? '';
}

/**
 * What the card's special rule did: the sentence the board logged (entry.modifierResult,
 * e.g. "K♥ went back into the deck · Kings 0 of 4"), else the plain words above. A rule
 * that did nothing ("No King was out to return") has no line, by the board's rule
 * (formatModifierNotice): no screen states a non-event.
 */
export function modifierLine(card) {
	if (!card?.modifier) return '';
	if (card.modifierResult) return formatModifierNotice(card.modifierResult) ?? '';
	return modifierLabel(card.modifier);
}

/**
 * What the card's Stability check did, or '' when it had none.
 * "Stability check: rolled 4 · −2 Stability"
 */
export function rollLine(card) {
	if (card.diceRoll === undefined || card.diceRoll === null) return '';
	const roll = card.diceRoll;
	const loss = card.damageDealt ?? 0;
	let effect;
	if (roll === 20) effect = '+1 Stability · Lucid';
	else if (loss > 0) effect = `−${loss} Stability${roll === 1 ? ' · Surreal' : ''}`;
	else effect = 'no Stability lost';
	return `Stability check: rolled ${roll} · ${effect}`;
}
