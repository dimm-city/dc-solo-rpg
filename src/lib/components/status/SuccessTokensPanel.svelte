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
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					stroke-width="2"
					style="fill: var(--success-color); stroke: var(--success-color);"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-star-icon lucide-star token-inner"
					><path
						d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
					/></svg
				>
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
		flex-direction: column;
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

		grid-area: success;
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
		display: none;
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
		width: 24px;
		height: 24px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.token-inner {
		width: 100%;
		height: 100%;

		transition: all 0.3s ease;
		overflow: hidden;
		transition: all 0.2s linear;
		animation: tokenPopIn 0.15s linear forwards;
		animation-delay: calc(0.7s + var(--token-index) * 0.03s);
		opacity: 1;
	}
	.token-shape.active {
		--success-color: rgba(100, 100, 100, 0.2);
	}

	.token-shape.active > * {
		color: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		/* background-color:
			0 0 10px rgba(255, 238, 0, 0.8), 
			0 0 20px rgba(0, 255, 255, 0.4);*/
		animation: token-glow 5s ease-in-out infinite;
	}
	.token-shape.disabled {
		--success-color: var(--color-toxic-green);
	}
	.token-shape.disabled > * {
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

	/* Mobile responsive */
	@media (max-width: 600px) {
		.token-shape {
			width: 18px;
			height: 18px;
		}
		.stat-item {
			width: 100%;
			max-width: 100%;
			min-width: 0;
			padding: 0.25rem 0.5rem;
			gap: 0.25rem;
			flex-direction: column-reverse;
			justify-content: end;
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
		/* 
		.token-indicators {
			gap: 2px;
		}

		.token-shape {
			width: 14px;
			height: 14px;
		}

		.token-inner {
			width: 10px;
			height: 10px;
		} */
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.token-shape {
		}

		.token-shape.active .token-inner {
			animation: none;
			opacity: 1;
		}
	}
</style>
