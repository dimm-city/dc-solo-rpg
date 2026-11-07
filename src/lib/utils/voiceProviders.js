/**
 * Which read-aloud voices Settings offers (JR-05; owner decision 6: keep every provider, gate the
 * ones that need a key).
 *
 * The browser voice and the on-device Supertonic voice need no key, so they are always listed.
 * A cloud service is listed once its API key is saved, or while it is the chosen provider (so an
 * existing choice never disappears); the others are offered under "Add a voice service".
 */

/** Cloud services that need the player's own API key */
export const CLOUD_PROVIDERS = {
	dimmcityai: 'DimmCityAI',
	openai: 'OpenAI',
	elevenlabs: 'ElevenLabs'
};

/**
 * @param {{ providerSettings?: Record<string, { apiKey?: string | null }> }} audio getAudioSettings()
 * @param {string} id
 */
export function hasProviderKey(audio, id) {
	return Boolean(audio?.providerSettings?.[id]?.apiKey);
}

/**
 * Cloud services to list as voices
 * @param {{ ttsProvider?: string, providerSettings?: object }} audio getAudioSettings()
 * @returns {string[]}
 */
export function listedCloudProviders(audio) {
	return Object.keys(CLOUD_PROVIDERS).filter(
		(id) => hasProviderKey(audio, id) || id === audio?.ttsProvider
	);
}

/**
 * Cloud services that still need a key ("Add a voice service")
 * @param {{ providerSettings?: object }} audio getAudioSettings()
 * @returns {string[]}
 */
export function addableCloudProviders(audio) {
	return Object.keys(CLOUD_PROVIDERS).filter((id) => !hasProviderKey(audio, id));
}
