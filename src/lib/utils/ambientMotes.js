/**
 * Ambient motes for the neural background: pure helpers, so the canvas loop stays tiny.
 *
 * Each mote drifts slowly and lives one slow ambient cycle (8s), fading in and out, so the
 * background breathes at the standard's ambient pace instead of flickering.
 */
import { ANIMATION_DURATION } from '../constants/animations.js';

/** One mote's life: the slow ambient period */
export const MOTE_LIFE = ANIMATION_DURATION.AMBIENT_SLOW;

/** Drift speed in px per second (each axis) */
const DRIFT = 8;

/** Brightest a mote gets */
export const MOTE_MAX_ALPHA = 0.5;

/**
 * A new mote somewhere in a w x h field. `age` starts the field part-way through a cycle,
 * so a fresh field does not fade in all at once.
 * @param {number} w
 * @param {number} h
 * @param {() => number} [random]
 */
export function createMote(w, h, random = Math.random) {
	return {
		x: random() * w,
		y: random() * h,
		vx: (random() - 0.5) * 2 * DRIFT,
		vy: (random() - 0.5) * 2 * DRIFT,
		size: 1 + random() * 1.5,
		hue: random() < 0.5 ? 0 : 1,
		age: random() * MOTE_LIFE
	};
}

/**
 * Advance a mote by dt milliseconds, wrapping at the edges. Returns false once its life is
 * over (the caller replaces it).
 * @param {ReturnType<typeof createMote>} mote
 * @param {number} dt
 * @param {number} w
 * @param {number} h
 */
export function stepMote(mote, dt, w, h) {
	mote.age += dt;
	mote.x = (((mote.x + (mote.vx * dt) / 1000) % w) + w) % w;
	mote.y = (((mote.y + (mote.vy * dt) / 1000) % h) + h) % h;
	return mote.age < MOTE_LIFE;
}

/**
 * Opacity over a mote's life: rises and falls on a sine, 0 at birth and death.
 * @param {{age:number}} mote
 */
export function moteAlpha(mote) {
	const t = Math.min(1, Math.max(0, mote.age / MOTE_LIFE));
	return Math.sin(Math.PI * t) * MOTE_MAX_ALPHA;
}

/**
 * The ambient loop runs only when someone can see it, and never under reduced motion.
 * @param {{hidden:boolean, reducedMotion:boolean, covered:boolean}} state
 */
export function shouldAnimate({ hidden, reducedMotion, covered }) {
	return !hidden && !reducedMotion && !covered;
}
