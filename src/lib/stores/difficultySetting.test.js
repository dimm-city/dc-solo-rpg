import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import { initializeGame } from './gameInit.js';
import { startGame } from './gameActions.svelte.js';
import { getSettings, updateSettings, resetSettings } from './settingsStore.svelte.js';

const player = { name: 'Tester' };

function makeConfig(options) {
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	return {
		slug: 'test',
		deck: suits.flatMap((suit) => ranks.map((card) => ({ card, suit, type: 'event' }))),
		...(options && { options })
	};
}

const hasAceOfHearts = () => gameState.deck.some((c) => c.card === 'A' && c.suit === 'hearts');

function expectEasy() {
	expect(hasAceOfHearts()).toBe(false);
	expect(gameState.acesRevealed).toBe(1);
}

function expectNormal() {
	expect(hasAceOfHearts()).toBe(true);
	expect(gameState.acesRevealed).toBe(0);
}

describe('Difficulty precedence', () => {
	beforeEach(() => {
		resetSettings();
	});

	it('author Easy with no player setting is Easy', () => {
		initializeGame(makeConfig({ difficulty: 0 }), player);
		expectEasy();
	});

	it('author Easy with player Normal is Normal', () => {
		updateSettings({ difficulty: 1 });
		initializeGame(makeConfig({ difficulty: 0 }), player);
		expectNormal();
	});

	it('author Normal with player Easy is Easy', () => {
		updateSettings({ difficulty: 0 });
		initializeGame(makeConfig({ difficulty: 1 }), player);
		expectEasy();
	});

	it('no author difficulty with player Easy is Easy', () => {
		updateSettings({ difficulty: 0 });
		initializeGame(makeConfig(), player);
		expectEasy();
	});

	it('explicit options.difficulty beats author and player', () => {
		updateSettings({ difficulty: 0 });
		initializeGame(makeConfig({ difficulty: 0 }), player, { difficulty: 1 });
		expectNormal();

		updateSettings({ difficulty: 1 });
		initializeGame(makeConfig({ difficulty: 1 }), player, { difficulty: 0 });
		expectEasy();
	});

	it('restart re-reads the player setting', () => {
		initializeGame(makeConfig({ difficulty: 1 }), player);
		expectNormal();

		updateSettings({ difficulty: 0 });
		startGame(gameState.player, gameState.originalConfig, {});
		expectEasy();

		updateSettings({ difficulty: null });
		startGame(gameState.player, gameState.originalConfig, {});
		expectNormal();
	});
});

describe('settingsStore difficulty', () => {
	beforeEach(() => {
		resetSettings();
	});

	it('defaults to null (game default)', () => {
		expect(getSettings().difficulty).toBeNull();
	});

	it('persists to localStorage', () => {
		updateSettings({ difficulty: 0 });
		expect(getSettings().difficulty).toBe(0);
		expect(JSON.parse(localStorage.getItem('gameSettings')).difficulty).toBe(0);
	});

	it('loads a stored value and falls back to null for invalid ones', async () => {
		const load = async (stored) => {
			vi.resetModules();
			localStorage.setItem('gameSettings', JSON.stringify(stored));
			return (await import('./settingsStore.svelte.js')).getSettings();
		};

		expect((await load({ diceTheme: 'default', difficulty: 0 })).difficulty).toBe(0);
		expect((await load({ diceTheme: 'default', difficulty: 1 })).difficulty).toBe(1);
		expect((await load({ diceTheme: 'default', difficulty: 7 })).difficulty).toBeNull();
		expect((await load({ diceTheme: 'default', difficulty: 'easy' })).difficulty).toBeNull();
		expect((await load({ diceTheme: 'default' })).difficulty).toBeNull();
	});
});
