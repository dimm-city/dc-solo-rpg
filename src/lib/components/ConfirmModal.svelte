<script>
	/**
	 * ConfirmModal - a yes/no question on the shared dialog (ContentModal, compact size):
	 * the same entrance, frame, 44px close and focus handling as every other dialog.
	 * The confirming action is an outlined red button when it destroys something.
	 */
	import ContentModal from './ContentModal.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {boolean} isOpen - Whether the modal is visible
	 * @property {string} title - Modal title
	 * @property {string} message - Modal message/description
	 * @property {string} [confirmText='Confirm'] - Text for confirm button
	 * @property {string} [cancelText='Cancel'] - Text for cancel button
	 * @property {boolean} [destructive=true] - Style the confirm action as destructive (outlined red)
	 * @property {() => void} onConfirm - Callback when user confirms
	 * @property {() => void} onCancel - Callback when user cancels
	 */

	let {
		isOpen = false,
		title,
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		destructive = true,
		onConfirm,
		onCancel
	} = $props();
</script>

<ContentModal {isOpen} {title} onClose={onCancel} size="compact">
	<p class="confirm-message" data-testid="confirm-message">{message}</p>

	{#snippet footer()}
		{#if cancelText}
			<button type="button" class="cm-action" onclick={onCancel}>{cancelText}</button>
		{/if}
		<button type="button" class="cm-action" class:danger={destructive} onclick={onConfirm}>
			{confirmText}
		</button>
	{/snippet}
</ContentModal>

<style>
	.confirm-message {
		margin: 0;
		white-space: pre-line;
		font-size: 1.0625rem;
		line-height: 1.6;
		color: #d5dfeb;
	}
</style>
