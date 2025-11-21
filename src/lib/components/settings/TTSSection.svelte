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
			// Try to fetch one of the model files (served from static/assets at runtime)
			const response = await fetch('/assets/onnx/text_encoder.onnx', { method: 'HEAD' });
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
					? '(On-Device, Requires Models)'
					: '(Models Not Found)'}
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
				<strong>Note:</strong> Supertonic requires ONNX models to be placed in
				<code>static/assets/onnx/</code> (served at <code>/assets/onnx/</code>). See documentation for setup instructions.
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
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-neon-cyan);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
	}

	.section-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input,
	.form-group select {
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
		transition: all var(--transition-base);
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--color-neon-cyan);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.form-group input[type='range'] {
		padding: 0;
		height: 6px;
		cursor: pointer;
	}

	.info-box {
		padding: var(--space-md);
		background: rgba(0, 255, 255, 0.1);
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		margin: var(--space-sm) 0;
	}

	.info-box p {
		margin: 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.5;
	}

	.info-box strong {
		color: var(--color-neon-cyan);
	}

	.info-box code {
		background: rgba(0, 0, 0, 0.4);
		padding: 2px 6px;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.9em;
		color: rgba(255, 255, 255, 0.9);
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		margin-top: var(--space-sm);
		background: rgba(220, 38, 38, 0.1);
		border: 1px solid rgba(220, 38, 38, 0.3);
		border-radius: 4px;
		color: rgba(220, 38, 38, 1);
		font-size: 0.85rem;
		line-height: 1.4;
	}

	.error-message svg {
		flex-shrink: 0;
	}
</style>
