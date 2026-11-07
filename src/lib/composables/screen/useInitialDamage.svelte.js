/**
 * useInitialDamage - Initial instability roll composable
 *
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), Stability updates and a
 *    result line stays on screen. The button becomes "Continue".
 * 2. The first round starts by itself after the result hold, like every other roll's result.
 *    A press starts it at once.
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
import { createResultHold } from './resultHold.svelte.js';

export function useInitialDamage() {
	let initialDamageRolling = $state(false);
	let initialDamageResult = $state();
	let initialDamageResultLine = $state('');
	const hold = createResultHold();

	/** Start round 1 (once, and only from this screen) */
	function advance() {
		hold.cancel();
		if (gameState.state !== 'initialDamageRoll' || initialDamageResult === undefined) return;
		advanceAfterInitialDamage();
	}

	/**
	 * Roll the initial instability, skip a roll in flight, or (once rolled) start round 1 now
	 */
	async function handleInitialDamageRoll(triggerAutoPlay) {
		if (gameState.state !== 'initialDamageRoll') return;
		if (initialDamageRolling) {
			skipRoll();
			return;
		}

		if (initialDamageResult !== undefined) {
			advance();
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
			// Apply after animation; round 1 starts after the hold
			applyPendingInitialDamageRoll({ advance: false });
			initialDamageResultLine = formatStabilityResult(
				thrown.roll,
				towerBefore,
				gameState.tower,
				20,
				thrown
			);
			if (!gameState.gameOver) hold.start(advance);
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
		hold.cancel();
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
		/** The wait before round 1 starts (see createResultHold) */
		hold,

		// Actions
		handleInitialDamageRoll,
		resetState
	};
}
