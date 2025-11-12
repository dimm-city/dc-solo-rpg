/**
 * Dice themes configuration for the game
 * Based on @3d-dice/dice-box-threejs built-in themes
 *
 * The 'key' must match the theme names that dice-box recognizes.
 * Available built-in themes: https://github.com/3d-dice/dice-box#themes
 */

export const DICE_THEMES = [
	{
		key: 'default',
		name: 'Default',
		category: 'standard',
		description: 'Classic white dice with black numbers'
	},
	{
		key: 'pinkdreams',
		name: 'Pink Dreams',
		category: 'neon',
		description: 'Vibrant pink neon dice'
	},
	{
		key: 'bluedreams',
		name: 'Blue Dreams',
		category: 'neon',
		description: 'Glowing blue cyberpunk dice'
	},
	{
		key: 'greendreams',
		name: 'Green Dreams',
		category: 'neon',
		description: 'Bright green matrix-style dice'
	},
	{
		key: 'purpledreams',
		name: 'Purple Dreams',
		category: 'neon',
		description: 'Electric purple neon dice'
	},
	{
		key: 'fire',
		name: 'Fire',
		category: 'elemental',
		description: 'Burning hot fire dice'
	},
	{
		key: 'ice',
		name: 'Ice',
		category: 'elemental',
		description: 'Frozen ice crystal dice'
	},
	{
		key: 'toxic',
		name: 'Toxic',
		category: 'elemental',
		description: 'Radioactive toxic dice'
	},
	{
		key: 'gemstone',
		name: 'Gemstone',
		category: 'gem',
		description: 'Precious gemstone dice'
	},
	{
		key: 'wood',
		name: 'Wood',
		category: 'natural',
		description: 'Natural wooden dice'
	},
	{
		key: 'metal',
		name: 'Metal',
		category: 'metal',
		description: 'Sleek metallic dice'
	},
	{
		key: 'rock',
		name: 'Rock',
		category: 'stone',
		description: 'Stone rock dice'
	}
];

/**
 * Get all available dice themes
 * @returns {Array} Array of dice theme objects
 */
export function getAllDiceThemes() {
	return DICE_THEMES;
}

/**
 * Get a specific dice theme by key
 * @param {string} key - The dice theme key
 * @returns {Object|null} The dice theme object or null if not found
 */
export function getDiceTheme(key) {
	return DICE_THEMES.find(theme => theme.key === key) || null;
}

/**
 * Get dice themes by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of dice theme objects matching the category
 */
export function getDiceThemesByCategory(category) {
	return DICE_THEMES.filter(theme => theme.category === category);
}

/**
 * Get the default dice theme
 * @returns {Object} The default dice theme
 */
export function getDefaultDiceTheme() {
	return DICE_THEMES[0];
}
