<script>
	/**
	 * Reusable two-button bar component with responsive layout
	 * Buttons are side-by-side on larger screens, stacked on mobile
	 *
	 * @typedef {Object} Props
	 * @property {boolean} [bordered=true] - Show top border
	 * @property {boolean} [gameBackground=true] - Use game background styling
	 * @property {import('svelte').Snippet} [children] - Child content to render
	 */

	let { bordered = true, gameBackground = true, children } = $props();

	const borderClass = bordered ? 'with-border' : '';
	const bgClass = gameBackground ? 'dc-game-bg' : '';
</script>

<div class="button-bar {borderClass} {bgClass}">
	{@render children?.()}
</div>

<style>
	.button-bar {
		flex-shrink: 0;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		padding: var(--space-md);
		position: relative;
		z-index: 10;
		container-type: inline-size;
	}

	.with-border {
		border-top: 2px solid var(--color-cyber-magenta);
	}

	.dc-game-bg {
		background: var(--color-bg-primary);
	}

	/* Each button wrapper fills half the row */
	.button-bar > :global(.aug-button-wrapper) {
		flex: 1 1 calc(50% - var(--space-sm) / 2);
		min-width: 120px;
	}

	/* Ensure buttons fill their wrappers */
	.button-bar > :global(.aug-button-wrapper .aug-button) {
		width: 100%;
	}

	/* Direct children (non-wrapped buttons) also get flex treatment */
	.button-bar > :global(*:not(.aug-button-wrapper)) {
		flex: 1 1 calc(50% - var(--space-sm) / 2);
		min-width: 120px;
	}

	/* Stack vertically when container is less than 200px wide */
	@container (max-width: 200px) {
		.button-bar {
			flex-direction: column;
		}

		.button-bar > :global(.aug-button-wrapper),
		.button-bar > :global(*) {
			flex: 1 1 100%;
			width: 100%;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.button-bar {
			transition: none !important;
		}
	}
</style>
