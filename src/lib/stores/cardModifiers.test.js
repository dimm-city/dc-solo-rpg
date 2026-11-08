import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import { drawCard, confirmCard } from './gameActions.svelte.js';
import { setRNG, resetRNG } from '../services/random.js';

const narrative = (modifier) => ({ card: 'A', suit: 'clubs', type: 'narrative', modifier });
const king = (suit) => ({ card: 'K', suit, type: 'failure-counter' });

describe('Card modifiers', () => {
	beforeEach(() => {
		gameState.state = 'drawCard';
		gameState.currentCard = null;
		gameState.cardsToDraw = 0;
		gameState.deck = [];
		gameState.log = [];
		gameState.round = 1;
		gameState.tokens = 10;
		gameState.acesRevealed = 0;
		gameState.aceOfHeartsRevealed = false;
		gameState.kingsRevealed = 0;
		gameState.kingOfHearts = false;
		gameState.kingOfDiamonds = false;
		gameState.kingOfClubs = false;
		gameState.kingOfSpades = false;
		gameState.gameOver = false;
		gameState.status = '';
		gameState.pendingUpdates = {};
		gameState.config = { labels: { failureCounterLoss: 'lost' } };
	});

	afterEach(() => resetRNG());

	describe('skip-damage', () => {
		it('skips its own failure check and routes to the log', () => {
			gameState.deck = [narrative('skip-damage')];
			drawCard();
			confirmCard();
			expect(gameState.state).toBe('log');
			expect(gameState.acesRevealed).toBe(1);
		});

		it('routes to the next draw when more cards are due', () => {
			gameState.deck = [narrative('skip-damage')];
			gameState.cardsToDraw = 2;
			drawCard();
			confirmCard();
			expect(gameState.state).toBe('drawCard');
		});

		it('says so when it skips the check (CK-01)', () => {
			gameState.deck = [narrative('skip-damage')];
			drawCard();
			confirmCard();
			// Past tense, named by its card (DP-1-08)
			expect(gameState.status).toBe('A♣ skipped its Stability check');
			expect(gameState.lastCard.modifierResult).toBe('A♣ skipped its Stability check');
			expect(gameState.status).not.toMatch(/this time/);
		});

		it('plain Narrative still triggers a failure check', () => {
			gameState.deck = [narrative(null)];
			drawCard();
			confirmCard();
			expect(gameState.state).toBe('failureCheck');
			expect(gameState.acesRevealed).toBe(1);
		});
	});

	describe('return-king', () => {
		it('returns a revealed King to the deck and still triggers its failure check', () => {
			gameState.kingsRevealed = 2;
			gameState.kingOfHearts = true;
			gameState.kingOfSpades = true;
			gameState.log = [{ ...king('hearts'), id: '1.1', round: 1, gameState: {} }];
			gameState.deck = [
				{ card: '2', suit: 'clubs' },
				{ card: '4', suit: 'clubs' },
				narrative('return-king')
			];
			setRNG(() => 0); // position 0 (bottom of the deck)
			drawCard();
			confirmCard();

			expect(gameState.kingsRevealed).toBe(1);
			expect(gameState.kingOfHearts).toBe(false);
			expect(gameState.kingOfSpades).toBe(true);
			expect(gameState.deck).toHaveLength(3);
			expect(gameState.deck[0]).toEqual(king('hearts'));
			expect(gameState.status).toBe('K♥ went back into the deck · 1 of 4 Kings out');
			expect(gameState.lastCard.modifierResult).toBe(gameState.status);
			expect(gameState.acesRevealed).toBe(1);
			expect(gameState.state).toBe('failureCheck');
		});

		it('has no effect when no King is revealed', () => {
			gameState.deck = [{ card: '2', suit: 'clubs' }, narrative('return-king')];
			drawCard();
			confirmCard();

			expect(gameState.kingsRevealed).toBe(0);
			expect(gameState.deck).toHaveLength(1);
			expect(gameState.status).toBe('No King was out to return');
			expect(gameState.acesRevealed).toBe(1);
		});

		it('does not end the game when a King is drawn after one was returned (3 revealed)', () => {
			gameState.kingsRevealed = 3;
			gameState.kingOfHearts = true;
			gameState.kingOfDiamonds = true;
			gameState.kingOfClubs = true;
			gameState.log = [{ ...king('hearts'), id: '1.1', round: 1, gameState: {} }];
			gameState.deck = [narrative('return-king')];
			setRNG(() => 0.99); // top of the deck: drawn next
			drawCard();
			confirmCard();
			expect(gameState.kingsRevealed).toBe(2);

			gameState.cardsToDraw = 1;
			drawCard(); // returned King of hearts
			confirmCard();
			expect(gameState.kingsRevealed).toBe(3);
			expect(gameState.gameOver).toBe(false);
		});
	});

	describe('lastCard (RF-03)', () => {
		it('keeps the confirmed card for the Stability check it causes', () => {
			gameState.deck = [{ card: '7', suit: 'spades', type: 'challenge', description: 'Gas leak' }];
			drawCard();
			confirmCard();
			expect(gameState.state).toBe('failureCheck');
			expect(gameState.currentCard).toBeNull();
			expect(gameState.lastCard).toMatchObject({
				card: '7',
				suit: 'spades',
				description: 'Gas leak'
			});
		});
	});
});
