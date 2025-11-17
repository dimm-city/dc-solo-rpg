<script>
	import { onMount, onDestroy } from 'svelte';
	import { getAllDiceThemes } from '../configuration/DiceThemes.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { updateSettings } from '../stores/settingsStore.svelte.js';
	import { updateDiceTheme } from '../stores/diceStore.svelte.js';
	import AugmentedButton from './AugmentedButton.svelte';

	let { isOpen = $bindable(false) } = $props();

	const availableThemes = getAllDiceThemes();

	// Get current theme from gameState
	let selectedTheme = $state(gameState.config?.options?.dice || availableThemes[0]);

	let portalTarget;
	let modalElement;

	onMount(() => {
		// Create a portal container at the body level
		portalTarget = document.createElement('div');
		portalTarget.className = 'dice-theme-picker-portal';
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

	function selectTheme(theme) {
		selectedTheme = theme;

		// Update game config
		if (gameState.config) {
			gameState.config.options = {
				...gameState.config.options,
				dice: theme
			};
		}

		// Update settings store for persistence
		updateSettings({ diceTheme: theme.key });

		// Update dice box theme immediately
		updateDiceTheme(theme);

		// Close the picker
		isOpen = false;
	}

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			isOpen = false;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

{#if isOpen}
	<div
		bind:this={modalElement}
		class="dice-theme-picker-backdrop"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="button"
		tabindex="0"
	>
		<div class="dice-theme-picker-modal" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<div class="modal-header">
				<h2>Select Dice Theme</h2>
				<button
					class="close-button"
					onclick={() => (isOpen = false)}
					aria-label="Close dice theme picker"
				>
					×
				</button>
			</div>

			<div class="themes-grid">
				{#each availableThemes as theme (theme.key)}
					<button
						class="theme-card"
						class:selected={selectedTheme?.key === theme.key}
						onclick={() => selectTheme(theme)}
						data-augmented-ui="tl-clip-x br-clip border"
					>
						<div class="theme-name">{theme.name}</div>
						<div class="theme-category">{theme.category}</div>
						<div class="theme-description">{theme.description}</div>
						{#if selectedTheme?.key === theme.key}
							<div class="selected-indicator">✓</div>
						{/if}
					</button>
				{/each}
			</div>

			<div class="modal-footer">
				<AugmentedButton text="Close" onclick={() => (isOpen = false)} class="close-footer-button" />
			</div>
		</div>
	</div>
{/if}

<style>
	/* Portal container at body level */
	:global(.dice-theme-picker-portal) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 10000;
	}

	.dice-theme-picker-backdrop {
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
		padding: var(--space-md);
		animation: fadeIn 0.2s ease-out;
		pointer-events: all;
		z-index: 1;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.dice-theme-picker-modal {
		background: linear-gradient(135deg, rgba(0, 20, 40, 0.95), rgba(10, 10, 30, 0.98));
		max-width: 800px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		position: relative;

		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 16px;
		--aug-tr: 16px;
		--aug-br: 16px;
		--aug-bl: 16px;

		box-shadow:
			0 0 40px rgba(0, 255, 255, 0.3),
			0 0 80px rgba(0, 255, 255, 0.15),
			inset 0 0 40px rgba(0, 255, 255, 0.05);

		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--space-lg);
		border-bottom: 2px solid rgba(0, 255, 255, 0.2);
	}

	h2 {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2rem);
		letter-spacing: var(--letter-spacing-widest);
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		font-family: var(--font-display);
	}

	.close-button {
		background: none;
		border: none;
		color: var(--color-neon-cyan);
		font-size: 2.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		color: var(--color-cyber-magenta);
		transform: scale(1.1);
		text-shadow: 0 0 12px var(--color-cyber-magenta);
	}

	.themes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--space-lg);
		padding: var(--space-md) 0;
	}

	.theme-card {
		position: relative;
		background: linear-gradient(135deg, rgba(0, 30, 60, 0.4), rgba(15, 15, 40, 0.6));
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		padding: var(--space-lg);
		cursor: pointer;
		border: none;
		text-align: left;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3));
		--aug-tl: 8px;
		--aug-br: 8px;

		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.theme-card:hover {
		transform: translateY(-4px);
		--aug-border-all: 3px;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.4),
			0 0 40px rgba(0, 255, 255, 0.2);
	}

	.theme-card.selected {
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-cyber-magenta));
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 0, 255, 0.1));
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.3),
			0 0 60px rgba(255, 215, 0, 0.15);
	}

	.theme-name {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
	}

	.theme-card.selected .theme-name {
		color: var(--color-brand-yellow);
		text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
	}

	.theme-category {
		font-size: var(--text-xs);
		color: var(--color-cyber-magenta);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		font-weight: 600;
	}

	.theme-description {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.selected-indicator {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		font-size: 1.5rem;
		color: var(--color-brand-yellow);
		text-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
	}

	.modal-footer {
		display: flex;
		justify-content: center;
		padding-top: var(--space-lg);
		border-top: 2px solid rgba(0, 255, 255, 0.2);
	}

	.modal-footer :global(.aug-button) {
		min-width: 180px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dice-theme-picker-modal {
			padding: var(--space-lg);
			max-height: 95vh;
		}

		.themes-grid {
			grid-template-columns: 1fr;
		}

		h2 {
			font-size: var(--text-xl);
		}
	}

	@media (max-width: 480px) {
		.dice-theme-picker-backdrop {
			padding: var(--space-sm);
		}

		.dice-theme-picker-modal {
			padding: var(--space-md);
		}

		.theme-card {
			padding: var(--space-md);
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.dice-theme-picker-backdrop,
		.dice-theme-picker-modal,
		.theme-card {
			animation: none;
			transition: none;
		}
	}
</style>
