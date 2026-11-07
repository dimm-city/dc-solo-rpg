<script>
	/**
	 * StabilityCell - Stability n/20 over a thin bar (outer left; Tokens mirrors it)
	 *
	 * Four tiers colour the number and bar: steady 16-20, caution 11-15, danger 5-10 and
	 * critical at 4 or less, which also pulses (an alert loop). Damage washes the cell red
	 * with a 2px shake for one beat (400ms); under reduced motion the wash only.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { MAX_STABILITY, stabilityTier } from './hudTiers.js';

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
	data-testid="hud-stability"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms"
>
	<span class="flash" aria-hidden="true"></span>
	<span class="hud-label">Stability</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="current">{gameState.tower}</span><span class="hud-max">/{MAX_STABILITY}</span
			></span
		>
		<span class="hud-foot bar"
			><span class="fill" style="transform: scaleX({fraction})"></span></span
		>
	</span>
	<span class="sr-only">Stability {gameState.tower} of {MAX_STABILITY}</span>
</div>

<style>
	.stability {
		--tier-color: #00ff88;
		--tier-glow: rgba(0, 255, 136, 0.45);
		--bar-color: var(--tier-color);
		--bar-glow: var(--tier-glow);
	}
	.tier-caution {
		--tier-color: var(--color-brand-yellow, #ffd700);
		--tier-glow: rgba(255, 215, 0, 0.45);
	}
	.tier-danger {
		--tier-color: #ff8a3d;
		--tier-glow: rgba(255, 138, 61, 0.5);
	}
	.tier-critical {
		--tier-color: var(--color-danger, #ff4d6d);
		--tier-glow: rgba(255, 77, 109, 0.6);
	}

	.stability .hud-label {
		color: var(--tier-color);
	}

	.stability .current {
		color: var(--tier-color);
		text-shadow: 0 0 10px var(--tier-glow);
	}

	/* Critical: the value and the bar pulse (an alert loop, not ambient) */
	.tier-critical .current,
	.tier-critical .fill {
		animation: criticalPulse 1.6s ease-in-out infinite;
	}

	/* Damage: a red wash over the cell plus a 2px shake of the readout, for one beat */
	.flash {
		position: absolute;
		inset: 0;
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
		.tier-critical .current,
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
