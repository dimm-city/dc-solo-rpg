import { describe, it, expect } from 'vitest';
import { getStoryOutcome, formatRounds } from './storyOutcome.js';

describe('getStoryOutcome', () => {
	it('calls a win an escape', () => {
		expect(getStoryOutcome({ isWon: true, finalTower: 12, kingsRevealed: 2 })).toEqual({
			kind: 'escaped',
			label: 'Escaped',
			won: true
		});
	});

	it('names the fourth King', () => {
		expect(getStoryOutcome({ isWon: false, finalTower: 9, kingsRevealed: 4 })).toEqual({
			kind: 'kings',
			label: 'Taken by the fourth King',
			won: false
		});
	});

	it('names Stability running out, even below zero', () => {
		expect(getStoryOutcome({ isWon: false, finalTower: 0, kingsRevealed: 1 }).label).toBe(
			'Fell when Stability reached 0'
		);
		expect(getStoryOutcome({ isWon: false, finalTower: -2, kingsRevealed: 3 }).kind).toBe(
			'stability'
		);
	});

	it('falls back to live state field names', () => {
		expect(getStoryOutcome({ win: false, tower: 0 }).kind).toBe('stability');
	});

	it('has a plain line for a loss it cannot explain', () => {
		expect(getStoryOutcome({ isWon: false, finalTower: 8, kingsRevealed: 1 })).toEqual({
			kind: 'lost',
			label: 'Did not escape',
			won: false
		});
	});
});

describe('formatRounds', () => {
	it('counts rounds', () => {
		expect(formatRounds(1)).toBe('1 round');
		expect(formatRounds(14)).toBe('14 rounds');
		expect(formatRounds(undefined)).toBe('0 rounds');
	});
});
