/* global $state, $effect */
/**
 * RC-02 and DP-1-09: a caption starts only on arriving at a table screen, one per arrival; it
 * goes when that step's roll starts; no caption counts down behind an overlay.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flushSync } from 'svelte';
import { gameState } from '../stores/gameStore.svelte.js';
import { diceState } from '../stores/diceStore.svelte.js';
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
		log: [],
		lastCard: null
	});
	diceState.isRolling = false;
	diceState.staticRoll = null;
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
	it('starts a caption only on arriving at a table screen, one per arrival', () => {
		setGame({ isLucid: true, kingsRevealed: 1 }); // two rules, no arrival yet
		expect(captions.current).toBeNull();

		setGame({ state: 'drawCard' });
		expect(captions.current).toBeNull(); // the card is not a table screen
		setGame({ state: 'failureCheck', log: [{ card: '8' }] });
		expect(captions.current?.id).toBe('lucid'); // the more important one first

		vi.advanceTimersByTime(DISPLAY_MS);
		flushSync();
		expect(captions.current).toBeNull(); // the King waits for the next arrival

		setGame({ state: 'drawCard' });
		setGame({ state: 'failureCheck', log: [{ card: '8' }, { card: '4' }] });
		expect(captions.current?.id).toBe('king');
	});

	it("goes when that step's roll starts, the dice or the reduced-motion roll", () => {
		setGame({ kingsRevealed: 1 });
		setGame({ state: 'drawCard' });
		setGame({ state: 'failureCheck', log: [{ card: '8' }] });
		expect(captions.current?.id).toBe('king');
		diceState.isRolling = true;
		flushSync();
		expect(captions.current).toBeNull();
		diceState.isRolling = false;

		setGame({ isSurreal: true, state: 'drawCard' });
		setGame({ state: 'failureCheck', log: [{ card: '8' }, { card: '6' }] });
		expect(captions.current?.id).toBe('surreal');
		diceState.staticRoll = { rolls: [4], kept: 4 };
		flushSync();
		expect(captions.current).toBeNull();
	});

	it('pauses the countdown while an overlay is open, and hides the caption', () => {
		setGame({ isLucid: true, state: 'drawCard' });
		setGame({ state: 'failureCheck', log: [{ card: '8' }] });
		expect(captions.current?.id).toBe('lucid');
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

	it('starts nothing new while covered: an arrival under an overlay waits for the table', () => {
		setGame({ isSurreal: true, state: 'drawCard' });
		paused = true;
		flushSync();
		setGame({ state: 'failureCheck', log: [{ card: '8' }] });
		expect(captions.current).toBeNull();
		paused = false;
		flushSync();
		expect(captions.current?.id).toBe('surreal');
	});
});
