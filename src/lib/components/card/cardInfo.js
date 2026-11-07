/**
 * Pure helpers for the card overlay: what a card does (its mechanic note and modifier line),
 * where it sits in the round, and how long auto-play holds it on screen.
 * They take plain objects so they are easy to test.
 */
import { getSalvationThreshold } from '../../services/d20Mechanics.js';
import { fourthAceWins } from '../../constants/difficulty.js';

/** Per the Wretched and Alone SRD: odd ranks call for a Stability check */
const ODD_RANKS = ['A', '3', '5', '7', '9'];

const SUIT_NAMES = { hearts: 'Hearts', diamonds: 'Diamonds', clubs: 'Clubs', spades: 'Spades' };
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
/** The type badge on the card face, also read out as part of the card's name */
export const TYPE_LABELS = {
	'primary-success': 'Victory',
	'failure-counter': 'Doom',
	narrative: 'Bonus',
	challenge: 'Challenge',
	event: 'Event'
};

/** The state a card was drawn into: the snapshot drawCard() keeps, else the live state */
function snapshot(card, state = {}) {
	return card?.gameState ?? state;
}

/** @returns {boolean} whether the card's rank is odd (A, 3, 5, 7, 9) */
export function isOddRank(card) {
	return ODD_RANKS.includes(card?.card);
}

/** @returns {boolean} whether a Stability check follows this card */
export function triggersStabilityCheck(card) {
	return isOddRank(card) && card?.modifier !== 'skip-damage';
}

/**
 * Which King this is (1 to 4), counting the Kings revealed before it.
 * @returns {number} 0 for any other card
 */
export function getKingNumber(card, state) {
	if (card?.card !== 'K') return 0;
	return Math.min(4, (snapshot(card, state).kingsRevealed ?? 0) + 1);
}

/** @returns {boolean} whether revealing this card ends the game (the fourth King) */
export function isFinalKing(card, state) {
	return getKingNumber(card, state) >= 4;
}

/**
 * @returns {boolean} whether this is the fourth Ace on Easy, where it ends the game: survive its
 *   Stability check (if it has one) and the player escapes. (On Normal and Hard the fourth Ace
 *   only makes Salvation a Stability check per token; state is the live game, for its difficulty.)
 */
export function isFourthAce(card, state) {
	return (
		card?.card === 'A' && (snapshot(card, state).acesRevealed ?? 0) >= 3 && fourthAceWins(state)
	);
}

/**
 * What a Salvation check needs once this Ace is counted, e.g. "Salvation now needs 14+".
 * Every Ace counts, but checks only start once the Ace of Hearts is out.
 */
function salvationNote(card, state) {
	const before = snapshot(card, state);
	const aces = Math.min(4, (before.acesRevealed ?? 0) + 1);
	const threshold = getSalvationThreshold(aces);
	if (card.suit === 'hearts') {
		return threshold === 0
			? 'Salvation unlocked · assured'
			: `Salvation unlocked · needs ${threshold}+`;
	}
	const unlocked = !!before.aceOfHeartsRevealed;
	// Four Aces: no target, only a Stability check stands between the player and the token
	if (threshold === 0) return unlocked ? 'Salvation is now assured' : 'Salvation will be assured';
	return unlocked ? `Salvation now needs ${threshold}+` : `Salvation will need ${threshold}+`;
}

/**
 * One-line footer saying what the card does, accurate to the rules. Empty for even cards.
 * @example getMechanicNote({ card: 'K', gameState: { kingsRevealed: 2 } }) // 'King · 3 of 4'
 * @example getMechanicNote({ card: '7' }) // 'Odd · a Stability check follows'
 */
export function getMechanicNote(card, state) {
	if (!card) return '';
	if (card.card === 'K') return `King · ${getKingNumber(card, state)} of 4`;
	// On Easy the fourth Ace ends the game; only its own Stability check stands in the way
	if (isFourthAce(card, state)) {
		return triggersStabilityCheck(card)
			? 'The fourth Ace · survive its Stability check and you escape'
			: 'The fourth Ace · you escape';
	}

	const parts = [];
	if (card.card === 'A') {
		parts.push(
			card.suit === 'hearts' ? salvationNote(card, state) : `Ace · ${salvationNote(card, state)}`
		);
	} else if (isOddRank(card)) {
		parts.push('Odd');
	}
	// skip-damage says so on the card face instead (see getModifierNote)
	if (triggersStabilityCheck(card)) parts.push('a Stability check follows');
	return parts.join(' · ');
}

/**
 * The line a special card carries on its face, saying what it does.
 * @returns {string} '' for a card without a modifier
 */
export function getModifierNote(card, state) {
	switch (card?.modifier) {
		case 'skip-damage':
			return 'No Stability check this time';
		case 'return-king':
			return (snapshot(card, state).kingsRevealed ?? 0) > 0
				? 'A King returns to the deck'
				: 'No King is out to return';
		default:
			return '';
	}
}

/**
 * Spoken name of a card, e.g. "8 of Spades, Event": rank, suit and the badge it wears.
 */
export function getCardName(card) {
	if (!card) return '';
	const rank = RANK_NAMES[card.card] ?? card.card;
	const suit = SUIT_NAMES[card.suit] ?? card.suit ?? '';
	const type = TYPE_LABELS[card.type];
	return `${rank}${suit ? ` of ${suit}` : ''}${type ? `, ${type}` : ''}`;
}

/**
 * Where the current card sits in this round: "Card 2 of 5".
 * Counts this round's drawn cards in the log plus the cards still to draw.
 * @returns {{index: number, total: number} | null} null before any card is drawn
 */
export function getRoundProgress(state) {
	const drawn = (state?.log ?? []).filter((entry) => entry?.card && entry.round === state.round);
	const total = drawn.length + Math.max(0, state?.cardsToDraw ?? 0);
	if (drawn.length === 0 || total === 0) return null;
	return { index: drawn.length, total };
}

/** Auto-play hold, with read-aloud off: long enough to read the card */
export const HOLD_BASE_MS = 1500;
export const HOLD_PER_WORD_MS = 60;
export const HOLD_MAX_MS = 15000;

/** @returns {number} words in the card's headline and story */
export function countWords(card) {
	const text = `${card?.description ?? ''} ${card?.story ?? ''}`.trim();
	return text ? text.split(/\s+/).length : 0;
}

/**
 * How long auto-play keeps a card on screen: 1.5s plus 60ms per word, capped at 15s.
 */
export function getCardHoldMs(card) {
	return Math.min(HOLD_MAX_MS, HOLD_BASE_MS + HOLD_PER_WORD_MS * countWords(card));
}
