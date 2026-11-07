import { describe, it, expect } from 'vitest';
import {
	MOTE_LIFE,
	MOTE_MAX_ALPHA,
	createMote,
	stepMote,
	moteAlpha,
	shouldAnimate
} from './ambientMotes.js';
import { ANIMATION_DURATION } from '../constants/animations.js';

describe('ambient motes', () => {
	it('live one slow ambient cycle (8s)', () => {
		expect(MOTE_LIFE).toBe(ANIMATION_DURATION.AMBIENT_SLOW);
		const mote = { ...createMote(100, 100, () => 0.5), age: 0 };
		expect(stepMote(mote, MOTE_LIFE - 1, 100, 100)).toBe(true);
		expect(stepMote(mote, 1, 100, 100)).toBe(false);
	});

	it('drift slowly and wrap at the edges', () => {
		const mote = { x: 99, y: 1, vx: 8, vy: -8, size: 1, hue: 0, age: 0 };
		stepMote(mote, 1000, 100, 100);
		expect(mote.x).toBeCloseTo(7);
		expect(mote.y).toBeCloseTo(93);
	});

	it('fade in and out over their life, never above the maximum', () => {
		expect(moteAlpha({ age: 0 })).toBeCloseTo(0);
		expect(moteAlpha({ age: MOTE_LIFE / 2 })).toBeCloseTo(MOTE_MAX_ALPHA);
		expect(moteAlpha({ age: MOTE_LIFE })).toBeCloseTo(0);
		expect(moteAlpha({ age: MOTE_LIFE * 3 })).toBeCloseTo(0);
	});

	it('start part-way through a cycle so a new field does not fade in at once', () => {
		const ages = [0.1, 0.9].map((r) => createMote(10, 10, () => r).age);
		expect(ages[0]).toBeLessThan(ages[1]);
	});
});

describe('shouldAnimate', () => {
	it('runs only when visible, uncovered and motion is allowed', () => {
		expect(shouldAnimate({ hidden: false, reducedMotion: false, covered: false })).toBe(true);
		expect(shouldAnimate({ hidden: true, reducedMotion: false, covered: false })).toBe(false);
		expect(shouldAnimate({ hidden: false, reducedMotion: true, covered: false })).toBe(false);
		expect(shouldAnimate({ hidden: false, reducedMotion: false, covered: true })).toBe(false);
	});
});
