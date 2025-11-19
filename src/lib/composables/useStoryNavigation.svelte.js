/**
 * useStoryNavigation - Story mode navigation state and controls
 *
 * Manages round navigation with keyboard support and smooth transitions.
 *
 * @param {number} totalRounds - Total number of rounds in the story
 * @param {Function} onExit - Callback when user exits via Escape key
 * @returns {Object} Navigation state and control functions
 *
 * @example
 * const nav = useStoryNavigation(10, () => console.log('exit'));
 * nav.nextRound(); // Navigate to next round
 * nav.previousRound(); // Navigate to previous round
 * nav.jumpToRound(5); // Jump to specific round
 */

import { ANIMATION_DURATION } from '$lib/constants/animations.js';

export function useStoryNavigation(totalRounds, onExit) {
	let currentRoundIndex = $state(0);
	let isNavigating = $state(false);

	// Derived navigation state
	let canGoPrevious = $derived(currentRoundIndex > 0);
	let canGoNext = $derived(currentRoundIndex < totalRounds - 1);

	function previousRound() {
		if (!canGoPrevious || isNavigating) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex--;
			isNavigating = false;
		}, ANIMATION_DURATION.FAST);
	}

	function nextRound() {
		if (!canGoNext || isNavigating) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex++;
			isNavigating = false;
		}, ANIMATION_DURATION.FAST);
	}

	function jumpToRound(index) {
		if (index === currentRoundIndex || isNavigating) return;
		if (index < 0 || index >= totalRounds) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex = index;
			isNavigating = false;
		}, ANIMATION_DURATION.FAST);
	}

	function handleKeyboard(event) {
		if (event.key === 'ArrowLeft') {
			previousRound();
		} else if (event.key === 'ArrowRight') {
			nextRound();
		} else if (event.key === 'Escape') {
			onExit();
		}
	}

	// Keyboard navigation effect
	$effect(() => {
		window.addEventListener('keydown', handleKeyboard);
		return () => {
			window.removeEventListener('keydown', handleKeyboard);
		};
	});

	return {
		get currentRoundIndex() {
			return currentRoundIndex;
		},
		set currentRoundIndex(value) {
			currentRoundIndex = value;
		},
		get isNavigating() {
			return isNavigating;
		},
		get canGoPrevious() {
			return canGoPrevious;
		},
		get canGoNext() {
			return canGoNext;
		},
		previousRound,
		nextRound,
		jumpToRound
	};
}
