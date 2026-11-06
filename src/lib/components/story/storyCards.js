/**
 * Words and symbols for cards in story mode: "J♣", "Jack of Clubs", what the card was,
 * and what its Stability check did.
 */

// U+FE0E asks for the text glyph: without it some systems draw ♥ as a pink emoji
const SUITS = { hearts: '♥\uFE0E', diamonds: '♦\uFE0E', clubs: '♣\uFE0E', spades: '♠\uFE0E' };
const RANKS = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const TYPES = {
	'primary-success': 'Salvation',
	'failure-counter': 'King',
	narrative: 'Ace',
	challenge: 'Challenge',
	event: 'Event'
};
const MODIFIERS = {
	'skip-damage': 'No Stability check',
	'return-king': 'Returns a King to the deck'
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
	return TYPES[type] ?? 'Card';
}

/** Red suits read red */
export function isRedSuit(card) {
	return card.suit === 'hearts' || card.suit === 'diamonds';
}

/** Plain words for a card's special rule, or '' */
export function modifierLabel(modifier) {
	return MODIFIERS[modifier] ?? '';
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
	else effect = 'no loss';
	return `Stability check: rolled ${roll} · ${effect}`;
}
