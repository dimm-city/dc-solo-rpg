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
 * Per Dimm City D20 Module specification
 *
 * @param {number} acesRevealed - Number of Aces revealed (0-4)
 * @returns {number} Minimum roll needed for success (1-20, or 0 for auto-success)
 *
 * @example
 * getSalvationThreshold(1) // => 17 (Success on 17-20, ~20% chance)
 * getSalvationThreshold(2) // => 14 (Success on 14-20, ~35% chance)
 * getSalvationThreshold(3) // => 11 (Success on 11-20, ~50% chance)
 * getSalvationThreshold(4) // => 0 (Automatic success)
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
			return 0; // Automatic success
		default:
			logger.error(`[getSalvationThreshold] Invalid Aces count: ${acesRevealed}`);
			return 20; // Impossible if no Aces
	}
}

/**
 * Calculate salvation check results based on d20 roll and Ace threshold
 * Per Dimm City D20 Module specification
 *
 * @param {number} roll - D20 roll result (1-20)
 * @param {number} threshold - Success threshold from getSalvationThreshold
 * @returns {Object} Salvation check result
 * @returns {number} result.tokenChange - Change in tokens (-2 to +2)
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
 * // Critical failure: Add 2 tokens + Surreal
 * calculateSalvationResult(1, 17) // => { tokenChange: 2, gainedLucid: false, gainedSurreal: true }
 */
export function calculateSalvationResult(roll, threshold) {
	// Auto-success if 4 Aces (threshold = 0)
	if (threshold === 0) {
		return {
			tokenChange: -1,
			gainedLucid: false,
			gainedSurreal: false
		};
	}

	// Natural 20: Remove 2 tokens + Lucid
	if (roll === 20) {
		return {
			tokenChange: -2,
			gainedLucid: true,
			gainedSurreal: false
		};
	}

	// Success (threshold to 19): Remove 1 token
	if (roll >= threshold && roll <= 19) {
		return {
			tokenChange: -1,
			gainedLucid: false,
			gainedSurreal: false
		};
	}

	// Partial failure (6 to threshold-1): No change
	if (roll >= 6 && roll < threshold) {
		return {
			tokenChange: 0,
			gainedLucid: false,
			gainedSurreal: false
		};
	}

	// Failure (2-5): Add 1 token
	if (roll >= 2 && roll <= 5) {
		return {
			tokenChange: 1,
			gainedLucid: false,
			gainedSurreal: false
		};
	}

	// Critical failure (1): Add 2 tokens + Surreal
	if (roll === 1) {
		return {
			tokenChange: 2,
			gainedLucid: false,
			gainedSurreal: true
		};
	}

	// Fallback
	logger.error(`[calculateSalvationResult] Unexpected roll: ${roll}, threshold: ${threshold}`);
	return { tokenChange: 0, gainedLucid: false, gainedSurreal: false };
}
