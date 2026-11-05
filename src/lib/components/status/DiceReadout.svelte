<script>
	/**
	 * DiceReadout - Last roll display panel
	 *
	 * Shows the last d20 result as a number on every screen size. If that roll was 2d20
	 * (Lucid or Surreal), it also says which die counted, e.g. "high of 15, 6". When the
	 * next roll will be 2d20, a LUCID or SURREAL badge says so.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { diceState } from '../../stores/diceStore.svelte.js';
	import { describeTwoDiceRoll } from './hudTiers.js';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.35,
		/** Animation duration in seconds */
		animationDuration = 0.75
	} = $props();

	const hasRolled = $derived(gameState.diceRoll > 0);
	const detail = $derived(describeTwoDiceRoll(diceState.lastRoll, gameState.diceRoll));
	const modifier = $derived(gameState.isLucid ? 'lucid' : gameState.isSurreal ? 'surreal' : null);
</script>

<div
	class="dice-readout slide-down"
	data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
	data-testid="dice-readout"
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="dice-label">LAST ROLL</div>

	<div
		class="dice-value"
		aria-label={hasRolled ? `Last roll ${gameState.diceRoll}` : 'No roll yet'}
	>
		{hasRolled ? gameState.diceRoll : '--'}
	</div>

	{#if detail}
		<div class="dice-detail">({detail})</div>
	{/if}

	{#if modifier}
		<div class="modifier-state {modifier}">
			{modifier === 'lucid' ? 'LUCID: next roll high of 2d20' : 'SURREAL: next roll low of 2d20'}
		</div>
	{/if}
</div>

<style>
	.slide-down {
		animation: slideDown 0.4s linear forwards;
		opacity: 0;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.dice-readout {
		--aug-border-all: 2px;
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
		);
		--aug-tl: 6px;
		--aug-tr: 6px;
		--aug-br: 6px;
		--aug-bl: 6px;

		grid-area: dice;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-xs);
		padding: var(--space-sm);
		min-width: 90px;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.8));
		backdrop-filter: blur(10px) saturate(150%);
		-webkit-backdrop-filter: blur(10px) saturate(150%);
		box-shadow:
			0 0 8px rgba(0, 255, 255, 0.25),
			inset 0 0 8px rgba(0, 255, 255, 0.08);
	}

	.dice-label {
		font-size: var(--text-xs);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		color: #00eeff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
		white-space: nowrap;
	}

	.dice-value {
		font-size: 2rem;
		font-weight: 700;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--color-brand-yellow, #ffd700);
		text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
		line-height: 1;
	}

	.dice-detail,
	.modifier-state {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: var(--text-xs);
		line-height: 1.2;
		text-align: center;
	}

	.dice-detail {
		color: rgba(255, 255, 255, 0.8);
		white-space: nowrap;
	}

	.modifier-state {
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		max-width: 110px;
	}
	.modifier-state.lucid {
		color: #00ffaa;
	}
	.modifier-state.surreal {
		color: var(--color-danger, #ff4d6d);
	}

	@media (max-width: 600px) {
		.dice-readout {
			min-width: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}
	}
</style>
