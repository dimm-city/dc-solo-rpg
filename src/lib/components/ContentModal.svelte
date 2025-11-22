<script>
	/**
	 * ContentModal - Base modal for content-heavy screens (settings, help, about, etc.)
	 * Based on the in-game SettingsModal pattern
	 * Uses portal rendering and consistent styling with CSS variables
	 */
	import { onMount, onDestroy } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		children,
		isOpen = $bindable(false),
		title = '',
		onClose,
		showFooter = true,
		footerButtonText = 'Done',
		footerButtonIcon = 'check' // 'check', 'close', or 'none'
	} = $props();

	let portalTarget;
	let modalElement;

	onMount(() => {
		// Create a portal container at the body level
		portalTarget = document.createElement('div');
		portalTarget.className = 'content-modal-portal';
		document.body.appendChild(portalTarget);
	});

	onDestroy(() => {
		// Clean up portal when component is destroyed
		if (portalTarget && portalTarget.parentNode) {
			portalTarget.parentNode.removeChild(portalTarget);
		}
	});

	// Use $effect to move the modal element to the portal when it's created
	$effect(() => {
		if (isOpen && modalElement && portalTarget) {
			// Move the modal to the portal
			portalTarget.appendChild(modalElement);
		}

		// Cleanup function
		return () => {
			if (modalElement && portalTarget && portalTarget.contains(modalElement)) {
				portalTarget.removeChild(modalElement);
			}
		};
	});

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		bind:this={modalElement}
		class="content-modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
		transition:fade={{ duration: 200, easing: cubicOut }}
	>
		<!-- Augmented UI wrapper with scale animation -->
		<div
			class="content-modal-wrapper"
			data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
			transition:scale={{ duration: 250, start: 0.92, opacity: 0, easing: cubicOut }}
		>
			<!-- Modal container (non-scrollable structure) -->
			<div class="content-modal-container">
				<div class="content-header">
					<h2>{title}</h2>
					<button class="close-button" onclick={onClose} aria-label="Close {title}">×</button>
				</div>

				<!-- Scrollable body wrapper -->
				<div class="content-body-wrapper">
					<div class="content-body">
						{@render children()}
					</div>
				</div>

				{#if showFooter}
					<div class="content-footer">
						<button class="done-button" onclick={onClose}>
							<span>{footerButtonText}</span>
							{#if footerButtonIcon === 'check'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							{:else if footerButtonIcon === 'close'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							{/if}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Portal container styles */
	:global(.content-modal-portal) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		pointer-events: none;
	}

	/* Backdrop overlay */
	.content-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.75);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10000;
		pointer-events: all;
		backdrop-filter: blur(2px);
	}

	/* Wrapper with augmented UI and scale animation */
	.content-modal-wrapper {
		width: 90%;
		max-width: 600px;
		max-height: 85vh;
		display: flex;

		/* Augmented UI styling */
		--aug-border-all: 2px;
		--aug-border-bg: var(--dc-accent-color, #3a9fc7);
		--aug-tl: 12px;
		--aug-tr: 12px;
		--aug-br: 12px;
		--aug-bl: 12px;
	}

	/* Modal container (structure holder - no border) */
	.content-modal-container {
		position: relative;
		width: 100%;
		background: var(--dc-default-container-bg, rgba(13, 27, 42, 0.95));
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header */
	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md, 1rem);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.2);
		flex-shrink: 0; /* Don't shrink header */
	}

	.content-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--dc-default-text-color, #ffffff);
		font-weight: 600;
		font-family: var(--font-display, 'Orbitron', monospace);
	}

	.close-button {
		background: none;
		border: none;
		color: var(--dc-default-text-color, #ffffff);
		cursor: pointer;
		padding: var(--space-xs, 0.25rem);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		line-height: 1;
		opacity: 0.7;
		transition: opacity 0.2s;
		width: 32px;
		height: 32px;
	}

	.close-button:hover {
		opacity: 1;
	}

	/* Body wrapper - this is the scrollable container */
	.content-body-wrapper {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		min-height: 0; /* Important for flex scrolling */
	}

	/* Body - content container (not scrollable itself) */
	.content-body {
		padding: var(--space-lg, 1.5rem);
		color: var(--dc-default-text-color, #ffffff);
	}

	/* Footer */
	.content-footer {
		padding: var(--space-md, 1rem);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: center;
		background: rgba(0, 0, 0, 0.2);
		flex-shrink: 0; /* Don't shrink footer */
	}

	.done-button {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
		background: var(--dc-button-bg, #1387b9);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-family: var(--font-display, 'Orbitron', monospace);
	}

	.done-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.done-button:active {
		transform: translateY(0);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.content-modal-wrapper {
			width: 95%;
			max-height: 90vh;
		}

		.content-header h2 {
			font-size: 1.25rem;
		}

		.content-body {
			padding: var(--space-md, 1rem);
		}
	}

	@media (max-width: 480px) {
		.content-modal-wrapper {
			width: 100%;
			max-height: 100vh;
		}

		.content-header h2 {
			font-size: 1.1rem;
		}

		.content-body {
			padding: var(--space-sm, 0.75rem);
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.content-modal-backdrop,
		.content-modal-wrapper {
			transition: none !important;
		}
	}
</style>
