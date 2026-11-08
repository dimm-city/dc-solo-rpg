import { describe, it, expect } from 'vitest';
import { getEndingCause, getEndingText, getRunRecap, getStatusLine } from './endingSummary.js';

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

	it('uses the win message and no afterword on a win', () => {
		const text = getEndingText({ win: true, tower: 4, kingsRevealed: 0, tokens: 0 }, labels);
		expect(text.message).toBe('You got out.');
		expect(text.cause).toBeNull();
		expect(text.afterword).toBe('');
	});

	it('names the fourth Ace on a win it brought (Easy: tokens still left), not on a tokens win', () => {
		const fourthAce = { win: true, tower: 7, kingsRevealed: 2, acesRevealed: 4, tokens: 6 };
		expect(getEndingText(fourthAce, labels).causeLine).toBe('The fourth Ace was revealed.');
		expect(getEndingText(fourthAce, { ...labels, acesCauseLine: 'Four Aces.' }).causeLine).toBe(
			'Four Aces.'
		);
	});

	it('names the last Token on a win by the tokens, as the fourth-Ace win names its Ace', () => {
		const tokensWin = { win: true, tower: 7, kingsRevealed: 2, acesRevealed: 3, tokens: 0 };
		expect(getEndingText(tokensWin, labels).causeLine).toBe('The last Token was removed.');
		// Normal and Hard: four Aces, then the last token
		expect(getEndingText({ ...tokensWin, acesRevealed: 4 }, labels).causeLine).toBe(
			'The last Token was removed.'
		);
		expect(
			getEndingText(tokensWin, { ...labels, tokensCauseLine: 'The ledger is clear.' }).causeLine
		).toBe('The ledger is clear.');
	});

	it('keeps "Winning was never likely" off an Easy loss, where escape is likely', () => {
		const loss = { kingsRevealed: 4, tower: 3 };
		const easy = { ...loss, config: { options: { difficulty: 0 } } };
		expect(getEndingText(easy, labels).afterword).toBe(
			'What you wrote along the way is the story.'
		);
		expect(getEndingText(easy, labels).afterword).not.toMatch(/never likely/);
		for (const difficulty of [1, 2]) {
			expect(
				getEndingText({ ...loss, config: { options: { difficulty } } }, labels).afterword
			).toBe('Winning was never likely. What you wrote along the way is the story.');
		}
		expect(getEndingText(loss, labels).afterword).toMatch(/^Winning was never likely/);
		expect(getEndingText(easy, { ...labels, gameOverAfterword: 'Rest.' }).afterword).toBe('Rest.');
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

	it('counts rounds, drawn cards (not rolls), Kings, Aces and Stability in the HUD’s n/max', () => {
		const byKey = Object.fromEntries(getRunRecap(state).map((r) => [r.key, r.value]));
		expect(byKey).toEqual({
			rounds: '6',
			cards: '3/52',
			kings: '3/4',
			aces: '2/4',
			stability: '0/20'
		});
	});

	it('uses the HUD’s words for the labels, and spells out each count for a screen reader', () => {
		const recap = getRunRecap({ ...state, aceOfHeartsRevealed: true });
		expect(recap.map((r) => r.label)).toEqual([
			'Rounds',
			'Cards',
			'Kings',
			'Aces',
			'Stability',
			'Tokens'
		]);
		expect(recap.map((r) => r.spoken)).toEqual([
			'Rounds 6',
			'Cards drawn 3 of 52',
			'Kings 3 of 4',
			'Aces 2 of 4',
			'Stability 0 of 20',
			'Tokens 8 of 10'
		]);
		const kings = recap.find((r) => r.key === 'kings');
		expect([kings.n, kings.max, kings.danger]).toEqual([3, 4, true]);
	});

	it('includes tokens only once Salvation was unlocked, out of the tokens the game started with', () => {
		expect(getRunRecap(state).some((r) => r.key === 'tokens')).toBe(false);
		const recap = getRunRecap({
			...state,
			aceOfHeartsRevealed: true,
			config: { options: { startingTokens: 6 } }
		});
		expect(recap.find((r) => r.key === 'tokens').value).toBe('8/6');
	});
});

describe('getStatusLine', () => {
	it('builds the status line label first, n of max, with tokens only after Salvation unlocks (game-copy-v-04)', () => {
		const base = { tower: 9, kingsRevealed: 3, tokens: 11 };
		expect(getStatusLine(base)).toBe('Stability 9 of 20 · Kings 3 of 4');
		expect(getStatusLine({ ...base, aceOfHeartsRevealed: true })).toBe(
			'Stability 9 of 20 · Kings 3 of 4 · Tokens 11 left'
		);
		expect(getStatusLine({ ...base, tokens: 1, aceOfHeartsRevealed: true })).toBe(
			'Stability 9 of 20 · Kings 3 of 4 · Tokens 1 left'
		);
		expect(getStatusLine({ tower: -2, kingsRevealed: 4 })).toBe('Stability 0 of 20 · Kings 4 of 4');
	});
});
