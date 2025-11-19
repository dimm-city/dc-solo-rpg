import { browser } from '$app/environment';
import { logger } from '../utils/logger.js';

/**
 * Settings store with localStorage persistence
 * Manages global user preferences for the game
 * Note: Difficulty is controlled by game config, not user settings
 */

const SETTINGS_KEY = 'gameSettings';

// Default settings
const DEFAULT_SETTINGS = {
	diceTheme: 'default'
};

/**
 * Load settings from localStorage
 * @returns {object} Settings object
 */
function loadSettings() {
	if (!browser) {
		return { ...DEFAULT_SETTINGS };
	}

	try {
		const stored = localStorage.getItem(SETTINGS_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				diceTheme: parsed.diceTheme ?? DEFAULT_SETTINGS.diceTheme
			};
		}
	} catch (e) {
		logger.error('Failed to load settings from localStorage:', e);
	}

	return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 * @param {object} settings - Settings to save
 */
function saveSettings(settings) {
	if (!browser) return;

	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch (e) {
		logger.error('Failed to save settings to localStorage:', e);
	}
}

// Initialize settings state
let settings = $state(loadSettings());

/**
 * Update settings and persist to localStorage
 * @param {object} newSettings - New settings to apply
 */
export function updateSettings(newSettings) {
	// Mutate properties instead of reassigning
	Object.assign(settings, newSettings);
	saveSettings(settings);
}

/**
 * Get current settings
 * @returns {object} Current settings
 */
export function getSettings() {
	return { ...settings };
}

/**
 * Get dice theme setting
 * @returns {string} Current dice theme
 */
export function getDiceTheme() {
	return settings.diceTheme;
}

/**
 * Reset settings to defaults
 */
export function resetSettings() {
	// Mutate properties instead of reassigning
	Object.assign(settings, DEFAULT_SETTINGS);
	saveSettings(settings);
}

/**
 * Export a getter function for reactive access to settings
 * @returns {object} Current settings state
 */
export function getSettingsState() {
	return settings;
}
