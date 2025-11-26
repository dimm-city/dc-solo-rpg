import { BaseTTSProvider } from './BaseTTSProvider.js';
import { logger } from '../../../utils/logger.js';

/**
 * ElevenLabs TTS provider using ElevenLabs API
 * Requires API key and voice ID from ElevenLabs account
 */
export class ElevenLabsTTSProvider extends BaseTTSProvider {
	static DEFAULT_ENDPOINT = 'https://api.elevenlabs.io/v1';
	static DEFAULT_MODEL = 'eleven_monolingual_v1';

	// Popular pre-made voices (users can override with their own voice IDs)
	static POPULAR_VOICES = {
		rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en-US' },
		drew: { id: '29vD33N1CtxCmqQRPOHJ', name: 'Drew', language: 'en-US' },
		clyde: { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', language: 'en-US' },
		paul: { id: '5Q0t7uMcjvnagumLfvZi', name: 'Paul', language: 'en-US' },
		domi: { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'en-US' },
		dave: { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', language: 'en-US' },
		fin: { id: 'D38z5RcWu1voky8WS1ja', name: 'Fin', language: 'en-US' },
		sarah: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', language: 'en-US' },
		antoni: { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en-US' },
		thomas: { id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', language: 'en-US' },
		charlie: { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', language: 'en-US' },
		george: { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', language: 'en-US' },
		emily: { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', language: 'en-US' },
		elli: { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', language: 'en-US' },
		callum: { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', language: 'en-US' },
		patrick: { id: 'ODq5zmih8GrVes37Dizd', name: 'Patrick', language: 'en-US' },
		harry: { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', language: 'en-US' },
		liam: { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', language: 'en-US' },
		dorothy: { id: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', language: 'en-US' },
		josh: { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', language: 'en-US' },
		arnold: { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', language: 'en-US' },
		charlotte: { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', language: 'en-US' },
		alice: { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', language: 'en-US' },
		matilda: { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', language: 'en-US' },
		james: { id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', language: 'en-US' },
		joseph: { id: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph', language: 'en-US' },
		jeremy: { id: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', language: 'en-US' },
		michael: { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael', language: 'en-US' },
		ethan: { id: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan', language: 'en-US' },
		chris: { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', language: 'en-US' },
		gigi: { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Gigi', language: 'en-US' },
		freya: { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', language: 'en-US' },
		brian: { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', language: 'en-US' },
		grace: { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', language: 'en-US' },
		daniel: { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', language: 'en-US' },
		lily: { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', language: 'en-US' },
		serena: { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena', language: 'en-US' },
		adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', language: 'en-US' },
		nicole: { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', language: 'en-US' },
		bill: { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', language: 'en-US' },
		jessie: { id: 't0jbNlBVZ17f02VDIeMI', name: 'Jessie', language: 'en-US' },
		sam: { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', language: 'en-US' },
		glinda: { id: 'z9fAnlkpzviPz146aGWa', name: 'Glinda', language: 'en-US' },
		giovanni: { id: 'zcAOhNBS3c14rBihAFp1', name: 'Giovanni', language: 'en-US' },
		mimi: { id: 'zrHiDhphv9ZnVXBqCLjz', name: 'Mimi', language: 'en-US' }
	};

	constructor() {
		super();
		this.currentVoice = '21m00Tcm4TlvDq8ikWAM'; // Rachel by default
		this.audioContext = null;
		this.currentSource = null;
		this.isInitialized = false;
		this.isPlaying = false;
		this.isPaused = false;
		this.config = {
			apiEndpoint: ElevenLabsTTSProvider.DEFAULT_ENDPOINT,
			apiKey: null, // Set via config
			model: ElevenLabsTTSProvider.DEFAULT_MODEL,
			voiceSettings: {
				stability: 0.5,
				similarity_boost: 0.75,
				style: 0.0,
				use_speaker_boost: true
			}
		};
	}

	async initialize(config = {}) {
		try {
			logger.info('[ElevenLabs] Initializing TTS provider...');

			// Merge configuration
			this.config = {
				...this.config,
				...config,
				voiceSettings: {
					...this.config.voiceSettings,
					...(config.voiceSettings || {})
				}
			};

			// Use default endpoint if not provided
			if (!this.config.apiEndpoint) {
				this.config.apiEndpoint = ElevenLabsTTSProvider.DEFAULT_ENDPOINT;
			}

			// Validate API key
			if (!this.config.apiKey) {
				throw new Error('API key is required. Set apiKey in config.');
			}

			// Set voice
			if (config.voice) {
				this.currentVoice = config.voice;
			}

			// Initialize Web Audio
			this._initializeAudioContext();

			this.isInitialized = true;
			logger.info('[ElevenLabs] Initialized successfully');
		} catch (error) {
			logger.error('[ElevenLabs] Initialization failed:', error);
			throw new Error(`Failed to initialize ElevenLabs TTS: ${error.message}`);
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

		if (!text) {
			logger.debug('[ElevenLabs] Empty text, skipping');
			return Promise.resolve();
		}

		// Update voice if provided
		if (options.voice && options.voice !== this.currentVoice) {
			await this.setVoice(options.voice);
		}

		// Stop any current speech
		this.stop();
		this.isPlaying = true;

		// Sanitize text
		const cleanText = this.sanitizeText(text);
		if (!cleanText) {
			logger.debug('[ElevenLabs] No clean text after sanitization');
			this.isPlaying = false;
			return Promise.resolve();
		}

		try {
			logger.debug(`[ElevenLabs] Synthesizing with voice ${this.currentVoice}`);

			// Call ElevenLabs API
			const audioData = await this._synthesizeSpeech(cleanText);

			// Play audio
			await this._playAudio(audioData);

			logger.debug('[ElevenLabs] Synthesis complete');
		} catch (error) {
			logger.error('[ElevenLabs] Synthesis failed:', error);
			throw error;
		} finally {
			this.isPlaying = false;
		}
	}

	/**
	 * Call the ElevenLabs speech API
	 * @private
	 */
	async _synthesizeSpeech(text) {
		const url = `${this.config.apiEndpoint}/text-to-speech/${this.currentVoice}`;

		const requestBody = {
			text: text,
			model_id: this.config.model,
			voice_settings: this.config.voiceSettings
		};

		logger.debug('[ElevenLabs] API Request:', {
			url,
			body: { ...requestBody, text: `${text.substring(0, 50)}...` }
		});

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'xi-api-key': this.config.apiKey
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`API request failed: ${response.status} ${response.statusText} - ${errorText}`
			);
		}

		// Get audio data as ArrayBuffer
		const arrayBuffer = await response.arrayBuffer();
		logger.debug(`[ElevenLabs] Received audio: ${arrayBuffer.byteLength} bytes`);

		return arrayBuffer;
	}

	/**
	 * Play audio using Web Audio API
	 * @private
	 */
	async _playAudio(audioArrayBuffer) {
		// Resume AudioContext if suspended
		if (this.audioContext.state === 'suspended') {
			logger.debug('[ElevenLabs] Resuming suspended AudioContext');
			await this.audioContext.resume();
		}

		logger.debug(`[ElevenLabs] AudioContext state: ${this.audioContext.state}`);

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
							logger.debug('[ElevenLabs] Playback ended');
							this.currentSource = null;
							this.isPlaying = false;
							resolve();
						};

						logger.debug(
							`[ElevenLabs] Starting playback: ${audioBuffer.duration.toFixed(2)}s at ${audioBuffer.sampleRate}Hz`
						);
						source.start(0);
					} catch (error) {
						logger.error('[ElevenLabs] Playback error:', error);
						reject(error);
					}
				},
				(error) => {
					logger.error('[ElevenLabs] Audio decode error:', error);
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
		return Object.values(ElevenLabsTTSProvider.POPULAR_VOICES).map((voice) => ({
			id: voice.id,
			name: voice.name,
			language: voice.language
		}));
	}

	getName() {
		return 'ElevenLabs TTS';
	}

	isSupported() {
		const hasWebAudio =
			typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
		return hasWebAudio;
	}

	async setVoice(voiceId) {
		// Voice ID can be any valid ElevenLabs voice ID
		this.currentVoice = voiceId;
		logger.debug(`[ElevenLabs] Voice changed to: ${voiceId}`);
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
