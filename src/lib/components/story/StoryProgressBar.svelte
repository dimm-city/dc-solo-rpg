<script>
/**
 * StoryProgressBar - Visual progress indicator for story mode
 *
 * Shows current progress through rounds with clickable markers
 * Displays progress bar fill and individual round markers
 *
 * @component
 * @example
 * <StoryProgressBar
 *   currentRound={2}
 *   totalRounds={10}
 *   onJumpToRound={(index) => console.log('Jump to', index)}
 * />
 */

let {
	currentRound = 0,
	totalRounds = 1,
	onJumpToRound = () => {}
} = $props();

let progressPercentage = $derived(((currentRound + 1) / totalRounds) * 100);
</script>

<div class="progress-section">
	<div class="progress-bar-container">
		<div class="progress-track">
			<div class="progress-fill" style="width: {progressPercentage}%"></div>
		</div>
		<div class="progress-markers">
			{#each Array(totalRounds) as _, i}
				<button
					class="progress-marker"
					class:active={i === currentRound}
					class:completed={i < currentRound}
					onclick={() => onJumpToRound(i)}
					aria-label="Jump to round {i + 1}"
				>
					<span class="marker-number">{i + 1}</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Progress Section */
	.progress-section {
		padding: 0 var(--space-xl);
	}

	.progress-bar-container {
		position: relative;
		width: 100%;
	}

	.progress-track {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		border-radius: 4px;
		transition: width 0.3s cubic-bezier(0.4, 0, 0.6, 1);
		box-shadow: 0 0 15px rgba(217, 70, 239, 0.6);
	}

	.progress-markers {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-md);
		gap: var(--space-xs);
	}

	.progress-marker {
		flex: 1;
		max-width: 48px;
		height: 32px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		cursor: pointer;
		transition:
			background 0.2s,
			border-color 0.2s,
			transform 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.progress-marker:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
	}

	.progress-marker.active {
		background: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		border-color: var(--color-neon-cyan);
		box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
	}

	.progress-marker.completed {
		background: rgba(0, 255, 255, 0.2);
		border-color: rgba(0, 255, 255, 0.4);
	}

	.marker-number {
		font-size: var(--text-xs);
		font-weight: 700;
		font-family: var(--font-display);
		color: rgba(255, 255, 255, 0.6);
	}

	.progress-marker.active .marker-number {
		color: rgba(10, 10, 10, 1);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.progress-section {
			padding: 0 var(--space-md);
		}

		.progress-track {
			height: 6px;
		}

		.progress-markers {
			display: none; /* Too many markers on mobile */
		}
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		.progress-marker {
			max-width: 36px;
			height: 28px;
		}
	}

	/* Accessibility: Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.progress-fill {
			transition: none;
		}

		.progress-marker {
			transition: none;
		}

		.progress-marker:hover {
			transform: none;
		}
	}
</style>
