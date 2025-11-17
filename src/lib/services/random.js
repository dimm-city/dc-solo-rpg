/**
 * Random Number Generator Service
 * Provides an abstraction over Math.random() that can be easily mocked for testing
 *
 * This service centralizes all randomness in the game, making it easy to:
 * - Mock specific outcomes for testing
 * - Replace the RNG algorithm if needed
 * - Test deterministic game scenarios
 */

/**
 * Internal RNG state
 * Can be replaced with a mock function for testing
 */
let rngFunction = Math.random;

/**
 * Get a random number between 0 (inclusive) and 1 (exclusive)
 * @returns {number} Random number [0, 1)
 */
export function random() {
	return rngFunction();
}

/**
 * Get a random integer between min (inclusive) and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer [min, max]
 */
export function randomInt(min, max) {
	return Math.floor(rngFunction() * (max - min + 1)) + min;
}

/**
 * Roll a die with the specified number of sides
 * @param {number} sides - Number of sides on the die (default: 20 for D20)
 * @returns {number} Roll result [1, sides]
 */
export function rollDie(sides = 20) {
	return randomInt(1, sides);
}

/**
 * Roll two dice and return the higher value (advantage in D20)
 * @param {number} sides - Number of sides on the die (default: 20)
 * @returns {number} Higher of two rolls [1, sides]
 */
export function rollAdvantage(sides = 20) {
	const roll1 = rollDie(sides);
	const roll2 = rollDie(sides);
	return Math.max(roll1, roll2);
}

/**
 * Roll two dice and return the lower value (disadvantage in D20)
 * @param {number} sides - Number of sides on the die (default: 20)
 * @returns {number} Lower of two rolls [1, sides]
 */
export function rollDisadvantage(sides = 20) {
	const roll1 = rollDie(sides);
	const roll2 = rollDie(sides);
	return Math.min(roll1, roll2);
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} The shuffled array (same reference, modified in place)
 */
export function shuffleArray(array) {
	let currentIndex = array.length;
	while (currentIndex !== 0) {
		const randomIndex = Math.floor(rngFunction() * currentIndex);
		currentIndex -= 1;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
}

/**
 * Set a custom RNG function (for testing)
 * @param {Function} mockFn - Function that returns a random number [0, 1)
 * @example
 * // Mock to always return 0.5
 * setRNG(() => 0.5);
 *
 * @example
 * // Mock with specific sequence
 * let callCount = 0;
 * setRNG(() => {
 *   const values = [0.1, 0.5, 0.9];
 *   return values[callCount++ % values.length];
 * });
 */
export function setRNG(mockFn) {
	if (typeof mockFn !== 'function') {
		throw new Error('setRNG requires a function that returns a number [0, 1)');
	}
	rngFunction = mockFn;
}

/**
 * Reset RNG to use Math.random()
 * Useful for cleaning up after tests
 */
export function resetRNG() {
	rngFunction = Math.random;
}

/**
 * Create a seeded RNG for reproducible randomness
 * Uses a simple Linear Congruential Generator (LCG)
 * @param {number} seed - Seed value for the RNG
 * @returns {Function} RNG function that can be passed to setRNG()
 */
export function createSeededRNG(seed) {
	let state = seed % 2147483647;
	if (state <= 0) state += 2147483646;

	return function () {
		state = (state * 16807) % 2147483647;
		return (state - 1) / 2147483646;
	};
}

/**
 * Mock a specific die roll result
 * Convenience function for testing
 * @param {number} result - The result to return (1-20 for D20)
 * @example
 * mockDieRoll(20); // Next roll will be natural 20
 * const roll = rollDie(); // Returns 20
 */
export function mockDieRoll(result) {
	// Mock Math.random to return the value needed for this result
	// For a d20: result n requires random value in range [(n-1)/20, n/20)
	const min = (result - 1) / 20;
	const mid = (min + result / 20) / 2;
	setRNG(() => mid);
}

/**
 * Mock a sequence of die rolls
 * Convenience function for testing multiple rolls
 * @param {number[]} sequence - Array of roll results
 * @example
 * mockDieRollSequence([1, 20, 10]);
 * rollDie(); // Returns 1
 * rollDie(); // Returns 20
 * rollDie(); // Returns 10
 */
export function mockDieRollSequence(sequence) {
	let index = 0;
	setRNG(() => {
		if (index >= sequence.length) {
			throw new Error('mockDieRollSequence: ran out of mocked values');
		}
		const result = sequence[index++];
		const min = (result - 1) / 20;
		const mid = (min + result / 20) / 2;
		return mid;
	});
}
