import DiceBox from '@3d-dice/dice-box-threejs';
import { gameState } from './gameStore.svelte.js';
import { randomInt } from '../services/random.js';
import { ANIMATION_DURATION } from '$lib/constants/animations.js';
import { logger } from '../utils/logger.js';

/**
 * Shared DiceBox instance for the entire application
 * This prevents multiple WebGL contexts and ensures consistent dice rendering
 * across all game screens (RollForTasks, SuccessCheck, FailureCheck)
 */

let diceBoxInstance = $state(null);
let isInitialized = $state(false);
let containerElement = $state(null);

/**
 * Dice rolling state - wrapped in object to allow export
 * Svelte 5 requires exported state to be objects (not reassigned primitives)
 */
let diceState = $state({
	/** Dice are on the table (the container is shown) */
	isRolling: false,
	/** The last completed roll ({ rolls, finalValue, isLucid, isSurreal }) so the HUD can show which die counted */
	lastRoll: null,
	/** Reduced motion (or no 3D dice): the roll shown as numbers in a d20 outline, { rolls, kept } */
	staticRoll: null
});

/** How long every die must stay at rest before the roll resolves */
export const SETTLE_HOLD_MS = 150;
/** Reduced motion: how long the number is shown before the result line */
export const STATIC_ROLL_MS = 600;

/** The roll in flight: skip() jumps it to its result */
let activeRoll = null;
/** Counts rolls, so a finished roll's fade-out never hides the next roll's dice */
let rollCount = 0;

/**
 * Export diceState for reactive access in components
 */
export { diceState };

/**
 * Initialize the DiceBox instance
 * Should be called once when the game starts
 */
export async function initializeDiceBox(container) {
	if (!container) {
		logger.warn('[diceStore] No container provided to initializeDiceBox');
		return null;
	}

	// Check if we need to reinitialize
	const hasCanvas = container.querySelector('canvas') !== null;
	const containerChanged = containerElement !== container;

	if (isInitialized && diceBoxInstance && !containerChanged && hasCanvas) {
		// Already initialized with same container and canvas exists, just resize
		logger.debug('[diceStore] DiceBox already initialized, triggering resize');
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 500);
		return diceBoxInstance;
	}

	// If there's an old canvas and we're reinitializing, clear it
	// But only if we're actually reinitializing (not first time)
	if (isInitialized || hasCanvas) {
		logger.debug('[diceStore] Clearing stale canvas elements');
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
		strength: 1.5,
		theme_colorset: 'pinkdreams' // Default theme is pink dreams
	};

	// Apply dice theme from game config if provided
	if (gameState.config?.options?.dice?.key) {
		// If key is 'default', use white dice
		if (gameState.config.options.dice.key === 'default') {
			delete config.theme_colorset; // Use dice-box built-in default (white)
		} else {
			config.theme_colorset = gameState.config.options.dice.key;
		}
	} else if (gameState.config?.options?.dice) {
		config.theme_customColorset = gameState.config.options.dice;
		delete config.theme_colorset; // Custom colorset overrides theme
	}

	// Verify the container is properly attached to the DOM
	if (!document.body.contains(container)) {
		logger.error('[diceStore] Container is not attached to DOM');
		return null;
	}

	// Verify we can query the selector
	const queriedContainer = document.querySelector('#dice-roller-container');
	if (!queriedContainer) {
		logger.error('[diceStore] Cannot find #dice-roller-container in DOM');
		return null;
	}

	if (queriedContainer !== container) {
		logger.warn('[diceStore] Queried container does not match provided container');
	}

	logger.debug('[diceStore] Initializing DiceBox with container:', container);
	logger.debug('[diceStore] Container dimensions:', {
		width: container.clientWidth,
		height: container.clientHeight,
		offsetWidth: container.offsetWidth,
		offsetHeight: container.offsetHeight
	});

	try {
		// DiceBox expects a CSS selector string, not a DOM element
		diceBoxInstance = new DiceBox('#dice-roller-container', config);
		await diceBoxInstance.initialize();
		logger.debug('[diceStore] DiceBox initialized successfully');
		isInitialized = true;

		// Call resizeWorld initially
		diceBoxInstance.resizeWorld();

		// Trigger a window resize event after transition completes (300ms + buffer)
		// This ensures the DiceBox's resize listener picks up the correct container dimensions
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		}, 500);

		return diceBoxInstance;
	} catch (error) {
		logger.error('[diceStore] Failed to initialize DiceBox:', error);
		logger.warn('[diceStore] Game will continue without 3D dice animations');
		diceBoxInstance = null;
		isInitialized = false;
		// Don't re-throw - allow game to continue without 3D dice
		return null;
	}
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
	logger.debug('[diceStore] Resetting DiceBox');

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
 * The values of every die in a dice-box result. dice-box-threejs returns them per set:
 * `{ notation, sets: [{ num, type, rolls: [{ value, ... }], total }], modifier, total }`.
 * @param {object} result - What `diceBox.roll()` resolves with
 * @returns {number[]}
 */
export function readDiceValues(result) {
	if (!Array.isArray(result?.sets)) return [];
	return result.sets
		.flatMap((set) => (set.rolls ?? []).map((die) => die.value))
		.filter((value) => Number.isFinite(value));
}

/** The die that counts: the higher when Lucid, the lower when Surreal */
function keptValue(rolls, { isLucid, isSurreal }) {
	if (rolls.length === 2 && isLucid) return Math.max(...rolls);
	if (rolls.length === 2 && isSurreal) return Math.min(...rolls);
	return rolls[0];
}

/**
 * The faces to force: the dice the game already rolled, or, for a bare value, a second die
 * that keeps the value the kept one.
 */
function presetDice(value, { isLucid, isSurreal, dice }) {
	if (Array.isArray(dice) && dice.length === (isLucid || isSurreal ? 2 : 1)) return dice;
	if (!value) return null;
	if (isLucid) return [value, randomInt(1, value)];
	if (isSurreal) return [value, randomInt(value, 20)];
	return [value];
}

function prefersReducedMotion() {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
	);
}

/** Every die has stopped (cannon's SLEEPY or SLEEPING: below its speed limit) */
function diceAtRest(box) {
	const dice = box.diceList ?? [];
	return dice.length > 0 && dice.every((die) => die.body && die.body.sleepState >= 1);
}

/**
 * Jump a throw to its end: step the physics until every die has landed (as dice-box itself
 * does, silently), then draw that frame. The faces are the forced ones, so nothing changes
 * but the time. dice-box's own next frame then finishes the roll.
 */
function fastForward(box) {
	const animstate = box.animstate;
	box.animstate = 'simulate'; // dice-box plays no collision sounds while simulating
	try {
		const limit = (box.iterationLimit ?? 1000) + 1;
		while (!box.throwFinished() && box.iteration <= limit) {
			box.world.step(box.framerate);
			box.iteration += 1;
		}
		for (const die of box.diceList) {
			if (!die.body) continue;
			die.position.copy(die.body.position);
			die.quaternion.copy(die.body.quaternion);
		}
		box.renderer?.render(box.scene, box.camera);
	} finally {
		box.animstate = animstate;
	}
}

/**
 * Throw the 3D dice. Resolves as soon as every die has been at rest for SETTLE_HOLD_MS
 * (dice-box waits another 0.9s before it calls a die asleep), when dice-box finishes, or
 * when the player skips. Resolves with the dice-box result, or null if it was not awaited.
 */
function throwDice(box, notation) {
	return new Promise((resolve) => {
		let done = false;
		let frame = 0;
		let restSince = null;

		const finish = (result = null) => {
			if (done) return;
			done = true;
			cancelAnimationFrame(frame);
			activeRoll = null;
			resolve(result);
		};

		activeRoll = {
			skip() {
				try {
					fastForward(box);
				} catch (error) {
					logger.warn('[diceStore] Could not fast-forward the dice, clearing them:', error);
					box.clearDice?.();
				}
				finish();
			}
		};

		const watch = () => {
			if (done) return;
			const now = performance.now();
			if (diceAtRest(box)) {
				restSince ??= now;
				if (now - restSince >= SETTLE_HOLD_MS) return finish();
			} else {
				restSince = null;
			}
			frame = requestAnimationFrame(watch);
		};
		frame = requestAnimationFrame(watch);

		Promise.resolve(box.roll(notation)).then(finish, (error) => {
			logger.warn('[diceStore] Dice roll failed:', error);
			finish();
		});
	});
}

/** Reduced motion (or no 3D dice): show the number for STATIC_ROLL_MS, opacity only */
function showStaticRoll(rolls, kept) {
	diceState.staticRoll = { rolls, kept };
	return new Promise((resolve) => {
		const timer = setTimeout(done, STATIC_ROLL_MS);
		function done() {
			clearTimeout(timer);
			activeRoll = null;
			resolve();
		}
		activeRoll = { skip: done };
	});
}

/**
 * A tap or Space during a roll: jump to the result (the dice snap to their faces).
 * @returns {boolean} true if a roll was in flight
 */
export function skipRoll() {
	if (!activeRoll) return false;
	activeRoll.skip();
	return true;
}

/** A roll is in flight (it can be skipped) */
export function isRollInFlight() {
	return activeRoll !== null;
}

/**
 * Roll the dice with optional preset value
 * D20 system with Lucid/Surreal support
 * @param {number|null} value - The kept d20 value (1-20) the game already rolled
 * @param {Object} options - Roll options
 * @param {boolean} options.isLucid - Roll with advantage (2d20 keep high)
 * @param {boolean} options.isSurreal - Roll with disadvantage (2d20 keep low)
 * @param {number[]} [options.dice] - Every die the game rolled, to show those exact faces
 * @returns {Promise<Object>} Object with { total, rolls, finalValue } where finalValue is the kept die
 */
export async function rollDice(value = null, options = {}) {
	const { isLucid = false, isSurreal = false } = options;
	const count = isLucid || isSurreal ? 2 : 1;
	const preset = presetDice(value, { ...options, isLucid, isSurreal });
	const reduced = prefersReducedMotion() || !diceBoxInstance;

	// Clear any dice left from the previous roll before throwing again
	try {
		diceBoxInstance?.clearDice?.();
	} catch (error) {
		logger.warn('[diceStore] Could not clear previous dice:', error);
	}
	diceState.staticRoll = null;

	// Set rolling state to true immediately
	diceState.isRolling = true;
	const thisRoll = ++rollCount;

	let rolls;
	if (reduced) {
		rolls = preset ?? Array.from({ length: count }, () => randomInt(1, 20));
		await showStaticRoll(rolls, keptValue(rolls, { isLucid, isSurreal }));
	} else {
		const notation = preset ? `${count}d20@${preset.join(',')}` : `${count}d20`;
		const result = await throwDice(diceBoxInstance, notation);
		const read = readDiceValues(result);
		rolls = read.length === count ? read : (preset ?? read);
	}

	const finalValue = keptValue(rolls, { isLucid, isSurreal });

	// Settled dice stay up a moment as evidence, then fade (no hold for the static number)
	setTimeout(
		() => {
			if (thisRoll !== rollCount) return;
			diceState.isRolling = false;
			diceState.staticRoll = null;
		},
		reduced ? 0 : ANIMATION_DURATION.DICE_DELAY
	);

	diceState.lastRoll = { rolls, finalValue, isLucid, isSurreal };

	return {
		total: rolls.reduce((sum, die) => sum + die, 0),
		rolls,
		finalValue,
		isLucid,
		isSurreal
	};
}

/**
 * Update the dice theme and reinitialize DiceBox
 * @param {Object} theme - The new theme object with key, name, category, description
 */
export async function updateDiceTheme(theme) {
	if (!theme || !theme.key) {
		logger.warn('[diceStore] Invalid theme provided to updateDiceTheme');
		return;
	}

	logger.debug('[diceStore] Updating dice theme to:', theme.key);

	// Update gameState config
	if (gameState.config) {
		gameState.config.options = {
			...gameState.config.options,
			dice: theme
		};
	}

	// If DiceBox is initialized, we need to reinitialize it with the new theme
	if (diceBoxInstance && containerElement) {
		const savedContainer = containerElement;

		logger.debug('[diceStore] Cleaning up DiceBox for theme change');

		// Call DiceBox's clear method to properly dispose of resources
		try {
			if (typeof diceBoxInstance.clear === 'function') {
				diceBoxInstance.clear();
			}
		} catch (error) {
			logger.warn('[diceStore] Error calling diceBox.clear():', error);
		}

		// Clear the container manually (don't use resetDiceBox to keep state intact)
		logger.debug('[diceStore] Clearing container DOM');
		while (savedContainer.firstChild) {
			savedContainer.removeChild(savedContainer.firstChild);
		}

		// Wait for DOM cleanup and WebGL context release
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Reset instance references but keep containerElement
		diceBoxInstance = null;
		isInitialized = false;

		// Reinitialize with new theme
		await initializeDiceBox(savedContainer);

		logger.debug('[diceStore] Dice theme updated successfully');
	}
}
