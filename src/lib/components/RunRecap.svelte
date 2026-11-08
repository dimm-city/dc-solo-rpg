<script>
	/**
	 * RunRecap - the whole run in a few numbers, from real game state, on the Game Over
	 * screen, read as the HUD (game-copy-s-09): its order (Stability, Kings | Rounds, Drawn |
	 * Aces, Tokens), its labels, its n/max in its LED face, and each resource in its tier's
	 * colours for the final value (tint, label, count). One row of six on wider screens; on
	 * phones two rows of three, the HUD's two halves. Tokens are always there: when the Ace of
	 * Hearts was never found, in the HUD's locked look, dimmed with a padlock (game-copy-s-14).
	 * The visible label is each tile's only spoken name; the hidden text gives the value alone
	 * (game-copy-s-13). (The final log shows the run as a timeline instead: journal/GameTimeline.)
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
			<div
				class="stat"
				data-testid="recap-{item.key}"
				data-key={item.key}
				data-tier={item.tier ?? 'neutral'}
				data-count={item.n}
			>
				<span class="tint" aria-hidden="true"></span>
				<dt>{item.label}</dt>
				<dd>
					<!-- The HUD's LED face: lit digits over their unlit "88", the max quieter -->
					<span class="value" aria-hidden="true"
						><span class="led-field"
							><span class="led-off">{ghost(item)}</span><span class="led-on">{item.n}</span></span
						>{#if item.max !== undefined}<span class="slash">/</span><span
								class="max"
								class:lead-one={String(item.max).startsWith('1')}>{item.max}</span
							>{/if}{#if item.tier === 'locked'}<svg
								class="lock"
								data-testid="recap-tokens-lock"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path
									d="M7 11V7a5 5 0 0 1 10 0v4"
								/></svg
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
		/* Neutral (Rounds, Drawn): the HUD's plain count, no tint */
		--tint-color: transparent;
		--tint-alpha: 0;
		--value-color: #e2e9f2;
		--label-color: rgba(255, 255, 255, 0.72);
		position: relative;
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

	/* The HUD tiles' tiers (status/*Cell.svelte), for the final value: tint, count, label */
	.stat[data-key='stability'] {
		--tint-color: #00ff88;
		--value-color: #00ff88;
	}
	.stat[data-key='stability'][data-tier='caution'] {
		--tint-color: #ffd700;
		--tint-alpha: 0.06;
		--value-color: #ffd700;
		--label-color: #ffd700;
	}
	.stat[data-key='stability'][data-tier='danger'] {
		--tint-color: #ff8a3d;
		--tint-alpha: 0.1;
		--value-color: #ff8a3d;
		--label-color: #ff8a3d;
	}
	.stat[data-key='stability'][data-tier='critical'] {
		--tint-color: #ff4d6d;
		--tint-alpha: 0.14;
		--value-color: #ff4d6d;
		--label-color: #ff4d6d;
	}
	.stat[data-key='kings'] {
		--tint-color: #ff4d6d;
		--value-color: #f2f4f8;
		--label-color: #ff4d6d;
	}
	/* As in the HUD, the label turns red with the first King */
	.stat[data-key='kings'][data-count='0'] {
		--label-color: rgba(255, 255, 255, 0.72);
	}
	.stat[data-key='kings'][data-tier='urgent'] {
		--tint-alpha: 0.16;
		--value-color: #ff4d6d;
	}
	.stat[data-key='aces'] {
		--tint-color: #00ffff;
		--value-color: #00ffff;
		--label-color: #00ffff;
	}
	.stat[data-key='aces'][data-tier='none'] {
		--value-color: #f2f4f8;
		--label-color: rgba(255, 255, 255, 0.72);
	}
	.stat[data-key='aces'][data-tier='one'] {
		--tint-alpha: 0.04;
	}
	.stat[data-key='aces'][data-tier='two'] {
		--tint-alpha: 0.07;
	}
	.stat[data-key='aces'][data-tier='three'] {
		--tint-alpha: 0.1;
	}
	.stat[data-key='aces'][data-tier='four'] {
		--tint-alpha: 0.12;
	}
	.stat[data-key='aces'][data-tier='final'] {
		--tint-color: #ffd700;
		--tint-alpha: 0.12;
		--value-color: #ffd700;
		--label-color: #ffd700;
	}
	.stat[data-key='tokens'] {
		--tint-color: #ffd700;
		--value-color: #ffd700;
		--label-color: #ffd700;
	}
	.stat[data-key='tokens'][data-tier='half'] {
		--tint-alpha: 0.06;
	}
	.stat[data-key='tokens'][data-tier='near'],
	.stat[data-key='tokens'][data-tier='clear'] {
		--tint-color: #00ff88;
		--value-color: #00ff88;
		--label-color: #00ff88;
	}
	.stat[data-key='tokens'][data-tier='near'] {
		--tint-alpha: 0.1;
	}
	.stat[data-key='tokens'][data-tier='clear'] {
		--tint-alpha: 0.12;
	}
	/* Never unlocked: the HUD's locked look, dimmed, no tint or glow, a padlock beside it */
	.stat[data-key='tokens'][data-tier='locked'] {
		--tint-alpha: 0;
		--value-color: rgba(255, 255, 255, 0.6);
		--label-color: rgba(255, 255, 255, 0.72);
		--max-color: rgba(255, 255, 255, 0.5);
	}
	.stat[data-tier='locked'] .led-on {
		text-shadow: none;
	}
	.stat[data-key='tokens'][data-tier='over'] {
		--tint-color: #ff8a3d;
		--tint-alpha: 0.08;
		--value-color: #ff8a3d;
		--label-color: #ff8a3d;
	}

	/* The HUD's tint layer: the tier's alpha at the top, a quarter of it at the bottom */
	.tint {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-color: var(--tint-color);
		opacity: var(--tint-alpha);
		-webkit-mask-image: linear-gradient(180deg, #000, rgba(0, 0, 0, 0.25));
		mask-image: linear-gradient(180deg, #000, rgba(0, 0, 0, 0.25));
	}

	dt,
	dd {
		position: relative;
	}

	dt {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
		color: var(--label-color);
	}

	dd {
		--value-size: 1.5rem;
		margin: 0;
		line-height: 1;
	}

	.value {
		position: relative;
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
		color: var(--max-color, rgba(255, 255, 255, 0.6));
	}

	/* The padlock hangs right of the count, so the count stays centred with the other tiles' */
	.lock {
		position: absolute;
		left: calc(100% + 0.25rem);
		top: 50%;
		width: max(12px, 0.6em);
		height: max(12px, 0.6em);
		transform: translateY(-50%);
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
		color: var(--max-color, rgba(255, 255, 255, 0.6));
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
