import { describe, it, expect } from 'vitest';
import {
	cardShort,
	cardName,
	cardTypeLabel,
	isRedSuit,
	modifierLabel,
	modifierLine,
	rollLine
} from './storyCards.js';
import { TYPE_LABELS } from '../card/cardInfo.js';

describe('story card words', () => {
	it('names cards', () => {
		expect(cardShort({ card: 'J', suit: 'clubs' })).toBe('J♣\uFE0E');
		expect(cardShort({ card: '10', suit: 'hearts' })).toBe('10♥\uFE0E');
		expect(cardName({ card: 'K', suit: 'spades' })).toBe('King of Spades');
		expect(cardName({ card: '4', suit: 'diamonds' })).toBe('4 of Diamonds');
		expect(isRedSuit({ suit: 'diamonds' })).toBe(true);
		expect(isRedSuit({ suit: 'spades' })).toBe(false);
	});

	it('uses the game words for card types, never "Doom" or "Victory"', () => {
		expect(cardTypeLabel('failure-counter')).toBe('King');
		expect(cardTypeLabel('primary-success')).toBe('Salvation');
		expect(cardTypeLabel('narrative')).toBe('Ace');
		expect(cardTypeLabel('mystery')).toBe('Card');
		for (const [type, label] of Object.entries(TYPE_LABELS)) {
			expect(cardTypeLabel(type)).toBe(label);
		}
	});

	it('says what a special card did, as the board logged it', () => {
		expect(modifierLabel('skip-damage')).toBe('Skipped its Stability check');
		expect(modifierLabel('return-king')).toBe('A King went back into the deck');
		expect(modifierLabel(null)).toBe('');
		const returned = 'K♥ went back into the deck · 0 of 4 Kings out';
		expect(modifierLine({ modifier: 'return-king', modifierResult: returned })).toBe(returned);
		expect(modifierLine({ modifier: 'skip-damage' })).toBe('Skipped its Stability check');
		expect(modifierLine({ modifierResult: 'stale' })).toBe('');
		expect(modifierLine(null)).toBe('');
	});

	it('states no non-event: a King return with no King out has no line', () => {
		const card = { modifier: 'return-king', modifierResult: 'No King was out to return' };
		expect(modifierLine(card)).toBe('');
	});

	it('says what a Stability check did', () => {
		expect(rollLine({ diceRoll: 4, damageDealt: 2 })).toBe(
			'Stability check: rolled 4 · −2 Stability'
		);
		expect(rollLine({ diceRoll: 1, damageDealt: 3 })).toBe(
			'Stability check: rolled 1 · −3 Stability · Surreal'
		);
		expect(rollLine({ diceRoll: 15, damageDealt: 0 })).toBe(
			'Stability check: rolled 15 · no Stability lost'
		);
		expect(rollLine({ diceRoll: 20, damageDealt: 0 })).toBe(
			'Stability check: rolled 20 · +1 Stability · Lucid'
		);
		expect(rollLine({})).toBe('');
	});
});
