<script>
	import { marked } from 'marked';
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';

	let { isOpen = false } = $props();

	const intro = $derived(marked(gameState.config?.introduction ?? ''));

	function handleContinue() {
		// Proceed to roll for tasks
		transitionTo('rollForTasks');
	}
</script>

{#if isOpen}
	<div class="overlay-backdrop" role="dialog" aria-modal="true" aria-labelledby="intro-title">
		<div class="overlay-container" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<div class="overlay-header">
				<h1 id="intro-title">{gameState.config?.title || 'Game Introduction'}</h1>
			</div>

			<div class="overlay-content">
				{@html intro}
			</div>

			<div class="overlay-footer">
				<ContinueButton
					text="Begin Your Journey"
					onclick={handleContinue}
					testid="intro-continue-button"
				/>
			</div>
		</div>
	</div>
{/if}

<style>
	.overlay-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: var(--space-md);
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.overlay-container {
		/* Augmented UI Configuration */
		--aug-border-all: 3px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 20px;
		--aug-tr: 20px;
		--aug-br: 20px;
		--aug-bl: 20px;

		max-width: 800px;
		max-height: 90vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		background: linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95));
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);

		/* Enhanced Glow */
		box-shadow:
			0 0 40px rgba(0, 255, 255, 0.6),
			0 0 80px rgba(0, 255, 255, 0.3),
			0 0 120px rgba(217, 70, 239, 0.2),
			inset 0 0 40px rgba(0, 255, 255, 0.1);

		animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.overlay-header {
		padding: var(--space-lg) var(--space-xl);
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
		flex-shrink: 0;
	}

	.overlay-header h1 {
		font-size: var(--text-2xl);
		margin: 0;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 20px rgba(0, 255, 255, 0.8),
			0 0 40px rgba(0, 255, 255, 0.4);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.overlay-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--space-xl);
		min-height: 0;

		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: var(--color-neon-cyan) rgba(0, 0, 0, 0.3);
	}

	.overlay-content::-webkit-scrollbar {
		width: 8px;
	}

	.overlay-content::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
	}

	.overlay-content::-webkit-scrollbar-thumb {
		background: var(--color-neon-cyan);
		border-radius: 4px;
	}

	.overlay-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-cyber-magenta);
	}

	/* Markdown content styling */
	.overlay-content :global(h1) {
		font-size: var(--text-xl);
		margin-top: var(--space-lg);
		margin-bottom: var(--space-md);
		color: var(--color-neon-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	.overlay-content :global(h1:first-child) {
		margin-top: 0;
	}

	.overlay-content :global(h2) {
		font-size: var(--text-lg);
		margin-top: var(--space-lg);
		margin-bottom: var(--space-sm);
		color: var(--color-cyber-magenta);
		text-shadow: 0 0 10px rgba(217, 70, 239, 0.5);
	}

	.overlay-content :global(h3) {
		font-size: var(--text-base);
		margin-top: var(--space-md);
		margin-bottom: var(--space-sm);
		color: var(--color-brand-yellow);
	}

	.overlay-content :global(p) {
		margin-bottom: var(--space-md);
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.9);
	}

	.overlay-content :global(ul),
	.overlay-content :global(ol) {
		margin-bottom: var(--space-md);
		padding-left: var(--space-xl);
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.9);
	}

	.overlay-content :global(li) {
		margin-bottom: var(--space-xs);
	}

	.overlay-content :global(strong) {
		color: var(--color-neon-cyan);
		font-weight: 600;
	}

	.overlay-content :global(em) {
		color: var(--color-brand-yellow);
		font-style: italic;
	}

	.overlay-footer {
		padding: var(--space-lg) var(--space-xl);
		border-top: 2px solid rgba(0, 255, 255, 0.3);
		flex-shrink: 0;
		display: flex;
		justify-content: center;
	}

	.overlay-footer :global(.aug-button-wrapper) {
		min-width: 280px;
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.overlay-backdrop {
			padding: var(--space-sm);
		}

		.overlay-container {
			max-height: 95vh;
			--aug-tl: 12px;
			--aug-tr: 12px;
			--aug-br: 12px;
			--aug-bl: 12px;
		}

		.overlay-header {
			padding: var(--space-md) var(--space-lg);
		}

		.overlay-header h1 {
			font-size: var(--text-xl);
		}

		.overlay-content {
			padding: var(--space-lg);
		}

		.overlay-footer {
			padding: var(--space-md) var(--space-lg);
		}

		.overlay-footer :global(.aug-button-wrapper) {
			min-width: 100%;
		}
	}

	@media (max-width: 450px) {
		.overlay-header h1 {
			font-size: var(--text-lg);
		}

		.overlay-content {
			padding: var(--space-md);
		}

		.overlay-content :global(h1) {
			font-size: var(--text-lg);
		}

		.overlay-content :global(h2) {
			font-size: var(--text-base);
		}

		.overlay-content :global(h3) {
			font-size: var(--text-sm);
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.overlay-backdrop,
		.overlay-container {
			animation: none !important;
		}
	}
</style>
