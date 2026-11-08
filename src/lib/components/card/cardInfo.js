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
/**
 * The one name for each card type: the badge on the card face, the card's spoken name and the
 * story-mode chips (story/storyCards.js) all read it.
 */
export const TYPE_LABELS = {
	'primary-success': 'Salvation',
	'failure-counter': 'King',
	narrative: 'Ace',
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
 * @returns {boolean} whether continuing past this card ends the game at once: the fourth King,
 *   or on Easy a fourth Ace that skips its Stability check (see confirmCard). A fourth Ace with
 *   a check ends it on that check's result, not on the card.
 */
export function endsGameOnConfirm(card, state) {
	return isFinalKing(card, state) || (isFourthAce(card, state) && card?.modifier === 'skip-damage');
}

/**
 * What Salvation needs once this Ace is counted. The badge already names the card, so the
 * Ace of Hearts says "Unlocked · needs 14+" and another Ace "Salvation now needs 14+".
 * Every Ace counts, but checks only start once the Ace of Hearts is out. With four Aces there
 * is no target: each Salvation is a Stability check (Normal and Hard; Easy ends on the Ace).
 */
function salvationNote(card, state) {
	const before = snapshot(card, state);
	const aces = Math.min(4, (before.acesRevealed ?? 0) + 1);
	const threshold = getSalvationThreshold(aces);
	if (card.suit === 'hearts') {
		return threshold === 0 ? 'Unlocked · no target' : `Unlocked · needs ${threshold}+`;
	}
	const unlocked = !!before.aceOfHeartsRevealed;
	if (threshold === 0) {
		return unlocked ? 'Salvation now has no target' : 'Salvation will have no target';
	}
	return unlocked ? `Salvation now needs ${threshold}+` : `Salvation will need ${threshold}+`;
}

/**
 * One-line footer saying what the card does, accurate to the rules. Empty for even cards.
 * It leaves out what the type badge already says. The card face breaks it only at a ' · '.
 * @example getMechanicNote({ card: 'K', gameState: { kingsRevealed: 2 } }) // '3 of 4'
 * @example getMechanicNote({ card: '7' }) // 'Odd · a Stability check follows'
 */
export function getMechanicNote(card, state) {
	if (!card) return '';
	if (card.card === 'K') return `${getKingNumber(card, state)} of 4`;
	// On Easy the fourth Ace ends the game; only its own Stability check stands in the way
	if (isFourthAce(card, state)) {
		return triggersStabilityCheck(card)
			? 'The fourth Ace · survive its Stability check and you escape'
			: 'The fourth Ace · you escape';
	}

	const parts = [];
	if (card.card === 'A') parts.push(salvationNote(card, state));
	else if (isOddRank(card)) parts.push('Odd');
	// skip-damage says so on the card face instead (see getModifierNote)
	if (triggersStabilityCheck(card)) parts.push('a Stability check follows');
	return parts.join(' · ');
}

/** @returns {string[]} the note's clauses, each kept whole on a line: 'a · b' -> ['a', 'b'] */
export function splitNote(note) {
	return note ? String(note).split(' · ') : [];
}

/**
 * What continuing past this card does, for the footer hint ("Tap to …" / "Click to …"):
 * 'face the end' on the fourth King, 'escape' on Easy's fourth Ace without a check, else
 * 'continue'.
 */
export function getContinueAction(card, state) {
	if (isFinalKing(card, state)) return 'face the end';
	if (isFourthAce(card, state) && card?.modifier === 'skip-damage') return 'escape';
	return 'continue';
}

/**
 * The line a special card carries on its face, saying what it does.
 * @returns {string} '' for a card without a modifier
 */
export function getModifierNote(card, state) {
	switch (card?.modifier) {
		case 'skip-damage':
			return 'No Stability check for this Ace';
		case 'return-king':
			return (snapshot(card, state).kingsRevealed ?? 0) > 0
				? 'A King goes back into the deck'
				: 'No King is out to return';
		default:
			return '';
	}
}

/**
 * Spoken name of a card: rank, suit and the badge it wears, leaving out a badge that only
 * repeats the rank. "8 of Spades, Event", "Ace of Hearts, Salvation", "King of Spades".
 */
export function getCardName(card) {
	if (!card) return '';
	const rank = RANK_NAMES[card.card] ?? card.card;
	const suit = SUIT_NAMES[card.suit] ?? card.suit ?? '';
	const label = TYPE_LABELS[card.type];
	const type = label && label !== rank ? label : '';
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
/** A beat to take in the card's picture, when it has one */
export const HOLD_ART_MS = 1500;
export const HOLD_MAX_MS = 15000;

/** @returns {number} words in the card's headline and story */
export function countWords(card) {
	const text = `${card?.description ?? ''} ${card?.story ?? ''}`.trim();
	return text ? text.split(/\s+/).length : 0;
}

/**
 * How long auto-play keeps a card on screen: 1.5s plus 60ms per word, plus 1.5s for a picture,
 * capped at 15s.
 */
export function getCardHoldMs(card) {
	const art = card?.image?.src ? HOLD_ART_MS : 0;
	return Math.min(HOLD_MAX_MS, HOLD_BASE_MS + art + HOLD_PER_WORD_MS * countWords(card));
}

/**
 * The pictures of the next cards to be drawn (the top of the deck is its end), to fetch ahead
 * so a card's art is there when it rises.
 * @returns {string[]} image URLs, top card first
 */
export function getUpcomingArt(deck, count = 3) {
	return (deck ?? [])
		.slice(-count)
		.reverse()
		.map((card) => card?.image?.src)
		.filter(Boolean);
}
