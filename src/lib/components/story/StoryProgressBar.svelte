<script>
	/**
	 * StoryProgressBar - Where you are in the story, and a way to jump to any round
	 *
	 * A thin track, plus numbered markers on wider screens. A dot under a marker means the
	 * player wrote something that round.
	 *
	 * @component
	 * @example
	 * <StoryProgressBar currentRound={2} totalRounds={10} written={[true, false, true]}
	 *   onJumpToRound={(index) => nav.jumpToRound(index)} />
	 */

	let { currentRound = 0, totalRounds = 1, written = [], onJumpToRound = () => {} } = $props();

	let progress = $derived(((currentRound + 1) / Math.max(1, totalRounds)) * 100);
</script>

<div class="progress-section">
	<div class="progress-track" aria-hidden="true">
		<div class="progress-fill" style="transform: scaleX({progress / 100})"></div>
	</div>
	{#if totalRounds > 1}
		<ol class="progress-markers" aria-label="Jump to a round">
			{#each Array(totalRounds) as _, i (i)}
				<li>
					<button
						type="button"
						class="progress-marker"
						class:active={i === currentRound}
						class:written={written[i]}
						aria-current={i === currentRound ? 'step' : undefined}
						aria-label="Round {i + 1}{written[i] ? ', has a journal entry' : ''}"
						onclick={() => onJumpToRound(i)}
					>
						{i + 1}
					</button>
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.progress-section {
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
	}

	.progress-track {
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		transform-origin: left center;
		transition: transform 200ms cubic-bezier(0.4, 0, 0.6, 1);
	}

	.progress-markers {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 12px 0 0;
		padding: 0;
		list-style: none;
	}

	.progress-markers li {
		margin: 0;
	}

	.progress-marker {
		position: relative;
		min-width: 44px;
		height: 44px;
		min-height: 44px;
		padding: 0 6px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: #aebbcc;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			border-color 150ms ease-out;
	}

	.progress-marker.written::after {
		content: '';
		position: absolute;
		left: 50%;
		bottom: 3px;
		width: 4px;
		height: 4px;
		margin-left: -2px;
		border-radius: 50%;
		background: var(--color-cyber-magenta);
	}

	.progress-marker:hover {
		border-color: rgba(255, 255, 255, 0.5);
	}

	.progress-marker.active {
		background: rgba(0, 255, 255, 0.16);
		border-color: var(--color-neon-cyan);
		color: #fff;
	}

	/* Phones, and landscape phones: the track is enough; Previous / Next sit at the bottom */
	@media (max-width: 640px), (max-height: 500px) {
		.progress-markers {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-fill,
		.progress-marker {
			transition: none;
		}
	}
</style>
