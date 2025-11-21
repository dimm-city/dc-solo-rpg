import * as ort from 'onnxruntime-node';
import { json, error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Supertonic TTS API endpoint
 * Runs ONNX models server-side and returns audio data
 */

// Cache for loaded models and resources
let sessionsCache = null;
let unicodeIndexerCache = null;
let voiceStylesCache = {};

/**
 * Load ONNX models (cached)
 * @private
 */
async function loadModels() {
	if (sessionsCache) return sessionsCache;

	try {
		console.log('[Supertonic API] Loading models...');

		const modelBasePath = join(process.cwd(), 'static', 'assets', 'onnx');

		const [encoder, durationPredictor, vectorEstimator, vocoder] = await Promise.all([
			ort.InferenceSession.create(join(modelBasePath, 'text_encoder.onnx')),
			ort.InferenceSession.create(join(modelBasePath, 'duration_predictor.onnx')),
			ort.InferenceSession.create(join(modelBasePath, 'vector_estimator.onnx')),
			ort.InferenceSession.create(join(modelBasePath, 'vocoder.onnx'))
		]);

		sessionsCache = { encoder, durationPredictor, vectorEstimator, vocoder };
		console.log('[Supertonic API] Models loaded successfully');
		return sessionsCache;
	} catch (err) {
		console.error('[Supertonic API] Failed to load models:', err);
		throw err;
	}
}

/**
 * Load unicode indexer (cached)
 * @private
 */
async function loadUnicodeIndexer() {
	if (unicodeIndexerCache) return unicodeIndexerCache;

	try {
		const indexerPath = join(process.cwd(), 'static', 'assets', 'onnx', 'unicode_indexer.json');
		const data = await readFile(indexerPath, 'utf-8');
		unicodeIndexerCache = JSON.parse(data);
		console.log('[Supertonic API] Unicode indexer loaded');
		return unicodeIndexerCache;
	} catch (err) {
		console.error('[Supertonic API] Failed to load unicode indexer:', err);
		throw err;
	}
}

/**
 * Load voice style (cached)
 * @private
 */
async function loadVoiceStyle(voiceId) {
	if (voiceStylesCache[voiceId]) return voiceStylesCache[voiceId];

	try {
		const stylePath = join(process.cwd(), 'static', 'assets', 'voice_styles', `${voiceId}.json`);
		const data = await readFile(stylePath, 'utf-8');
		voiceStylesCache[voiceId] = JSON.parse(data);
		console.log(`[Supertonic API] Voice style loaded: ${voiceId}`);
		return voiceStylesCache[voiceId];
	} catch (err) {
		console.error(`[Supertonic API] Failed to load voice style for ${voiceId}:`, err);
		throw err;
	}
}

/**
 * Prepare text input tensors
 * @private
 */
function prepareTextInput(text, unicodeIndexer, debug = false) {
	const maxLength = 512;
	const textIds = [];

	// CRITICAL: Normalize text using NFKD Unicode normalization (same as official implementation)
	const normalizedText = text.normalize('NFKD');

	// Convert text to character IDs
	for (let i = 0; i < normalizedText.length; i++) {
		const charCode = normalizedText.charCodeAt(i);
		if (charCode < unicodeIndexer.length) {
			const charId = unicodeIndexer[charCode];
			textIds.push(charId !== -1 ? charId : 0);
		} else {
			textIds.push(0);
		}
	}

	if (debug) {
		console.log(`[prepareTextInput] Text: "${text}"`);
		console.log(`[prepareTextInput] Text length: ${text.length}`);
		console.log(`[prepareTextInput] Text IDs (first 20):`, textIds.slice(0, 20));
		console.log(`[prepareTextInput] Non-zero count: ${textIds.filter(id => id !== 0).length}`);
	}

	// Pad to maxLength
	const paddedIds = new BigInt64Array(maxLength);
	const textMask = new Float32Array(maxLength);
	paddedIds.fill(0n);
	textMask.fill(0.0);

	for (let i = 0; i < Math.min(textIds.length, maxLength); i++) {
		paddedIds[i] = BigInt(textIds[i]);
		textMask[i] = 1.0;
	}

	return {
		textTensor: new ort.Tensor('int64', paddedIds, [1, maxLength]),
		textMask: new ort.Tensor('float32', textMask, [1, 1, maxLength])
	};
}

/**
 * Prepare style embeddings
 * @private
 */
function prepareStyleEmbeddings(voiceStyle) {
	// Prepare style_ttl: [1, 50, 256] for encoder
	const styleTTLData = voiceStyle.style_ttl.data;
	const flatTTL = [];
	for (let i = 0; i < styleTTLData.length; i++) {
		for (let j = 0; j < styleTTLData[i].length; j++) {
			for (let k = 0; k < styleTTLData[i][j].length; k++) {
				flatTTL.push(styleTTLData[i][j][k]);
			}
		}
	}

	// Prepare style_dp: [1, 8, 16] for decoder
	const styleDPData = voiceStyle.style_dp.data;
	const flatDP = [];
	for (let i = 0; i < styleDPData.length; i++) {
		for (let j = 0; j < styleDPData[i].length; j++) {
			for (let k = 0; k < styleDPData[i][j].length; k++) {
				flatDP.push(styleDPData[i][j][k]);
			}
		}
	}

	return {
		styleTTL: new ort.Tensor('float32', new Float32Array(flatTTL), [1, 50, 256]),
		styleDP: new ort.Tensor('float32', new Float32Array(flatDP), [1, 8, 16])
	};
}

/**
 * POST /api/tts/supertonic
 *
 * Synthesize speech from text
 *
 * Request body:
 * {
 *   text: string,
 *   voice: string (F1, F2, M1, M2),
 *   speed: number (optional, default: 1.0)
 * }
 *
 * Response:
 * {
 *   audio: Float32Array (as regular array),
 *   sampleRate: 22050
 * }
 */
export async function POST({ request }) {
	try {
		const { text, voice = 'F1', speed = 1.0 } = await request.json();

		if (!text) {
			throw error(400, 'Text is required');
		}

		if (!['F1', 'F2', 'M1', 'M2'].includes(voice)) {
			throw error(400, 'Invalid voice. Must be F1, F2, M1, or M2');
		}

		console.log(`[Supertonic API] Synthesizing: "${text}" with voice ${voice}`);

		// Load resources (cached after first load)
		const [sessions, unicodeIndexer, voiceStyle] = await Promise.all([
			loadModels(),
			loadUnicodeIndexer(),
			loadVoiceStyle(voice)
		]);

		// Model configuration (from tts.json)
		const config = {
			sampleRate: 44100,
			baseChunkSize: 512,
			chunkCompressFactor: 1, // ae.chunk_compress_factor
			latentDim: 24, // ttl.latent_dim
			ttlChunkCompressFactor: 6 // ttl.chunk_compress_factor
		};

		// Calculated values
		const latentDim = config.latentDim * config.ttlChunkCompressFactor; // 24 * 6 = 144
		const chunkSize = config.baseChunkSize * config.chunkCompressFactor; // 512 * 1 = 512

		// Diffusion denoising steps (higher = better quality, but slower)
		const totalStep = 5;

		// 1. Predict duration
		console.log('[Supertonic API] Step 1: Predicting duration...');
		const { textTensor, textMask } = prepareTextInput(text, unicodeIndexer, true);
		const { styleTTL, styleDP } = prepareStyleEmbeddings(voiceStyle);

		const durationOutput = await sessions.durationPredictor.run({
			text_ids: textTensor,
			text_mask: textMask,
			style_dp: styleDP
		});

		// Debug duration tensor structure
		console.log(`[Supertonic API] Duration output keys:`, Object.keys(durationOutput));
		console.log(`[Supertonic API] Duration tensor shape:`, durationOutput.duration.dims);
		console.log(`[Supertonic API] Duration tensor type:`, durationOutput.duration.type);

		// Apply speed adjustment to duration
		const duration = Array.from(durationOutput.duration.data);
		const adjustedDuration = duration.map(d => d / speed);

		// Debug duration output
		const durationSum = adjustedDuration.reduce((sum, d) => sum + d, 0);
		const durationNonZero = adjustedDuration.filter(d => d > 0);
		console.log(`[Supertonic API] Duration stats - total: ${durationSum.toFixed(6)}, non-zero count: ${durationNonZero.length}/${adjustedDuration.length}`);
		console.log(`[Supertonic API] Duration sample (first 20):`, adjustedDuration.slice(0, 20).map(d => d.toFixed(6)));

		// 2. Encode text
		console.log('[Supertonic API] Step 2: Encoding text...');
		const { textTensor: encTextTensor, textMask: textMaskTensor } = prepareTextInput(text, unicodeIndexer);

		const encoderOutput = await sessions.encoder.run({
			text_ids: encTextTensor,
			text_mask: textMaskTensor,
			style_ttl: styleTTL
		});

		// 3. Calculate latent dimensions from duration
		// Convert duration (in seconds) to waveform length, then to latent length
		const totalDuration = adjustedDuration.reduce((sum, d) => sum + d, 0);
		const wavLength = totalDuration * config.sampleRate;
		const latentLength = Math.floor((wavLength + chunkSize - 1) / chunkSize);

		console.log(`[Supertonic API] Latent calculation:`);
		console.log(`  totalDuration: ${totalDuration.toFixed(6)}`);
		console.log(`  wavLength: ${wavLength.toFixed(0)} samples (${(wavLength / config.sampleRate).toFixed(2)}s at ${config.sampleRate}Hz)`);
		console.log(`  chunkSize: ${chunkSize}`);
		console.log(`  latentLength: ${latentLength}`);
		console.log(`  latentDim: ${latentDim}`);

		// 4. Create latent mask [bsz, 1, latentLen]
		const latentMask = new Float32Array(latentLength);
		latentMask.fill(1.0);
		const latentMaskTensor = new ort.Tensor('float32', latentMask, [1, 1, latentLength]);

		// 5. Initialize noisy latent with Gaussian noise using Box-Muller transform
		// Diffusion models require Gaussian-distributed noise (mean=0, std=1), not uniform
		const noisyLatent = new Float32Array(latentDim * latentLength);
		const eps = 1e-10;
		for (let i = 0; i < noisyLatent.length; i += 2) {
			// Box-Muller transform: converts uniform random to Gaussian
			const u1 = Math.max(eps, Math.random());
			const u2 = Math.random();
			const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
			const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
			noisyLatent[i] = z0;
			if (i + 1 < noisyLatent.length) {
				noisyLatent[i + 1] = z1;
			}
		}

		// Apply latent mask to zero out padding regions
		// Shape: [bsz, latentDim, latentLen] = [1, 144, latentLength]
		for (let d = 0; d < latentDim; d++) {
			for (let t = 0; t < latentLength; t++) {
				const idx = d * latentLength + t;
				noisyLatent[idx] *= latentMask[t];
			}
		}

		// 6. Diffusion denoising loop
		console.log(`[Supertonic API] Step 3: Running diffusion (${totalStep} steps)...`);

		const totalStepTensor = new ort.Tensor('float32', new Float32Array([totalStep]), [1]);

		// Check initial noise
		const initialNoiseSample = Array.from(noisyLatent.slice(0, 10));
		const initialNoiseMax = Math.max(...initialNoiseSample.map(Math.abs));
		console.log(`[Supertonic API] Initial noise sample:`, initialNoiseSample.map(v => v.toFixed(6)));
		console.log(`[Supertonic API] Initial noise max: ${initialNoiseMax.toFixed(6)}`);

		for (let step = 0; step < totalStep; step++) {
			const currentStepTensor = new ort.Tensor('float32', new Float32Array([step]), [1]);

			// Reuse the same text_mask tensor from encoder (don't recreate it)
			const vectorOutput = await sessions.vectorEstimator.run({
				noisy_latent: new ort.Tensor('float32', noisyLatent, [1, latentDim, latentLength]),
				text_emb: encoderOutput.text_emb,
				style_ttl: styleTTL,
				text_mask: textMaskTensor,
				latent_mask: latentMaskTensor,
				total_step: totalStepTensor,
				current_step: currentStepTensor
			});

			// Log output keys on first iteration
			if (step === 0) {
				console.log('[Supertonic API] Vector estimator output keys:', Object.keys(vectorOutput));
			}

			// Update noisy_latent with denoised output
			const denoisedLatent = vectorOutput.denoised_latent?.data;
			if (!denoisedLatent) {
				throw new Error(`Unexpected vector estimator output. Available keys: ${Object.keys(vectorOutput).join(', ')}`);
			}

			// Check denoised output on first step
			if (step === 0) {
				const denoisedSample = Array.from(denoisedLatent.slice(0, 10));
				const denoisedMax = Math.max(...denoisedSample.map(Math.abs));
				console.log(`[Supertonic API] Denoised sample (step 0):`, denoisedSample.map(v => v.toFixed(6)));
				console.log(`[Supertonic API] Denoised max: ${denoisedMax.toFixed(6)}`);
			}

			for (let i = 0; i < noisyLatent.length; i++) {
				noisyLatent[i] = denoisedLatent[i];
			}
		}

		// Check final latent before vocoder
		const finalLatentSample = Array.from(noisyLatent.slice(0, 10));
		const finalLatentMax = Math.max(...finalLatentSample.map(Math.abs));
		console.log(`[Supertonic API] Final latent sample:`, finalLatentSample.map(v => v.toFixed(6)));
		console.log(`[Supertonic API] Final latent max: ${finalLatentMax.toFixed(6)}`);
		console.log(`[Supertonic API] Final latent shape: [1, ${latentDim}, ${latentLength}]`);

		// 7. Vocoder - Convert final latent to audio [bsz, latentDim, latentLen]
		console.log('[Supertonic API] Step 4: Generating audio...');
		const vocoderOutput = await sessions.vocoder.run({
			latent: new ort.Tensor('float32', noisyLatent, [1, latentDim, latentLength])
		});

		console.log('[Supertonic API] Vocoder output keys:', Object.keys(vocoderOutput));

		// Extract audio data from vocoder output
		const audioTensor = vocoderOutput.wav_tts;
		if (!audioTensor) {
			throw new Error(`Unexpected vocoder output. Available keys: ${Object.keys(vocoderOutput).join(', ')}`);
		}

		const audioData = Array.from(audioTensor.data);

		// Diagnostic: Check audio data statistics
		const audioSample = audioData.slice(0, 100);
		const maxValue = Math.max(...audioSample.map(Math.abs));
		const hasNonZero = audioSample.some(v => Math.abs(v) > 0.0001);
		console.log(`[Supertonic API] Audio stats - length: ${audioData.length} samples, maxValue in first 100: ${maxValue.toFixed(6)}, hasNonZero: ${hasNonZero}`);
		console.log(`[Supertonic API] Tensor shape: ${audioTensor.dims}, data type: ${audioTensor.type}`);
		console.log(`[Supertonic API] Synthesis complete. Duration: ${(audioData.length / config.sampleRate).toFixed(2)}s at ${config.sampleRate}Hz`);

		return json({
			audio: audioData,
			sampleRate: config.sampleRate // Use config sample rate, not hardcoded 22050
		});

	} catch (err) {
		console.error('[Supertonic API] Synthesis error:', err);
		throw error(500, `Synthesis failed: ${err.message}`);
	}
}
