<script>
	/**
	 * StoryGenerationPanel - AI story generation and display
	 * Integrated into StoryMode to generate narrative summaries
	 */
	import AugmentedButton from './AugmentedButton.svelte';
	import GeneratedStory from './story/GeneratedStory.svelte';
	import AISettings from './AISettings.svelte';
	import { useStoryGeneration } from '$lib/composables/useStoryGeneration.svelte.js';
	import { fade, slide } from 'svelte/transition';

	let {
		savedGame = null, // Complete saved game object
		saveKey = '' // IndexedDB save key (gameSlug:completed:timestamp)
	} = $props();

	// Use story generation composable
	const storyGen = useStoryGeneration(savedGame, saveKey);
</script>

{#if storyGen.showSettings}
	<AISettings onClose={storyGen.closeSettings} />
{/if}

<div class="story-generation-panel" transition:slide={{ duration: 300 }}>
	<div class="panel-header" data-augmented-ui="tl-clip tr-clip border">
		<div class="header-content">
			<h3>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				AI Story Summary
			</h3>
			<button class="settings-button" onclick={storyGen.openSettings} aria-label="AI Settings">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<circle cx="12" cy="12" r="3" />
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 1v6m0 6v6m9.071-13.071l-4.242 4.242m-5.656 5.656l-4.242 4.242M1 12h6m6 0h6m1.071-9.071l-4.242 4.242m-5.656 5.656l-4.242 4.242"
					/>
				</svg>
			</button>
		</div>
		<p class="panel-description">
			Generate a narrative summary of your game session using AI, with optional audio narration.
		</p>
	</div>

	<div class="panel-body">
		{#if !storyGen.hasStory}
			{#if !storyGen.aiConfigured}
				<div class="info-card" transition:fade={{ duration: 200 }}>
					<p>Configure your AI provider to generate story summaries.</p>
					<AugmentedButton onclick={storyGen.openSettings} label="Configure AI">
						Configure AI Settings
					</AugmentedButton>
				</div>
			{:else}
				<div class="generation-controls" transition:fade={{ duration: 200 }}>
					{#if storyGen.ttsAvailable}
						<label class="checkbox-label">
							<input
								type="checkbox"
								bind:checked={storyGen.generateAudio}
								disabled={storyGen.isGenerating}
							/>
							<span>Generate audio narration</span>
						</label>
					{/if}

					<AugmentedButton
						onclick={storyGen.generateStory}
						disabled={storyGen.isGenerating}
						label="Generate AI Story"
					>
						{storyGen.isGenerating ? storyGen.progressMessage : 'Generate Story'}
					</AugmentedButton>

					{#if storyGen.errorMessage}
						<div class="error-message" transition:fade={{ duration: 200 }}>
							{storyGen.errorMessage}
						</div>
					{/if}
				</div>
			{/if}
		{:else}
			<!-- Story Display -->
			<GeneratedStory
				story={storyGen.story}
				isGenerating={storyGen.isGenerating}
				onRegenerate={storyGen.regenerateStory}
			/>
		{/if}
	</div>
</div>

<style>
	.story-generation-panel {
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(75, 0, 130, 0.2));
		border: 2px solid rgba(186, 85, 211, 0.4);
		border-radius: 8px;
		overflow: hidden;
	}

	.panel-header {
		padding: var(--space-lg);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(26, 26, 26, 0.6));
		border-bottom: 2px solid rgba(186, 85, 211, 0.3);
		--aug-border-bg: linear-gradient(135deg, rgba(186, 85, 211, 0.2), rgba(138, 43, 226, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(186, 85, 211, 0.3);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
	}

	.panel-header h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-cyber-magenta);
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.panel-header h3 svg {
		color: var(--color-cyber-magenta);
	}

	.panel-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.5;
	}

	.settings-button {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(138, 43, 226, 0.2);
		border: 2px solid rgba(138, 43, 226, 0.4);
		border-radius: 50%;
		color: var(--color-cyber-magenta);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.settings-button:hover {
		background: rgba(138, 43, 226, 0.3);
		border-color: rgba(138, 43, 226, 0.6);
		transform: scale(1.05);
	}

	.panel-body {
		padding: var(--space-xl);
	}

	.info-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		text-align: center;
	}

	.info-card p {
		margin: 0;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
	}

	.generation-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: stretch;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.error-message {
		padding: var(--space-md);
		background: rgba(220, 20, 60, 0.2);
		border: 1px solid rgba(220, 20, 60, 0.4);
		border-radius: 4px;
		color: rgba(220, 20, 60, 1);
		font-size: 0.875rem;
		text-align: center;
	}


	@media (max-width: 640px) {
		.panel-header {
			padding: var(--space-md);
		}

		.panel-body {
			padding: var(--space-md);
		}

	}
</style>
