/**
 * useFailureCheck - Stability check screen logic composable
 *
 * Two steps on one button:
 * 1. Roll: dice animate, the result is applied (the HUD updates) and a result line
 *    stays on screen. The button becomes "Continue".
 * 2. Continue: only now does the game move on (next card, Salvation or the journal).
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
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import { formatStabilityResult } from '../../utils/rollResult.js';

export function useFailureCheck(onCompleted = () => {}) {
	let failureCheckRolling = $state(false);
	let failureCheckResult = $state();
	let failureCheckResultLine = $state('');

	/**
	 * Roll the check, or (once rolled) continue to the next step
	 */
	async function handleFailureCheck(triggerAutoPlay) {
		if (failureCheckRolling) return;

		const currentScreen = gameState.state;
		if (currentScreen !== 'failureCheck') return;

		if (!failureCheckResult) {
			failureCheckRolling = true;
			try {
				const { roll, wasLucid, wasSurreal } = getFailureCheckRoll();
				failureCheckResult = roll;
				const towerBefore = gameState.tower;
				// Store pending updates (don't apply yet)
				applyFailureCheckResult(roll);
				// Roll dice and wait for animation to complete
				// Pass modifier state for visual dice roll (2d20 if was Lucid/Surreal)
				await rollDice(roll, { isLucid: wasLucid, isSurreal: wasSurreal });
				// Apply the result after the animation, but stay here until the player continues
				applyPendingDiceRoll({ advance: false });
				failureCheckResultLine = formatStabilityResult(roll, towerBefore, gameState.tower);
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
	const buttonText = $derived(failureCheckResult ? 'Continue' : 'Roll for Damage');

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

		// Actions
		handleFailureCheck,
		resetState
	};
}
