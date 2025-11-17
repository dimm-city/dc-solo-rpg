/**
 * Dice Conversion Utilities
 *
 * Converts d20 rolls to d6 values using a balanced distribution mapping.
 * This allows the game to use a d20 die visually while maintaining d6 game mechanics.
 *
 * @module diceConversion
 */

/**
 * Convert a d20 roll to a d6 value using a balanced mapping.
 *
 * Distribution:
 * - d20 1-3 → d6 1 (15% probability, 3 values)
 * - d20 4-7 → d6 2 (20% probability, 4 values)
 * - d20 8-10 → d6 3 (15% probability, 3 values)
 * - d20 11-14 → d6 4 (20% probability, 4 values)
 * - d20 15-17 → d6 5 (15% probability, 3 values)
 * - d20 18-20 → d6 6 (15% probability, 3 values)
 *
 * The mapping provides a balanced distribution where values 2 and 4 have
 * slightly higher probability (20%) to create a smooth distribution curve.
 *
 * @param {number} d20Value - Roll result from 1-20
 * @returns {number} Equivalent d6 value from 1-6
 * @throws {Error} If d20Value is not between 1 and 20
 *
 * @example
 * convertD20ToD6(1)  // returns 1
 * convertD20ToD6(7)  // returns 2
 * convertD20ToD6(20) // returns 6
 */
export function convertD20ToD6(d20Value) {
	// Validate input
	if (typeof d20Value !== 'number' || !Number.isInteger(d20Value)) {
		throw new Error(`Invalid d20 value: ${d20Value}. Must be an integer.`);
	}

	if (d20Value < 1 || d20Value > 20) {
		throw new Error(`Invalid d20 value: ${d20Value}. Must be between 1 and 20.`);
	}

	// Balanced distribution mapping
	if (d20Value >= 1 && d20Value <= 3) return 1;
	if (d20Value >= 4 && d20Value <= 7) return 2;
	if (d20Value >= 8 && d20Value <= 10) return 3;
	if (d20Value >= 11 && d20Value <= 14) return 4;
	if (d20Value >= 15 && d20Value <= 17) return 5;
	if (d20Value >= 18 && d20Value <= 20) return 6;

	// This line should never be reached due to validation above
	throw new Error(`Unexpected d20 value: ${d20Value}`);
}

/**
 * Get a d20 value that converts to the desired d6 value.
 * Returns the first value in the range for consistency.
 *
 * This is primarily a helper function for tests, allowing easy creation
 * of mock dice rolls that produce specific d6 values.
 *
 * @param {number} d6Value - Desired d6 result (1-6)
 * @returns {number} A d20 value that maps to the desired d6 value
 * @throws {Error} If d6Value is not between 1 and 6
 *
 * @example
 * getD20ValueForD6(1) // returns 1 (could be 1, 2, or 3)
 * getD20ValueForD6(2) // returns 4 (could be 4, 5, 6, or 7)
 * getD20ValueForD6(6) // returns 18 (could be 18, 19, or 20)
 */
export function getD20ValueForD6(d6Value) {
	// Validate input
	if (typeof d6Value !== 'number' || !Number.isInteger(d6Value)) {
		throw new Error(`Invalid d6 value: ${d6Value}. Must be an integer.`);
	}

	// Mapping of d6 values to their d20 ranges [min, max]
	const ranges = {
		1: [1, 3],
		2: [4, 7],
		3: [8, 10],
		4: [11, 14],
		5: [15, 17],
		6: [18, 20]
	};

	const range = ranges[d6Value];
	if (!range) {
		throw new Error(`Invalid d6 value: ${d6Value}. Must be between 1 and 6.`);
	}

	// Return first value in range for consistency
	return range[0];
}

/**
 * Get a random d20 value within the range that converts to the desired d6 value.
 * Unlike getD20ValueForD6, this returns a random value from the range.
 *
 * @param {number} d6Value - Desired d6 result (1-6)
 * @returns {number} A random d20 value that maps to the desired d6 value
 * @throws {Error} If d6Value is not between 1 and 6
 *
 * @example
 * getRandomD20ValueForD6(1) // returns 1, 2, or 3 randomly
 * getRandomD20ValueForD6(6) // returns 18, 19, or 20 randomly
 */
export function getRandomD20ValueForD6(d6Value) {
	// Validate input
	if (typeof d6Value !== 'number' || !Number.isInteger(d6Value)) {
		throw new Error(`Invalid d6 value: ${d6Value}. Must be an integer.`);
	}

	// Mapping of d6 values to their d20 ranges [min, max]
	const ranges = {
		1: [1, 3],
		2: [4, 7],
		3: [8, 10],
		4: [11, 14],
		5: [15, 17],
		6: [18, 20]
	};

	const range = ranges[d6Value];
	if (!range) {
		throw new Error(`Invalid d6 value: ${d6Value}. Must be between 1 and 6.`);
	}

	const [min, max] = range;
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
