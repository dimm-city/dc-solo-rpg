/**
 * Global test setup for Vitest
 * Runs before all tests
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock browser APIs that may not be available in test environment
global.matchMedia =
	global.matchMedia ||
	function () {
		return {
			matches: false,
			addListener: vi.fn(),
			removeListener: vi.fn()
		};
	};

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame =
	global.requestAnimationFrame ||
	function (callback) {
		return setTimeout(callback, 0);
	};

global.cancelAnimationFrame =
	global.cancelAnimationFrame ||
	function (id) {
		clearTimeout(id);
	};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
};

// Mock canvas for NeuralBackground tests
HTMLCanvasElement.prototype.getContext = function () {
	return {
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		fillStyle: '',
		globalAlpha: 1,
		save: vi.fn(),
		restore: vi.fn(),
		shadowBlur: 0,
		shadowColor: ''
	};
};
