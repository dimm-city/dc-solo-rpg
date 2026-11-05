<!--
 * TTSSection - Text-to-Speech configuration section
 *
 * Provides UI for configuring TTS provider settings
 * Now uses audioStore as single source of truth
 *
 * @component ⭐ REUSABLE
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

	let availableVoices = $state([]);
	let providerError = $state(null);
	let providerAvailability = $state({
		browser: true,
		supertonic: false, // Will check on mount
		dimmcityai: true,
		openai: true,
		elevenlabs: true
	});

	onMount(async () => {
		availableVoices = await getAvailableVoices();

		// Check if Supertonic models are available
		await checkSupertonicAvailability();
	});

	async function checkSupertonicAvailability() {
		try {
			// Check if ONNX models are available from Hugging Face CDN
			const response = await fetch(
				'https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json'
			);
			providerAvailability.supertonic = response.ok;
		} catch {
			providerAvailability.supertonic = false;
		}
	}

	async function handleTTSSettingChange(key, value) {
		// Clear previous errors
		if (key === 'ttsProvider') {
			providerError = null;
		}

		try {
			await updateAudioSettings({ [key]: value });

			// Reload voices when provider changes or API key is set
			if (key === 'ttsProvider') {
				await loadVoices();
			} else if (key === 'ttsApiKey' || key === 'ttsApiEndpoint') {
				// Reload voices when API key or endpoint changes (for API-based providers)
				const currentProvider = getAudioSettings().ttsProvider;
				if (
					currentProvider === 'elevenlabs' ||
					currentProvider === 'openai' ||
					currentProvider === 'dimmcityai'
				) {
					await loadVoices();
				}
			}
		} catch (error) {
			// Show user-friendly error message
			if (key === 'ttsProvider') {
				if (value === 'supertonic') {
					providerError = `Supertonic TTS initialization failed: ${error.message}`;
				} else if (value === 'dimmcityai' || value === 'openai' || value === 'elevenlabs') {
					providerError = `Failed to initialize ${value} TTS. Please check your API key and settings.`;
				} else {
					providerError = `Failed to switch to ${value} provider: ${error.message}`;
				}
			}
		}
	}

	async function loadVoices() {
		availableVoices = await getAvailableVoices();
	}

	const PROVIDER_NAMES = { dimmcityai: 'DimmCityAI', openai: 'OpenAI', elevenlabs: 'ElevenLabs' };
	let provider = $derived(getAudioSettings().ttsProvider);
	let isCloud = $derived(provider in PROVIDER_NAMES);
</script>

<section class="cm-section" aria-labelledby="narration-heading">
	<h3 class="cm-section-title" id="narration-heading">Narration</h3>
	<p class="cm-section-desc">
		Hear your story read aloud. Browser voices are free; the other providers need an API key.
	</p>

	<div class="cm-rows">
		<div class="cm-row">
			<label class="cm-label" for="tts-provider">Voice provider</label>
			<select
				id="tts-provider"
				class="cm-control"
				value={provider}
				onchange={(e) => handleTTSSettingChange('ttsProvider', e.target.value)}
			>
				<option value="browser">Browser (free)</option>
				<option value="dimmcityai">DimmCityAI</option>
				<option value="openai">OpenAI</option>
				<option value="elevenlabs">ElevenLabs</option>
				<!-- Supertonic Neural TTS temporarily disabled for testing -->
				<!-- <option value="supertonic" disabled={!providerAvailability.supertonic}>
					Supertonic Neural TTS {providerAvailability.supertonic
						? '(Free, Downloads from HF)'
						: '(HF Unavailable)'}
				</option> -->
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
			<strong>Note:</strong> Supertonic downloads about 265MB of neural voice models on first use, then
			runs on your device. No API key, and no data leaves your browser.
		</p>
	{/if}

	{#if isCloud}
		<details class="cm-advanced">
			<summary>
				<span>Advanced: API key and model</span>
				<span class="cm-advanced-status">
					{getAudioSettings().ttsApiKey ? 'Key saved' : 'Key needed'}
				</span>
			</summary>
			<div class="cm-rows">
				<div class="cm-row">
					<div>
						<label class="cm-label" for="tts-api-key">{PROVIDER_NAMES[provider]} API key</label>
						<p class="cm-help" id="tts-api-key-help">Stored in this browser only.</p>
					</div>
					<input
						id="tts-api-key"
						class="cm-control"
						type="password"
						autocomplete="off"
						aria-describedby="tts-api-key-help"
						value={getAudioSettings().ttsApiKey || ''}
						oninput={(e) => handleTTSSettingChange('ttsApiKey', e.target.value || null)}
						placeholder="Paste your key"
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
