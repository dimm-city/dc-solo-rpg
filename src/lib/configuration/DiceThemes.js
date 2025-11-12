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
		name: 'Default (White)',
		category: 'standard',
		description: 'Classic white dice with black numbers'
	},
	{
		key: 'white',
		name: 'White',
		category: 'standard',
		description: 'Clean white dice'
	},
	{
		key: 'black',
		name: 'Black',
		category: 'standard',
		description: 'Classic black dice'
	},
	{
		key: 'pinkdreams',
		name: 'Pink Dreams',
		category: 'neon',
		description: 'Vibrant pink neon dice'
	},
	{
		key: 'radiant',
		name: 'Radiant',
		category: 'neon',
		description: 'Bright radiant colors'
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
		key: 'poison',
		name: 'Poison',
		category: 'elemental',
		description: 'Toxic poison dice'
	},
	{
		key: 'water',
		name: 'Water',
		category: 'elemental',
		description: 'Deep water blue dice'
	},
	{
		key: 'earth',
		name: 'Earth',
		category: 'elemental',
		description: 'Earthy stone dice'
	},
	{
		key: 'astralsea',
		name: 'Astral Sea',
		category: 'mystical',
		description: 'Cosmic astral sea colors'
	},
	{
		key: 'bloodmoon',
		name: 'Blood Moon',
		category: 'mystical',
		description: 'Dark blood moon red'
	},
	{
		key: 'starynight',
		name: 'Starry Night',
		category: 'mystical',
		description: 'Van Gogh inspired starry night'
	},
	{
		key: 'glitterparty',
		name: 'Glitter Party',
		category: 'festive',
		description: 'Sparkly glitter party dice'
	},
	{
		key: 'bronze',
		name: 'Bronze',
		category: 'metal',
		description: 'Ancient bronze metal'
	},
	{
		key: 'dragons',
		name: 'Dragons',
		category: 'fantasy',
		description: 'Dragon scale dice'
	},
	{
		key: 'tigerking',
		name: 'Tiger King',
		category: 'animal',
		description: 'Tiger stripe pattern'
	},
	{
		key: 'rainbow',
		name: 'Rainbow',
		category: 'festive',
		description: 'Colorful rainbow dice'
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
