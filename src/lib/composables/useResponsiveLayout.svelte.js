/**
 * useResponsiveLayout - Reactive composable for responsive layout detection
 *
 * Provides reactive state for:
 * - Desktop/mobile detection
 * - Window dimensions
 * - Preferred motion settings
 * - Breakpoint matching
 *
 * @example
 * ```javascript
 * import { useResponsiveLayout } from '$lib/composables/useResponsiveLayout.svelte.js';
 *
 * const layout = useResponsiveLayout();
 *
 * // Access reactive state
 * $: if (layout.isDesktop) {
 *   console.log('Desktop detected');
 * }
 * ```
 *
 * @component
 * @returns {Object} Reactive layout state
 */

import { onMount, onDestroy } from 'svelte';

export function useResponsiveLayout() {
	// Reactive state using Svelte 5 runes
	let isDesktop = $state(true);
	let isMobile = $state(false);
	let windowWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	let windowHeight = $state(typeof window !== 'undefined' ? window.innerHeight : 768);
	let prefersReducedMotion = $state(false);

	// Breakpoints
	const BREAKPOINTS = {
		mobile: 768,
		tablet: 1024,
		desktop: 1280
	};

	/**
	 * Update responsive state based on window size and media queries
	 */
	function updateLayout() {
		if (typeof window === 'undefined') return;

		// Update dimensions
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;

		// Desktop detection: hover capability + fine pointer (mouse/trackpad)
		const desktopQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
		isDesktop = desktopQuery.matches;
		isMobile = !isDesktop;

		// Accessibility: check for reduced motion preference
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery.matches;
	}

	// Initialize on mount
	onMount(() => {
		updateLayout();

		// Listen for resize events
		window.addEventListener('resize', updateLayout);

		// Listen for media query changes
		const desktopQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

		desktopQuery.addEventListener('change', updateLayout);
		motionQuery.addEventListener('change', updateLayout);

		// Cleanup
		return () => {
			window.removeEventListener('resize', updateLayout);
			desktopQuery.removeEventListener('change', updateLayout);
			motionQuery.removeEventListener('change', updateLayout);
		};
	});

	/**
	 * Check if current width matches a breakpoint
	 * @param {string} breakpoint - 'mobile' | 'tablet' | 'desktop'
	 * @returns {boolean}
	 */
	function matchesBreakpoint(breakpoint) {
		const width = BREAKPOINTS[breakpoint];
		if (!width) return false;

		if (breakpoint === 'mobile') {
			return windowWidth < width;
		} else if (breakpoint === 'tablet') {
			return windowWidth >= BREAKPOINTS.mobile && windowWidth < width;
		} else if (breakpoint === 'desktop') {
			return windowWidth >= width;
		}

		return false;
	}

	/**
	 * Get current breakpoint name
	 * @returns {'mobile' | 'tablet' | 'desktop'}
	 */
	function getCurrentBreakpoint() {
		if (windowWidth < BREAKPOINTS.mobile) return 'mobile';
		if (windowWidth < BREAKPOINTS.tablet) return 'tablet';
		return 'desktop';
	}

	// Return reactive state and helper functions
	return {
		// Reactive state (accessed via .isDesktop, .isMobile, etc.)
		get isDesktop() {
			return isDesktop;
		},
		get isMobile() {
			return isMobile;
		},
		get windowWidth() {
			return windowWidth;
		},
		get windowHeight() {
			return windowHeight;
		},
		get prefersReducedMotion() {
			return prefersReducedMotion;
		},

		// Helper functions
		matchesBreakpoint,
		getCurrentBreakpoint,

		// Breakpoint constants
		BREAKPOINTS
	};
}
