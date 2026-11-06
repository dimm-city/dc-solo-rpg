/**
 * GameScreen's round-step wiring: one step button for every step (AN-02), presses held off
 * right after the button changes meaning (LS-06), a press during a roll skips it (LS-05),
 * and auto-play armed the moment it is switched on (LS-07).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { gameState, createRunState } from '../stores/gameStore.svelte.js';
import { rollDice, skipRoll } from '../stores/diceStore.svelte.js';
import { updateGameplaySettings, resetSettings } from '../stores/audioStore.svelte.js';
import { mockDieRoll, resetRNG } from '../services/random.js';
import GameScreen from './GameScreen.svelte';

// jsdom has neither matchMedia listeners (StabilityPanel reads the device pixel ratio) nor
// the Web Animations API (Svelte transitions): minimal stand-ins that finish at once
vi.hoisted(() => {
	Element.prototype.animate = function () {
		const animation = {
			onfinish: null,
			currentTime: 0,
			effect: { getComputedTiming: () => ({ progress: 1 }) },
			cancel() {},
			finish() {},
			play() {},
			pause() {}
		};
		setTimeout(() => animation.onfinish?.(), 0);
		return animation;
	};
	window.matchMedia = (query) => ({
		matches: false,
		media: query,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {}
	});
});

vi.mock('$app/navigation', () => ({ goto: vi.fn(async () => {}) }));
vi.mock('$app/paths', () => ({ resolve: (path) => path }));
vi.mock('../stores/indexedDBStorage.js', () => ({
	saveGame: vi.fn(async () => true),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));
vi.mock('../stores/diceStore.svelte.js', () => ({
	rollDice: vi.fn(async () => {}),
	skipRoll: vi.fn(() => true),
	resizeDiceBox: vi.fn(),
	updateDiceTheme: vi.fn(),
	diceState: { isRolling: false, lastRoll: null, staticRoll: null }
}));

const GUARD_MS = 400;

function setUp(state) {
	Object.assign(gameState, createRunState(), {
		state,
		round: 1,
		player: { name: 'Tester' },
		config: { title: 'Test', labels: {}, options: {}, introduction: '' },
		deck: [{ card: '8', suit: 'clubs' }],
		cardsToDraw: 0
	});
}

// Real timers: the HUD under GameScreen keeps animation-frame loops that fake timers would spin
async function settle(ms = 0) {
	await new Promise((resolve) => setTimeout(resolve, ms));
	await tick();
}

beforeEach(() => {
	resetRNG();
	resetSettings();
	rollDice.mockReset();
	rollDice.mockImplementation(async () => {});
	skipRoll.mockClear();
});

afterEach(() => resetSettings());

describe('GameScreen step button', () => {
	it('is one button that only changes its label from step to step', async () => {
		setUp('initialDamageRoll');
		const { getByTestId, container } = render(GameScreen);
		await settle(GUARD_MS);
		const button = getByTestId('initial-damage-button');
		expect(button.getAttribute('aria-label')).toBe('Roll for instability');

		mockDieRoll(13);
		await fireEvent.click(button);
		await settle(GUARD_MS);
		expect(button.getAttribute('aria-label')).toBe('Continue');

		await fireEvent.click(button);
		await settle(GUARD_MS);
		// Same element, new step
		expect(container.querySelector('[data-testid="roll-tasks-button"]')).toBe(button);
		expect(button.getAttribute('aria-label')).toBe('Roll for tasks');
		expect(container.querySelector('[data-testid="context-title"]').textContent).toBe('Round 1');
	});

	it('ignores a press that lands just after the button changed meaning', async () => {
		setUp('failureCheck');
		const { getByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(0);
		expect(getByTestId('failure-check-button').getAttribute('aria-label')).toBe('Continue');

		await fireEvent.click(getByTestId('failure-check-button')); // a double click
		expect(gameState.state).toBe('failureCheck');

		await settle(GUARD_MS);
		await fireEvent.click(getByTestId('failure-check-button'));
		expect(gameState.state).toBe('log');
	});

	it('a press during the roll skips to the result', async () => {
		setUp('failureCheck');
		let land;
		rollDice.mockImplementationOnce(() => new Promise((resolve) => (land = resolve)));
		const { getByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(GUARD_MS);
		expect(getByTestId('failure-check-button').getAttribute('aria-label')).toBe('Rolling…');

		await fireEvent.keyDown(window, { key: ' ' });
		expect(skipRoll).toHaveBeenCalledTimes(1);
		land();
		await settle(0);
		expect(getByTestId('result-line').textContent).toBe('Rolled 13 · no Stability lost · 20/20');
	});

	it('shows the Lucid modifier on the roll button only', async () => {
		setUp('failureCheck');
		gameState.isLucid = true;
		const { getByTestId, queryByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		expect(getByTestId('roll-modifier').textContent).toBe('Lucid: 2 dice, keep high');

		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(GUARD_MS);
		expect(queryByTestId('roll-modifier')).toBeNull();
		expect(getByTestId('failure-check-button').getAttribute('aria-label')).toBe('Continue');
	});

	it('arms auto-play the moment it is switched on, and cancels it when switched off', async () => {
		setUp('failureCheck');
		render(GameScreen);
		await settle(GUARD_MS);
		expect(rollDice).not.toHaveBeenCalled();

		updateGameplaySettings({ autoRollDice: true, autoAdvanceDelay: 300 });
		await settle(0);
		updateGameplaySettings({ autoRollDice: false });
		await settle(600);
		expect(rollDice).not.toHaveBeenCalled(); // switched off before it fired

		updateGameplaySettings({ autoRollDice: true });
		await settle(600);
		expect(rollDice).toHaveBeenCalledTimes(1);
	});
});
