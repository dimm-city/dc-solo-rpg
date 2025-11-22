<script>
	/**
	 * AbilitiesPanel - Abilities/Aces panel
	 *
	 * Displays 4 ability icons that activate as Aces are revealed.
	 * Uses Augmented UI styling with icon reveal animations.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.55,
		/** Animation duration in seconds */
		animationDuration = 0.85
	} = $props();

	// Reactive screen width tracking
	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

	// Reactive data-augmented-ui attribute for luck stat
	const luckAugmentedUI = $derived(
		isMobile ? 'tr-clip tl-clip bl-clip-x border' : 'tl-clip-y l-rect-y tr-clip-x br-clip-x border'
	);

	// Aces revealed count (includes pending changes)
	const bonusPercent = $derived(gameState.acesRevealed + (gameState.pendingUpdates.aceChange || 0));
</script>

<div
	class="stat-item bonus-stat slide-down-and-right"
	data-augmented-ui={luckAugmentedUI}
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="stat-label">ABILITIES</div>
	<div class="ability-icons">
		<!-- Sparkles - Luck/Fortune -->
		<svg
			class="ability-icon"
			class:active={bonusPercent >= 1}
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
			/>
		</svg>
		<!-- Shield - Protection/Defense -->
		<svg
			class="ability-icon"
			class:active={bonusPercent >= 2}
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
			/>
		</svg>
		<!-- Heart - Health/Resilience -->
		<svg
			class="ability-icon"
			class:active={bonusPercent >= 3}
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
			/>
		</svg>
		<!-- Zap - Energy/Action -->
		<svg
			class="ability-icon"
			class:active={bonusPercent >= 4}
			xmlns="http://www.w3.org/2000/svg"
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path
				d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
			/>
		</svg>
	</div>
</div>

<style>
	/* Animation */
	.slide-down-and-right {
		animation: slideDownAndRight 0.4s linear forwards;
		opacity: 0;
	}

	/* Mechanical Assembly - Step 1: Linear drop, Step 2: Ease right into slot */
	@keyframes slideDownAndRight {
		0% {
			transform: translateY(-100%) translateX(0);
			opacity: 0;
		}
		45% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
		45.01% {
			transform: translateY(0) translateX(-50px);
		}
		100% {
			transform: translateY(0) translateX(0);
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

	.bonus-stat {
		/* Augmented UI Configuration - Power source with rightward tab */
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		--aug-tl: 10px;
		/* Slot ← receives Health's tab (mobile) */
		--aug-l: 0px;
		--aug-tr: 12px; /* Strong tab → connects to Success */
		--aug-br: 8px; /* Gentle terminus */
		padding: 0.375rem;
		padding-left: 0.75rem;
		/* TERTIARY importance - Subtle Glow */
		box-shadow:
			0 0 8px rgba(255, 215, 0, 0.3),
			0 0 16px rgba(255, 215, 0, 0.15),
			inset 0 0 8px rgba(255, 215, 0, 0.08),
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

	.bonus-stat .stat-label {
		color: #00eeff;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	/* Ability Icons */
	.ability-icons {
		display: flex;
		gap: 4px;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
	}

	.ability-icon {
		width: 14px;
		height: 14px;
		opacity: 0.2;
		stroke: #00eeff;
		filter: drop-shadow(0 0 2px rgba(0, 238, 255, 0.3));
		transition: all 0.2s linear;
	}

	.ability-icon.active {
		opacity: 1;
		filter: drop-shadow(0 0 6px rgba(0, 238, 255, 0.9));
		animation: abilityReveal 0.2s linear forwards;
	}

	@keyframes abilityReveal {
		0% {
			transform: scale(0.7);
			opacity: 0.2;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.stat-item {
			width: 100%;
			max-width: 100%;
			min-width: 0;
			padding: 0.25rem 0.5rem;
			gap: 0.25rem;
			margin-inline-end: 0;
			padding-inline-end: 0.5rem;
		}

		.stat-label {
			font-size: 0.625rem;
			min-width: 48px;
			letter-spacing: 0.08em;
		}

		.stat-icon {
			width: 12px;
			height: 12px;
		}

		.ability-indicators {
			gap: 2px;
		}

		.ability-icon {
			width: 14px;
			height: 14px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down-and-right {
			animation: none;
			opacity: 1;
		}

		.ability-icon {
			transition: none;
		}

		.ability-icon.active {
			animation: none;
		}
	}
</style>
