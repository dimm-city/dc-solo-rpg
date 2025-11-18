<script>
	/**
	 * AISettings - Configuration for AI story generation and TTS
	 */
	import AugmentedButton from './AugmentedButton.svelte';
	import {
		loadAISettings,
		saveAISettings,
		loadTTSSettings,
		saveTTSSettings
	} from '../services/aiSettings.js';
	import { getAvailableVoices } from '../services/textToSpeech.js';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { onClose = () => {} } = $props();

	// AI Provider Settings
	let aiProvider = $state('anthropic');
	let aiApiKey = $state('');
	let aiModel = $state('claude-3-5-sonnet-20241022');
	let customEndpoint = $state('');

	// TTS Settings
	let ttsProvider = $state('browser');
	let ttsApiKey = $state('');
	let ttsVoice = $state('');
	let ttsRate = $state(1.0);
	let ttsPitch = $state(1.0);

	// Available voices for browser TTS
	let availableVoices = $state([]);

	// UI state
	let isSaving = $state(false);
	let saveMessage = $state('');

	onMount(async () => {
		// Load existing settings
		const aiSettings = await loadAISettings();
		if (aiSettings) {
			aiProvider = aiSettings.provider || 'anthropic';
			aiApiKey = aiSettings.apiKey || '';
			aiModel = aiSettings.model || 'claude-3-5-sonnet-20241022';
			customEndpoint = aiSettings.customEndpoint || '';
		}

		const ttsSettings = await loadTTSSettings();
		if (ttsSettings) {
			ttsProvider = ttsSettings.provider || 'browser';
			ttsApiKey = ttsSettings.apiKey || '';
			ttsVoice = ttsSettings.voice || '';
			ttsRate = ttsSettings.options?.rate || 1.0;
			ttsPitch = ttsSettings.options?.pitch || 1.0;
		}

		// Load available voices for browser TTS
		availableVoices = await getAvailableVoices();
	});

	async function handleSave() {
		isSaving = true;
		saveMessage = '';

		try {
			// Save AI settings
			const aiSettings = {
				provider: aiProvider,
				apiKey: aiApiKey,
				model: aiModel,
				customEndpoint: customEndpoint
			};
			await saveAISettings(aiSettings);

			// Save TTS settings
			const ttsSettings = {
				provider: ttsProvider,
				apiKey: ttsApiKey,
				voice: ttsVoice,
				options: {
					rate: ttsRate,
					pitch: ttsPitch,
					volume: 1.0
				}
			};
			await saveTTSSettings(ttsSettings);

			saveMessage = 'Settings saved successfully!';
			setTimeout(() => {
				onClose();
			}, 1500);
		} catch (error) {
			saveMessage = `Error: ${error.message}`;
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="ai-settings-overlay" transition:fade={{ duration: 200 }}>
	<div class="ai-settings-modal" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
		<div class="modal-header">
			<h2>AI Story Generation Settings</h2>
			<button class="close-button" onclick={onClose} aria-label="Close settings">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<div class="modal-content">
			<!-- AI Provider Section -->
			<section class="settings-section">
				<h3>AI Provider</h3>
				<p class="section-description">
					Choose your AI provider for story generation. You'll need an API key from the selected
					provider.
				</p>

				<div class="form-group">
					<label for="ai-provider">Provider</label>
					<select id="ai-provider" bind:value={aiProvider}>
						<option value="anthropic">Anthropic (Claude)</option>
						<option value="openai">OpenAI (GPT-4)</option>
						<option value="custom">Custom Endpoint</option>
					</select>
				</div>

				<div class="form-group">
					<label for="ai-api-key">API Key</label>
					<input
						id="ai-api-key"
						type="password"
						bind:value={aiApiKey}
						placeholder="Enter your API key"
					/>
					<small class="help-text">
						{#if aiProvider === 'anthropic'}
							Get your API key from <a
								href="https://console.anthropic.com/"
								target="_blank"
								rel="noopener">console.anthropic.com</a
							>
						{:else if aiProvider === 'openai'}
							Get your API key from <a
								href="https://platform.openai.com/api-keys"
								target="_blank"
								rel="noopener">platform.openai.com</a
							>
						{:else}
							Enter your custom API endpoint URL below
						{/if}
					</small>
				</div>

				{#if aiProvider === 'anthropic'}
					<div class="form-group">
						<label for="ai-model">Model</label>
						<select id="ai-model" bind:value={aiModel}>
							<option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
							<option value="claude-3-opus-20240229">Claude 3 Opus</option>
							<option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
						</select>
					</div>
				{:else if aiProvider === 'openai'}
					<div class="form-group">
						<label for="ai-model">Model</label>
						<select id="ai-model" bind:value={aiModel}>
							<option value="gpt-4o">GPT-4o (Recommended)</option>
							<option value="gpt-4-turbo">GPT-4 Turbo</option>
							<option value="gpt-4">GPT-4</option>
						</select>
					</div>
				{/if}

				{#if aiProvider === 'custom'}
					<div class="form-group">
						<label for="custom-endpoint">Custom Endpoint URL</label>
						<input
							id="custom-endpoint"
							type="url"
							bind:value={customEndpoint}
							placeholder="https://your-api.example.com/generate"
						/>
					</div>
				{/if}
			</section>

			<!-- TTS Section -->
			<section class="settings-section">
				<h3>Text-to-Speech (Optional)</h3>
				<p class="section-description">
					Generate audio narration of your story. Browser TTS is free but quality varies. API
					providers offer higher quality voices.
				</p>

				<div class="form-group">
					<label for="tts-provider">TTS Provider</label>
					<select id="tts-provider" bind:value={ttsProvider}>
						<option value="browser">Browser (Free, No API Key)</option>
						<option value="openai">OpenAI TTS</option>
						<option value="elevenlabs">ElevenLabs</option>
					</select>
				</div>

				{#if ttsProvider !== 'browser'}
					<div class="form-group">
						<label for="tts-api-key">TTS API Key</label>
						<input
							id="tts-api-key"
							type="password"
							bind:value={ttsApiKey}
							placeholder="Enter your TTS API key"
						/>
					</div>
				{/if}

				{#if ttsProvider === 'browser'}
					<div class="form-group">
						<label for="tts-voice">Voice</label>
						<select id="tts-voice" bind:value={ttsVoice}>
							<option value="">Default System Voice</option>
							{#each availableVoices as voice}
								<option value={voice.name}>{voice.name} ({voice.lang})</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="tts-rate">Speed: {ttsRate.toFixed(1)}x</label>
						<input id="tts-rate" type="range" min="0.5" max="2.0" step="0.1" bind:value={ttsRate} />
					</div>

					<div class="form-group">
						<label for="tts-pitch">Pitch: {ttsPitch.toFixed(1)}</label>
						<input
							id="tts-pitch"
							type="range"
							min="0.5"
							max="2.0"
							step="0.1"
							bind:value={ttsPitch}
						/>
					</div>
				{:else if ttsProvider === 'openai'}
					<div class="form-group">
						<label for="tts-voice">Voice</label>
						<select id="tts-voice" bind:value={ttsVoice}>
							<option value="alloy">Alloy</option>
							<option value="echo">Echo</option>
							<option value="fable">Fable</option>
							<option value="onyx">Onyx</option>
							<option value="nova">Nova</option>
							<option value="shimmer">Shimmer</option>
						</select>
					</div>
				{/if}
			</section>
		</div>

		<div class="modal-footer">
			{#if saveMessage}
				<div
					class="save-message"
					class:success={saveMessage.includes('success')}
					class:error={saveMessage.includes('Error')}
				>
					{saveMessage}
				</div>
			{/if}

			<div class="button-group">
				<AugmentedButton onclick={onClose} style="secondary" label="Cancel">
					Cancel
				</AugmentedButton>

				<AugmentedButton
					onclick={handleSave}
					disabled={isSaving || !aiApiKey}
					label="Save Settings"
				>
					{isSaving ? 'Saving...' : 'Save Settings'}
				</AugmentedButton>
			</div>
		</div>
	</div>
</div>

<style>
	.ai-settings-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-lg);
		overflow-y: auto;
	}

	.ai-settings-modal {
		background: linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 26, 0.95));
		border: 2px solid rgba(138, 43, 226, 0.4);
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		--aug-border-bg: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.2));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(138, 43, 226, 0.4);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-xl);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-header h2 {
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--color-cyber-magenta);
		margin: 0;
	}

	.close-button {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(220, 20, 60, 0.2);
		border: 2px solid rgba(220, 20, 60, 0.5);
		border-radius: 50%;
		color: rgba(220, 20, 60, 1);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.close-button:hover {
		background: rgba(220, 20, 60, 0.3);
		transform: scale(1.05);
	}

	.modal-content {
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

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

	.help-text {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.4;
	}

	.help-text a {
		color: var(--color-neon-cyan);
		text-decoration: none;
	}

	.help-text a:hover {
		text-decoration: underline;
	}

	.modal-footer {
		padding: var(--space-xl);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.save-message {
		padding: var(--space-md);
		border-radius: 4px;
		text-align: center;
		font-size: 0.875rem;
	}

	.save-message.success {
		background: rgba(0, 255, 100, 0.2);
		border: 1px solid rgba(0, 255, 100, 0.4);
		color: rgba(0, 255, 100, 1);
	}

	.save-message.error {
		background: rgba(220, 20, 60, 0.2);
		border: 1px solid rgba(220, 20, 60, 0.4);
		color: rgba(220, 20, 60, 1);
	}

	.button-group {
		display: flex;
		gap: var(--space-md);
		justify-content: flex-end;
	}

	@media (max-width: 640px) {
		.ai-settings-modal {
			max-width: 100%;
			max-height: 100vh;
		}

		.modal-header,
		.modal-content,
		.modal-footer {
			padding: var(--space-md);
		}

		.button-group {
			flex-direction: column;
		}
	}
</style>
