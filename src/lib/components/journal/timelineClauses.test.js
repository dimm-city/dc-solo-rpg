/**
 * timelineClauses (game-copy-s-12): a long clause holding a total breaks at its own spaces and
 * keeps only its last word with the total, so the card label is never alone on its line.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { clauseRuns, rowClauses, HOLD } from './timelineClauses.js';
import { gameState, createRunState } from '../../stores/gameStore.svelte.js';
import GameTimeline from './GameTimeline.svelte';

describe('rowClauses', () => {
	it("splits a row at its ' · ' separators, leaving a held total in its clause", () => {
		expect(rowClauses(`Rolled 4 · −2 Stability${HOLD}14 of 20 · Surreal`)).toEqual([
			'Rolled 4',
			`−2 Stability${HOLD}14 of 20`,
			'Surreal'
		]);
		expect(rowClauses('')).toEqual([]);
		expect(rowClauses(undefined)).toEqual([]);
	});
});

describe('clauseRuns', () => {
	it('keeps a clause with no total whole', () => {
		expect(clauseRuns('Salvation unlocked')).toEqual({ lead: '', held: ['Salvation unlocked'] });
	});

	it('keeps a short clause whole with its total', () => {
		expect(clauseRuns(`−2 Stability${HOLD}14 of 20`)).toEqual({
			lead: '',
			held: ['−2 Stability', '14 of 20']
		});
		expect(clauseRuns(`Stability already full${HOLD}20 of 20`)).toEqual({
			lead: '',
			held: ['Stability already full', '20 of 20']
		});
	});

	it('lets a long clause break, holding only its last word to the total', () => {
		expect(clauseRuns(`K♥ went back into the deck${HOLD}Kings 0 of 4`)).toEqual({
			lead: 'K♥ went back into the ',
			held: ['deck', 'Kings 0 of 4']
		});
	});
});

describe('GameTimeline', () => {
	it('renders the return-King row with a breakable lead and the total held to "deck"', () => {
		Object.assign(gameState, createRunState(), {
			round: 2,
			gameOver: true,
			win: false,
			tower: 20,
			kingsRevealed: 0,
			log: [
				{
					id: 1,
					round: 1,
					card: 'K',
					suit: 'hearts',
					type: 'failure-counter',
					gameState: { tower: 20, kingsRevealed: 0, acesRevealed: 0 }
				},
				{
					id: 2,
					round: 2,
					card: 'A',
					suit: 'spades',
					type: 'narrative',
					modifier: 'return-king',
					modifierResult: `K♥ went back into the deck${HOLD}Kings 0 of 4`,
					gameState: { tower: 20, kingsRevealed: 1, acesRevealed: 0 }
				}
			]
		});
		const { container } = render(GameTimeline);
		const row = [...container.querySelectorAll('.tl-event')].find((li) =>
			li.textContent.includes('back into the deck')
		);
		expect(row).toBeTruthy();
		const clause = row.querySelector('.tl-clause.breaks');
		expect(clause).toBeTruthy();
		// The hold keeps "deck · Kings 0 of 4" together; the words before it may wrap
		expect(clause.querySelector('.tl-hold').textContent).toBe('deck · Kings 0 of 4');
		expect(clause.textContent.startsWith('K')).toBe(true);
		// A short clause (no total, or a short one) does not break
		expect(container.querySelectorAll('.tl-clause.breaks')).toHaveLength(1);
	});
});
