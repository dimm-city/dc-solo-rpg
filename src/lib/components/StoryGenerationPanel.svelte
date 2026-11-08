<script>
	/**
	 * StoryGenerationPanel - the optional AI summary of a finished run.
	 *
	 * Renders a small "Summarise with AI" button (it sits in the story mode header) and one
	 * dialog behind it with two views: the summary, and the AI settings. Closing the settings
	 * (Done, Escape or ×) saves them and goes back to the summary; one dialog means focus never
	 * leaves it while the view changes.
	 */
	import { tick } from 'svelte';
	import ContentModal from './ContentModal.svelte';
	import GeneratedStory from './story/GeneratedStory.svelte';
	import AISettingsForm from './story/AISettingsForm.svelte';
	import { useStoryGeneration } from '$lib/composables/useStoryGeneration.svelte.js';

	let {
		savedGame = null, // Complete saved game object
		saveKey = '' // IndexedDB save key (gameSlug:completed:timestamp)
	} = $props();

	const storyGen = useStoryGeneration(savedGame, saveKey);

	let open = $state(false);
	/** 'summary' or 'settings' */
	let view = $state('summary');
	let form = $state();
	let body = $state();
	let buttonLabel = $derived(storyGen.hasStory ? 'Read AI summary' : 'Summarise with AI');

	async function showView(next) {
		view = next;
		await tick();
		// The button that switched views is gone; put focus on the first control of the new view
		body?.querySelector('select, input, button:not([disabled])')?.focus();
	}

	async function handleClose() {
		if (view === 'settings') {
			await form?.save();
			await storyGen.closeSettings(); // re-checks whether a provider is set up
			showView('summary');
			return;
		}
		open = false;
	}

	function openDialog() {
		view = 'summary';
		open = true;
	}
</script>

<button
	type="button"
	class="summary-trigger"
	onclick={openDialog}
	aria-haspopup="dialog"
	data-testid="ai-summary-button"
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
		<path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
	</svg>
	<span>{buttonLabel}</span>
</button>

<ContentModal
	isOpen={open}
	title={view === 'settings' ? 'AI settings' : 'AI summary'}
	onClose={handleClose}
>
	<div bind:this={body}>
		{#if view === 'settings'}
			<AISettingsForm bind:this={form} />
		{:else if storyGen.hasStory}
			<GeneratedStory
				story={storyGen.story}
				isGenerating={storyGen.isGenerating}
				onRegenerate={storyGen.regenerateStory}
			/>
			{#if storyGen.errorMessage}
				<p class="cm-error" role="alert">{storyGen.errorMessage}</p>
			{/if}
		{:else}
			<p class="summary-intro">
				An AI can read your journal and the cards you drew, and retell this run as one short story
				of about 500 words. It uses your own API key, so nothing is sent until you ask.
			</p>

			{#if !storyGen.aiConfigured}
				<div class="cm-btn-group">
					<button type="button" class="cm-btn" onclick={() => showView('settings')}
						>Set up AI</button
					>
				</div>
			{:else}
				{#if storyGen.ttsAvailable}
					<label class="cm-label read-aloud">
						<input
							type="checkbox"
							class="cm-switch"
							bind:checked={storyGen.generateAudio}
							disabled={storyGen.isGenerating}
						/>
						<span>Also record it as narration</span>
					</label>
				{/if}

				<div class="cm-btn-group">
					<button
						type="button"
						class="cm-btn primary"
						onclick={storyGen.generateStory}
						disabled={storyGen.isGenerating}
					>
						{storyGen.isGenerating ? 'Writing…' : 'Write the summary'}
					</button>
					<button type="button" class="cm-btn" onclick={() => showView('settings')}
						>AI settings</button
					>
				</div>

				<p class="progress" role="status" aria-live="polite">
					{storyGen.isGenerating ? storyGen.progressMessage : ''}
				</p>

				{#if storyGen.errorMessage}
					<p class="cm-error" role="alert">{storyGen.errorMessage}</p>
				{/if}
			{/if}
		{/if}
	</div>
</ContentModal>

<style>
	.summary-trigger {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 16px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(217, 70, 239, 0.55);
		border-radius: 4px;
		color: #f3d9fb;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			border-color 150ms ease-out;
	}

	.summary-trigger svg {
		flex-shrink: 0;
		color: var(--color-cyber-magenta);
	}

	.summary-trigger:hover {
		background: rgba(217, 70, 239, 0.14);
		border-color: var(--color-cyber-magenta);
	}

	.summary-intro {
		margin: 0;
		max-width: var(--measure, 30em);
		color: #d5dfeb;
	}

	.read-aloud {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
		font-size: 1rem;
		color: #fff;
		cursor: pointer;
	}

	.cm-btn.primary {
		background: linear-gradient(135deg, #831d98, #6d22c7);
		border-color: var(--color-cyber-magenta);
		color: var(--color-brand-yellow);
	}

	.cm-btn:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.progress {
		min-height: 1.5em;
		margin: 12px 0 0;
		font-size: 0.875rem;
		color: #aebbcc;
	}

	@media (prefers-reduced-motion: reduce) {
		.summary-trigger {
			transition: none;
		}
	}
</style>
