import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	initializeAudioStore,
	updateAudioSettings,
	getAudioSettings,
	resetSettings
} from './audioStore.svelte.js';

// Mock the TTS service
vi.mock('$lib/services/tts/textToSpeech.js', () => ({
	ttsService: {
		setProvider: vi.fn().mockResolvedValue(undefined),
		updateSettings: vi.fn(),
		speak: vi.fn().mockResolvedValue(undefined),
		stop: vi.fn(),
		getVoices: vi.fn().mockResolvedValue([])
	}
}));

// Mock logger
vi.mock('../utils/logger.js', () => ({
	logger: {
		info: vi.fn(),
		debug: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('AudioStore - Per-Provider Settings', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		vi.clearAllMocks();

		// Reset to default settings
		resetSettings();
	});

	describe('Provider Settings Storage', () => {
		it('should store OpenAI settings separately from other providers', async () => {
			// Set OpenAI settings
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key-123' });
			await updateAudioSettings({ ttsApiEndpoint: 'https://custom-openai.com' });
			await updateAudioSettings({ ttsModel: 'tts-1-hd' });
			await updateAudioSettings({ ttsVoice: 'alloy' });

			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('openai');
			expect(settings.ttsApiKey).toBe('openai-key-123');
			expect(settings.ttsApiEndpoint).toBe('https://custom-openai.com');
			expect(settings.ttsModel).toBe('tts-1-hd');
			expect(settings.ttsVoice).toBe('alloy');
		});

		it('should store ElevenLabs settings separately from other providers', async () => {
			// Set ElevenLabs settings
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			await updateAudioSettings({ ttsApiKey: 'elevenlabs-key-456' });
			await updateAudioSettings({ ttsModel: 'eleven_turbo_v2' });
			await updateAudioSettings({ ttsVoice: '21m00Tcm4TlvDq8ikWAM' });

			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('elevenlabs');
			expect(settings.ttsApiKey).toBe('elevenlabs-key-456');
			expect(settings.ttsModel).toBe('eleven_turbo_v2');
			expect(settings.ttsVoice).toBe('21m00Tcm4TlvDq8ikWAM');
		});

		it('should preserve settings when switching providers', async () => {
			// Configure OpenAI
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key-123' });
			await updateAudioSettings({ ttsModel: 'tts-1-hd' });
			await updateAudioSettings({ ttsVoice: 'alloy' });

			// Switch to ElevenLabs
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			await updateAudioSettings({ ttsApiKey: 'elevenlabs-key-456' });
			await updateAudioSettings({ ttsVoice: 'rachel' });

			// Switch back to OpenAI
			await updateAudioSettings({ ttsProvider: 'openai' });

			// OpenAI settings should be restored
			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('openai');
			expect(settings.ttsApiKey).toBe('openai-key-123');
			expect(settings.ttsModel).toBe('tts-1-hd');
			expect(settings.ttsVoice).toBe('alloy');
		});

		it('should maintain ElevenLabs settings after switching away and back', async () => {
			// Configure ElevenLabs
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			await updateAudioSettings({ ttsApiKey: 'elevenlabs-key-456' });
			await updateAudioSettings({ ttsModel: 'eleven_flash_v2_5' });
			await updateAudioSettings({ ttsVoice: '21m00Tcm4TlvDq8ikWAM' });

			// Switch to OpenAI
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key-123' });

			// Switch back to ElevenLabs
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });

			// ElevenLabs settings should be restored
			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('elevenlabs');
			expect(settings.ttsApiKey).toBe('elevenlabs-key-456');
			expect(settings.ttsModel).toBe('eleven_flash_v2_5');
			expect(settings.ttsVoice).toBe('21m00Tcm4TlvDq8ikWAM');
		});
	});

	describe('LocalStorage Persistence', () => {
		it('should save per-provider settings to localStorage', async () => {
			// Configure OpenAI
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key-123' });
			await updateAudioSettings({ ttsModel: 'tts-1-hd' });

			// Check localStorage
			const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
			expect(saved).toBeTruthy();

			const parsed = JSON.parse(saved);
			expect(parsed.audio.providerSettings.openai).toEqual({
				apiKey: 'openai-key-123',
				apiEndpoint: null,
				model: 'tts-1-hd',
				voice: null
			});
		});

		it('should load per-provider settings from localStorage', async () => {
			// Save settings to localStorage
			const settings = {
				audio: {
					ttsProvider: 'openai',
					autoReadCards: false,
					autoReadPrompts: false,
					autoAnnounceRolls: false,
					readingSpeed: 'normal',
					providerSettings: {
						openai: {
							apiKey: 'openai-key-123',
							apiEndpoint: 'https://custom-openai.com',
							model: 'tts-1-hd',
							voice: 'nova'
						},
						elevenlabs: {
							apiKey: 'elevenlabs-key-456',
							model: 'eleven_turbo_v2',
							voice: 'rachel'
						}
					}
				},
				gameplay: {}
			};
			localStorage.setItem('dc-solo-rpg-audio-settings', JSON.stringify(settings));

			// Initialize audio store (loads from localStorage)
			await initializeAudioStore();

			// Check OpenAI settings
			const audioSettings = getAudioSettings();
			expect(audioSettings.ttsProvider).toBe('openai');
			expect(audioSettings.ttsApiKey).toBe('openai-key-123');
			expect(audioSettings.ttsApiEndpoint).toBe('https://custom-openai.com');
			expect(audioSettings.ttsModel).toBe('tts-1-hd');
			expect(audioSettings.ttsVoice).toBe('nova');

			// Switch to ElevenLabs and verify its settings
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			const elevenlabsSettings = getAudioSettings();
			expect(elevenlabsSettings.ttsApiKey).toBe('elevenlabs-key-456');
			expect(elevenlabsSettings.ttsModel).toBe('eleven_turbo_v2');
			expect(elevenlabsSettings.ttsVoice).toBe('rachel');
		});
	});

	describe('Migration from Old Format', () => {
		it('should migrate old OpenAI settings to new format', async () => {
			// Old format (pre-per-provider settings)
			const oldSettings = {
				audio: {
					ttsProvider: 'openai',
					ttsApiKey: 'old-openai-key',
					ttsApiEndpoint: 'https://old-endpoint.com',
					ttsModel: 'tts-1',
					ttsVoice: 'echo',
					autoReadCards: false,
					autoReadPrompts: false,
					autoAnnounceRolls: false,
					readingSpeed: 'normal'
				},
				gameplay: {}
			};
			localStorage.setItem('dc-solo-rpg-audio-settings', JSON.stringify(oldSettings));

			// Initialize (should migrate)
			await initializeAudioStore();

			// Verify migration
			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('openai');
			expect(settings.ttsApiKey).toBe('old-openai-key');
			expect(settings.ttsApiEndpoint).toBe('https://old-endpoint.com');
			expect(settings.ttsModel).toBe('tts-1');
			expect(settings.ttsVoice).toBe('echo');

			// Verify new format in localStorage
			const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
			const parsed = JSON.parse(saved);
			expect(parsed.audio.providerSettings).toBeDefined();
			expect(parsed.audio.providerSettings.openai).toEqual({
				apiKey: 'old-openai-key',
				apiEndpoint: 'https://old-endpoint.com',
				model: 'tts-1',
				voice: 'echo'
			});
		});

		it('should migrate old ElevenLabs settings to new format', async () => {
			// Old format
			const oldSettings = {
				audio: {
					ttsProvider: 'elevenlabs',
					ttsApiKey: 'old-elevenlabs-key',
					ttsModel: 'eleven_monolingual_v1',
					ttsVoice: 'rachel',
					autoReadCards: false,
					autoReadPrompts: false,
					autoAnnounceRolls: false,
					readingSpeed: 'normal'
				},
				gameplay: {}
			};
			localStorage.setItem('dc-solo-rpg-audio-settings', JSON.stringify(oldSettings));

			// Initialize (should migrate)
			await initializeAudioStore();

			// Verify migration
			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('elevenlabs');
			expect(settings.ttsApiKey).toBe('old-elevenlabs-key');
			expect(settings.ttsModel).toBe('eleven_monolingual_v1');
			expect(settings.ttsVoice).toBe('rachel');

			// Verify new format in localStorage
			const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
			const parsed = JSON.parse(saved);
			expect(parsed.audio.providerSettings.elevenlabs).toEqual({
				apiKey: 'old-elevenlabs-key',
				model: 'eleven_monolingual_v1',
				voice: 'rachel'
			});
		});

		it('should migrate old Browser settings to new format', async () => {
			// Old format
			const oldSettings = {
				audio: {
					ttsProvider: 'browser',
					ttsVoice: 'Google US English',
					autoReadCards: false,
					autoReadPrompts: false,
					autoAnnounceRolls: false,
					readingSpeed: 'normal'
				},
				gameplay: {}
			};
			localStorage.setItem('dc-solo-rpg-audio-settings', JSON.stringify(oldSettings));

			// Initialize (should migrate)
			await initializeAudioStore();

			// Verify migration
			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('browser');
			expect(settings.ttsVoice).toBe('Google US English');

			// Verify new format in localStorage
			const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
			const parsed = JSON.parse(saved);
			expect(parsed.audio.providerSettings.browser).toEqual({
				voice: 'Google US English'
			});
		});
	});

	describe('Multiple Provider Configurations', () => {
		it('should allow configuring all providers simultaneously', async () => {
			// Configure OpenAI
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key' });
			await updateAudioSettings({ ttsModel: 'tts-1-hd' });
			await updateAudioSettings({ ttsVoice: 'alloy' });

			// Configure ElevenLabs
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			await updateAudioSettings({ ttsApiKey: 'elevenlabs-key' });
			await updateAudioSettings({ ttsModel: 'eleven_flash_v2_5' });
			await updateAudioSettings({ ttsVoice: 'rachel' });

			// Configure DimmCityAI
			await updateAudioSettings({ ttsProvider: 'dimmcityai' });
			await updateAudioSettings({ ttsApiKey: 'dimmcity-key' });
			await updateAudioSettings({ ttsVoice: 'nova' });

			// Switch back to OpenAI - should have all settings
			await updateAudioSettings({ ttsProvider: 'openai' });
			let settings = getAudioSettings();
			expect(settings.ttsApiKey).toBe('openai-key');
			expect(settings.ttsModel).toBe('tts-1-hd');
			expect(settings.ttsVoice).toBe('alloy');

			// Switch to ElevenLabs - should have all settings
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			settings = getAudioSettings();
			expect(settings.ttsApiKey).toBe('elevenlabs-key');
			expect(settings.ttsModel).toBe('eleven_flash_v2_5');
			expect(settings.ttsVoice).toBe('rachel');

			// Switch to DimmCityAI - should have all settings
			await updateAudioSettings({ ttsProvider: 'dimmcityai' });
			settings = getAudioSettings();
			expect(settings.ttsApiKey).toBe('dimmcity-key');
			expect(settings.ttsVoice).toBe('nova');
		});

		it('should persist all provider configurations to localStorage', async () => {
			// Configure multiple providers
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key' });

			await updateAudioSettings({ ttsProvider: 'elevenlabs' });
			await updateAudioSettings({ ttsApiKey: 'elevenlabs-key' });

			// Check localStorage has all providers
			const saved = localStorage.getItem('dc-solo-rpg-audio-settings');
			const parsed = JSON.parse(saved);

			expect(parsed.audio.providerSettings.openai.apiKey).toBe('openai-key');
			expect(parsed.audio.providerSettings.elevenlabs.apiKey).toBe('elevenlabs-key');
		});
	});

	describe('Settings Isolation', () => {
		it('should not leak settings between providers', async () => {
			// Set OpenAI with custom endpoint
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiEndpoint: 'https://custom-openai.com' });

			// Switch to ElevenLabs (no endpoint field)
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });

			const settings = getAudioSettings();
			// ElevenLabs shouldn't have the endpoint
			expect(settings.ttsApiEndpoint).toBeNull();
		});

		it('should preserve null values correctly', async () => {
			// Set OpenAI with some null values
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key' });
			// Don't set endpoint or model (should remain null)

			const settings = getAudioSettings();
			expect(settings.ttsApiKey).toBe('openai-key');
			expect(settings.ttsApiEndpoint).toBeNull();
			expect(settings.ttsModel).toBeNull();
		});

		it('should allow clearing settings by setting to null', async () => {
			// Set OpenAI settings
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key' });
			await updateAudioSettings({ ttsModel: 'tts-1-hd' });

			// Clear model
			await updateAudioSettings({ ttsModel: null });

			const settings = getAudioSettings();
			expect(settings.ttsApiKey).toBe('openai-key');
			expect(settings.ttsModel).toBeNull();
		});
	});

	describe('Edge Cases', () => {
		it('should handle switching to unconfigured provider', async () => {
			// Configure OpenAI
			await updateAudioSettings({ ttsProvider: 'openai' });
			await updateAudioSettings({ ttsApiKey: 'openai-key' });

			// Switch to unconfigured ElevenLabs
			await updateAudioSettings({ ttsProvider: 'elevenlabs' });

			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('elevenlabs');
			expect(settings.ttsApiKey).toBeNull(); // Should be null, not OpenAI's key
			expect(settings.ttsModel).toBeNull();
			expect(settings.ttsVoice).toBeNull();
		});

		it('should handle empty localStorage gracefully', async () => {
			localStorage.clear();

			await initializeAudioStore();

			const settings = getAudioSettings();
			expect(settings.ttsProvider).toBe('browser'); // Default
			expect(settings.ttsApiKey).toBeNull();
		});

		it('should handle corrupted localStorage gracefully', async () => {
			localStorage.setItem('dc-solo-rpg-audio-settings', 'invalid json{');

			// Should not throw
			await expect(initializeAudioStore()).resolves.toBeUndefined();
		});
	});
});
