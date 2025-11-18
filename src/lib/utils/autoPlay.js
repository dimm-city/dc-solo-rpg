/**
 * Auto-play utility functions
 * Provides helpers for auto-advancing, auto-rolling, and TTS integration
 */

import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';

/**
 * Create a cancellable delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<boolean>} - Resolves to true if completed, false if cancelled
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

/**
 * Auto-advance helper
 * Speaks text if TTS enabled, then waits and triggers action
 * @param {Object} options
 * @param {string} options.text - Text to speak (if auto-read enabled)
 * @param {boolean} options.shouldRead - Whether this text should be read (prompts vs cards)
 * @param {Function} options.action - Action to trigger after delay
 * @param {number} options.customDelay - Custom delay override
 * @returns {Object} - { cancel: Function }
 */
export async function autoAdvance({ text = null, shouldRead = false, action, customDelay = null }) {
	const audioSettings = getAudioSettings();
	const gameplaySettings = getGameplaySettings();

	if (!gameplaySettings.autoContinueAfterReading) {
		return { cancel: () => {} };
	}

	let cancelled = false;
	const cancel = () => {
		cancelled = true;
	};

	try {
		// Step 1: Speak if enabled
		if (text && shouldRead) {
			await speak(text);
			if (cancelled) return { cancel };
		}

		// Step 2: Wait for delay
		const delay = customDelay ?? gameplaySettings.autoAdvanceDelay;
		const { promise, cancel: cancelDelay } = createCancellableDelay(delay);

		// Store cancel function
		const originalCancel = cancel;
		cancel = () => {
			cancelled = true;
			cancelDelay();
			originalCancel();
		};

		const completed = await promise;
		if (!completed || cancelled) return { cancel };

		// Step 3: Trigger action
		if (action && !cancelled) {
			action();
		}
	} catch (error) {
		console.error('[AutoAdvance] Error:', error);
	}

	return { cancel };
}

/**
 * Auto-roll helper
 * Automatically triggers dice roll after delay
 * @param {Function} rollAction - Function to call to perform roll
 * @returns {Object} - { cancel: Function }
 */
export async function autoRoll(rollAction) {
	const gameplaySettings = getGameplaySettings();

	if (!gameplaySettings.autoRollDice) {
		return { cancel: () => {} };
	}

	const delay = gameplaySettings.autoAdvanceDelay;
	const { promise, cancel } = createCancellableDelay(delay);

	const completed = await promise;
	if (completed && rollAction) {
		rollAction();
	}

	return { cancel };
}

/**
 * Check if any auto-play features are enabled
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
 * Get auto-advance countdown text
 * @param {number} remaining - Milliseconds remaining
 * @returns {string}
 */
export function getCountdownText(remaining) {
	const seconds = Math.ceil(remaining / 1000);
	return `${seconds}s`;
}
