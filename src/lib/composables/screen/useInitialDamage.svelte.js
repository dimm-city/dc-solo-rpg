/**
 * useInitialDamage - Initial instability roll composable
 *
 * Two steps on one button:
 * 1. Roll: dice animate, Stability updates and a result line stays on screen.
 *    The button becomes "Continue".
 * 2. Continue: only now does the first round start.
 *
 * @returns {Object} Initial damage state and actions
 */

import {
	performInitialDamageRoll,
	applyPendingInitialDamageRoll,
	advanceAfterInitialDamage
} from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import { formatStabilityResult } from '../../utils/rollResult.js';

export function useInitialDamage() {
	let initialDamageRolling = $state(false);
	let initialDamageResult = $state();
	let initialDamageResultLine = $state('');

	/**
	 * Roll the initial instability, or (once rolled) continue to round 1
	 */
	async function handleInitialDamageRoll(triggerAutoPlay) {
		if (initialDamageRolling) return;
		if (gameState.state !== 'initialDamageRoll') return;

		if (initialDamageResult !== undefined) {
			advanceAfterInitialDamage();
			return;
		}

		initialDamageRolling = true;
		const rollResult = Math.floor(Math.random() * 6) + 1;
		initialDamageResult = rollResult;

		try {
			const towerBefore = gameState.tower;
			// Store pending updates
			performInitialDamageRoll(rollResult);
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			// Apply after animation, but stay here until the player continues
			applyPendingInitialDamageRoll({ advance: false });
			initialDamageResultLine = formatStabilityResult(rollResult, towerBefore, gameState.tower);
		} finally {
			initialDamageRolling = false;
		}
		// Trigger auto-play after roll completes (event-driven)
		if (triggerAutoPlay) {
			setTimeout(() => triggerAutoPlay(), 0);
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		initialDamageResult = undefined;
		initialDamageResultLine = '';
		initialDamageRolling = false;
	}

	// Reactive button text
	const buttonText = $derived(initialDamageResult ? 'Continue' : 'Roll for instability');

	return {
		// State (read-only via getters)
		get rolling() {
			return initialDamageRolling;
		},
		get result() {
			return initialDamageResult;
		},
		get resultLine() {
			return initialDamageResultLine;
		},
		get buttonText() {
			return buttonText;
		},

		// Actions
		handleInitialDamageRoll,
		resetState
	};
}
