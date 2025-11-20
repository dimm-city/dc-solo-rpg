/**
 * useKeyboardShortcuts - Reactive composable for keyboard shortcuts
 *
 * Provides reusable keyboard shortcut handling with automatic cleanup.
 * Handles common patterns like Space/Enter for primary actions, Escape for closing modals, etc.
 *
 * @example
 * ```javascript
 * import { useKeyboardShortcuts } from '$lib/composables/useKeyboardShortcuts.svelte.js';
 *
 * const keyboard = useKeyboardShortcuts({
 *   onSpace: () => drawCard(),
 *   onEnter: () => drawCard(),
 *   onEscape: () => closeModal(),
 *   disabled: () => isModalOpen
 * });
 *
 * onMount(() => {
 *   keyboard.enable();
 *   return () => keyboard.disable();
 * });
 * ```
 *
 * @component
 * @param {Object} options - Configuration options
 * @param {Function} options.onSpace - Handler for Space key
 * @param {Function} options.onEnter - Handler for Enter key
 * @param {Function} options.onEscape - Handler for Escape key
 * @param {Function} options.onArrowLeft - Handler for Left Arrow
 * @param {Function} options.onArrowRight - Handler for Right Arrow
 * @param {Function} options.onArrowUp - Handler for Up Arrow
 * @param {Function} options.onArrowDown - Handler for Down Arrow
 * @param {Function} options.disabled - Function that returns true if shortcuts should be disabled
 * @param {boolean} options.preventDefault - Whether to prevent default behavior (default: true)
 * @returns {Object} Keyboard shortcut controls
 */

import { onMount, onDestroy } from 'svelte';

export function useKeyboardShortcuts({
	onSpace = null,
	onEnter = null,
	onEscape = null,
	onArrowLeft = null,
	onArrowRight = null,
	onArrowUp = null,
	onArrowDown = null,
	disabled = () => false,
	preventDefault = true
} = {}) {
	let isEnabled = $state(false);
	let lastKey = $state(null);
	let lastKeyTimestamp = $state(0);

	/**
	 * Check if keyboard shortcuts should be ignored
	 * @param {KeyboardEvent} event
	 * @returns {boolean}
	 */
	function shouldIgnore(event) {
		// Ignore if disabled
		if (disabled()) {
			return true;
		}

		// Ignore if user is typing in an input/textarea
		const target = event.target;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
			return true;
		}

		// Ignore if contentEditable
		if (target && target.isContentEditable) {
			return true;
		}

		return false;
	}

	/**
	 * Handle keyboard events
	 * @param {KeyboardEvent} event
	 */
	function handleKeyDown(event) {
		if (shouldIgnore(event)) {
			return;
		}

		const key = event.key.toLowerCase();
		lastKey = key;
		lastKeyTimestamp = Date.now();

		// Handle shortcuts
		let handled = false;

		switch (key) {
			case ' ':
				if (onSpace) {
					onSpace(event);
					handled = true;
				}
				break;

			case 'enter':
				if (onEnter) {
					onEnter(event);
					handled = true;
				}
				break;

			case 'escape':
				if (onEscape) {
					onEscape(event);
					handled = true;
				}
				break;

			case 'arrowleft':
				if (onArrowLeft) {
					onArrowLeft(event);
					handled = true;
				}
				break;

			case 'arrowright':
				if (onArrowRight) {
					onArrowRight(event);
					handled = true;
				}
				break;

			case 'arrowup':
				if (onArrowUp) {
					onArrowUp(event);
					handled = true;
				}
				break;

			case 'arrowdown':
				if (onArrowDown) {
					onArrowDown(event);
					handled = true;
				}
				break;
		}

		// Prevent default if handler was triggered
		if (handled && preventDefault) {
			event.preventDefault();
		}
	}

	/**
	 * Enable keyboard shortcuts
	 */
	function enable() {
		if (typeof window === 'undefined') return;
		if (isEnabled) return;

		window.addEventListener('keydown', handleKeyDown);
		isEnabled = true;
	}

	/**
	 * Disable keyboard shortcuts
	 */
	function disable() {
		if (typeof window === 'undefined') return;
		if (!isEnabled) return;

		window.removeEventListener('keydown', handleKeyDown);
		isEnabled = false;
	}

	/**
	 * Simulate a key press (for testing)
	 * @param {string} key - Key to simulate
	 */
	function simulateKeyPress(key) {
		const event = new KeyboardEvent('keydown', { key });
		handleKeyDown(event);
	}

	// Return controls
	return {
		// Actions
		enable,
		disable,
		simulateKeyPress,

		// State
		get isEnabled() {
			return isEnabled;
		},
		get lastKey() {
			return lastKey;
		},
		get lastKeyTimestamp() {
			return lastKeyTimestamp;
		}
	};
}

/**
 * useGameScreenShortcuts - Specialized shortcut handler for GameScreen
 *
 * Provides Space/Enter to trigger primary action button on current screen.
 *
 * @example
 * ```javascript
 * import { useGameScreenShortcuts } from '$lib/composables/useKeyboardShortcuts.svelte.js';
 *
 * const shortcuts = useGameScreenShortcuts({
 *   onPrimaryAction: () => {
 *     // Find and click the primary button
 *   },
 *   disabled: () => showModal
 * });
 *
 * onMount(() => {
 *   shortcuts.enable();
 *   return () => shortcuts.disable();
 * });
 * ```
 */
export function useGameScreenShortcuts({ onPrimaryAction, disabled = () => false }) {
	const handleAction = (event) => {
		if (onPrimaryAction) {
			onPrimaryAction(event);
		}
	};

	return useKeyboardShortcuts({
		onSpace: handleAction,
		onEnter: handleAction,
		disabled,
		preventDefault: true
	});
}

/**
 * useModalShortcuts - Specialized shortcut handler for modals
 *
 * Provides Escape to close modal.
 *
 * @example
 * ```javascript
 * import { useModalShortcuts } from '$lib/composables/useKeyboardShortcuts.svelte.js';
 *
 * const shortcuts = useModalShortcuts({
 *   onClose: () => {
 *     isOpen = false;
 *   }
 * });
 * ```
 */
export function useModalShortcuts({ onClose }) {
	return useKeyboardShortcuts({
		onEscape: onClose,
		preventDefault: true
	});
}
