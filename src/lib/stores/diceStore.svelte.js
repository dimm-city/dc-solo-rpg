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

	if (isInitialized && diceBoxInstance) {
		// Already initialized, just update container and resize
		containerElement = container;
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 500);
		return diceBoxInstance;
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

	console.log('[diceStore] Initializing DiceBox with container:', container);
	// DiceBox expects a CSS selector string, not a DOM element
	diceBoxInstance = new DiceBox('#dice-roller-container', config);
	await diceBoxInstance.initialize();
	console.log('[diceStore] DiceBox initialized successfully');

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
