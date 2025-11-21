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
		} catch (error) {
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

			// Reload voices when provider changes
			if (key === 'ttsProvider') {
				await loadVoices();
			}
		} catch (error) {
			// Show user-friendly error message
			if (key === 'ttsProvider') {
				if (value === 'supertonic') {
					providerError = `Supertonic TTS initialization failed: ${error.message}`;
				} else if (value === 'openai' || value === 'elevenlabs') {
					providerError = `Failed to initialize ${value}. Please check your API key.`;
				} else {
					providerError = `Failed to switch to ${value} provider: ${error.message}`;
				}
			}
		}
	}

	async function loadVoices() {
		availableVoices = await getAvailableVoices();
	}
</script>

<section class="settings-section">
	<h3>Text-to-Speech (Optional)</h3>
	<p class="section-description">
		Generate audio narration of your story. Browser TTS is free but quality varies. API providers
		offer higher quality voices.
	</p>

	<div class="form-group">
		<label for="tts-provider">TTS Provider</label>
		<select
			id="tts-provider"
			value={getAudioSettings().ttsProvider}
			onchange={(e) => handleTTSSettingChange('ttsProvider', e.target.value)}
		>
			<option value="browser">Browser (Free, No API Key)</option>
			<option value="supertonic" disabled={!providerAvailability.supertonic}>
				Supertonic Neural TTS {providerAvailability.supertonic
					? '(Free, Downloads from HF)'
					: '(HF Unavailable)'}
			</option>
			<option value="openai">OpenAI TTS</option>
			<option value="elevenlabs">ElevenLabs</option>
		</select>

		{#if providerError}
			<div class="error-message">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<span>{providerError}</span>
			</div>
		{/if}
	</div>

	{#if getAudioSettings().ttsProvider !== 'browser' && getAudioSettings().ttsProvider !== 'supertonic'}
		<div class="form-group">
			<label for="tts-api-key">TTS API Key</label>
			<input
				id="tts-api-key"
				type="password"
				value={getAudioSettings().ttsApiKey || ''}
				oninput={(e) => handleTTSSettingChange('ttsApiKey', e.target.value || null)}
				placeholder="Enter your TTS API key"
			/>
		</div>
	{/if}

	{#if getAudioSettings().ttsProvider === 'browser'}
		<div class="form-group">
			<label for="tts-voice">Voice</label>
			<select
				id="tts-voice"
				value={getAudioSettings().ttsVoice || ''}
				onchange={(e) => handleTTSSettingChange('ttsVoice', e.target.value || null)}
			>
				<option value="">Default System Voice</option>
				{#each availableVoices as voice}
					<option value={voice.id}>{voice.name} ({voice.language})</option>
				{/each}
			</select>
		</div>
	{:else if getAudioSettings().ttsProvider === 'supertonic'}
		<div class="info-box">
			<p>
				<strong>Note:</strong> Supertonic loads neural TTS models (~265MB) from Hugging Face CDN, then processes speech on your device using ONNX Runtime Web (WASM/WebGPU). First use downloads models; subsequent uses are instant. No API key required and no data sent to servers.
			</p>
		</div>

		<div class="form-group">
			<label for="tts-voice">Voice Style</label>
			<select
				id="tts-voice"
				value={getAudioSettings().ttsVoice || 'F1'}
				onchange={(e) => handleTTSSettingChange('ttsVoice', e.target.value)}
			>
				<option value="F1">Female Voice 1 (F1)</option>
				<option value="F2">Female Voice 2 (F2)</option>
				<option value="M1">Male Voice 1 (M1)</option>
				<option value="M2">Male Voice 2 (M2)</option>
			</select>
		</div>
	{:else if getAudioSettings().ttsProvider === 'openai'}
		<div class="form-group">
			<label for="tts-voice">Voice</label>
			<select
				id="tts-voice"
				value={getAudioSettings().ttsVoice || 'alloy'}
				onchange={(e) => handleTTSSettingChange('ttsVoice', e.target.value)}
			>
				<option value="alloy">Alloy</option>
				<option value="echo">Echo</option>
				<option value="fable">Fable</option>
				<option value="onyx">Onyx</option>
				<option value="nova">Nova</option>
				<option value="shimmer">Shimmer</option>
			</select>
		</div>
	{:else if getAudioSettings().ttsProvider === 'elevenlabs'}
		<div class="form-group">
			<label for="tts-voice">Voice ID</label>
			<input
				id="tts-voice"
				type="text"
				value={getAudioSettings().ttsVoice || ''}
				oninput={(e) => handleTTSSettingChange('ttsVoice', e.target.value || null)}
				placeholder="Enter ElevenLabs voice ID"
			/>
			<p class="helper-text">Find voice IDs in your ElevenLabs account</p>
		</div>
	{/if}
</section>

<style>
	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.settings-section h3 {
		font-family: var(--font-display, var(--main-font-family));
		font-size: 1.25rem;
		color: var(--third-accent, #ff15cb);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: 2px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.68));
	}

	.section-description {
		font-size: 0.875rem;
		color: var(--light, rgba(255, 255, 255, 0.9));
		line-height: 1.5;
		margin: 0;
		opacity: 0.8;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--light, rgba(255, 255, 255, 0.9));
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input,
	.form-group select {
		padding: var(--space-md, 1rem);
		background: var(--translucent-dark, rgba(17, 17, 17, 0.75));
		border: 1px solid var(--secondary-accent-muted, rgba(199, 67, 255, 0.68));
		border-radius: var(--dc-default-border-radius, 0.175rem);
		color: var(--light, rgba(255, 255, 255, 0.9));
		font-size: 0.9rem;
		font-family: var(--main-font-family);
		transition: all 0.2s ease;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--third-accent, #ff15cb);
		box-shadow: 0 0 10px var(--secondary-accent-muted, rgba(199, 67, 255, 0.3));
	}

	.form-group input[type='range'] {
		padding: 0;
		height: 6px;
		cursor: pointer;
	}

	/* Fix select option visibility */
	.form-group select option {
		background: var(--opaque-dark, rgba(17, 17, 17, 0.925));
		color: var(--light, rgba(255, 255, 255, 0.9));
		padding: 0.5rem;
	}

	.form-group select option:disabled {
		color: var(--disabled-color, rgb(196, 192, 192));
	}

	.info-box {
		padding: var(--space-md, 1rem);
		background: rgba(255, 21, 203, 0.1);
		border: 1px solid var(--third-accent, #ff15cb);
		border-radius: var(--dc-default-border-radius, 0.175rem);
		margin: var(--space-sm, 0.5rem) 0;
	}

	.info-box p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--light, rgba(255, 255, 255, 0.9));
		line-height: 1.5;
	}

	.info-box strong {
		color: var(--third-accent, #ff15cb);
	}

	.info-box code {
		background: var(--translucent-dark, rgba(17, 17, 17, 0.75));
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9em;
		color: var(--light, rgba(255, 255, 255, 0.9));
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		padding: var(--space-sm, 0.5rem);
		margin-top: var(--space-sm, 0.5rem);
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid rgba(220, 38, 38, 0.5);
		border-radius: var(--dc-default-border-radius, 0.175rem);
		color: #ff6b6b;
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.error-message svg {
		flex-shrink: 0;
		color: #ff6b6b;
	}

	.helper-text {
		font-size: 0.75rem;
		color: var(--light, rgba(255, 255, 255, 0.9));
		opacity: 0.6;
		margin-top: 0.25rem;
	}
</style>
