<script>
	/**
	 * StabilityPanel - Stability number + bar
	 *
	 * Shows `n/20` in the mono font and a bar that scales with `transform: scaleX()`.
	 * Four tiers (steady, caution, danger, critical) escalate colour and, at critical, a slow pulse.
	 * Damage flashes the panel for 300ms with a 2px shake (colour only under reduced motion).
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';
	import { MAX_STABILITY, stabilityTier } from './hudTiers.js';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.15,
		/** Animation duration in seconds */
		animationDuration = 0.7
	} = $props();

	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);
	const healthAugmentedUI = $derived(
		isMobile ? 'tl-clip tr-clip br-clip-x border' : 'tl-clip tr-clip-x br-clip-x border'
	);

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
			hitTimer = setTimeout(() => (hit = false), 300); // ANIMATION_DURATION.SLOW
		}
		previous = current;
		return () => clearTimeout(hitTimer);
	});
</script>

<div
	class="stat-item health-stat slide-down tier-{tier}"
	class:hit
	data-augmented-ui={healthAugmentedUI}
	data-testid="stability-panel"
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="flash" aria-hidden="true"></div>
	<div class="body">
		<div class="stat-label">STABILITY</div>
		<div class="stability-value" aria-label="Stability {gameState.tower} of {MAX_STABILITY}">
			<span class="current">{gameState.tower}</span><span class="max">/{MAX_STABILITY}</span>
		</div>
		<div
			class="stat-bar stability-bar"
			role="progressbar"
			aria-label="Stability"
			aria-valuemin="0"
			aria-valuemax={MAX_STABILITY}
			aria-valuenow={gameState.tower}
		>
			<div class="stability-fill" style="transform: scaleX({fraction})"></div>
		</div>
	</div>
</div>

<style>
	/* Animation */
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

	.stat-item {
		--aug-border-all: 2px;
		--tier-color: #00ff88;
		--tier-glow: rgba(0, 255, 136, 0.45);

		width: stretch;
		max-width: 150px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.25rem;
		padding: 0.375rem 0.625rem;
		position: relative;
		overflow: visible;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);
	}

	.tier-steady {
		--tier-color: #00ff88;
		--tier-glow: rgba(0, 255, 136, 0.45);
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

	.health-stat {
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
		);
		--aug-tl: 8px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-r-extend1: 30px;
		--aug-r-inset1: 12px;
		grid-area: stability;
		box-shadow:
			0 0 20px var(--tier-glow),
			inset 0 0 15px rgba(0, 255, 255, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Damage: a red wash over the panel plus a 2px shake of its contents.
	   Not on the host: its ::before/::after draw the augmented-ui frame and its animation is the entrance. */
	.flash {
		position: absolute;
		inset: 0;
		background: var(--color-danger, #ff4d6d);
		opacity: 0;
		pointer-events: none;
	}
	.hit .flash {
		animation: stabilityFlash 0.3s ease-out;
	}
	.body {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		width: 100%;
	}
	.hit .body {
		animation: stabilityShake 0.3s linear;
	}

	@keyframes stabilityShake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-2px);
		}
		50% {
			transform: translateX(2px);
		}
		75% {
			transform: translateX(-2px);
		}
	}

	@keyframes stabilityFlash {
		from {
			opacity: 0.45;
		}
		to {
			opacity: 0;
		}
	}

	/* Labels sit at the top of every panel */
	.stat-label {
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		color: #00ffaa;
		text-align: center;
		align-self: center;
		white-space: nowrap;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.stability-value {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		line-height: 1;
		color: var(--tier-color);
		text-shadow: 0 0 12px var(--tier-glow);
	}
	.stability-value .current {
		font-size: 1.5rem; /* 24px */
		font-weight: 700;
	}
	.stability-value .max {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
		text-shadow: none;
	}

	/* The bar is a fixed 10px track; only the fill's transform changes */
	.stat-bar {
		height: 10px;
		flex: 0 0 auto;
		width: 100%;
		min-width: 80px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
		border-radius: 2px;
	}

	.stability-fill {
		height: 100%;
		width: 100%;
		transform-origin: left center;
		background: var(--tier-color);
		box-shadow: 0 0 10px var(--tier-glow);
		transition:
			transform 0.3s ease-out,
			background-color 0.3s ease-out;
		animation: fillBarGrow 0.5s ease-out backwards;
	}

	@keyframes fillBarGrow {
		from {
			transform: scaleX(0);
		}
	}

	/* Critical: slow pulse */
	.tier-critical .stability-value,
	.tier-critical .stability-fill {
		animation: criticalPulse 1.6s ease-in-out infinite;
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

	@media (max-width: 600px) {
		.stat-item {
			width: stretch;
			min-width: 0;
			padding: 0.25rem 0.5rem;
		}

		.health-stat {
			--aug-tl: 8px;
			--aug-tr: 8px;
			--aug-br: 8px;
		}
		.stat-label {
			font-size: 0.625rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.stability-fill {
			animation: none;
			transition: none;
		}

		/* Damage: colour only */
		.hit .body {
			animation: none;
		}
		.hit .flash {
			animation: none;
			opacity: 0.3;
		}

		.tier-critical .stability-value,
		.tier-critical .stability-fill {
			animation: none;
		}
	}
</style>
