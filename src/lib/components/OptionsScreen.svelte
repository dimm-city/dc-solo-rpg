<script>
	import { goto } from '$app/navigation';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { startGame } from '../stores/gameActions.svelte.js';
	import { Difficulty } from '../configuration/DifficultyLevels.js';
	import ContinueButton from './ContinueButton.svelte';
	import ButtonBar from './ButtonBar.svelte';

	let { systemSettings = {} } = $props();

	let options = $state({});

	function setConfig() {
		if (systemSettings.player && gameState.config?.loaded) {
			startGame(systemSettings.player, options);
		}
	}

	function handleCancel() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/');
	}
</script>

<div class="options-screen">
	<div class="options-container">
		<h2>{gameState.config?.title ?? 'Game'}</h2>

		<div class="options-form">
			<div class="form-group">
				<label for="diceSelect">Select a Dice Theme:</label>
				<select
					id="diceSelect"
					class="augmented-select dice-select"
					bind:value={options.dice}
					aria-label="Select dice theme"
					data-testid="dice-select"
					data-augmented-ui="tl-clip tr-clip-x br-clip border"
				>
					{#each systemSettings?.availableDiceThemes as theme (theme.name)}
						<option value={theme}>{theme.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="difficulty">Select a Difficulty:</label>
				<select
					id="difficulty"
					class="augmented-select difficulty-select"
					bind:value={options.difficulty}
					aria-label="Select difficulty level"
					data-testid="difficulty-select"
					data-augmented-ui="tl-clip-x tr-clip br-clip border"
				>
					{#each Difficulty.getEntries() as entry (entry.value)}
						<option value={entry.value}>{entry.key?.replaceAll('_', ' ')}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<ButtonBar>
		<ContinueButton
			text="Cancel"
			onclick={handleCancel}
			testid="options-cancel-button"
			ariaLabel="Cancel and return to home"
		/>
		<ContinueButton
			text="Start Game"
			onclick={setConfig}
			testid="options-start-button"
			ariaLabel="Start game with selected options"
		/>
	</ButtonBar>
</div>

<style>
	.options-screen {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.options-container {
		flex: 1;
		overflow-y: auto;
		width: 100%;
		max-width: 640px;
		margin: 0 auto;
		padding: clamp(var(--space-lg), 4vw, var(--space-2xl));
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
		min-height: 0;
	}

	/* ============================================
	   TITLE
	   ============================================ */
	h2 {
		text-align: center;
		margin: 0;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		letter-spacing: var(--letter-spacing-widest);
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		position: relative;
		padding-bottom: var(--space-lg);
	}

	h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: min(180px, 40%);
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--color-cyber-magenta), transparent);
		box-shadow: 0 0 8px var(--color-cyber-magenta);
	}

	/* ============================================
	   FORM
	   ============================================ */
	.options-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	label {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
		margin: 0;
	}

	/* ============================================
	   SELECT ELEMENTS
	   ============================================ */
	.augmented-select {
		width: 100%;
		padding: var(--space-md) var(--space-lg);
		padding-right: 48px;
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text-primary);
		border: none;
		cursor: pointer;
		appearance: none;
		outline: none;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		/* Background with subtle gradient */
		background: linear-gradient(135deg, rgba(0, 20, 40, 0.4), rgba(10, 10, 30, 0.6));
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);

		/* Custom chevron */
		background-image: linear-gradient(135deg, rgba(0, 20, 40, 0.4), rgba(10, 10, 30, 0.6)),
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2300FFFF' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
		background-repeat: no-repeat, no-repeat;
		background-position: 0 0, right var(--space-md) center;
	}

	/* Augmented-UI styling */
	.dice-select {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 12px;
		--aug-tr: 16px;
		--aug-br: 12px;

		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.25),
			0 0 40px rgba(0, 255, 255, 0.1),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
	}

	.difficulty-select {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 16px;
		--aug-tr: 12px;
		--aug-br: 16px;

		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.25),
			0 0 40px rgba(217, 70, 239, 0.1),
			inset 0 0 20px rgba(217, 70, 239, 0.05);

		background-image: linear-gradient(135deg, rgba(0, 20, 40, 0.4), rgba(10, 10, 30, 0.6)),
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23D946EF' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
	}

	.augmented-select:hover {
		--aug-border-all: 3px;
		transform: translateY(-2px);
		filter: brightness(1.15);
	}

	.dice-select:hover {
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(0, 255, 255, 0.15),
			inset 0 0 30px rgba(0, 255, 255, 0.08);
	}

	.difficulty-select:hover {
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.4),
			0 0 60px rgba(217, 70, 239, 0.15),
			inset 0 0 30px rgba(217, 70, 239, 0.08);
	}

	.augmented-select:focus {
		--aug-border-all: 3px;
		outline: 2px solid var(--color-brand-yellow);
		outline-offset: 4px;
		color: var(--color-brand-yellow);
		text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
	}

	select option {
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		padding: var(--space-sm);
		text-transform: capitalize;
		letter-spacing: normal;
	}

	/* ============================================
	   RESPONSIVE
	   ============================================ */
	@media (max-width: 768px) {
		.options-container {
			padding: var(--space-xl) var(--space-lg);
			gap: var(--space-xl);
		}

		.options-form {
			gap: var(--space-xl);
		}
	}

	@media (max-width: 480px) {
		.options-container {
			padding: var(--space-lg) var(--space-md);
		}

		h2 {
			font-size: var(--text-2xl);
		}

		label {
			font-size: var(--text-xs);
		}

		.augmented-select {
			font-size: var(--text-sm);
			padding: var(--space-sm) var(--space-md);
			padding-right: 40px;
		}
	}

	/* ============================================
	   ACCESSIBILITY
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.01ms !important;
			transition-duration: 0.01ms !important;
		}
	}

	.augmented-select:focus-visible {
		outline: 2px solid var(--color-brand-yellow);
		outline-offset: 4px;
	}
</style>
