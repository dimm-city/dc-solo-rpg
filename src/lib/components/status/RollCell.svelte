<script>
	/**
	 * RollCell - The last d20 result on a two-digit seven-segment display, and a 2d20 badge
	 * while Lucid or Surreal
	 *
	 * The digits are DSEG7 Classic (--font-led) over a faint "88", the unlit segments, so a 4
	 * sits in the ones place like a real display. "--" before the first roll. The badge reads
	 * "2d20↑" (Lucid: the next roll keeps the higher of two dice) or "2d20↓" (Surreal: keeps
	 * the lower). It has an accessible name and a tooltip with the full rule. Lucid/Surreal
	 * applies to the next d20 roll, whichever roll that is. When the last roll was 2d20, the
	 * tooltip and the spoken text say which die counted.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { diceState } from '../../stores/diceStore.svelte.js';
	import { describeTwoDiceRoll, rollBadge } from './hudTiers.js';

	const hasRolled = $derived(gameState.diceRoll > 0);
	const detail = $derived(describeTwoDiceRoll(diceState.lastRoll, gameState.diceRoll));
	const badge = $derived(rollBadge(gameState));
</script>

<div class="hud-cell roll" class:idle={!hasRolled} data-testid="hud-roll">
	<span class="hud-label">Roll</span>
	<span class="hud-readout">
		<span class="led" aria-hidden="true" title={detail ? `Two dice: ${detail}` : undefined}>
			<span class="led-off">88</span>
			<span class="hud-value led-on">{hasRolled ? gameState.diceRoll : '--'}</span>
		</span>
		{#if badge}
			<span
				class="badge {badge.kind}"
				role="img"
				aria-label={badge.label}
				title={badge.label}
				data-testid="roll-badge">{badge.text}</span
			>
		{/if}
	</span>
	<span class="sr-only"
		>{hasRolled
			? `Last roll ${gameState.diceRoll}${detail ? ` (${detail})` : ''}`
			: 'No roll yet'}</span
	>
</div>

<style>
	.roll {
		--led-color: var(--color-brand-yellow, #ffd700);
		--led-size: 1.75rem;
	}

	/* Two digit cells: the unlit "88" sets the size, the lit digits sit on it, right-aligned */
	.led {
		position: relative;
		display: block;
		flex: none;
		font-family: var(--font-led, var(--font-mono, monospace));
		font-size: var(--led-size);
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
	}

	.led-off {
		display: block;
		color: var(--led-color);
		opacity: 0.1;
	}

	.roll .led-on {
		position: absolute;
		inset: 0;
		font: inherit;
		text-align: right;
		color: var(--led-color);
		text-shadow:
			0 0 6px rgba(255, 215, 0, 0.55),
			0 0 14px rgba(255, 215, 0, 0.25);
	}

	/* "--" before the first roll: lit, but quieter */
	.idle .led-on {
		opacity: 0.6;
	}

	.badge {
		padding: 2px 5px;
		border: 1px solid currentColor;
		border-radius: 3px;
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: 0.6875rem;
		font-weight: 600;
		line-height: 1.1;
		letter-spacing: 0.02em;
		white-space: nowrap;
		cursor: help;
	}
	.badge.lucid {
		color: #00ffaa;
		background: rgba(0, 255, 170, 0.12);
	}
	.badge.surreal {
		color: #f07cff;
		background: rgba(217, 70, 239, 0.16);
	}

	@media (max-width: 600px) {
		.roll {
			--led-size: 1.375rem;
		}

		.badge {
			padding: 0 3px;
			font-size: 0.625rem;
		}
	}

	@media (max-height: 500px) and (min-width: 601px) {
		.roll {
			--led-size: 1.375rem;
		}
	}
</style>
