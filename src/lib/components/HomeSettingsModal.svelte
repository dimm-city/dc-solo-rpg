<script>
	/**
	 * HomeSettingsModal - Global game settings for home page
	 * Uses ContentModal as base
	 * NOTE: This is separate from the in-game SettingsModal
	 */
	import { browser } from '$app/environment';
	import ContentModal from './ContentModal.svelte';
	import { Difficulty } from '$lib/configuration/DifficultyLevels.js';

	let {
		isOpen = false,
		onClose,
		selectedDifficulty = $bindable(),
		selectedDiceTheme = $bindable(),
		availableDiceThemes = []
	} = $props();

	let saveStatus = $state('');

	function saveSettings() {
		if (browser) {
			const settings = {
				difficulty: selectedDifficulty,
				diceTheme: selectedDiceTheme?.key || 'default'
			};
			localStorage.setItem('gameSettings', JSON.stringify(settings));
			saveStatus = 'saved';
			setTimeout(() => {
				saveStatus = '';
			}, 2000);
		}
	}
</script>

<ContentModal {isOpen} title="Game Settings" {onClose} showFooter={false}>
	<div class="settings-content">
		<p class="settings-intro">
			Configure your global game preferences. These settings will apply to all games you play.
		</p>

		<div class="settings-form">
			<div class="form-group">
				<label for="diceSelect">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<circle cx="15.5" cy="15.5" r="1.5" />
					</svg>
					Dice Theme
				</label>
				<p class="field-description">Choose the visual style for your 3D dice.</p>
				<select id="diceSelect" class="settings-select" bind:value={selectedDiceTheme}>
					{#each availableDiceThemes as theme (theme.key)}
						<option value={theme}>{theme.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="difficulty">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
						/>
						<line x1="12" y1="9" x2="12" y2="13" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
					Difficulty Level
				</label>
				<p class="field-description">
					Adjust the challenge level. Higher difficulty means more tower pulls.
				</p>
				<select id="difficulty" class="settings-select" bind:value={selectedDifficulty}>
					{#each Difficulty.getEntries() as entry (entry.value)}
						<option value={entry.value}>{entry.key?.replaceAll('_', ' ')}</option>
					{/each}
				</select>
			</div>

			<div class="button-group">
				<button class="save-button" onclick={saveSettings}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
						<polyline points="17 21 17 13 7 13 7 21" />
						<polyline points="7 3 7 8 15 8" />
					</svg>
					<span>Save Settings</span>
				</button>
				{#if saveStatus === 'saved'}
					<div class="save-status">Settings saved!</div>
				{/if}
			</div>

			<button class="close-footer-button" onclick={onClose}>
				<span>Close</span>
			</button>
		</div>
	</div>
</ContentModal>

<style>
	.settings-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg, 1.5rem);
	}

	.settings-intro {
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.85);
		margin: 0;
		text-align: center;
	}

	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl, 2rem);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm, 0.5rem);
	}

	.form-group label {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--dc-accent-color, #3a9fc7);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
	}

	.form-group label svg {
		flex-shrink: 0;
	}

	.field-description {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
		margin: 0;
		line-height: 1.5;
	}

	.settings-select {
		width: 100%;
		padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
		padding-right: 48px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--dc-default-text-color, #ffffff);
		background: rgba(0, 0, 0, 0.3);
		border: 2px solid var(--dc-accent-color, #3a9fc7);
		border-radius: 4px;
		cursor: pointer;
		appearance: none;
		outline: none;
		text-transform: capitalize;
		letter-spacing: 0.05em;
		transition: all 0.3s ease;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%233a9fc7' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right var(--space-sm, 0.75rem) center;
	}

	.settings-select:hover {
		border-color: var(--dc-button-bg, #1387b9);
		background-color: rgba(0, 0, 0, 0.4);
	}

	.settings-select:focus {
		border-color: var(--dc-button-bg, #1387b9);
		outline: 2px solid var(--dc-button-bg, #1387b9);
		outline-offset: 2px;
	}

	.settings-select option {
		background: var(--dc-default-container-bg, rgba(13, 27, 42, 0.95));
		color: var(--dc-default-text-color, #ffffff);
		padding: var(--space-sm, 0.75rem);
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-md, 1rem);
		align-items: center;
		margin-top: var(--space-md, 1rem);
	}

	.save-button {
		display: flex;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		padding: var(--space-sm, 0.75rem) var(--space-lg, 1.5rem);
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 1rem;
		font-weight: 700;
		color: white;
		background: var(--dc-button-bg, #1387b9);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: all 0.2s;
	}

	.save-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.save-button:active {
		transform: translateY(0);
	}

	.save-status {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 0.9rem;
		color: #00ff9f;
		text-shadow: 0 0 8px rgba(0, 255, 159, 0.8);
		animation: fadeInOut 2s ease-in-out;
	}

	@keyframes fadeInOut {
		0%,
		100% {
			opacity: 0;
		}
		10%,
		90% {
			opacity: 1;
		}
	}

	.close-footer-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm, 0.5rem);
		padding: var(--space-sm, 0.75rem) var(--space-lg, 1.5rem);
		background: var(--dc-button-bg, #1387b9);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		font-family: var(--font-display, 'Orbitron', monospace);
		margin-top: var(--space-md, 1rem);
	}

	.close-footer-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.close-footer-button:active {
		transform: translateY(0);
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.settings-intro {
			font-size: 0.9rem;
		}

		.form-group label {
			font-size: 0.85rem;
		}

		.field-description {
			font-size: 0.8rem;
		}

		.settings-select {
			padding: var(--space-sm, 0.75rem);
			padding-right: 40px;
			font-size: 0.9rem;
		}

		.button-group {
			width: 100%;
		}

		.save-button,
		.close-footer-button {
			width: 100%;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.save-button:hover,
		.close-footer-button:hover {
			transform: none;
		}

		.save-status {
			animation: none !important;
		}
	}
</style>
