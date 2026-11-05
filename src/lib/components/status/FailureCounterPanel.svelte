<script>
	/**
	 * FailureCounterPanel - Failure counter (Kings) panel
	 *
	 * Shows "n/4" and the 4 Kings as skulls in a 2x2 grid. Each newly lit skull ignites,
	 * lit skulls pulse harder as the count rises, and at 3 of 4 the panel turns urgent.
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

	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);
	const failureAugmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tr-clip-x border' : 'l-rect tr-clip br-clip-x border'
	);

	// Kings revealed count (includes pending changes)
	const count = $derived(
		Math.max(0, Math.min(4, gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange || 0)))
	);

	const failureLabel = $derived(
		gameState.config?.labels?.failureCounters?.toUpperCase() ?? 'KINGS'
	);

	// Index of the skull that just lit, for the one-off ignite animation
	let igniting = $state(-1);
	let previous = count;
	let igniteTimer;
	$effect(() => {
		const current = count;
		if (current > previous) {
			igniting = current - 1;
			clearTimeout(igniteTimer);
			igniteTimer = setTimeout(() => (igniting = -1), 600); // ANIMATION_DURATION.CARD_DISMISS
		}
		previous = current;
		return () => clearTimeout(igniteTimer);
	});
</script>

<div
	class="stat-item failure-stat slide-down-and-left"
	class:urgent={count >= 3}
	data-level={count}
	data-augmented-ui={failureAugmentedUI}
	data-testid="failure-panel"
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="stat-label">{failureLabel}</div>
	<div class="king-count" aria-label="{count} of 4 Kings revealed">
		<span class="current">{count}</span><span class="max">/4</span>
	</div>
	<div class="king-indicators" aria-hidden="true">
		{#each Array(4) as _, i (i)}
			<div class="king-icon" class:revealed={i < count} class:igniting={i === igniting}>
				<img src="/skull-color-64.png" alt="" />
			</div>
		{/each}
	</div>
</div>

<style>
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
		--aug-border-all: 2px;

		width: min-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.25rem;
		padding: 0.375rem 0.625rem;
		position: relative;
		overflow: visible;
		min-height: 36px;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);
	}

	.failure-stat {
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
		);
		--aug-tl: 14px;
		--aug-tr: 8px;
		--aug-br: 14px;
		--aug-l-extend1: 40px;
		--aug-l-inset1: 10px;
		--king-pulse-scale: 1;
		--king-pulse-time: 0s;

		grid-area: failure;
		margin-inline-start: -30px;
		padding-inline-start: 2rem;
		box-shadow:
			0 0 12px rgba(217, 70, 239, 0.3),
			inset 0 0 10px rgba(217, 70, 239, 0.1);
		transition: box-shadow 0.3s ease-out;
	}

	/* Lit skulls pulse harder and faster as Kings fall */
	.failure-stat[data-level='1'] {
		--king-pulse-scale: 1.03;
		--king-pulse-time: 3s;
	}
	.failure-stat[data-level='2'] {
		--king-pulse-scale: 1.06;
		--king-pulse-time: 2.2s;
	}
	.failure-stat[data-level='3'] {
		--king-pulse-scale: 1.1;
		--king-pulse-time: 1.4s;
	}
	.failure-stat[data-level='4'] {
		--king-pulse-scale: 1.14;
		--king-pulse-time: 0.9s;
	}

	/* 3 of 4: danger colour, the count is the loudest thing in the HUD */
	.failure-stat.urgent {
		--aug-border-bg: var(--color-danger, #ff4d6d);
		box-shadow:
			0 0 18px rgba(255, 77, 109, 0.55),
			inset 0 0 14px rgba(255, 77, 109, 0.2);
	}

	.stat-label {
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		color: var(--color-danger, #ff4d6d);
		text-align: center;
		align-self: center;
		white-space: nowrap;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.king-count {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		line-height: 1;
		color: #fff;
		transition: color 0.2s linear;
	}
	.king-count .current {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.king-count .max {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}
	.urgent .king-count {
		color: var(--color-danger, #ff4d6d);
		text-shadow: 0 0 12px rgba(255, 77, 109, 0.8);
	}
	.urgent .king-count .current {
		font-size: 1.75rem;
	}

	/* 2x2 skulls */
	.king-indicators {
		display: grid;
		grid-template-columns: repeat(2, 32px);
		gap: 4px;
		justify-content: center;
		padding: 2px;
	}

	.king-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.2;
		transition: opacity 0.2s linear;
	}

	.king-icon img {
		width: 100%;
		height: 100%;
		filter: grayscale(1) drop-shadow(0 0 2px rgba(255, 77, 109, 0.3));
	}

	.king-icon.revealed {
		opacity: 1;
		animation: kingPulse var(--king-pulse-time) ease-in-out infinite;
	}

	.king-icon.revealed img {
		filter: grayscale(0) drop-shadow(0 0 6px rgba(255, 77, 109, 0.9));
	}

	/* Newly lit skull: a short flare, then it joins the pulse */
	.king-icon.revealed.igniting {
		animation:
			kingIgnite 0.6s ease-out,
			kingPulse var(--king-pulse-time) ease-in-out 0.6s infinite;
	}
	.king-icon.igniting img {
		animation: kingIgniteGlow 0.6s ease-out;
	}

	@keyframes kingPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(var(--king-pulse-scale));
		}
	}

	@keyframes kingIgnite {
		0% {
			transform: scale(0.6);
			opacity: 0.2;
		}
		40% {
			transform: scale(1.35);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes kingIgniteGlow {
		0% {
			filter: grayscale(1) brightness(2);
		}
		40% {
			filter: grayscale(0) brightness(2.2) drop-shadow(0 0 14px rgba(255, 77, 109, 1));
		}
		100% {
			filter: grayscale(0) drop-shadow(0 0 6px rgba(255, 77, 109, 0.9));
		}
	}

	@media (max-width: 600px) {
		.stat-item {
			width: 100%;
			max-width: 100%;
			min-width: 0;
			padding: 0.25rem 0.5rem;
			margin-inline-start: 0;
			padding-inline-start: 0.5rem;
		}
		.stat-label {
			font-size: 0.625rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down-and-left {
			animation: none;
			opacity: 1;
		}
		.king-icon,
		.king-icon.revealed,
		.king-icon.revealed.igniting,
		.king-icon.igniting img {
			animation: none;
			transition: none;
		}
	}
</style>
