import { join } from 'path';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { json, error } from '@sveltejs/kit';
import * as ort from 'onnxruntime-node';

/**
 * Supertonic TTS API endpoint - V2 using direct port of official helper.js
 * This implementation directly ports the official Supertonic Node.js code
 */

// Model cache
let ttsInstance = null;
let unicodeProcessor = null;
let styles = {};

/**
 * Helper functions from official implementation
 */
function lengthToMask(lengths, maxLen = null) {
	maxLen = maxLen || Math.max(...lengths);
	const mask = [];
	for (let i = 0; i < lengths.length; i++) {
		const row = [];
		for (let j = 0; j < maxLen; j++) {
			row.push(j < lengths[i] ? 1.0 : 0.0);
		}
		mask.push([row]); // [B, 1, maxLen]
	}
	return mask;
}

function getLatentMask(wavLengths, baseChunkSize, chunkCompressFactor) {
	const latentSize = baseChunkSize * chunkCompressFactor;
	const latentLengths = wavLengths.map((len) => Math.floor((len + latentSize - 1) / latentSize));
	return lengthToMask(latentLengths);
}

function arrayToTensor(array, dims) {
	const flat = array.flat(Infinity);
	return new ort.Tensor('float32', Float32Array.from(flat), dims);
}

function intArrayToTensor(array, dims) {
	const flat = array.flat(Infinity);
	return new ort.Tensor('int64', BigInt64Array.from(flat.map((x) => BigInt(x))), dims);
}

/**
 * Unicode text processor
 */
class UnicodeProcessor {
	constructor(indexer) {
		this.indexer = indexer;
	}

	_preprocessText(text) {
		return text.normalize('NFKD');
	}

	_textToUnicodeValues(text) {
		return Array.from(text).map((char) => char.charCodeAt(0));
	}

	_getTextMask(textIdsLengths) {
		return lengthToMask(textIdsLengths);
	}

	call(textList) {
		const processedTexts = textList.map((t) => this._preprocessText(t));
		const textIdsLengths = processedTexts.map((t) => t.length);
		const maxLen = Math.max(...textIdsLengths);

		const textIds = [];
		for (let i = 0; i < processedTexts.length; i++) {
			const row = new Array(maxLen).fill(0);
			const unicodeVals = this._textToUnicodeValues(processedTexts[i]);
			for (let j = 0; j < unicodeVals.length; j++) {
				row[j] = this.indexer[unicodeVals[j]];
			}
			textIds.push(row);
		}

		const textMask = this._getTextMask(textIdsLengths);
		return { textIds, textMask };
	}
}

/**
 * TextToSpeech class
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
		this.baseChunkSize = cfgs.ae.base_chunk_size;
		this.chunkCompressFactor = cfgs.ttl.chunk_compress_factor;
		this.ldim = cfgs.ttl.latent_dim;
	}

	sampleNoisyLatent(duration) {
		const wavLenMax = Math.max(...duration) * this.sampleRate;
		const wavLengths = duration.map((d) => Math.floor(d * this.sampleRate));
		const chunkSize = this.baseChunkSize * this.chunkCompressFactor;
		const latentLen = Math.floor((wavLenMax + chunkSize - 1) / chunkSize);
		const latentDim = this.ldim * this.chunkCompressFactor;

		// Generate random noise with Box-Muller transform
		const noisyLatent = [];
		for (let b = 0; b < duration.length; b++) {
			const batch = [];
			for (let d = 0; d < latentDim; d++) {
				const row = [];
				for (let t = 0; t < latentLen; t++) {
					const eps = 1e-10;
					const u1 = Math.max(eps, Math.random());
					const u2 = Math.random();
					const randNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
					row.push(randNormal);
				}
				batch.push(row);
			}
			noisyLatent.push(batch);
		}

		const latentMask = getLatentMask(wavLengths, this.baseChunkSize, this.chunkCompressFactor);

		// Apply mask
		for (let b = 0; b < noisyLatent.length; b++) {
			for (let d = 0; d < noisyLatent[b].length; d++) {
				for (let t = 0; t < noisyLatent[b][d].length; t++) {
					noisyLatent[b][d][t] *= latentMask[b][0][t];
				}
			}
		}

		return { noisyLatent, latentMask };
	}

	async _infer(textList, style, totalStep, speed = 1.05) {
		const bsz = textList.length;
		const { textIds, textMask } = this.textProcessor.call(textList);
		const textIdsShape = [bsz, textIds[0].length];
		const textMaskShape = [bsz, 1, textMask[0][0].length];

		const textMaskTensor = arrayToTensor(textMask, textMaskShape);

		const dpResult = await this.dpOrt.run({
			text_ids: intArrayToTensor(textIds, textIdsShape),
			style_dp: style.dp,
			text_mask: textMaskTensor
		});

		const durOnnx = Array.from(dpResult.duration.data);

		// Apply speed factor to duration
		for (let i = 0; i < durOnnx.length; i++) {
			durOnnx[i] /= speed;
		}

		const textEncResult = await this.textEncOrt.run({
			text_ids: intArrayToTensor(textIds, textIdsShape),
			style_ttl: style.ttl,
			text_mask: textMaskTensor
		});

		const textEmbTensor = textEncResult.text_emb;

		let { noisyLatent, latentMask } = this.sampleNoisyLatent(durOnnx);
		const latentShape = [bsz, noisyLatent[0].length, noisyLatent[0][0].length];
		const latentMaskShape = [bsz, 1, latentMask[0][0].length];

		const latentMaskTensor = arrayToTensor(latentMask, latentMaskShape);

		const totalStepArray = new Array(bsz).fill(totalStep);
		const scalarShape = [bsz];
		const totalStepTensor = arrayToTensor(totalStepArray, scalarShape);

		for (let step = 0; step < totalStep; step++) {
			const currentStepArray = new Array(bsz).fill(step);

			const vectorEstResult = await this.vectorEstOrt.run({
				noisy_latent: arrayToTensor(noisyLatent, latentShape),
				text_emb: textEmbTensor,
				style_ttl: style.ttl,
				text_mask: textMaskTensor,
				latent_mask: latentMaskTensor,
				total_step: totalStepTensor,
				current_step: arrayToTensor(currentStepArray, scalarShape)
			});

			const denoisedLatent = Array.from(vectorEstResult.denoised_latent.data);

			// Update latent with the denoised output
			let idx = 0;
			for (let b = 0; b < noisyLatent.length; b++) {
				for (let d = 0; d < noisyLatent[b].length; d++) {
					for (let t = 0; t < noisyLatent[b][d].length; t++) {
						noisyLatent[b][d][t] = denoisedLatent[idx++];
					}
				}
			}
		}

		const vocoderResult = await this.vocoderOrt.run({
			latent: arrayToTensor(noisyLatent, latentShape)
		});

		const wav = Array.from(vocoderResult.wav_tts.data);
		return { wav, duration: durOnnx };
	}

	async call(text, style, totalStep = 5, speed = 1.05) {
		// Simple single-text call
		const { wav, duration } = await this._infer([text], style, totalStep, speed);
		return { wav, duration: duration[0] };
	}
}

/**
 * Initialize TTS system (cached)
 */
async function initializeTTS() {
	if (ttsInstance) return { ttsInstance, unicodeProcessor, styles };

	console.log('[Supertonic V2] Initializing TTS system...');

	const basePath = join(process.cwd(), 'static', 'assets');

	// Load config
	const config = JSON.parse(readFileSync(join(basePath, 'onnx', 'tts.json'), 'utf-8'));

	// Load unicode indexer
	const indexer = JSON.parse(
		readFileSync(join(basePath, 'onnx', 'unicode_indexer.json'), 'utf-8')
	);
	unicodeProcessor = new UnicodeProcessor(indexer);

	// Load ONNX models
	const [dpOrt, textEncOrt, vectorEstOrt, vocoderOrt] = await Promise.all([
		ort.InferenceSession.create(join(basePath, 'onnx', 'duration_predictor.onnx')),
		ort.InferenceSession.create(join(basePath, 'onnx', 'text_encoder.onnx')),
		ort.InferenceSession.create(join(basePath, 'onnx', 'vector_estimator.onnx')),
		ort.InferenceSession.create(join(basePath, 'onnx', 'vocoder.onnx'))
	]);

	ttsInstance = new TextToSpeech(config, unicodeProcessor, dpOrt, textEncOrt, vectorEstOrt, vocoderOrt);

	// Load voice styles
	for (const voiceId of ['F1', 'F2', 'M1', 'M2']) {
		const styleData = JSON.parse(
			readFileSync(join(basePath, 'voice_styles', `${voiceId}.json`), 'utf-8')
		);
		styles[voiceId] = {
			ttl: new ort.Tensor('float32', new Float32Array(styleData.style_ttl.data.flat(2)), [
				1,
				50,
				256
			]),
			dp: new ort.Tensor('float32', new Float32Array(styleData.style_dp.data.flat(2)), [1, 8, 16])
		};
	}

	console.log('[Supertonic V2] Initialization complete');
	return { ttsInstance, unicodeProcessor, styles };
}

/**
 * POST /api/tts/supertonic-v2
 */
export async function POST({ request }) {
	try {
		const { text, voice = 'F1', speed = 1.05 } = await request.json();

		if (!text) {
			throw error(400, 'Text is required');
		}

		if (!['F1', 'F2', 'M1', 'M2'].includes(voice)) {
			throw error(400, 'Invalid voice. Must be F1, F2, M1, or M2');
		}

		console.log(`[Supertonic V2] Synthesizing: "${text}" with voice ${voice}`);

		const { ttsInstance, styles } = await initializeTTS();
		const { wav, duration } = await ttsInstance.call(text, styles[voice], 5, speed);

		console.log(
			`[Supertonic V2] Generated ${wav.length} samples (${(wav.length / ttsInstance.sampleRate).toFixed(2)}s)`
		);

		return json({
			audio: wav,
			sampleRate: ttsInstance.sampleRate
		});
	} catch (err) {
		console.error('[Supertonic V2] Synthesis error:', err);
		throw error(500, `Synthesis failed: ${err.message}`);
	}
}
