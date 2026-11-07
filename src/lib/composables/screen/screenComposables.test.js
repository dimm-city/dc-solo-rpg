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
import { useRollForTasks, DEAL_DELAY_MS } from './useRollForTasks.svelte.js';
import { useInitialDamage } from './useInitialDamage.svelte.js';
import { createResultHold, RESULT_HOLD_MS } from './resultHold.svelte.js';

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
		config: { labels: {} },
		log: []
	});
});

afterEach(() => vi.useRealTimers());

describe('useFailureCheck', () => {
	it('applies and explains the roll, then continues on the second press', async () => {
		gameState.state = 'failureCheck';
		const check = useFailureCheck();
		expect(check.buttonText).toBe('Roll for damage');
		mockDieRoll(4);

		await check.handleFailureCheck();
		expect(gameState.tower).toBe(18);
		expect(gameState.state).toBe('failureCheck');
		expect(check.resultLine).toBe('Rolled 4 · −2 Stability · 18/20');
		expect(check.buttonText).toBe('Continue');
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
		expect(check.buttonText).toBe('Continue');
	});

	it('shows the Lucid modifier on the roll button only, and both dice in the result', async () => {
		gameState.state = 'failureCheck';
		gameState.isLucid = true;
		const check = useFailureCheck();
		expect(check.buttonHint).toBe('Lucid: 2 dice, keep high');
		mockDieRollSequence([5, 19]);

		await check.handleFailureCheck();
		expect(rollDice).toHaveBeenCalledWith(19, { isLucid: true, isSurreal: false, dice: [5, 19] });
		expect(check.resultLine).toBe('Rolled 19 (high of 5, 19) · no Stability lost · 20/20');
		expect(check.buttonHint).toBeNull();
	});

	it('words the fatal roll and its button', async () => {
		gameState.state = 'failureCheck';
		gameState.tower = 2;
		const check = useFailureCheck();
		mockDieRoll(3);

		await check.handleFailureCheck();
		expect(check.resultLine).toBe('Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to');
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

describe('useInitialDamage', () => {
	it('rolls a d20 through the random service and reads the d20 damage table', async () => {
		gameState.state = 'initialDamageRoll';
		const roll = useInitialDamage();
		mockDieRoll(15); // only possible on a d20; 11-19 costs nothing

		await roll.handleInitialDamageRoll();
		expect(roll.result).toBe(15);
		expect(gameState.tower).toBe(20);
		expect(roll.resultLine).toBe('Rolled 15 · no Stability lost · 20/20');
	});

	it('uses the modifier like every other roll', async () => {
		gameState.state = 'initialDamageRoll';
		gameState.isSurreal = true;
		const roll = useInitialDamage();
		expect(roll.buttonHint).toBe('Surreal: 2 dice, keep low');
		mockDieRollSequence([9, 14]);

		await roll.handleInitialDamageRoll();
		expect(roll.result).toBe(9);
		expect(gameState.isSurreal).toBe(false);
		expect(roll.resultLine).toBe('Rolled 9 (low of 9, 14) · −1 Stability · 19/20');
	});

	it('reads "Rolling…" while rolling, then Continue', async () => {
		gameState.state = 'initialDamageRoll';
		const roll = useInitialDamage();
		const land = holdDice();
		mockDieRoll(15);
		const rolling = roll.handleInitialDamageRoll();
		expect(roll.buttonText).toBe('Rolling…');
		await land();
		await rolling;
		expect(roll.buttonText).toBe('Continue');
	});
});

describe('useSuccessCheck', () => {
	it('shows the target before rolling and the outcome after', async () => {
		gameState.state = 'successCheck';
		const check = useSuccessCheck();
		expect(check.buttonText).toBe('Roll to remove a token · need 14+');
		mockDieRoll(2);

		await check.handleSuccessCheck();
		expect(gameState.tokens).toBe(11);
		expect(gameState.state).toBe('successCheck');
		expect(check.resultLine).toBe('Rolled 2 · needed 14+ · +1 token · 11 left');
		expect(check.buttonText).toBe('Continue');

		await check.handleSuccessCheck();
		expect(gameState.state).toBe('log');
	});

	it('with four Aces the roll is a Stability check, and the token comes off', async () => {
		gameState.state = 'successCheck';
		gameState.acesRevealed = 4;
		gameState.tower = 16;
		gameState.isLucid = true;
		const check = useSuccessCheck();
		expect(check.buttonText).toBe('Roll for Stability · Salvation is assured');
		expect(check.buttonHint).toBe('Lucid: 2 dice, keep high'); // the dice are thrown again
		mockDieRollSequence([9, 14]);

		await check.handleSuccessCheck();
		expect(rollDice).toHaveBeenCalledWith(14, { isLucid: true, isSurreal: false, dice: [9, 14] });
		expect(check.resultLine).toBe(
			'Rolled 14 (high of 9, 14) · no Stability lost · −1 token · 9 left'
		);
		expect(gameState.isLucid).toBe(false);
		expect(check.buttonText).toBe('Continue');
		check.resetState();
	});

	it('with four Aces a loss of Stability is named', async () => {
		gameState.state = 'successCheck';
		gameState.acesRevealed = 4;
		gameState.tower = 16;
		const check = useSuccessCheck();
		mockDieRoll(4);

		await check.handleSuccessCheck();
		expect(gameState.tower).toBe(14);
		expect(gameState.tokens).toBe(9);
		expect(check.resultLine).toBe('Rolled 4 · −2 Stability · −1 token · 9 left');
		check.resetState();
	});

	it('with four Aces a roll that takes the last Stability ends the game and waits', async () => {
		vi.useFakeTimers();
		gameState.state = 'successCheck';
		gameState.acesRevealed = 4;
		gameState.tower = 1;
		const check = useSuccessCheck();
		mockDieRoll(8);

		await check.handleSuccessCheck();
		expect(gameState.tower).toBe(0);
		expect(gameState.tokens).toBe(10);
		expect(check.resultLine).toBe('Rolled 8 · −1 Stability · 0/20 · nothing left to hold on to');
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
		expect(check.resultLine).toBe('Rolled 16 · −1 token · 9 left');
		expect(check.buttonText).toBe('Continue');
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
		expect(tasks.resultLine).toBe('Rolled 17 · Draw 5 cards');
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
		expect(tasks.buttonText).toBe('Draw 5 Cards');
		tasks.resetState();
	});
});

describe('the result hold: a result moves on by itself after a beat', () => {
	it('is the shared 2s beat, the same for the deal', () => {
		expect(RESULT_HOLD_MS).toBe(2000);
		expect(DEAL_DELAY_MS).toBe(RESULT_HOLD_MS);
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
		await vi.advanceTimersByTimeAsync(RESULT_HOLD_MS - 1);
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
