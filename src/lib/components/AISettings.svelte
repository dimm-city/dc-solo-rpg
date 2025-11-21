<script>
	/**
	 * AISettings - Configuration for AI story generation and TTS
	 * TTS settings now managed by audioStore for consistency
	 */
	import AugmentedButton from './AugmentedButton.svelte';
	import AIProviderSection from './settings/AIProviderSection.svelte';
	import TTSSection from './settings/TTSSection.svelte';
	import { loadAISettings, saveAISettings } from '../services/aiSettings.js';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { onClose = () => {} } = $props();

	// AI Provider Settings
	let aiProvider = $state('anthropic');
	let aiApiKey = $state('');
	let aiModel = $state('claude-3-5-sonnet-20241022');
	let customEndpoint = $state('');

	// UI state
	let isSaving = $state(false);
	let saveMessage = $state('');

	onMount(async () => {
		// Load existing AI settings
		const aiSettings = await loadAISettings();
		if (aiSettings) {
			aiProvider = aiSettings.provider || 'anthropic';
			aiApiKey = aiSettings.apiKey || '';
			aiModel = aiSettings.model || 'claude-3-5-sonnet-20241022';
			customEndpoint = aiSettings.customEndpoint || '';
		}
		// Note: TTS settings are now managed by audioStore and loaded automatically
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

			// Note: TTS settings are auto-saved by audioStore when changed
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
			<AIProviderSection
				bind:aiProvider
				bind:aiApiKey
				bind:aiModel
				bind:customEndpoint
			/>

			<!-- TTS Section - Now uses audioStore directly -->
			<TTSSection />
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
