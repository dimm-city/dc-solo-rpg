import { ttsService } from '$lib/services/tts/textToSpeech.js';

/**
 * Audio and gameplay auto-play settings store
 * Uses Svelte 5 runes for reactivity
 */

// Default settings
const DEFAULT_SETTINGS = {
	audio: {
		autoReadCards: false,
		autoReadPrompts: false,
		autoAnnounceRolls: false,
		readingSpeed: 'normal', // 'slow', 'normal', 'fast'
		ttsProvider: 'browser',
		ttsVoice: null
	},
	gameplay: {
		autoRollDice: false,
		autoContinueAfterReading: false,
		autoAdvanceDelay: 2000, // milliseconds (500-10000)
		autoHandleJournaling: 'manual', // 'manual', 'skip', 'timed'
		journalPauseTime: 10000 // milliseconds
	}
};

// Audio and gameplay settings state
let audioSettings = $state({
	...DEFAULT_SETTINGS.audio
});

let gameplaySettings = $state({
	...DEFAULT_SETTINGS.gameplay
});

// Current TTS state
let ttsState = $state({
	isSpeaking: false,
	currentText: null
});

/**
 * Initialize audio store
 * Loads settings from localStorage if available
 */
export function initializeAudioStore() {
	loadSettings();
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
	if (typeof window === 'undefined') return;

	try {
		const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
		if (saved) {
			const parsed = JSON.parse(saved);

			// Merge with defaults to handle new settings
			audioSettings = {
				...DEFAULT_SETTINGS.audio,
				...parsed.audio
			};

			gameplaySettings = {
				...DEFAULT_SETTINGS.gameplay,
				...parsed.gameplay
			};

			// Apply TTS settings
			ttsService.updateSettings({
				provider: audioSettings.ttsProvider,
				voice: audioSettings.ttsVoice,
				readingSpeed: audioSettings.readingSpeed
			});
		}
	} catch (error) {
		console.error('[AudioStore] Failed to load settings:', error);
	}
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
	if (typeof window === 'undefined') return;

	try {
		const toSave = {
			audio: { ...audioSettings },
			gameplay: { ...gameplaySettings }
		};
		localStorage.setItem('dc-solo-rpg-audio-settings', JSON.stringify(toSave));
	} catch (error) {
		console.error('[AudioStore] Failed to save settings:', error);
	}
}

/**
 * Update audio settings
 * @param {Object} updates - Settings to update
 */
export function updateAudioSettings(updates) {
	audioSettings = {
		...audioSettings,
		...updates
	};

	// Update TTS service
	ttsService.updateSettings({
		provider: audioSettings.ttsProvider,
		voice: audioSettings.ttsVoice,
		readingSpeed: audioSettings.readingSpeed
	});

	saveSettings();
}

/**
 * Update gameplay settings
 * @param {Object} updates - Settings to update
 */
export function updateGameplaySettings(updates) {
	gameplaySettings = {
		...gameplaySettings,
		...updates
	};

	saveSettings();
}

/**
 * Reset all settings to defaults
 */
export function resetSettings() {
	audioSettings = { ...DEFAULT_SETTINGS.audio };
	gameplaySettings = { ...DEFAULT_SETTINGS.gameplay };
	saveSettings();
}

/**
 * Speak text using TTS service
 * @param {string} text - Text to speak
 * @param {Object} options - Speaking options
 * @returns {Promise<void>}
 */
export async function speak(text, options = {}) {
	if (!text) return;

	try {
		ttsState.isSpeaking = true;
		ttsState.currentText = text;

		await ttsService.speak(text, options);

		ttsState.isSpeaking = false;
		ttsState.currentText = null;
	} catch (error) {
		console.error('[AudioStore] TTS error:', error);
		ttsState.isSpeaking = false;
		ttsState.currentText = null;
	}
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
	ttsService.stop();
	ttsState.isSpeaking = false;
	ttsState.currentText = null;
}

/**
 * Get available voices from current provider
 * @returns {Promise<Array>}
 */
export async function getAvailableVoices() {
	try {
		return await ttsService.getVoices();
	} catch (error) {
		console.error('[AudioStore] Failed to get voices:', error);
		return [];
	}
}

// Getter functions for reactive access
export function getAudioSettings() {
	return audioSettings;
}

export function getGameplaySettings() {
	return gameplaySettings;
}

export function getTTSState() {
	return ttsState;
}

export function isAutoPlayEnabled() {
	return (
		audioSettings.autoReadCards ||
		audioSettings.autoReadPrompts ||
		gameplaySettings.autoRollDice ||
		gameplaySettings.autoContinueAfterReading
	);
}
