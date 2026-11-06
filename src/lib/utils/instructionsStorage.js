/**
 * First-run and teaching preferences, kept in localStorage (sessionStorage for the session flag)
 *
 * - instructions-seen: the player has made the first-time "how do you want to start" choice
 * - splash-seen: the splash has played once on this install
 * - rule-tips: whether in-play rule tips (captions) are shown
 * - rule-tips-seen: ids of the rule tips the player has met, listed in the Help modal
 */

import { logger } from './logger.js';

const STORAGE_KEY = 'dc-solo-rpg:instructions-seen';
const SESSION_KEY = 'dc-solo-rpg:instructions-shown-in-session';
export const SPLASH_KEY = 'dc-solo-rpg:splash-seen';
export const RULE_TIPS_KEY = 'dc-solo-rpg:rule-tips';
export const RULE_TIPS_SEEN_KEY = 'dc-solo-rpg:rule-tips-seen';

const getStorage = (kind) => (kind === 'session' ? sessionStorage : localStorage);

/** Read a key, or null when storage is missing (SSR) or throws (privacy mode) */
function read(key, kind = 'local') {
	if (typeof window === 'undefined') return null;
	try {
		return getStorage(kind).getItem(key);
	} catch (error) {
		logger.warn(`[instructionsStorage] Failed to read ${key}:`, error);
		return null;
	}
}

/** Write (or with value null, remove) a key; failures are logged, never thrown */
function write(key, value, kind = 'local') {
	if (typeof window === 'undefined') return;
	try {
		if (value === null) getStorage(kind).removeItem(key);
		else getStorage(kind).setItem(key, value);
	} catch (error) {
		logger.warn(`[instructionsStorage] Failed to write ${key}:`, error);
	}
}

/**
 * Check if the player has made the first-time choice
 * @returns {boolean} True if instructions have been seen
 */
export function hasSeenInstructions() {
	return read(STORAGE_KEY) === 'true';
}

/** Remember that the first-time choice has been made */
export function markInstructionsAsSeen() {
	write(STORAGE_KEY, 'true');
}

/** Clear the instructions seen flag (for testing/debugging) */
export function clearInstructionsSeen() {
	write(STORAGE_KEY, null);
}

/**
 * Check if instructions have been shown in this session
 * @returns {boolean} True if instructions have been shown in this session
 */
export function hasShownInstructionsInSession() {
	return read(SESSION_KEY, 'session') === 'true';
}

/** Mark instructions as shown for this session */
export function markInstructionsShownInSession() {
	write(SESSION_KEY, 'true', 'session');
}

/**
 * The splash plays once per install. A player who already made the first-time choice
 * has seen it too (that choice comes right after it).
 * @returns {boolean}
 */
export function hasSeenSplash() {
	return read(SPLASH_KEY) === 'true' || hasSeenInstructions();
}

/** Remember that the splash has played */
export function markSplashSeen() {
	write(SPLASH_KEY, 'true');
}

/**
 * Are in-play rule tips on?
 *
 * An explicit choice (the Settings toggle, or "don't show tips" on the first-time panel) wins.
 * Without one, tips follow the older "Skip always" flag, which used to turn them off too.
 * @returns {boolean}
 */
export function areRuleTipsEnabled() {
	const stored = read(RULE_TIPS_KEY);
	if (stored === 'true') return true;
	if (stored === 'false') return false;
	return !hasSeenInstructions();
}

/** @param {boolean} enabled */
export function setRuleTipsEnabled(enabled) {
	write(RULE_TIPS_KEY, enabled ? 'true' : 'false');
}

/**
 * Ids of the rule tips the player has met, in the order they were met
 * @returns {string[]}
 */
export function getSeenRuleTips() {
	const raw = read(RULE_TIPS_SEEN_KEY);
	if (!raw) return [];
	try {
		const ids = JSON.parse(raw);
		return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

/**
 * Record that a rule tip was shown (once per id)
 * @param {string} id
 */
export function markRuleTipSeen(id) {
	const seen = getSeenRuleTips();
	if (seen.includes(id)) return;
	write(RULE_TIPS_SEEN_KEY, JSON.stringify([...seen, id]));
}
