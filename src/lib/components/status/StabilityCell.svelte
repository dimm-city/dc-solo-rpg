<script>
	/**
	 * StabilityCell - Stability n/20 over a thin bar (outer left; Tokens mirrors it)
	 *
	 * Four tiers (stabilityTier) colour the tint, the number, the label and the bar: steady
	 * 16-20, caution 11-15, danger 5-10 and critical at 4 or less, where the tint and the bar
	 * pulse (an alert loop; the digits never pulse). Damage washes the cell red with a 2px
	 * shake for one beat (400ms); under reduced motion the wash only.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { MAX_STABILITY, stabilityTier, stabilitySpoken } from './hudTiers.js';

	const tier = $derived(stabilityTier(gameState.tower));
	const fraction = $derived(Math.max(0, Math.min(1, gameState.tower / MAX_STABILITY)));

	// Flash + shake when Stability drops
	let hit = $state(false);
	let previous = gameState.tower;
	let hitTimer;
	$effect(() => {
		const current = gameState.tower;
		if (current < previous) {
			hit = true;
			clearTimeout(hitTimer);
			hitTimer = setTimeout(() => (hit = false), ANIMATION_DURATION.BEAT);
		}
		previous = current;
	});
	$effect(() => () => clearTimeout(hitTimer));
</script>

<div
	class="hud-cell stability tier-{tier}"
	class:hit
	data-tier={tier}
	data-testid="hud-stability"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms"
>
	<span class="tint" aria-hidden="true"></span>
	<span class="flash" aria-hidden="true"></span>
	<span class="hud-label" aria-hidden="true">Stability</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="led-field"
				><span class="led-off" aria-hidden="true">88</span><span class="led-on current"
					>{gameState.tower}</span
				></span
			><span class="hud-slash" aria-hidden="true">/</span><span class="hud-max"
				>{MAX_STABILITY}</span
			></span
		>
		<span class="hud-foot bar"
			><span class="fill" style="transform: scaleX({fraction})"></span></span
		>
	</span>
	<span class="sr-only">{stabilitySpoken(gameState.tower)}</span>
</div>

<style>
	/* The tier ladder (DP-1-02): tint colour at its top alpha, value colour, label colour */
	.stability {
		--tint-color: #00ff88;
		--tint-alpha: 0;
		--value-color: #00ff88;
		--bar-color: var(--value-color);
		--bar-glow: rgba(0, 255, 136, 0.45);
	}
	.tier-caution {
		--tint-color: #ffd700;
		--tint-alpha: 0.06;
		--value-color: #ffd700;
		--label-color: #ffd700;
		--bar-glow: rgba(255, 215, 0, 0.45);
	}
	.tier-danger {
		--tint-color: #ff8a3d;
		--tint-alpha: 0.1;
		--value-color: #ff8a3d;
		--label-color: #ff8a3d;
		--bar-glow: rgba(255, 138, 61, 0.5);
	}
	.tier-critical {
		--tint-color: #ff4d6d;
		--tint-alpha: 0.14;
		--value-color: #ff4d6d;
		--label-color: #ff4d6d;
		--bar-glow: rgba(255, 77, 109, 0.6);
	}

	/* Critical: the tint breathes between .14 and .07 and the bar pulses (an alert loop, not
	   ambient). The digits hold still, so the number always reads at full contrast. */
	.tier-critical .tint {
		animation: criticalTint 1.6s ease-in-out infinite;
	}
	.tier-critical .fill {
		animation: criticalPulse 1.6s ease-in-out infinite;
	}

	/* Damage: a red wash over the cell plus a 2px shake of the readout, for one beat */
	.flash {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: var(--color-danger, #ff4d6d);
		opacity: 0;
		pointer-events: none;
	}
	.hit .flash {
		animation: stabilityFlash var(--hud-beat) var(--ease-enter, ease-out);
	}
	.hit .hud-readout {
		animation: stabilityShake var(--hud-beat) var(--ease-enter, ease-out);
	}

	@keyframes stabilityFlash {
		from {
			opacity: 0.5;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes stabilityShake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-2px);
		}
		40% {
			transform: translateX(2px);
		}
		60% {
			transform: translateX(-2px);
		}
		80% {
			transform: translateX(1px);
		}
	}

	@keyframes criticalTint {
		0%,
		100% {
			opacity: 0.14;
		}
		50% {
			opacity: 0.07;
		}
	}

	@keyframes criticalPulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tier-critical .tint,
		.tier-critical .fill,
		.hit .hud-readout {
			animation: none;
		}
		/* Damage: colour only */
		.hit .flash {
			animation: none;
			opacity: 0.3;
		}
	}
</style>
