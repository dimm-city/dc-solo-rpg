<script>
/**
 * AutoJournalTimer - Auto-journal countdown timer component
 *
 * Displays countdown timer with progress bar for auto-journal functionality
 * Shows time remaining and hint to cancel
 *
 * @component
 * @example
 * <AutoJournalTimer
 *   timeRemaining={5000}
 *   totalTime={10000}
 * />
 */

let {
	timeRemaining = 0,
	totalTime = 10000
} = $props();

let progress = $derived((timeRemaining / totalTime) * 100);
let secondsRemaining = $derived(Math.ceil(timeRemaining / 1000));
</script>

{#if timeRemaining > 0}
	<div class="auto-journal-timer">
		<div class="timer-text">
			Auto-continuing in {secondsRemaining}s
			<span class="timer-hint">(write or record to cancel)</span>
		</div>
		<div class="timer-bar-container">
			<div class="timer-bar" style="width: {progress}%"></div>
		</div>
	</div>
{/if}

<style>
	.auto-journal-timer {
		width: 100%;
		margin-bottom: var(--space-md);
	}

	.timer-text {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		text-align: center;
		margin-bottom: var(--space-xs);
		font-family: var(--font-display);
	}

	.timer-hint {
		display: block;
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		margin-top: var(--space-xs);
		font-style: italic;
	}

	.timer-bar-container {
		width: 100%;
		height: 4px;
		background: rgba(0, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
		position: relative;
	}

	.timer-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-pink));
		border-radius: 2px;
		transition: width 0.1s linear;
		box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.timer-text {
			font-size: var(--text-xs);
		}

		.timer-hint {
			font-size: 0.65rem;
		}
	}

	/* Accessibility: Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.timer-bar {
			transition: none;
		}
	}
</style>
