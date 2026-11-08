<!--
 * TTSSection - Text-to-Speech configuration section
 *
 * The voice list offers what works now: the browser voice, the on-device Supertonic voice,
 * and each cloud service only once its API key is saved (or while it is the chosen one).
 * "Add a voice service" opens the key fields for the others. Uses audioStore as the single
 * source of truth.
 *
 * @component
 * @example
 * <TTSSection />
 -->

<script>
	import {
		getAudioSettings,
		updateAudioSettings,
		getAvailableVoices
	} from '../../stores/audioStore.svelte.js';
	import { onMount } from 'svelte';
	import {
		CLOUD_PROVIDERS,
		listedCloudProviders,
		addableCloudProviders
	} from '../../utils/voiceProviders.js';

	/** A format hint for the key field (a placeholder is never the label); none for the rest */
	const KEY_PLACEHOLDERS = { openai: 'sk-…' };

	let availableVoices = $state([]);
	let providerError = $state(null);
	/** Set while a provider is starting up (Supertonic downloads its models the first time) */
	let switchingTo = $state(null);

	// "Add a voice service" form
	let adding = $state(false);
	let newService = $state('');
	let newKey = $state('');

	onMount(async () => {
		availableVoices = await getAvailableVoices();
	});

	let provider = $derived(getAudioSettings().ttsProvider);
	let isCloud = $derived(provider in CLOUD_PROVIDERS);
	/** Cloud services listed as voices (key saved, or the current choice) */
	let listedCloud = $derived(listedCloudProviders(getAudioSettings()));
	/** Cloud services that still need a key */
	let addableCloud = $derived(addableCloudProviders(getAudioSettings()));

	function describeError(value, error) {
		if (value === 'supertonic') return `The on-device voice could not start: ${error.message}`;
		if (value in CLOUD_PROVIDERS) {
			return `${CLOUD_PROVIDERS[value]} could not start. Check the API key and settings.`;
		}
		return `Could not switch to ${value}: ${error.message}`;
	}

	async function switchProvider(value, extra = {}) {
		providerError = null;
		switchingTo = value;
		try {
			await updateAudioSettings({ ttsProvider: value, ...extra });
			availableVoices = await getAvailableVoices();
		} catch (error) {
			providerError = describeError(value, error);
		} finally {
			switchingTo = null;
		}
	}

	async function handleTTSSettingChange(key, value) {
		try {
			await updateAudioSettings({ [key]: value });
			// Reload voices when the key or endpoint of a cloud provider changes
			if ((key === 'ttsApiKey' || key === 'ttsApiEndpoint') && isCloud) {
				availableVoices = await getAvailableVoices();
			}
		} catch (error) {
			providerError = describeError(provider, error);
		}
	}

	function openAddService() {
		adding = true;
		newService = addableCloud[0] ?? '';
		newKey = '';
	}

	async function saveService(event) {
		event.preventDefault();
		const key = newKey.trim();
		if (!newService || !key) return;
		await switchProvider(newService, { ttsApiKey: key });
		if (!providerError) {
			adding = false;
			newKey = '';
		}
	}
</script>

<section class="cm-section" aria-labelledby="narration-heading">
	<h3 class="cm-section-title" id="narration-heading">Narration</h3>
	<p class="cm-section-desc">
		The voice that reads your story aloud. The browser voice is free; the on-device voice is free
		after a one-time download.
	</p>

	<div class="cm-rows">
		<div class="cm-row">
			<div>
				<label class="cm-label" for="tts-provider">Voice provider</label>
				{#if switchingTo === 'supertonic'}
					<p class="cm-help" role="status">
						Loading the on-device voice (about 265 MB the first time)…
					</p>
				{:else if switchingTo}
					<p class="cm-help" role="status">
						Starting {CLOUD_PROVIDERS[switchingTo] ?? 'the voice'}…
					</p>
				{/if}
			</div>
			<select
				id="tts-provider"
				class="cm-control"
				value={provider}
				disabled={switchingTo !== null}
				onchange={(e) => switchProvider(e.target.value)}
			>
				<option value="browser">Browser voice (free)</option>
				<option value="supertonic">On-device voice (free, 265 MB)</option>
				{#each listedCloud as id (id)}
					<option value={id}>{CLOUD_PROVIDERS[id]}</option>
				{/each}
			</select>
		</div>

		{#if provider === 'browser'}
			<div class="cm-row">
				<label class="cm-label" for="tts-voice">Voice</label>
				<select
					id="tts-voice"
					class="cm-control"
					value={getAudioSettings().ttsVoice || ''}
					onchange={(e) => handleTTSSettingChange('ttsVoice', e.target.value || null)}
				>
					<option value="">Default system voice</option>
					{#each availableVoices as voice (voice.id)}
						<option value={voice.id}>{voice.name} ({voice.language})</option>
					{/each}
				</select>
			</div>
		{:else if provider === 'supertonic'}
			<div class="cm-row">
				<label class="cm-label" for="tts-voice">Voice style</label>
				<select
					id="tts-voice"
					class="cm-control"
					value={getAudioSettings().ttsVoice || 'F1'}
					onchange={(e) => handleTTSSettingChange('ttsVoice', e.target.value)}
				>
					<option value="F1">Female 1</option>
					<option value="F2">Female 2</option>
					<option value="M1">Male 1</option>
					<option value="M2">Male 2</option>
				</select>
			</div>
		{:else if provider === 'dimmcityai'}
			<div class="cm-row">
				<label class="cm-label" for="tts-voice">Voice</label>
				<select
					id="tts-voice"
					class="cm-control"
					value={getAudioSettings().ttsVoice || 'alloy'}
					onchange={(e) => handleTTSSettingChange('ttsVoice', e.target.value)}
				>
					<option value="alloy">Alloy (neutral)</option>
					<option value="echo">Echo (clear)</option>
					<option value="fable">Fable (warm)</option>
					<option value="onyx">Onyx (deep)</option>
					<option value="nova">Nova (bright)</option>
					<option value="shimmer">Shimmer (smooth)</option>
				</select>
			</div>
		{:else if provider === 'openai'}
			<div class="cm-row">
				<div>
					<label class="cm-label" for="tts-voice">Voice</label>
					<p class="cm-help" id="tts-voice-help">Pick one or type a custom voice ID.</p>
				</div>
				<input
					id="tts-voice"
					class="cm-control"
					type="text"
					list="openai-voices"
					aria-describedby="tts-voice-help"
					value={getAudioSettings().ttsVoice || 'alloy'}
					oninput={(e) => handleTTSSettingChange('ttsVoice', e.target.value)}
					placeholder="alloy"
				/>
				<datalist id="openai-voices">
					{#each availableVoices as voice (voice.id)}
						<option value={voice.id}>{voice.name}</option>
					{/each}
				</datalist>
			</div>
		{:else if provider === 'elevenlabs'}
			<div class="cm-row">
				<div>
					<label class="cm-label" for="tts-voice">Voice</label>
					<p class="cm-help" id="tts-voice-help">Pick one or type a custom voice ID.</p>
				</div>
				<input
					id="tts-voice"
					class="cm-control"
					type="text"
					list="elevenlabs-voices"
					aria-describedby="tts-voice-help"
					value={getAudioSettings().ttsVoice || '21m00Tcm4TlvDq8ikWAM'}
					oninput={(e) => handleTTSSettingChange('ttsVoice', e.target.value)}
					placeholder="21m00Tcm4TlvDq8ikWAM"
				/>
				<datalist id="elevenlabs-voices">
					{#each availableVoices as voice (voice.id)}
						{#if !voice.isSeparator}
							<option value={voice.id}>{voice.name}</option>
						{/if}
					{/each}
				</datalist>
			</div>
		{/if}
	</div>

	{#if providerError}
		<div class="cm-error" role="alert">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				style="flex-shrink: 0; margin-top: 3px;"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			<span>{providerError}</span>
		</div>
	{/if}

	{#if provider === 'supertonic'}
		<p class="cm-note">
			The on-device voice downloads about 265 MB of voice models the first time, then runs in this
			browser. No API key, and no text leaves your device.
		</p>
	{/if}

	{#if addableCloud.length > 0}
		{#if adding}
			<form class="add-service" onsubmit={saveService} aria-labelledby="add-service-heading">
				<p class="cm-label" id="add-service-heading">Add a voice service</p>
				<p class="cm-help">Use your own API key for a cloud voice.</p>
				<div class="cm-rows">
					<div class="cm-row">
						<label class="cm-label" for="new-tts-service">Service</label>
						<select id="new-tts-service" class="cm-control" bind:value={newService}>
							{#each addableCloud as id (id)}
								<option value={id}>{CLOUD_PROVIDERS[id]}</option>
							{/each}
						</select>
					</div>
					<div class="cm-row">
						<div>
							<label class="cm-label" for="new-tts-key">API key</label>
							<p class="cm-help" id="new-tts-key-help">Stored only in this browser.</p>
						</div>
						<input
							id="new-tts-key"
							class="cm-control"
							type="password"
							autocomplete="off"
							aria-describedby="new-tts-key-help"
							bind:value={newKey}
							placeholder={KEY_PLACEHOLDERS[newService]}
						/>
					</div>
				</div>
				<div class="add-service-actions">
					<button type="button" class="cm-btn" onclick={() => (adding = false)}>Cancel</button>
					<button type="submit" class="cm-btn" disabled={!newKey.trim() || switchingTo !== null}>
						Save and use
					</button>
				</div>
			</form>
		{:else}
			<button type="button" class="add-service-link" onclick={openAddService}>
				Add a voice service
			</button>
		{/if}
	{/if}

	{#if isCloud}
		<details class="cm-advanced">
			<summary>
				<span>{CLOUD_PROVIDERS[provider]} key and model</span>
				<span class="cm-advanced-status">
					{getAudioSettings().ttsApiKey ? 'Key saved' : 'Key needed'}
				</span>
			</summary>
			<div class="cm-rows">
				<div class="cm-row">
					<div>
						<label class="cm-label" for="tts-api-key">{CLOUD_PROVIDERS[provider]} API key</label>
						<p class="cm-help" id="tts-api-key-help">Stored only in this browser.</p>
					</div>
					<input
						id="tts-api-key"
						class="cm-control"
						type="password"
						autocomplete="off"
						aria-describedby="tts-api-key-help"
						value={getAudioSettings().ttsApiKey || ''}
						oninput={(e) => handleTTSSettingChange('ttsApiKey', e.target.value || null)}
						placeholder={KEY_PLACEHOLDERS[provider]}
					/>
				</div>

				{#if provider === 'openai'}
					<div class="cm-row">
						<div>
							<label class="cm-label" for="tts-api-endpoint">API endpoint</label>
							<p class="cm-help" id="tts-api-endpoint-help">Optional. Blank uses OpenAI.</p>
						</div>
						<input
							id="tts-api-endpoint"
							class="cm-control"
							type="url"
							aria-describedby="tts-api-endpoint-help"
							value={getAudioSettings().ttsApiEndpoint || ''}
							oninput={(e) => handleTTSSettingChange('ttsApiEndpoint', e.target.value || null)}
							placeholder="https://api.openai.com/v1/audio/speech"
						/>
					</div>
				{/if}

				{#if provider === 'openai' || provider === 'elevenlabs'}
					<div class="cm-row">
						<div>
							<label class="cm-label" for="tts-model">Model</label>
							<p class="cm-help" id="tts-model-help">
								{#if provider === 'openai'}
									Optional. Default tts-1; tts-1-hd sounds richer.
								{:else}
									Optional. Default eleven_flash_v2_5.
								{/if}
							</p>
						</div>
						<input
							id="tts-model"
							class="cm-control"
							type="text"
							aria-describedby="tts-model-help"
							value={getAudioSettings().ttsModel || ''}
							oninput={(e) => handleTTSSettingChange('ttsModel', e.target.value || null)}
							placeholder={provider === 'openai' ? 'tts-1' : 'eleven_flash_v2_5'}
						/>
					</div>
				{/if}
			</div>
		</details>
	{/if}
</section>

<style>
	.add-service-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: 4px;
		padding: 0;
		background: none;
		border: none;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-neon-cyan, #00ffff);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.add-service-link:focus-visible {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	.add-service {
		margin-top: 8px;
		padding: 16px;
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		background: rgba(0, 255, 255, 0.04);
	}

	.add-service .cm-help {
		margin-bottom: 4px;
	}

	.add-service-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}

	.add-service-actions button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
