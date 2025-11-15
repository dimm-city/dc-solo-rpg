/**
 * Game save/load utilities
 * Handles persisting game state to localStorage
 * Saves are stored per-game using the game's slug/config URL
 */
import { logger } from '../utils/logger.js';

const SAVE_KEY_PREFIX = 'dc-solo-rpg-save';
const SAVE_VERSION = '1.0';

/**
 * Get the save key for a specific game
 * @param {string} gameSlug - Game slug or identifier
 * @returns {string} localStorage key
 */
function getSaveKey(gameSlug) {
	if (!gameSlug) {
		throw new Error('gameSlug is required for save operations');
	}
	return `${SAVE_KEY_PREFIX}-${gameSlug}`;
}

/**
 * Get the serializable portion of game state
 * @param {object} gameState - Current game state
 * @returns {object} Serializable state
 */
function getSerializableState(gameState) {
	return {
		version: SAVE_VERSION,
		timestamp: new Date().toISOString(),

		// Core state
		state: gameState.state,
		playerName: gameState.playerName,
		tower: gameState.tower,
		tokens: gameState.tokens,

		// Round state
		round: gameState.round,
		cardsToDraw: gameState.cardsToDraw,
		cardsDrawn: gameState.cardsDrawn,

		// Card state
		deck: gameState.deck,
		discard: gameState.discard,
		log: gameState.log,
		currentCard: gameState.currentCard,

		// Roll state
		diceRoll: gameState.diceRoll,

		// King tracking
		kingsRevealed: gameState.kingsRevealed,
		kingOfHearts: gameState.kingOfHearts,
		kingOfDiamonds: gameState.kingOfDiamonds,
		kingOfClubs: gameState.kingOfClubs,
		kingOfSpades: gameState.kingOfSpades,

		// Ace tracking
		aceOfHeartsRevealed: gameState.aceOfHeartsRevealed,

		// Game over state
		gameOver: gameState.gameOver,
		win: gameState.win,
		bonus: gameState.bonus,

		// Journal
		journalEntries: gameState.journalEntries,

		// Config (excluding functions)
		config: {
			...gameState.config,
			// Make sure to save options including difficulty and diceTheme
			options: gameState.config?.options || {}
		},

		// Original config for restart (excluding functions)
		originalConfig: {
			...gameState.originalConfig,
			options: gameState.originalConfig?.options || {}
		},

		// System config
		systemConfig: gameState.systemConfig,

		// Stylesheet
		stylesheet: gameState.stylesheet,

		// UI state
		status: gameState.status,
		player: gameState.player
	};
}

/**
 * Get game slug from config
 * @param {object} gameState - Game state
 * @returns {string|null} Game slug
 */
function getGameSlug(gameState) {
	// Try to get slug from config
	if (gameState.config?.slug) {
		return gameState.config.slug;
	}
	// Fallback to extracting from systemConfig URL
	if (gameState.systemConfig?.gameConfigUrl) {
		const match = gameState.systemConfig.gameConfigUrl.match(/\/games\/([^/]+)\//);
		if (match) {
			return match[1];
		}
	}
	// Fallback to game title as slug (normalized)
	if (gameState.config?.title) {
		return gameState.config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	}
	return null;
}

/**
 * Save game state to localStorage
 * @param {object} gameState - Current game state to save
 * @returns {boolean} Success status
 */
export function saveGame(gameState) {
	try {
		// Only save if game is in progress (not on initial screens or game over)
		const validStatesForSaving = [
			'showIntro',
			'startRound',
			'rollForTasks',
			'drawCard',
			'failureCheck',
			'log',
			'successCheck',
			'finalDamageRoll'
		];

		if (!validStatesForSaving.includes(gameState.state)) {
			logger.debug('[saveGame] Skipping save - not in a valid game state:', gameState.state);
			return false;
		}

		const gameSlug = getGameSlug(gameState);
		if (!gameSlug) {
			logger.error('[saveGame] Cannot determine game slug for save');
			return false;
		}

		const saveData = getSerializableState(gameState);
		const serialized = JSON.stringify(saveData);
		const saveKey = getSaveKey(gameSlug);

		localStorage.setItem(saveKey, serialized);
		logger.info(`[saveGame] Game saved successfully for ${gameSlug}`);
		return true;
	} catch (error) {
		logger.error('[saveGame] Failed to save game:', error);
		return false;
	}
}

/**
 * Load game state from localStorage
 * @param {string} gameSlug - Game slug or identifier
 * @returns {object|null} Loaded game state or null if no save exists
 */
export function loadGame(gameSlug) {
	try {
		const saveKey = getSaveKey(gameSlug);
		const serialized = localStorage.getItem(saveKey);

		if (!serialized) {
			logger.debug(`[loadGame] No saved game found for ${gameSlug}`);
			return null;
		}

		const saveData = JSON.parse(serialized);

		// Version check (for future compatibility)
		if (saveData.version !== SAVE_VERSION) {
			logger.warn('[loadGame] Save version mismatch, clearing old save');
			clearSave(gameSlug);
			return null;
		}

		logger.info(`[loadGame] Game loaded successfully for ${gameSlug} from`, saveData.timestamp);
		return saveData;
	} catch (error) {
		logger.error('[loadGame] Failed to load game:', error);
		// Clear corrupted save
		clearSave(gameSlug);
		return null;
	}
}

/**
 * Check if a saved game exists
 * @param {string} gameSlug - Game slug or identifier
 * @returns {boolean} True if a save exists
 */
export function hasSavedGame(gameSlug) {
	try {
		const saveKey = getSaveKey(gameSlug);
		const serialized = localStorage.getItem(saveKey);
		return serialized !== null;
	} catch (error) {
		logger.error('[hasSavedGame] Error checking for saved game:', error);
		return false;
	}
}

/**
 * Get saved game metadata without loading full state
 * @param {string} gameSlug - Game slug or identifier
 * @returns {object|null} Save metadata (timestamp, playerName, etc.)
 */
export function getSaveMetadata(gameSlug) {
	try {
		const saveKey = getSaveKey(gameSlug);
		const serialized = localStorage.getItem(saveKey);

		if (!serialized) {
			return null;
		}

		const saveData = JSON.parse(serialized);

		return {
			timestamp: saveData.timestamp,
			playerName: saveData.playerName,
			round: saveData.round,
			tower: saveData.tower,
			tokens: saveData.tokens,
			version: saveData.version,
			gameTitle: saveData.config?.title || 'Unknown Game'
		};
	} catch (error) {
		logger.error('[getSaveMetadata] Failed to get save metadata:', error);
		return null;
	}
}

/**
 * Clear saved game from localStorage
 * @param {string} gameSlug - Game slug or identifier
 * @returns {boolean} Success status
 */
export function clearSave(gameSlug) {
	try {
		const saveKey = getSaveKey(gameSlug);
		localStorage.removeItem(saveKey);
		logger.info(`[clearSave] Saved game cleared for ${gameSlug}`);
		return true;
	} catch (error) {
		logger.error('[clearSave] Failed to clear save:', error);
		return false;
	}
}

/**
 * Restore game state from a save object
 * @param {object} gameState - Game state object to restore into
 * @param {object} saveData - Save data to restore from
 */
export function restoreGameState(gameState, saveData) {
	try {
		// Restore all saved properties
		Object.assign(gameState, {
			state: saveData.state,
			playerName: saveData.playerName,
			tower: saveData.tower,
			tokens: saveData.tokens,
			round: saveData.round,
			cardsToDraw: saveData.cardsToDraw,
			cardsDrawn: saveData.cardsDrawn,
			deck: saveData.deck,
			discard: saveData.discard,
			log: saveData.log,
			currentCard: saveData.currentCard,
			diceRoll: saveData.diceRoll,
			kingsRevealed: saveData.kingsRevealed,
			kingOfHearts: saveData.kingOfHearts,
			kingOfDiamonds: saveData.kingOfDiamonds,
			kingOfClubs: saveData.kingOfClubs,
			kingOfSpades: saveData.kingOfSpades,
			aceOfHeartsRevealed: saveData.aceOfHeartsRevealed,
			gameOver: saveData.gameOver,
			win: saveData.win,
			bonus: saveData.bonus,
			journalEntries: saveData.journalEntries,
			config: saveData.config,
			originalConfig: saveData.originalConfig,
			systemConfig: saveData.systemConfig,
			stylesheet: saveData.stylesheet,
			status: saveData.status,
			player: saveData.player
		});

		logger.info('[restoreGameState] Game state restored successfully');
		return true;
	} catch (error) {
		logger.error('[restoreGameState] Failed to restore game state:', error);
		return false;
	}
}
