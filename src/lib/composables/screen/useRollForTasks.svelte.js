/**
 * useRollForTasks - Roll for Tasks screen logic composable (the screen titled "Round N")
 *
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), then a result line
 *    ("Rolled 17 · Draw 5 cards") stays on screen.
 * 2. The cards are dealt on their own DEAL_DELAY_MS later (the result hold, shown as a line
 *    running out on the button). A press deals at once.
 *
 * @param {Object} [options]
 * @param {number} [options.dealDelay] - ms from the result to the deal
 * @returns {Object} Roll for tasks state and actions
 */

import {
	rollForTasks,
	confirmTaskRoll,
	applyPendingTaskRoll
} from '../../stores/gameActions.svelte.js';
import { rollDice, skipRoll } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import { formatTaskResult, formatModifierHint, ROLLING_LABEL } from '../../utils/rollResult.js';
import { createResultHold, RESULT_HOLD_MS } from './resultHold.svelte.js';

/** Time to read the result line before the cards are dealt (the shared result hold) */
export const DEAL_DELAY_MS = RESULT_HOLD_MS;

export function useRollForTasks({ dealDelay = DEAL_DELAY_MS } = {}) {
	let rollTasksRolled = $state(false);
	let rollTasksRolling = $state(false);
	let rollTasksConfirming = $state(false);
	let rollTasksResultLine = $state('');
	const hold = createResultHold();

	/** Deal the cards (once, and only from this screen) */
	async function deal() {
		hold.cancel();
		if (rollTasksConfirming || gameState.state !== 'rollForTasks') return;
		rollTasksConfirming = true;
		try {
			await confirmTaskRoll();
		} finally {
			rollTasksConfirming = false;
		}
	}

	/**
	 * Roll; skip a roll in flight; or, once rolled, deal now instead of waiting
	 */
	async function handleRollForTasks(triggerAutoPlay) {
		if (rollTasksConfirming) return;
		if (rollTasksRolling) {
			skipRoll();
			return;
		}

		if (rollTasksRolled) {
			await deal();
			return;
		}

		rollTasksRolling = true;
		try {
			const thrown = await rollForTasks();
			// Show the dice the game rolled (2d20 if Lucid/Surreal) and wait for them to land
			await rollDice(thrown.roll, {
				isLucid: thrown.wasLucid,
				isSurreal: thrown.wasSurreal,
				dice: thrown.dice
			});
			// Apply pending dice roll after animation completes
			applyPendingTaskRoll();
			rollTasksResultLine = formatTaskResult(thrown.roll, thrown.cardCount, thrown);
			rollTasksRolled = true;
		} finally {
			rollTasksRolling = false;
		}
		// Deal on its own once the player has had a moment with the result
		hold.start(deal, dealDelay);
		// Trigger auto-play after roll completes (event-driven)
		if (triggerAutoPlay) {
			setTimeout(() => triggerAutoPlay(), 0);
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		hold.cancel();
		rollTasksRolled = false;
		rollTasksRolling = false;
		rollTasksConfirming = false;
		rollTasksResultLine = '';
	}

	// Reactive button text
	const buttonText = $derived(
		rollTasksRolling
			? ROLLING_LABEL
			: rollTasksRolled
				? (gameState.config?.labels?.rollForTasksResultHeader ??
					`Draw ${gameState.cardsToDraw} Card${gameState.cardsToDraw !== 1 ? 's' : ''}`)
				: (gameState.config?.labels?.rollForTasksHeader ?? 'Roll for tasks')
	);
	// The modifier the roll will use, shown on the roll button only
	const buttonHint = $derived(
		rollTasksRolled || rollTasksRolling ? null : formatModifierHint(gameState)
	);

	// Reactive button disabled state: a press while rolling skips, so only the deal itself locks it
	const buttonDisabled = $derived(rollTasksConfirming);

	return {
		// State (read-only via getters)
		get rolled() {
			return rollTasksRolled;
		},
		get rolling() {
			return rollTasksRolling;
		},
		get confirming() {
			return rollTasksConfirming;
		},
		get resultLine() {
			return rollTasksResultLine;
		},
		get buttonText() {
			return buttonText;
		},
		get buttonHint() {
			return buttonHint;
		},
		get buttonDisabled() {
			return buttonDisabled;
		},
		/** The wait before the deal (see createResultHold) */
		hold,

		// Actions
		handleRollForTasks,
		resetState
	};
}
