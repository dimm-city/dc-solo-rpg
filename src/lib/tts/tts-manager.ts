// src/lib/tts/tts-manager.ts
export type TTSMode = 'auto' | 'manual' | 'off';

export interface TTSSpeakOptions {
	regionId: string;
	text: string;
	lang?: string;
	voiceName?: string;
	rate?: number;
	pitch?: number;
}

class TTSManager {
	private currentByRegion = new Map<string, SpeechSynthesisUtterance>();

	get isSupported() {
		return typeof window !== 'undefined' && 'speechSynthesis' in window;
	}

	stop(regionId: string) {
		const utterance = this.currentByRegion.get(regionId);
		if (!utterance) return;

		window.speechSynthesis.cancel();
		this.currentByRegion.delete(regionId);
	}

	stopAll() {
		if (!this.isSupported) return;
		window.speechSynthesis.cancel();
		this.currentByRegion.clear();
	}

	speak(opts: TTSSpeakOptions) {
		if (!this.isSupported) return;

		const { regionId, text, lang, voiceName, rate = 1, pitch = 1 } = opts;

		// Cancel any existing speech for this region
		this.stop(regionId);

		if (!text.trim()) return;

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = lang ?? (document.documentElement.lang || 'en-US');
		utterance.rate = rate;
		utterance.pitch = pitch;

		const voices = window.speechSynthesis.getVoices();
		if (voiceName) {
			const v = voices.find((voice) => voice.name === voiceName);
			if (v) utterance.voice = v;
		}

		utterance.onend = () => {
			this.currentByRegion.delete(regionId);
		};
		utterance.onerror = () => {
			this.currentByRegion.delete(regionId);
		};

		this.currentByRegion.set(regionId, utterance);
		window.speechSynthesis.speak(utterance);
	}
}

export const ttsManager = new TTSManager();
