import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { logger } from './logger.js';
import {
	hasSeenInstructions,
	markInstructionsAsSeen,
	clearInstructionsSeen,
	hasSeenSplash,
	markSplashSeen,
	areRuleTipsEnabled,
	setRuleTipsEnabled,
	getSeenRuleTips,
	markRuleTipSeen,
	RULE_TIPS_KEY,
	RULE_TIPS_SEEN_KEY
} from './instructionsStorage.js';

describe('rule tips setting', () => {
	beforeEach(() => localStorage.clear());

	it('is on for a new player', () => {
		expect(areRuleTipsEnabled()).toBe(true);
	});

	it('follows the old "Skip always" flag until the player chooses', () => {
		markInstructionsAsSeen();
		expect(areRuleTipsEnabled()).toBe(false);
	});

	it('an explicit choice wins over the old flag, both ways', () => {
		markInstructionsAsSeen();
		setRuleTipsEnabled(true);
		expect(areRuleTipsEnabled()).toBe(true);
		expect(localStorage.getItem(RULE_TIPS_KEY)).toBe('true');

		clearInstructionsSeen();
		setRuleTipsEnabled(false);
		expect(areRuleTipsEnabled()).toBe(false);
	});
});

describe('rule tips met', () => {
	beforeEach(() => localStorage.clear());

	it('starts empty', () => {
		expect(getSeenRuleTips()).toEqual([]);
	});

	it('records each id once, in the order met', () => {
		markRuleTipSeen('odd');
		markRuleTipSeen('king');
		markRuleTipSeen('odd');
		expect(getSeenRuleTips()).toEqual(['odd', 'king']);
		expect(JSON.parse(localStorage.getItem(RULE_TIPS_SEEN_KEY))).toEqual(['odd', 'king']);
	});

	it('ignores a corrupt or foreign value', () => {
		localStorage.setItem(RULE_TIPS_SEEN_KEY, '{not json');
		expect(getSeenRuleTips()).toEqual([]);
		localStorage.setItem(RULE_TIPS_SEEN_KEY, JSON.stringify({ odd: true }));
		expect(getSeenRuleTips()).toEqual([]);
		localStorage.setItem(RULE_TIPS_SEEN_KEY, JSON.stringify(['odd', 3, null]));
		expect(getSeenRuleTips()).toEqual(['odd']);
	});
});

describe('splash', () => {
	beforeEach(() => localStorage.clear());

	it('plays once per install', () => {
		expect(hasSeenSplash()).toBe(false);
		markSplashSeen();
		expect(hasSeenSplash()).toBe(true);
	});

	it('counts as seen for a player who already made the first-time choice', () => {
		markInstructionsAsSeen();
		expect(hasSeenSplash()).toBe(true);
	});
});

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
		expect(areRuleTipsEnabled()).toBe(true);
		expect(() => setRuleTipsEnabled(false)).not.toThrow();
		expect(getSeenRuleTips()).toEqual([]);
		expect(() => markRuleTipSeen('odd')).not.toThrow();
		expect(hasSeenSplash()).toBe(false);
		expect(() => markSplashSeen()).not.toThrow();
		expect(warn).toHaveBeenCalled();
	});
});
