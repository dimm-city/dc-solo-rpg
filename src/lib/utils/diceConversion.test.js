import { describe, it, expect } from 'vitest';
import { convertD20ToD6, getD20ValueForD6, getD20RangeForD6 } from './diceConversion.js';

describe('diceConversion', () => {
	describe('convertD20ToD6', () => {
		describe('range 1-3 converts to 1', () => {
			it('should convert 1 to 1', () => {
				expect(convertD20ToD6(1)).toBe(1);
			});

			it('should convert 2 to 1', () => {
				expect(convertD20ToD6(2)).toBe(1);
			});

			it('should convert 3 to 1', () => {
				expect(convertD20ToD6(3)).toBe(1);
			});
		});

		describe('range 4-7 converts to 2', () => {
			it('should convert 4 to 2', () => {
				expect(convertD20ToD6(4)).toBe(2);
			});

			it('should convert 5 to 2', () => {
				expect(convertD20ToD6(5)).toBe(2);
			});

			it('should convert 6 to 2', () => {
				expect(convertD20ToD6(6)).toBe(2);
			});

			it('should convert 7 to 2', () => {
				expect(convertD20ToD6(7)).toBe(2);
			});
		});

		describe('range 8-10 converts to 3', () => {
			it('should convert 8 to 3', () => {
				expect(convertD20ToD6(8)).toBe(3);
			});

			it('should convert 9 to 3', () => {
				expect(convertD20ToD6(9)).toBe(3);
			});

			it('should convert 10 to 3', () => {
				expect(convertD20ToD6(10)).toBe(3);
			});
		});

		describe('range 11-14 converts to 4', () => {
			it('should convert 11 to 4', () => {
				expect(convertD20ToD6(11)).toBe(4);
			});

			it('should convert 12 to 4', () => {
				expect(convertD20ToD6(12)).toBe(4);
			});

			it('should convert 13 to 4', () => {
				expect(convertD20ToD6(13)).toBe(4);
			});

			it('should convert 14 to 4', () => {
				expect(convertD20ToD6(14)).toBe(4);
			});
		});

		describe('range 15-17 converts to 5', () => {
			it('should convert 15 to 5', () => {
				expect(convertD20ToD6(15)).toBe(5);
			});

			it('should convert 16 to 5', () => {
				expect(convertD20ToD6(16)).toBe(5);
			});

			it('should convert 17 to 5', () => {
				expect(convertD20ToD6(17)).toBe(5);
			});
		});

		describe('range 18-20 converts to 6', () => {
			it('should convert 18 to 6', () => {
				expect(convertD20ToD6(18)).toBe(6);
			});

			it('should convert 19 to 6', () => {
				expect(convertD20ToD6(19)).toBe(6);
			});

			it('should convert 20 to 6', () => {
				expect(convertD20ToD6(20)).toBe(6);
			});
		});

		describe('error handling', () => {
			it('should throw error for value 0', () => {
				expect(() => convertD20ToD6(0)).toThrow('Invalid d20 value: 0. Must be between 1 and 20.');
			});

			it('should throw error for value 21', () => {
				expect(() => convertD20ToD6(21)).toThrow(
					'Invalid d20 value: 21. Must be between 1 and 20.'
				);
			});

			it('should throw error for negative value', () => {
				expect(() => convertD20ToD6(-5)).toThrow(
					'Invalid d20 value: -5. Must be between 1 and 20.'
				);
			});

			it('should throw error for very large value', () => {
				expect(() => convertD20ToD6(100)).toThrow(
					'Invalid d20 value: 100. Must be between 1 and 20.'
				);
			});
		});

		describe('probability distribution verification', () => {
			it('should have 3 values mapping to 1 (15%)', () => {
				const values = [1, 2, 3];
				values.forEach((val) => {
					expect(convertD20ToD6(val)).toBe(1);
				});
				expect(values.length).toBe(3);
			});

			it('should have 4 values mapping to 2 (20%)', () => {
				const values = [4, 5, 6, 7];
				values.forEach((val) => {
					expect(convertD20ToD6(val)).toBe(2);
				});
				expect(values.length).toBe(4);
			});

			it('should have 3 values mapping to 3 (15%)', () => {
				const values = [8, 9, 10];
				values.forEach((val) => {
					expect(convertD20ToD6(val)).toBe(3);
				});
				expect(values.length).toBe(3);
			});

			it('should have 4 values mapping to 4 (20%)', () => {
				const values = [11, 12, 13, 14];
				values.forEach((val) => {
					expect(convertD20ToD6(val)).toBe(4);
				});
				expect(values.length).toBe(4);
			});

			it('should have 3 values mapping to 5 (15%)', () => {
				const values = [15, 16, 17];
				values.forEach((val) => {
					expect(convertD20ToD6(val)).toBe(5);
				});
				expect(values.length).toBe(3);
			});

			it('should have 3 values mapping to 6 (15%)', () => {
				const values = [18, 19, 20];
				values.forEach((val) => {
					expect(convertD20ToD6(val)).toBe(6);
				});
				expect(values.length).toBe(3);
			});

			it('should cover all 20 d20 values exactly once', () => {
				const allValues = Array.from({ length: 20 }, (_, i) => i + 1);
				const converted = allValues.map((val) => convertD20ToD6(val));

				// Should have values without errors
				expect(converted.length).toBe(20);

				// Should only contain values 1-6
				const unique = [...new Set(converted)];
				expect(unique.sort()).toEqual([1, 2, 3, 4, 5, 6]);
			});
		});
	});

	describe('getD20ValueForD6', () => {
		it('should return 1 for d6 value 1', () => {
			expect(getD20ValueForD6(1)).toBe(1);
		});

		it('should return 4 for d6 value 2', () => {
			expect(getD20ValueForD6(2)).toBe(4);
		});

		it('should return 8 for d6 value 3', () => {
			expect(getD20ValueForD6(3)).toBe(8);
		});

		it('should return 11 for d6 value 4', () => {
			expect(getD20ValueForD6(4)).toBe(11);
		});

		it('should return 15 for d6 value 5', () => {
			expect(getD20ValueForD6(5)).toBe(15);
		});

		it('should return 18 for d6 value 6', () => {
			expect(getD20ValueForD6(6)).toBe(18);
		});

		it('should throw error for value 0', () => {
			expect(() => getD20ValueForD6(0)).toThrow('Invalid d6 value: 0. Must be between 1 and 6.');
		});

		it('should throw error for value 7', () => {
			expect(() => getD20ValueForD6(7)).toThrow('Invalid d6 value: 7. Must be between 1 and 6.');
		});

		describe('round-trip conversion', () => {
			it('should convert back to original d6 value for 1', () => {
				const d20Value = getD20ValueForD6(1);
				expect(convertD20ToD6(d20Value)).toBe(1);
			});

			it('should convert back to original d6 value for 2', () => {
				const d20Value = getD20ValueForD6(2);
				expect(convertD20ToD6(d20Value)).toBe(2);
			});

			it('should convert back to original d6 value for 3', () => {
				const d20Value = getD20ValueForD6(3);
				expect(convertD20ToD6(d20Value)).toBe(3);
			});

			it('should convert back to original d6 value for 4', () => {
				const d20Value = getD20ValueForD6(4);
				expect(convertD20ToD6(d20Value)).toBe(4);
			});

			it('should convert back to original d6 value for 5', () => {
				const d20Value = getD20ValueForD6(5);
				expect(convertD20ToD6(d20Value)).toBe(5);
			});

			it('should convert back to original d6 value for 6', () => {
				const d20Value = getD20ValueForD6(6);
				expect(convertD20ToD6(d20Value)).toBe(6);
			});
		});
	});

	describe('getD20RangeForD6', () => {
		it('should return [1, 2, 3] for d6 value 1', () => {
			expect(getD20RangeForD6(1)).toEqual([1, 2, 3]);
		});

		it('should return [4, 5, 6, 7] for d6 value 2', () => {
			expect(getD20RangeForD6(2)).toEqual([4, 5, 6, 7]);
		});

		it('should return [8, 9, 10] for d6 value 3', () => {
			expect(getD20RangeForD6(3)).toEqual([8, 9, 10]);
		});

		it('should return [11, 12, 13, 14] for d6 value 4', () => {
			expect(getD20RangeForD6(4)).toEqual([11, 12, 13, 14]);
		});

		it('should return [15, 16, 17] for d6 value 5', () => {
			expect(getD20RangeForD6(5)).toEqual([15, 16, 17]);
		});

		it('should return [18, 19, 20] for d6 value 6', () => {
			expect(getD20RangeForD6(6)).toEqual([18, 19, 20]);
		});

		it('should throw error for value 0', () => {
			expect(() => getD20RangeForD6(0)).toThrow('Invalid d6 value: 0. Must be between 1 and 6.');
		});

		it('should throw error for value 7', () => {
			expect(() => getD20RangeForD6(7)).toThrow('Invalid d6 value: 7. Must be between 1 and 6.');
		});

		describe('range consistency verification', () => {
			it('should have all values in each range convert to the correct d6 value', () => {
				for (let d6Value = 1; d6Value <= 6; d6Value++) {
					const range = getD20RangeForD6(d6Value);
					range.forEach((d20Value) => {
						expect(convertD20ToD6(d20Value)).toBe(d6Value);
					});
				}
			});

			it('should have all ranges cover exactly 20 values total', () => {
				const allValues = [];
				for (let d6Value = 1; d6Value <= 6; d6Value++) {
					allValues.push(...getD20RangeForD6(d6Value));
				}

				expect(allValues.length).toBe(20);
				expect([...new Set(allValues)].length).toBe(20); // All unique
				expect(Math.min(...allValues)).toBe(1);
				expect(Math.max(...allValues)).toBe(20);
			});
		});
	});
});
