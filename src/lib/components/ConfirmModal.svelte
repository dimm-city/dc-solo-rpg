<script>
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import AugmentedButton from './AugmentedButton.svelte';
	import ButtonBar from './ButtonBar.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {boolean} isOpen - Whether the modal is visible
	 * @property {string} title - Modal title
	 * @property {string} message - Modal message/description
	 * @property {string} [confirmText='Confirm'] - Text for confirm button
	 * @property {string} [cancelText='Cancel'] - Text for cancel button
	 * @property {() => void} onConfirm - Callback when user confirms
	 * @property {() => void} onCancel - Callback when user cancels
	 */

	let {
		isOpen = false,
		title,
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		onConfirm,
		onCancel
	} = $props();

	let modalTarget = $state(null);

	onMount(() => {
		modalTarget = document.body;
	});

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			onCancel();
		}
	}
</script>

{#if isOpen && modalTarget}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		transition:fade={{ duration: 200 }}
	>
		<div class="modal-content" transition:fly={{ y: -500, duration: 400, opacity: 1 }}>
			<div class="modal-header">
				<h2 id="modal-title">{title}</h2>
			</div>

			<div class="modal-body">
				<p>{message}</p>
			</div>

			<ButtonBar bordered={true} gameBackground={false}>
				<AugmentedButton onclick={onCancel} text={cancelText} variant="secondary" />
				<AugmentedButton onclick={onConfirm} text={confirmText} variant="primary" />
			</ButtonBar>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed !important;
		inset: 0 !important;
		width: 100vw !important;
		height: 100vh !important;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex !important;
		align-items: center;
		justify-content: center;
		z-index: 999999 !important;
		padding: 1rem;
	}

	.modal-content {
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(15, 15, 25, 0.95));
		border: 2px solid var(--color-cyber-magenta);
		border-radius: 4px;
		max-width: 500px;
		width: 100%;
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.4),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
		position: relative;
		overflow: hidden;
		z-index: 1000000;
		pointer-events: auto;
	}

	/* Cyberpunk corner clips */
	.modal-content::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 0 20px 20px 0;
		border-color: transparent var(--color-bg-primary) transparent transparent;
	}

	.modal-content::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 0;
		border-style: solid;
		border-width: 0 0 20px 20px;
		border-color: transparent transparent var(--color-bg-primary) transparent;
	}

	.modal-header {
		padding: var(--space-lg);
		border-bottom: 1px solid rgba(217, 70, 239, 0.3);
		position: relative;
	}

	.modal-header::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 50%;
		transform: translateX(-50%);
		width: 100px;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--color-cyber-magenta), transparent);
		box-shadow: 0 0 8px rgba(217, 70, 239, 0.6);
	}

	.modal-header h2 {
		margin: 0;
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		text-align: center;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		font-family: var(--font-display);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
	}

	.modal-body {
		padding: var(--space-2xl) var(--space-lg);
		text-align: center;
	}

	.modal-body p {
		margin: 0;
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
	}

	/* Responsive adjustments */
	@media (max-width: 600px) {
		.modal-content {
			max-width: 100%;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.modal-backdrop,
		.modal-content {
			transition: none !important;
		}
	}
</style>
