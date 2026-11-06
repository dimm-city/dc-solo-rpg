import { describe, it, expect } from 'vitest';
import {
	generateKeyArt,
	hashString,
	seededRandom,
	KEY_ART_PALETTES,
	KEY_ART_WIDTH,
	KEY_ART_HEIGHT
} from './keyArt.js';

describe('generateKeyArt', () => {
	it('always draws the same picture for a game', () => {
		expect(generateKeyArt('future-lost')).toEqual(generateKeyArt('future-lost'));
	});

	it('draws different pictures for different games', () => {
		const a = generateKeyArt('future-lost');
		const b = generateKeyArt('ghost-in-the-machine');
		expect(a.sun).not.toEqual(b.sun);
		expect(a.buildings).not.toEqual(b.buildings);
	});

	it('stays on palette and inside the frame', () => {
		for (const slug of [
			'future-lost',
			'ghost-in-the-machine',
			'x',
			'',
			'a-very-long-custom-slug'
		]) {
			const art = generateKeyArt(slug);
			expect(KEY_ART_PALETTES).toContainEqual(art.palette);
			expect(art.horizon).toBeGreaterThan(KEY_ART_HEIGHT / 2);
			expect(art.horizon).toBeLessThan(KEY_ART_HEIGHT);
			expect(art.sun.cy + art.sun.r).toBeGreaterThan(art.horizon - 30);
			expect(art.sun.cx).toBeGreaterThan(0);
			expect(art.sun.cx).toBeLessThan(KEY_ART_WIDTH);

			// The skyline spans the full width and every tower stands on the horizon
			expect(art.buildings[0].x).toBeLessThanOrEqual(0);
			const last = art.buildings.at(-1);
			expect(last.x + last.w).toBeGreaterThanOrEqual(KEY_ART_WIDTH);
			for (const b of art.buildings) expect(b.y + b.h).toBe(art.horizon);

			// Few enough shapes to stay light in the DOM
			expect(art.windows.length).toBeLessThan(120);
		}
	});
});

describe('seeded helpers', () => {
	it('hashString is stable and spreads nearby strings', () => {
		expect(hashString('future-lost')).toBe(hashString('future-lost'));
		expect(hashString('a')).not.toBe(hashString('b'));
	});

	it('seededRandom repeats for a seed and stays in [0, 1)', () => {
		const r1 = seededRandom(42);
		const r2 = seededRandom(42);
		const seq = Array.from({ length: 50 }, () => r1());
		expect(seq).toEqual(Array.from({ length: 50 }, () => r2()));
		for (const n of seq) {
			expect(n).toBeGreaterThanOrEqual(0);
			expect(n).toBeLessThan(1);
		}
	});
});
