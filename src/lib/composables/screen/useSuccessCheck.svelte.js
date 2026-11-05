/**
 * useSuccessCheck - Salvation check screen logic composable
 *
 * Two steps on one button:
 * 1. Roll: dice animate, the tokens update and a result line stays on screen.
 *    The button becomes "Continue".
 * 2. Continue: only now does the game move on (the ending or the journal).
 *
 * The roll button shows the target before rolling ("need 14+").
 *
 * @returns {Object} Success check state and actions
 */

import {
	successCheck,
	applyPendingSuccessCheck,
	advanceAfterSuccessCheck,
	getSalvationThreshold
} from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import { formatSalvationResult, formatSalvationButton } from '../../utils/rollResult.js';

export function useSuccessCheck() {
	let successCheckRolling = $state(false);
	let successCheckResult = $state();
	let successCheckResultLine = $state('');

	/**
	 * Roll the check, or (once rolled) continue to the next step
	 */
	async function handleSuccessCheck(triggerAutoPlay) {
		if (successCheckRolling) return;

		const currentScreen = gameState.state;
		if (currentScreen !== 'successCheck') return;

		if (!successCheckResult) {
			successCheckRolling = true;
			try {
				// Threshold before rolling: the Aces can't change mid-check
				const threshold = getSalvationThreshold(gameState.acesRevealed);
				const { roll, wasLucid, wasSurreal } = await successCheck();
				successCheckResult = roll;
				// Roll dice and wait for animation to complete
				// Pass modifier state for visual dice roll (2d20 if was Lucid/Surreal)
				await rollDice(roll, { isLucid: wasLucid, isSurreal: wasSurreal });
				// Apply the result after the animation, but stay here until the player continues
				applyPendingSuccessCheck({ advance: false });
				successCheckResultLine = formatSalvationResult(roll, threshold, gameState.tokens);
			} finally {
				successCheckRolling = false;
			}
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		} else {
			advanceAfterSuccessCheck();
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		successCheckResult = undefined;
		successCheckResultLine = '';
		successCheckRolling = false;
	}

	// Reactive button text: the target is shown before rolling
	const buttonText = $derived(
		successCheckResult
			? 'Continue'
			: formatSalvationButton(getSalvationThreshold(Math.max(gameState.acesRevealed, 1)))
	);

	return {
		// State (read-only via getters)
		get rolling() {
			return successCheckRolling;
		},
		get result() {
			return successCheckResult;
		},
		get resultLine() {
			return successCheckResultLine;
		},
		get buttonText() {
			return buttonText;
		},

		// Actions
		handleSuccessCheck,
		resetState
	};
}
