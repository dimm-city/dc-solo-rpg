/**
 * Fetch pictures ahead of use, so they are in the browser cache by the time they are shown.
 * Each URL is requested once per page. Without a DOM (tests, server rendering) it does nothing.
 */
const requested = new Set();

/** @param {Iterable<string>} srcs - Image URLs */
export function preloadImages(srcs) {
	if (typeof Image === 'undefined') return;
	for (const src of srcs ?? []) {
		if (!src || requested.has(src)) continue;
		requested.add(src);
		new Image().src = src;
	}
}
