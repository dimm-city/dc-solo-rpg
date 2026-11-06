<script>
	/**
	 * AutoJournalTimer - countdown before auto-play moves past the journal.
	 * Typing or recording cancels it (the journal clears timeRemaining).
	 *
	 * @component
	 * @example
	 * <AutoJournalTimer timeRemaining={5000} totalTime={10000} />
	 */

	let { timeRemaining = 0, totalTime = 10000 } = $props();

	let fraction = $derived(totalTime > 0 ? Math.min(1, Math.max(0, timeRemaining / totalTime)) : 0);
	let secondsRemaining = $derived(Math.ceil(timeRemaining / 1000));
</script>

{#if timeRemaining > 0}
	<div class="auto-journal-timer" data-testid="auto-journal-timer">
		<p class="timer-text">Continuing in {secondsRemaining}s · type to stay</p>
		<div class="timer-track" aria-hidden="true">
			<div class="timer-bar" style:transform="scaleX({fraction})"></div>
		</div>
	</div>
{/if}

<style>
	.auto-journal-timer {
		width: 100%;
	}

	.timer-text {
		margin: 0 0 var(--space-xs, 0.25rem);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.8125rem;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		text-align: center;
		color: rgba(255, 255, 255, 0.78);
	}

	.timer-track {
		height: 3px;
		background: rgba(0, 255, 255, 0.12);
		overflow: hidden;
	}

	/* Shrinks from the right; transform only, updated every 100ms */
	.timer-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--color-neon-cyan, #0ff), var(--color-neon-pink, #f0f));
		transform-origin: left center;
		transition: transform 100ms linear;
	}

	@media (prefers-reduced-motion: reduce) {
		.timer-bar {
			transition: none;
		}
	}
</style>
