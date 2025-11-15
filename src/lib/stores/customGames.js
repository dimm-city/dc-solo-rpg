/**
 * Custom games storage utilities
 * Handles storing and managing user-uploaded .game.md files in localStorage
 */
import { logger } from '../utils/logger.js';
import { parseGameFile, ValidationError } from '../parsers/markdownParser.js';

const CUSTOM_GAMES_KEY = 'dc-solo-rpg-custom-games';
const STORAGE_VERSION = '1.0';

/**
 * Format introduction sections into markdown
 * @param {Array} sections - Introduction sections
 * @returns {string} Formatted markdown
 */
function formatIntroduction(sections) {
	return sections.map((section) => `## ${section.heading}\n\n${section.content}`).join('\n\n');
}

/**
 * Convert parsed game to internal game config format
 * @param {object} parsed - Parsed game from markdownParser
 * @param {string} slug - Game slug
 * @returns {object} Game configuration
 */
function convertToGameConfig(parsed, slug) {
	return {
		slug,
		title: parsed.title,
		subtitle: parsed.subtitle,
		labels: {
			successCheckWin: parsed['win-message'],
			failureCheckLoss: parsed['lose-message'],
			failureCounterLoss: parsed['lose-message']
		},
		deck: parsed.deck,
		introduction: formatIntroduction(parsed.introduction),
		loaded: true,
		isCustom: true, // Flag to identify custom uploaded games
		metadata: {
			...parsed.metadata,
			uploadedAt: new Date().toISOString()
		}
	};
}

/**
 * Get all custom games from localStorage
 * @returns {Array<object>} Array of custom game configs
 */
export function getCustomGames() {
	try {
		const data = localStorage.getItem(CUSTOM_GAMES_KEY);
		if (!data) {
			return [];
		}

		const stored = JSON.parse(data);

		// Version check
		if (stored.version !== STORAGE_VERSION) {
			logger.warn('[getCustomGames] Version mismatch, clearing old custom games');
			clearCustomGames();
			return [];
		}

		return stored.games || [];
	} catch (error) {
		logger.error('[getCustomGames] Failed to load custom games:', error);
		return [];
	}
}

/**
 * Save custom games to localStorage
 * @param {Array<object>} games - Array of game configs
 * @returns {boolean} Success status
 */
function saveCustomGames(games) {
	try {
		const data = {
			version: STORAGE_VERSION,
			games,
			updated: new Date().toISOString()
		};

		localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(data));
		logger.info(`[saveCustomGames] Saved ${games.length} custom games`);
		return true;
	} catch (error) {
		logger.error('[saveCustomGames] Failed to save custom games:', error);
		return false;
	}
}

/**
 * Add a custom game from uploaded file content
 * @param {string} markdown - Raw markdown content from file
 * @param {string} filename - Original filename
 * @returns {{success: boolean, gameConfig?: object, error?: string}}
 */
export function addCustomGame(markdown, filename) {
	try {
		// Parse the game file
		const parsed = parseGameFile(markdown);

		// Create slug from filename or title
		const slug =
			filename
				.replace('.game.md', '')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-') ||
			parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

		// Convert to game config
		const gameConfig = convertToGameConfig(parsed, slug);

		// Get existing custom games
		const customGames = getCustomGames();

		// Check if game with this slug already exists
		const existingIndex = customGames.findIndex((g) => g.slug === slug);
		if (existingIndex >= 0) {
			// Update existing game
			customGames[existingIndex] = gameConfig;
			logger.info(`[addCustomGame] Updated existing custom game: ${slug}`);
		} else {
			// Add new game
			customGames.push(gameConfig);
			logger.info(`[addCustomGame] Added new custom game: ${slug}`);
		}

		// Save to localStorage
		if (saveCustomGames(customGames)) {
			return { success: true, gameConfig };
		} else {
			return { success: false, error: 'Failed to save game to storage' };
		}
	} catch (error) {
		if (error instanceof ValidationError) {
			logger.error('[addCustomGame] Validation error:', error.errors);
			return { success: false, error: error.message };
		}
		logger.error('[addCustomGame] Parse error:', error);
		return { success: false, error: `Failed to parse game file: ${error.message}` };
	}
}

/**
 * Remove a custom game by slug
 * @param {string} slug - Game slug
 * @returns {boolean} Success status
 */
export function removeCustomGame(slug) {
	try {
		const customGames = getCustomGames();
		const filtered = customGames.filter((g) => g.slug !== slug);

		if (filtered.length === customGames.length) {
			logger.warn(`[removeCustomGame] Game not found: ${slug}`);
			return false;
		}

		saveCustomGames(filtered);
		logger.info(`[removeCustomGame] Removed custom game: ${slug}`);
		return true;
	} catch (error) {
		logger.error('[removeCustomGame] Failed to remove custom game:', error);
		return false;
	}
}

/**
 * Get a specific custom game by slug
 * @param {string} slug - Game slug
 * @returns {object|null} Game config or null if not found
 */
export function getCustomGame(slug) {
	const customGames = getCustomGames();
	return customGames.find((g) => g.slug === slug) || null;
}

/**
 * Clear all custom games
 * @returns {boolean} Success status
 */
export function clearCustomGames() {
	try {
		localStorage.removeItem(CUSTOM_GAMES_KEY);
		logger.info('[clearCustomGames] Cleared all custom games');
		return true;
	} catch (error) {
		logger.error('[clearCustomGames] Failed to clear custom games:', error);
		return false;
	}
}

/**
 * Check if a custom game exists
 * @param {string} slug - Game slug
 * @returns {boolean} True if game exists
 */
export function hasCustomGame(slug) {
	return getCustomGame(slug) !== null;
}
