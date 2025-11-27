import { BaseTTSProvider } from './BaseTTSProvider.js';
import { logger } from '../../../utils/logger.js';

/**
 * Voice options for OpenAI TTS
 */
export const OPENAI_VOICES = {
	alloy: { id: 'alloy', name: 'Alloy', language: 'en-US' },
	echo: { id: 'echo', name: 'Echo', language: 'en-US' },
	fable: { id: 'fable', name: 'Fable', language: 'en-US' },
	onyx: { id: 'onyx', name: 'Onyx', language: 'en-US' },
	nova: { id: 'nova', name: 'Nova', language: 'en-US' },
	shimmer: { id: 'shimmer', name: 'Shimmer', language: 'en-US' }
};

/**
 * OpenAI TTS provider using OpenAI speech API
 * Allows configurable endpoint URL for compatibility with OpenAI-compatible services
 */
export class OpenAITTSProvider extends BaseTTSProvider {
	// Default OpenAI endpoint
	static DEFAULT_ENDPOINT = 'https://api.openai.com/v1/audio/speech';

	constructor() {
		super();
		this.currentVoice = 'alloy';
		this.audioContext = null;
		this.currentSource = null;
		this.isInitialized = false;
		this.isPlaying = false;
		this.isPaused = false;
		this.config = {
			apiEndpoint: OpenAITTSProvider.DEFAULT_ENDPOINT,
			apiKey: null, // Set via config
			model: 'tts-1', // or 'tts-1-hd' for higher quality
			speed: 1.0, // 0.25 to 4.0
			responseFormat: 'mp3' // mp3, opus, aac, flac, wav, pcm
		};
	}

	async initialize(config = {}) {
		try {
			logger.info('[OpenAI] Initializing TTS provider with config:', config);

			// Merge configuration
			this.config = {
				...this.config,
				...config
			};

			// Use default endpoint if not provided
			if (!this.config.apiEndpoint) {
				this.config.apiEndpoint = OpenAITTSProvider.DEFAULT_ENDPOINT;
			}

			logger.info(`[OpenAI] Provider initialized with endpoint: ${this.config.apiEndpoint}`);

			// Note: API key validation moved to speak() to allow provider selection before key entry

			// Set voice
			this.currentVoice = config.voice || 'alloy';

			// Initialize Web Audio
			this._initializeAudioContext();

			this.isInitialized = true;
			logger.info('[OpenAI] Initialized successfully');
		} catch (error) {
			logger.error('[OpenAI] Initialization failed:', error);
			throw new Error(`Failed to initialize OpenAI TTS: ${error.message}`);
		}
	}

	_initializeAudioContext() {
		if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		} else {
			throw new Error('Web Audio API not supported');
		}
	}

	async speak(text, options = {}) {
		if (!this.isInitialized) {
			throw new Error('Provider not initialized. Call initialize() first.');
		}

		// Note: API key validation removed to support OpenAI-compatible servers that don't require auth

		if (!text) {
			logger.debug('[OpenAI] Empty text, skipping');
			return Promise.resolve();
		}

		// Update voice if provided
		if (options.voice && options.voice !== this.currentVoice) {
			await this.setVoice(options.voice);
		}

		// Map rate/speed to API speed parameter
		const speed = options.speed || options.rate || this.config.speed;

		// Stop any current speech
		this.stop();
		this.isPlaying = true;

		// Sanitize text
		const cleanText = this.sanitizeText(text);
		if (!cleanText) {
			logger.debug('[OpenAI] No clean text after sanitization');
			this.isPlaying = false;
			return Promise.resolve();
		}

		try {
			logger.debug(`[OpenAI] Synthesizing with voice ${this.currentVoice}, speed ${speed}`);

			// Call OpenAI API
			const audioData = await this._synthesizeSpeech(cleanText, speed);

			// Play audio
			await this._playAudio(audioData);

			logger.debug('[OpenAI] Synthesis complete');
		} catch (error) {
			logger.error('[OpenAI] Synthesis failed:', error);
			throw error;
		} finally {
			this.isPlaying = false;
		}
	}

	/**
	 * Call the OpenAI speech API
	 * @private
	 */
	async _synthesizeSpeech(text, speed) {
		const requestBody = {
			model: this.config.model,
			input: text,
			voice: this.currentVoice,
			speed: speed,
			response_format: this.config.responseFormat
		};

		logger.debug('[OpenAI] API Request:', {
			endpoint: this.config.apiEndpoint,
			body: { ...requestBody, input: `${text.substring(0, 50)}...` }
		});

		logger.info(`[OpenAI] Calling TTS endpoint: ${this.config.apiEndpoint}`);

		// Build headers - only include Authorization if API key is provided
		const headers = {
			'Content-Type': 'application/json'
		};

		if (this.config.apiKey) {
			headers.Authorization = `Bearer ${this.config.apiKey}`;
		}

		const response = await fetch(this.config.apiEndpoint, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify(requestBody)
		}).catch((error) => {
			logger.error(`[OpenAI] Network error calling ${this.config.apiEndpoint}:`, error);
			throw new Error(`Network error: ${error.message}. Check that the server is running at ${this.config.apiEndpoint}`);
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`API request failed: ${response.status} ${response.statusText} - ${errorText}`
			);
		}

		// Get audio data as ArrayBuffer
		const arrayBuffer = await response.arrayBuffer();
		logger.debug(`[OpenAI] Received audio: ${arrayBuffer.byteLength} bytes`);

		return arrayBuffer;
	}

	/**
	 * Play audio using Web Audio API
	 * @private
	 */
	async _playAudio(audioArrayBuffer) {
		// Resume AudioContext if suspended
		if (this.audioContext.state === 'suspended') {
			logger.debug('[OpenAI] Resuming suspended AudioContext');
			await this.audioContext.resume();
		}

		logger.debug(`[OpenAI] AudioContext state: ${this.audioContext.state}`);

		return new Promise((resolve, reject) => {
			// Decode audio data
			this.audioContext.decodeAudioData(
				audioArrayBuffer,
				(audioBuffer) => {
					try {
						const source = this.audioContext.createBufferSource();
						source.buffer = audioBuffer;

						const gainNode = this.audioContext.createGain();
						gainNode.gain.value = 1.0;
						source.connect(gainNode);
						gainNode.connect(this.audioContext.destination);

						this.currentSource = source;
						this.isPlaying = true;

						source.onended = () => {
							logger.debug('[OpenAI] Playback ended');
							this.currentSource = null;
							this.isPlaying = false;
							resolve();
						};

						logger.debug(
							`[OpenAI] Starting playback: ${audioBuffer.duration.toFixed(2)}s at ${audioBuffer.sampleRate}Hz`
						);
						source.start(0);
					} catch (error) {
						logger.error('[OpenAI] Playback error:', error);
						reject(error);
					}
				},
				(error) => {
					logger.error('[OpenAI] Audio decode error:', error);
					reject(error);
				}
			);
		});
	}

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

	pause() {
		if (this.audioContext && this.audioContext.state === 'running') {
			this.audioContext.suspend();
			this.isPaused = true;
		}
	}

	resume() {
		if (this.audioContext && this.audioContext.state === 'suspended') {
			this.audioContext.resume();
			this.isPaused = false;
		}
	}

	isSpeaking() {
		return this.isPlaying && !this.isPaused;
	}

	async getVoices() {
		// Return standard OpenAI voices
		// Users can enter custom voice IDs directly in the UI datalist
		return Object.values(OPENAI_VOICES).map((voice) => ({
			id: voice.id,
			name: voice.name,
			language: voice.language
		}));
	}

	getName() {
		return 'OpenAI TTS';
	}

	isSupported() {
		const hasWebAudio =
			typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
		return hasWebAudio;
	}

	async setVoice(voiceId) {
		// Allow any voice ID (users can specify custom voices)
		this.currentVoice = voiceId;
		logger.debug(`[OpenAI] Voice changed to: ${voiceId}`);
	}

	getCurrentVoice() {
		return this.currentVoice;
	}

	async dispose() {
		this.stop();
		if (this.audioContext) {
			await this.audioContext.close();
			this.audioContext = null;
		}
		this.isInitialized = false;
	}
}
