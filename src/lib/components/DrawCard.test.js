/**
 * DrawCard and CardDeck between cards (OWN-7): dismissing a card while more remain leaves the
 * table empty for the draw pause, then the next card is drawn, once. A tap on the table, or the
 * step input (Space, the button), during the pause draws it at once, and only once. A card just
 * shown ignores a dismiss for CARD_GUARD_MS (game-copy-s-01), so a quick second input never skips
 * it unread.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import DrawCard from './DrawCard.svelte';
import { gameState, createRunState } from '../stores/gameStore.svelte.js';
import { resetSettings, stopNarration } from '../stores/audioStore.svelte.js';
import { ANIMATION_DURATION } from '../constants/animations.js';
import { CARD_GUARD_MS } from './card/drawBeat.js';

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
/** Call an input (it sleeps on the fake clock, `ms` for a draw) and let it finish */
async function input(fn, ms = 0) {
	const done = fn();
	await flush(ms);
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
	// The card is up and has been for CARD_GUARD_MS: it takes input
	await input(() => utils.component.draw(), CARD_GUARD_MS);
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
		// Up at once under reduced motion, taking input once it has been up CARD_GUARD_MS
		await flush(1);
		expect(getByTestId('card').classList.contains('materializing')).toBe(true);
		await flush(CARD_GUARD_MS);
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
		await flush(CARD_GUARD_MS);
		await Promise.all([first, second]);
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(2);
		expect(gameState.cardsToDraw).toBe(1);
	});

	it('a tap on the table during the pause (draw) draws at once, once', async () => {
		const { component } = await startRound();
		await dismiss(component);
		await flush(PAUSE / 2);

		await input(() => Promise.all([component.draw(), component.draw()]), CARD_GUARD_MS);
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

	it('game-copy-s-01: a second press 150ms or 250ms after a dismiss leaves the next card up', async () => {
		for (const gap of [150, 250]) {
			const { getByTestId, component, unmount } = await startRound();
			await dismiss(component);
			const drawn = actions.drawn;
			await flush(gap); // the next card is drawn at PAUSE (100ms) and is up at once
			expect(actions.drawn).toBe(drawn + 1);
			await input(() => component.handleButtonClick());
			expect(gameState.currentCard?.description).toBe(`Card ${drawn + 1}`);
			// Still face up, and it takes input once it has been up CARD_GUARD_MS
			await flush(CARD_GUARD_MS);
			expect(getByTestId('card').classList.contains('revealed')).toBe(true);
			unmount();
		}
	});

	it('game-copy-s-01: a second tap or Enter on the card itself is ignored too', async () => {
		const { getByTestId, component } = await startRound();
		await dismiss(component);
		await flush(150);
		const card = getByTestId('card');
		card.click();
		card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		await flush();
		expect(gameState.currentCard?.description).toBe('Card 2');
		await flush(CARD_GUARD_MS);
		expect(card.classList.contains('revealed')).toBe(true);
		expect(gameState.currentCard?.description).toBe('Card 2');
	});

	it('game-copy-s-01: on the last card of the round a second press does not skip it to the next step', async () => {
		const { component } = await startRound(2);
		await dismiss(component);
		await flush(150);
		await input(() => component.handleButtonClick());
		expect(gameState.state).toBe('drawCard');
		expect(gameState.currentCard?.description).toBe('Card 2');
	});

	it('game-copy-s-01: once the card has been up for the guard, one press dismisses it at once', async () => {
		const { getByTestId, component } = await startRound();
		await dismiss(component);
		await flush(PAUSE + CARD_GUARD_MS - 1); // card 2 has been up 399ms
		await input(() => component.handleButtonClick());
		expect(gameState.currentCard?.description).toBe('Card 2'); // still guarded
		await flush(1);
		expect(getByTestId('card').classList.contains('revealed')).toBe(true);
		await input(() => component.handleButtonClick());
		expect(gameState.currentCard).toBe(null);
		// Card 3, up for a second: the first press takes it
		await flush(PAUSE + 1000);
		expect(gameState.currentCard?.description).toBe('Card 3');
		await input(() => component.handleButtonClick());
		expect(gameState.currentCard).toBe(null);
	});

	it('leaving the draw step during the pause cancels the draw', async () => {
		const { component, unmount } = await startRound();
		await dismiss(component);
		unmount();
		await flush(PAUSE * 3);
		expect(actions.drawn).toBe(1);
	});
});
