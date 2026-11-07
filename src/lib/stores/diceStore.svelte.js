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
/** Re-measures the dice whenever their container changes size (see syncDiceBoxSize) */
let sizeObserver = null;

/**
 * Dice rolling state - wrapped in object to allow export
 * Svelte 5 requires exported state to be objects (not reassigned primitives)
 */
let diceState = $state({
	/** Dice are up, on top of everything. When it turns false they sink beneath the board. */
	isRolling: false,
	/** The last completed roll ({ rolls, finalValue, isLucid, isSurreal }) so the HUD can show which die counted */
	lastRoll: null,
	/** Reduced motion (or no 3D dice): the roll shown as numbers in a d20 outline, { rolls, kept } */
	staticRoll: null,
	/** Where the landed dice are on screen ("x y" in px), so they shrink in place as they sink */
	sinkOrigin: null
});

/** How long every die must stay at rest before the throw counts as landed */
export const SETTLE_HOLD_MS = 150;
/**
 * Landed dice stay on top this much longer, so they rest for one beat in all, before they
 * sink beneath the board and the result appears. A tap ends the hold.
 */
export const DICE_HOLD_MS = ANIMATION_DURATION.BEAT - SETTLE_HOLD_MS;
/** Reduced motion: how long the number is shown before the result line */
export const STATIC_ROLL_MS = 600;

/** dice-box stands its walls this far out from the centre, as a fraction of the half-size */
const WALL = 0.93;
/** A die starts at least this far (world units; 1 unit = half a CSS px) inside the walls */
export const SPAWN_MARGIN = 8;
/** The throw's target is at least this many times the shorter half-size out from the centre */
export const MIN_THROW = 1.5;
/** A throw whose dice covered less than this fraction of the table, each way, is logged */
export const SHORT_THROW = 0.2;

/** The roll in flight: skip() jumps it to its result */
let activeRoll = null;
/** Counts rolls, so a finished roll never sinks the next roll's dice */
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

		if (!installThrow(diceBoxInstance)) {
			logger.warn('[diceStore] Could not take over the throw; dice-box throws its own way');
		}
		syncDiceBoxSize('start');
		sizeObserver?.disconnect();
		if (typeof ResizeObserver !== 'undefined') {
			sizeObserver = new ResizeObserver(() => syncDiceBoxSize('resize'));
			sizeObserver.observe(container);
		}

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
 * Size the dice to their container.
 *
 * dice-box measures its container once, when it is created, and afterwards only on a window
 * resize event. If the container measured differently at that moment, the throw area (canvas,
 * physics walls and camera) no longer matched the screen, and dice rolled in a corner until the
 * window was resized. So the dice are re-measured whenever the container changes size and again
 * before every throw, checking both the canvas and dice-box's own world size. A correction is
 * logged, with the sizes, so a device where it happens can be diagnosed.
 *
 * @param {string} reason - what triggered the check, for the log
 */
function syncDiceBoxSize(reason) {
	const canvas = diceBoxInstance?.renderer?.domElement;
	const width = containerElement?.clientWidth;
	const height = containerElement?.clientHeight;
	if (!canvas || !width || !height) return;
	const world = diceBoxInstance.display;
	const worldStale =
		world !== undefined && (world.containerWidth !== width || world.containerHeight !== height);
	if (canvas.width === width && canvas.height === height && !worldStale) return;
	logger.warn(
		`[diceStore] Dice resized on ${reason}: canvas ${canvas.width}x${canvas.height}, world ` +
			`${world?.containerWidth}x${world?.containerHeight}, container ${width}x${height}`
	);
	diceBoxInstance.setDimensions({ x: width, y: height });
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

	sizeObserver?.disconnect();
	sizeObserver = null;

	// Reset the references - DiceBox will be recreated on next init
	diceBoxInstance = null;
	isInitialized = false;
	containerElement = null;
}

/** The last throw made by throwVectors, for the short-throw diagnostic */
let lastThrow = null;

/** A d20's bounding sphere radius: its geometry's if one has been made, else baseScale (the d20 scale is 1) */
function dieRadius(box) {
	const made = box.DiceFactory?.geometries?.d20?.cannon_shape?.boundingSphereRadius;
	return Number.isFinite(made) ? made : (box.baseScale ?? 100);
}

/**
 * The throw: where each die starts and how it is thrown, as dice-box's own getNotationVectors
 * makes them, but from a target that is never too close and with every start clear of the walls.
 *
 * dice-box-threejs 0.0.12 starts each die inside its own walls, twice over:
 * - getNotationVectors (dist/dice-box-threejs.es.js:16896) starts a die 0.9 of the half-size out
 *   from the centre, and makeWorldBox (:16799) stands the walls at 0.93. That 3% gap is 12
 *   world units on a 400px-wide phone, while a d20's bounding sphere is 100 units (baseScale).
 * - Its spin axis is { x, y, z: Math.random() } (:16913), not a unit vector, and spawnDice
 *   (:17013) hands it to setFromAxisAngle as it is. The body's quaternion is then not a unit
 *   quaternion until cannon normalises it after the first step, and rotating the collision
 *   shape by it scales the shape by |q|², up to 3x. For that first step the die is up to 300
 *   units across.
 * So the die's first physics step finds it deep in a wall (two at a corner). Cannon pushes it
 * out, and the contact's friction swallows the throw: the die drops where it started and rolls
 * only in that corner (one throw in ten on a phone, measured; at a corner the whole throw can
 * stay within a 60x150px patch). The library's target is also the old click position,
 * (random * 2 - 0.5) of each half-size, so a target near the centre means a throw with almost
 * no speed.
 *
 * Replaces startClickThrow (:17108), which roll() and add() call. The target keeps the library's
 * bias (most throws come in from the top left) but is at least MIN_THROW of the shorter
 * half-size out; every start is clamped inside the walls by the die's radius plus a margin; and
 * every spin axis is a unit vector, so the die is its own size from its first step.
 *
 * @param {object} box - the DiceBox
 * @param {string} notation - e.g. "2d20@19,5"
 * @returns {object} the notation vectors dice-box throws from
 */
export function throwVectors(box, notation) {
	const { currentWidth: hw, currentHeight: hh, containerWidth, containerHeight } = box.display;
	let target = { x: (Math.random() * 2 - 0.5) * hw, y: -(Math.random() * 2 - 0.5) * hh };
	const least = MIN_THROW * Math.min(hw, hh);
	const length = Math.hypot(target.x, target.y);
	if (length < least) {
		const angle = length ? Math.atan2(target.y, target.x) : Math.random() * 2 * Math.PI;
		target = { x: Math.cos(angle) * least, y: Math.sin(angle) * least };
	}
	const distance = Math.hypot(target.x, target.y) + 100;
	const magnitude = (Math.random() + 3) * distance * box.strength;
	const vectors = box.getNotationVectors(notation, target, magnitude, distance);
	const inset = dieRadius(box) + SPAWN_MARGIN;
	const maxX = containerWidth * WALL - inset;
	const maxY = containerHeight * WALL - inset;
	for (const vector of vectors?.vectors ?? []) {
		vector.pos.x = Math.max(-maxX, Math.min(maxX, vector.pos.x));
		vector.pos.y = Math.max(-maxY, Math.min(maxY, vector.pos.y));
		const axis = vector.axis;
		if (!axis) continue;
		const size = Math.hypot(axis.x, axis.y, axis.z);
		if (size > 0) {
			axis.x /= size;
			axis.y /= size;
			axis.z /= size;
		} else {
			axis.z = 1;
		}
	}
	lastThrow = {
		target: [Math.round(target.x), Math.round(target.y)],
		speed: Math.round(magnitude),
		starts: (vectors?.vectors ?? []).map((v) => [Math.round(v.pos.x), Math.round(v.pos.y)])
	};
	return vectors;
}

/**
 * Make the box throw with throwVectors. Returns false (and leaves the box alone) if it is not
 * a dice-box with getNotationVectors and a display, so a changed library falls back to its own.
 */
export function installThrow(box) {
	if (typeof box?.getNotationVectors !== 'function' || !box.display) return false;
	box.startClickThrow = function (notation) {
		if (this.rolling) {
			this.clearDice();
			this.rolling = false;
		}
		return throwVectors(this, notation);
	};
	return true;
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
 * The middle of the landed dice on screen, as a CSS transform-origin ("120px 480px"), or null.
 * Each die's position is projected through dice-box's camera onto its canvas.
 */
export function diceScreenCentre(box) {
	try {
		const dice = (box?.diceList ?? []).filter((die) => die.position?.clone);
		const canvas = box?.renderer?.domElement;
		if (!dice.length || !box.camera || !canvas?.clientWidth) return null;
		let x = 0;
		let y = 0;
		for (const die of dice) {
			const p = die.position.clone().project(box.camera);
			x += ((p.x + 1) / 2) * canvas.clientWidth;
			y += ((1 - p.y) / 2) * canvas.clientHeight;
		}
		return `${Math.round(x / dice.length)}px ${Math.round(y / dice.length)}px`;
	} catch {
		return null;
	}
}

/**
 * Log a throw whose dice covered less than SHORT_THROW of the table each way (the owner's
 * "rolled only in the top-left corner"), with the throw that did it, so it can be diagnosed.
 * @param {object} box - the DiceBox
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} path - world units
 */
export function reportShortThrow(box, path) {
	const table = box?.display;
	if (!table?.containerWidth || !Number.isFinite(path.minX)) return;
	const width = (path.maxX - path.minX) / (2 * table.containerWidth);
	const height = (path.maxY - path.minY) / (2 * table.containerHeight);
	if (width >= SHORT_THROW || height >= SHORT_THROW) return;
	logger.warn(
		`[diceStore] Short throw: the dice covered ${Math.round(width * 100)}% x ` +
			`${Math.round(height * 100)}% of the table (from x ${Math.round(path.minX)}..` +
			`${Math.round(path.maxX)}, y ${Math.round(path.minY)}..${Math.round(path.maxY)} of ` +
			`±${table.containerWidth} x ±${table.containerHeight}); throw ${JSON.stringify(lastThrow)}`
	);
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
		const path = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

		const finish = (result = null) => {
			if (done) return;
			done = true;
			cancelAnimationFrame(frame);
			activeRoll = null;
			reportShortThrow(box, path);
			resolve(result);
		};

		/** Where the dice have been, so a throw that stayed in one corner can be reported */
		const track = () => {
			for (const die of box.diceList ?? []) {
				const p = die.body?.position;
				if (!p) continue;
				if (p.x < path.minX) path.minX = p.x;
				if (p.x > path.maxX) path.maxX = p.x;
				if (p.y < path.minY) path.minY = p.y;
				if (p.y > path.maxY) path.maxY = p.y;
			}
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
			track();
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

/** Wait `ms`; a tap (skipRoll) ends the wait at once */
function hold(ms) {
	return new Promise((resolve) => {
		const timer = setTimeout(done, ms);
		const handle = { skip: done };
		function done() {
			clearTimeout(timer);
			if (activeRoll === handle) activeRoll = null;
			resolve();
		}
		activeRoll = handle;
	});
}

/** Reduced motion (or no 3D dice): show the number for STATIC_ROLL_MS, opacity only */
function showStaticRoll(rolls, kept) {
	diceState.staticRoll = { rolls, kept };
	return hold(STATIC_ROLL_MS);
}

/**
 * A tap or Space during a roll: jump to the result. Mid-throw the dice snap to their faces;
 * while they rest on top, they sink at once.
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
 *
 * The staging (with +layout.svelte): the dice are thrown on top of everything, header and
 * HUD included. Once they have rested for one beat (SETTLE_HOLD_MS + DICE_HOLD_MS) they sink
 * beneath the board, and the roll resolves in that same moment, so the result line and the
 * HUD's numbers appear in front of the sinking dice and are never covered.
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
	if (!reduced) syncDiceBoxSize('throw');
	if (reduced) {
		rolls = preset ?? Array.from({ length: count }, () => randomInt(1, 20));
		await showStaticRoll(rolls, keptValue(rolls, { isLucid, isSurreal }));
	} else {
		const notation = preset ? `${count}d20@${preset.join(',')}` : `${count}d20`;
		const result = await throwDice(diceBoxInstance, notation);
		const read = readDiceValues(result);
		rolls = read.length === count ? read : (preset ?? read);
		// The landed dice rest on top for the rest of the beat, as evidence
		await hold(DICE_HOLD_MS);
		diceState.sinkOrigin = diceScreenCentre(diceBoxInstance);
	}

	const finalValue = keptValue(rolls, { isLucid, isSurreal });

	// Now they sink beneath the board (the static number fades) as the result appears
	if (thisRoll === rollCount) {
		diceState.isRolling = false;
		diceState.staticRoll = null;
	}

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
