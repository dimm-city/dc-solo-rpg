/**
 * useAutoPlay - Reactive composable for auto-play functionality
 *
 * Provides auto-advance, auto-roll, and TTS integration with cancellable delays.
 * Replaces the old autoPlay.js utility with a Svelte 5 runes-based composable.
 *
 * @example
 * ```javascript
 * import { useAutoPlay } from '$lib/composables/useAutoPlay.svelte.js';
 *
 * const autoPlay = useAutoPlay();
 *
 * // Auto-advance after speaking and delay
 * autoPlay.advance({
 *   text: 'Draw a card',
 *   shouldRead: true,
 *   action: () => drawCard()
 * });
 *
 * // Auto-roll dice
 * autoPlay.roll(() => handleRoll());
 *
 * // Cancel all auto-play
 * autoPlay.cancelAll();
 * ```
 *
 * @component
 * @returns {Object} Auto-play controls and state
 */

import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
import { logger } from '$lib/utils/logger.js';

/**
 * Create a cancellable delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Object} - { promise: Promise<boolean>, cancel: Function }
 */
export function createCancellableDelay(ms) {
	let timeoutId = null;
	let cancelled = false;

	const promise = new Promise((resolve) => {
		timeoutId = setTimeout(() => {
			if (!cancelled) {
				resolve(true);
			}
		}, ms);
	});

	const cancel = () => {
		cancelled = true;
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		return false;
	};

	return { promise, cancel };
}

export function useAutoPlay() {
	// Track active cancellers
	let activeCancellers = $state([]);
	let isActive = $state(false);

	/**
	 * Auto-advance helper
	 * Speaks text if TTS enabled, then waits and triggers action
	 *
	 * @param {Object} options
	 * @param {string} options.text - Text to speak (if auto-read enabled)
	 * @param {boolean} options.shouldRead - Whether this text should be read
	 * @param {Function} options.action - Action to trigger after delay
	 * @param {number} options.customDelay - Custom delay override
	 * @returns {Object} - { cancel: Function }
	 */
	function advance({ text = null, shouldRead = false, action, customDelay = null }) {
		const audioSettings = getAudioSettings();
		const gameplaySettings = getGameplaySettings();

		if (!gameplaySettings.autoContinueAfterReading) {
			return { cancel: () => {} };
		}

		let cancelled = false;
		let delayCanceller = null;

		const cancel = () => {
			cancelled = true;
			if (delayCanceller) {
				delayCanceller();
			}
			// Remove from active cancellers
			activeCancellers = activeCancellers.filter((c) => c !== cancel);
			if (activeCancellers.length === 0) {
				isActive = false;
			}
		};

		// Add to active cancellers
		activeCancellers.push(cancel);
		isActive = true;

		// Run async logic in background
		(async () => {
			try {
				// Step 1: Speak if enabled
				if (text && shouldRead) {
					await speak(text);
					if (cancelled) return;
				}

				// Step 2: Wait for delay
				const delay = customDelay ?? gameplaySettings.autoAdvanceDelay;
				const { promise, cancel: cancelDelay } = createCancellableDelay(delay);
				delayCanceller = cancelDelay;

				const completed = await promise;
				if (!completed || cancelled) return;

				// Step 3: Trigger action
				if (action && !cancelled) {
					action();
				}
			} catch (error) {
				logger.error('[useAutoPlay] advance error:', error);
			} finally {
				// Remove from active cancellers
				activeCancellers = activeCancellers.filter((c) => c !== cancel);
				if (activeCancellers.length === 0) {
					isActive = false;
				}
			}
		})();

		return { cancel };
	}

	/**
	 * Auto-roll helper
	 * Automatically triggers dice roll after delay
	 *
	 * @param {Function} rollAction - Function to call to perform roll
	 * @returns {Object} - { cancel: Function }
	 */
	function roll(rollAction) {
		const gameplaySettings = getGameplaySettings();

		if (!gameplaySettings.autoRollDice) {
			return { cancel: () => {} };
		}

		const delay = gameplaySettings.autoAdvanceDelay;
		const { promise, cancel: cancelDelay } = createCancellableDelay(delay);

		const cancel = () => {
			cancelDelay();
			// Remove from active cancellers
			activeCancellers = activeCancellers.filter((c) => c !== cancel);
			if (activeCancellers.length === 0) {
				isActive = false;
			}
		};

		// Add to active cancellers
		activeCancellers.push(cancel);
		isActive = true;

		// Run async logic in background
		promise.then((completed) => {
			if (completed && rollAction) {
				rollAction();
			}
			// Remove from active cancellers
			activeCancellers = activeCancellers.filter((c) => c !== cancel);
			if (activeCancellers.length === 0) {
				isActive = false;
			}
		});

		return { cancel };
	}

	/**
	 * Cancel all active auto-play actions
	 */
	function cancelAll() {
		// Make a copy to avoid mutation during iteration
		const cancellersToCancel = [...activeCancellers];
		cancellersToCancel.forEach((cancel) => cancel());
		activeCancellers = [];
		isActive = false;
	}

	/**
	 * Check if any auto-play features are enabled
	 * @returns {boolean}
	 */
	function isEnabled() {
		const audioSettings = getAudioSettings();
		const gameplaySettings = getGameplaySettings();

		return (
			audioSettings.autoReadCards ||
			audioSettings.autoReadPrompts ||
			audioSettings.autoAnnounceRolls ||
			gameplaySettings.autoRollDice ||
			gameplaySettings.autoContinueAfterReading
		);
	}

	/**
	 * Get auto-advance countdown text
	 * @param {number} remaining - Milliseconds remaining
	 * @returns {string}
	 */
	function getCountdownText(remaining) {
		const seconds = Math.ceil(remaining / 1000);
		return `${seconds}s`;
	}

	// Return auto-play controls
	return {
		// Actions
		advance,
		roll,
		cancelAll,

		// State
		get isActive() {
			return isActive;
		},
		get activeCount() {
			return activeCancellers.length;
		},

		// Helpers
		isEnabled,
		getCountdownText
	};
}

// Also export the standalone functions for backward compatibility
export { createCancellableDelay as createCancellableDelay };

/**
 * Standalone autoAdvance function (backward compatible)
 * @deprecated Use useAutoPlay().advance() instead
 */
export function autoAdvance({ text = null, shouldRead = false, action, customDelay = null }) {
	const audioSettings = getAudioSettings();
	const gameplaySettings = getGameplaySettings();

	if (!gameplaySettings.autoContinueAfterReading) {
		return { cancel: () => {} };
	}

	let cancelled = false;
	let delayCanceller = null;

	const cancel = () => {
		cancelled = true;
		if (delayCanceller) {
			delayCanceller();
		}
	};

	// Run async logic in background
	(async () => {
		try {
			// Step 1: Speak if enabled
			if (text && shouldRead) {
				await speak(text);
				if (cancelled) return;
			}

			// Step 2: Wait for delay
			const delay = customDelay ?? gameplaySettings.autoAdvanceDelay;
			const { promise, cancel: cancelDelay } = createCancellableDelay(delay);
			delayCanceller = cancelDelay;

			const completed = await promise;
			if (!completed || cancelled) return;

			// Step 3: Trigger action
			if (action && !cancelled) {
				action();
			}
		} catch (error) {
			logger.error('[AutoAdvance] Error:', error);
		}
	})();

	return { cancel };
}

/**
 * Standalone autoRoll function (backward compatible)
 * @deprecated Use useAutoPlay().roll() instead
 */
export function autoRoll(rollAction) {
	const gameplaySettings = getGameplaySettings();

	if (!gameplaySettings.autoRollDice) {
		return { cancel: () => {} };
	}

	const delay = gameplaySettings.autoAdvanceDelay;
	const { promise, cancel } = createCancellableDelay(delay);

	// Run async logic in background
	promise.then((completed) => {
		if (completed && rollAction) {
			rollAction();
		}
	});

	return { cancel };
}

/**
 * Check if any auto-play features are enabled (backward compatible)
 * @deprecated Use useAutoPlay().isEnabled() instead
 */
export function isAutoPlayEnabled() {
	const audioSettings = getAudioSettings();
	const gameplaySettings = getGameplaySettings();

	return (
		audioSettings.autoReadCards ||
		audioSettings.autoReadPrompts ||
		audioSettings.autoAnnounceRolls ||
		gameplaySettings.autoRollDice ||
		gameplaySettings.autoContinueAfterReading
	);
}

/**
 * Get auto-advance countdown text (backward compatible)
 * @deprecated Use useAutoPlay().getCountdownText() instead
 */
export function getCountdownText(remaining) {
	const seconds = Math.ceil(remaining / 1000);
	return `${seconds}s`;
}
