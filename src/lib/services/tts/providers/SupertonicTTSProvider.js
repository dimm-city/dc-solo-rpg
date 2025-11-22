import { BaseTTSProvider } from './BaseTTSProvider.js';
import { logger } from '../../../utils/logger.js';
import * as ort from 'onnxruntime-web';

/**
 * Voice style presets for Supertonic TTS
 */
export const SUPERTONIC_VOICES = {
	M1: { id: 'M1', name: 'Male Voice 1', language: 'en-US' },
	M2: { id: 'M2', name: 'Male Voice 2', language: 'en-US' },
	F1: { id: 'F1', name: 'Female Voice 1', language: 'en-US' },
	F2: { id: 'F2', name: 'Female Voice 2', language: 'en-US' }
};

/**
 * Unicode Text Processor (from Supertonic web helper.js)
 */
class UnicodeProcessor {
	constructor(indexer) {
		this.indexer = indexer;
	}

	call(textList) {
		const processedTexts = textList.map((text) => this.preprocessText(text));
		const textIdsLengths = processedTexts.map((text) => text.length);
		const maxLen = Math.max(...textIdsLengths);

		const textIds = processedTexts.map((text) => {
			const row = new Array(maxLen).fill(0);
			for (let j = 0; j < text.length; j++) {
				const codePoint = text.codePointAt(j);
				row[j] = codePoint < this.indexer.length ? this.indexer[codePoint] : -1;
			}
			return row;
		});

		const textMask = this.getTextMask(textIdsLengths);
		return { textIds, textMask };
	}

	preprocessText(text) {
		return text.normalize('NFKC');
	}

	getTextMask(textIdsLengths) {
		const maxLen = Math.max(...textIdsLengths);
		return this.lengthToMask(textIdsLengths, maxLen);
	}

	lengthToMask(lengths, maxLen = null) {
		const actualMaxLen = maxLen || Math.max(...lengths);
		return lengths.map((len) => {
			const row = new Array(actualMaxLen).fill(0.0);
			for (let j = 0; j < Math.min(len, actualMaxLen); j++) {
				row[j] = 1.0;
			}
			return [row];
		});
	}
}

/**
 * Style class (from Supertonic web helper.js)
 */
class Style {
	constructor(ttlTensor, dpTensor) {
		this.ttl = ttlTensor;
		this.dp = dpTensor;
	}
}

/**
 * Text-to-Speech class (adapted from Supertonic web helper.js)
 */
class TextToSpeech {
	constructor(cfgs, textProcessor, dpOrt, textEncOrt, vectorEstOrt, vocoderOrt) {
		this.cfgs = cfgs;
		this.textProcessor = textProcessor;
		this.dpOrt = dpOrt;
		this.textEncOrt = textEncOrt;
		this.vectorEstOrt = vectorEstOrt;
		this.vocoderOrt = vocoderOrt;
		this.sampleRate = cfgs.ae.sample_rate;
	}

	async _infer(textList, style, totalStep, speed = 1.05) {
		const bsz = textList.length;

		// Process text
		const { textIds, textMask } = this.textProcessor.call(textList);

		const textIdsFlat = new BigInt64Array(textIds.flat().map((x) => BigInt(x)));
		const textIdsShape = [bsz, textIds[0].length];
		const textIdsTensor = new ort.Tensor('int64', textIdsFlat, textIdsShape);

		const textMaskFlat = new Float32Array(textMask.flat(2));
		const textMaskShape = [bsz, 1, textMask[0][0].length];
		const textMaskTensor = new ort.Tensor('float32', textMaskFlat, textMaskShape);

		// Predict duration
		const dpOutputs = await this.dpOrt.run({
			text_ids: textIdsTensor,
			style_dp: style.dp,
			text_mask: textMaskTensor
		});
		const duration = Array.from(dpOutputs.duration.data);

		// Apply speed factor
		for (let i = 0; i < duration.length; i++) {
			duration[i] /= speed;
		}

		// Encode text
		const textEncOutputs = await this.textEncOrt.run({
			text_ids: textIdsTensor,
			style_ttl: style.ttl,
			text_mask: textMaskTensor
		});
		const textEmb = textEncOutputs.text_emb;

		// Sample noisy latent
		let { xt, latentMask } = this.sampleNoisyLatent(
			duration,
			this.sampleRate,
			this.cfgs.ae.base_chunk_size,
			this.cfgs.ttl.chunk_compress_factor,
			this.cfgs.ttl.latent_dim
		);

		const latentMaskFlat = new Float32Array(latentMask.flat(2));
		const latentMaskShape = [bsz, 1, latentMask[0][0].length];
		const latentMaskTensor = new ort.Tensor('float32', latentMaskFlat, latentMaskShape);

		// Prepare constant arrays
		const totalStepArray = new Float32Array(bsz).fill(totalStep);
		const totalStepTensor = new ort.Tensor('float32', totalStepArray, [bsz]);

		// Denoising loop
		for (let step = 0; step < totalStep; step++) {
			const currentStepArray = new Float32Array(bsz).fill(step);
			const currentStepTensor = new ort.Tensor('float32', currentStepArray, [bsz]);

			const xtFlat = new Float32Array(xt.flat(2));
			const xtShape = [bsz, xt[0].length, xt[0][0].length];
			const xtTensor = new ort.Tensor('float32', xtFlat, xtShape);

			const vectorEstOutputs = await this.vectorEstOrt.run({
				noisy_latent: xtTensor,
				text_emb: textEmb,
				style_ttl: style.ttl,
				latent_mask: latentMaskTensor,
				text_mask: textMaskTensor,
				current_step: currentStepTensor,
				total_step: totalStepTensor
			});

			const denoised = Array.from(vectorEstOutputs.denoised_latent.data);

			// Reshape to 3D
			const latentDim = xt[0].length;
			const latentLen = xt[0][0].length;
			xt = [];
			let idx = 0;
			for (let b = 0; b < bsz; b++) {
				const batch = [];
				for (let d = 0; d < latentDim; d++) {
					const row = [];
					for (let t = 0; t < latentLen; t++) {
						row.push(denoised[idx++]);
					}
					batch.push(row);
				}
				xt.push(batch);
			}
		}

		// Generate waveform
		const finalXtFlat = new Float32Array(xt.flat(2));
		const finalXtShape = [bsz, xt[0].length, xt[0][0].length];
		const finalXtTensor = new ort.Tensor('float32', finalXtFlat, finalXtShape);

		const vocoderOutputs = await this.vocoderOrt.run({
			latent: finalXtTensor
		});

		const wav = Array.from(vocoderOutputs.wav_tts.data);
		return { wav, duration };
	}

	async call(text, style, totalStep, speed = 1.05, silenceDuration = 0.3) {
		if (style.ttl.dims[0] !== 1) {
			throw new Error('Single speaker TTS only supports single style');
		}

		const textList = this._chunkText(text);
		let wavCat = [];
		let durCat = 0;

		for (const chunk of textList) {
			const { wav, duration } = await this._infer([chunk], style, totalStep, speed);

			if (wavCat.length === 0) {
				wavCat = wav;
				durCat = duration[0];
			} else {
				const silenceLen = Math.floor(silenceDuration * this.sampleRate);
				const silence = new Array(silenceLen).fill(0);
				wavCat = [...wavCat, ...silence, ...wav];
				durCat += duration[0] + silenceDuration;
			}
		}

		return { wav: wavCat, duration: [durCat] };
	}

	sampleNoisyLatent(duration, sampleRate, baseChunkSize, chunkCompress, latentDim) {
		const bsz = duration.length;
		const maxDur = Math.max(...duration);

		const wavLenMax = Math.floor(maxDur * sampleRate);
		const wavLengths = duration.map((d) => Math.floor(d * sampleRate));

		const chunkSize = baseChunkSize * chunkCompress;
		const latentLen = Math.floor((wavLenMax + chunkSize - 1) / chunkSize);
		const latentDimVal = latentDim * chunkCompress;

		const xt = [];
		for (let b = 0; b < bsz; b++) {
			const batch = [];
			for (let d = 0; d < latentDimVal; d++) {
				const row = [];
				for (let t = 0; t < latentLen; t++) {
					// Box-Muller transform
					const u1 = Math.max(0.0001, Math.random());
					const u2 = Math.random();
					const val = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
					row.push(val);
				}
				batch.push(row);
			}
			xt.push(batch);
		}

		const latentLengths = wavLengths.map((len) => Math.floor((len + chunkSize - 1) / chunkSize));
		const latentMask = this.lengthToMask(latentLengths, latentLen);

		// Apply mask
		for (let b = 0; b < bsz; b++) {
			for (let d = 0; d < latentDimVal; d++) {
				for (let t = 0; t < latentLen; t++) {
					xt[b][d][t] *= latentMask[b][0][t];
				}
			}
		}

		return { xt, latentMask };
	}

	lengthToMask(lengths, maxLen = null) {
		const actualMaxLen = maxLen || Math.max(...lengths);
		return lengths.map((len) => {
			const row = new Array(actualMaxLen).fill(0.0);
			for (let j = 0; j < Math.min(len, actualMaxLen); j++) {
				row[j] = 1.0;
			}
			return [row];
		});
	}

	_chunkText(text, maxLen = 300) {
		if (typeof text !== 'string') {
			throw new Error(`chunkText expects a string, got ${typeof text}`);
		}

		// Split by paragraph
		const paragraphs = text
			.trim()
			.split(/\n\s*\n+/)
			.filter((p) => p.trim());
		const chunks = [];

		for (let paragraph of paragraphs) {
			paragraph = paragraph.trim();
			if (!paragraph) continue;

			// Split by sentence boundaries
			const sentences = paragraph.split(
				/(?<!Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sr\.|Jr\.|Ph\.D\.|etc\.|e\.g\.|i\.e\.|vs\.|Inc\.|Ltd\.|Co\.|Corp\.|St\.|Ave\.|Blvd\.)(?<!\b[A-Z]\.)(?<=[.!?])\s+/
			);

			let currentChunk = '';

			for (let sentence of sentences) {
				if (currentChunk.length + sentence.length + 1 <= maxLen) {
					currentChunk += (currentChunk ? ' ' : '') + sentence;
				} else {
					if (currentChunk) {
						chunks.push(currentChunk.trim());
					}
					currentChunk = sentence;
				}
			}

			if (currentChunk) {
				chunks.push(currentChunk.trim());
			}
		}

		return chunks;
	}
}

/**
 * Supertonic TTS provider using browser-based ONNX Runtime Web
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
			speed: 1.05,
			maxChunkLength: 300,
			silenceDuration: 0.3,
			totalStep: 5,
			assetsPath: 'https://huggingface.co/Supertone/supertonic/resolve/main'
		};
		this.ttsInstance = null;
		this.textProcessor = null;
		this.styles = {};
		this.sampleRate = null;
	}

	async initialize(config = {}) {
		try {
			logger.info('[SupertonicTTS] Initializing browser-based TTS...');

			// Set configuration
			this.currentVoice = config.voice || 'F1';
			this.config = { ...this.config, speed: config.speed || 1.05 };

			// Initialize Web Audio
			this._initializeAudioContext();

			// Load ONNX models and voice styles
			await this._loadModels();

			this.isInitialized = true;
			logger.info('[SupertonicTTS] Initialized successfully');
		} catch (error) {
			logger.error('[SupertonicTTS] Initialization failed:', error);
			throw new Error(`Failed to initialize Supertonic TTS: ${error.message}`);
		}
	}

	async _loadModels() {
		// Configure ONNX Runtime Web to fetch WASM files from CDN
		logger.debug('[SupertonicTTS] Configuring ONNX Runtime Web...');
		ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';

		const onnxDir = `${this.config.assetsPath}/onnx`;

		logger.debug('[SupertonicTTS] Loading configuration...');
		const cfgsResponse = await fetch(`${onnxDir}/tts.json`);
		const cfgs = await cfgsResponse.json();
		this.sampleRate = cfgs.ae.sample_rate;

		logger.debug('[SupertonicTTS] Loading text processor...');
		const indexerResponse = await fetch(`${onnxDir}/unicode_indexer.json`);
		const indexer = await indexerResponse.json();
		this.textProcessor = new UnicodeProcessor(indexer);

		logger.debug('[SupertonicTTS] Loading ONNX models...');
		const sessionOptions = {
			executionProviders: ['webgpu', 'wasm']
		};

		const [dpOrt, textEncOrt, vectorEstOrt, vocoderOrt] = await Promise.all([
			ort.InferenceSession.create(`${onnxDir}/duration_predictor.onnx`, sessionOptions),
			ort.InferenceSession.create(`${onnxDir}/text_encoder.onnx`, sessionOptions),
			ort.InferenceSession.create(`${onnxDir}/vector_estimator.onnx`, sessionOptions),
			ort.InferenceSession.create(`${onnxDir}/vocoder.onnx`, sessionOptions)
		]);

		this.ttsInstance = new TextToSpeech(
			cfgs,
			this.textProcessor,
			dpOrt,
			textEncOrt,
			vectorEstOrt,
			vocoderOrt
		);

		logger.debug('[SupertonicTTS] Loading voice styles...');
		for (const voiceId of ['F1', 'F2', 'M1', 'M2']) {
			const styleResponse = await fetch(`${this.config.assetsPath}/voice_styles/${voiceId}.json`);
			const styleData = await styleResponse.json();

			const ttlData = new Float32Array(styleData.style_ttl.data.flat(2));
			const dpData = new Float32Array(styleData.style_dp.data.flat(2));

			const ttlTensor = new ort.Tensor('float32', ttlData, [1, 50, 256]);
			const dpTensor = new ort.Tensor('float32', dpData, [1, 8, 16]);

			this.styles[voiceId] = new Style(ttlTensor, dpTensor);
		}

		logger.debug('[SupertonicTTS] All models and styles loaded');
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
			logger.debug('[SupertonicTTS] Empty text, skipping');
			return Promise.resolve();
		}

		// Update voice if provided
		if (options.voice && options.voice !== this.currentVoice) {
			await this.setVoice(options.voice);
		}

		// Map rate to speed
		const speed = options.speed || options.rate || this.config.speed;

		// Stop any current speech
		this.stop();
		this.isPlaying = true;

		// Sanitize text
		const cleanText = this.sanitizeText(text);
		if (!cleanText) {
			logger.debug('[SupertonicTTS] No clean text after sanitization');
			this.isPlaying = false;
			return Promise.resolve();
		}

		try {
			logger.debug(`[SupertonicTTS] Synthesizing with voice ${this.currentVoice}`);

			// Generate audio
			const { wav } = await this.ttsInstance.call(
				cleanText,
				this.styles[this.currentVoice],
				this.config.totalStep,
				speed,
				this.config.silenceDuration
			);

			// Play audio
			await this._playAudio(new Float32Array(wav), this.sampleRate);

			logger.debug('[SupertonicTTS] Synthesis complete');
		} catch (error) {
			logger.error('[SupertonicTTS] Synthesis failed:', error);
			throw error;
		} finally {
			this.isPlaying = false;
		}
	}

	async _playAudio(audioData, sampleRate) {
		// Resume AudioContext if suspended
		if (this.audioContext.state === 'suspended') {
			logger.debug('[SupertonicTTS] Resuming suspended AudioContext');
			await this.audioContext.resume();
		}

		logger.debug(
			`[SupertonicTTS] AudioContext state: ${this.audioContext.state}, sampleRate: ${this.audioContext.sampleRate}Hz`
		);

		return new Promise((resolve, reject) => {
			try {
				const audioBuffer = this.audioContext.createBuffer(1, audioData.length, sampleRate);
				audioBuffer.copyToChannel(audioData, 0);

				const source = this.audioContext.createBufferSource();
				source.buffer = audioBuffer;

				const gainNode = this.audioContext.createGain();
				gainNode.gain.value = 1.0;
				source.connect(gainNode);
				gainNode.connect(this.audioContext.destination);

				this.currentSource = source;
				this.isPlaying = true;

				source.onended = () => {
					logger.debug('[SupertonicTTS] Playback ended');
					this.currentSource = null;
					resolve();
				};

				logger.debug(
					`[SupertonicTTS] Starting playback: ${audioData.length} samples at ${sampleRate}Hz (${(audioData.length / sampleRate).toFixed(2)}s)`
				);
				source.start(0);
				logger.debug(
					`[SupertonicTTS] Playback started successfully, currentTime: ${this.audioContext.currentTime.toFixed(3)}s`
				);
			} catch (error) {
				logger.error('[SupertonicTTS] Playback error:', error);
				reject(error);
			}
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
		return Object.values(SUPERTONIC_VOICES).map((voice) => ({
			id: voice.id,
			name: voice.name,
			language: voice.language
		}));
	}

	getName() {
		return 'Supertonic (Neural TTS)';
	}

	isSupported() {
		const hasWebAudio =
			typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
		return hasWebAudio;
	}

	async setVoice(voiceId) {
		if (!SUPERTONIC_VOICES[voiceId]) {
			throw new Error(`Unknown voice: ${voiceId}`);
		}
		this.currentVoice = voiceId;
		logger.debug(`[SupertonicTTS] Voice changed to: ${voiceId}`);
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
