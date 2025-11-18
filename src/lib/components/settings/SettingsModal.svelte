<script>
	import { onMount, onDestroy } from 'svelte';
	import AudioSettings from './AudioSettings.svelte';

	let { isOpen = $bindable(false), onClose } = $props();

	let portalTarget;
	let modalElement;

	onMount(() => {
		// Create a portal container at the body level
		portalTarget = document.createElement('div');
		portalTarget.className = 'settings-modal-portal';
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
		class="settings-modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
	>
		<div
			class="settings-modal-container"
			data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
		>
			<div class="settings-header">
				<h2>Game Settings</h2>
				<button class="close-button" onclick={onClose} aria-label="Close Settings">×</button>
			</div>

			<div class="settings-body">
				<AudioSettings />
			</div>

			<div class="settings-footer">
				<button class="done-button" onclick={onClose}>
					<span>Done</span>
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
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Portal container styles */
	:global(.settings-modal-portal) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		pointer-events: none;
	}

	/* Backdrop overlay */
	.settings-modal-backdrop {
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

	/* Modal container */
	.settings-modal-container {
		position: relative;
		width: 90%;
		max-width: 600px;
		max-height: 85vh;
		background: var(--dc-default-container-bg, rgba(13, 27, 42, 0.95));
		border: 2px solid var(--dc-accent-color, #3a9fc7);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header */
	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md, 1rem);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.2);
	}

	.settings-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--dc-default-text-color, #ffffff);
		font-weight: 600;
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

	/* Body */
	.settings-body {
		flex: 1;
		overflow-y: auto;
		padding: 0;
	}

	/* Footer */
	.settings-footer {
		padding: var(--space-md, 1rem);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: center;
		background: rgba(0, 0, 0, 0.2);
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
		.settings-modal-container {
			width: 95%;
			max-height: 90vh;
		}

		.settings-header h2 {
			font-size: 1.25rem;
		}
	}
</style>
