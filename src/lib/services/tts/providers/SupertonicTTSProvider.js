import { BaseTTSProvider } from './BaseTTSProvider.js';
import * as ort from 'onnxruntime-web';
import { logger } from '../../../utils/logger.js';

/**
 * Voice style presets for Supertonic TTS
 * These match the pre-extracted voice styles from Supertonic
 */
export const SUPERTONIC_VOICES = {
	M1: {
		id: 'M1',
		name: 'Male Voice 1',
		language: 'en-US',
		stylePath: '/tts-models/voice_styles/M1.json'
	},
	M2: {
		id: 'M2',
		name: 'Male Voice 2',
		language: 'en-US',
		stylePath: '/tts-models/voice_styles/M2.json'
	},
	F1: {
		id: 'F1',
		name: 'Female Voice 1',
		language: 'en-US',
		stylePath: '/tts-models/voice_styles/F1.json'
	},
	F2: {
		id: 'F2',
		name: 'Female Voice 2',
		language: 'en-US',
		stylePath: '/tts-models/voice_styles/F2.json'
	}
};

/**
 * Default model paths (relative to public directory)
 */
const DEFAULT_MODEL_PATHS = {
	encoder: '/tts-models/onnx/encoder.onnx',
	decoder: '/tts-models/onnx/decoder.onnx',
	vocoder: '/tts-models/onnx/vocoder.onnx'
};

/**
 * Supertonic TTS provider using ONNX Runtime Web
 * Provides high-quality neural TTS with WebGPU/WASM acceleration
 *
 * Features:
 * - On-device inference (no API calls)
 * - WebGPU acceleration with WASM fallback
 * - 4 voice style presets (M1, M2, F1, F2)
 * - Text chunking for long inputs
 * - Adjustable speed control
 */
export class SupertonicTTSProvider extends BaseTTSProvider {
	constructor() {
		super();
		this.sessions = {
			encoder: null,
			decoder: null,
			vocoder: null
		};
		this.voiceStyle = null;
		this.currentVoice = 'F1';
		this.audioContext = null;
		this.currentSource = null;
		this.isInitialized = false;
		this.isPlaying = false;
		this.isPaused = false;
		this.config = {
			speed: 1.0,
			denoisingSteps: 1.0,
			maxChunkLength: 200 // characters per chunk
		};
	}

	/**
	 * Initialize the provider
	 * @param {Object} config - Configuration options
	 * @param {string} config.voice - Voice ID (M1, M2, F1, F2)
	 * @param {number} config.speed - Speech speed (0.5 - 2.0)
	 * @param {number} config.denoisingSteps - Quality control (0.9 - 1.5)
	 * @param {Object} config.modelPaths - Custom model paths
	 */
	async initialize(config = {}) {
		try {
			logger.debug('[SupertonicTTS] Initializing...');

			// Configure ONNX Runtime
			await this._configureOnnxRuntime();

			// Set configuration
			this.currentVoice = config.voice || 'F1';
			this.config = {
				...this.config,
				speed: config.speed || 1.0,
				denoisingSteps: config.denoisingSteps || 1.0
			};

			// Load models
			const modelPaths = config.modelPaths || DEFAULT_MODEL_PATHS;
			await this._loadModels(modelPaths);

			// Load voice style
			await this._loadVoiceStyle(this.currentVoice);

			// Initialize Web Audio
			this._initializeAudioContext();

			this.isInitialized = true;
			logger.info('[SupertonicTTS] Initialized successfully');
		} catch (error) {
			logger.error('[SupertonicTTS] Initialization failed:', error);
			throw new Error(`Failed to initialize Supertonic TTS: ${error.message}`);
		}
	}

	/**
	 * Configure ONNX Runtime with WebGPU/WASM providers
	 * @private
	 */
	async _configureOnnxRuntime() {
		// Try WebGPU first for best performance, fallback to WASM
		try {
			if ('gpu' in navigator) {
				ort.env.wasm.proxy = true;
				ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
				logger.debug('[SupertonicTTS] WebGPU support detected');
			} else {
				logger.debug('[SupertonicTTS] Using WASM backend');
			}
		} catch (error) {
			logger.warn('[SupertonicTTS] GPU configuration failed, using WASM:', error);
		}
	}

	/**
	 * Load ONNX models
	 * @private
	 */
	async _loadModels(modelPaths) {
		try {
			logger.debug('[SupertonicTTS] Loading models...');

			const sessionOptions = {
				executionProviders: ['webgpu', 'wasm'],
				graphOptimizationLevel: 'all'
			};

			// Load models in parallel
			const [encoder, decoder, vocoder] = await Promise.all([
				ort.InferenceSession.create(modelPaths.encoder, sessionOptions),
				ort.InferenceSession.create(modelPaths.decoder, sessionOptions),
				ort.InferenceSession.create(modelPaths.vocoder, sessionOptions)
			]);

			this.sessions.encoder = encoder;
			this.sessions.decoder = decoder;
			this.sessions.vocoder = vocoder;

			logger.debug('[SupertonicTTS] Models loaded successfully');
		} catch (error) {
			throw new Error(`Failed to load ONNX models: ${error.message}`);
		}
	}

	/**
	 * Load voice style JSON
	 * @private
	 */
	async _loadVoiceStyle(voiceId) {
		const voice = SUPERTONIC_VOICES[voiceId];
		if (!voice) {
			throw new Error(`Unknown voice: ${voiceId}`);
		}

		try {
			const response = await fetch(voice.stylePath);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			this.voiceStyle = await response.json();
			logger.debug(`[SupertonicTTS] Loaded voice style: ${voiceId}`);
		} catch (error) {
			throw new Error(`Failed to load voice style for ${voiceId}: ${error.message}`);
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
			return Promise.resolve();
		}

		// Stop any current speech
		this.stop();

		// Sanitize and chunk text
		const cleanText = this.sanitizeText(text);
		if (!cleanText) {
			return Promise.resolve();
		}

		const chunks = this._chunkText(cleanText);
		logger.debug(`[SupertonicTTS] Processing ${chunks.length} chunks`);

		try {
			// Generate audio for each chunk
			for (let i = 0; i < chunks.length; i++) {
				if (!this.isPlaying) break; // Check if stopped

				const audioData = await this._synthesizeChunk(chunks[i], options);
				await this._playAudio(audioData);

				// Small pause between chunks (100ms)
				if (i < chunks.length - 1) {
					await this._sleep(100);
				}
			}
		} catch (error) {
			logger.error('[SupertonicTTS] Synthesis failed:', error);
			throw error;
		} finally {
			this.isPlaying = false;
		}
	}

	/**
	 * Synthesize a single text chunk
	 * @private
	 */
	async _synthesizeChunk(text, options = {}) {
		try {
			// 1. Encode text to phonemes/features (encoder)
			const textTensor = this._prepareTextInput(text);
			const encoderOutput = await this.sessions.encoder.run({ text: textTensor });

			// 2. Decode to mel-spectrogram (decoder)
			const styleEmbedding = this._prepareStyleEmbedding();
			const decoderInput = {
				encoded_text: encoderOutput.encoded,
				style: styleEmbedding,
				steps: new ort.Tensor('float32', [this.config.denoisingSteps], [1])
			};
			const decoderOutput = await this.sessions.decoder.run(decoderInput);

			// 3. Convert mel-spectrogram to audio (vocoder)
			const vocoderOutput = await this.sessions.vocoder.run({ mel: decoderOutput.mel });

			// Extract audio data
			const audioData = vocoderOutput.audio.data;

			// Apply speed adjustment if needed
			const speed = options.speed || this.config.speed;
			if (speed !== 1.0) {
				return this._adjustSpeed(audioData, speed);
			}

			return audioData;
		} catch (error) {
			throw new Error(`Synthesis failed: ${error.message}`);
		}
	}

	/**
	 * Prepare text input tensor
	 * @private
	 */
	_prepareTextInput(text) {
		// Convert text to character codes or phoneme IDs
		// This is a simplified version - real implementation would use proper text encoding
		const charCodes = Array.from(text).map((char) => char.charCodeAt(0));
		const paddedCodes = new Float32Array(512).fill(0); // Pad to fixed length
		for (let i = 0; i < Math.min(charCodes.length, 512); i++) {
			paddedCodes[i] = charCodes[i] / 255.0; // Normalize
		}
		return new ort.Tensor('float32', paddedCodes, [1, 512]);
	}

	/**
	 * Prepare voice style embedding
	 * @private
	 */
	_prepareStyleEmbedding() {
		// Use loaded voice style data
		// This is simplified - real implementation would extract proper embeddings
		const styleData = new Float32Array(256).fill(0.5);
		if (this.voiceStyle && this.voiceStyle.embedding) {
			// Use actual embedding from loaded style
			for (let i = 0; i < Math.min(this.voiceStyle.embedding.length, 256); i++) {
				styleData[i] = this.voiceStyle.embedding[i];
			}
		}
		return new ort.Tensor('float32', styleData, [1, 256]);
	}

	/**
	 * Adjust audio speed using time-stretching
	 * @private
	 */
	_adjustSpeed(audioData, speed) {
		// Simple resampling for speed adjustment
		// For better quality, would use pitch-preserving time-stretching algorithm
		const originalLength = audioData.length;
		const newLength = Math.floor(originalLength / speed);
		const adjusted = new Float32Array(newLength);

		for (let i = 0; i < newLength; i++) {
			const srcIndex = i * speed;
			const floor = Math.floor(srcIndex);
			const ceil = Math.min(floor + 1, originalLength - 1);
			const t = srcIndex - floor;

			// Linear interpolation
			adjusted[i] = audioData[floor] * (1 - t) + audioData[ceil] * t;
		}

		return adjusted;
	}

	/**
	 * Play audio data through Web Audio API
	 * @private
	 */
	async _playAudio(audioData) {
		return new Promise((resolve, reject) => {
			try {
				const sampleRate = 22050; // Supertonic output sample rate
				const audioBuffer = this.audioContext.createBuffer(1, audioData.length, sampleRate);

				// Copy audio data to buffer
				audioBuffer.copyToChannel(audioData, 0);

				// Create source and connect
				const source = this.audioContext.createBufferSource();
				source.buffer = audioBuffer;
				source.connect(this.audioContext.destination);

				// Track playback state
				this.currentSource = source;
				this.isPlaying = true;

				source.onended = () => {
					this.currentSource = null;
					resolve();
				};

				// Start playback
				source.start(0);
			} catch (error) {
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
		// Check for required APIs
		const hasWebAudio =
			typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
		const hasWasm = typeof WebAssembly !== 'undefined';

		return hasWebAudio && hasWasm;
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
		await this._loadVoiceStyle(voiceId);
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

		// Clean up sessions (ONNX Runtime doesn't require explicit cleanup)
		this.sessions = {
			encoder: null,
			decoder: null,
			vocoder: null
		};

		this.isInitialized = false;
	}
}
