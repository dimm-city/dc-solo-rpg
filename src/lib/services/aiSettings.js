/**
 * AI Settings Service
 * Manages API keys and AI provider settings using IndexedDB
 */
import { openDB } from 'idb';
import { logger } from '../utils/logger.js';

const DB_NAME = 'dc-solo-rpg';
const DB_VERSION = 2; // Bump version to add settings store
const SETTINGS_STORE = 'ai-settings';

/**
 * Initialize the IndexedDB database with settings store
 * @returns {Promise<IDBDatabase>} Database instance
 */
async function initDB() {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion, newVersion, transaction) {
			// Create settings object store if it doesn't exist
			if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
				db.createObjectStore(SETTINGS_STORE);
				logger.info('[aiSettings] Created ai-settings object store');
			}
		}
	});
}

/**
 * Save AI provider settings
 * @param {Object} settings - AI settings object
 * @param {string} settings.provider - 'openai' | 'anthropic' | 'custom'
 * @param {string} settings.apiKey - API key for the provider
 * @param {string} settings.model - Model to use (e.g., 'gpt-4', 'claude-3-5-sonnet-20241022')
 * @param {string} settings.customEndpoint - Custom API endpoint (for custom provider)
 * @returns {Promise<boolean>} Success status
 */
export async function saveAISettings(settings) {
	try {
		const db = await initDB();
		await db.put(SETTINGS_STORE, settings, 'ai-provider');
		logger.info('[aiSettings] AI provider settings saved');
		return true;
	} catch (error) {
		logger.error('[aiSettings] Failed to save AI settings:', error);
		return false;
	}
}

/**
 * Load AI provider settings
 * @returns {Promise<Object|null>} AI settings or null if not configured
 */
export async function loadAISettings() {
	try {
		const db = await initDB();
		const settings = await db.get(SETTINGS_STORE, 'ai-provider');
		return settings || null;
	} catch (error) {
		logger.error('[aiSettings] Failed to load AI settings:', error);
		return null;
	}
}

/**
 * Save TTS provider settings
 * @param {Object} settings - TTS settings object
 * @param {string} settings.provider - 'browser' | 'openai' | 'elevenlabs'
 * @param {string} settings.apiKey - API key (not needed for browser TTS)
 * @param {string} settings.voice - Voice ID or name
 * @param {Object} settings.options - Additional options (speed, pitch, etc.)
 * @returns {Promise<boolean>} Success status
 */
export async function saveTTSSettings(settings) {
	try {
		const db = await initDB();
		await db.put(SETTINGS_STORE, settings, 'tts-provider');
		logger.info('[aiSettings] TTS provider settings saved');
		return true;
	} catch (error) {
		logger.error('[aiSettings] Failed to save TTS settings:', error);
		return false;
	}
}

/**
 * Load TTS provider settings
 * @returns {Promise<Object|null>} TTS settings or default browser settings
 */
export async function loadTTSSettings() {
	try {
		const db = await initDB();
		const settings = await db.get(SETTINGS_STORE, 'tts-provider');

		// Return browser TTS as default if nothing is configured
		return settings || {
			provider: 'browser',
			voice: null, // Will use default system voice
			options: {
				rate: 1.0,
				pitch: 1.0,
				volume: 1.0
			}
		};
	} catch (error) {
		logger.error('[aiSettings] Failed to load TTS settings:', error);
		// Return default browser TTS on error
		return {
			provider: 'browser',
			voice: null,
			options: {
				rate: 1.0,
				pitch: 1.0,
				volume: 1.0
			}
		};
	}
}

/**
 * Check if AI provider is configured
 * @returns {Promise<boolean>} True if API key is configured
 */
export async function isAIConfigured() {
	try {
		const settings = await loadAISettings();
		return !!(settings && settings.apiKey && settings.provider);
	} catch (error) {
		logger.error('[aiSettings] Failed to check AI configuration:', error);
		return false;
	}
}

/**
 * Clear all AI settings
 * @returns {Promise<boolean>} Success status
 */
export async function clearAISettings() {
	try {
		const db = await initDB();
		await db.delete(SETTINGS_STORE, 'ai-provider');
		await db.delete(SETTINGS_STORE, 'tts-provider');
		logger.info('[aiSettings] All AI settings cleared');
		return true;
	} catch (error) {
		logger.error('[aiSettings] Failed to clear AI settings:', error);
		return false;
	}
}
