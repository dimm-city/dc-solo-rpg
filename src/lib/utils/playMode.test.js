import { describe, it, expect } from 'vitest';
import {
	PLAY_MODES,
	playModeSettings,
	detectPlayMode,
	isReadAloudOn,
	isAutoPlayOn,
	AUTO_PLAY_ON,
	AUTO_PLAY_OFF
} from './playMode.js';

const DEFAULT_AUDIO = { autoReadCards: false, autoReadPrompts: false, autoAnnounceRolls: false };
const DEFAULT_GAMEPLAY = {
	autoRollDice: false,
	autoContinueAfterReading: false,
	autoAdvanceDelay: 2000,
	autoHandleJournaling: 'manual',
	journalPauseTime: 10000
};

describe('play modes', () => {
	it('offers Manual, Read aloud and Hands-free', () => {
		expect(PLAY_MODES.map((m) => m.label)).toEqual(['Manual', 'Read aloud', 'Hands-free']);
	});

	it('default settings are Manual', () => {
		expect(detectPlayMode(DEFAULT_AUDIO, DEFAULT_GAMEPLAY)).toBe('manual');
	});

	it.each(PLAY_MODES.map((m) => m.id))('%s round-trips through its settings', (mode) => {
		const { audio, gameplay } = playModeSettings(mode);
		expect(
			detectPlayMode({ ...DEFAULT_AUDIO, ...audio }, { ...DEFAULT_GAMEPLAY, ...gameplay })
		).toBe(mode);
	});

	it('maps onto the old presets (Turn all off, Audio only, Full auto-play)', () => {
		expect(playModeSettings('hands-free')).toEqual({
			audio: { autoReadCards: true, autoReadPrompts: true, autoAnnounceRolls: true },
			gameplay: AUTO_PLAY_ON
		});
		expect(playModeSettings('read-aloud').gameplay).toEqual(AUTO_PLAY_OFF);
		expect(isReadAloudOn(playModeSettings('manual').audio)).toBe(false);
	});

	it('a mix of settings is custom (no mode)', () => {
		// Auto-play on without the narrator (the in-game AUTO toggle alone)
		expect(detectPlayMode(DEFAULT_AUDIO, { ...DEFAULT_GAMEPLAY, ...AUTO_PLAY_ON })).toBeNull();
		// Only cards read aloud
		expect(detectPlayMode({ ...DEFAULT_AUDIO, autoReadCards: true }, DEFAULT_GAMEPLAY)).toBeNull();
		// Hands-free but journal prompts wait for the player
		expect(
			detectPlayMode(
				{ autoReadCards: true, autoReadPrompts: true, autoAnnounceRolls: true },
				{ ...AUTO_PLAY_ON, autoHandleJournaling: 'manual' }
			)
		).toBeNull();
	});

	it('Hands-free keeps a journal choice of skip', () => {
		expect(
			detectPlayMode(
				{ autoReadCards: true, autoReadPrompts: true, autoAnnounceRolls: true },
				{ ...AUTO_PLAY_ON, autoHandleJournaling: 'skip' }
			)
		).toBe('hands-free');
	});

	it('isAutoPlayOn matches the in-game AUTO toggle', () => {
		expect(isAutoPlayOn(DEFAULT_GAMEPLAY)).toBe(false);
		expect(isAutoPlayOn({ ...DEFAULT_GAMEPLAY, autoHandleJournaling: 'timed' })).toBe(true);
		expect(isAutoPlayOn(AUTO_PLAY_ON)).toBe(true);
	});

	it('rejects an unknown mode', () => {
		expect(() => playModeSettings('turbo')).toThrow();
	});
});
