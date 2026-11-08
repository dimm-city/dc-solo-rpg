/**
 * DrawCard and CardDeck between cards (OWN-7): dismissing a card while more remain leaves the
 * table empty for the draw pause, then the next card is drawn, once. A tap on the table, or the
 * step input (Space, the button), during the pause draws it at once, and only once.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import DrawCard from './DrawCard.svelte';
import { gameState, createRunState } from '../stores/gameStore.svelte.js';
import { resetSettings, stopNarration } from '../stores/audioStore.svelte.js';
import { ANIMATION_DURATION } from '../constants/animations.js';

// Reduced motion: the rise and the lift are instant, so only the pause is timed
vi.hoisted(() => {
	window.matchMedia = (query) => ({
		matches: query.includes('reduce'),
		media: query,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {}
	});
});

vi.mock('../stores/indexedDBStorage.js', () => ({
	saveGame: vi.fn(async () => true),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));

const actions = vi.hoisted(() => ({ drawn: 0 }));
vi.mock('../stores/gameActions.svelte.js', async () => {
	const { gameState } = await import('../stores/gameStore.svelte.js');
	return {
		drawCard: () => {
			actions.drawn += 1;
			gameState.currentCard = {
				card: String(2 * actions.drawn),
				suit: 'hearts',
				type: 'event',
				description: `Card ${actions.drawn}`,
				story: 'Quiet.',
				gameState: { kingsRevealed: 0, acesRevealed: 0, aceOfHeartsRevealed: false }
			};
			gameState.cardsToDraw -= 1;
		},
		confirmCard: () => {
			if (gameState.cardsToDraw <= 0) gameState.state = 'failureCheck';
		}
	};
});

const PAUSE = ANIMATION_DURATION.DRAW_PAUSE;
const flush = (ms = 0) => vi.advanceTimersByTimeAsync(ms);
/** Call an input (it sleeps on the fake clock) and let it finish */
async function input(fn) {
	const done = fn();
	await flush();
	await done;
}

async function startRound(cards = 3) {
	Object.assign(gameState, createRunState(), {
		state: 'drawCard',
		round: 1,
		cardsToDraw: cards,
		currentCard: null,
		config: { title: 'Test', labels: {}, options: {}, introduction: '' }
	});
	const utils = render(DrawCard);
	await input(() => utils.component.draw());
	return utils;
}

/** Dismiss the card that is up (Space or the step button), leaving the table empty for the pause */
async function dismiss(component) {
	await input(() => component.handleButtonClick());
	expect(gameState.currentCard).toBe(null);
}

beforeEach(() => {
	vi.useFakeTimers();
	actions.drawn = 0;
	localStorage.clear();
	resetSettings();
});

afterEach(() => {
	stopNarration();
	resetSettings();
	vi.useRealTimers();
});

describe('DrawCard, the pause before the next card', () => {
	it('the next card is not drawn before the pause, and is drawn once after it', async () => {
		const { getByTestId, component } = await startRound();
		expect(actions.drawn).toBe(1);
		await dismiss(component);

		await flush(PAUSE - 10);
		expect(actions.drawn).toBe(1);
		expect(gameState.currentCard).toBe(null);
		await flush(10);
		expect(actions.drawn).toBe(2);
		await flush(1);
		expect(getByTestId('card').classList.contains('revealed')).toBe(true);
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(2);
	});

	it('Space or the step button during the pause draws at once, and the pause adds no second draw', async () => {
		const { component } = await startRound();
		await dismiss(component);
		await flush(PAUSE / 3);

		const first = component.handleButtonClick();
		expect(actions.drawn).toBe(2);
		// A second press before the card is up is not a second draw
		const second = component.handleButtonClick();
		expect(actions.drawn).toBe(2);
		await flush();
		await Promise.all([first, second]);
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(2);
		expect(gameState.cardsToDraw).toBe(1);
	});

	it('a tap on the table during the pause (draw) draws at once, once', async () => {
		const { component } = await startRound();
		await dismiss(component);
		await flush(PAUSE / 2);

		await input(() => Promise.all([component.draw(), component.draw()]));
		expect(actions.drawn).toBe(2);
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(2);
	});

	it('draw() while a card is up does nothing: it never dismisses or draws over it', async () => {
		const { getByTestId, component } = await startRound();
		await input(() => component.draw());
		await flush(PAUSE);
		expect(actions.drawn).toBe(1);
		expect(getByTestId('card').classList.contains('revealed')).toBe(true);
	});

	it('after the last card of the round no draw is scheduled', async () => {
		const { component } = await startRound(1);
		await dismiss(component);
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(1);
		expect(gameState.state).toBe('failureCheck');
	});

	it('leaving the draw step during the pause cancels the draw', async () => {
		const { component, unmount } = await startRound();
		await dismiss(component);
		unmount();
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(1);
	});
});
