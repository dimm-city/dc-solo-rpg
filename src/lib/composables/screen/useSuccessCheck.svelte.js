/**
 * useSuccessCheck - Salvation check screen logic composable
 *
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), the tokens update and a
 *    result line stays on screen. The button becomes "Continue".
 *    On Normal tokens only ever fall: a miss loses none, and the line says so. On Hard a miss
 *    adds tokens, and with all four Aces there is no target but the roll is a Stability check:
 *    the token comes off only if Stability holds.
 * 2. The game moves on to the journal by itself after the result hold. A press moves on at once.
 *
 * A result that ends the game (the last token, or Stability lost to the four-Aces check on
 * Hard) does not move on by itself: the button reads "Escape" or "Face the end" and waits.
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
import { isHardGame } from '../../constants/difficulty.js';
import {
	formatSalvationResult,
	formatSalvationButton,
	formatModifierHint,
	ROLLING_LABEL
} from '../../utils/rollResult.js';
import { createResultHold } from './resultHold.svelte.js';

export function useSuccessCheck() {
	let successCheckRolling = $state(false);
	let successCheckDone = $state(false);
	let successCheckResultLine = $state('');
	const hold = createResultHold();

	/** Leave the check (once, and only from this screen) */
	function advance() {
		hold.cancel();
		if (gameState.state !== 'successCheck' || !successCheckDone) return;
		advanceAfterSuccessCheck();
	}

	/** Apply the rolled (or resumed) result, show its line and start the hold */
	function settle(roll, threshold, thrown) {
		const stabilityBefore = gameState.tower;
		const hard = isHardGame(gameState);
		applyPendingSuccessCheck({ advance: false });
		successCheckResultLine = formatSalvationResult(roll, threshold, gameState.tokens, thrown, {
			hard,
			stabilityBefore
		});
		if (!gameState.gameOver) hold.start(advance);
	}

	/**
	 * Roll the check, skip a roll in flight, or (once rolled) move on now
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
				// Show the dice the game rolled (2d20 if Lucid/Surreal) and wait for them to land
				await rollDice(thrown.roll, {
					isLucid: thrown.wasLucid,
					isSurreal: thrown.wasSurreal,
					dice: thrown.dice
				});
				// Apply the result after the animation; the game moves on after the hold
				settle(thrown.roll, thrown.threshold, thrown);
			} finally {
				successCheckRolling = false;
			}
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		} else {
			advance();
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		hold.cancel();
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
		successCheckDone = true;
		settle(diceRoll, getCurrentSalvationThreshold());
	}

	// Reactive button text: the target is shown before rolling; an ending is named
	const buttonText = $derived(
		successCheckRolling
			? ROLLING_LABEL
			: successCheckDone
				? gameState.gameOver
					? gameState.win
						? 'Escape'
						: 'Face the end'
					: 'Continue'
				: formatSalvationButton(getCurrentSalvationThreshold())
	);
	// The modifier the roll will use, shown on the roll button only
	const buttonHint = $derived(
		successCheckDone || successCheckRolling ? null : formatModifierHint(gameState)
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
		/** The wait before the game moves on (see createResultHold) */
		hold,

		// Actions
		handleSuccessCheck,
		resetState,
		resumePending
	};
}
