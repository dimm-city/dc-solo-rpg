// src/lib/tts/tts-preferences.ts
import { writable, derived, type Readable } from 'svelte/store';
import type { TTSMode } from './tts-manager';

export interface TTSRegionPrefs {
	mode: TTSMode;
	voiceName?: string;
	autoplayDelayMs?: number; // optional debounce
}

type TTSPreferencesState = Record<string, TTSRegionPrefs>;

const STORAGE_KEY = 'tts-preferences:v1';

function loadInitial(): TTSPreferencesState {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

const state = writable<TTSPreferencesState>(loadInitial());

state.subscribe((value) => {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
});

export function regionPrefs(regionId: string): Readable<TTSRegionPrefs> {
	return derived(state, ($state) => {
		return (
			$state[regionId] ?? {
				mode: 'manual',
				autoplayDelayMs: 0
			}
		);
	});
}

export function setRegionMode(regionId: string, mode: TTSMode) {
	state.update(($state) => ({
		...$state,
		[regionId]: {
			...($state[regionId] ?? { autoplayDelayMs: 0 }),
			mode
		}
	}));
}

export function setRegionVoice(regionId: string, voiceName: string | undefined) {
	state.update(($state) => ({
		...$state,
		[regionId]: {
			...($state[regionId] ?? { mode: 'manual', autoplayDelayMs: 0 }),
			voiceName
		}
	}));
}
