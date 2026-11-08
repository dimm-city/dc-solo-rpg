<script>
	/**
	 * RunRecap - the whole run in a few numbers, from real game state, on the Game Over
	 * screen: one row of tiles on wider screens, three per row on phones. The labels are the
	 * HUD's, and the counts are its n/max in its LED face. (The final log shows the run as a
	 * timeline instead: journal/GameTimeline.)
	 */
	import { gameState } from '../stores/gameStore.svelte.js';
	import { getRunRecap } from '../utils/endingSummary.js';

	const recap = $derived(getRunRecap(gameState));

	/** The unlit segments behind a value, as in the HUD: as many "8"s as the max has digits */
	const ghost = (item) =>
		'8'.repeat(Math.max(String(item.n).length, String(item.max ?? 88).length));
</script>

<div class="run-recap" data-testid="run-recap">
	<dl>
		{#each recap as item (item.key)}
			<div class="stat" data-testid="recap-{item.key}">
				<dt>{item.label}</dt>
				<dd class:danger={item.danger && item.n > 0}>
					<!-- The HUD's LED face: lit digits over their unlit "88", the max quieter -->
					<span class="value" aria-hidden="true"
						><span class="led-field"
							><span class="led-off">{ghost(item)}</span><span class="led-on">{item.n}</span></span
						>{#if item.max !== undefined}<span class="slash">/</span><span
								class="max"
								class:lead-one={String(item.max).startsWith('1')}>{item.max}</span
							>{/if}</span
					>
					<span class="sr-only">{item.spoken}</span>
				</dd>
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
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		color: rgba(255, 255, 255, 0.72);
	}

	dd {
		--value-color: var(--color-brand-yellow, #ffd700);
		--value-size: 1.5rem;
		margin: 0;
		line-height: 1;
	}

	dd.danger {
		--value-color: var(--color-danger, #ff4d6d);
	}

	.value {
		display: inline-flex;
		align-items: baseline;
		font-size: var(--value-size);
		white-space: nowrap;
	}

	/* Lit digits right-aligned over their unlit segments, so every tile reads as one display */
	.led-field {
		position: relative;
		display: inline-block;
		font-family: var(--font-led, var(--font-mono, monospace));
		font-weight: 700;
		line-height: 1;
	}

	.led-off {
		color: var(--value-color);
		opacity: 0.1;
	}

	.led-on {
		position: absolute;
		inset: 0;
		text-align: right;
		color: var(--value-color);
		text-shadow: 0 0 6px color-mix(in srgb, var(--value-color) 45%, transparent);
	}

	/* The max: 0.6 of the value (never under 12px), without the glow */
	.max {
		font-family: var(--font-led, var(--font-mono, monospace));
		font-weight: 700;
		font-size: max(12px, 0.6em);
		line-height: 1;
		color: rgba(255, 255, 255, 0.6);
	}

	/* A max led by a 1 closes up to its slash, as in the HUD (the shared --led-lead-one) */
	.max.lead-one {
		margin-inline-start: var(--led-lead-one);
	}

	.slash {
		margin-inline: 1px;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: calc(max(12px, 0.6em) * 1.25);
		line-height: 0;
		color: rgba(255, 255, 255, 0.6);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
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
			--value-size: 1.125rem;
		}
	}
</style>
