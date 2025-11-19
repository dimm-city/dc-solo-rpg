/**
 * useFinalDamage - Final Damage Roll screen logic composable
 *
 * Manages the state and logic for the "Final Damage Roll" screen, including:
 * - Final dice roll after all tokens removed
 * - Win/lose determination based on remaining stability
 * - Auto-play trigger integration
 * - Button text based on win/lose outcome
 *
 * @returns {Object} Final damage state and actions
 */

import {
	performFinalDamageRoll,
	applyPendingFinalDamageRoll
} from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';

export function useFinalDamage() {
	let finalDamageRolling = $state(false);
	let finalDamageResult = $state();

	/**
	 * Handle final damage roll
	 */
	async function handleFinalDamageRoll(triggerAutoPlay) {
		if (finalDamageRolling || finalDamageResult !== undefined) return;
		if (gameState.state !== 'finalDamageRoll') return;

		finalDamageRolling = true;
		const rollResult = Math.floor(Math.random() * 6) + 1;
		finalDamageResult = rollResult;

		try {
			// Store pending updates
			performFinalDamageRoll(rollResult);
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			// Apply pending final damage roll after animation completes
			applyPendingFinalDamageRoll();
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		} finally {
			finalDamageRolling = false;
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		finalDamageResult = undefined;
		finalDamageRolling = false;
	}

	// Reactive button text
	const buttonText = $derived(
		finalDamageResult
			? gameState.win
				? 'Victory! Continue'
				: 'Defeat... Continue'
			: 'Roll Final Damage'
	);

	return {
		// State (read-only via getters)
		get rolling() {
			return finalDamageRolling;
		},
		get result() {
			return finalDamageResult;
		},
		get buttonText() {
			return buttonText;
		},

		// Actions
		handleFinalDamageRoll,
		resetState
	};
}
