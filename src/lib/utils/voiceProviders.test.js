import { describe, it, expect } from 'vitest';
import {
	CLOUD_PROVIDERS,
	listedCloudProviders,
	addableCloudProviders,
	hasProviderKey
} from './voiceProviders.js';

const noKeys = {
	ttsProvider: 'browser',
	providerSettings: {
		browser: { voice: null },
		openai: { apiKey: null },
		elevenlabs: { apiKey: null },
		dimmcityai: { apiKey: null },
		supertonic: { voice: 'F1' }
	}
};

const withKey = (id, over = {}) => ({
	...noKeys,
	...over,
	providerSettings: { ...noKeys.providerSettings, [id]: { apiKey: 'sk-test' } }
});

describe('voice providers', () => {
	it('lists no cloud service until a key is present', () => {
		expect(listedCloudProviders(noKeys)).toEqual([]);
		expect(addableCloudProviders(noKeys)).toEqual(Object.keys(CLOUD_PROVIDERS));
	});

	it('lists a service once its key is saved, and stops offering to add it', () => {
		const audio = withKey('openai');
		expect(hasProviderKey(audio, 'openai')).toBe(true);
		expect(listedCloudProviders(audio)).toEqual(['openai']);
		expect(addableCloudProviders(audio)).toEqual(['dimmcityai', 'elevenlabs']);
	});

	it('keeps the chosen provider listed even without a key', () => {
		expect(listedCloudProviders({ ...noKeys, ttsProvider: 'elevenlabs' })).toEqual(['elevenlabs']);
	});

	it('copes with missing settings', () => {
		expect(listedCloudProviders(undefined)).toEqual([]);
		expect(addableCloudProviders({})).toHaveLength(3);
	});
});
