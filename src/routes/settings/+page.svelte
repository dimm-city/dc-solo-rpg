<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';
	import { Difficulty } from '$lib/configuration/DifficultyLevels.js';
	import { getAllDiceThemes } from '$lib/configuration/DiceThemes.js';
	import { browser } from '$app/environment';

	// Settings state
	let selectedDifficulty = $state(Difficulty.NORMAL);
	let selectedDiceTheme = $state(null);
	let saveStatus = $state('');

	// Get actual dice themes from configuration
	const availableDiceThemes = getAllDiceThemes();

	// Load settings from localStorage
	onMount(() => {
		if (browser) {
			const savedSettings = localStorage.getItem('gameSettings');
			if (savedSettings) {
				try {
					const settings = JSON.parse(savedSettings);
					selectedDifficulty = settings.difficulty || Difficulty.NORMAL;
					selectedDiceTheme =
						availableDiceThemes.find((t) => t.key === settings.diceTheme) || availableDiceThemes[0];
				} catch (e) {
					console.error('Failed to load settings:', e);
				}
			} else {
				// Set defaults if no settings exist
				selectedDiceTheme = availableDiceThemes[0];
			}
		}
	});

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

	function goHome() {
		goto('/');
	}
</script>

<NeuralBackground />

<div class="page-container">
	<nav class="page-nav">
		<button onclick={goHome} class="back-button" aria-label="Go back to home">
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
				<path d="m15 18-6-6 6-6" />
			</svg>
			Back to Home
		</button>
		<h1 class="page-title">Settings</h1>
	</nav>

	<article class="content-wrapper">
		<div class="settings-intro" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<div class="intro-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="3" />
					<path
						d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2"
					/>
				</svg>
			</div>
			<h2>Game Settings</h2>
			<p class="intro-subtitle">
				Configure your global game preferences. These settings will apply to all games you play.
			</p>
		</div>

		<section class="settings-card" data-augmented-ui="tl-clip-x tr-clip br-clip-y bl-clip border">
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
				<select
					id="diceSelect"
					class="augmented-select dice-select"
					bind:value={selectedDiceTheme}
					aria-label="Select dice theme"
					data-testid="dice-select"
					data-augmented-ui="tl-clip tr-clip-x br-clip border"
				>
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
					Adjust the challenge level. Higher difficulty means more tower pulls and harder success
					checks.
				</p>
				<select
					id="difficulty"
					class="augmented-select difficulty-select"
					bind:value={selectedDifficulty}
					aria-label="Select difficulty level"
					data-testid="difficulty-select"
					data-augmented-ui="tl-clip-x tr-clip br-clip border"
				>
					{#each Difficulty.getEntries() as entry (entry.value)}
						<option value={entry.value}>{entry.key?.replaceAll('_', ' ')}</option>
					{/each}
				</select>
			</div>

			<div class="button-container">
				<button
					class="save-button"
					onclick={saveSettings}
					data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
				>
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
					Save Settings
				</button>
				{#if saveStatus === 'saved'}
					<div class="save-status" data-testid="save-status">Settings saved successfully!</div>
				{/if}
			</div>
		</section>

		<section class="info-card" data-augmented-ui="tl-clip tr-clip-y br-clip-x bl-clip border">
			<div class="info-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
				<h3>About Settings</h3>
			</div>
			<p>
				Your settings are saved locally in your browser and will persist across sessions. You can
				change these settings at any time and they will apply to all future games.
			</p>
		</section>
	</article>
</div>

<style>
	.page-container {
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		background: var(--color-bg-primary);
	}

	.page-nav {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(
			135deg,
			rgba(10, 10, 20, 0.95),
			rgba(15, 10, 30, 0.9),
			rgba(10, 15, 25, 0.95)
		);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: var(--border-width-thick) solid var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: clamp(1.5rem, 3.5vw, 2.25rem);
		font-weight: 900;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-widest);
		text-align: center;
		margin: 0;
		text-shadow:
			0 0 20px rgba(255, 215, 0, 0.6),
			0 0 40px rgba(255, 215, 0, 0.3);
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand-yellow);
		background: linear-gradient(135deg, rgba(30, 30, 40, 0.6), rgba(20, 20, 30, 0.7));
		border: var(--border-width-default) solid var(--color-cyber-magenta);
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-fast);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		align-self: flex-start;
	}

	.back-button:hover {
		color: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
		transform: translateX(-2px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.4),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	.back-button:active {
		transform: translateX(-1px);
	}

	.back-button svg {
		transition: transform var(--transition-fast);
	}

	.back-button:hover svg {
		transform: translateX(-2px);
	}

	.content-wrapper {
		flex: 1;
		padding: clamp(var(--space-lg), 3vw, var(--space-2xl));
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		padding-bottom: var(--space-3xl);
	}

	/* Settings Intro Section */
	.settings-intro {
		position: relative;
		padding: var(--space-2xl);
		background: linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(0, 255, 255, 0.1));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: var(--border-width-thick) solid var(--color-neon-cyan);
		text-align: center;
		box-shadow:
			0 0 40px rgba(0, 255, 255, 0.3),
			inset 0 0 40px rgba(0, 255, 255, 0.05);

		--aug-border-all: var(--border-width-thick);
		--aug-border-bg: var(--color-neon-cyan);
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;
	}

	.intro-icon {
		display: inline-flex;
		margin-bottom: var(--space-md);
	}

	.intro-icon svg {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 12px rgba(0, 255, 255, 0.8));
	}

	.settings-intro h2 {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		font-weight: 900;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-widest);
		margin: 0 0 var(--space-md) 0;
		text-shadow: var(--text-glow-yellow);
	}

	.intro-subtitle {
		font-size: var(--text-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-primary);
		margin: 0;
		max-width: 60ch;
		margin-inline: auto;
	}

	/* Settings Card */
	.settings-card {
		position: relative;
		padding: var(--space-2xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: var(--border-width-default) solid var(--color-cyber-magenta);
		transition: all var(--transition-base);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);

		--aug-border-all: var(--border-width-default);
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		--aug-tl: 12px;
		--aug-tr: 12px;
		--aug-br: 12px;
		--aug-bl: 12px;
	}

	.settings-card:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.3),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.08);
	}

	/* Form Groups */
	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-2xl);
	}

	.form-group:last-of-type {
		margin-bottom: var(--space-xl);
	}

	label {
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	label svg {
		flex-shrink: 0;
		filter: drop-shadow(0 0 6px var(--color-brand-yellow));
	}

	.field-description {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0;
		line-height: var(--line-height-relaxed);
	}

	/* Select Elements */
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

		background: linear-gradient(135deg, rgba(0, 20, 40, 0.4), rgba(10, 10, 30, 0.6));
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);

		background-image:
			linear-gradient(135deg, rgba(0, 20, 40, 0.4), rgba(10, 10, 30, 0.6)),
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%2300FFFF' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
		background-repeat: no-repeat, no-repeat;
		background-position:
			0 0,
			right var(--space-md) center;
	}

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

		background-image:
			linear-gradient(135deg, rgba(0, 20, 40, 0.4), rgba(10, 10, 30, 0.6)),
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

	/* Save Button */
	.button-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
	}

	.save-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-brand-yellow);
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(0, 255, 255, 0.1));
		border: none;
		padding: var(--space-md) var(--space-xl);
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-fast);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);

		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		--aug-tl: 12px;
		--aug-tr: 12px;
		--aug-br: 12px;
		--aug-bl: 12px;

		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.3),
			inset 0 0 10px rgba(255, 215, 0, 0.05);
	}

	.save-button:hover {
		color: var(--color-neon-cyan);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(255, 215, 0, 0.15));
		transform: translateY(-2px);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.5),
			0 0 60px rgba(0, 255, 255, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.1);
	}

	.save-button:active {
		transform: translateY(0);
	}

	.save-button svg {
		filter: drop-shadow(0 0 6px var(--color-brand-yellow));
	}

	.save-status {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		color: var(--color-toxic-green);
		text-shadow: 0 0 8px rgba(0, 255, 170, 0.6);
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

	/* Info Card */
	.info-card {
		position: relative;
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: var(--border-width-default) solid var(--color-neon-cyan);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);

		--aug-border-all: var(--border-width-default);
		--aug-border-bg: var(--color-neon-cyan);
		--aug-tl: 12px;
		--aug-tr: 14px;
		--aug-br: 12px;
		--aug-bl: 14px;
	}

	.info-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.info-header svg {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
		flex-shrink: 0;
	}

	.info-card h3 {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
		text-shadow: var(--text-glow-yellow);
	}

	.info-card p {
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.content-wrapper {
			padding: var(--space-md);
			gap: var(--space-lg);
		}

		.page-nav {
			padding: var(--space-md);
		}

		.settings-intro,
		.settings-card,
		.info-card {
			padding: var(--space-lg);
		}

		.intro-icon svg {
			width: 36px;
			height: 36px;
		}

		.info-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 450px) {
		.content-wrapper {
			padding: var(--space-sm);
			gap: var(--space-md);
		}

		.settings-intro,
		.settings-card,
		.info-card {
			padding: var(--space-md);
		}

		.settings-intro h2 {
			font-size: var(--text-xl);
		}

		label {
			font-size: var(--text-sm);
		}

		.augmented-select {
			font-size: var(--text-sm);
			padding: var(--space-sm) var(--space-md);
			padding-right: 40px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-button:hover,
		.back-button:active,
		.settings-card:hover,
		.save-button:hover,
		.save-button:active {
			transform: none !important;
			transition: none !important;
		}

		.back-button:hover svg {
			transform: none !important;
		}

		.save-status {
			animation: none !important;
		}
	}
</style>
