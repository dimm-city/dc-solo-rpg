import { describe, it, expect } from 'vitest';
import { menuPlacement } from './menuPlacement.js';

describe('menuPlacement (OWN-3): the ⋯ menu opens on the side of its button with more room', () => {
	const viewport = { innerWidth: 390, innerHeight: 844 };

	it('opens downward from the header at the top, right edges aligned, 6px below', () => {
		const rect = { top: 8, bottom: 52, right: 374 };
		expect(menuPlacement(rect, viewport)).toEqual({ top: 58, bottom: undefined, right: 16 });
	});

	it('opens upward from the toolbar docked at the bottom of a phone, 6px above', () => {
		const rect = { top: 790, bottom: 834, right: 374 };
		expect(menuPlacement(rect, viewport)).toEqual({ top: undefined, bottom: 60, right: 16 });
	});
});
