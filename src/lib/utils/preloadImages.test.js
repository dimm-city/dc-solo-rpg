import { describe, it, expect, vi, afterEach } from 'vitest';
import { preloadImages } from './preloadImages.js';

describe('preloadImages', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('requests each picture once, skipping blanks and repeats', () => {
		const requested = [];
		vi.stubGlobal(
			'Image',
			class {
				set src(value) {
					requested.push(value);
				}
			}
		);
		preloadImages(['/a.jpg', '', '/b.jpg', '/a.jpg']);
		preloadImages(['/b.jpg', '/c.jpg']);
		expect(requested).toEqual(['/a.jpg', '/b.jpg', '/c.jpg']);
	});

	it('does nothing without a DOM', () => {
		vi.stubGlobal('Image', undefined);
		expect(() => preloadImages(['/x.jpg'])).not.toThrow();
	});
});
