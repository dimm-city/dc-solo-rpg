import { BrowserTTSProvider } from './BrowserTTSProvider.js';

/**
 * Registry of available TTS providers
 * Add new providers here as they are implemented
 */
export const TTS_PROVIDERS = {
	browser: BrowserTTSProvider
	// Future providers:
	// elevenlabs: ElevenLabsProvider,
	// openai: OpenAIProvider,
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

/**
 * Get list of available provider names
 * @returns {string[]}
 */
export function getAvailableProviders() {
	return Object.keys(TTS_PROVIDERS);
}

/**
 * Check if a provider is available
 * @param {string} providerName
 * @returns {boolean}
 */
export function isProviderAvailable(providerName) {
	return providerName in TTS_PROVIDERS;
}
