<script>
/**
 * StoryNavigation - Navigation controls for story mode
 *
 * Provides previous/next buttons, round indicator, and keyboard hints
 *
 * @component
 * @example
 * <StoryNavigation
 *   currentRound={2}
 *   totalRounds={10}
 *   canGoPrevious={true}
 *   canGoNext={true}
 *   onPrevious={() => console.log('prev')}
 *   onNext={() => console.log('next')}
 * />
 */

import AugmentedButton from '../AugmentedButton.svelte';

let {
	currentRound = 0,
	totalRounds = 1,
	canGoPrevious = false,
	canGoNext = false,
	onPrevious = () => {},
	onNext = () => {}
} = $props();
</script>

<!-- Navigation Controls -->
<div class="navigation-controls" data-augmented-ui="tl-clip tr-clip border">
	<AugmentedButton
		onclick={onPrevious}
		disabled={!canGoPrevious}
		label="Previous Round"
		style="secondary"
	>
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			slot="icon"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16l-6-6 6-6" />
		</svg>
		Previous
	</AugmentedButton>

	<div class="round-indicator">
		<span class="current">{currentRound + 1}</span>
		<span class="separator">/</span>
		<span class="total">{totalRounds}</span>
	</div>

	<AugmentedButton onclick={onNext} disabled={!canGoNext} label="Next Round" style="secondary">
		Next
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			slot="icon"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4l6 6-6 6" />
		</svg>
	</AugmentedButton>
</div>

<!-- Keyboard hints -->
<div class="keyboard-hints">
	<span class="hint">
		<kbd>←</kbd>
		Previous
	</span>
	<span class="hint">
		<kbd>→</kbd>
		Next
	</span>
	<span class="hint">
		<kbd>Esc</kbd>
		Exit
	</span>
</div>

<style>
	/* Navigation Controls */
	.navigation-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: rgba(0, 0, 0, 0.4);

		/* Augmented UI */
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-border-bg: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(138, 43, 226, 0.3);
	}

	.round-indicator {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
		font-family: 'Courier New', monospace;
	}

	.round-indicator .current {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
	}

	.round-indicator .separator {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.round-indicator .total {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Keyboard Hints */
	.keyboard-hints {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xl);
		padding: var(--space-md);
		color: rgba(255, 255, 255, 0.6);
		font-size: var(--text-sm);
	}

	.hint {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	kbd {
		padding: var(--space-xs) var(--space-sm);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: var(--text-xs);
		color: var(--color-neon-cyan);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.navigation-controls {
			flex-direction: row;
			justify-content: space-between;
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.navigation-controls :global(button) {
			flex: 1;
			min-width: 0;
			font-size: 0.875rem;
			padding: var(--space-sm) var(--space-md);
		}

		.round-indicator {
			position: relative;
			flex-shrink: 0;
			gap: var(--space-xs);
		}

		.round-indicator .current {
			font-size: 1.5rem;
		}

		.round-indicator .separator,
		.round-indicator .total {
			font-size: 1rem;
		}

		.keyboard-hints {
			display: none; /* Hide on mobile */
		}
	}

	@media (min-width: 769px) and (max-width: 1024px) {
		.navigation-controls {
			padding: var(--space-sm);
		}

		.round-indicator .current {
			font-size: 1.25rem;
		}
	}
</style>
