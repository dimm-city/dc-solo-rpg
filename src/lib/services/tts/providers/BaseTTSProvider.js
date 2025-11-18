/**
 * Abstract base class for TTS providers
 * All TTS providers must extend this class and implement its methods
 */
export class BaseTTSProvider {
	/**
	 * Initialize the provider with configuration
	 * @param {Object} config - Provider-specific configuration
	 * @returns {Promise<void>}
	 */
	async initialize(config) {
		throw new Error('initialize() must be implemented by subclass');
	}

	/**
	 * Speak the given text
	 * @param {string} text - Text to speak
	 * @param {Object} options - Speaking options (rate, pitch, voice, etc.)
	 * @returns {Promise<void>} - Resolves when speaking completes
	 */
	async speak(text, options = {}) {
		throw new Error('speak() must be implemented by subclass');
	}

	/**
	 * Stop current speech
	 * @returns {void}
	 */
	stop() {
		throw new Error('stop() must be implemented by subclass');
	}

	/**
	 * Pause current speech
	 * @returns {void}
	 */
	pause() {
		throw new Error('pause() must be implemented by subclass');
	}

	/**
	 * Resume paused speech
	 * @returns {void}
	 */
	resume() {
		throw new Error('resume() must be implemented by subclass');
	}

	/**
	 * Check if provider is currently speaking
	 * @returns {boolean}
	 */
	isSpeaking() {
		throw new Error('isSpeaking() must be implemented by subclass');
	}

	/**
	 * Get available voices for this provider
	 * @returns {Promise<Array<{id: string, name: string, language: string}>>}
	 */
	async getVoices() {
		throw new Error('getVoices() must be implemented by subclass');
	}

	/**
	 * Get provider display name
	 * @returns {string}
	 */
	getName() {
		throw new Error('getName() must be implemented by subclass');
	}

	/**
	 * Check if provider is available/supported
	 * @returns {boolean}
	 */
	isSupported() {
		return true; // Override in subclass if needed
	}

	/**
	 * Sanitize text before speaking (remove markdown, clean up formatting)
	 * @param {string} text - Raw text
	 * @returns {string} - Sanitized text
	 */
	sanitizeText(text) {
		if (!text) return '';

		return (
			text
				// Remove markdown headers
				.replace(/^#{1,6}\s+/gm, '')
				// Remove markdown bold/italic
				.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
				// Remove markdown links but keep text
				.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
				// Remove HTML tags
				.replace(/<[^>]+>/g, '')
				// Normalize whitespace
				.replace(/\s+/g, ' ')
				.trim()
		);
	}
}
