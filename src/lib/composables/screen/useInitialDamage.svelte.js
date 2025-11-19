/**
 * useInitialDamage - Initial Damage Roll screen logic composable
 *
 * Manages the state and logic for the "Initial Damage Roll" screen, including:
 * - Dice rolling state and result
 * - Initial stability loss before game begins
 * - Auto-play trigger integration
 * - Button text based on state
 *
 * @returns {Object} Initial damage state and actions
 */

import {
	performInitialDamageRoll,
	applyPendingInitialDamageRoll
} from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';

export function useInitialDamage() {
	let initialDamageRolling = $state(false);
	let initialDamageResult = $state();

	/**
	 * Handle initial damage roll
	 */
	async function handleInitialDamageRoll(triggerAutoPlay) {
		if (initialDamageRolling || initialDamageResult !== undefined) return;
		if (gameState.state !== 'initialDamageRoll') return;

		initialDamageRolling = true;
		const rollResult = Math.floor(Math.random() * 6) + 1;
		initialDamageResult = rollResult;

		try {
			// Store pending updates
			performInitialDamageRoll(rollResult);
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			// Apply pending initial damage roll after animation completes
			applyPendingInitialDamageRoll();
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		} finally {
			initialDamageRolling = false;
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		initialDamageResult = undefined;
		initialDamageRolling = false;
	}

	// Reactive button text
	const buttonText = $derived(
		initialDamageResult ? 'Continue to Round 1' : 'Roll for Initial Damage'
	);

	return {
		// State (read-only via getters)
		get rolling() {
			return initialDamageRolling;
		},
		get result() {
			return initialDamageResult;
		},
		get buttonText() {
			return buttonText;
		},

		// Actions
		handleInitialDamageRoll,
		resetState
	};
}
