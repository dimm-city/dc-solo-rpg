/**
 * The animation standard: one token set, exported to CSS, with no second set in styles.css.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
	ANIMATION_DURATION,
	ANIMATION_EASING,
	animationCssVariables,
	animationTokensCss
} from './animations.js';

describe('animation tokens', () => {
	it('follow the standard: 120 state, 200 enter, 300 overlay, 400 beat, 1.5s max', () => {
		expect(ANIMATION_DURATION.STATE).toBe(120);
		expect(ANIMATION_DURATION.ENTER).toBe(200);
		expect(ANIMATION_DURATION.OVERLAY).toBe(300);
		expect(ANIMATION_DURATION.BEAT).toBe(400);
		expect(ANIMATION_DURATION.SEQUENCE_MAX).toBe(1500);
		expect([ANIMATION_DURATION.AMBIENT, ANIMATION_DURATION.AMBIENT_SLOW]).toEqual([4000, 8000]);
	});

	it('keep the older names, mapped onto the standard', () => {
		expect(ANIMATION_DURATION.FAST).toBe(ANIMATION_DURATION.STATE);
		expect(ANIMATION_DURATION.NORMAL).toBe(ANIMATION_DURATION.ENTER);
		expect(ANIMATION_DURATION.SLOW).toBe(ANIMATION_DURATION.OVERLAY);
		for (const key of [
			'CARD_DISMISS',
			'DICE_FADE',
			'DICE_DELAY',
			'STORY_MODE',
			'ROUND_TRANSITION'
		]) {
			expect(typeof ANIMATION_DURATION[key]).toBe('number');
		}
		for (const key of ['MECHANICAL', 'EASE_OUT', 'EASE_IN', 'LINEAR', 'CUBIC_OUT', 'QUINT_OUT']) {
			expect(typeof ANIMATION_EASING[key]).toBe('string');
		}
	});

	it('export the same numbers as CSS custom properties', () => {
		const vars = animationCssVariables();
		expect(vars['--dur-state']).toBe('120ms');
		expect(vars['--dur-enter']).toBe('200ms');
		expect(vars['--dur-overlay']).toBe('300ms');
		expect(vars['--dur-beat']).toBe('400ms');
		expect(vars['--rise-enter']).toBe('8px');
		// The older CSS names no longer disagree with JS ("fast" was 150ms in JS, 300ms in CSS)
		expect(vars['--transition-fast']).toMatch(/^120ms /);
		expect(vars['--transition-base']).toMatch(/^200ms /);
		expect(vars['--anim-fast']).toBe('200ms');

		const css = animationTokensCss();
		expect(css.startsWith(':root{')).toBe(true);
		for (const [name, value] of Object.entries(vars)) {
			expect(css).toContain(`${name}:${value}`);
		}
	});

	it('are not defined a second time in styles.css', () => {
		const styles = readFileSync('src/styles.css', 'utf8');
		for (const name of Object.keys(animationCssVariables())) {
			expect(styles).not.toMatch(new RegExp(`${name}\\s*:`));
		}
	});
});
