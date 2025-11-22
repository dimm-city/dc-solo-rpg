<script>
	/**
	 * ProgressTracker - Cards drawn progress tracker
	 *
	 * Displays a progress bar showing how many cards have been drawn out of 52 total.
	 * Only shows when at least one card has been drawn.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.75,
		/** Animation duration in seconds */
		animationDuration = 0.7
	} = $props();

	// Reactive screen width tracking
	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

	// Reactive data-augmented-ui attribute
	const augmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tl-clip-x border' : 'tl-2-clip-x tr-2-clip-x border'
	);

	// Cards progress tracking
	const cardsDrawn = $derived(gameState.cardsDrawn || 0);
	const totalCards = 52;
	const progressPercent = $derived((cardsDrawn / totalCards) * 100);
</script>

{#if cardsDrawn > 0}
	<div
		class="progress-tracker slide-down"
		data-augmented-ui={augmentedUI}
		style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
	>
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progressPercent}%"></div>
		</div>
		<div class="progress-text">
			<span class="drawn">{cardsDrawn}</span>
			<span class="separator">/</span>
			<span class="total">{totalCards}</span>
			<span class="label">CARDS DRAWN</span>
		</div>
	</div>
{/if}

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

	.progress-tracker {
		/* Augmented UI Configuration */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 12px;
		--aug-tr: 12px;

		width: 100%;
		padding: var(--space-sm);
		display: flex;
		align-items: center;
		gap: var(--space-sm);

		/* Glassmorphism Effect */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);

		/* Glow */
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.4),
			0 0 30px rgba(217, 70, 239, 0.2),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		transition: width 0.3s linear;
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
		position: relative;
		animation: fillBarGrow 0.6s linear forwards;
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

	.progress-text {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		font-family: 'Courier New', monospace;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.progress-text .drawn {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 10px rgba(0, 255, 255, 1),
			0 0 20px rgba(0, 255, 255, 0.6);
	}

	.progress-text .separator {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.5);
		opacity: 0.7;
	}

	.progress-text .total {
		font-size: 1rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
	}

	.progress-text .label {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-left: var(--space-xs);
	}

	/* Mobile adjustments for progress tracker */
	@media (max-width: 600px) {
		/* Hide progress tracker on mobile */
		.progress-tracker {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.progress-fill {
			animation: none;
			opacity: 1;
		}
	}
</style>
