import { BrowserTTSProvider } from './BrowserTTSProvider.js';
import { SupertonicTTSProvider } from './SupertonicTTSProvider.js';
import { DimmCityAITTSProvider } from './DimmCityAITTSProvider.js';
import { OpenAITTSProvider } from './OpenAITTSProvider.js';
import { ElevenLabsTTSProvider } from './ElevenLabsTTSProvider.js';

/**
 * Registry of available TTS providers
 * Add new providers here as they are implemented
 */
export const TTS_PROVIDERS = {
	browser: BrowserTTSProvider,
	supertonic: SupertonicTTSProvider,
	dimmcityai: DimmCityAITTSProvider,
	openai: OpenAITTSProvider,
	elevenlabs: ElevenLabsTTSProvider
};

/**
 * Get a TTS provider by name
 * @param {string} providerName - Name of the provider
 * @returns {BaseTTSProvider} - Provider class
 */
export function getProvider(providerName) {
	const Provider = TTS_PROVIDERS[providerName];
	if (!Provider) {
		throw new Error(`TTS provider "${providerName}" not found`);
	}
	return Provider;
}

// Export individual providers
export {
	BrowserTTSProvider,
	SupertonicTTSProvider,
	DimmCityAITTSProvider,
	OpenAITTSProvider,
	ElevenLabsTTSProvider
};
