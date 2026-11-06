<script>
	/**
	 * RunRecap - the whole run in a few numbers, from real game state.
	 * The same tile grid on the Game Over screen and (compact) in the final log:
	 * one row on wider screens, three per row on phones.
	 */
	import { gameState } from '../stores/gameStore.svelte.js';
	import { getRunRecap, getKeyMoments } from '../utils/endingSummary.js';

	let { compact = false, showMoments = false } = $props();

	const recap = $derived(getRunRecap(gameState));
	const moments = $derived(getKeyMoments(gameState.log));
</script>

<div class="run-recap" class:compact data-testid="run-recap">
	<dl>
		{#each recap as item (item.key)}
			<div class="stat" data-testid="recap-{item.key}">
				<dt>{item.label}</dt>
				<dd class:danger={item.danger && gameState.kingsRevealed > 0}>{item.value}</dd>
			</div>
		{/each}
	</dl>

	{#if showMoments && moments.length > 0}
		<ul class="moments" aria-label="Key moments">
			{#each moments as moment, i (i)}
				<li class:king={moment.isKing}>
					<span class="round">R{moment.round}</span>
					{moment.label}
				</li>
			{/each}
		</ul>
	{/if}
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

	/* Final log: the same tiles, a step smaller */
	.compact .stat {
		padding: 0.375rem var(--space-xs, 0.25rem);
	}

	.compact dd {
		font-size: 1.125rem;
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

	.moments {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
		list-style: none;
		margin: var(--space-sm, 0.5rem) 0 0;
		padding: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.85);
	}

	.moments li {
		padding: 0.1rem 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.moments li.king {
		border-color: var(--color-danger, #ff4d6d);
		color: var(--color-danger, #ff4d6d);
	}

	.round {
		opacity: 0.7;
		margin-right: 0.25em;
		font-variant-numeric: tabular-nums;
	}
</style>
