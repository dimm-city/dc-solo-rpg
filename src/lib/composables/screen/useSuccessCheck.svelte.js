/**
 * useSuccessCheck - Success Check screen logic composable
 *
 * Manages the state and logic for the "Success Check" screen (Salvation), including:
 * - Dice rolling state and result
 * - Token removal on success
 * - Auto-play trigger integration
 * - Button text based on state
 *
 * @returns {Object} Success check state and actions
 */

import {
	successCheck,
	applyPendingSuccessCheck,
	startRound
} from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';

export function useSuccessCheck() {
	let successCheckRolling = $state(false);
	let successCheckResult = $state();

	/**
	 * Handle success check roll and confirmation
	 */
	async function handleSuccessCheck(triggerAutoPlay) {
		if (successCheckRolling) return;

		const currentScreen = gameState.state;

		if (currentScreen == 'successCheck' && !successCheckResult) {
			successCheckRolling = true;
			const { roll, wasLucid, wasSurreal } = await successCheck();
			successCheckResult = roll;
			// Roll dice and wait for animation to complete
			// Pass modifier state for visual dice roll (2d20 if was Lucid/Surreal)
			await rollDice(roll, { isLucid: wasLucid, isSurreal: wasSurreal });
			successCheckRolling = false;
			// Apply pending success check after animation completes
			applyPendingSuccessCheck();
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		} else if (successCheckResult) {
			await startRound();
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		successCheckResult = undefined;
		successCheckRolling = false;
	}

	// Reactive button text
	const buttonText = $derived(successCheckResult ? 'Continue' : 'Roll to Remove Token');

	return {
		// State (read-only via getters)
		get rolling() {
			return successCheckRolling;
		},
		get result() {
			return successCheckResult;
		},
		get buttonText() {
			return buttonText;
		},

		// Actions
		handleSuccessCheck,
		resetState
	};
}
