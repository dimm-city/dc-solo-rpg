/**
 * useStoryNavigation - Story mode navigation state and controls
 *
 * Tracks the current round and the direction of the last move (so the round view can slide
 * the next round in from the side it comes from), and handles the arrow keys and Escape.
 *
 * Keys only drive story mode when nothing else owns them: a key pressed while a dialog is open,
 * inside a text field, select or menu, or already handled elsewhere is left alone. Without this,
 * Escape in the AI settings dialog closed story mode too (SM-03), and the arrow keys in the
 * API key field changed rounds behind the dialog.
 *
 * @param {number | (() => number)} totalRounds - Number of rounds, or a getter for it
 * @param {Function} onExit - Called when the player presses Escape
 * @returns {Object} Navigation state and control functions
 *
 * @example
 * const nav = useStoryNavigation(() => rounds.length, onExit);
 * nav.nextRound(); // direction becomes 1
 * nav.previousRound(); // direction becomes -1
 * nav.jumpToRound(5);
 */

/** Elements that use the arrow keys or Escape themselves */
const KEY_OWNERS =
	'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="menu"], [role="menuitem"], [role="dialog"], [aria-modal="true"]';

/**
 * Whether story mode should leave a key press alone.
 * @param {KeyboardEvent} event
 * @param {Document} [doc]
 * @returns {boolean}
 */
export function shouldIgnoreStoryKey(event, doc = globalThis.document) {
	if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true;
	if (event.target?.closest?.(KEY_OWNERS)) return true;
	// A dialog anywhere on the page (dialogs are portalled to <body>) owns the keyboard
	return !!doc?.querySelector?.('[aria-modal="true"]');
}

export function useStoryNavigation(totalRounds, onExit) {
	const getTotal = typeof totalRounds === 'function' ? totalRounds : () => totalRounds;

	let currentRoundIndex = $state(0);
	/** 1 when the last move went forward, -1 when it went back */
	let direction = $state(1);

	let canGoPrevious = $derived(currentRoundIndex > 0);
	let canGoNext = $derived(currentRoundIndex < getTotal() - 1);

	function goTo(index) {
		if (index === currentRoundIndex || index < 0 || index >= getTotal()) return;
		direction = index > currentRoundIndex ? 1 : -1;
		currentRoundIndex = index;
	}

	function previousRound() {
		goTo(currentRoundIndex - 1);
	}

	function nextRound() {
		goTo(currentRoundIndex + 1);
	}

	function handleKeyboard(event) {
		if (!['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) return;
		if (shouldIgnoreStoryKey(event)) return;
		if (event.key === 'ArrowLeft') previousRound();
		else if (event.key === 'ArrowRight') nextRound();
		else onExit();
	}

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
		get direction() {
			return direction;
		},
		get canGoPrevious() {
			return canGoPrevious;
		},
		get canGoNext() {
			return canGoNext;
		},
		previousRound,
		nextRound,
		jumpToRound: goTo
	};
}
