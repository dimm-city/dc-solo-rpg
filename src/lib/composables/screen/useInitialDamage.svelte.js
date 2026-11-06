/**
 * useInitialDamage - Initial instability roll composable
 *
 * Two steps on one button:
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), Stability updates and a
 *    result line stays on screen. The button becomes "Continue".
 * 2. Continue: only now does the first round start.
 *
 * @returns {Object} Initial damage state and actions
 */

import {
	performInitialDamageRoll,
	applyPendingInitialDamageRoll,
	advanceAfterInitialDamage
} from '../../stores/gameActions.svelte.js';
import { rollDice, skipRoll } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import {
	formatStabilityResult,
	formatModifierHint,
	ROLLING_LABEL
} from '../../utils/rollResult.js';

export function useInitialDamage() {
	let initialDamageRolling = $state(false);
	let initialDamageResult = $state();
	let initialDamageResultLine = $state('');

	/**
	 * Roll the initial instability, skip a roll in flight, or (once rolled) continue to round 1
	 */
	async function handleInitialDamageRoll(triggerAutoPlay) {
		if (gameState.state !== 'initialDamageRoll') return;
		if (initialDamageRolling) {
			skipRoll();
			return;
		}

		if (initialDamageResult !== undefined) {
			advanceAfterInitialDamage();
			return;
		}

		initialDamageRolling = true;
		try {
			const towerBefore = gameState.tower;
			// The same d20 roll as every other check (Lucid/Surreal included); pending until the dice land
			const thrown = performInitialDamageRoll();
			initialDamageResult = thrown.roll;
			await rollDice(thrown.roll, {
				isLucid: thrown.wasLucid,
				isSurreal: thrown.wasSurreal,
				dice: thrown.dice
			});
			// Apply after animation, but stay here until the player continues
			applyPendingInitialDamageRoll({ advance: false });
			initialDamageResultLine = formatStabilityResult(
				thrown.roll,
				towerBefore,
				gameState.tower,
				20,
				thrown
			);
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
	const buttonText = $derived(
		initialDamageRolling
			? ROLLING_LABEL
			: initialDamageResult !== undefined
				? 'Continue'
				: 'Roll for instability'
	);
	// The modifier the roll will use, shown on the roll button only
	const buttonHint = $derived(
		initialDamageResult === undefined && !initialDamageRolling
			? formatModifierHint(gameState)
			: null
	);

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
		get buttonHint() {
			return buttonHint;
		},

		// Actions
		handleInitialDamageRoll,
		resetState
	};
}
