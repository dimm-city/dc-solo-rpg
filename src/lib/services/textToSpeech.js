/**
 * Text-to-Speech Service
 * Generates audio narration from text using various TTS providers
 */
import { logger } from '../utils/logger.js';
import { loadTTSSettings } from './aiSettings.js';

/**
 * Generate speech using browser Web Speech API
 * @param {string} text - Text to convert to speech
 * @param {Object} options - TTS options
 * @returns {Promise<Blob>} Audio blob
 */
async function generateWithBrowser(text, options = {}) {
	return new Promise((resolve, reject) => {
		// Check if browser supports Web Speech API
		if (!('speechSynthesis' in window)) {
			reject(new Error('Browser does not support Web Speech API'));
			return;
		}

		const { voice = null, rate = 1.0, pitch = 1.0, volume = 1.0 } = options;

		// Create utterance
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.rate = rate;
		utterance.pitch = pitch;
		utterance.volume = volume;

		// Set voice if specified
		if (voice) {
			const voices = speechSynthesis.getVoices();
			const selectedVoice = voices.find(v => v.name === voice || v.voiceURI === voice);
			if (selectedVoice) {
				utterance.voice = selectedVoice;
			}
		}

		// Unfortunately, Web Speech API doesn't provide direct audio blob access
		// We'll use MediaRecorder to capture the audio
		const mediaStream = new MediaStreamAudioDestinationNode(new AudioContext());
		const mediaRecorder = new MediaRecorder(mediaStream.stream);
		const audioChunks = [];

		mediaRecorder.ondataavailable = (event) => {
			audioChunks.push(event.data);
		};

		mediaRecorder.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
			resolve(audioBlob);
		};

		utterance.onend = () => {
			mediaRecorder.stop();
		};

		utterance.onerror = (event) => {
			mediaRecorder.stop();
			reject(new Error(`Speech synthesis error: ${event.error}`));
		};

		// Start recording and speaking
		mediaRecorder.start();
		speechSynthesis.speak(utterance);
	});
}

/**
 * Generate speech using OpenAI TTS API
 * @param {string} text - Text to convert to speech
 * @param {Object} settings - TTS settings with API key
 * @returns {Promise<Blob>} Audio blob
 */
async function generateWithOpenAI(text, settings) {
	const { apiKey, voice = 'alloy', model = 'tts-1' } = settings;

	const response = await fetch('https://api.openai.com/v1/audio/speech', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			input: text,
			voice // alloy, echo, fable, onyx, nova, shimmer
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`OpenAI TTS error: ${error.error?.message || response.statusText}`);
	}

	return await response.blob();
}

/**
 * Generate speech using ElevenLabs API
 * @param {string} text - Text to convert to speech
 * @param {Object} settings - TTS settings with API key
 * @returns {Promise<Blob>} Audio blob
 */
async function generateWithElevenLabs(text, settings) {
	const { apiKey, voice = '21m00Tcm4TlvDq8ikWAM', model = 'eleven_monolingual_v1' } = settings;

	const response = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'xi-api-key': apiKey
			},
			body: JSON.stringify({
				text,
				model_id: model,
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.75
				}
			})
		}
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`ElevenLabs TTS error: ${error.detail?.message || response.statusText}`);
	}

	return await response.blob();
}

/**
 * Generate audio narration from text
 * @param {string} text - Text to narrate
 * @returns {Promise<Blob>} Audio blob
 */
export async function generateAudioNarration(text) {
	try {
		logger.info('[textToSpeech] Starting audio generation');

		if (!text || text.trim().length === 0) {
			throw new Error('No text provided for narration');
		}

		// Load TTS settings
		const settings = await loadTTSSettings();

		logger.info('[textToSpeech] Using provider:', settings.provider);

		let audioBlob;
		switch (settings.provider) {
			case 'browser':
				logger.info('[textToSpeech] Using browser Web Speech API');
				audioBlob = await generateWithBrowser(text, settings.options);
				break;

			case 'openai':
				if (!settings.apiKey) {
					throw new Error('OpenAI API key not configured');
				}
				logger.info('[textToSpeech] Using OpenAI TTS');
				audioBlob = await generateWithOpenAI(text, settings);
				break;

			case 'elevenlabs':
				if (!settings.apiKey) {
					throw new Error('ElevenLabs API key not configured');
				}
				logger.info('[textToSpeech] Using ElevenLabs');
				audioBlob = await generateWithElevenLabs(text, settings);
				break;

			default:
				throw new Error(`Unknown TTS provider: ${settings.provider}`);
		}

		logger.info('[textToSpeech] Audio generated successfully, size:', audioBlob.size);
		return audioBlob;
	} catch (error) {
		logger.error('[textToSpeech] Failed to generate audio:', error);
		throw error;
	}
}

/**
 * Get available voices for browser TTS
 * @returns {Promise<Array>} List of available voices
 */
export async function getAvailableVoices() {
	return new Promise((resolve) => {
		if (!('speechSynthesis' in window)) {
			resolve([]);
			return;
		}

		let voices = speechSynthesis.getVoices();

		if (voices.length > 0) {
			resolve(voices);
			return;
		}

		// Voices might not be loaded yet, wait for them
		speechSynthesis.onvoiceschanged = () => {
			voices = speechSynthesis.getVoices();
			resolve(voices);
		};
	});
}

/**
 * Check if TTS is available (browser support or API configured)
 * @returns {Promise<boolean>} True if TTS is available
 */
export async function isTTSAvailable() {
	try {
		const settings = await loadTTSSettings();

		if (settings.provider === 'browser') {
			return 'speechSynthesis' in window;
		}

		// For API providers, check if API key is configured
		return !!(settings.apiKey);
	} catch (error) {
		logger.error('[textToSpeech] Failed to check TTS availability:', error);
		return false;
	}
}
