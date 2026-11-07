/**
 * GameScreen's round-step wiring: one step button for every step (AN-02), presses held off
 * right after the button changes meaning (LS-06), a press during a roll skips it (LS-05),
 * auto-play armed the moment it is switched on (LS-07), and results that move on by
 * themselves after the result hold (announced first, paused under a dialog).
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

// Every message handed to the live region's announcer, in order
const announcements = vi.hoisted(() => []);
vi.mock('../utils/liveAnnouncer.js', async (importOriginal) => {
	const actual = await importOriginal();
	return {
		createAnnouncer: (deliver, options) => {
			const announcer = actual.createAnnouncer(deliver, options);
			return {
				...announcer,
				announce(message, opts) {
					announcements.push(message);
					announcer.announce(message, opts);
				}
			};
		}
	};
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
	updateDiceTheme: vi.fn(),
	diceState: { isRolling: false, lastRoll: null, staticRoll: null }
}));

const GUARD_MS = 400;
const HOLD_MS = 2000; // ANIMATION_DURATION.RESULT_HOLD

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

// Real timers through a 2s hold: these take a few seconds each
describe('GameScreen result hold', { timeout: 15000 }, () => {
	it('announces the result, shows the run-out line, then moves on by itself', async () => {
		setUp('failureCheck');
		const { getByTestId, queryByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(50);

		// The live region has the result while the screen still shows it
		expect(getByTestId('live-region').textContent.trim()).toBe(
			'Rolled 13 · no Stability lost · 20/20'
		);
		expect(gameState.state).toBe('failureCheck');
		// The run-out line follows the hold's clock: part-run by now
		await settle(HOLD_MS / 2);
		const scale = Number(/scaleX\(([\d.]+)\)/.exec(getByTestId('step-advance').style.transform)[1]);
		expect(scale).toBeGreaterThan(0.2);
		expect(scale).toBeLessThan(0.8);

		await settle(HOLD_MS / 2);
		expect(gameState.state).toBe('log');
		expect(queryByTestId('step-advance')).toBeNull();
	});

	it('waits while the Exit dialog is open, and goes on after Keep playing', async () => {
		setUp('failureCheck');
		const { getByTestId, getByRole } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(50);

		await fireEvent.click(getByRole('button', { name: 'Exit game' }));
		await settle(HOLD_MS + 200);
		expect(gameState.state).toBe('failureCheck');
		expect(getByTestId('step-advance').classList.contains('paused')).toBe(true);

		await fireEvent.click(getByRole('button', { name: 'Keep playing' }));
		await settle(HOLD_MS);
		expect(gameState.state).toBe('log');
	});

	it('waits while the tab is hidden', async () => {
		setUp('failureCheck');
		const { getByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(50);

		const setHidden = (hidden) => {
			Object.defineProperty(document, 'hidden', { value: hidden, configurable: true });
			document.dispatchEvent(new Event('visibilitychange'));
		};
		try {
			setHidden(true);
			await settle(HOLD_MS + 200);
			expect(gameState.state).toBe('failureCheck');
		} finally {
			setHidden(false);
		}
		await settle(HOLD_MS);
		expect(gameState.state).toBe('log');
	});

	it('a press as the journal opens (meant for the step button) does not save an empty entry', async () => {
		setUp('failureCheck');
		const { getByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(HOLD_MS + 50);
		expect(gameState.state).toBe('log');

		await fireEvent.click(getByTestId('journal-save-button')); // the late press
		await settle(1000);
		expect(gameState.state).toBe('log');
		expect(gameState.journalEntries).toHaveLength(0);

		await fireEvent.click(getByTestId('journal-save-button'));
		await settle(1000);
		expect(gameState.journalEntries).toHaveLength(1);
		expect(gameState.state).toBe('rollForTasks');
	});

	it('a result that ends the game waits for the player, and auto-play still takes it on', async () => {
		setUp('failureCheck');
		gameState.tower = 2;
		const { getByTestId, queryByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		mockDieRoll(3);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(HOLD_MS + 200);
		expect(gameState.state).toBe('failureCheck');
		expect(getByTestId('failure-check-button').getAttribute('aria-label')).toBe('Face the end');
		expect(queryByTestId('step-advance')).toBeNull();

		updateGameplaySettings({ autoContinueAfterReading: true, autoAdvanceDelay: 300 });
		await settle(600);
		expect(gameState.state).toBe('gameOver');
	});

	it("on Easy, the fourth Ace's check says what is at stake, and the win waits for the player", async () => {
		setUp('failureCheck');
		gameState.config.options.difficulty = 0;
		Object.assign(gameState, {
			acesRevealed: 4,
			aceOfHeartsRevealed: true,
			tokens: 6,
			tower: 9,
			lastCard: { id: '1.1', round: 1, card: 'A', suit: 'spades', description: 'The last Ace' }
		});
		const { getByTestId, queryByTestId, container } = render(GameScreen);
		await settle(GUARD_MS);
		expect(container.querySelector('[data-testid="context-title"]').textContent).toBe(
			'Final Stability Check'
		);
		expect(container.querySelector('.context-description').textContent).toBe(
			'The fourth Ace is out. Survive this one Stability check and you escape. If it takes your last Stability, you fall.'
		);
		const button = getByTestId('failure-check-button');
		expect(button.getAttribute('aria-label')).toBe(
			'Roll for Stability · survive this and you escape'
		);

		mockDieRoll(13);
		await fireEvent.click(button);
		await settle(HOLD_MS + 200);
		// No hold: the ending waits
		expect(gameState.state).toBe('failureCheck');
		expect(gameState.win).toBe(true);
		expect(getByTestId('result-line').textContent).toBe(
			'Rolled 13 · no Stability lost · 9/20 · you escape'
		);
		expect(button.getAttribute('aria-label')).toBe('Escape');
		expect(queryByTestId('step-advance')).toBeNull();

		await fireEvent.click(button);
		await settle(GUARD_MS);
		expect(gameState.state).toBe('gameOver');
	});

	it.each([
		['Normal', 1],
		['Hard', 2]
	])(
		"on %s, the fourth Ace's check is an ordinary one, and Salvation then has no target",
		async (_, difficulty) => {
			setUp('failureCheck');
			gameState.config.options.difficulty = difficulty;
			Object.assign(gameState, {
				acesRevealed: 4,
				aceOfHeartsRevealed: true,
				tokens: 6,
				tower: 9,
				lastCard: { id: '1.1', round: 1, card: 'A', suit: 'spades', description: 'The last Ace' }
			});
			const { getByTestId, container } = render(GameScreen);
			await settle(GUARD_MS);
			expect(container.querySelector('[data-testid="context-title"]').textContent).toBe(
				'Stability Check'
			);
			expect(container.querySelector('.context-description').textContent).toBe(
				'An odd card demands a price. Roll to see how much Stability you lose.'
			);
			const button = getByTestId('failure-check-button');
			expect(button.getAttribute('aria-label')).toBe('Roll for damage');

			mockDieRoll(13);
			await fireEvent.click(button);
			await settle(GUARD_MS);
			expect(gameState.win).toBe(false);
			expect(gameState.gameOver).toBe(false);
			expect(getByTestId('result-line').textContent).toBe('Rolled 13 · no Stability lost · 9/20');

			// The round goes on: no cards left, so Salvation, with no target to beat
			await fireEvent.click(button);
			await settle(GUARD_MS);
			expect(gameState.state).toBe('successCheck');
			expect(container.querySelector('[data-testid="context-title"]').textContent).toBe(
				'Salvation'
			);
			expect(container.querySelector('.context-description').textContent).toBe(
				'All four Aces are out. No target to beat now: survive one Stability check and a token comes off.'
			);
			expect(getByTestId('success-check-button').getAttribute('aria-label')).toBe(
				'Roll for Stability · Salvation is assured'
			);
		}
	);
});

describe('GameScreen: each visit to a step starts clean', () => {
	it('NV-04: the next round opens on "Roll for tasks", with nothing stale shown or announced', async () => {
		setUp('rollForTasks');
		gameState.deck = [
			{ card: '8', suit: 'clubs' },
			{ card: '4', suit: 'hearts' }
		];
		const { getByTestId, queryByTestId } = render(GameScreen);
		announcements.length = 0;
		await settle(GUARD_MS);
		mockDieRoll(3);
		await fireEvent.click(getByTestId('roll-tasks-button'));
		await settle(50);
		expect(getByTestId('result-line').textContent).toBe('Rolled 3 · Draw 2 cards');
		gameState.state = 'drawCard'; // the deal
		await settle(1100);

		// Round 2 opens: from its first render the button and the table are clean
		const labels = [];
		const observer = new MutationObserver(() =>
			labels.push(document.querySelector('#step-action button')?.getAttribute('aria-label'))
		);
		observer.observe(document.body, { subtree: true, childList: true, attributes: true });
		Object.assign(gameState, { state: 'rollForTasks', round: 2, cardsToDraw: 0 });
		await settle(50);
		observer.disconnect();
		expect(labels.filter((label) => label && label !== 'Roll for tasks')).toEqual([]);
		expect(getByTestId('roll-tasks-button').getAttribute('aria-label')).toBe('Roll for tasks');
		expect(queryByTestId('result-line')).toBeNull();
		await settle(1100);
		// Round 1's roll was announced once, when it was made, and not again
		expect(announcements.filter((m) => m === 'Rolled 3 · Draw 2 cards')).toHaveLength(1);
	});

	it('NV-06: a modifier notice shows on the first table screen after its card, then goes', async () => {
		setUp('failureCheck');
		gameState.lastCard = {
			id: '1.1',
			round: 1,
			card: 'A',
			suit: 'clubs',
			modifierResult: 'King of Hearts returns to the deck · 2 of 4'
		};
		Object.assign(gameState, { aceOfHeartsRevealed: true, tokens: 5, acesRevealed: 2 });
		const { getByTestId, queryByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		expect(getByTestId('context-notice').textContent).toBe(
			'King of Hearts returns to the deck · 2 of 4'
		);

		mockDieRoll(13);
		await fireEvent.click(getByTestId('failure-check-button'));
		await settle(GUARD_MS);
		await fireEvent.click(getByTestId('failure-check-button')); // on to Salvation
		await settle(GUARD_MS);
		expect(gameState.state).toBe('successCheck');
		expect(queryByTestId('context-notice')).toBeNull();
	});

	it('NV-06: on Salvation the notice names its card', async () => {
		setUp('successCheck');
		gameState.lastCard = {
			id: '1.1',
			round: 1,
			card: 'A',
			suit: 'clubs',
			modifierResult: 'No Stability check this time'
		};
		Object.assign(gameState, { aceOfHeartsRevealed: true, tokens: 5, acesRevealed: 2 });
		const { getByTestId } = render(GameScreen);
		await settle(GUARD_MS);
		expect(getByTestId('context-notice').textContent).toBe('A♣ · No Stability check this time');
	});
});
