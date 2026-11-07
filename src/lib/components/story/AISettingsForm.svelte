<script>
	/**
	 * AISettingsForm - The AI story summary settings (provider, key, model, narration),
	 * without a dialog around them. Call `save()` on the instance to store them.
	 *
	 * @component
	 * @example
	 * <AISettingsForm bind:this={form} />  ...  await form.save();
	 */
	import { onMount } from 'svelte';
	import AIProviderSection from '../settings/AIProviderSection.svelte';
	import TTSSection from '../settings/TTSSection.svelte';
	import { loadAISettings, saveAISettings } from '../../services/aiSettings.js';
	import { DEFAULT_MODELS, resolveModel } from '../../services/storyGeneration.js';

	let aiProvider = $state('anthropic');
	let aiApiKey = $state('');
	let aiModel = $state(DEFAULT_MODELS.anthropic);
	let customEndpoint = $state('');
	let loaded = false;

	onMount(async () => {
		const saved = await loadAISettings();
		if (saved) {
			aiProvider = saved.provider || 'anthropic';
			aiApiKey = saved.apiKey || '';
			// Settings saved with a retired model open on the provider's current default
			aiModel = resolveModel(aiProvider, saved.model);
			customEndpoint = saved.customEndpoint || '';
		}
		loaded = true;
	});

	/** Store the settings. Does nothing if they never finished loading. */
	export async function save() {
		if (!loaded) return false;
		return saveAISettings({
			provider: aiProvider,
			apiKey: aiApiKey.trim(),
			model: aiProvider === 'custom' ? aiModel : resolveModel(aiProvider, aiModel),
			customEndpoint: customEndpoint.trim()
		});
	}
</script>

<AIProviderSection bind:aiProvider bind:aiApiKey bind:aiModel bind:customEndpoint />
<TTSSection />
