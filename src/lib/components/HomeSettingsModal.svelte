<script>
	/**
	 * HomeSettingsModal - Global game settings for home page
	 * Standardized home page modal
	 * NOTE: This is separate from the in-game SettingsModal in src/lib/components/settings/
	 */
	import { browser } from '$app/environment';
	import InfoModal from './InfoModal.svelte';
	import { Difficulty } from '$lib/configuration/DifficultyLevels.js';

	let {
		isVisible = false,
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

<InfoModal {isVisible} title="Game Settings" {onClose} showCloseButton={false}>
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
			<button class="settings-save-button" onclick={saveSettings}>
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
	</div>

	<button class="close-button" onclick={onClose}>
		<span>Close</span>
	</button>
</InfoModal>

<style>
	p {
		margin: 0;
	}

	.settings-intro {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.85);
		text-align: center;
		max-width: 90%;
		margin-inline: auto;
	}

	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.form-group label {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.form-group label svg {
		flex-shrink: 0;
		filter: drop-shadow(0 0 6px var(--color-brand-yellow));
	}

	.field-description {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.5;
	}

	.settings-select {
		width: 100%;
		padding: var(--space-md) var(--space-lg);
		padding-right: 48px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text-primary);
		background: linear-gradient(135deg, rgba(0, 20, 40, 0.6), rgba(10, 10, 30, 0.8));
		border: 2px solid var(--color-neon-cyan);
		border-radius: 4px;
		cursor: pointer;
		appearance: none;
		outline: none;
		text-transform: capitalize;
		letter-spacing: 0.05em;
		transition: all 0.3s ease;
		background-image:
			linear-gradient(135deg, rgba(0, 20, 40, 0.6), rgba(10, 10, 30, 0.8)),
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2300FFFF' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
		background-repeat: no-repeat, no-repeat;
		background-position:
			0 0,
			right var(--space-md) center;
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.25),
			inset 0 0 10px rgba(0, 255, 255, 0.05);
	}

	.settings-select:hover {
		border-color: var(--color-cyber-magenta);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(217, 70, 239, 0.08);
	}

	.settings-select:focus {
		border-color: var(--color-brand-yellow);
		outline: 2px solid var(--color-brand-yellow);
		outline-offset: 2px;
		box-shadow:
			0 0 25px rgba(255, 215, 0, 0.4),
			inset 0 0 15px rgba(255, 215, 0, 0.1);
	}

	.settings-select option {
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		padding: var(--space-sm);
	}

	.button-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
		margin-top: var(--space-md);
	}

	.settings-save-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-xl);
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-brand-yellow);
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(0, 255, 255, 0.1));
		border: 2px solid var(--color-brand-yellow);
		border-radius: 4px;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: all 0.2s ease;
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.3),
			inset 0 0 10px rgba(255, 215, 0, 0.05);
	}

	.settings-save-button:hover {
		color: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 215, 0, 0.15));
		transform: translateY(-2px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.5),
			inset 0 0 15px rgba(0, 255, 255, 0.1);
	}

	.settings-save-button:active {
		transform: translateY(0);
	}

	.settings-save-button svg {
		filter: drop-shadow(0 0 6px currentColor);
	}

	.save-status {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-sm);
		color: var(--color-toxic-green);
		text-shadow: 0 0 8px rgba(0, 255, 170, 0.8);
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

	.close-button {
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

	.close-button:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(255, 255, 255, 0.15);
	}

	.close-button:active {
		transform: translateY(0);
	}

	/* Tablet breakpoint */
	@media (max-width: 900px) {
		.settings-form {
			gap: var(--space-lg);
		}
	}

	/* Mobile breakpoint */
	@media (max-width: 600px) {
		.settings-intro {
			font-size: var(--text-sm);
			max-width: 100%;
		}

		.settings-form {
			gap: var(--space-md);
		}

		.form-group label {
			font-size: var(--text-xs);
		}

		.form-group label svg {
			width: 16px;
			height: 16px;
		}

		.field-description {
			font-size: var(--text-xs);
		}

		.settings-select {
			padding: var(--space-sm) var(--space-md);
			padding-right: 40px;
			font-size: var(--text-sm);
		}

		.button-group {
			width: 100%;
		}

		.settings-save-button {
			width: 100%;
			padding: var(--space-md);
			font-size: var(--text-sm);
		}

		.close-button {
			align-self: stretch;
			padding: var(--space-md);
			font-size: var(--text-sm);
		}
	}

	/* Extra small mobile */
	@media (max-width: 400px) {
		.form-group label svg {
			width: 14px;
			height: 14px;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.settings-save-button:hover,
		.close-button:hover {
			transform: none;
		}

		.save-status {
			animation: none !important;
		}
	}
</style>
