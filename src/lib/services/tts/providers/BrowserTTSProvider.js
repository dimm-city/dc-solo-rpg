import { BaseTTSProvider } from './BaseTTSProvider.js';

/**
 * Browser TTS provider using Web Speech API
 * Free, works offline, voice quality varies by OS/browser
 */
export class BrowserTTSProvider extends BaseTTSProvider {
	constructor() {
		super();
		this.synthesis = null;
		this.currentUtterance = null;
		this.config = {};
	}

	/**
	 * Initialize the provider
	 */
	async initialize(config = {}) {
		if (typeof window === 'undefined' || !window.speechSynthesis) {
			throw new Error('Web Speech API not supported in this environment');
		}

		this.synthesis = window.speechSynthesis;
		this.config = {
			rate: config.rate || 1.0,
			pitch: config.pitch || 1.0,
			volume: config.volume || 1.0,
			voice: config.voice || null
		};

		// Wait for voices to load (some browsers load them asynchronously)
		await this._waitForVoices();
	}

	/**
	 * Wait for voices to be available
	 * @private
	 */
	_waitForVoices() {
		return new Promise((resolve) => {
			const voices = this.synthesis.getVoices();
			if (voices.length > 0) {
				resolve();
				return;
			}

			// Voices not loaded yet, wait for event
			this.synthesis.addEventListener('voiceschanged', () => resolve(), { once: true });

			// Fallback timeout
			setTimeout(() => resolve(), 1000);
		});
	}

	/**
	 * Speak the given text
	 * @param {string} text - Text to speak
	 * @param {Object} options - Speaking options
	 * @returns {Promise<void>}
	 */
	async speak(text, options = {}) {
		if (!text) {
			return Promise.resolve();
		}

		// Stop any current speech
		this.stop();

		// Sanitize text
		const cleanText = this.sanitizeText(text);
		if (!cleanText) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const utterance = new SpeechSynthesisUtterance(cleanText);

			// Apply settings
			utterance.rate = options.rate || this.config.rate;
			utterance.pitch = options.pitch || this.config.pitch;
			utterance.volume = options.volume || this.config.volume;

			// Set voice if specified
			const voice = options.voice || this.config.voice;
			if (voice) {
				const voices = this.synthesis.getVoices();
				const selectedVoice = voices.find((v) => v.name === voice || v.voiceURI === voice);
				if (selectedVoice) {
					utterance.voice = selectedVoice;
				}
			}

			// Event handlers
			utterance.onend = () => {
				this.currentUtterance = null;
				resolve();
			};

			utterance.onerror = (event) => {
				this.currentUtterance = null;
				// Don't reject on interruption, cancellation, or permission errors
				// These are expected and shouldn't break auto-play flow
				if (
					event.error === 'interrupted' ||
					event.error === 'canceled' ||
					event.error === 'not-allowed'
				) {
					resolve();
				} else {
					reject(new Error(`TTS error: ${event.error}`));
				}
			};

			this.currentUtterance = utterance;
			this.synthesis.speak(utterance);
		});
	}

	/**
	 * Stop current speech
	 */
	stop() {
		if (this.synthesis) {
			this.synthesis.cancel();
			this.currentUtterance = null;
		}
	}

	/**
	 * Pause current speech
	 */
	pause() {
		if (this.synthesis && this.synthesis.speaking) {
			this.synthesis.pause();
		}
	}

	/**
	 * Resume paused speech
	 */
	resume() {
		if (this.synthesis && this.synthesis.paused) {
			this.synthesis.resume();
		}
	}

	/**
	 * Check if provider is currently speaking
	 */
	isSpeaking() {
		return this.synthesis ? this.synthesis.speaking : false;
	}

	/**
	 * Get available voices
	 */
	async getVoices() {
		if (!this.synthesis) {
			return [];
		}

		await this._waitForVoices();

		const voices = this.synthesis.getVoices();
		return voices.map((voice) => ({
			id: voice.voiceURI,
			name: voice.name,
			language: voice.lang,
			isDefault: voice.default
		}));
	}

	/**
	 * Get provider name
	 */
	getName() {
		return 'Browser TTS';
	}

	/**
	 * Check if provider is supported
	 */
	isSupported() {
		return typeof window !== 'undefined' && 'speechSynthesis' in window;
	}
}
