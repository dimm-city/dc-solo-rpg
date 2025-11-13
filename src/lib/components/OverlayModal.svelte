<script>
	/**
	 * OverlayModal - Reusable full-screen modal overlay component
	 * Used for cards, journal entries, and contextual help
	 * Provides consistent styling and UX across all modal interactions
	 */
	import { fade } from 'svelte/transition';

	let { children, isVisible = true, zIndex = 50 } = $props();
</script>

{#if isVisible}
	<div
		class="overlay-modal-container"
		style="z-index: {zIndex};"
		transition:fade={{ duration: 300 }}
	>
		<div class="overlay-modal-content" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	/* ============================================
	   OVERLAY MODAL CONTAINER
	   Full-screen overlay except toolbar
	   ============================================ */

	.overlay-modal-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;

		/* Scrollable for long content */
		overflow-y: auto;
		overflow-x: hidden;

		/* Semi-transparent backdrop with blur */
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);

		/* Padding to clear toolbar at bottom and add spacing */
		padding: var(--space-md);
		padding-bottom: calc(60px + var(--space-lg)); /* Extra padding for toolbar */

		/* Center content, align to top for scrolling */
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}

	/* ============================================
	   OVERLAY MODAL CONTENT
	   Card-style container with augmented-ui
	   ============================================ */

	.overlay-modal-content {
		position: relative;
		width: 95%;
		max-width: 900px;
		height: auto;
		min-height: 400px;
		max-height: 90vh;

		/* Vertical margin for better spacing */
		margin: var(--space-lg) 0;

		/* Augmented UI Configuration */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-br: 16px;
		--aug-bl: 16px;

		/* Card styling with glassmorphism */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.85));
		backdrop-filter: blur(16px) saturate(150%);
		-webkit-backdrop-filter: blur(16px) saturate(150%);

		/* Enhanced glow */
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(217, 70, 239, 0.3),
			inset 0 0 20px rgba(0, 255, 255, 0.1);

		/* Ensure content can overflow if needed */
		overflow: visible;
	}

	/* ============================================
	   RESPONSIVE DESIGN
	   ============================================ */

	@media (max-width: 768px) {
		.overlay-modal-content {
			--aug-tl: 12px;
			--aug-tr: 12px;
			--aug-br: 12px;
			--aug-bl: 12px;
		}
	}

	@media (max-width: 600px) {
		.overlay-modal-container {
			padding: var(--space-sm);
			padding-bottom: calc(60px + var(--space-md));
		}

		.overlay-modal-content {
			width: 100%;
			min-height: 300px;
			--aug-tl: 8px;
			--aug-tr: 8px;
			--aug-br: 8px;
			--aug-bl: 8px;
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.overlay-modal-container {
			transition: none !important;
		}
	}
</style>
