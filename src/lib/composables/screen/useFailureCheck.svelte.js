/**
 * useFailureCheck - Stability check screen logic composable
 *
 * 1. Roll: dice animate ("Rolling…"; a press skips to the result), the result is applied
 *    (the HUD updates) and a result line stays on screen. The button names where it goes next
 *    ("Draw the next card", "Go to Salvation", "Open your journal").
 * 2. The game moves on by itself after the result hold (next card, Salvation or the journal).
 *    A press moves on at once.
 *
 * A result that ends the game does not move on by itself: the button reads "Face the end"
 * (the fatal roll: Stability reaches 0) or "Escape" (the fourth Ace's check held) and waits.
 *
 * On Easy the fourth Ace's check is the last roll of the game (isFinalStabilityCheck): the roll
 * button says what is at stake, and the result line ends in "you escape" when Stability holds.
 *
 * @param {Function} onCompleted - Callback when the check is completed (after it moves on)
 * @returns {Object} Failure check state and actions
 */

import {
	getFailureCheckRoll,
	applyFailureCheckResult,
	applyPendingDiceRoll,
	advanceAfterFailureCheck,
	isFinalStabilityCheck
} from '../../stores/gameActions.svelte.js';
import { rollDice, skipRoll } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';
import { getGameplaySettings } from '../../stores/audioStore.svelte.js';
import {
	formatStabilityResult,
	formatModifierHint,
	formatNextStepLabel,
	ROLLING_LABEL,
	FINAL_CHECK_LABEL
} from '../../utils/rollResult.js';
import { createResultHold } from './resultHold.svelte.js';

export function useFailureCheck(onCompleted = () => {}) {
	let failureCheckRolling = $state(false);
	let failureCheckResult = $state();
	let failureCheckResultLine = $state('');
	const hold = createResultHold();

	/** Leave the check (once, and only from this screen) */
	function advance() {
		hold.cancel();
		if (gameState.state !== 'failureCheck' || !failureCheckResult) return;
		advanceAfterFailureCheck();
		onCompleted(gameState.state);
	}

	/**
	 * Roll the check, skip a roll in flight, or (once rolled) move on now
	 */
	async function handleFailureCheck(triggerAutoPlay) {
		const currentScreen = gameState.state;
		if (currentScreen !== 'failureCheck') return;
		if (failureCheckRolling) {
			skipRoll();
			return;
		}

		if (!failureCheckResult) {
			failureCheckRolling = true;
			try {
				const final = isFinalStabilityCheck();
				const thrown = getFailureCheckRoll();
				failureCheckResult = thrown.roll;
				const towerBefore = gameState.tower;
				// Store pending updates (don't apply yet)
				applyFailureCheckResult(thrown.roll);
				// Show the dice the game rolled (2d20 if Lucid/Surreal) and wait for them to land
				await rollDice(thrown.roll, {
					isLucid: thrown.wasLucid,
					isSurreal: thrown.wasSurreal,
					dice: thrown.dice
				});
				// Apply the result after the animation; the game moves on after the hold
				applyPendingDiceRoll({ advance: false });
				failureCheckResultLine = formatStabilityResult(
					thrown.roll,
					towerBefore,
					gameState.tower,
					20,
					thrown,
					{ final }
				);
				if (!gameState.gameOver) hold.start(advance);
			} finally {
				failureCheckRolling = false;
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
		failureCheckResult = undefined;
		failureCheckResultLine = '';
		failureCheckRolling = false;
	}

	// Reactive button text (DP-1-06): "Roll for Stability" before the roll (the final check on
	// Easy too: its stakes are in the description); after it, the screen the button goes to
	const buttonText = $derived(
		failureCheckRolling
			? ROLLING_LABEL
			: failureCheckResult
				? formatNextStepLabel({
						gameOver: gameState.gameOver,
						win: gameState.win,
						next:
							gameState.cardsToDraw > 0
								? 'draw'
								: gameState.aceOfHeartsRevealed && gameState.tokens > 0
									? 'salvation'
									: 'journal',
						round: gameState.round,
						skipJournal: getGameplaySettings().autoHandleJournaling === 'skip'
					})
				: isFinalStabilityCheck()
					? FINAL_CHECK_LABEL
					: 'Roll for Stability'
	);
	// The modifier the roll will use, shown on the roll button only
	const buttonHint = $derived(
		failureCheckResult || failureCheckRolling ? null : formatModifierHint(gameState)
	);

	return {
		// State (read-only via getters)
		get rolling() {
			return failureCheckRolling;
		},
		get result() {
			return failureCheckResult;
		},
		get resultLine() {
			return failureCheckResultLine;
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
		handleFailureCheck,
		resetState
	};
}
