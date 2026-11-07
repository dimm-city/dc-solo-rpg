import { ttsService } from '$lib/services/tts/textToSpeech.js';
import { logger } from '../utils/logger.js';
import { isReadAloudOn } from '../utils/playMode.js';

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
		// Per-provider settings (preserved when switching providers)
		providerSettings: {
			browser: {
				voice: null
			},
			openai: {
				apiKey: null,
				apiEndpoint: null,
				model: null,
				voice: null
			},
			elevenlabs: {
				apiKey: null,
				model: null,
				voice: null
			},
			dimmcityai: {
				apiKey: null,
				voice: null
			},
			supertonic: {
				voice: 'F1'
			}
		}
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
	...DEFAULT_SETTINGS.audio,
	providerSettings: {
		browser: { ...DEFAULT_SETTINGS.audio.providerSettings.browser },
		openai: { ...DEFAULT_SETTINGS.audio.providerSettings.openai },
		elevenlabs: { ...DEFAULT_SETTINGS.audio.providerSettings.elevenlabs },
		dimmcityai: { ...DEFAULT_SETTINGS.audio.providerSettings.dimmcityai },
		supertonic: { ...DEFAULT_SETTINGS.audio.providerSettings.supertonic }
	}
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
 * Get settings for the current provider
 * @returns {Object} Current provider's settings
 */
function getCurrentProviderSettings() {
	const provider = audioSettings.ttsProvider;
	return audioSettings.providerSettings[provider] || {};
}

/**
 * Update settings for a specific provider
 * @param {string} provider - Provider name
 * @param {Object} settings - Settings to update
 */
function updateProviderSettings(provider, settings) {
	if (!audioSettings.providerSettings[provider]) {
		audioSettings.providerSettings[provider] = {};
	}
	audioSettings.providerSettings[provider] = {
		...audioSettings.providerSettings[provider],
		...settings
	};
}

/**
 * Initialize audio store
 * Loads settings from localStorage if available
 */
export async function initializeAudioStore() {
	await loadSettings();
}

/**
 * Load settings from localStorage
 */
async function loadSettings() {
	if (typeof window === 'undefined') return;

	try {
		const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
		if (saved) {
			const parsed = JSON.parse(saved);

			// Track if migration occurred
			let didMigrate = false;

			// Migrate old format to new per-provider format
			if (parsed.audio && !parsed.audio.providerSettings) {
				didMigrate = true;
				logger.info('[AudioStore] Migrating settings to per-provider format');
				const oldProvider = parsed.audio.ttsProvider || 'browser';
				parsed.audio.providerSettings = {
					...DEFAULT_SETTINGS.audio.providerSettings
				};

				// Migrate old settings to the current provider
				if (oldProvider === 'openai') {
					parsed.audio.providerSettings.openai = {
						apiKey: parsed.audio.ttsApiKey,
						apiEndpoint: parsed.audio.ttsApiEndpoint,
						model: parsed.audio.ttsModel,
						voice: parsed.audio.ttsVoice
					};
				} else if (oldProvider === 'elevenlabs') {
					parsed.audio.providerSettings.elevenlabs = {
						apiKey: parsed.audio.ttsApiKey,
						model: parsed.audio.ttsModel,
						voice: parsed.audio.ttsVoice
					};
				} else if (oldProvider === 'dimmcityai') {
					parsed.audio.providerSettings.dimmcityai = {
						apiKey: parsed.audio.ttsApiKey,
						voice: parsed.audio.ttsVoice
					};
				} else if (oldProvider === 'browser') {
					parsed.audio.providerSettings.browser = {
						voice: parsed.audio.ttsVoice
					};
				} else if (oldProvider === 'supertonic') {
					parsed.audio.providerSettings.supertonic = {
						voice: parsed.audio.ttsVoice || 'F1'
					};
				}
			}

			// Merge with defaults to handle new settings (deep clone provider settings)
			const mergedProviderSettings = {};
			for (const provider of Object.keys(DEFAULT_SETTINGS.audio.providerSettings)) {
				mergedProviderSettings[provider] = {
					...DEFAULT_SETTINGS.audio.providerSettings[provider],
					...(parsed.audio.providerSettings?.[provider] || {})
				};
			}

			audioSettings = {
				...DEFAULT_SETTINGS.audio,
				...parsed.audio,
				providerSettings: mergedProviderSettings
			};

			gameplaySettings = {
				...DEFAULT_SETTINGS.gameplay,
				...parsed.gameplay
			};

			// Load the current provider's settings
			const currentProvider = audioSettings.ttsProvider;
			const providerConfig = getCurrentProviderSettings();

			// Set the TTS provider (if not default browser)
			if (currentProvider && currentProvider !== 'browser') {
				try {
					const config = {
						apiKey: providerConfig.apiKey,
						voice: providerConfig.voice,
						speed: audioSettings.readingSpeed
					};

					// Add endpoint if configured (for OpenAI-compatible providers)
					if (providerConfig.apiEndpoint) {
						config.apiEndpoint = providerConfig.apiEndpoint;
					}

					// Add model if configured (for OpenAI, ElevenLabs)
					if (providerConfig.model) {
						config.model = providerConfig.model;
					}

					await ttsService.setProvider(currentProvider, config);
				} catch (error) {
					logger.error('[AudioStore] Failed to set TTS provider on load:', error);
					// Fall back to browser TTS
					audioSettings.ttsProvider = 'browser';
				}
			}

			// Apply TTS settings
			ttsService.updateSettings({
				provider: audioSettings.ttsProvider,
				voice: providerConfig.voice,
				readingSpeed: audioSettings.readingSpeed,
				apiKey: providerConfig.apiKey,
				apiEndpoint: providerConfig.apiEndpoint
			});

			// Save settings back if migration occurred
			if (didMigrate) {
				logger.info('[AudioStore] Saving migrated settings');
				saveSettings();
			}
		}
	} catch (error) {
		logger.error('[AudioStore] Failed to load settings:', error);
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
		logger.error('[AudioStore] Failed to save settings:', error);
	}
}

/**
 * Update audio settings
 * @param {Object} updates - Settings to update
 */
export async function updateAudioSettings(updates) {
	const previousProvider = audioSettings.ttsProvider;
	const currentProvider = updates.ttsProvider || previousProvider;

	// Update provider-specific settings if provided
	const providerSpecificKeys = ['ttsApiKey', 'ttsVoice', 'ttsApiEndpoint', 'ttsModel'];
	const hasProviderSpecificUpdates = Object.keys(updates).some((key) =>
		providerSpecificKeys.includes(key)
	);

	if (hasProviderSpecificUpdates) {
		// Map update keys to provider settings
		const providerUpdates = {};
		if (updates.ttsApiKey !== undefined) providerUpdates.apiKey = updates.ttsApiKey;
		if (updates.ttsVoice !== undefined) providerUpdates.voice = updates.ttsVoice;
		if (updates.ttsApiEndpoint !== undefined) providerUpdates.apiEndpoint = updates.ttsApiEndpoint;
		if (updates.ttsModel !== undefined) providerUpdates.model = updates.ttsModel;

		// Update the provider's settings
		updateProviderSettings(currentProvider, providerUpdates);
	}

	// Update global audio settings (non-provider-specific)
	const globalUpdates = { ...updates };
	delete globalUpdates.ttsApiKey;
	delete globalUpdates.ttsVoice;
	delete globalUpdates.ttsApiEndpoint;
	delete globalUpdates.ttsModel;

	const wasReading = isReadAloudOn(audioSettings);
	audioSettings = {
		...audioSettings,
		...globalUpdates
	};
	// Read-aloud switched off mid-sentence: the voice stops, and whatever waits on it moves on
	if (wasReading && !isReadAloudOn(audioSettings)) stopNarration();

	// Check if provider changed
	const providerChanged = updates.ttsProvider && updates.ttsProvider !== previousProvider;

	if (providerChanged) {
		// Load settings for the new provider
		const newProviderConfig = getCurrentProviderSettings();
		logger.info(`[AudioStore] Switching to provider: ${currentProvider}`, newProviderConfig);
	}

	// Get current provider config (either newly set or existing)
	const providerConfig = getCurrentProviderSettings();

	// Check if we need to re-initialize the provider
	const needsReinitialization = providerChanged || hasProviderSpecificUpdates;

	if (needsReinitialization) {
		try {
			const config = {
				apiKey: providerConfig.apiKey,
				voice: providerConfig.voice,
				speed: audioSettings.readingSpeed
			};

			// Add endpoint if configured (for OpenAI-compatible providers)
			if (providerConfig.apiEndpoint) {
				config.apiEndpoint = providerConfig.apiEndpoint;
			}

			// Add model if configured (for OpenAI, ElevenLabs)
			if (providerConfig.model) {
				config.model = providerConfig.model;
			}

			await ttsService.setProvider(currentProvider, config);
			logger.info('[AudioStore] Re-initialized TTS provider:', currentProvider);
		} catch (error) {
			logger.error('[AudioStore] Failed to initialize TTS provider:', error);
			// Revert provider change on error
			if (providerChanged) {
				audioSettings.ttsProvider = previousProvider;
			}
			// Re-throw the error so the UI can handle it
			throw error;
		}
	}

	// Update TTS service settings
	ttsService.updateSettings({
		provider: audioSettings.ttsProvider,
		voice: providerConfig.voice,
		readingSpeed: audioSettings.readingSpeed,
		apiKey: providerConfig.apiKey,
		apiEndpoint: providerConfig.apiEndpoint
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

// ===== Narration: the speech in flight, and waiting for it =====
// The game waits for the voice in two places (the deal after Roll for Tasks, and a card that
// is read aloud) through awaitNarration(). A narration ends when the provider finishes
// (every provider resolves speak() when playback ends) or when stopNarration() cuts it off.

/** @type {{ done: Promise<void>, settle: () => void } | null} The speech in flight */
let narration = null;

/**
 * Speak text using TTS service
 * @param {string} text - Text to speak
 * @param {Object} options - Speaking options
 * @returns {Promise<void>} Resolves when the voice has finished (or was cut off)
 */
export async function speak(text, options = {}) {
	if (!text) return;

	const current = {};
	current.done = new Promise((resolve) => (current.settle = resolve));
	narration = current;
	ttsState.isSpeaking = true;
	ttsState.currentText = text;

	try {
		await ttsService.speak(text, options);
	} catch (error) {
		logger.error('[AudioStore] TTS error:', error);
	} finally {
		current.settle();
		// A later speak() (or a stop) may already have taken over
		if (narration === current) {
			narration = null;
			ttsState.isSpeaking = false;
			ttsState.currentText = null;
		}
	}
}

/** @returns {boolean} True while the voice is reading something */
export function isNarrating() {
	return narration !== null;
}

/**
 * Wait for the voice to fall silent.
 *
 * Resolves `true` once whatever is being read has ended (and nothing has taken its place), at
 * once when nothing is being read or read-aloud is off; `false` when cancelled. Cancelling
 * leaves the voice alone: it only stops the wait.
 *
 * @returns {{ promise: Promise<boolean>, cancel: () => void }}
 */
export function awaitNarration() {
	let cancelled = false;
	let cancel;
	const promise = new Promise((resolve) => {
		cancel = () => {
			cancelled = true;
			resolve(false);
		};
		// Chained: a narration that ends because another took over waits for that one too
		const waitFor = (current) => {
			if (!current) {
				resolve(true);
				return;
			}
			current.done.then(() => {
				if (!cancelled) waitFor(narration);
			});
		};
		waitFor(narration);
	});
	return { promise, cancel };
}

/**
 * Cut the voice off: whatever is being read stops, and anyone waiting on it moves on at once
 * (without waiting for the provider to report the stop).
 */
export function stopNarration() {
	const current = narration;
	narration = null;
	ttsState.isSpeaking = false;
	ttsState.currentText = null;
	try {
		ttsService.stop();
	} catch (error) {
		logger.error('[AudioStore] TTS stop error:', error);
	}
	current?.settle();
}

/**
 * Get available voices from current provider
 * @returns {Promise<Array>}
 */
export async function getAvailableVoices() {
	try {
		return await ttsService.getVoices();
	} catch (error) {
		logger.error('[AudioStore] Failed to get voices:', error);
		return [];
	}
}

// Getter functions for reactive access
export function getAudioSettings() {
	// Return flattened settings with current provider's settings merged in
	const providerConfig = getCurrentProviderSettings();
	return {
		...audioSettings,
		ttsApiKey: providerConfig.apiKey || null,
		ttsVoice: providerConfig.voice || null,
		ttsApiEndpoint: providerConfig.apiEndpoint || null,
		ttsModel: providerConfig.model || null
	};
}

export function getGameplaySettings() {
	return gameplaySettings;
}
