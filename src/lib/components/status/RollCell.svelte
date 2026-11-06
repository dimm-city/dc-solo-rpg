<script>
	/**
	 * RollCell - The last d20 result, and a 2d20 badge while Lucid or Surreal
	 *
	 * The badge reads "2d20↑" (Lucid: the next roll keeps the higher of two dice) or
	 * "2d20↓" (Surreal: keeps the lower). It has an accessible name and a tooltip with the
	 * full rule. Lucid/Surreal applies to the next d20 roll, whichever roll that is.
	 * When the last roll was 2d20, the tooltip and the spoken text say which die counted.
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

<div class="hud-cell roll" data-testid="hud-roll">
	<span class="hud-label">Roll</span>
	<span class="hud-readout">
		<span
			class="hud-value current"
			aria-hidden="true"
			title={detail ? `Two dice: ${detail}` : undefined}
			>{hasRolled ? gameState.diceRoll : '--'}</span
		>
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
	.roll .current {
		color: var(--color-brand-yellow, #ffd700);
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
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
		.badge {
			padding: 1px 3px;
			font-size: 0.625rem;
		}
	}
</style>
