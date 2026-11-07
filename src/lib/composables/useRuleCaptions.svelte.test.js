/* global $state, $effect */
/**
 * RC-02: one caption per screen, and no caption counts down behind an overlay.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flushSync } from 'svelte';
import { gameState } from '../stores/gameStore.svelte.js';
import { useRuleCaptions } from './useRuleCaptions.svelte.js';

vi.mock('../utils/instructionsStorage.js', () => ({
	areRuleTipsEnabled: () => true,
	markRuleTipSeen: () => {}
}));

const DISPLAY_MS = 1000;
let paused = $state(false);
let captions;
let cleanup;

function setGame(fields) {
	Object.assign(gameState, fields);
	flushSync();
}

beforeEach(() => {
	vi.useFakeTimers();
	paused = false;
	Object.assign(gameState, {
		state: 'rollForTasks',
		round: 1,
		kingsRevealed: 0,
		acesRevealed: 0,
		aceOfHeartsRevealed: false,
		tokens: 10,
		isLucid: false,
		isSurreal: false,
		gameOver: false,
		log: []
	});
	cleanup = $effect.root(() => {
		captions = useRuleCaptions({ displayMs: DISPLAY_MS, isPaused: () => paused });
	});
	flushSync();
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

describe('useRuleCaptions', () => {
	it('shows one caption per screen; the next waits for the next screen', () => {
		setGame({ isLucid: true });
		expect(captions.current?.id).toBe('lucid');

		setGame({ kingsRevealed: 1 }); // a second rule, same screen
		vi.advanceTimersByTime(DISPLAY_MS);
		flushSync();
		expect(captions.current).toBeNull();

		setGame({ state: 'failureCheck', log: [{ card: '8' }] });
		expect(captions.current?.id).toBe('king');
	});

	it('pauses the countdown while an overlay is open, and hides the caption', () => {
		setGame({ isLucid: true });
		vi.advanceTimersByTime(DISPLAY_MS / 2);

		paused = true;
		flushSync();
		expect(captions.paused).toBe(true);
		vi.advanceTimersByTime(DISPLAY_MS * 5);
		flushSync();
		expect(captions.current?.id).toBe('lucid'); // still there, unseen time does not count

		paused = false;
		flushSync();
		vi.advanceTimersByTime(DISPLAY_MS / 2 - 10);
		flushSync();
		expect(captions.current?.id).toBe('lucid');
		vi.advanceTimersByTime(10);
		flushSync();
		expect(captions.current).toBeNull();
	});

	it('starts nothing new while covered', () => {
		paused = true;
		flushSync();
		setGame({ isSurreal: true });
		expect(captions.current).toBeNull();
		paused = false;
		flushSync();
		expect(captions.current?.id).toBe('surreal');
	});
});
