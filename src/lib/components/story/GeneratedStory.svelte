<!--
 * GeneratedStory - An AI summary of a finished run, with optional narration
 *
 * Reading face (Inter, about 18px, 640px measure) to match the journal in story mode.
 *
 * @component
 * @example
 * <GeneratedStory {story} {isGenerating} onRegenerate={() => regenerate()} />
 -->

<script>
	import AudioPlayer from '../AudioPlayer.svelte';
	import { CLAUDE_MODELS } from '../../services/storyGeneration.js';

	let { story = null, isGenerating = false, onRegenerate = () => {} } = $props();

	const PROVIDERS = { anthropic: 'Claude', openai: 'OpenAI', custom: 'your endpoint' };

	let source = $derived.by(() => {
		if (!story) return '';
		const claude = CLAUDE_MODELS.find((m) => m.id === story.model);
		return claude ? claude.label.replace(/ \(.*\)$/, '') : (PROVIDERS[story.provider] ?? 'AI');
	});

	let date = $derived(
		story?.generatedAt
			? new Date(story.generatedAt).toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				})
			: ''
	);
</script>

{#if story}
	<div class="generated-story">
		{#if story.audioData}
			<div class="story-audio">
				<AudioPlayer audioData={story.audioData} />
			</div>
		{/if}

		<div class="story-text">{story.text}</div>

		<div class="story-footer">
			<p class="story-source">Written by {source}{date ? ` · ${date}` : ''}</p>
			<button type="button" class="cm-btn" onclick={onRegenerate} disabled={isGenerating}>
				{isGenerating ? 'Writing…' : 'Write it again'}
			</button>
		</div>
	</div>
{/if}

<style>
	.generated-story {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.story-text {
		max-width: 640px;
		font-family: var(--font-body);
		font-size: 1.125rem;
		line-height: 1.7;
		color: #eef3f8;
		white-space: pre-wrap;
	}

	.story-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 24px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.12);
	}

	.story-source {
		margin: 0;
		font-size: 0.875rem;
		color: #aebbcc;
	}

	.story-footer .cm-btn {
		flex: 0 0 auto;
	}

	.cm-btn:disabled {
		opacity: 0.6;
		cursor: progress;
	}
</style>
