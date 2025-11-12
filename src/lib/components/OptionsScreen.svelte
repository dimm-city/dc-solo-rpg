<script>
	import { goto } from '$app/navigation';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { startGame } from '../stores/gameActions.svelte.js';
	import { Difficulty } from '../configuration/DifficultyLevels.js';
	import AugmentedButton from './AugmentedButton.svelte';

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

<div class="dc-start-screen-container">
	<div class="options-content">
		<h2>{gameState.config?.title ?? 'Game'}</h2>

		<div class="options-form">
			<!-- Dice Theme Selection -->
			<div class="form-group">
				<label for="diceSelect">Select a Dice Theme:</label>
				<div class="select-wrapper" data-augmented-ui="tl-clip tr-clip-x br-clip border">
					<select
						id="diceSelect"
						bind:value={options.dice}
						aria-label="Select dice theme"
						data-testid="dice-select"
					>
						{#each systemSettings?.availableDiceThemes as theme (theme.name)}
							<option value={theme}>{theme.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Difficulty Selection -->
			<div class="form-group">
				<label for="difficulty">Select a Difficulty:</label>
				<div class="select-wrapper" data-augmented-ui="tl-clip-x tr-clip br-clip-x border">
					<select
						id="difficulty"
						bind:value={options.difficulty}
						aria-label="Select difficulty level"
						data-testid="difficulty-select"
					>
						{#each Difficulty.getEntries() as entry (entry.value)}
							<option value={entry.value}>{entry.key?.replaceAll('_', ' ')}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<div class="button-container">
		<AugmentedButton
			text="Cancel"
			variant="secondary"
			onclick={handleCancel}
			testid="options-cancel-button"
			ariaLabel="Cancel and return to home"
		/>
		<AugmentedButton
			text="Start Game"
			variant="primary"
			onclick={setConfig}
			testid="options-start-button"
			ariaLabel="Start game with selected options"
		/>
	</div>
</div>

<style>
	/* ============================================
	   MAIN CONTAINER
	   ============================================ */
	.dc-start-screen-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		gap: var(--space-xl);
		padding: clamp(var(--space-md), 3vw, var(--space-2xl));
		justify-content: space-between;
		animation: fadeInContent 0.6s ease-out;
	}

	@keyframes fadeInContent {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ============================================
	   OPTIONS CONTENT
	   ============================================ */
	.options-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		flex: 1;
		justify-content: center;
	}

	.dc-start-screen-container h2 {
		text-align: center;
		margin: 0;
		font-size: clamp(1.5rem, 3vw, 2.5rem);
		letter-spacing: var(--letter-spacing-widest);
		position: relative;
		padding-bottom: var(--space-md);
		animation: fadeInContent 0.6s ease-out 0.1s backwards;
	}

	/* Subtle underline accent for h2 */
	.dc-start-screen-container h2::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: min(200px, 35%);
		height: 3px;
		background: linear-gradient(90deg, transparent, var(--color-cyber-magenta), transparent);
		box-shadow: 0 0 10px var(--color-cyber-magenta);
	}

	/* ============================================
	   OPTIONS FORM
	   ============================================ */
	.options-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
		animation: fadeInContent 0.6s ease-out 0.2s backwards;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	/* ============================================
	   LABELS
	   ============================================ */
	label {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		text-shadow: var(--text-glow-yellow);
		line-height: var(--line-height-tight);
		margin: 0;
	}

	/* ============================================
	   SELECT WRAPPER - AUGMENTED UI STYLING
	   ============================================ */
	.select-wrapper {
		position: relative;
		width: 100%;

		/* Augmented-UI Custom Properties */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 8px;
		--aug-tr: 14px;
		--aug-br: 14px;

		/* Glassmorphism Background */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.6), rgba(15, 15, 25, 0.5));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);

		/* Box Shadow with Neon Glow */
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			0 0 30px rgba(0, 255, 255, 0.15),
			inset 0 0 10px rgba(0, 255, 255, 0.1);

		/* Transitions */
		transition: all var(--transition-base);
		will-change: box-shadow, transform;
	}

	/* Alternate gradient for second select */
	.form-group:nth-child(2) .select-wrapper {
		--aug-border-bg: linear-gradient(225deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 14px;
		--aug-tr: 8px;
		--aug-br: 14px;

		box-shadow:
			0 0 15px rgba(217, 70, 239, 0.3),
			0 0 30px rgba(217, 70, 239, 0.15),
			inset 0 0 10px rgba(217, 70, 239, 0.1);
	}

	/* Hover State */
	.select-wrapper:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(0, 255, 255, 0.25),
			inset 0 0 15px rgba(0, 255, 255, 0.15);
		filter: brightness(1.1);
	}

	.form-group:nth-child(2) .select-wrapper:hover {
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.5),
			0 0 40px rgba(217, 70, 239, 0.25),
			inset 0 0 15px rgba(217, 70, 239, 0.15);
	}

	/* Focus-Within State (when select is focused) */
	.select-wrapper:focus-within {
		--aug-border-all: 3px;
		transform: translateY(-2px);
		outline: 3px solid var(--color-brand-yellow);
		outline-offset: 2px;
		box-shadow:
			0 0 25px rgba(255, 215, 0, 0.6),
			0 0 50px rgba(255, 215, 0, 0.3),
			inset 0 0 20px rgba(255, 215, 0, 0.15);
	}

	/* ============================================
	   SELECT ELEMENT STYLING
	   ============================================ */
	select {
		width: 100%;
		padding: var(--space-md);
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text-primary);
		background: transparent;
		border: none;
		cursor: pointer;
		appearance: none;
		position: relative;
		z-index: 1;
		letter-spacing: var(--letter-spacing-normal);
		text-transform: uppercase;
		line-height: var(--line-height-base);

		/* Custom chevron indicator */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2300FFFF' d='M8 11L3 6h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 16px center;
		padding-right: 48px;

		/* Remove default styles */
		outline: none;
		transition: all var(--transition-fast);
	}

	/* Magenta chevron for second select */
	.form-group:nth-child(2) .select-wrapper select {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23D946EF' d='M8 11L3 6h10z'/%3E%3C/svg%3E");
	}

	select:hover {
		color: var(--color-brand-yellow);
		text-shadow: 0 0 4px rgba(255, 215, 0, 0.3);
	}

	select:focus {
		outline: none;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
	}

	/* Option Styling */
	select option {
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		padding: var(--space-sm);
		font-weight: 600;
		letter-spacing: normal;
		text-transform: capitalize;
	}

	/* ============================================
	   STATUS MESSAGE
	   ============================================ */
	.status-message {
		padding: var(--space-md);
		background: linear-gradient(135deg, rgba(217, 70, 239, 0.2), rgba(255, 0, 0, 0.2));
		border: 2px solid var(--color-cyber-magenta);
		color: var(--color-text-primary);
		text-align: center;
		font-family: var(--font-display);
		font-size: var(--text-sm);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		box-shadow: 0 0 20px rgba(217, 70, 239, 0.4);
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(217, 70, 239, 0.4);
		}
		50% {
			box-shadow: 0 0 30px rgba(217, 70, 239, 0.6);
		}
	}

	/* ============================================
	   BUTTON CONTAINER
	   ============================================ */
	.button-container {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: var(--space-xl);
		width: 100%;
		flex-wrap: wrap;
		animation: fadeInContent 0.6s ease-out 0.3s backwards;
	}

	/* ============================================
	   RESPONSIVE DESIGN
	   ============================================ */
	@media (max-width: 768px) {
		.dc-start-screen-container {
			padding: var(--space-lg);
			gap: var(--space-lg);
		}

		.options-form {
			gap: var(--space-lg);
		}

		.dc-start-screen-container h2 {
			font-size: var(--text-2xl);
		}

		.button-container {
			flex-direction: column;
			gap: var(--space-md);
		}

		/* Reduce glow intensity on mobile for performance */
		.select-wrapper {
			box-shadow:
				0 0 10px rgba(0, 255, 255, 0.25),
				0 0 20px rgba(0, 255, 255, 0.1),
				inset 0 0 8px rgba(0, 255, 255, 0.08);
		}

		.form-group:nth-child(2) .select-wrapper {
			box-shadow:
				0 0 10px rgba(217, 70, 239, 0.25),
				0 0 20px rgba(217, 70, 239, 0.1),
				inset 0 0 8px rgba(217, 70, 239, 0.08);
		}
	}

	@media (max-width: 480px) {
		.dc-start-screen-container {
			padding: var(--space-md);
		}

		.dc-start-screen-container h2 {
			font-size: var(--text-xl);
		}

		label {
			font-size: var(--text-xs);
		}

		select {
			font-size: var(--text-sm);
			padding: var(--space-sm) var(--space-md);
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */
	@media (prefers-reduced-motion: reduce) {
		.dc-start-screen-container,
		.dc-start-screen-container h2,
		.options-form,
		.button-container,
		.status-message {
			animation: none !important;
		}

		.select-wrapper:hover,
		.select-wrapper:focus-within {
			transition: none !important;
			transform: none !important;
		}
	}

	/* ============================================
	   FOCUS-VISIBLE ACCESSIBILITY
	   ============================================ */
	select:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}
</style>
