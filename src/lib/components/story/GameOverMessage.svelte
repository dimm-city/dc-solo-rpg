<script>
	/**
	 * GameOverMessage - How the run ended, closing the last round in story mode
	 *
	 * @component
	 * @example
	 * <GameOverMessage outcome="Taken by the fourth King" message="The machine is silent." />
	 */

	let { outcome = '', message = '', isWon = false } = $props();
</script>

{#if outcome || message}
	<section class="ending" class:won={isWon} aria-label="Ending">
		<p class="ending-kicker">The end</p>
		{#if outcome}
			<p class="ending-outcome">{outcome}</p>
		{/if}
		{#if message}
			<p class="ending-message">{message}</p>
		{/if}
	</section>
{/if}

<style>
	.ending {
		padding: 24px 0 8px;
		border-top: 1px solid rgba(255, 77, 109, 0.45);
	}

	.ending.won {
		border-top-color: rgba(255, 215, 0, 0.5);
	}

	.ending-kicker {
		margin: 0 0 4px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #aebbcc;
	}

	/* Under 28px, so Inter rather than the display face (MN-07) */
	.ending-outcome {
		margin: 0 0 12px;
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.3;
		color: #ff8fa3;
	}

	.ending.won .ending-outcome {
		color: var(--color-brand-yellow);
	}

	.ending-message {
		max-width: var(--measure, 30em);
		margin: 0;
		font-size: 1.125rem;
		line-height: 1.7;
		font-style: italic;
		color: #d5dfeb;
	}
</style>
