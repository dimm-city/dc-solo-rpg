<script>
	/**
	 * RunRecap - the whole run in a few numbers, from real game state, on the Game Over
	 * screen: one row of tiles on wider screens, three per row on phones. (The final log
	 * shows the run as a timeline instead: journal/GameTimeline.)
	 */
	import { gameState } from '../stores/gameStore.svelte.js';
	import { getRunRecap } from '../utils/endingSummary.js';

	const recap = $derived(getRunRecap(gameState));
</script>

<div class="run-recap" data-testid="run-recap">
	<dl>
		{#each recap as item (item.key)}
			<div class="stat" data-testid="recap-{item.key}">
				<dt>{item.label}</dt>
				<dd class:danger={item.danger && gameState.kingsRevealed > 0}>{item.value}</dd>
			</div>
		{/each}
	</dl>
</div>

<style>
	.run-recap {
		--gap: var(--space-sm, 0.5rem);
		width: 100%;
		max-width: 880px;
	}

	/* One row of equal tiles; three per row on phones (see below) */
	dl {
		display: flex;
		gap: var(--gap);
		margin: 0;
	}

	.stat {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.25rem;
		padding: var(--space-sm, 0.5rem) var(--space-sm, 0.5rem);
		border: 1px solid rgba(0, 255, 255, 0.25);
		background: rgba(0, 0, 0, 0.35);
		text-align: center;
	}

	dt {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	dd {
		margin: 0;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-size: 1.375rem;
		line-height: 1.2;
		white-space: nowrap;
		color: var(--color-brand-yellow, #ffe400);
	}

	dd.danger {
		color: var(--color-danger, #ff4d6d);
	}

	@media (max-width: 600px) {
		dl {
			flex-wrap: wrap;
			justify-content: center;
		}

		.stat {
			flex: 0 0 calc((100% - 2 * var(--gap)) / 3);
		}

		dd {
			font-size: 1.125rem;
		}
	}
</style>
