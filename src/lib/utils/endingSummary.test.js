import { describe, it, expect } from 'vitest';
import {
	getEndingCause,
	getEndingText,
	getRunRecap,
	getKeyMoments,
	getStatusLine
} from './endingSummary.js';

const labels = {
	failureCheckLoss: 'The tower fell.',
	failureCounterLoss: 'The tower fell.',
	successCheckWin: 'You got out.'
};

const log = [
	{ card: '5', suit: 'hearts', round: 1 },
	{ type: 'initial-damage', roll: 4, round: 0 },
	{ card: 'K', suit: 'spades', round: 2 },
	{ card: 'A', suit: 'hearts', round: 2 },
	{ type: 'final-damage', roll: 9, round: 3 }
];

describe('getEndingCause', () => {
	it('is kings when the fourth King is revealed', () => {
		expect(getEndingCause({ kingsRevealed: 4, tower: 12 })).toBe('kings');
	});

	it('is stability when Stability reached 0', () => {
		expect(getEndingCause({ kingsRevealed: 2, tower: 0 })).toBe('stability');
	});

	it('is null on a win', () => {
		expect(getEndingCause({ win: true, kingsRevealed: 1, tower: 5 })).toBeNull();
	});
});

describe('getEndingText', () => {
	it('keeps the author message and adds the King cause line', () => {
		const text = getEndingText({ kingsRevealed: 4, tower: 9 }, labels);
		expect(text.message).toBe('The tower fell.');
		expect(text.causeLine).toBe('The fourth King was revealed.');
		expect(text.afterword).toMatch(/Winning was never likely/);
	});

	it('adds the Stability cause line', () => {
		const text = getEndingText({ kingsRevealed: 1, tower: 0 }, labels);
		expect(text.causeLine).toBe('Your Stability reached 0.');
	});

	it('uses the win message and no cause or afterword on a win', () => {
		const text = getEndingText({ win: true, tower: 4, kingsRevealed: 0 }, labels);
		expect(text.message).toBe('You got out.');
		expect(text.causeLine).toBe('');
		expect(text.afterword).toBe('');
	});

	it('names the fourth Ace on a win it brought (Easy: tokens still left), not on a tokens win', () => {
		const fourthAce = { win: true, tower: 7, kingsRevealed: 2, acesRevealed: 4, tokens: 6 };
		expect(getEndingText(fourthAce, labels).causeLine).toBe('The fourth Ace was revealed.');
		expect(getEndingText(fourthAce, { ...labels, acesCauseLine: 'Four Aces.' }).causeLine).toBe(
			'Four Aces.'
		);
		// Normal and Hard: four Aces, then the last token (no cause line, the message says it)
		expect(getEndingText({ ...fourthAce, tokens: 0 }, labels).causeLine).toBe('');
		expect(getEndingText({ ...fourthAce, acesRevealed: 3, tokens: 0 }, labels).causeLine).toBe('');
	});

	it('lets authors override the cause lines and afterword', () => {
		const text = getEndingText(
			{ kingsRevealed: 4, tower: 3 },
			{ ...labels, kingsCauseLine: 'Four crowns.', gameOverAfterword: 'Rest now.' }
		);
		expect(text.causeLine).toBe('Four crowns.');
		expect(text.afterword).toBe('Rest now.');
	});
});

describe('getRunRecap', () => {
	const state = {
		round: 6,
		kingsRevealed: 3,
		acesRevealed: 2,
		tower: 0,
		tokens: 8,
		aceOfHeartsRevealed: false,
		log
	};

	it('counts rounds, drawn cards (not rolls), Kings, Aces and Stability', () => {
		const byKey = Object.fromEntries(getRunRecap(state).map((r) => [r.key, r.value]));
		expect(byKey).toEqual({
			rounds: 6,
			cards: 3,
			kings: '3 of 4',
			aces: '2 of 4',
			stability: '0/20'
		});
	});

	it('includes tokens only once Salvation was unlocked', () => {
		const recap = getRunRecap({ ...state, aceOfHeartsRevealed: true });
		expect(recap.find((r) => r.key === 'tokens').value).toBe(8);
	});
});

describe('getKeyMoments and getStatusLine', () => {
	it('lists Kings and Aces in order', () => {
		expect(getKeyMoments(log).map((m) => m.label)).toEqual(['King of spades', 'Ace of hearts']);
	});

	it('builds the status line, with tokens only after Salvation unlocks', () => {
		const base = { tower: 9, kingsRevealed: 3, tokens: 11 };
		expect(getStatusLine(base)).toBe('Stability 9/20 · 3 of 4 Kings');
		expect(getStatusLine({ ...base, aceOfHeartsRevealed: true })).toBe(
			'Stability 9/20 · 3 of 4 Kings · 11 tokens left'
		);
	});
});
