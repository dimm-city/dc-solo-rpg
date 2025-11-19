/**
 * useRollForTasks - Roll for Tasks screen logic composable
 *
 * Manages the state and logic for the "Roll for Tasks" screen, including:
 * - Roll button state (rolled/rolling/confirming)
 * - Dice rolling integration with 3D animation
 * - Auto-play trigger integration
 * - Button text and disabled state
 *
 * @returns {Object} Roll for tasks state and actions
 */

import { rollForTasks, confirmTaskRoll, applyPendingTaskRoll } from '../../stores/gameActions.svelte.js';
import { rollDice } from '../../stores/diceStore.svelte.js';
import { gameState } from '../../stores/gameStore.svelte.js';

export function useRollForTasks() {
	let rollTasksRolled = $state(false);
	let rollTasksRolling = $state(false);
	let rollTasksConfirming = $state(false);

	/**
	 * Handle roll/confirm action for tasks
	 * First click: Roll dice
	 * Second click: Confirm and transition
	 */
	async function handleRollForTasks(triggerAutoPlay) {
		if (rollTasksRolling || rollTasksConfirming) return;

		if (rollTasksRolled) {
			// Confirm
			rollTasksConfirming = true;
			await confirmTaskRoll();
			rollTasksConfirming = false;
		} else {
			// Roll
			rollTasksRolling = true;
			const { roll, wasLucid, wasSurreal } = await rollForTasks();
			// Roll dice and wait for animation to complete
			// Pass modifier state for visual dice roll (2d20 if was Lucid/Surreal)
			await rollDice(roll, { isLucid: wasLucid, isSurreal: wasSurreal });
			rollTasksRolling = false;
			// Apply pending dice roll after animation completes
			applyPendingTaskRoll();
			rollTasksRolled = true;
			// Trigger auto-play after roll completes (event-driven)
			if (triggerAutoPlay) {
				setTimeout(() => triggerAutoPlay(), 0);
			}
		}
	}

	/**
	 * Reset state when entering screen
	 */
	function resetState() {
		rollTasksRolled = false;
		rollTasksRolling = false;
		rollTasksConfirming = false;
	}

	// Reactive button text
	const buttonText = $derived(
		rollTasksRolled
			? (gameState.config?.labels?.rollForTasksResultHeader ??
					`Draw ${gameState.cardsToDraw} Card${gameState.cardsToDraw !== 1 ? 's' : ''}`)
			: (gameState.config?.labels?.rollForTasksHeader ?? 'Roll Dice')
	);

	// Reactive button disabled state
	const buttonDisabled = $derived(rollTasksRolling || rollTasksConfirming);

	return {
		// State (read-only via getters)
		get rolled() {
			return rollTasksRolled;
		},
		get rolling() {
			return rollTasksRolling;
		},
		get confirming() {
			return rollTasksConfirming;
		},
		get buttonText() {
			return buttonText;
		},
		get buttonDisabled() {
			return buttonDisabled;
		},

		// Actions
		handleRollForTasks,
		resetState
	};
}
