<script>
	/**
	 * StabilityPanel - Stability stat panel with gradient bar
	 *
	 * Displays current stability with a visual bar that changes color based on value.
	 * Uses Augmented UI styling with dynamic gradients and glows.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.15,
		/** Animation duration in seconds */
		animationDuration = 0.7
	} = $props();

	// Reactive screen width tracking
	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

	// Reactive data-augmented-ui attribute for health stat
	const healthAugmentedUI = $derived(
		isMobile ? 'tl-clip tr-clip br-clip-x border' : 'tl-clip tr-clip-x br-clip-x border'
	);

	// Stability gradient - changes based on value (low = red, high = green)
	const stabilityGradient = $derived(() => {
		const stability = gameState.tower;
		if (stability >= 10) {
			// High stability - positive colors (green)
			return 'linear-gradient(90deg, #00ff88, #00cc66)';
		} else {
			// Low stability - warning/danger colors (red/magenta)
			return 'linear-gradient(90deg, #ff0055, #d946ef)';
		}
	});

	const stabilityGlow = $derived(() => {
		const stability = gameState.tower;
		return stability >= 10 ? '#00ff88' : '#ff0055';
	});

	const stabilityPercent = $derived((gameState.tower / 20) * 100);
</script>

<div
	class="stat-item health-stat slide-down"
	data-augmented-ui={healthAugmentedUI}
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="stat-label">
		<svg
			class="stat-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
			/>
			<path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
		</svg>
		STABILITY
	</div>
	<div class="stat-bar stability-bar">
		<div
			class="stat-fill stability-fill"
			style="width: {stabilityPercent}%; background: {stabilityGradient()}; box-shadow: 0 0 10px {stabilityGlow()}"
		></div>
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
		/* Augmented UI Base Configuration */
		--aug-border-all: 2px;

		width: min-content;
		/* Truly Compact Layout */
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		position: relative;
		overflow: visible;
		min-height: 36px;

		/* Darker Glassmorphism Background */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);

		/* Subtle inner shine */
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.health-stat {
		/* Augmented UI Configuration - Entry point with rightward tab */
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 8px; /* Gentle entry */
		--aug-tr: 14px; /* Strong tab → connects to Failure */
		--aug-br: 14px; /* Strong tab → connects to Bonus (mobile) */

		/* Right side rectangle extension - creates puzzle tab */
		--aug-r-extend1: 30px;
		--aug-r-inset1: 12px;

		/* PRIMARY importance - Enhanced Glow */
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(0, 255, 255, 0.25),
			inset 0 0 15px rgba(0, 255, 255, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.stat-label {
		font-size: 0.75rem; /* 12px - compact for desktop */
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: 'Courier New', monospace;
		opacity: 1; /* Remove opacity, rely on color/shadow for hierarchy */
		text-align: left;
		align-self: center;
		flex: 0 0 auto;
		white-space: nowrap;
		min-width: 58px;
		/* Add padding to avoid clip zones */
		padding-left: 2px;
		/* Display help icon inline */
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	.stat-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		display: inline-block;
		vertical-align: middle;
		filter: drop-shadow(0 0 3px currentColor);
	}

	.health-stat .stat-label {
		color: #00ffaa;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	/* Stat Bars */
	.stat-bar {
		height: 5px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
		align-self: center;
		flex: 1 1 auto;
		min-width: 35px;
		border-radius: 2px;
		/* Add margin to avoid clip zones */
		margin-right: 2px;
	}

	@keyframes fillBarGrow {
		from {
			width: 0;
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.stat-fill {
		height: 100%;
		transition: width 0.3s linear;
		position: relative;
		box-shadow: 0 0 10px currentColor;
		animation: fillBarGrow 0.5s linear forwards;
	}

	/* Stability bar - larger since no stat value */
	.stability-bar {
		height: 12px;
		flex: 1 1 auto;
		min-width: 80px;
	}

	/* Stability fill - gradient and glow set via inline styles (reactive) */
	.stability-fill {
		transition: all 0.3s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.stat-fill {
			animation: none;
			opacity: 1;
		}
	}
</style>
