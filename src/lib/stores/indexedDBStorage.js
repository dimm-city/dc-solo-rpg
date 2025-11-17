/**
 * IndexedDB Storage for DC Solo RPG
 * Handles persisting game state and audio data using IndexedDB
 * Replaces localStorage to support larger audio recordings
 */
import { openDB } from 'idb';
import { logger } from '../utils/logger.js';

const DB_NAME = 'dc-solo-rpg';
const DB_VERSION = 1;
const SAVE_STORE = 'saves';
const AUDIO_STORE = 'audio';
const SAVE_VERSION = '2.0'; // Bumped from 1.0 to indicate IndexedDB migration

/**
 * Initialize the IndexedDB database
 * @returns {Promise<IDBDatabase>} Database instance
 */
async function initDB() {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion, newVersion, transaction) {
			// Create saves object store if it doesn't exist
			if (!db.objectStoreNames.contains(SAVE_STORE)) {
				db.createObjectStore(SAVE_STORE);
				logger.info('[initDB] Created saves object store');
			}

			// Create audio object store if it doesn't exist
			if (!db.objectStoreNames.contains(AUDIO_STORE)) {
				db.createObjectStore(AUDIO_STORE);
				logger.info('[initDB] Created audio object store');
			}
		}
	});
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
 * Convert base64 audio data to Blob
 * @param {string} base64Data - Base64 encoded audio data
 * @returns {Promise<Blob>} Audio blob
 */
async function base64ToBlob(base64Data) {
	// Extract the base64 content (remove data:audio/webm;base64, prefix)
	const base64Content = base64Data.split(',')[1];
	const mimeMatch = base64Data.match(/data:([^;]+);/);
	const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';

	// Decode base64 to binary
	const binaryString = atob(base64Content);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return new Blob([bytes], { type: mimeType });
}

/**
 * Convert Blob to base64 for backward compatibility
 * @param {Blob} blob - Audio blob
 * @returns {Promise<string>} Base64 encoded string
 */
async function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

/**
 * Get the serializable portion of game state
 * @param {object} gameState - Current game state
 * @returns {object} Serializable state (without audio data)
 */
function getSerializableState(gameState) {
	// Clone journal entries without audio data
	const journalEntriesWithoutAudio = gameState.journalEntries.map((entry) => {
		const { audioData, ...entryWithoutAudio } = entry;
		return {
			...entryWithoutAudio,
			hasAudio: !!audioData // Flag to indicate audio exists
		};
	});

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

		// Completion metadata (for story mode)
		isWon: gameState.win,
		finalTower: gameState.tower,
		roundsSurvived: gameState.round,
		gameTitle: gameState.config?.title || 'Unknown Game',
		lastPlayed: new Date().toISOString(),
		cardLog: gameState.log || [],

		// Journal (without audio data)
		journalEntries: journalEntriesWithoutAudio,

		// Config (excluding functions)
		config: {
			...gameState.config,
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
 * Save game state to IndexedDB
 * @param {object} gameState - Current game state to save
 * @returns {Promise<boolean>} Success status
 */
export async function saveGame(gameState) {
	try {
		// Only save if game is in progress OR completed (include gameOver for completion tracking)
		const validStatesForSaving = [
			'showIntro',
			'startRound',
			'rollForTasks',
			'drawCard',
			'failureCheck',
			'log',
			'successCheck',
			'finalDamageRoll',
			'gameOver' // Include to save completed games
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

		const db = await initDB();

		// Save game state (without audio data)
		const saveData = getSerializableState(gameState);

		// Ensure data is fully serializable by doing a JSON round-trip
		// This removes functions and non-cloneable objects that IndexedDB can't handle
		const cleanedSaveData = JSON.parse(JSON.stringify(saveData));

		await db.put(SAVE_STORE, cleanedSaveData, gameSlug);

		// Save audio data separately as Blobs (keyed by round number)
		const audioData = {};
		for (const entry of gameState.journalEntries) {
			if (entry.audioData) {
				// Convert base64 to Blob for efficient storage
				const audioBlob = await base64ToBlob(entry.audioData);
				// Use round number as key (more reliable than id)
				audioData[entry.round] = audioBlob;
			}
		}

		if (Object.keys(audioData).length > 0) {
			await db.put(AUDIO_STORE, audioData, gameSlug);
			logger.info(`[saveGame] Saved ${Object.keys(audioData).length} audio recordings`);
		}

		logger.info(`[saveGame] Game saved successfully for ${gameSlug}`);
		return true;
	} catch (error) {
		logger.error('[saveGame] Failed to save game:', error);
		return false;
	}
}

/**
 * Load game state from IndexedDB
 * @param {string} gameSlug - Game slug or identifier
 * @returns {Promise<object|null>} Loaded game state or null if no save exists
 */
export async function loadGame(gameSlug) {
	try {
		const db = await initDB();

		// Load game state
		const saveData = await db.get(SAVE_STORE, gameSlug);
		if (!saveData) {
			logger.debug(`[loadGame] No saved game found for ${gameSlug}`);
			return null;
		}

		// Version check (for future compatibility)
		if (saveData.version !== SAVE_VERSION) {
			logger.warn('[loadGame] Save version mismatch, clearing old save');
			await clearSave(gameSlug);
			return null;
		}

		// Load audio data
		const audioData = (await db.get(AUDIO_STORE, gameSlug)) || {};

		// Restore audio data to journal entries
		if (saveData.journalEntries) {
			saveData.journalEntries = await Promise.all(
				saveData.journalEntries.map(async (entry) => {
					if (entry.hasAudio && audioData[entry.round]) {
						// Convert Blob back to base64 for compatibility with current component
						const base64 = await blobToBase64(audioData[entry.round]);
						return { ...entry, audioData: base64 };
					}
					return entry;
				})
			);
		}

		logger.info(`[loadGame] Game loaded successfully for ${gameSlug} from`, saveData.timestamp);
		return saveData;
	} catch (error) {
		logger.error('[loadGame] Failed to load game:', error);
		// Clear corrupted save
		await clearSave(gameSlug);
		return null;
	}
}

/**
 * Check if a saved game exists
 * @param {string} gameSlug - Game slug or identifier
 * @returns {Promise<boolean>} True if a save exists
 */
export async function hasSavedGame(gameSlug) {
	try {
		const db = await initDB();
		const saveData = await db.get(SAVE_STORE, gameSlug);
		return saveData !== undefined;
	} catch (error) {
		logger.error('[hasSavedGame] Error checking for saved game:', error);
		return false;
	}
}

/**
 * Get saved game metadata without loading full state
 * @param {string} gameSlug - Game slug or identifier
 * @returns {Promise<object|null>} Save metadata (timestamp, playerName, etc.)
 */
export async function getSaveMetadata(gameSlug) {
	try {
		const db = await initDB();
		const saveData = await db.get(SAVE_STORE, gameSlug);

		if (!saveData) {
			return null;
		}

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
 * Load all saved games from IndexedDB
 * @returns {Promise<Array>} Array of all saved games
 */
export async function loadAllSaves() {
	try {
		const db = await initDB();
		const allKeys = await db.getAllKeys(SAVE_STORE);
		const allSaves = [];

		for (const key of allKeys) {
			const saveData = await db.get(SAVE_STORE, key);
			if (saveData) {
				// Load audio data if it exists
				const audioData = await db.get(AUDIO_STORE, key);

				// Reattach audio data to journal entries
				if (audioData && saveData.journalEntries) {
					for (const entry of saveData.journalEntries) {
						if (entry.hasAudio && audioData[entry.round]) {
							// Convert Blob back to base64 for audio player
							entry.audioData = await blobToBase64(audioData[entry.round]);
						}
					}
				}

				allSaves.push({
					id: key,
					...saveData
				});
			}
		}

		logger.info(`[loadAllSaves] Loaded ${allSaves.length} saves with audio data`);
		return allSaves;
	} catch (error) {
		logger.error('[loadAllSaves] Failed to load all saves:', error);
		return [];
	}
}

/**
 * Clear saved game from IndexedDB
 * @param {string} gameSlug - Game slug or identifier
 * @returns {Promise<boolean>} Success status
 */
export async function clearSave(gameSlug) {
	try {
		const db = await initDB();
		await db.delete(SAVE_STORE, gameSlug);
		await db.delete(AUDIO_STORE, gameSlug);
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

/**
 * Get storage statistics
 * @returns {Promise<object>} Storage usage information
 */
export async function getStorageStats() {
	try {
		if (navigator.storage && navigator.storage.estimate) {
			const estimate = await navigator.storage.estimate();
			return {
				usage: estimate.usage,
				quota: estimate.quota,
				percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2),
				available: estimate.quota - estimate.usage
			};
		}
		return null;
	} catch (error) {
		logger.error('[getStorageStats] Failed to get storage stats:', error);
		return null;
	}
}

/**
 * Migrate localStorage saves to IndexedDB
 * @returns {Promise<number>} Number of saves migrated
 */
export async function migrateFromLocalStorage() {
	try {
		const SAVE_KEY_PREFIX = 'dc-solo-rpg-save';
		let migratedCount = 0;

		// Find all localStorage keys that match the save pattern
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(SAVE_KEY_PREFIX)) {
				const gameSlug = key.replace(`${SAVE_KEY_PREFIX}-`, '');
				const saveData = localStorage.getItem(key);

				if (saveData) {
					try {
						const parsed = JSON.parse(saveData);
						const db = await initDB();

						// Update version to new format
						parsed.version = SAVE_VERSION;

						// Ensure data is fully serializable (should already be, but double-check)
						const cleanedData = JSON.parse(JSON.stringify(parsed));

						// Save to IndexedDB
						await db.put(SAVE_STORE, cleanedData, gameSlug);
						migratedCount++;

						logger.info(`[migrateFromLocalStorage] Migrated save for ${gameSlug}`);
					} catch (err) {
						logger.error(`[migrateFromLocalStorage] Failed to migrate ${gameSlug}:`, err);
					}
				}
			}
		}

		if (migratedCount > 0) {
			logger.info(`[migrateFromLocalStorage] Successfully migrated ${migratedCount} saves`);
		}

		return migratedCount;
	} catch (error) {
		logger.error('[migrateFromLocalStorage] Migration failed:', error);
		return 0;
	}
}

/**
 * Clear old localStorage saves (after migration)
 * @returns {Promise<number>} Number of localStorage saves cleared
 */
export async function clearLocalStorageSaves() {
	try {
		const SAVE_KEY_PREFIX = 'dc-solo-rpg-save';
		let clearedCount = 0;
		const keysToRemove = [];

		// Collect all keys to remove
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(SAVE_KEY_PREFIX)) {
				keysToRemove.push(key);
			}
		}

		// Remove them
		for (const key of keysToRemove) {
			localStorage.removeItem(key);
			clearedCount++;
		}

		if (clearedCount > 0) {
			logger.info(`[clearLocalStorageSaves] Cleared ${clearedCount} localStorage saves`);
		}

		return clearedCount;
	} catch (error) {
		logger.error('[clearLocalStorageSaves] Failed to clear localStorage:', error);
		return 0;
	}
}
