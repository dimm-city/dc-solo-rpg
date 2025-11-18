<script>
	import OverlayModal from '../OverlayModal.svelte';
	import AudioSettings from './AudioSettings.svelte';

	let { isOpen = false, onClose } = $props();
</script>

<OverlayModal isVisible={isOpen} zIndex={1000} fixedHeight="80vh" animateHeight={true}>
	<div class="settings-modal-content">
		<div class="settings-header">
			<h2>Game Settings</h2>
			<button class="close-button" onclick={onClose} title="Close Settings">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
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
			</button>
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
</OverlayModal>

<style>
	.settings-modal-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--dc-default-container-bg, rgba(255, 255, 255, 0.3));
		border-radius: var(--dc-default-border-radius, 0.5rem);
	}

	.settings-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md, 1rem);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.settings-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--dc-default-text-color, inherit);
	}

	.close-button {
		background: none;
		border: none;
		color: var(--dc-default-text-color, inherit);
		cursor: pointer;
		padding: var(--space-xs, 0.25rem);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
		transition: opacity 0.2s;
	}

	.close-button:hover {
		opacity: 1;
	}

	.settings-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md, 1rem);
	}

	.settings-footer {
		padding: var(--space-md, 1rem);
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		justify-content: center;
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
</style>
