/**
 * useSuccessCheck - Salvation check screen logic composable
 *
 * Two steps on one button:
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), the tokens update and a
 *    result line stays on screen. The button becomes "Continue".
 *    With all four Aces, Salvation is automatic: no dice, the result shows at once.
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
	getCurrentSalvationThreshold
} from '../../stores/gameActions.svelte.js';
import { rollDice, skipRoll } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import {
	formatSalvationResult,
	formatSalvationButton,
	formatModifierHint,
	ROLLING_LABEL
} from '../../utils/rollResult.js';

export function useSuccessCheck() {
	let successCheckRolling = $state(false);
	let successCheckDone = $state(false);
	let successCheckResultLine = $state('');

	/**
	 * Roll the check, skip a roll in flight, or (once rolled) continue to the next step
	 */
	async function handleSuccessCheck(triggerAutoPlay) {
		const currentScreen = gameState.state;
		if (currentScreen !== 'successCheck') return;
		if (successCheckRolling) {
			skipRoll();
			return;
		}

		if (!successCheckDone) {
			successCheckRolling = true;
			try {
				// Threshold before rolling: the Aces can't change mid-check
				const thrown = await successCheck();
				successCheckDone = true;
				if (!thrown.automatic) {
					// Show the dice the game rolled (2d20 if Lucid/Surreal) and wait for them to land
					await rollDice(thrown.roll, {
						isLucid: thrown.wasLucid,
						isSurreal: thrown.wasSurreal,
						dice: thrown.dice
					});
				}
				// Apply the result after the animation, but stay here until the player continues
				applyPendingSuccessCheck({ advance: false });
				successCheckResultLine = formatSalvationResult(
					thrown.roll,
					thrown.threshold,
					gameState.tokens,
					thrown
				);
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
		successCheckDone = false;
		successCheckResultLine = '';
		successCheckRolling = false;
	}

	/**
	 * A game saved mid-roll (Salvation saves as it rolls) resumes on that roll's result,
	 * rather than offering the roll again. Call after resetState() on screen entry.
	 */
	function resumePending() {
		const { diceRoll, tokenChange } = gameState.pendingUpdates;
		if (gameState.state !== 'successCheck' || tokenChange === null) return;
		const threshold = getCurrentSalvationThreshold();
		applyPendingSuccessCheck({ advance: false });
		successCheckDone = true;
		successCheckResultLine = formatSalvationResult(diceRoll, threshold, gameState.tokens);
	}

	// Reactive button text: the target is shown before rolling
	const buttonText = $derived(
		successCheckRolling
			? ROLLING_LABEL
			: successCheckDone
				? 'Continue'
				: formatSalvationButton(getCurrentSalvationThreshold())
	);
	// The modifier the roll will use, shown on the roll button only (an automatic Salvation rolls nothing)
	const buttonHint = $derived(
		successCheckDone || successCheckRolling || getCurrentSalvationThreshold() === 0
			? null
			: formatModifierHint(gameState)
	);

	return {
		// State (read-only via getters)
		get rolling() {
			return successCheckRolling;
		},
		/** true once this screen's check has been made */
		get result() {
			return successCheckDone || undefined;
		},
		get resultLine() {
			return successCheckResultLine;
		},
		get buttonText() {
			return buttonText;
		},
		get buttonHint() {
			return buttonHint;
		},

		// Actions
		handleSuccessCheck,
		resetState,
		resumePending
	};
}
