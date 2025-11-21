import { BaseTTSProvider } from './BaseTTSProvider.js';
import { logger } from '../../../utils/logger.js';

/**
 * Voice style presets for Supertonic TTS
 * These match the pre-extracted voice styles from Supertonic
 */
export const SUPERTONIC_VOICES = {
	M1: {
		id: 'M1',
		name: 'Male Voice 1',
		language: 'en-US'
	},
	M2: {
		id: 'M2',
		name: 'Male Voice 2',
		language: 'en-US'
	},
	F1: {
		id: 'F1',
		name: 'Female Voice 1',
		language: 'en-US'
	},
	F2: {
		id: 'F2',
		name: 'Female Voice 2',
		language: 'en-US'
	}
};

/**
 * Supertonic TTS provider using server-side API
 * Provides high-quality neural TTS with on-device inference (server-side)
 *
 * Features:
 * - Server-side ONNX Runtime inference (no browser WASM issues)
 * - 4 voice style presets (M1, M2, F1, F2)
 * - Text chunking for long inputs
 * - Adjustable speed control
 * - Efficient caching on server
 */
export class SupertonicTTSProvider extends BaseTTSProvider {
	constructor() {
		super();
		this.currentVoice = 'F1';
		this.audioContext = null;
		this.currentSource = null;
		this.isInitialized = false;
		this.isPlaying = false;
		this.isPaused = false;
		this.config = {
			speed: 1.05, // Match official default
			maxChunkLength: 200, // characters per chunk
			apiEndpoint: '/api/tts/supertonic'
		};
	}

	/**
	 * Initialize the provider
	 * @param {Object} config - Configuration options
	 * @param {string} config.voice - Voice ID (M1, M2, F1, F2)
	 * @param {number} config.speed - Speech speed (0.5 - 2.0)
	 */
	async initialize(config = {}) {
		try {
			logger.debug('[SupertonicTTS] Initializing...');

			// Set configuration
			this.currentVoice = config.voice || 'F1';
			this.config = {
				...this.config,
				speed: config.speed || 1.0
			};

			// Initialize Web Audio
			this._initializeAudioContext();

			// Check if API is available
			await this._checkAPIAvailability();

			this.isInitialized = true;
			logger.info('[SupertonicTTS] Initialized successfully');
		} catch (error) {
			logger.error('[SupertonicTTS] Initialization failed:', error);
			throw new Error(`Failed to initialize Supertonic TTS: ${error.message}`);
		}
	}

	/**
	 * Check if API endpoint is available
	 * @private
	 */
	async _checkAPIAvailability() {
		try {
			// Just verify the endpoint exists (we'll get a 400 for missing params, which is ok)
			const response = await fetch(this.config.apiEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: 'test' })
			});

			// As long as we don't get a 404, the endpoint exists
			if (response.status === 404) {
				throw new Error('API endpoint not found');
			}

			logger.debug('[SupertonicTTS] API endpoint is available');
		} catch (error) {
			logger.error('[SupertonicTTS] API availability check failed:', error);
			throw new Error('Supertonic API endpoint is not available');
		}
	}

	/**
	 * Initialize Web Audio Context
	 * @private
	 */
	_initializeAudioContext() {
		if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		} else {
			throw new Error('Web Audio API not supported');
		}
	}

	/**
	 * Speak the given text
	 * @param {string} text - Text to speak
	 * @param {Object} options - Speaking options
	 * @returns {Promise<void>}
	 */
	async speak(text, options = {}) {
		if (!this.isInitialized) {
			throw new Error('Provider not initialized. Call initialize() first.');
		}

		if (!text) {
			logger.debug('[SupertonicTTS] Empty text, skipping');
			return Promise.resolve();
		}

		// Stop any current speech
		this.stop();

		// Mark as playing for the new speech
		this.isPlaying = true;

		// Sanitize and chunk text
		const cleanText = this.sanitizeText(text);
		if (!cleanText) {
			logger.debug('[SupertonicTTS] No clean text after sanitization, skipping');
			this.isPlaying = false;
			return Promise.resolve();
		}

		const chunks = this._chunkText(cleanText);
		logger.debug(`[SupertonicTTS] Processing ${chunks.length} chunks`);

		try {
			// Generate audio for each chunk
			for (let i = 0; i < chunks.length; i++) {
				if (!this.isPlaying) {
					logger.debug('[SupertonicTTS] Playback stopped, breaking');
					break;
				}

				logger.debug(`[SupertonicTTS] Processing chunk ${i + 1}/${chunks.length}: "${chunks[i]}"`);
				const { audioData, sampleRate } = await this._synthesizeChunk(chunks[i], options);
				await this._playAudio(audioData, sampleRate);

				// Small pause between chunks (100ms)
				if (i < chunks.length - 1) {
					await this._sleep(100);
				}
			}
			logger.debug('[SupertonicTTS] All chunks processed');
		} catch (error) {
			logger.error('[SupertonicTTS] Synthesis failed:', error);
			throw error;
		} finally {
			this.isPlaying = false;
		}
	}

	/**
	 * Synthesize a single text chunk via API
	 * @private
	 */
	async _synthesizeChunk(text, options = {}) {
		try {
			const speed = options.speed || this.config.speed;

			logger.debug(`[SupertonicTTS] Calling API for text: "${text}"`);

			const response = await fetch(this.config.apiEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					text,
					voice: this.currentVoice,
					speed
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: response.statusText }));
				throw new Error(errorData.message || `API request failed: ${response.status}`);
			}

			const data = await response.json();

			logger.debug(`[SupertonicTTS] Received audio data: ${data.audio.length} samples at ${data.sampleRate}Hz`);

			// Convert array back to Float32Array and return with sample rate
			return {
				audioData: new Float32Array(data.audio),
				sampleRate: data.sampleRate
			};
		} catch (error) {
			logger.error('[SupertonicTTS] Synthesis error:', error);
			throw new Error(`Synthesis failed: ${error.message}`);
		}
	}

	/**
	 * Play audio data through Web Audio API
	 * @private
	 */
	async _playAudio(audioData, sampleRate) {
		// Resume AudioContext if suspended (required for browser autoplay policies)
		if (this.audioContext.state === 'suspended') {
			logger.debug('[SupertonicTTS] Resuming suspended AudioContext');
			await this.audioContext.resume();
		}

		// Diagnostic logging
		logger.debug(`[SupertonicTTS] AudioContext state: ${this.audioContext.state}, sampleRate: ${this.audioContext.sampleRate}Hz`);

		// Check audio data validity
		const audioArray = Array.from(audioData.slice(0, 100));
		const hasNonZero = audioArray.some(v => Math.abs(v) > 0.0001);
		const maxValue = Math.max(...audioArray.map(Math.abs));
		logger.debug(`[SupertonicTTS] Audio data check - hasNonZero: ${hasNonZero}, maxValue in first 100 samples: ${maxValue.toFixed(6)}`);

		return new Promise((resolve, reject) => {
			try {
				const audioBuffer = this.audioContext.createBuffer(1, audioData.length, sampleRate);

				// Copy audio data to buffer
				audioBuffer.copyToChannel(audioData, 0);

				// Create source and connect
				const source = this.audioContext.createBufferSource();
				source.buffer = audioBuffer;

				// Create gain node for volume control and debugging
				const gainNode = this.audioContext.createGain();
				gainNode.gain.value = 1.0;
				source.connect(gainNode);
				gainNode.connect(this.audioContext.destination);

				// Track playback state
				this.currentSource = source;
				this.isPlaying = true;

				source.onended = () => {
					logger.debug('[SupertonicTTS] Playback ended');
					this.currentSource = null;
					resolve();
				};

				// Start playback
				logger.debug(`[SupertonicTTS] Starting playback: ${audioData.length} samples at ${sampleRate}Hz (${(audioData.length / sampleRate).toFixed(2)}s)`);
				source.start(0);
				logger.debug(`[SupertonicTTS] Playback started successfully, currentTime: ${this.audioContext.currentTime.toFixed(3)}s`);
			} catch (error) {
				logger.error('[SupertonicTTS] Playback error:', error);
				reject(error);
			}
		});
	}

	/**
	 * Chunk text into smaller segments
	 * @private
	 */
	_chunkText(text) {
		const chunks = [];
		const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

		let currentChunk = '';
		for (const sentence of sentences) {
			if (currentChunk.length + sentence.length > this.config.maxChunkLength) {
				if (currentChunk) chunks.push(currentChunk.trim());
				currentChunk = sentence;
			} else {
				currentChunk += ' ' + sentence;
			}
		}
		if (currentChunk) chunks.push(currentChunk.trim());

		return chunks;
	}

	/**
	 * Sleep utility
	 * @private
	 */
	_sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Stop current speech
	 */
	stop() {
		if (this.currentSource) {
			try {
				this.currentSource.stop();
				this.currentSource.disconnect();
			} catch (error) {
				// Ignore errors from already stopped sources
			}
			this.currentSource = null;
		}
		this.isPlaying = false;
		this.isPaused = false;
	}

	/**
	 * Pause current speech
	 * Note: Web Audio API doesn't support pause/resume for BufferSource
	 * This is a limitation of the current implementation
	 */
	pause() {
		if (this.audioContext && this.audioContext.state === 'running') {
			this.audioContext.suspend();
			this.isPaused = true;
		}
	}

	/**
	 * Resume paused speech
	 */
	resume() {
		if (this.audioContext && this.audioContext.state === 'suspended') {
			this.audioContext.resume();
			this.isPaused = false;
		}
	}

	/**
	 * Check if provider is currently speaking
	 */
	isSpeaking() {
		return this.isPlaying && !this.isPaused;
	}

	/**
	 * Get available voices
	 */
	async getVoices() {
		return Object.values(SUPERTONIC_VOICES).map((voice) => ({
			id: voice.id,
			name: voice.name,
			language: voice.language
		}));
	}

	/**
	 * Get provider name
	 */
	getName() {
		return 'Supertonic (Neural TTS)';
	}

	/**
	 * Check if provider is supported
	 */
	isSupported() {
		// Only need Web Audio API on client side
		const hasWebAudio =
			typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);

		return hasWebAudio;
	}

	/**
	 * Change voice style
	 * @param {string} voiceId - Voice ID (M1, M2, F1, F2)
	 */
	async setVoice(voiceId) {
		if (!SUPERTONIC_VOICES[voiceId]) {
			throw new Error(`Unknown voice: ${voiceId}`);
		}

		this.currentVoice = voiceId;
		logger.debug(`[SupertonicTTS] Voice changed to: ${voiceId}`);
	}

	/**
	 * Get current voice
	 */
	getCurrentVoice() {
		return this.currentVoice;
	}

	/**
	 * Clean up resources
	 */
	async dispose() {
		this.stop();

		// Close audio context
		if (this.audioContext) {
			await this.audioContext.close();
			this.audioContext = null;
		}

		this.isInitialized = false;
	}
}
