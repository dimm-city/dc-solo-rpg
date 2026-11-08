<script>
	/**
	 * StoryNavigation - Previous / Next for story mode, pinned to the bottom of the reader
	 *
	 * @component
	 * @example
	 * <StoryNavigation currentRound={2} totalRounds={10} canGoPrevious canGoNext
	 *   onPrevious={prev} onNext={next} />
	 */

	let {
		currentRound = 0,
		totalRounds = 1,
		canGoPrevious = false,
		canGoNext = false,
		onPrevious = () => {},
		onNext = () => {}
	} = $props();
</script>

<nav class="story-navigation" aria-label="Rounds">
	<button
		type="button"
		class="nav-button"
		onclick={onPrevious}
		disabled={!canGoPrevious}
		aria-label="Previous round"
	>
		<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 16l-6-6 6-6" /></svg>
		<span class="nav-label">Previous</span>
	</button>

	<p class="round-indicator" role="status" aria-live="polite">
		Round <strong>{currentRound + 1}</strong> of {totalRounds}
	</p>

	<button
		type="button"
		class="nav-button"
		onclick={onNext}
		disabled={!canGoNext}
		aria-label="Next round"
	>
		<span class="nav-label">Next</span>
		<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4l6 6-6 6" /></svg>
	</button>

	<p class="keyboard-hints" aria-hidden="true">
		<kbd>←</kbd><kbd>→</kbd> turn the page · <kbd>Esc</kbd> back to the library
	</p>
</nav>

<style>
	.story-navigation {
		position: sticky;
		bottom: 0;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 8px 16px;
		/* Full-width bar; its controls line up with the 640px reading column */
		padding: 12px max(16px, calc((100% - 640px) / 2), env(safe-area-inset-right, 0px))
			max(12px, env(safe-area-inset-bottom, 0px))
			max(16px, calc((100% - 640px) / 2), env(safe-area-inset-left, 0px));
		background: rgba(8, 12, 18, 0.92);
		border-top: 1px solid rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		font-family: var(--font-body);
	}

	.nav-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 0 16px;
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.6);
		border-radius: 4px;
		color: #fff;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			opacity 150ms ease-out;
	}

	.nav-button:first-child {
		justify-self: start;
	}

	.nav-button:nth-child(3) {
		justify-self: end;
	}

	.nav-button svg {
		flex-shrink: 0;
		width: 18px;
		height: 18px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.25;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.nav-button:hover:not(:disabled) {
		background: rgba(0, 255, 255, 0.14);
	}

	.nav-button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.round-indicator {
		margin: 0;
		font-size: 0.875rem;
		color: #aebbcc;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	.round-indicator strong {
		font-size: 1.125rem;
		color: #fff;
	}

	.keyboard-hints {
		grid-column: 1 / -1;
		justify-self: center;
		margin: 0;
		font-size: 0.75rem;
		color: #8396ab;
	}

	kbd {
		display: inline-block;
		min-width: 1.6em;
		margin-right: 2px;
		padding: 0 4px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 3px;
		font-family: var(--font-body);
		font-size: 0.75rem;
		text-align: center;
		color: #d5dfeb;
	}

	/* Touch screens: no keyboard hints; icon-only buttons on narrow phones */
	@media (hover: none), (max-width: 768px) {
		.keyboard-hints {
			display: none;
		}
	}

	/* Landscape phones: a slimmer bar; the buttons keep their 44px */
	@media (max-height: 500px) {
		.story-navigation {
			padding-top: 8px;
			padding-bottom: max(8px, env(safe-area-inset-bottom, 0px));
		}
	}

	@media (max-width: 360px) {
		.nav-label {
			display: none;
		}

		.nav-button {
			width: 48px;
			justify-content: center;
			padding: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.nav-button {
			transition: none;
		}
	}
</style>
