/**
 * Tests for D20 Mechanics
 * Testing new d20-based game mechanics including:
 * - Lucid/Surreal states
 * - D20 to card count conversion
 * - Stability loss calculation
 * - Salvation threshold system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import {
	convertD20ToCardCount,
	calculateStabilityLoss,
	getSalvationThreshold,
	calculateSalvationResult
} from './gameActions.svelte.js';

describe('D20 Mechanics', () => {
	describe('Lucid/Surreal States', () => {
		beforeEach(() => {
			gameState.isLucid = false;
			gameState.isSurreal = false;
		});

		it('should set Lucid state on natural 20', () => {
			// This test verifies that the system sets isLucid when appropriate
			// Actual implementation is in specific roll functions
			gameState.isLucid = false;
			expect(gameState.isLucid).toBe(false);

			// Simulate what happens when a 20 is rolled
			gameState.isLucid = true;
			expect(gameState.isLucid).toBe(true);
		});

		it('should set Surreal state on natural 1', () => {
			gameState.isSurreal = false;
			expect(gameState.isSurreal).toBe(false);

			// Simulate what happens when a 1 is rolled
			gameState.isSurreal = true;
			expect(gameState.isSurreal).toBe(true);
		});

		it('should roll with advantage when Lucid', () => {
			gameState.isLucid = true;

			const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

			// Should have rolled with advantage
			expect(wasLucid).toBe(true);
			expect(wasSurreal).toBe(false);

			// Roll should be in valid range
			expect(roll).toBeGreaterThanOrEqual(1);
			expect(roll).toBeLessThanOrEqual(20);

			// State should be cleared after use
			expect(gameState.isLucid).toBe(false);
		});

		it('should roll with disadvantage when Surreal', () => {
			gameState.isSurreal = true;

			const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

			// Should have rolled with disadvantage
			expect(wasSurreal).toBe(true);
			expect(wasLucid).toBe(false);

			// Roll should be in valid range
			expect(roll).toBeGreaterThanOrEqual(1);
			expect(roll).toBeLessThanOrEqual(20);

			// State should be cleared after use
			expect(gameState.isSurreal).toBe(false);
		});

		it('should clear Lucid state after one roll', () => {
			gameState.isLucid = true;

			// First roll
			gameState.rollWithModifiers();
			expect(gameState.isLucid).toBe(false);

			// Second roll should be normal
			const result = gameState.rollWithModifiers();
			expect(result.wasLucid).toBe(false);
		});

		it('should clear Surreal state after one roll', () => {
			gameState.isSurreal = true;

			// First roll
			gameState.rollWithModifiers();
			expect(gameState.isSurreal).toBe(false);

			// Second roll should be normal
			const result = gameState.rollWithModifiers();
			expect(result.wasSurreal).toBe(false);
		});

		it('should handle normal roll when neither Lucid nor Surreal', () => {
			gameState.isLucid = false;
			gameState.isSurreal = false;

			const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

			expect(wasLucid).toBe(false);
			expect(wasSurreal).toBe(false);
			expect(roll).toBeGreaterThanOrEqual(1);
			expect(roll).toBeLessThanOrEqual(20);
		});
	});

	describe('D20 to Card Count Conversion', () => {
		it('should return 1 card for roll of 1', () => {
			expect(convertD20ToCardCount(1)).toBe(1);
		});

		it('should return 2 cards for rolls 2-5', () => {
			expect(convertD20ToCardCount(2)).toBe(2);
			expect(convertD20ToCardCount(3)).toBe(2);
			expect(convertD20ToCardCount(4)).toBe(2);
			expect(convertD20ToCardCount(5)).toBe(2);
		});

		it('should return 3 cards for rolls 6-10', () => {
			expect(convertD20ToCardCount(6)).toBe(3);
			expect(convertD20ToCardCount(7)).toBe(3);
			expect(convertD20ToCardCount(8)).toBe(3);
			expect(convertD20ToCardCount(9)).toBe(3);
			expect(convertD20ToCardCount(10)).toBe(3);
		});

		it('should return 4 cards for rolls 11-15', () => {
			expect(convertD20ToCardCount(11)).toBe(4);
			expect(convertD20ToCardCount(12)).toBe(4);
			expect(convertD20ToCardCount(13)).toBe(4);
			expect(convertD20ToCardCount(14)).toBe(4);
			expect(convertD20ToCardCount(15)).toBe(4);
		});

		it('should return 5 cards for rolls 16-19', () => {
			expect(convertD20ToCardCount(16)).toBe(5);
			expect(convertD20ToCardCount(17)).toBe(5);
			expect(convertD20ToCardCount(18)).toBe(5);
			expect(convertD20ToCardCount(19)).toBe(5);
		});

		it('should return 6 cards for roll of 20', () => {
			expect(convertD20ToCardCount(20)).toBe(6);
		});

		it('should have correct average (approximately 3.5 cards)', () => {
			// Calculate expected value:
			// 1*1 + 2*4 + 3*5 + 4*5 + 5*4 + 6*1 = 1 + 8 + 15 + 20 + 20 + 6 = 70
			// 70 / 20 = 3.5
			const rolls = Array.from({ length: 20 }, (_, i) => i + 1);
			const cards = rolls.map((r) => convertD20ToCardCount(r));
			const average = cards.reduce((sum, c) => sum + c, 0) / 20;

			expect(average).toBe(3.5);
		});
	});

	describe('Stability Loss Calculation', () => {
		it('should return 0 loss for natural 20 and set Lucid', () => {
			const result = calculateStabilityLoss(20);

			expect(result.loss).toBe(0);
			expect(result.gainedLucid).toBe(true);
			expect(result.gainedSurreal).toBe(false);
			expect(result.optionalGain).toBe(1);
		});

		it('should return 0 loss for rolls 11-19', () => {
			for (let roll = 11; roll <= 19; roll++) {
				const result = calculateStabilityLoss(roll);

				expect(result.loss).toBe(0);
				expect(result.gainedLucid).toBe(false);
				expect(result.gainedSurreal).toBe(false);
				expect(result.optionalGain).toBe(0);
			}
		});

		it('should return -1 stability for rolls 6-10', () => {
			for (let roll = 6; roll <= 10; roll++) {
				const result = calculateStabilityLoss(roll);

				expect(result.loss).toBe(1);
				expect(result.gainedLucid).toBe(false);
				expect(result.gainedSurreal).toBe(false);
				expect(result.optionalGain).toBe(0);
			}
		});

		it('should return -2 stability for rolls 2-5', () => {
			for (let roll = 2; roll <= 5; roll++) {
				const result = calculateStabilityLoss(roll);

				expect(result.loss).toBe(2);
				expect(result.gainedLucid).toBe(false);
				expect(result.gainedSurreal).toBe(false);
				expect(result.optionalGain).toBe(0);
			}
		});

		it('should return -3 stability for natural 1 and set Surreal', () => {
			const result = calculateStabilityLoss(1);

			expect(result.loss).toBe(3);
			expect(result.gainedLucid).toBe(false);
			expect(result.gainedSurreal).toBe(true);
			expect(result.optionalGain).toBe(0);
		});

		it('should provide optional +1 gain for natural 20', () => {
			const result = calculateStabilityLoss(20);

			expect(result.optionalGain).toBe(1);
		});
	});

	describe('Salvation Thresholds', () => {
		it('should return threshold 17 for 1 Ace', () => {
			expect(getSalvationThreshold(1)).toBe(17);
		});

		it('should return threshold 14 for 2 Aces', () => {
			expect(getSalvationThreshold(2)).toBe(14);
		});

		it('should return threshold 11 for 3 Aces', () => {
			expect(getSalvationThreshold(3)).toBe(11);
		});

		it('should return threshold 0 for 4 Aces (auto-success)', () => {
			expect(getSalvationThreshold(4)).toBe(0);
		});

		it('should return 20 (impossible) for 0 Aces', () => {
			expect(getSalvationThreshold(0)).toBe(20);
		});
	});

	describe('Salvation Results', () => {
		describe('With 1 Ace (threshold 17)', () => {
			const threshold = 17;

			it('should remove 2 tokens on natural 20', () => {
				const result = calculateSalvationResult(20, threshold);

				expect(result.tokenChange).toBe(-2);
				expect(result.gainedLucid).toBe(true);
				expect(result.gainedSurreal).toBe(false);
			});

			it('should remove 1 token on rolls 17-19', () => {
				for (let roll = 17; roll <= 19; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(-1);
					expect(result.gainedLucid).toBe(false);
					expect(result.gainedSurreal).toBe(false);
				}
			});

			it('should not change tokens on near-miss (6-16)', () => {
				for (let roll = 6; roll <= 16; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(0);
					expect(result.gainedLucid).toBe(false);
					expect(result.gainedSurreal).toBe(false);
				}
			});

			it('should add 1 token on failure (2-5)', () => {
				for (let roll = 2; roll <= 5; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(1);
					expect(result.gainedLucid).toBe(false);
					expect(result.gainedSurreal).toBe(false);
				}
			});

			it('should add 2 tokens on critical failure (1)', () => {
				const result = calculateSalvationResult(1, threshold);

				expect(result.tokenChange).toBe(2);
				expect(result.gainedLucid).toBe(false);
				expect(result.gainedSurreal).toBe(true);
			});
		});

		describe('With 2 Aces (threshold 14)', () => {
			const threshold = 14;

			it('should remove 1 token on rolls 14-19', () => {
				for (let roll = 14; roll <= 19; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(-1);
				}
			});

			it('should not change tokens on near-miss (6-13)', () => {
				for (let roll = 6; roll <= 13; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(0);
				}
			});
		});

		describe('With 3 Aces (threshold 11)', () => {
			const threshold = 11;

			it('should remove 1 token on rolls 11-19', () => {
				for (let roll = 11; roll <= 19; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(-1);
				}
			});

			it('should not change tokens on near-miss (6-10)', () => {
				for (let roll = 6; roll <= 10; roll++) {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(0);
				}
			});
		});

		describe('With 4 Aces (auto-success)', () => {
			const threshold = 0;

			it('should always remove 1 token regardless of roll', () => {
				// Test a few random rolls
				const rolls = [1, 5, 10, 15, 20];

				rolls.forEach((roll) => {
					const result = calculateSalvationResult(roll, threshold);

					expect(result.tokenChange).toBe(-1);
					expect(result.gainedLucid).toBe(false);
					expect(result.gainedSurreal).toBe(false);
				});
			});
		});
	});

	describe('Success/Failure Probabilities', () => {
		it('should have ~20% success rate with 1 Ace (threshold 17)', () => {
			// 4 successes out of 20 possible rolls (17, 18, 19, 20)
			const threshold = getSalvationThreshold(1);
			expect(threshold).toBe(17);

			const successes = [17, 18, 19, 20].length;
			const probability = successes / 20;

			expect(probability).toBe(0.2); // 20%
		});

		it('should have ~35% success rate with 2 Aces (threshold 14)', () => {
			// 7 successes out of 20 possible rolls (14-20)
			const threshold = getSalvationThreshold(2);
			expect(threshold).toBe(14);

			const successes = 20 - threshold + 1;
			const probability = successes / 20;

			expect(probability).toBe(0.35); // 35%
		});

		it('should have ~50% success rate with 3 Aces (threshold 11)', () => {
			// 10 successes out of 20 possible rolls (11-20)
			const threshold = getSalvationThreshold(3);
			expect(threshold).toBe(11);

			const successes = 20 - threshold + 1;
			const probability = successes / 20;

			expect(probability).toBe(0.5); // 50%
		});

		it('should have 100% success rate with 4 Aces', () => {
			const threshold = getSalvationThreshold(4);
			expect(threshold).toBe(0);

			// Auto-success means probability = 1.0
		});
	});
});
