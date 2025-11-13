/**
 * Utility for managing instruction view state in localStorage and sessionStorage
 * Tracks whether the user has seen the "How to Play" instructions
 */

const STORAGE_KEY = 'dc-solo-rpg:instructions-seen';
const SESSION_KEY = 'dc-solo-rpg:instructions-shown-in-session';

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

/**
 * Check if instructions have been shown in this session
 * @returns {boolean} True if instructions have been shown in this session
 */
export function hasShownInstructionsInSession() {
	if (typeof window === 'undefined') {
		return false; // SSR fallback
	}

	try {
		const shown = sessionStorage.getItem(SESSION_KEY);
		return shown === 'true';
	} catch (error) {
		console.warn('[instructionsStorage] Failed to read from sessionStorage:', error);
		return false;
	}
}

/**
 * Mark instructions as shown for this session
 */
export function markInstructionsShownInSession() {
	if (typeof window === 'undefined') {
		return; // SSR fallback
	}

	try {
		sessionStorage.setItem(SESSION_KEY, 'true');
	} catch (error) {
		console.warn('[instructionsStorage] Failed to write to sessionStorage:', error);
	}
}
