<!--
 * GeneratedStory - Display AI-generated story with audio
 *
 * Shows story text, audio player, metadata, and regenerate action
 *
 * @component ⭐ REUSABLE
 * @example
 * <GeneratedStory
 *   {story}
 *   {isGenerating}
 *   onRegenerate={() => regenerate()}
 * />
 -->

<script>
	import { fade } from 'svelte/transition';
	import AugmentedButton from '../AugmentedButton.svelte';
	import AudioPlayer from '../AudioPlayer.svelte';

	let { story = null, isGenerating = false, onRegenerate = () => {} } = $props();
</script>

{#if story}
	<div class="story-content" transition:fade={{ duration: 300 }}>
		<div class="story-text">
			{story.text}
		</div>

		{#if story.audioData}
			<div class="story-audio">
				<AudioPlayer audioData={story.audioData} />
			</div>
		{/if}

		<div class="story-metadata">
			<span>Generated with {story.provider}</span>
			<span>•</span>
			<span>{new Date(story.generatedAt).toLocaleDateString()}</span>
		</div>

		<div class="story-actions">
			<AugmentedButton
				onclick={onRegenerate}
				disabled={isGenerating}
				style="secondary"
				label="Regenerate Story"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					slot="icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				Regenerate
			</AugmentedButton>
		</div>
	</div>
{/if}

<style>
	.story-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.story-text {
		padding: var(--space-xl);
		background: rgba(0, 0, 0, 0.3);
		border-left: 4px solid var(--color-cyber-magenta);
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.9);
		white-space: pre-wrap;
	}

	.story-audio {
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.story-metadata {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		justify-content: center;
	}

	.story-actions {
		display: flex;
		justify-content: center;
		padding-top: var(--space-md);
	}

	@media (max-width: 640px) {
		.story-text {
			padding: var(--space-md);
			font-size: 0.9rem;
		}
	}
</style>
