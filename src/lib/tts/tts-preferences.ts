// src/lib/tts/tts-preferences.ts
import { writable } from 'svelte/store';
import type { TTSMode } from './tts-manager';

export interface TTSGlobalPrefs {
	mode: TTSMode;
	voiceName?: string;
	autoplayDelayMs?: number; // optional debounce
}

const STORAGE_KEY = 'tts-preferences:v2';

function loadInitial(): TTSGlobalPrefs {
	if (typeof localStorage === 'undefined') {
		return { mode: 'manual', autoplayDelayMs: 0 };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : { mode: 'manual', autoplayDelayMs: 0 };
	} catch {
		return { mode: 'manual', autoplayDelayMs: 0 };
	}
}

// Global preferences store
export const globalPrefs = writable<TTSGlobalPrefs>(loadInitial());

globalPrefs.subscribe((value) => {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
});

export function setGlobalMode(mode: TTSMode) {
	globalPrefs.update((prefs) => ({
		...prefs,
		mode
	}));
}

export function setGlobalVoice(voiceName: string | undefined) {
	globalPrefs.update((prefs) => ({
		...prefs,
		voiceName
	}));
}
