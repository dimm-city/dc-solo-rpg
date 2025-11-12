import { onMount } from 'svelte';
import DiceBox from '@3d-dice/dice-box-threejs';
import { gameState } from './gameStore.svelte.js';

/**
 * Shared DiceBox instance for the entire application
 * This prevents multiple WebGL contexts and ensures consistent dice rendering
 * across all game screens (RollForTasks, SuccessCheck, FailureCheck)
 */

let diceBoxInstance = $state(null);
let isInitialized = $state(false);
let containerElement = $state(null);

/**
 * Initialize the DiceBox instance
 * Should be called once when the game starts
 */
export async function initializeDiceBox(container) {
	if (!container) {
		console.warn('[diceStore] No container provided to initializeDiceBox');
		return null;
	}

	// Check if we need to reinitialize
	const hasCanvas = container.querySelector('canvas') !== null;
	const containerChanged = containerElement !== container;

	if (isInitialized && diceBoxInstance && !containerChanged && hasCanvas) {
		// Already initialized with same container and canvas exists, just resize
		console.log('[diceStore] DiceBox already initialized, triggering resize');
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 500);
		return diceBoxInstance;
	}

	// If there's an old canvas and we're reinitializing, clear it
	// But only if we're actually reinitializing (not first time)
	if (isInitialized || hasCanvas) {
		console.log('[diceStore] Clearing stale canvas elements');
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
		// Wait for DOM to update after clearing
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	containerElement = container;

	const config = {
		assetPath: '/dice/',
		sounds: true,
		volume: 100,
		baseScale: 100,
		strength: 1.5
	};

	// Apply dice theme from game config if provided
	if (gameState.config?.options?.dice?.key) {
		// If key is 'default', don't set a theme (let dice-box use its built-in default)
		if (gameState.config.options.dice.key !== 'default') {
			config.theme_colorset = gameState.config.options.dice.key;
		}
	} else if (gameState.config?.options?.dice) {
		config.theme_customColorset = gameState.config.options.dice;
	}

	// Verify the container is properly attached to the DOM
	if (!document.body.contains(container)) {
		console.error('[diceStore] Container is not attached to DOM');
		return null;
	}

	// Verify we can query the selector
	const queriedContainer = document.querySelector('#dice-roller-container');
	if (!queriedContainer) {
		console.error('[diceStore] Cannot find #dice-roller-container in DOM');
		return null;
	}

	if (queriedContainer !== container) {
		console.warn('[diceStore] Queried container does not match provided container');
	}

	console.log('[diceStore] Initializing DiceBox with container:', container);
	console.log('[diceStore] Container dimensions:', {
		width: container.clientWidth,
		height: container.clientHeight,
		offsetWidth: container.offsetWidth,
		offsetHeight: container.offsetHeight
	});

	try {
		// DiceBox expects a CSS selector string, not a DOM element
		diceBoxInstance = new DiceBox('#dice-roller-container', config);
		await diceBoxInstance.initialize();
		console.log('[diceStore] DiceBox initialized successfully');
	} catch (error) {
		console.error('[diceStore] Failed to initialize DiceBox:', error);
		diceBoxInstance = null;
		isInitialized = false;
		throw error;
	}

	// Call resizeWorld initially
	diceBoxInstance.resizeWorld();

	// Trigger a window resize event after transition completes (300ms + buffer)
	// This ensures the DiceBox's resize listener picks up the correct container dimensions
	setTimeout(() => {
		window.dispatchEvent(new Event('resize'));
	}, 500);

	isInitialized = true;

	return diceBoxInstance;
}

/**
 * Get the current DiceBox instance
 */
export function getDiceBox() {
	return diceBoxInstance;
}

/**
 * Check if DiceBox is initialized
 */
export function isDiceBoxInitialized() {
	return isInitialized && diceBoxInstance !== null;
}

/**
 * Trigger a resize of the DiceBox
 * Call this when the container size changes or after screen transitions
 */
export function resizeDiceBox() {
	if (diceBoxInstance && containerElement) {
		// Trigger window resize event to let DiceBox handle it
		window.dispatchEvent(new Event('resize'));
	}
}

/**
 * Reset the DiceBox instance
 * Call this when exiting a game to ensure clean reinitialization
 */
export function resetDiceBox() {
	console.log('[diceStore] Resetting DiceBox');

	// Clear any existing canvas from the container
	if (containerElement) {
		while (containerElement.firstChild) {
			containerElement.removeChild(containerElement.firstChild);
		}
	}

	// Reset the references - DiceBox will be recreated on next init
	diceBoxInstance = null;
	isInitialized = false;
	containerElement = null;
}

/**
 * Roll the dice with optional preset value
 * @param {number|null} value - Optional preset dice value (1-6)
 * @returns {Promise<number>} The dice roll result
 */
export async function rollDice(value = null) {
	if (!diceBoxInstance) {
		throw new Error('DiceBox not initialized. Call initializeDiceBox first.');
	}

	const rollString = value ? `1d6@${value}` : '1d6';
	const result = await diceBoxInstance.roll(rollString);

	return result.total;
}
