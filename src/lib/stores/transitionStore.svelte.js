/**
 * Manages animation state to prevent race conditions
 * Uses Svelte 5 runes
 */

// Track transition state
let transitionState = $state({
	isTransitioning: false,
	currentAnimation: null
});

export { transitionState };

/**
 * Set the transitioning state
 * @param {boolean} value - Whether a transition is in progress
 */
export function setTransitioning(value) {
	transitionState.isTransitioning = value;
}

/**
 * Getter function for easy access
 * In Svelte 5 runes mode, you can't export $derived from modules
 */
export function getIsTransitioning() {
	return transitionState.isTransitioning;
}
