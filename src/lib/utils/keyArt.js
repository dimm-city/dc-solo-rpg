/**
 * Generated key art for a game card (owner decision 4: no external art).
 *
 * A duotone synthwave skyline in a 320x180 viewBox: a striped sun, a row of towers with a few
 * lit windows, and a perspective grid floor. Everything is derived from the game's slug, so
 * each game always gets the same picture and two games rarely look alike.
 */

/** On-palette duotones: sun and sky glow (a), grid and rim light (b) */
export const KEY_ART_PALETTES = [
	{ a: '#00ffff', b: '#d946ef' },
	{ a: '#d946ef', b: '#ffd700' },
	{ a: '#ffd700', b: '#00ffff' },
	{ a: '#d946ef', b: '#00ffff' },
	{ a: '#ffd700', b: '#d946ef' }
];

export const KEY_ART_WIDTH = 320;
export const KEY_ART_HEIGHT = 180;

/**
 * FNV-1a, 32-bit
 * @param {string} text
 * @returns {number}
 */
export function hashString(text) {
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

/**
 * mulberry32: a small, fast seeded PRNG returning [0, 1)
 * @param {number} seed
 * @returns {() => number}
 */
export function seededRandom(seed) {
	let t = seed >>> 0;
	return () => {
		t = (t + 0x6d2b79f5) >>> 0;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * @param {string} seedText Usually the game's slug
 */
export function generateKeyArt(seedText) {
	const rand = seededRandom(hashString(seedText || 'dream-console'));
	const between = (min, max) => min + rand() * (max - min);
	const W = KEY_ART_WIDTH;
	const H = KEY_ART_HEIGHT;

	const palette = KEY_ART_PALETTES[Math.floor(rand() * KEY_ART_PALETTES.length)];
	const horizon = Math.round(between(112, 128));

	const sun = {
		cx: round1(between(80, 240)),
		cy: round1(horizon - between(22, 46)),
		r: round1(between(30, 48))
	};

	// Gaps cut through the lower half of the sun, thicker toward the horizon
	const sunStripes = [];
	for (let i = 0; i < 5; i++) {
		const y = sun.cy + sun.r * (0.12 + i * 0.18);
		sunStripes.push({ y: round1(y), h: round1(1 + i * 0.9) });
	}

	const stars = Array.from({ length: 14 }, () => ({
		x: round1(between(4, W - 4)),
		y: round1(between(6, horizon - 50)),
		r: round1(between(0.4, 1.1))
	}));

	const buildings = [];
	for (let x = -4; x < W + 4; ) {
		const w = Math.round(between(10, 30));
		const h = Math.round(between(12, 68));
		buildings.push({ x, y: horizon - h, w, h });
		x += w + Math.round(between(0, 4));
	}

	const windows = [];
	for (const b of buildings) {
		for (let wy = b.y + 4; wy < horizon - 4; wy += 6) {
			for (let wx = b.x + 3; wx < b.x + b.w - 3; wx += 5) {
				if (rand() < 0.1) windows.push({ x: wx, y: wy });
			}
		}
	}

	// Floor: rows bunch toward the horizon; columns converge on a vanishing point under the sun
	const floorRows = Array.from({ length: 6 }, (_, i) => {
		const t = (i + 1) / 6;
		return round1(horizon + (H - horizon) * t * t);
	});
	const vanishX = sun.cx;
	const floorColumns = Array.from({ length: 15 }, (_, i) => {
		const k = i - 7;
		return { x1: round1(vanishX + k * 10), x2: round1(vanishX + k * 64) };
	});

	return { palette, horizon, sun, sunStripes, stars, buildings, windows, floorRows, floorColumns };
}
