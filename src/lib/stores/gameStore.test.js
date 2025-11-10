/**
 * Unit tests for gameStore.svelte.js
 * Tests the Svelte 5 runes-based game state management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	gameState,
	getCurrentScreen,
	getGameStats,
	getHasWon,
	getHasLost,
	getCurrentEvents,
	validateTransition,
	transitionTo,
	updateGameState
} from './gameStore.svelte.js';

describe('gameStore', () => {
	describe('Initial State', () => {
		it('should have correct initial state values', () => {
			expect(gameState.state).toBe('loadGame');
			expect(gameState.playerName).toBe('');
			expect(gameState.tower).toBe(54);
			expect(gameState.tokens).toBe(10);
			expect(gameState.round).toBe(0);
			expect(gameState.kingsRevealed).toBe(0);
			expect(gameState.gameOver).toBe(false);
			expect(gameState.win).toBe(false);
		});

		it('should have empty arrays for deck, discard, and log', () => {
			expect(gameState.deck).toEqual([]);
			expect(gameState.discard).toEqual([]);
			expect(gameState.log).toEqual([]);
			expect(gameState.journalEntries).toEqual([]);
		});

		it('should have all kings set to false initially', () => {
			expect(gameState.kingOfHearts).toBe(false);
			expect(gameState.kingOfDiamonds).toBe(false);
			expect(gameState.kingOfClubs).toBe(false);
			expect(gameState.kingOfSpades).toBe(false);
		});

		it('should have getRandomNumber function', () => {
			expect(typeof gameState.getRandomNumber).toBe('function');
		});
	});

	describe('getCurrentScreen', () => {
		it('should return current state', () => {
			expect(getCurrentScreen()).toBe('loadGame');
		});

		it('should update when state changes', () => {
			const oldState = getCurrentScreen();
			gameState.state = 'intro';
			expect(getCurrentScreen()).toBe('intro');
			// Reset
			gameState.state = oldState;
		});
	});

	describe('getGameStats', () => {
		it('should return game statistics', () => {
			const stats = getGameStats();
			expect(stats).toEqual({
				tower: 54,
				tokens: 10,
				round: 0,
				cardsRemaining: 0
			});
		});

		it('should reflect deck changes', () => {
			gameState.deck = [{ card: 'A', suit: 'hearts' }];
			const stats = getGameStats();
			expect(stats.cardsRemaining).toBe(1);
			gameState.deck = [];
		});
	});

	describe('getHasWon', () => {
		beforeEach(() => {
			gameState.tokens = 10;
			gameState.tower = 54;
		});

		it('should return true when tokens are 0 and tower > 0', () => {
			gameState.tokens = 0;
			gameState.tower = 10;
			expect(getHasWon()).toBe(true);
		});

		it('should return false when tokens > 0', () => {
			gameState.tokens = 5;
			gameState.tower = 10;
			expect(getHasWon()).toBe(false);
		});

		it('should return false when tower <= 0', () => {
			gameState.tokens = 0;
			gameState.tower = 0;
			expect(getHasWon()).toBe(false);
		});
	});

	describe('getHasLost', () => {
		beforeEach(() => {
			gameState.tower = 54;
			gameState.kingsRevealed = 0;
		});

		it('should return true when tower <= 0', () => {
			gameState.tower = 0;
			expect(getHasLost()).toBe(true);
		});

		it('should return true when tower is negative', () => {
			gameState.tower = -5;
			expect(getHasLost()).toBe(true);
		});

		it('should return true when kingsRevealed >= 4', () => {
			gameState.kingsRevealed = 4;
			expect(getHasLost()).toBe(true);
		});

		it('should return false when tower > 0 and kings < 4', () => {
			gameState.tower = 10;
			gameState.kingsRevealed = 2;
			expect(getHasLost()).toBe(false);
		});
	});

	describe('getCurrentEvents', () => {
		beforeEach(() => {
			gameState.log = [];
			gameState.round = 1;
		});

		it('should return empty array when no events', () => {
			expect(getCurrentEvents()).toEqual([]);
		});

		it('should return only events for current round', () => {
			gameState.log = [
				{ round: 1, message: 'Event 1' },
				{ round: 1, message: 'Event 2' },
				{ round: 2, message: 'Event 3' }
			];
			gameState.round = 1;

			const events = getCurrentEvents();
			expect(events).toHaveLength(2);
			expect(events[0].message).toBe('Event 1');
			expect(events[1].message).toBe('Event 2');
		});

		it('should update when round changes', () => {
			gameState.log = [
				{ round: 1, message: 'Event 1' },
				{ round: 2, message: 'Event 2' }
			];
			gameState.round = 2;

			const events = getCurrentEvents();
			expect(events).toHaveLength(1);
			expect(events[0].message).toBe('Event 2');
		});
	});

	describe('validateTransition', () => {
		it('should allow valid transitions', () => {
			expect(() => validateTransition('loadGame', 'options')).not.toThrow();
			expect(() => validateTransition('intro', 'rollForTasks')).not.toThrow();
			expect(() => validateTransition('rollForTasks', 'drawCard')).not.toThrow();
		});

		it('should always allow transition to exitGame', () => {
			expect(() => validateTransition('intro', 'exitGame')).not.toThrow();
			expect(() => validateTransition('drawCard', 'exitGame')).not.toThrow();
		});

		it('should always allow transition to errorScreen', () => {
			expect(() => validateTransition('intro', 'errorScreen')).not.toThrow();
			expect(() => validateTransition('drawCard', 'errorScreen')).not.toThrow();
		});

		it('should throw error for invalid transitions', () => {
			expect(() => validateTransition('loadGame', 'drawCard')).toThrow(/Invalid transition/);
			expect(() => validateTransition('intro', 'gameOver')).toThrow(/Invalid transition/);
		});

		it('should provide helpful error message', () => {
			try {
				validateTransition('loadGame', 'intro');
			} catch (error) {
				expect(error.message).toContain('loadGame → intro');
				expect(error.message).toContain('Valid transitions from loadGame');
			}
		});
	});

	describe('transitionTo', () => {
		beforeEach(() => {
			gameState.state = 'loadGame';
		});

		it('should update state for valid transitions', () => {
			transitionTo('options');
			expect(gameState.state).toBe('options');
		});

		it('should throw error for invalid transitions', () => {
			expect(() => transitionTo('drawCard')).toThrow();
			// State should remain unchanged after failed transition
			expect(gameState.state).toBe('loadGame');
		});

		it('should allow chained valid transitions', () => {
			transitionTo('options');
			expect(gameState.state).toBe('options');

			transitionTo('intro');
			expect(gameState.state).toBe('intro');

			transitionTo('rollForTasks');
			expect(gameState.state).toBe('rollForTasks');
		});
	});

	describe('updateGameState', () => {
		beforeEach(() => {
			gameState.tower = 54;
			gameState.tokens = 10;
			gameState.round = 0;
		});

		it('should update single property', () => {
			updateGameState({ tower: 50 });
			expect(gameState.tower).toBe(50);
		});

		it('should update multiple properties', () => {
			updateGameState({
				tower: 40,
				tokens: 8,
				round: 1
			});

			expect(gameState.tower).toBe(40);
			expect(gameState.tokens).toBe(8);
			expect(gameState.round).toBe(1);
		});

		it('should not affect unspecified properties', () => {
			const originalTokens = gameState.tokens;
			updateGameState({ tower: 45 });
			expect(gameState.tokens).toBe(originalTokens);
		});

		it('should handle complex objects', () => {
			const deck = [{ card: 'A', suit: 'hearts' }];
			updateGameState({ deck });
			expect(gameState.deck).toEqual(deck);
		});
	});

	describe('getRandomNumber', () => {
		it('should return a number between 1 and 6', () => {
			for (let i = 0; i < 100; i++) {
				const num = gameState.getRandomNumber();
				expect(num).toBeGreaterThanOrEqual(1);
				expect(num).toBeLessThanOrEqual(6);
				expect(Number.isInteger(num)).toBe(true);
			}
		});
	});

	describe('King Tracking', () => {
		beforeEach(() => {
			gameState.kingOfHearts = false;
			gameState.kingOfDiamonds = false;
			gameState.kingOfClubs = false;
			gameState.kingOfSpades = false;
			gameState.kingsRevealed = 0;
		});

		it('should track individual kings', () => {
			updateGameState({ kingOfHearts: true, kingsRevealed: 1 });
			expect(gameState.kingOfHearts).toBe(true);
			expect(gameState.kingsRevealed).toBe(1);
		});

		it('should track multiple kings', () => {
			updateGameState({
				kingOfHearts: true,
				kingOfDiamonds: true,
				kingsRevealed: 2
			});
			expect(gameState.kingOfHearts).toBe(true);
			expect(gameState.kingOfDiamonds).toBe(true);
			expect(gameState.kingsRevealed).toBe(2);
		});
	});

	describe('Ace of Hearts Tracking', () => {
		it('should track ace of hearts revelation', () => {
			expect(gameState.aceOfHeartsRevealed).toBe(false);
			updateGameState({ aceOfHeartsRevealed: true });
			expect(gameState.aceOfHeartsRevealed).toBe(true);
		});
	});

	describe('Journal Entries', () => {
		beforeEach(() => {
			gameState.journalEntries = [];
		});

		it('should store journal entries', () => {
			const entries = [
				{ round: 1, text: 'Entry 1' },
				{ round: 2, text: 'Entry 2' }
			];
			updateGameState({ journalEntries: entries });
			expect(gameState.journalEntries).toEqual(entries);
		});
	});

	describe('Game Configuration', () => {
		it('should store game config', () => {
			const config = { title: 'Test Game', difficulty: 1 };
			updateGameState({ config });
			expect(gameState.config).toEqual(config);
		});

		it('should store system config', () => {
			const systemConfig = { gameConfigUrl: '/games/test/' };
			updateGameState({ systemConfig });
			expect(gameState.systemConfig).toEqual(systemConfig);
		});

		it('should store stylesheet path', () => {
			updateGameState({ stylesheet: '/games/test/game.css' });
			expect(gameState.stylesheet).toBe('/games/test/game.css');
		});
	});
});
