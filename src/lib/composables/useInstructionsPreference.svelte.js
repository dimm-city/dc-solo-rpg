/**
 * useInstructionsPreference - Instructions preference state management
 *
 * Manages user's instruction viewing preference and current view state
 *
 * @param {Function} transitionTo - Game state transition function
 * @param {Function} exitGame - Exit game function
 * @returns {Object} Instructions preference state and control functions
 *
 * @example
 * const pref = useInstructionsPreference(transitionTo, exitGame);
 * pref.handleLearnToPlay(); // Show instructions
 */

import {
	hasSeenInstructions,
	markInstructionsAsSeen,
	hasShownInstructionsInSession,
	markInstructionsShownInSession
} from '$lib/utils/instructionsStorage.js';

export function useInstructionsPreference(transitionTo, exitGame) {
	// Current view state
	let currentView = $state('choice'); // 'choice' or 'instructions'

	// ✅ FIXED: Use guard pattern to prevent multiple executions
	// Auto-skip logic - check if user has already seen instructions (one-time check)
	let hasCheckedPreference = false;
	$effect(() => {
		if (!hasCheckedPreference) {
			hasCheckedPreference = true;

			const instructionsSeen = hasSeenInstructions();
			const instructionsShownInSession = hasShownInstructionsInSession();

			if (instructionsSeen || instructionsShownInSession) {
				// Skip directly to game intro overlay
				transitionTo('showIntro');
			}
		}
	});

	function handleLearnToPlay() {
		// Mark as shown for this session
		markInstructionsShownInSession();
		currentView = 'instructions';
	}

	function handleSkipOnce() {
		// Skip to story without storing preference (but mark session as shown)
		markInstructionsShownInSession();
		transitionTo('showIntro');
	}

	function handleSkipAlways() {
		// Skip to story and remember preference permanently
		markInstructionsAsSeen();
		markInstructionsShownInSession();
		transitionTo('showIntro');
	}

	function handleInstructionsContinue() {
		// Don't mark as seen when continuing from instructions
		// User chose to learn, so don't auto-skip next time
		transitionTo('showIntro');
	}

	function handleBack() {
		if (currentView === 'instructions') {
			currentView = 'choice';
		} else {
			exitGame();
		}
	}

	return {
		get currentView() {
			return currentView;
		},
		handleLearnToPlay,
		handleSkipOnce,
		handleSkipAlways,
		handleInstructionsContinue,
		handleBack
	};
}
