<script>
	/**
	 * InfoModal - Standardized modal for non-game informational content
	 * Used for: About, Settings, and other home page modals
	 * NOT used for: In-game modals (card display, journal, in-game settings)
	 */
	import OverlayModal from './OverlayModal.svelte';

	let {
		children,
		isVisible = false,
		title = '',
		onClose = () => {},
		showCloseButton = true
	} = $props();

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<OverlayModal {isVisible} zIndex={1000} fixedHeight="70dvh" animateHeight={true}>
	<div class="info-modal-content">
		<h2 class="info-modal-title">{title}</h2>
		<div class="info-modal-body">
			{@render children()}
		</div>
		{#if showCloseButton}
			<button class="info-modal-button" onclick={onClose}>
				<span>Close</span>
			</button>
		{/if}
	</div>
</OverlayModal>

<style>
	.info-modal-content {
		width: 100%;
		height: 100%;
		padding: clamp(var(--space-lg), 3vw, var(--space-xl));
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.info-modal-title {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 15px rgba(0, 255, 255, 1),
			0 0 30px rgba(0, 255, 255, 0.5);
		margin: 0 0 var(--space-md) 0;
		letter-spacing: 0.08em;
		text-align: center;
		text-transform: uppercase;
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
		padding-bottom: var(--space-md);
	}

	.info-modal-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
		overflow-y: auto;
	}

	.info-modal-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-lg);
		background: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		border: none;
		border-radius: 4px;
		color: white;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.2s ease;
		align-self: flex-end;
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			inset 0 0 10px rgba(255, 255, 255, 0.1);
	}

	.info-modal-button:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(255, 255, 255, 0.15);
	}

	.info-modal-button:active {
		transform: translateY(0);
	}

	/* Tablet breakpoint */
	@media (max-width: 900px) {
		.info-modal-content {
			padding: var(--space-lg);
		}

		.info-modal-title {
			font-size: var(--text-xl);
		}
	}

	/* Mobile breakpoint */
	@media (max-width: 600px) {
		.info-modal-content {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.info-modal-title {
			font-size: var(--text-lg);
			padding-bottom: var(--space-sm);
			margin-bottom: var(--space-sm);
		}

		.info-modal-body {
			font-size: var(--text-sm);
			gap: var(--space-sm);
		}

		.info-modal-button {
			align-self: stretch;
			padding: var(--space-md);
			font-size: var(--text-sm);
		}
	}

	/* Extra small mobile */
	@media (max-width: 400px) {
		.info-modal-content {
			padding: var(--space-sm);
		}

		.info-modal-title {
			font-size: var(--text-base);
		}

		.info-modal-body {
			font-size: var(--text-xs);
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.info-modal-button:hover {
			transform: none;
		}
	}
</style>
