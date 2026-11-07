/**
 * D20 Mechanics Module
 *
 * Core D20 game mechanics for the Dimm City solo RPG system.
 * These functions handle dice roll conversions, stability calculations,
 * and salvation check outcomes per the D20 Module specification.
 *
 * @module d20Mechanics
 */

import { logger } from '../utils/logger.js';

/**
 * Convert d20 roll to number of cards to draw
 * Per Dimm City D20 Module specification
 *
 * @param {number} roll - D20 roll result (1-20)
 * @returns {number} Number of cards to draw (1-6)
 *
 * @example
 * convertD20ToCardCount(1) // => 1
 * convertD20ToCardCount(7) // => 3
 * convertD20ToCardCount(20) // => 6
 */
export function convertD20ToCardCount(roll) {
	if (roll === 1) return 1;
	if (roll >= 2 && roll <= 5) return 2;
	if (roll >= 6 && roll <= 10) return 3;
	if (roll >= 11 && roll <= 15) return 4;
	if (roll >= 16 && roll <= 19) return 5;
	if (roll === 20) return 6;

	// Fallback (should never happen)
	logger.error(`[convertD20ToCardCount] Invalid roll: ${roll}`);
	return 3;
}

/**
 * Calculate stability loss based on d20 roll
 * Per Dimm City D20 Module specification
 *
 * @param {number} roll - D20 roll result (1-20)
 * @returns {Object} Stability loss result
 * @returns {number} result.loss - Stability points lost
 * @returns {boolean} result.gainedLucid - Whether player gained Lucid state (advantage)
 * @returns {boolean} result.gainedSurreal - Whether player gained Surreal state (disadvantage)
 * @returns {number} result.optionalGain - Optional temporary stability gain
 *
 * @example
 * calculateStabilityLoss(20) // => { loss: 0, gainedLucid: true, gainedSurreal: false, optionalGain: 1 }
 * calculateStabilityLoss(1) // => { loss: 3, gainedLucid: false, gainedSurreal: true, optionalGain: 0 }
 */
export function calculateStabilityLoss(roll) {
	if (roll === 20) {
		return {
			loss: 0,
			gainedLucid: true,
			gainedSurreal: false,
			optionalGain: 1 // "optional +1 temp stability"
		};
	}
	if (roll >= 11 && roll <= 19) {
		return { loss: 0, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
	}
	if (roll >= 6 && roll <= 10) {
		return { loss: 1, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
	}
	if (roll >= 2 && roll <= 5) {
		return { loss: 2, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
	}
	if (roll === 1) {
		return {
			loss: 3,
			gainedLucid: false,
			gainedSurreal: true,
			optionalGain: 0
		};
	}

	// Fallback
	logger.error(`[calculateStabilityLoss] Invalid roll: ${roll}`);
	return { loss: 0, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
}

/**
 * Get salvation success threshold based on number of Aces revealed
 *
 * Salvation is rolled against a target with one to three Aces. With four there is no target
 * (0): each Salvation is a Stability check followed by the token (see
 * calculateAutomaticSalvation). On Easy the fourth Ace ends the game instead (see
 * isFinalStabilityCheck in gameActions), so there four Aces never reach a Salvation roll.
 *
 * @param {number} acesRevealed - Number of Aces revealed (1-4)
 * @returns {number} Minimum roll needed for success (17, 14 or 11), or 0 for no target (four Aces)
 *
 * @example
 * getSalvationThreshold(1) // => 17 (Success on 17-20, ~20% chance)
 * getSalvationThreshold(2) // => 14 (Success on 14-20, ~35% chance)
 * getSalvationThreshold(3) // => 11 (Success on 11-20, ~50% chance)
 * getSalvationThreshold(4) // => 0 (no target: see calculateAutomaticSalvation)
 */
export function getSalvationThreshold(acesRevealed) {
	switch (acesRevealed) {
		case 1:
			return 17; // Success on 17-20 (~20% chance)
		case 2:
			return 14; // Success on 14-20 (~35% chance)
		case 3:
			return 11; // Success on 11-20 (~50% chance)
		case 4:
			return 0; // No target to beat: one Stability check, then the token comes off
		default:
			logger.error(`[getSalvationThreshold] Invalid Aces count: ${acesRevealed}`);
			return 20; // Impossible if no Aces
	}
}

/**
 * Calculate salvation check results based on d20 roll and Ace threshold
 *
 * Meeting the target removes one token and a natural 20 removes two. A miss adds none on
 * Normal (tokens only ever fall there); on Hard it adds one, and a natural 1 adds two. A
 * natural 1 is a miss on every difficulty, and still makes the player Surreal, as a natural
 * 20 makes them Lucid.
 *
 * @param {number} roll - D20 roll result (1-20)
 * @param {number} threshold - Success threshold from getSalvationThreshold (17, 14 or 11;
 *   0 means four Aces: see calculateAutomaticSalvation, which decides the token)
 * @param {{ hard?: boolean }} [rules] - hard: the Hard rules (a miss adds tokens)
 * @returns {Object} Salvation check result
 * @returns {number} result.tokenChange - Change in tokens (-2 to 0, or up to +2 on Hard)
 * @returns {boolean} result.gainedLucid - Whether player gained Lucid state (advantage)
 * @returns {boolean} result.gainedSurreal - Whether player gained Surreal state (disadvantage)
 *
 * @example
 * // Natural 20: Remove 2 tokens + Lucid
 * calculateSalvationResult(20, 17) // => { tokenChange: -2, gainedLucid: true, gainedSurreal: false }
 *
 * // Success: Remove 1 token
 * calculateSalvationResult(18, 17) // => { tokenChange: -1, gainedLucid: false, gainedSurreal: false }
 *
 * // Miss: no change on Normal, +1 token on Hard
 * calculateSalvationResult(9, 17) // => { tokenChange: 0, ... }
 * calculateSalvationResult(9, 17, { hard: true }) // => { tokenChange: 1, ... }
 *
 * // Natural 1: a miss, plus Surreal (+2 tokens on Hard)
 * calculateSalvationResult(1, 17) // => { tokenChange: 0, gainedLucid: false, gainedSurreal: true }
 */
export function calculateSalvationResult(roll, threshold, { hard = false } = {}) {
	// 4 Aces (threshold 0): no target, so the token comes off, provided Stability survives the
	// roll (see calculateAutomaticSalvation). A natural 20 or 1 still makes the player Lucid or Surreal.
	if (threshold === 0) {
		return { tokenChange: -1, gainedLucid: roll === 20, gainedSurreal: roll === 1 };
	}

	// Natural 20: Remove 2 tokens + Lucid (critical success)
	if (roll === 20) {
		return { tokenChange: -2, gainedLucid: true, gainedSurreal: false };
	}

	// Natural 1: a miss (two tokens on Hard, none otherwise) + Surreal
	if (roll === 1) {
		return { tokenChange: hard ? 2 : 0, gainedLucid: false, gainedSurreal: true };
	}

	// At or above the target: remove 1 token. Below it: one token on Hard, nothing otherwise.
	const tokenChange = roll >= threshold ? -1 : hard ? 1 : 0;
	return { tokenChange, gainedLucid: false, gainedSurreal: false };
}

/**
 * Salvation with all four Aces (Normal and Hard; on Easy the fourth Ace ends the game first):
 * there is no target to beat, but the token only comes off after one Stability check. The roll is read
 * on the Stability table (natural 1: -3 and Surreal; 2-5: -2; 6-10: -1; 11-19: no loss;
 * natural 20: +1, max 20, and Lucid). If Stability is still above 0 afterwards, one token
 * comes off; if the roll takes it to 0, the game is lost.
 *
 * @param {number} roll - Kept d20 value (1-20)
 * @param {number} stability - Stability before the roll
 * @param {number} [max=20] - Stability cap
 * @returns {{ stabilityLoss: number, stabilityGain: number, stabilityAfter: number,
 *   tokenChange: number, gainedLucid: boolean, gainedSurreal: boolean }}
 *   tokenChange is -1, or 0 when Stability collapses
 *
 * @example
 * calculateAutomaticSalvation(14, 12) // => { stabilityLoss: 0, stabilityAfter: 12, tokenChange: -1, ... }
 * calculateAutomaticSalvation(3, 2)   // => { stabilityLoss: 2, stabilityAfter: 0, tokenChange: 0, ... }
 */
export function calculateAutomaticSalvation(roll, stability, max = 20) {
	const { loss, optionalGain, gainedLucid, gainedSurreal } = calculateStabilityLoss(roll);
	const stabilityAfter = Math.max(0, Math.min(stability + optionalGain, max) - loss);
	return {
		stabilityLoss: loss,
		stabilityGain: optionalGain,
		stabilityAfter,
		tokenChange: stabilityAfter > 0 ? -1 : 0,
		gainedLucid,
		gainedSurreal
	};
}
