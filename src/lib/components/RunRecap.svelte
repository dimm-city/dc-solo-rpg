<script>
	/**
	 * RunRecap - the whole run in a few numbers, from real game state.
	 * Used on the Game Over screen and (compact) above the final log.
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
		width: 100%;
		max-width: var(--content-max, 720px);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
	}

	dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: var(--space-sm, 0.5rem);
		margin: 0;
	}

	.stat {
		padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		border: 1px solid rgba(0, 255, 255, 0.25);
		background: rgba(0, 0, 0, 0.35);
		text-align: center;
	}

	dt {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.7);
	}

	dd {
		margin: 0.15rem 0 0;
		font-size: 1.375rem;
		color: var(--color-brand-yellow, #ffe400);
	}

	dd.danger {
		color: var(--color-danger, #ff4d6d);
	}

	.compact dl {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-xs, 0.25rem) var(--space-md, 1rem);
	}

	.compact .stat {
		padding: 0;
		border: none;
		background: none;
		display: flex;
		gap: 0.4em;
		align-items: baseline;
	}

	.compact dt {
		font-size: 0.75rem;
	}

	.compact dd {
		margin: 0;
		font-size: 0.875rem;
	}

	.moments {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
		list-style: none;
		margin: var(--space-sm, 0.5rem) 0 0;
		padding: 0;
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
	}
</style>
