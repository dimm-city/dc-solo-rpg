<script>
	/**
	 * FinalLog - The player's final log, written after the ending, closing the story
	 *
	 * Shown on the last round under how the run ended: its own section, with the voice note
	 * (if one was recorded) and the text in the same reading face as the round entries.
	 *
	 * @component
	 * @example
	 * <FinalLog entry={{ text: 'They are all here. I am not.', audio: null }} />
	 */
	import AudioPlayer from '../AudioPlayer.svelte';

	let { entry = null } = $props();

	const uid = $props.id();
	const headingId = `final-log-${uid}`;
</script>

{#if entry}
	<section class="final-log" aria-labelledby={headingId} data-testid="story-final-log">
		<h3 class="final-log-title" id={headingId}>Final log</h3>

		{#if entry.audio}
			<div class="voice-note">
				<p class="voice-label">Voice note</p>
				<AudioPlayer audioData={entry.audio} />
			</div>
		{/if}

		{#if entry.text}
			<div class="final-log-text">{entry.text}</div>
		{/if}
	</section>
{/if}

<style>
	.final-log {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-top: 8px;
		font-family: var(--font-body);
	}

	/* Same small label as "The end" above it (under 28px: Inter, not the display face) */
	.final-log-title {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-shadow: none;
		color: var(--color-neon-cyan);
	}

	.final-log-text {
		font-size: 1.125rem;
		line-height: 1.75;
		color: #f2f5f9;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.voice-label {
		margin: 0 0 8px;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #aebbcc;
	}

	@media (max-width: 640px) {
		.final-log-text {
			font-size: 1.0625rem;
		}
	}
</style>
