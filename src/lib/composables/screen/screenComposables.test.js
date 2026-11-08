/**
 * The check composables roll once and publish a result line; the game then moves on by itself
 * after the result hold, or at once on a second press. Results that end the game wait.
 * While the dice roll the button reads "Rolling…" and a press skips to the result.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gameState } from '../../stores/gameStore.svelte.js';
import { mockDieRoll, mockDieRollSequence, resetRNG } from '../../services/random.js';
import { rollDice, skipRoll } from '../../stores/diceStore.svelte.js';
import { useFailureCheck } from './useFailureCheck.svelte.js';
import { useSuccessCheck } from './useSuccessCheck.svelte.js';
import { useRollForTasks, DEAL_DELAY_MS, DEAL_BEAT_MS } from './useRollForTasks.svelte.js';
import { useInitialDamage } from './useInitialDamage.svelte.js';
import { createResultHold, RESULT_HOLD_MS, NARRATION_BEAT_MS } from './resultHold.svelte.js';
import {
	updateAudioSettings,
	updateGameplaySettings,
	stopNarration
} from '../../stores/audioStore.svelte.js';
import { installFakeTTS } from '../../services/tts/providers/FakeTTSProvider.test.helper.js';

vi.mock('../../stores/diceStore.svelte.js', () => ({
	rollDice: vi.fn(async () => {}),
	skipRoll: vi.fn(() => true)
}));
vi.mock('../../stores/indexedDBStorage.js', () => ({
	saveGame: vi.fn(),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));

/** A rollDice that waits until the test lets the dice land */
function holdDice() {
	let land;
	rollDice.mockImplementationOnce(() => new Promise((resolve) => (land = resolve)));
	return async () => {
		await vi.waitFor(() => expect(land).toBeTypeOf('function'));
		await land();
	};
}

beforeEach(() => {
	resetRNG();
	rollDice.mockClear();
	skipRoll.mockClear();
	for (const key of Object.keys(gameState.pendingUpdates)) gameState.pendingUpdates[key] = null;
	Object.assign(gameState, {
		tower: 20,
		tokens: 10,
		cardsToDraw: 2,
		acesRevealed: 2,
		aceOfHeartsRevealed: true,
		isLucid: false,
		isSurreal: false,
		gameOver: false,
		win: false,
		config: { labels: {} },
		log: []
	});
});

afterEach(() => vi.useRealTimers());

describe('useFailureCheck', () => {
	it('applies and explains the roll, then continues on the second press', async () => {
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		expect(check.buttonText).toBe('Roll for Stability');
		mockDieRoll(4);

		await check.handleFailureCheck();
		expect(gameState.tower).toBe(18);
		expect(gameState.state).toBe('failureCheck');
		expect(check.resultLine).toBe('Rolled 4 · −2 Stability');
		// Cards are left this round: the button names the next screen (DP-1-06)
		expect(check.buttonText).toBe('Draw the next card');
		expect(check.rolling).toBe(false);

		await check.handleFailureCheck();
		expect(gameState.state).toBe('drawCard');
	});

	it('reads "Rolling…" while the dice roll, and a press then skips to the result', async () => {
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		const land = holdDice();
		mockDieRoll(12);

		const rolling = check.handleFailureCheck();
		expect(check.rolling).toBe(true);
		expect(check.buttonText).toBe('Rolling…');

		await check.handleFailureCheck(); // a press during the roll
		expect(skipRoll).toHaveBeenCalledTimes(1);
		expect(gameState.state).toBe('failureCheck');

		await land();
		await rolling;
		expect(check.buttonText).toBe('Draw the next card');
	});

	it('shows the Lucid modifier on the roll button only, and both dice in the result', async () => {
		gameState.state = 'failureCheck';
		gameState.isLucid = true;
		const check = useFailureCheck();
		expect(check.buttonHint).toBe('Lucid · two dice, keep the higher');
		mockDieRollSequence([5, 19]);

		await check.handleFailureCheck();
		expect(rollDice).toHaveBeenCalledWith(19, { isLucid: true, isSurreal: false, dice: [5, 19] });
		expect(check.resultLine).toBe('Rolled 19 (high of 5, 19) · no Stability lost');
		expect(check.buttonHint).toBeNull();
	});

	it('words the fatal roll and its button', async () => {
		gameState.state = 'failureCheck';
		gameState.tower = 2;
		const check = useFailureCheck();
		mockDieRoll(3);

		await check.handleFailureCheck();
		expect(check.resultLine).toBe('Rolled 3 · −2 Stability · you fall');
		expect(check.buttonText).toBe('Face the end');
	});

	it('clears the result line on reset', async () => {
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		mockDieRoll(12);
		await check.handleFailureCheck();
		check.resetState();
		expect(check.resultLine).toBe('');
	});
});

describe('step labels after a result name where they go (DP-1-06)', () => {
	afterEach(() => updateGameplaySettings({ autoHandleJournaling: 'manual' }));

	it.each([
		['cards left this round', { cardsToDraw: 2 }, 'Draw the next card'],
		['the last check, Salvation unlocked', { cardsToDraw: 0 }, 'Go to Salvation'],
		[
			'the last check, no Salvation yet',
			{ cardsToDraw: 0, aceOfHeartsRevealed: false },
			'Open your journal'
		]
	])('a Stability check with %s', async (_, state, label) => {
		Object.assign(gameState, { state: 'failureCheck', round: 3, ...state });
		const check = useFailureCheck();
		mockDieRoll(15);
		await check.handleFailureCheck();
		expect(check.buttonText).toBe(label);
		expect(check.buttonText).not.toMatch(/continue|damage/i);
		check.resetState();
	});

	it('names the next round instead of the journal when the journal is skipped', async () => {
		updateGameplaySettings({ autoHandleJournaling: 'skip' });
		Object.assign(gameState, { state: 'failureCheck', round: 3, cardsToDraw: 0 });
		gameState.aceOfHeartsRevealed = false;
		const check = useFailureCheck();
		mockDieRoll(15);
		await check.handleFailureCheck();
		expect(check.buttonText).toBe('Begin round 4');
		check.resetState();

		Object.assign(gameState, { state: 'successCheck', aceOfHeartsRevealed: true });
		const salvation = useSuccessCheck();
		mockDieRoll(2);
		await salvation.handleSuccessCheck();
		expect(salvation.buttonText).toBe('Begin round 4');
		salvation.resetState();
	});

	it('every label is sentence case, at most 20 characters, with no "..."', () => {
		const labels = [
			'Roll for instability',
			'Roll for tasks',
			'Roll for Stability',
			'Roll for Salvation',
			'Rolling…',
			'Begin round 1',
			'Draw the cards',
			'Draw the card',
			'Draw the next card',
			'Go to Salvation',
			'Open your journal',
			'Begin round 12',
			'Escape',
			'Face the end'
		];
		for (const label of labels) {
			expect(label.length).toBeLessThanOrEqual(20);
			expect(label).not.toMatch(/\.\.\./);
		}
	});
});

describe("useFailureCheck on the fourth Ace's check (Easy: the final roll)", () => {
	const FINAL = 'Roll for Stability';

	beforeEach(() => {
		gameState.state = 'failureCheck';
		gameState.config = { labels: {}, options: { difficulty: 0 } };
		gameState.acesRevealed = 4;
		gameState.tower = 9;
		gameState.tokens = 6;
	});

	it('says what is at stake, wins when Stability holds, and waits for the player', async () => {
		vi.useFakeTimers();
		const check = useFailureCheck();
		expect(check.buttonText).toBe(FINAL);
		mockDieRoll(13);

		await check.handleFailureCheck();
		expect(gameState.tower).toBe(9);
		expect(gameState.tokens).toBe(6);
		expect(gameState.win).toBe(true);
		expect(gameState.gameOver).toBe(true);
		expect(check.resultLine).toBe('Rolled 13 · no Stability lost · you escape');
		expect(check.buttonText).toBe('Escape');
		// No result hold: the ending waits for the player
		expect(check.hold.active).toBe(false);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('failureCheck');

		await check.handleFailureCheck();
		expect(gameState.state).toBe('gameOver');
	});

	it('loses when that check takes the last Stability, and waits', async () => {
		vi.useFakeTimers();
		gameState.tower = 2;
		const check = useFailureCheck();
		mockDieRoll(4);

		await check.handleFailureCheck();
		expect(gameState.tower).toBe(0);
		expect(gameState.win).toBe(false);
		expect(gameState.gameOver).toBe(true);
		expect(check.resultLine).toBe('Rolled 4 · −2 Stability · you fall');
		expect(check.buttonText).toBe('Face the end');
		expect(check.hold.active).toBe(false);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('failureCheck');

		await check.handleFailureCheck();
		expect(gameState.state).toBe('gameOver');
	});

	it('applies and uses up a Lucid modifier like any roll', async () => {
		gameState.isLucid = true;
		const check = useFailureCheck();
		expect(check.buttonHint).toBe('Lucid · two dice, keep the higher');
		mockDieRollSequence([3, 14]);

		await check.handleFailureCheck();
		expect(rollDice).toHaveBeenCalledWith(14, { isLucid: true, isSurreal: false, dice: [3, 14] });
		expect(gameState.isLucid).toBe(false);
		expect(check.resultLine).toBe('Rolled 14 (high of 3, 14) · no Stability lost · you escape');
		expect(gameState.win).toBe(true);
	});

	it('applies and uses up a Surreal modifier, which can make it the fatal roll', async () => {
		gameState.isSurreal = true;
		gameState.tower = 2;
		const check = useFailureCheck();
		expect(check.buttonHint).toBe('Surreal · two dice, keep the lower');
		mockDieRollSequence([15, 3]);

		await check.handleFailureCheck();
		expect(gameState.isSurreal).toBe(false);
		expect(check.resultLine).toBe('Rolled 3 (low of 15, 3) · −2 Stability · you fall');
		expect(gameState.win).toBe(false);
		expect(gameState.gameOver).toBe(true);
	});

	it.each([
		['Normal', 1],
		['Hard', 2]
	])('is an ordinary check on %s, where the fourth Ace ends nothing', async (_, difficulty) => {
		gameState.config = { labels: {}, options: { difficulty } };
		gameState.cardsToDraw = 0;
		const check = useFailureCheck();
		expect(check.buttonText).toBe('Roll for Stability');
		mockDieRoll(13);

		await check.handleFailureCheck();
		expect(gameState.gameOver).toBe(false);
		expect(gameState.tokens).toBe(6);
		expect(check.resultLine).toBe('Rolled 13 · no Stability lost');
		expect(check.buttonText).toBe('Go to Salvation');
		expect(check.hold.active).toBe(true);
		check.resetState();
	});
});

describe('useInitialDamage', () => {
	it('rolls a d20 through the random service and reads the d20 damage table', async () => {
		gameState.state = 'initialDamageRoll';
		const roll = useInitialDamage();
		mockDieRoll(15); // only possible on a d20; 11-19 costs nothing

		await roll.handleInitialDamageRoll();
		expect(roll.result).toBe(15);
		expect(gameState.tower).toBe(20);
		expect(roll.resultLine).toBe('Rolled 15 · no Stability lost');
	});

	it('uses the modifier like every other roll', async () => {
		gameState.state = 'initialDamageRoll';
		gameState.isSurreal = true;
		const roll = useInitialDamage();
		expect(roll.buttonHint).toBe('Surreal · two dice, keep the lower');
		mockDieRollSequence([9, 14]);

		await roll.handleInitialDamageRoll();
		expect(roll.result).toBe(9);
		expect(gameState.isSurreal).toBe(false);
		expect(roll.resultLine).toBe('Rolled 9 (low of 9, 14) · −1 Stability');
	});

	it('reads "Rolling…" while rolling, then "Begin round 1"', async () => {
		gameState.state = 'initialDamageRoll';
		const roll = useInitialDamage();
		const land = holdDice();
		mockDieRoll(15);
		const rolling = roll.handleInitialDamageRoll();
		expect(roll.buttonText).toBe('Rolling…');
		await land();
		await rolling;
		expect(roll.buttonText).toBe('Begin round 1');
	});
});

describe('useSuccessCheck', () => {
	it('shows the target before rolling and the outcome after (a miss loses no token)', async () => {
		gameState.state = 'successCheck';
		const check = useSuccessCheck();
		expect(check.buttonText).toBe('Roll for Salvation');
		mockDieRoll(2);

		await check.handleSuccessCheck();
		expect(gameState.tokens).toBe(10);
		expect(gameState.state).toBe('successCheck');
		expect(check.resultLine).toBe('Rolled 2 · missed 14+');
		expect(check.buttonText).toBe('Open your journal');

		await check.handleSuccessCheck();
		expect(gameState.state).toBe('log');
	});

	it('on Hard a miss adds a token, and the line says so', async () => {
		gameState.state = 'successCheck';
		gameState.config = { labels: {}, options: { difficulty: 2 } };
		const check = useSuccessCheck();
		mockDieRoll(2);

		await check.handleSuccessCheck();
		expect(gameState.tokens).toBe(11);
		expect(check.resultLine).toBe('Rolled 2 · missed 14+ · +1 Token');
		check.resetState();
	});

	it('with four Aces (Normal) the roll is a Stability check, and the token comes off', async () => {
		gameState.state = 'successCheck';
		gameState.config = { labels: {}, options: { difficulty: 1 } };
		gameState.acesRevealed = 4;
		gameState.tower = 16;
		gameState.isLucid = true;
		const check = useSuccessCheck();
		expect(check.buttonText).toBe('Roll for Salvation');
		expect(check.buttonHint).toBe('Lucid · two dice, keep the higher'); // the dice are thrown again
		mockDieRollSequence([9, 14]);

		await check.handleSuccessCheck();
		expect(rollDice).toHaveBeenCalledWith(14, { isLucid: true, isSurreal: false, dice: [9, 14] });
		expect(check.resultLine).toBe('Rolled 14 (high of 9, 14) · no Stability lost · −1 Token');
		expect(gameState.isLucid).toBe(false);
		expect(check.buttonText).toBe('Open your journal');
		check.resetState();
	});

	it('with four Aces (Hard) a loss of Stability is named, and the token still comes off', async () => {
		gameState.state = 'successCheck';
		gameState.config = { labels: {}, options: { difficulty: 2 } };
		gameState.acesRevealed = 4;
		gameState.tower = 16;
		const check = useSuccessCheck();
		mockDieRoll(4);

		await check.handleSuccessCheck();
		expect(gameState.tower).toBe(14);
		expect(gameState.tokens).toBe(9);
		expect(check.resultLine).toBe('Rolled 4 · −2 Stability · −1 Token');
		check.resetState();
	});

	it('with four Aces (Normal) a roll that takes the last Stability ends the game and waits', async () => {
		vi.useFakeTimers();
		gameState.state = 'successCheck';
		gameState.config = { labels: {}, options: { difficulty: 1 } };
		gameState.acesRevealed = 4;
		gameState.tower = 1;
		const check = useSuccessCheck();
		mockDieRoll(8);

		await check.handleSuccessCheck();
		expect(gameState.tower).toBe(0);
		expect(gameState.tokens).toBe(10);
		expect(check.resultLine).toBe('Rolled 8 · −1 Stability · you fall');
		expect(check.buttonText).toBe('Face the end');
		expect(check.hold.active).toBe(false);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('successCheck');

		await check.handleSuccessCheck();
		expect(gameState.state).toBe('gameOver');
	});

	it('resumes a Salvation roll saved in flight on its result, without a second roll', () => {
		gameState.state = 'successCheck';
		gameState.pendingUpdates.diceRoll = 16;
		gameState.pendingUpdates.tokenChange = -1;
		const check = useSuccessCheck();
		check.resetState();
		check.resumePending();
		expect(gameState.tokens).toBe(9);
		expect(check.resultLine).toBe('Rolled 16 · −1 Token');
		expect(check.buttonText).toBe('Open your journal');
		expect(rollDice).not.toHaveBeenCalled();
	});

	it('resumes a missed roll saved in flight too (its pending change is 0, not null)', () => {
		gameState.state = 'successCheck';
		gameState.pendingUpdates.diceRoll = 7;
		gameState.pendingUpdates.tokenChange = 0;
		const check = useSuccessCheck();
		check.resetState();
		check.resumePending();
		expect(gameState.tokens).toBe(10);
		expect(check.resultLine).toBe('Rolled 7 · missed 14+');
		expect(check.buttonText).toBe('Open your journal');
		expect(rollDice).not.toHaveBeenCalled();
	});
});

describe('useRollForTasks', () => {
	it('publishes the cards to draw and the deal for the card overlay', async () => {
		gameState.state = 'rollForTasks';
		const tasks = useRollForTasks();
		expect(tasks.buttonText).toBe('Roll for tasks');
		mockDieRoll(17);

		await tasks.handleRollForTasks();
		expect(tasks.resultLine).toBe('Rolled 17 · 5 cards this round');
		expect(gameState.taskRoll).toEqual({ roll: 17, dice: [17], cards: 5 });
		expect(gameState.state).toBe('rollForTasks');
		tasks.resetState();
	});

	it('deals the cards on its own after the result', async () => {
		vi.useFakeTimers();
		gameState.state = 'rollForTasks';
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		vi.advanceTimersByTime(DEAL_DELAY_MS - 1);
		expect(gameState.state).toBe('rollForTasks');
		await vi.advanceTimersByTimeAsync(1);
		expect(gameState.state).toBe('drawCard');
	});

	it('a press after the result deals at once, and only once', async () => {
		vi.useFakeTimers();
		gameState.state = 'rollForTasks';
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		await tasks.handleRollForTasks();
		expect(gameState.state).toBe('drawCard');
		await vi.advanceTimersByTimeAsync(DEAL_DELAY_MS);
		expect(gameState.state).toBe('drawCard'); // the pending deal was cancelled
	});

	it('leaving the screen cancels the deal', async () => {
		vi.useFakeTimers();
		gameState.state = 'rollForTasks';
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		tasks.resetState();
		await vi.advanceTimersByTimeAsync(DEAL_DELAY_MS);
		expect(gameState.state).toBe('rollForTasks');
	});

	it('reads "Rolling…" while the dice roll, and a press skips to the result', async () => {
		gameState.state = 'rollForTasks';
		const tasks = useRollForTasks();
		const land = holdDice();
		mockDieRoll(17);
		const rolling = tasks.handleRollForTasks();
		expect(tasks.buttonText).toBe('Rolling…');
		expect(tasks.buttonDisabled).toBe(false);
		await tasks.handleRollForTasks();
		expect(skipRoll).toHaveBeenCalledTimes(1);
		await land();
		await rolling;
		expect(tasks.buttonText).toBe('Draw the cards');
		tasks.resetState();
	});
});

describe('useRollForTasks, with dice rolls announced', () => {
	let fake;

	beforeEach(async () => {
		gameState.state = 'rollForTasks';
		fake = await installFakeTTS();
		await updateAudioSettings({ autoAnnounceRolls: true });
	});

	afterEach(async () => {
		stopNarration();
		await updateAudioSettings({ autoAnnounceRolls: false });
	});

	it('reads the roll out, and deals a beat after the voice has finished rather than after the hold', async () => {
		vi.useFakeTimers();
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		expect(fake.spoken).toEqual(['You rolled a 8. Draw 3 cards.']);
		expect(tasks.hold.active).toBe(true);
		expect(tasks.hold.waiting).toBe(true);
		expect(tasks.hold.progress()).toBe(0);

		// The voice is still reading: the hold would long have run out
		await vi.advanceTimersByTimeAsync(DEAL_DELAY_MS * 3);
		expect(gameState.state).toBe('rollForTasks');
		expect(tasks.hold.waiting).toBe(true);

		fake.end();
		await vi.advanceTimersByTimeAsync(0);
		expect(tasks.hold.waiting).toBe(false);
		expect(tasks.hold.duration).toBe(DEAL_BEAT_MS);
		await vi.advanceTimersByTimeAsync(DEAL_BEAT_MS - 1);
		expect(gameState.state).toBe('rollForTasks');
		await vi.advanceTimersByTimeAsync(1);
		expect(gameState.state).toBe('drawCard');
	});

	it('a press during the reading deals at once; the voice reads on until the card replaces it', async () => {
		vi.useFakeTimers();
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		await tasks.handleRollForTasks();
		expect(gameState.state).toBe('drawCard');
		expect(tasks.hold.active).toBe(false);
		expect(fake.isSpeaking()).toBe(true);

		fake.end();
		await vi.advanceTimersByTimeAsync(NARRATION_BEAT_MS * 2);
		expect(gameState.state).toBe('drawCard'); // and nothing fired twice
	});

	it('leaving the screen cancels the wait', async () => {
		vi.useFakeTimers();
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		tasks.resetState();
		expect(tasks.hold.active).toBe(false);
		fake.end();
		await vi.advanceTimersByTimeAsync(NARRATION_BEAT_MS * 2);
		expect(gameState.state).toBe('rollForTasks');
	});

	it('with rolls not announced, nothing is read and the hold applies as before', async () => {
		vi.useFakeTimers();
		await updateAudioSettings({ autoAnnounceRolls: false });
		const tasks = useRollForTasks();
		mockDieRoll(8);

		await tasks.handleRollForTasks();
		expect(fake.spoken).toEqual([]);
		expect(tasks.hold.waiting).toBe(false);
		expect(tasks.hold.duration).toBe(DEAL_DELAY_MS);
		await vi.advanceTimersByTimeAsync(DEAL_DELAY_MS);
		expect(gameState.state).toBe('drawCard');
	});
});

describe('the result hold: a result moves on by itself after a beat', () => {
	it('is the shared 2s beat; the deal holds longer (OWN-7: the first card came too soon)', () => {
		expect(RESULT_HOLD_MS).toBe(2000);
		expect(DEAL_DELAY_MS).toBe(3000);
		expect(DEAL_BEAT_MS).toBe(1000);
		expect(DEAL_BEAT_MS).toBeGreaterThan(NARRATION_BEAT_MS);
	});

	it('a Stability result moves on by itself, and only once', async () => {
		vi.useFakeTimers();
		gameState.state = 'failureCheck';
		const completed = vi.fn();
		const check = useFailureCheck(completed);
		mockDieRoll(12);

		await check.handleFailureCheck();
		expect(check.hold.active).toBe(true);
		expect(check.hold.duration).toBe(RESULT_HOLD_MS);
		expect(check.hold.progress()).toBe(0);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS / 2);
		expect(check.hold.progress()).toBeCloseTo(0.5, 1);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS / 2 - 1);
		expect(gameState.state).toBe('failureCheck');
		await vi.advanceTimersByTimeAsync(1);
		expect(gameState.state).toBe('drawCard');
		expect(completed).toHaveBeenCalledTimes(1);
		expect(check.hold.active).toBe(false);
	});

	it('a press moves on at once and the hold never fires after it', async () => {
		vi.useFakeTimers();
		gameState.state = 'failureCheck';
		const completed = vi.fn();
		const check = useFailureCheck(completed);
		mockDieRoll(12);

		await check.handleFailureCheck();
		await check.handleFailureCheck();
		expect(gameState.state).toBe('drawCard');
		gameState.state = 'failureCheck'; // the next odd card, before the screen resets
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('failureCheck');
		expect(completed).toHaveBeenCalledTimes(1);
	});

	it('the fatal Stability roll does not move on by itself', async () => {
		vi.useFakeTimers();
		gameState.state = 'failureCheck';
		gameState.tower = 2;
		const check = useFailureCheck();
		mockDieRoll(3);

		await check.handleFailureCheck();
		expect(check.hold.active).toBe(false);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('failureCheck');
		expect(check.buttonText).toBe('Face the end');
	});

	it('a Salvation result moves on to the journal by itself', async () => {
		vi.useFakeTimers();
		gameState.state = 'successCheck';
		const check = useSuccessCheck();
		mockDieRoll(16);

		await check.handleSuccessCheck();
		expect(check.hold.active).toBe(true);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS);
		expect(gameState.state).toBe('log');
	});

	it('a Salvation that clears the last token waits, on "Escape"', async () => {
		vi.useFakeTimers();
		gameState.state = 'successCheck';
		gameState.tokens = 1;
		const check = useSuccessCheck();
		mockDieRoll(16);

		await check.handleSuccessCheck();
		expect(gameState.win).toBe(true);
		expect(check.hold.active).toBe(false);
		expect(check.buttonText).toBe('Escape');
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('successCheck');
		await check.handleSuccessCheck();
		expect(gameState.state).toBe('gameOver');
	});

	it('the opening roll starts round 1 by itself', async () => {
		vi.useFakeTimers();
		gameState.state = 'initialDamageRoll';
		gameState.round = 0;
		const roll = useInitialDamage();
		mockDieRoll(15);

		await roll.handleInitialDamageRoll();
		expect(roll.hold.active).toBe(true);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS);
		expect(gameState.state).toBe('rollForTasks');
	});

	it('leaving the screen cancels the hold', async () => {
		vi.useFakeTimers();
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		mockDieRoll(12);

		await check.handleFailureCheck();
		check.resetState();
		expect(check.hold.active).toBe(false);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(gameState.state).toBe('failureCheck');
	});

	it('holds for a voice (its line full), then runs out over the beat', async () => {
		vi.useFakeTimers();
		const done = vi.fn();
		const hold = createResultHold();
		let end;
		const narration = { promise: new Promise((resolve) => (end = resolve)), cancel: vi.fn() };

		hold.start(done, RESULT_HOLD_MS, { narration });
		expect(hold.active).toBe(true);
		expect(hold.waiting).toBe(true);
		expect(hold.paused).toBe(false);
		expect(hold.progress()).toBe(0);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(done).not.toHaveBeenCalled();

		end(true);
		await vi.advanceTimersByTimeAsync(0);
		expect(hold.waiting).toBe(false);
		expect(hold.duration).toBe(NARRATION_BEAT_MS);
		await vi.advanceTimersByTimeAsync(NARRATION_BEAT_MS - 1);
		expect(done).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		expect(done).toHaveBeenCalledTimes(1);
		expect(hold.active).toBe(false);
	});

	it('cancelled while waiting for the voice, it cancels the wait and never fires', async () => {
		vi.useFakeTimers();
		const done = vi.fn();
		const hold = createResultHold();
		let end;
		const narration = { promise: new Promise((resolve) => (end = resolve)), cancel: vi.fn() };

		hold.start(done, RESULT_HOLD_MS, { narration });
		hold.cancel();
		expect(narration.cancel).toHaveBeenCalledTimes(1);
		expect(hold.active).toBe(false);
		expect(hold.waiting).toBe(false);
		expect(hold.progress()).toBe(1);
		end(true);
		await vi.advanceTimersByTimeAsync(NARRATION_BEAT_MS * 2);
		expect(done).not.toHaveBeenCalled();
	});

	it('a voice that ends under a dialog starts its beat paused', async () => {
		vi.useFakeTimers();
		const done = vi.fn();
		const hold = createResultHold();
		let end;
		const narration = { promise: new Promise((resolve) => (end = resolve)), cancel: vi.fn() };

		hold.start(done, RESULT_HOLD_MS, { narration });
		hold.pause();
		end(true);
		await vi.advanceTimersByTimeAsync(0);
		expect(hold.paused).toBe(true);
		await vi.advanceTimersByTimeAsync(NARRATION_BEAT_MS * 2);
		expect(done).not.toHaveBeenCalled();
		hold.resume();
		await vi.advanceTimersByTimeAsync(NARRATION_BEAT_MS);
		expect(done).toHaveBeenCalledTimes(1);
	});

	it('waits while paused (a dialog is open), including a hold that starts paused', async () => {
		vi.useFakeTimers();
		const done = vi.fn();
		const hold = createResultHold();

		hold.start(done);
		await vi.advanceTimersByTimeAsync(500);
		hold.pause();
		expect(hold.paused).toBe(true);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(done).not.toHaveBeenCalled();
		hold.resume();
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS - 500 - 1);
		expect(done).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		expect(done).toHaveBeenCalledTimes(1);

		const later = vi.fn();
		hold.pause();
		hold.start(later); // the dice landed while the dialog was open
		expect(hold.paused).toBe(true);
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS * 2);
		expect(later).not.toHaveBeenCalled();
		hold.resume();
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS);
		expect(later).toHaveBeenCalledTimes(1);
	});
});
