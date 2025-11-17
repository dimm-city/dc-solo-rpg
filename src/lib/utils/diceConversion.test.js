import { describe, it, expect } from 'vitest';
import {
	convertD20ToD6,
	getD20ValueForD6,
	getRandomD20ValueForD6
} from './diceConversion.js';

describe('convertD20ToD6', () => {
	describe('correct mapping', () => {
		it('should convert d20 1-3 to d6 1', () => {
			expect(convertD20ToD6(1)).toBe(1);
			expect(convertD20ToD6(2)).toBe(1);
			expect(convertD20ToD6(3)).toBe(1);
		});

		it('should convert d20 4-7 to d6 2', () => {
			expect(convertD20ToD6(4)).toBe(2);
			expect(convertD20ToD6(5)).toBe(2);
			expect(convertD20ToD6(6)).toBe(2);
			expect(convertD20ToD6(7)).toBe(2);
		});

		it('should convert d20 8-10 to d6 3', () => {
			expect(convertD20ToD6(8)).toBe(3);
			expect(convertD20ToD6(9)).toBe(3);
			expect(convertD20ToD6(10)).toBe(3);
		});

		it('should convert d20 11-14 to d6 4', () => {
			expect(convertD20ToD6(11)).toBe(4);
			expect(convertD20ToD6(12)).toBe(4);
			expect(convertD20ToD6(13)).toBe(4);
			expect(convertD20ToD6(14)).toBe(4);
		});

		it('should convert d20 15-17 to d6 5', () => {
			expect(convertD20ToD6(15)).toBe(5);
			expect(convertD20ToD6(16)).toBe(5);
			expect(convertD20ToD6(17)).toBe(5);
		});

		it('should convert d20 18-20 to d6 6', () => {
			expect(convertD20ToD6(18)).toBe(6);
			expect(convertD20ToD6(19)).toBe(6);
			expect(convertD20ToD6(20)).toBe(6);
		});

		it('should handle all 20 d20 values correctly', () => {
			const expectedMappings = {
				1: 1,
				2: 1,
				3: 1,
				4: 2,
				5: 2,
				6: 2,
				7: 2,
				8: 3,
				9: 3,
				10: 3,
				11: 4,
				12: 4,
				13: 4,
				14: 4,
				15: 5,
				16: 5,
				17: 5,
				18: 6,
				19: 6,
				20: 6
			};

			for (let d20Value = 1; d20Value <= 20; d20Value++) {
				expect(convertD20ToD6(d20Value)).toBe(expectedMappings[d20Value]);
			}
		});
	});

	describe('error handling', () => {
		it('should throw error for value 0', () => {
			expect(() => convertD20ToD6(0)).toThrow('Invalid d20 value: 0');
		});

		it('should throw error for value 21', () => {
			expect(() => convertD20ToD6(21)).toThrow('Invalid d20 value: 21');
		});

		it('should throw error for negative values', () => {
			expect(() => convertD20ToD6(-1)).toThrow('Invalid d20 value: -1');
			expect(() => convertD20ToD6(-10)).toThrow('Invalid d20 value: -10');
		});

		it('should throw error for very large values', () => {
			expect(() => convertD20ToD6(100)).toThrow('Invalid d20 value: 100');
		});

		it('should throw error for non-integer values', () => {
			expect(() => convertD20ToD6(5.5)).toThrow('Invalid d20 value: 5.5. Must be an integer.');
			expect(() => convertD20ToD6(10.7)).toThrow(
				'Invalid d20 value: 10.7. Must be an integer.'
			);
		});

		it('should throw error for non-numeric values', () => {
			expect(() => convertD20ToD6('5')).toThrow('Invalid d20 value: 5. Must be an integer.');
			expect(() => convertD20ToD6(null)).toThrow('Invalid d20 value: null. Must be an integer.');
			expect(() => convertD20ToD6(undefined)).toThrow(
				'Invalid d20 value: undefined. Must be an integer.'
			);
		});
	});

	describe('probability distribution', () => {
		it('should have correct probability distribution', () => {
			// Count how many d20 values map to each d6 value
			const distribution = {};
			for (let d20Value = 1; d20Value <= 20; d20Value++) {
				const d6Value = convertD20ToD6(d20Value);
				distribution[d6Value] = (distribution[d6Value] || 0) + 1;
			}

			// Verify counts match expected distribution
			expect(distribution[1]).toBe(3); // 15%
			expect(distribution[2]).toBe(4); // 20%
			expect(distribution[3]).toBe(3); // 15%
			expect(distribution[4]).toBe(4); // 20%
			expect(distribution[5]).toBe(3); // 15%
			expect(distribution[6]).toBe(3); // 15%

			// Verify total is 20
			const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
			expect(total).toBe(20);
		});

		it('should have expected probability percentages', () => {
			const distribution = {};
			for (let d20Value = 1; d20Value <= 20; d20Value++) {
				const d6Value = convertD20ToD6(d20Value);
				distribution[d6Value] = (distribution[d6Value] || 0) + 1;
			}

			// Calculate percentages
			const percentages = {};
			for (const [d6Value, count] of Object.entries(distribution)) {
				percentages[d6Value] = (count / 20) * 100;
			}

			// Verify percentages
			expect(percentages[1]).toBe(15);
			expect(percentages[2]).toBe(20);
			expect(percentages[3]).toBe(15);
			expect(percentages[4]).toBe(20);
			expect(percentages[5]).toBe(15);
			expect(percentages[6]).toBe(15);
		});
	});
});

describe('getD20ValueForD6', () => {
	describe('correct reverse mapping', () => {
		it('should return first value in range for d6 1', () => {
			const d20Value = getD20ValueForD6(1);
			expect(d20Value).toBe(1);
			expect(convertD20ToD6(d20Value)).toBe(1);
		});

		it('should return first value in range for d6 2', () => {
			const d20Value = getD20ValueForD6(2);
			expect(d20Value).toBe(4);
			expect(convertD20ToD6(d20Value)).toBe(2);
		});

		it('should return first value in range for d6 3', () => {
			const d20Value = getD20ValueForD6(3);
			expect(d20Value).toBe(8);
			expect(convertD20ToD6(d20Value)).toBe(3);
		});

		it('should return first value in range for d6 4', () => {
			const d20Value = getD20ValueForD6(4);
			expect(d20Value).toBe(11);
			expect(convertD20ToD6(d20Value)).toBe(4);
		});

		it('should return first value in range for d6 5', () => {
			const d20Value = getD20ValueForD6(5);
			expect(d20Value).toBe(15);
			expect(convertD20ToD6(d20Value)).toBe(5);
		});

		it('should return first value in range for d6 6', () => {
			const d20Value = getD20ValueForD6(6);
			expect(d20Value).toBe(18);
			expect(convertD20ToD6(d20Value)).toBe(6);
		});

		it('should provide valid d20 values for all d6 values', () => {
			for (let d6Value = 1; d6Value <= 6; d6Value++) {
				const d20Value = getD20ValueForD6(d6Value);

				// d20 value should be in valid range
				expect(d20Value).toBeGreaterThanOrEqual(1);
				expect(d20Value).toBeLessThanOrEqual(20);

				// d20 value should convert back to original d6 value
				expect(convertD20ToD6(d20Value)).toBe(d6Value);
			}
		});
	});

	describe('error handling', () => {
		it('should throw error for d6 value 0', () => {
			expect(() => getD20ValueForD6(0)).toThrow('Invalid d6 value: 0');
		});

		it('should throw error for d6 value 7', () => {
			expect(() => getD20ValueForD6(7)).toThrow('Invalid d6 value: 7');
		});

		it('should throw error for negative values', () => {
			expect(() => getD20ValueForD6(-1)).toThrow('Invalid d6 value: -1');
		});

		it('should throw error for non-integer values', () => {
			expect(() => getD20ValueForD6(3.5)).toThrow('Invalid d6 value: 3.5. Must be an integer.');
		});

		it('should throw error for non-numeric values', () => {
			expect(() => getD20ValueForD6('3')).toThrow('Invalid d6 value: 3. Must be an integer.');
			expect(() => getD20ValueForD6(null)).toThrow(
				'Invalid d6 value: null. Must be an integer.'
			);
		});
	});

	describe('consistency with convertD20ToD6', () => {
		it('should always produce values that convert back correctly', () => {
			for (let d6Value = 1; d6Value <= 6; d6Value++) {
				const d20Value = getD20ValueForD6(d6Value);
				const convertedBack = convertD20ToD6(d20Value);
				expect(convertedBack).toBe(d6Value);
			}
		});
	});
});

describe('getRandomD20ValueForD6', () => {
	describe('correct random mapping', () => {
		it('should return value in correct range for d6 1', () => {
			for (let i = 0; i < 100; i++) {
				const d20Value = getRandomD20ValueForD6(1);
				expect(d20Value).toBeGreaterThanOrEqual(1);
				expect(d20Value).toBeLessThanOrEqual(3);
				expect(convertD20ToD6(d20Value)).toBe(1);
			}
		});

		it('should return value in correct range for d6 2', () => {
			for (let i = 0; i < 100; i++) {
				const d20Value = getRandomD20ValueForD6(2);
				expect(d20Value).toBeGreaterThanOrEqual(4);
				expect(d20Value).toBeLessThanOrEqual(7);
				expect(convertD20ToD6(d20Value)).toBe(2);
			}
		});

		it('should return value in correct range for d6 3', () => {
			for (let i = 0; i < 100; i++) {
				const d20Value = getRandomD20ValueForD6(3);
				expect(d20Value).toBeGreaterThanOrEqual(8);
				expect(d20Value).toBeLessThanOrEqual(10);
				expect(convertD20ToD6(d20Value)).toBe(3);
			}
		});

		it('should return value in correct range for d6 4', () => {
			for (let i = 0; i < 100; i++) {
				const d20Value = getRandomD20ValueForD6(4);
				expect(d20Value).toBeGreaterThanOrEqual(11);
				expect(d20Value).toBeLessThanOrEqual(14);
				expect(convertD20ToD6(d20Value)).toBe(4);
			}
		});

		it('should return value in correct range for d6 5', () => {
			for (let i = 0; i < 100; i++) {
				const d20Value = getRandomD20ValueForD6(5);
				expect(d20Value).toBeGreaterThanOrEqual(15);
				expect(d20Value).toBeLessThanOrEqual(17);
				expect(convertD20ToD6(d20Value)).toBe(5);
			}
		});

		it('should return value in correct range for d6 6', () => {
			for (let i = 0; i < 100; i++) {
				const d20Value = getRandomD20ValueForD6(6);
				expect(d20Value).toBeGreaterThanOrEqual(18);
				expect(d20Value).toBeLessThanOrEqual(20);
				expect(convertD20ToD6(d20Value)).toBe(6);
			}
		});

		it('should produce variety in results', () => {
			// Test that we get different values over multiple calls
			const results = new Set();
			for (let i = 0; i < 50; i++) {
				results.add(getRandomD20ValueForD6(2)); // d6 2 has 4 possible values
			}
			// Should see multiple different values (not all the same)
			expect(results.size).toBeGreaterThan(1);
		});
	});

	describe('error handling', () => {
		it('should throw error for invalid d6 values', () => {
			expect(() => getRandomD20ValueForD6(0)).toThrow('Invalid d6 value: 0');
			expect(() => getRandomD20ValueForD6(7)).toThrow('Invalid d6 value: 7');
			expect(() => getRandomD20ValueForD6(-1)).toThrow('Invalid d6 value: -1');
		});

		it('should throw error for non-integer values', () => {
			expect(() => getRandomD20ValueForD6(3.5)).toThrow(
				'Invalid d6 value: 3.5. Must be an integer.'
			);
		});

		it('should throw error for non-numeric values', () => {
			expect(() => getRandomD20ValueForD6('3')).toThrow('Invalid d6 value: 3. Must be an integer.');
		});
	});
});

describe('integration tests', () => {
	describe('round-trip conversion', () => {
		it('should convert all d20 values to d6 and maintain consistency', () => {
			for (let d20 = 1; d20 <= 20; d20++) {
				const d6 = convertD20ToD6(d20);

				// d6 should be valid
				expect(d6).toBeGreaterThanOrEqual(1);
				expect(d6).toBeLessThanOrEqual(6);

				// Should be able to get a d20 value back
				const reverseD20 = getD20ValueForD6(d6);

				// Reverse d20 should also convert to same d6
				expect(convertD20ToD6(reverseD20)).toBe(d6);
			}
		});
	});

	describe('use case: test mocking', () => {
		it('should make it easy to mock specific d6 outcomes', () => {
			// Example: Mock a roll of 6 for success check
			const mockD20Roll = getD20ValueForD6(6);
			expect(convertD20ToD6(mockD20Roll)).toBe(6);

			// Example: Mock a roll of 1 for minimum damage
			const mockMinRoll = getD20ValueForD6(1);
			expect(convertD20ToD6(mockMinRoll)).toBe(1);

			// Example: Mock a roll of 4 for mid-range value
			const mockMidRoll = getD20ValueForD6(4);
			expect(convertD20ToD6(mockMidRoll)).toBe(4);
		});
	});

	describe('use case: random number generation', () => {
		it('should work with Math.random to generate d6 values from d20', () => {
			// Simulate rolling a d20 and converting to d6
			for (let i = 0; i < 100; i++) {
				const d20Roll = Math.floor(Math.random() * 20) + 1;
				const d6Result = convertD20ToD6(d20Roll);

				expect(d6Result).toBeGreaterThanOrEqual(1);
				expect(d6Result).toBeLessThanOrEqual(6);
			}
		});
	});
});
