/** Card art helpers: the hold beat for a picture, and which pictures to fetch ahead */
import { describe, it, expect } from 'vitest';
import { getCardHoldMs, getUpcomingArt, HOLD_ART_MS } from './cardInfo.js';

describe('auto-play hold with a picture', () => {
	it('adds a beat for the picture, within the cap', () => {
		const words = { description: 'Two words', story: 'and three more' };
		expect(getCardHoldMs({ ...words, image: { src: '/a.jpg', alt: '' } })).toBe(1800 + HOLD_ART_MS);
		expect(getCardHoldMs({ ...words, image: null })).toBe(1800);
		const long = {
			description: 'word '.repeat(150),
			story: 'word '.repeat(150),
			image: { src: '/a.jpg' }
		};
		expect(getCardHoldMs(long)).toBe(15000);
	});
});

describe('getUpcomingArt', () => {
	const deck = [
		{ card: '2', image: { src: '/bottom.jpg' } },
		{ card: '3', image: null },
		{ card: '4', image: { src: '/third.jpg' } },
		{ card: '5' },
		{ card: '6', image: { src: '/top.jpg' } }
	];

	it('lists the pictures of the next cards to be drawn, top of the deck first', () => {
		expect(getUpcomingArt(deck)).toEqual(['/top.jpg', '/third.jpg']);
		expect(getUpcomingArt(deck, 5)).toEqual(['/top.jpg', '/third.jpg', '/bottom.jpg']);
		expect(getUpcomingArt(deck, 1)).toEqual(['/top.jpg']);
	});

	it('is empty for an empty or missing deck', () => {
		expect(getUpcomingArt([])).toEqual([]);
		expect(getUpcomingArt(undefined)).toEqual([]);
	});
});
