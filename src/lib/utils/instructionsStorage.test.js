import { describe, it, expect, vi, afterEach } from 'vitest';
import { logger } from './logger.js';
import {
	hasSeenInstructions,
	markInstructionsAsSeen,
	clearInstructionsSeen,
	hasShownInstructionsInSession,
	markInstructionsShownInSession
} from './instructionsStorage.js';

describe('instructionsStorage error handling', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('logs instead of throwing when storage throws', () => {
		const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
		const boom = () => {
			throw new Error('storage unavailable');
		};
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(boom);
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(boom);
		vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(boom);

		expect(hasSeenInstructions()).toBe(false);
		expect(() => markInstructionsAsSeen()).not.toThrow();
		expect(() => clearInstructionsSeen()).not.toThrow();
		expect(hasShownInstructionsInSession()).toBe(false);
		expect(() => markInstructionsShownInSession()).not.toThrow();
		expect(warn).toHaveBeenCalledTimes(5);
	});
});
