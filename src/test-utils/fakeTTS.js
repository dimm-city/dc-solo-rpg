/**
 * A TTS provider for tests whose utterances end on command, the way a voice ends a sentence:
 * `fake.end()` finishes the one being read; `stop()` cuts it off (and, like the real providers,
 * settles its speak() promise). Install it with installFakeTTS(), which makes it the active
 * provider of the shared ttsService.
 */
import { BaseTTSProvider } from '../lib/services/tts/providers/BaseTTSProvider.js';
import { TTS_PROVIDERS } from '../lib/services/tts/providers/index.js';
import { ttsService } from '../lib/services/tts/textToSpeech.js';

export class FakeTTSProvider extends BaseTTSProvider {
	constructor() {
		super();
		/** Every text handed to speak(), in order */
		this.spoken = [];
		/** @type {{ text: string, resolve: () => void } | null} The utterance being read */
		this.current = null;
		/** How many times the voice was cut off */
		this.stops = 0;
	}

	async initialize() {}

	speak(text) {
		this.stop();
		this.stops--; // the stop above is housekeeping, not a cut-off
		this.spoken.push(text);
		return new Promise((resolve) => {
			this.current = { text, resolve };
		});
	}

	/** The voice reaches the end of what it is reading. @returns {boolean} whether it was reading */
	end() {
		const current = this.current;
		if (!current) return false;
		this.current = null;
		current.resolve();
		return true;
	}

	stop() {
		this.stops++;
		this.end();
	}

	pause() {}

	resume() {}

	isSpeaking() {
		return this.current !== null;
	}

	async getVoices() {
		return [];
	}

	getName() {
		return 'Fake TTS';
	}
}

/**
 * Register the fake provider and make it the one the shared ttsService speaks through.
 * @returns {Promise<FakeTTSProvider>} the instance in use
 */
export async function installFakeTTS() {
	let instance;
	TTS_PROVIDERS.fake = class extends FakeTTSProvider {
		constructor() {
			super();
			instance = this;
		}
	};
	await ttsService.setProvider('fake');
	return instance;
}
