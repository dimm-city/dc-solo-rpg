/**
 * useFailureCheck - Failure Check screen logic composable
 *
 * Manages the state and logic for the "Failure Check" screen, including:
 * - Dice rolling state and result
 * - Integration with damage calculation and state updates
 * - Auto-play trigger integration
 * - Button text based on state
 *
 * @param {Function} onCompleted - Callback when failure check is completed
 * @returns {Object} Failure check state and actions
 */

import {
	getFailureCheckRoll,
	applyFailureCheckResult,
	applyPendingDiceRoll,
	confirmFailureCheck
} from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';

export function useFailureCheck(onCompleted = () => {}) {
	let failureCheckRolling = $state(false);
	let failureCheckResult = $state();

	/**
	 * Handle failure check roll and confirmation
	 */
	async function handleFailureCheck(triggerAutoPlay) {
		if (failureCheckRolling) return;

		const currentScreen = gameState.state;

		if (currentScreen == 'failureCheck' && !failureCheckResult) {
			failureCheckRolling = true;
			const { roll, wasLucid, wasSurreal } = getFailureCheckRoll();
			failureCheckResult = roll;
			// Store pending updates (don't apply yet)
			applyFailureCheckResult(roll);
			// Roll dice and wait for animation to complete
			// Pass modifier state for visual dice roll (2d20 if was Lucid/Surreal)
			await rollDice(roll, { isLucid: wasLucid, isSurreal: wasSurreal });
			failureCheckRolling = false;
			// NOW apply the pending updates after dice animation completes
			applyPendingDiceRoll();
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
			await confirmFailureCheck();
			onCompleted(gameState.state);
		} else if (failureCheckResult) {
			await confirmFailureCheck();
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		failureCheckResult = undefined;
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
		get buttonText() {
			return buttonText;
		},

		// Actions
		handleFailureCheck,
		resetState
	};
}
