<script>
	/**
	 * SuccessTokensPanel - Success tokens panel
	 *
	 * Displays 10 tokens in a grid. Start with 10 active, remove to win.
	 * Uses Augmented UI styling with pentagon-shaped tokens and glow animations.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.65,
		/** Animation duration in seconds */
		animationDuration = 0.75
	} = $props();

	// Reactive screen width tracking
	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

	// Reactive data-augmented-ui attribute for success stat
	const successAugmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tl-clip-x border' : 'tl-2-clip-x tr-2-clip-x border'
	);

	// Token visualization - create array of token states (count down from 10 to 0)
	const tokenStates = $derived(
		Array.from({ length: 10 }, (_, i) => ({
			index: i,
			active: i < gameState.tokens
		}))
	);

	// Success label from config or default
	const successLabel = $derived(
		gameState.config?.labels?.successCounters?.toUpperCase() ?? 'SUCCESS'
	);
</script>

<div
	class="stat-item success-stat slide-down"
	data-augmented-ui={successAugmentedUI}
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
			<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
			<path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
			<path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
			<path d="M4 22h16" />
			<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
			<path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
		</svg>
		{successLabel}
	</div>
	<div class="token-grid">
		{#each tokenStates as token (token.index)}
			<div
				class="token-shape"
				class:active={token.active}
				class:disabled={!token.active}
				style="--token-index: {token.index}"
			>
				<div class="token-inner"></div>
			</div>
		{/each}
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

	.success-stat {
		/* Augmented UI Configuration - Terminus with receiving slot */
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-brand-yellow));
		--aug-tl: 6px; /* Slot ← receives Bonus's tab (desktop) OR Failure's tab (mobile) */
		--aug-tr: 8px; /* Gentle endpoint */
		--aug-br: 4px; /* Gentle terminus */
		--aug-bl: 4px; /* Visual anchor */

		padding: 0.5rem;
		/* SECONDARY importance - Reduced Glow */
		box-shadow:
			0 0 12px rgba(0, 255, 255, 0.4),
			0 0 24px rgba(0, 255, 255, 0.2),
			inset 0 0 10px rgba(0, 255, 255, 0.1),
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

	.success-stat .stat-label {
		color: #ffee00;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	/* Token Grid */
	.token-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		padding: 0.25rem;
	}

	@keyframes tokenPopIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.token-shape {
		width: 16px;
		height: 16px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s linear;
		animation: tokenPopIn 0.15s linear forwards;
		animation-delay: calc(0.7s + var(--token-index) * 0.03s);
		opacity: 0;
	}

	.token-inner {
		width: 100%;
		height: 100%;
		clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
		transition: all 0.3s ease;
	}

	.token-shape.active .token-inner {
		background: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		box-shadow:
			0 0 10px rgba(255, 238, 0, 0.8),
			0 0 20px rgba(0, 255, 255, 0.4);
		animation: token-glow 2s ease-in-out infinite;
	}

	.token-shape.disabled .token-inner {
		background: rgba(100, 100, 100, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	@keyframes token-glow {
		0%,
		100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.3);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.token-shape {
			animation: tokenPopIn 0s linear forwards;
			opacity: 1;
		}

		.token-shape.active .token-inner {
			animation: none;
		}
	}
</style>
