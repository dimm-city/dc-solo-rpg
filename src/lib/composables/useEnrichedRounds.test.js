import { describe, it, expect } from 'vitest';
import { useEnrichedRounds } from './useEnrichedRounds.svelte.js';

const snap = (tower, kings, aces = 0) => ({
	tower,
	kingsRevealed: kings,
	acesRevealed: aces,
	tokens: 10,
	aceOfHeartsRevealed: false
});

const savedGame = {
	isWon: false,
	finalTower: 12,
	kingsRevealed: 4,
	tokens: 10,
	aceOfHeartsRevealed: false,
	config: { 'lose-message': 'The machine is silent.' },
	cardLog: [
		{ type: 'initial-damage', roll: 6, round: 0 },
		{
			round: 1,
			card: '7',
			suit: 'clubs',
			type: 'challenge',
			diceRoll: 4,
			damageDealt: 2,
			gameState: snap(20, 0)
		},
		{ round: 1, card: 'K', suit: 'spades', type: 'failure-counter', gameState: snap(18, 0) },
		{ round: 2, card: 'K', suit: 'hearts', type: 'failure-counter', gameState: snap(18, 1) },
		{ round: 3, card: 'K', suit: 'clubs', type: 'failure-counter', gameState: snap(14, 2) },
		{ round: 3, card: 'K', suit: 'diamonds', type: 'failure-counter', gameState: snap(14, 3) }
	],
	journalEntries: [
		{ round: 1, text: 'First night.' },
		{ round: 2, text: '   ', audioData: null },
		{ round: 3, text: '', audioData: 'data:audio/wav;base64,AAAA' }
	]
};

describe('useEnrichedRounds', () => {
	const rounds = useEnrichedRounds(savedGame);

	it('groups cards by round and drops roll entries', () => {
		expect(rounds.map((r) => r.roundNumber)).toEqual([1, 2, 3]);
		expect(rounds[0].cards.map((c) => c.card)).toEqual(['7', 'K']);
	});

	it('keeps the Stability check roll on its card', () => {
		expect(rounds[0].cards[0]).toMatchObject({ diceRoll: 4, damageDealt: 2 });
	});

	it('gives each round the state at its end', () => {
		// Round 1 ends where round 2 starts: the King of Spades counted
		expect(rounds[0].endState).toMatchObject({ tower: 18, kingsRevealed: 1 });
		// The last round ends on the saved final state: all four Kings
		expect(rounds[2].endState).toMatchObject({ tower: 12, kingsRevealed: 4 });
	});

	it('treats a blank entry as no entry and keeps a voice note', () => {
		expect(rounds[0].journalEntry).toEqual({ text: 'First night.', audio: null });
		expect(rounds[1].journalEntry).toBeNull();
		expect(rounds[2].journalEntry).toEqual({ text: '', audio: 'data:audio/wav;base64,AAAA' });
	});

	it('puts the ending on the last round only', () => {
		expect(rounds[2].gameOverMessage).toBe('The machine is silent.');
		expect(rounds[0].gameOverMessage).toBeNull();
	});

	it('counts Aces from the log when an older save has no count', () => {
		const withAce = {
			...savedGame,
			cardLog: [
				...savedGame.cardLog,
				{ round: 3, card: 'A', suit: 'hearts', gameState: snap(14, 4) }
			]
		};
		const last = useEnrichedRounds(withAce).at(-1);
		expect(last.endState.acesRevealed).toBe(1);
	});

	it('returns nothing for a save without a log', () => {
		expect(useEnrichedRounds(null)).toEqual([]);
	});
});
