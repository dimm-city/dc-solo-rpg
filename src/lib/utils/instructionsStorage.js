/**
 * Utility for managing instruction view state in localStorage
 * Tracks whether the user has seen the "How to Play" instructions
 */

const STORAGE_KEY = 'dc-solo-rpg:instructions-seen';

/**
 * Check if instructions have been seen by the user
 * @returns {boolean} True if instructions have been seen
 */
export function hasSeenInstructions() {
	if (typeof window === 'undefined') {
		return false; // SSR fallback
	}

	try {
		const seen = localStorage.getItem(STORAGE_KEY);
		return seen === 'true';
	} catch (error) {
		console.warn('[instructionsStorage] Failed to read from localStorage:', error);
		return false;
	}
}

/**
 * Mark instructions as seen
 */
export function markInstructionsAsSeen() {
	if (typeof window === 'undefined') {
		return; // SSR fallback
	}

	try {
		localStorage.setItem(STORAGE_KEY, 'true');
	} catch (error) {
		console.warn('[instructionsStorage] Failed to write to localStorage:', error);
	}
}

/**
 * Clear the instructions seen flag (for testing/debugging)
 */
export function clearInstructionsSeen() {
	if (typeof window === 'undefined') {
		return; // SSR fallback
	}

	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.warn('[instructionsStorage] Failed to clear localStorage:', error);
	}
}
