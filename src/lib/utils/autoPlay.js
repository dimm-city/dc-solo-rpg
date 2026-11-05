/**
 * Auto-play utility functions
 * Provides helpers for auto-advancing, auto-rolling, and TTS integration
 */

import { getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
import { logger } from './logger.js';

/**
 * Create a cancellable delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<boolean>} - Resolves to true if completed, false if cancelled
 */
function createCancellableDelay(ms) {
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

/**
 * Auto-advance helper
 * Speaks text if TTS enabled, then waits and triggers action
 * @param {Object} options
 * @param {string} options.text - Text to speak (if auto-read enabled)
 * @param {boolean} options.shouldRead - Whether this text should be read (prompts vs cards)
 * @param {Function} options.action - Action to trigger after delay
 * @param {number} options.customDelay - Custom delay override
 * @returns {Object} - { cancel: Function } returned immediately (synchronously)
 */
export function autoAdvance({ text = null, shouldRead = false, action, customDelay = null }) {
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
 * Auto-roll helper
 * Automatically triggers dice roll after delay
 * @param {Function} rollAction - Function to call to perform roll
 * @returns {Object} - { cancel: Function } returned immediately (synchronously)
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
