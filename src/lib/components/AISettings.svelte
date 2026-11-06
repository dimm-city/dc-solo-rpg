<script>
	/**
	 * AISettings - AI story summary settings dialog (provider, key, model, narration).
	 *
	 * Built on ContentModal, so it is a real modal dialog: focus moves in and is trapped, and
	 * Escape closes only this dialog (SM-03). Like the game's other settings, changes apply when
	 * the dialog closes; "Test key" checks a key before the player leaves.
	 */
	import { onMount } from 'svelte';
	import ContentModal from './ContentModal.svelte';
	import AIProviderSection from './settings/AIProviderSection.svelte';
	import TTSSection from './settings/TTSSection.svelte';
	import { loadAISettings, saveAISettings } from '../services/aiSettings.js';
	import { DEFAULT_MODELS, resolveModel } from '../services/storyGeneration.js';

	let { isOpen = true, onClose = () => {} } = $props();

	let aiProvider = $state('anthropic');
	let aiApiKey = $state('');
	let aiModel = $state(DEFAULT_MODELS.anthropic);
	let customEndpoint = $state('');

	onMount(async () => {
		const saved = await loadAISettings();
		if (saved) {
			aiProvider = saved.provider || 'anthropic';
			aiApiKey = saved.apiKey || '';
			// Settings saved with a retired model open on the provider's current default
			aiModel = resolveModel(aiProvider, saved.model);
			customEndpoint = saved.customEndpoint || '';
		}
	});

	async function saveAndClose() {
		await saveAISettings({
			provider: aiProvider,
			apiKey: aiApiKey.trim(),
			model: aiProvider === 'custom' ? aiModel : resolveModel(aiProvider, aiModel),
			customEndpoint: customEndpoint.trim()
		});
		onClose();
	}
</script>

<ContentModal {isOpen} title="AI settings" onClose={saveAndClose} footerButtonText="Done">
	<AIProviderSection bind:aiProvider bind:aiApiKey bind:aiModel bind:customEndpoint />
	<TTSSection />
</ContentModal>
