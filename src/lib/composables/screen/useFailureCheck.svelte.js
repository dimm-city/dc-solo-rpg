/**
 * useFailureCheck - Stability check screen logic composable
 *
 * Two steps on one button:
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), the result is applied
 *    (the HUD updates) and a result line stays on screen. The button becomes "Continue",
 *    or "Face the end" when the roll took the last of the Stability.
 * 2. Continue: only now does the game move on (next card, Salvation, the journal or the end).
 *
 * @param {Function} onCompleted - Callback when the check is completed (after Continue)
 * @returns {Object} Failure check state and actions
 */

import {
	getFailureCheckRoll,
	applyFailureCheckResult,
	applyPendingDiceRoll,
	advanceAfterFailureCheck
} from '../../stores/gameActions.svelte.js';
import { rollDice, skipRoll } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import {
	formatStabilityResult,
	formatModifierHint,
	ROLLING_LABEL
} from '../../utils/rollResult.js';

export function useFailureCheck(onCompleted = () => {}) {
	let failureCheckRolling = $state(false);
	let failureCheckResult = $state();
	let failureCheckResultLine = $state('');

	/**
	 * Roll the check, skip a roll in flight, or (once rolled) continue to the next step
	 */
	async function handleFailureCheck(triggerAutoPlay) {
		const currentScreen = gameState.state;
		if (currentScreen !== 'failureCheck') return;
		if (failureCheckRolling) {
			skipRoll();
			return;
		}

		if (!failureCheckResult) {
			failureCheckRolling = true;
			try {
				const thrown = getFailureCheckRoll();
				failureCheckResult = thrown.roll;
				const towerBefore = gameState.tower;
				// Store pending updates (don't apply yet)
				applyFailureCheckResult(thrown.roll);
				// Show the dice the game rolled (2d20 if Lucid/Surreal) and wait for them to land
				await rollDice(thrown.roll, {
					isLucid: thrown.wasLucid,
					isSurreal: thrown.wasSurreal,
					dice: thrown.dice
				});
				// Apply the result after the animation, but stay here until the player continues
				applyPendingDiceRoll({ advance: false });
				failureCheckResultLine = formatStabilityResult(
					thrown.roll,
					towerBefore,
					gameState.tower,
					20,
					thrown
				);
			} finally {
				failureCheckRolling = false;
			}
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		} else {
			advanceAfterFailureCheck();
			onCompleted(gameState.state);
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		failureCheckResult = undefined;
		failureCheckResultLine = '';
		failureCheckRolling = false;
	}

	// Reactive button text
	const buttonText = $derived(
		failureCheckRolling
			? ROLLING_LABEL
			: failureCheckResult
				? gameState.gameOver
					? 'Face the end'
					: 'Continue'
				: 'Roll for damage'
	);
	// The modifier the roll will use, shown on the roll button only
	const buttonHint = $derived(
		failureCheckResult || failureCheckRolling ? null : formatModifierHint(gameState)
	);

	return {
		// State (read-only via getters)
		get rolling() {
			return failureCheckRolling;
		},
		get result() {
			return failureCheckResult;
		},
		get resultLine() {
			return failureCheckResultLine;
		},
		get buttonText() {
			return buttonText;
		},
		get buttonHint() {
			return buttonHint;
		},

		// Actions
		handleFailureCheck,
		resetState
	};
}
