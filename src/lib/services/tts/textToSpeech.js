import { getProvider } from './providers/index.js';
import { logger } from '../../utils/logger.js';

/**
 * Reading speed mappings
 */
export const READING_SPEEDS = {
	slow: 0.75,
	normal: 1.0,
	fast: 1.5
};

/**
 * Main TTS service
 * Manages TTS provider and provides unified API
 */
class TTSService {
	constructor() {
		this.provider = null;
		this.currentProviderName = null;
		this.settings = {
			provider: 'browser',
			voice: null,
			readingSpeed: 'normal'
		};
	}

	/**
	 * Initialize or switch to a TTS provider
	 * @param {string} providerName - Name of provider to use
	 * @param {Object} config - Provider-specific configuration
	 */
	async setProvider(providerName, config = {}) {
		try {
			const ProviderClass = getProvider(providerName);
			const provider = new ProviderClass();

			// Check if supported
			if (!provider.isSupported()) {
				throw new Error(`TTS provider "${providerName}" is not supported in this environment`);
			}

			// Initialize provider
			await provider.initialize(config);

			// Stop current provider if exists
			if (this.provider) {
				this.provider.stop();
			}

			this.provider = provider;
			this.currentProviderName = providerName;
			this.settings.provider = providerName;

			return true;
		} catch (error) {
			logger.error('[TTS] Failed to set provider:', error);
			throw error;
		}
	}

	/**
	 * Ensure provider is initialized
	 * @private
	 */
	async _ensureProvider() {
		if (!this.provider) {
			await this.setProvider('browser');
		}
	}

	/**
	 * Speak text using current provider
	 * @param {string} text - Text to speak
	 * @param {Object} options - Speaking options
	 * @returns {Promise<void>}
	 */
	async speak(text, options = {}) {
		await this._ensureProvider();

		// Merge settings with options
		const speakOptions = {
			rate: READING_SPEEDS[this.settings.readingSpeed] || 1.0,
			voice: this.settings.voice,
			...options
		};

		return this.provider.speak(text, speakOptions);
	}

	/**
	 * Stop current speech
	 */
	stop() {
		if (this.provider) {
			this.provider.stop();
		}
	}

	/**
	 * Pause current speech
	 */
	pause() {
		if (this.provider) {
			this.provider.pause();
		}
	}

	/**
	 * Resume paused speech
	 */
	resume() {
		if (this.provider) {
			this.provider.resume();
		}
	}

	/**
	 * Check if currently speaking
	 */
	isSpeaking() {
		return this.provider ? this.provider.isSpeaking() : false;
	}

	/**
	 * Get available voices from current provider
	 */
	async getVoices() {
		await this._ensureProvider();
		return this.provider.getVoices();
	}

	/**
	 * Update settings
	 * @param {Object} settings - Settings to update
	 */
	updateSettings(settings) {
		this.settings = {
			...this.settings,
			...settings
		};
	}

	/**
	 * Get current settings
	 */
	getSettings() {
		return { ...this.settings };
	}

	/**
	 * Get current provider name
	 */
	getCurrentProvider() {
		return this.currentProviderName;
	}
}

// Export singleton instance
export const ttsService = new TTSService();

// Export class for testing
export { TTSService };
