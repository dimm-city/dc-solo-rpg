<script>
	/**
	 * RoundStats - Where the run stood at the end of a round
	 *
	 * Stability, Kings, Aces and (once Salvation is unlocked) tokens, label first and "n of max"
	 * as in the journal's status line and the HUD's spoken text: "Stability 16 of 20",
	 * "Kings 1 of 4", "Tokens 10 left" (tokens have no fixed max).
	 *
	 * @component
	 * @example
	 * <RoundStats state={{ tower: 15, kingsRevealed: 2, acesRevealed: 1, tokens: 8, aceOfHeartsRevealed: true }} />
	 */
	import { MAX_STABILITY } from '../../utils/endingSummary.js';

	let { state = null } = $props();

	let stats = $derived.by(() => {
		if (!state) return [];
		const list = [];
		if (typeof state.tower === 'number') {
			list.push({
				label: 'Stability',
				value: `${Math.max(0, state.tower)} of ${MAX_STABILITY}`,
				danger: state.tower <= 4
			});
		}
		if (typeof state.kingsRevealed === 'number') {
			list.push({
				label: 'Kings',
				value: `${state.kingsRevealed} of 4`,
				danger: state.kingsRevealed >= 3
			});
		}
		if (typeof state.acesRevealed === 'number') {
			list.push({ label: 'Aces', value: `${state.acesRevealed} of 4` });
		}
		if (state.aceOfHeartsRevealed && typeof state.tokens === 'number') {
			list.push({ label: 'Tokens', value: `${state.tokens} left` });
		}
		return list;
	});
</script>

{#if stats.length}
	<dl class="round-stats" aria-label="At the end of this round">
		{#each stats as stat (stat.label)}
			<div class="stat" class:danger={stat.danger}>
				<dt>{stat.label}</dt>
				<dd>{stat.value}</dd>
			</div>
		{/each}
	</dl>
{/if}

<style>
	.round-stats {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		margin: 0;
		padding: 12px 0 0;
		border-top: 1px solid rgba(255, 255, 255, 0.12);
		font-family: var(--font-body);
		font-size: 0.875rem;
	}

	.stat {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	dt {
		color: #aebbcc;
	}

	dd {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: #e6edf5;
	}

	.stat.danger dd {
		color: #ff8fa3;
	}
</style>
