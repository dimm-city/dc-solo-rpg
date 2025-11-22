<script>
	/**
	 * FailureCounterPanel - Failure counter (Kings) panel
	 *
	 * Displays the 4 Kings as failure indicators. When all 4 are revealed, game is lost.
	 * Uses Augmented UI styling with reveal animations.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.25,
		/** Animation duration in seconds */
		animationDuration = 0.85
	} = $props();

	// Reactive screen width tracking
	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

	// Reactive data-augmented-ui attribute for failure stat
	const failureAugmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tr-clip-x border' : 'l-rect tr-clip br-clip-x border'
	);

	// Kings revealed count (includes pending changes)
	const failurePercent = $derived(
		gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange || 0)
	);

	// Label from config or default
	const failureLabel = $derived(
		gameState.config?.labels?.failureCounters?.toUpperCase() ?? 'FAILURE'
	);
</script>

<div
	class="stat-item failure-stat slide-down-and-left"
	data-augmented-ui={failureAugmentedUI}
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
			<path d="m12.5 17-.5-1-.5 1h1z" />
			<path
				d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"
			/>
			<circle cx="15" cy="12" r="1" />
			<circle cx="9" cy="12" r="1" />
		</svg>
		{failureLabel}
	</div>
	<div class="king-indicators">
		{#each Array(4) as _, i (i)}
			<div class="king-icon" class:revealed={i < failurePercent}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M2 20h20v-4a6 6 0 0 0-12 0v4zm0 0v-4a6 6 0 1 1 12 0v4zM12 2v4m-4-2 4 2 4-2" />
				</svg>
			</div>
		{/each}
	</div>
</div>

<style>
	/* Animation */
	.slide-down-and-left {
		animation: slideDownAndLeft 0.4s linear forwards;
		opacity: 0;
	}

	/* Mechanical Assembly - Step 1: Linear drop, Step 2: Ease left into slot */
	@keyframes slideDownAndLeft {
		0% {
			transform: translateY(-100%) translateX(0);
			opacity: 0;
		}
		45% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
		45.01% {
			transform: translateY(0) translateX(50px);
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

	.failure-stat {
		/* Augmented UI Configuration - Receiver with matching inset */
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 14px; /* Slot ← receives Health's tab */
		--aug-tr: 8px; /* Gentle transition */
		--aug-br: 14px; /* Strong tab → connects to Success (mobile) */

		/* Left side rectangle inset - receives puzzle tab from health */
		/* Match health's right extension for perfect fit */
		--aug-l-extend1: 40px;
		--aug-l-inset1: 10px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-inline-start: -30px;
		padding-inline-start: 2rem;
		/* SECONDARY importance - Reduced Glow */
		box-shadow:
			0 0 12px rgba(217, 70, 239, 0.4),
			0 0 24px rgba(217, 70, 239, 0.2),
			inset 0 0 10px rgba(217, 70, 239, 0.1),
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

	.failure-stat .stat-label {
		color: #ff0066;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	/* King Indicators for Failure Stat */
	.king-indicators {
		display: flex;
		gap: 3px;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		padding: 2px;
	}

	.king-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s linear;
		opacity: 0.2;
	}

	.king-icon svg {
		width: 100%;
		height: 100%;
		stroke: #ff0066;
		filter: drop-shadow(0 0 2px rgba(255, 0, 102, 0.3));
	}

	.king-icon.revealed {
		opacity: 1;
		filter: grayscale(0);
		animation: kingReveal 0.2s linear forwards;
	}

	.king-icon.revealed svg {
		stroke: #ff0066;
		filter: drop-shadow(0 0 6px rgba(255, 0, 102, 0.9));
	}

	@keyframes kingReveal {
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
			margin-inline-start: 0;
			padding-inline-start: 0.5rem;
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

		.king-indicators {
			gap: 2px;
		}

		.king-icon {
			width: 14px;
			height: 14px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down-and-left {
			animation: none;
			opacity: 1;
		}

		.king-icon {
			transition: none;
		}

		.king-icon.revealed {
			animation: none;
		}
	}
</style>
