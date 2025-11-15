<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import OverlayModal from '$lib/components/OverlayModal.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';
	import { Difficulty } from '$lib/configuration/DifficultyLevels.js';
	import { getAllDiceThemes } from '$lib/configuration/DiceThemes.js';
	import {
		hasSeenInstructions,
		markInstructionsAsSeen,
		hasShownInstructionsInSession,
		markInstructionsShownInSession
	} from '$lib/utils/instructionsStorage.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let selectedGame = $state(null);
	// Check if splash was already shown in this session
	let showSplash = $state(typeof window !== 'undefined' && !sessionStorage.getItem('splashShown'));
	let showInstructionsChoice = $state(false);
	let showContent = $state(false);
	let showModal = $state(false);
	let showAboutModal = $state(false);
	let showSettingsModal = $state(false);
	let showHelpModal = $state(false);

	// Settings state
	let selectedDifficulty = $state(Difficulty.NORMAL);
	let selectedDiceTheme = $state(null);
	let saveStatus = $state('');

	// Get actual dice themes from configuration
	const availableDiceThemes = getAllDiceThemes();

	// On mount, check if we should skip splash and go straight to content
	onMount(() => {
		const splashAlreadyShown = sessionStorage.getItem('splashShown') === 'true';
		if (splashAlreadyShown) {
			// Splash already shown in this session, determine what to show
			const instructionsSeen = hasSeenInstructions();
			const instructionsShownInSession = hasShownInstructionsInSession();

			// Skip instructions if either permanently skipped OR already shown this session
			if (instructionsSeen || instructionsShownInSession) {
				showContent = true;
			} else {
				showInstructionsChoice = true;
			}
		}

		// Load settings from localStorage
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
					selectedDiceTheme = availableDiceThemes[0];
				}
			} else {
				// Set defaults if no settings exist
				selectedDiceTheme = availableDiceThemes[0];
			}
		}
	});

	function selectGame(game) {
		selectedGame = game;
		showModal = true;
	}

	function handleConfirm() {
		if (selectedGame) {
			goto(`/game/${selectedGame.slug}`);
		}
		showModal = false;
	}

	function handleCancel() {
		showModal = false;
		selectedGame = null;
	}

	function handleSplashComplete() {
		showSplash = false;
		// Mark splash as shown for this session
		sessionStorage.setItem('splashShown', 'true');

		// Check if user has seen instructions or if already shown this session
		const instructionsSeen = hasSeenInstructions();
		const instructionsShownInSession = hasShownInstructionsInSession();

		// Wait for splash fade-out to complete before showing next screen
		setTimeout(() => {
			if (instructionsSeen || instructionsShownInSession) {
				// Skip directly to game selection
				showContent = true;
			} else {
				// Show instructions choice screen
				showInstructionsChoice = true;
			}
		}, 850); // Wait for 800ms fade + 50ms buffer
	}

	function handleLearnToPlay() {
		// Mark as shown for this session
		markInstructionsShownInSession();
		goto('/how-to');
	}

	function handleSkipOnce() {
		// Skip to game selection without storing preference (but mark session as shown)
		markInstructionsShownInSession();
		showInstructionsChoice = false;
		setTimeout(() => {
			showContent = true;
		}, 300);
	}

	function handleSkipAlways() {
		// Skip to game selection and remember preference permanently
		markInstructionsAsSeen();
		markInstructionsShownInSession();
		showInstructionsChoice = false;
		setTimeout(() => {
			showContent = true;
		}, 300);
	}

	function handleAboutClick(e) {
		e.preventDefault();
		showAboutModal = true;
	}

	function handleHelpClick(e) {
		e.preventDefault();
		showHelpModal = true;
	}

	function handleSettingsClick(e) {
		e.preventDefault();
		showSettingsModal = true;
	}

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

	// Game descriptions/subtitles for enhanced UI
	const gameDescriptions = {
		'artful-detective': 'Solve mysteries in a noir-cyberpunk city',
		'full-example': 'Complete game demonstration',
		'future-lost': 'Navigate a post-apocalyptic wasteland',
		'gnome-alone': 'Survive as a lone gnome adventurer',
		'simple-example': 'Quick start tutorial game'
	};
</script>

<NeuralBackground />
<Splash visible={showSplash} onComplete={handleSplashComplete} />

{#if showInstructionsChoice}
	<section class="instructions-choice-container" transition:fade={{ duration: 600 }}>
		<div class="choice-content">
			<h1>How To Play</h1>
			<p class="subtitle">
				Would you like to learn the game mechanics, or skip straight to the games?
			</p>

			<div class="choice-cards">
				<button class="choice-card" onclick={handleLearnToPlay}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
							<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
						</svg>
					</div>
					<h3>Learn How to Play</h3>
					<p>Understand the mechanics before diving into the story</p>
					<span class="recommendation">Recommended for first-time players</span>
				</button>

				<button class="choice-card skip-card" onclick={handleSkipOnce}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 4 15 12 5 20 5 4" />
							<line x1="19" x2="19" y1="5" y2="19" />
						</svg>
					</div>
					<h3>Skip Once</h3>
					<p>Skip to game selection this time, show instructions again next time</p>
					<span class="recommendation">Try the game first</span>
				</button>

				<button class="choice-card skip-always-card" onclick={handleSkipAlways}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 4 15 12 5 20 5 4" />
							<polygon points="13 4 23 12 13 20 13 4" />
						</svg>
					</div>
					<h3>Skip Always</h3>
					<p>I know how to play, never show instructions again</p>
					<span class="recommendation">For experienced players</span>
				</button>
			</div>
		</div>
	</section>
{/if}

{#if showContent}
	<section class="form-container" data-testid="home-page" transition:fade={{ duration: 600 }}>
		<div class="page-header">
			<div class="header-logo">
				<img src="/d20-150.png" alt="DC Solo RPG Logo" class="logo-dice" />
				<span class="version-text">DC-S-0.1.0</span>
			</div>
			<div class="header-buttons">
				<button onclick={handleAboutClick} class="header-button" aria-label="About">
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
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4"></path>
						<path d="M12 8h.01"></path>
					</svg>
				</button>
				<button onclick={handleHelpClick} class="header-button" aria-label="Help">
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
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<path d="M12 17h.01"></path>
					</svg>
				</button>
				<button onclick={handleSettingsClick} class="header-button" aria-label="Settings">
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
						<path d="M14 17H5" />
						<path d="M19 7h-9" />
						<circle cx="17" cy="17" r="3" />
						<circle cx="7" cy="7" r="3" />
					</svg>
				</button>
			</div>
		</div>
		<div class="welcome-container">
			<div class="dc-start-screen-container" data-testid="game-selector">
				<div class="game-cards-grid">
					{#each data.games as game, index}
						<button
							class="game-card game-card-{index + 1}"
							class:selected={selectedGame?.slug === game.slug}
							onclick={() => selectGame(game)}
							data-augmented-ui={index === 0
								? 'tl-clip tr-clip-x br-clip-x border'
								: index === 1
									? 'tl-clip-y tr-clip br-clip-x border'
									: index === 2
										? 'tl-clip-y tr-clip-x br-clip border'
										: index === 3
											? 'tl-clip tr-clip-y br-clip-x bl-clip border'
											: 'tl-clip-x tr-clip br-clip-y bl-clip border'}
							data-testid="game-card-{game.slug}"
						>
							<h3 class="game-card-title">{game.title}</h3>
							<p class="game-subtitle">{game.subtitle || 'Welcome to the city'}</p>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<ConfirmModal
	isOpen={showModal}
	title="Load Game"
	message={selectedGame ? `Start "${selectedGame.title}"?` : 'Loading game...'}
	confirmText="START GAME"
	cancelText="CANCEL"
	onConfirm={handleConfirm}
	onCancel={handleCancel}
/>

<!-- About Modal -->
<OverlayModal isVisible={showAboutModal} zIndex={1000} fixedHeight="70dvh" animateHeight={true}>
	<div class="info-modal-content">
		<h2 class="info-modal-title">About DC Solo RPG</h2>
		<div class="info-modal-body">
			<p>
				Dimm City Solo RPG is a narrative-driven solo role-playing game built on the Wretched and
				Alone system. Each playthrough offers a unique adventure through the cyberpunk streets of
				Dimm City.
			</p>
			<p>
				The game uses a standard 52-card deck and dice rolls to guide your story, presenting
				challenges and shaping the narrative as you draw cards and make decisions.
			</p>
			<p class="attribution">
				This work is based on The Wretched (loottheroom.itch.io/wretched), product of Chris Bissette
				and Loot The Room, and licensed under CC Attribution 3.0 Unported.
			</p>
		</div>
		<button class="info-modal-button" onclick={() => (showAboutModal = false)}>
			<span>Close</span>
		</button>
	</div>
</OverlayModal>

<!-- Settings Modal -->
<OverlayModal isVisible={showSettingsModal} zIndex={1000} fixedHeight="70dvh" animateHeight={true}>
	<div class="settings-modal-content">
		<h2 class="info-modal-title">Game Settings</h2>
		<div class="settings-modal-body">
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
		</div>
		<button class="info-modal-button" onclick={() => (showSettingsModal = false)}>
			<span>Close</span>
		</button>
	</div>
</OverlayModal>

<!-- Help Modal -->
<HelpModal isOpen={showHelpModal} onClose={() => (showHelpModal = false)} />

<style>
	:global(body) {
		overflow-y: auto;
	}

	.page-header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		background: rgba(10, 10, 20, 0.05);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.header-logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--space-sm);
	}

	.logo-dice {
		width: clamp(48px, 8vw, 72px);
		height: auto;
		filter: drop-shadow(0 0 12px rgba(217, 70, 239, 0.6))
			drop-shadow(0 0 24px rgba(217, 70, 239, 0.3));
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.version-text {
		font-family: var(--font-display);
		font-size: clamp(0.75rem, 1.5vw, 1rem);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
	}

	.header-buttons {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	.header-button {
		color: var(--color-brand-yellow);
		background: none;
		border: none;
		padding: var(--space-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.header-button svg {
		width: 28px;
		height: 28px;
		filter: drop-shadow(0 0 4px var(--color-brand-yellow));
		transition: all var(--transition-fast);
	}

	.header-button:hover {
		color: var(--color-neon-cyan);
		transform: scale(1.1);
	}

	.header-button:hover svg {
		filter: drop-shadow(0 0 8px var(--color-neon-cyan));
	}

	.header-button:active {
		transform: scale(1.05);
	}

	.welcome-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		margin-top: var(--space-lg);
		/* Fluid padding that scales with viewport */
		padding-inline: clamp(var(--space-md), 3vw, var(--space-2xl));
		gap: clamp(var(--space-lg), 2vw, var(--space-xl));
		/* Add subtle fade-in animation */
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

	.dc-start-screen-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
	}

	/* ============================================
	   GAME CARDS GRID
	   ============================================ */
	.game-cards-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		/* Fluid gap that scales */
		gap: clamp(var(--space-md), 2vw, var(--space-xl));
		width: 100%;
	}

	/* ============================================
	   GAME CARD BASE STYLES
	   ============================================ */
	.game-card {
		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		padding: clamp(var(--space-lg), 2vw, var(--space-2xl)) var(--space-lg);
		min-height: 200px;

		/* Glassmorphism Background - enhanced depth with gradient */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.6), rgba(15, 15, 25, 0.5));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);

		/* Remove default button styling */
		border: none;
		cursor: pointer;
		position: relative;

		/* Transitions */
		transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		will-change: transform, box-shadow, filter;

		/* Staggered fade-in animation */
		animation:
			cardFadeIn 0.6s ease-out 0.3s backwards,
			float 25s ease-in-out infinite;
	}

	/* Ethereal floating animation */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	/* Stagger the fade-in and float animations for each card */
	.game-card-1 {
		animation-delay: 0.1s, 0s;
	}
	.game-card-2 {
		animation-delay: 0.2s, 1.2s;
	}
	.game-card-3 {
		animation-delay: 0.3s, 2.4s;
	}
	.game-card-4 {
		animation-delay: 0.4s, 3.6s;
	}
	.game-card-5 {
		animation-delay: 0.5s, 4.8s;
	}

	@keyframes cardFadeIn {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ============================================
	   GAME CARD VARIANTS - ROTATING AUGMENTED-UI PATTERNS
	   ============================================ */

	/* Card 1 - Cyan to Magenta gradient */
	.game-card-1 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 8px;
		--aug-tr: 14px;
		--aug-br: 14px;

		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			0 0 30px rgba(0, 255, 255, 0.15),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	/* Card 2 - Magenta to Yellow gradient */
	.game-card-2 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 14px;
		--aug-tr: 8px;
		--aug-br: 14px;

		box-shadow:
			0 0 15px rgba(217, 70, 239, 0.3),
			0 0 30px rgba(217, 70, 239, 0.15),
			inset 0 0 10px rgba(217, 70, 239, 0.1);
	}

	/* Card 3 - Yellow to Cyan gradient */
	.game-card-3 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 8px;

		box-shadow:
			0 0 15px rgba(255, 215, 0, 0.3),
			0 0 30px rgba(255, 215, 0, 0.15),
			inset 0 0 10px rgba(255, 215, 0, 0.1);
	}

	/* Card 4 - Cyan to Yellow gradient */
	.game-card-4 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-brand-yellow));
		--aug-tl: 8px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 8px;

		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			0 0 30px rgba(0, 255, 255, 0.15),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	/* Card 5 - Magenta to Cyan gradient */
	.game-card-5 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		--aug-tl: 14px;
		--aug-tr: 8px;
		--aug-br: 14px;
		--aug-bl: 8px;

		box-shadow:
			0 0 15px rgba(217, 70, 239, 0.3),
			0 0 30px rgba(217, 70, 239, 0.15),
			inset 0 0 10px rgba(217, 70, 239, 0.1);
	}

	/* ============================================
	   GAME CARD INTERACTIVE STATES
	   ============================================ */

	.game-card:hover {
		transform: translateY(-6px) scale(1.02);
		filter: brightness(1.2);
	}

	.game-card-1:hover {
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.15);
	}

	.game-card-2:hover {
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.6),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(217, 70, 239, 0.15);
	}

	.game-card-3:hover {
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.6),
			0 0 40px rgba(255, 215, 0, 0.3),
			inset 0 0 15px rgba(255, 215, 0, 0.15);
	}

	.game-card-4:hover {
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.15);
	}

	.game-card-5:hover {
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.6),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(217, 70, 239, 0.15);
	}

	/* Selected State - Enhanced glow and thicker border */
	.game-card.selected {
		--aug-border-all: 3px;
		transform: translateY(-6px) scale(1.03);
	}

	.game-card-1.selected {
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.8),
			0 0 50px rgba(0, 255, 255, 0.4),
			inset 0 0 20px rgba(0, 255, 255, 0.2);
	}

	.game-card-2.selected {
		box-shadow:
			0 0 25px rgba(217, 70, 239, 0.8),
			0 0 50px rgba(217, 70, 239, 0.4),
			inset 0 0 20px rgba(217, 70, 239, 0.2);
	}

	.game-card-3.selected {
		box-shadow:
			0 0 25px rgba(255, 215, 0, 0.8),
			0 0 50px rgba(255, 215, 0, 0.4),
			inset 0 0 20px rgba(255, 215, 0, 0.2);
	}

	.game-card-4.selected {
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.8),
			0 0 50px rgba(0, 255, 255, 0.4),
			inset 0 0 20px rgba(0, 255, 255, 0.2);
	}

	.game-card-5.selected {
		box-shadow:
			0 0 25px rgba(217, 70, 239, 0.8),
			0 0 50px rgba(217, 70, 239, 0.4),
			inset 0 0 20px rgba(217, 70, 239, 0.2);
	}

	.game-card:active {
		transform: translateY(-2px);
	}

	.game-card:focus-visible {
		outline: 2px solid var(--color-neon-cyan);
		outline-offset: 4px;
	}

	/* ============================================
	   GAME CARD TYPOGRAPHY
	   ============================================ */

	.game-card-title {
		font-family: 'lixdu', monospace;
		font-size: clamp(1.25rem, 1.8vw, 1.75rem);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		margin: 0;
		text-align: center;
		line-height: 1.2;
		/* Improve text rendering */
		font-weight: 700;
	}

	.game-subtitle {
		font-family: 'Courier New', monospace;
		font-size: clamp(0.8rem, 1vw, 0.95rem);
		color: rgba(255, 255, 255, 0.8);
		text-align: center;
		margin: 0;
		line-height: var(--line-height-relaxed);
		/* Subtle glow for better readability */
		text-shadow: 0 0 4px rgba(0, 255, 255, 0.15);
	}

	/* ============================================
	   RESPONSIVE LAYOUTS
	   ============================================ */

	/* Large tablet/small desktop - 3 columns maintained but tighter */
	@media (max-width: 1200px) {
		.game-cards-grid {
			gap: var(--space-md);
		}
	}

	/* Tablet - 2 columns */
	@media (max-width: 900px) {
		.game-cards-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-md);
		}

		.welcome-container {
			padding-inline: var(--space-lg);
		}

		.page-header h2 {
			font-size: var(--text-2xl);
		}
	}

	/* Small tablet - 2 columns, more compact */
	@media (max-width: 700px) {
		.game-card {
			min-height: 180px;
			padding: var(--space-xl) var(--space-md);
		}
	}

	/* Mobile - 1 column */
	@media (max-width: 600px) {
		.game-cards-grid {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}

		.game-card {
			padding: var(--space-lg) var(--space-md);
			min-height: 160px;
		}

		.welcome-container {
			padding-inline: var(--space-md);
		}

		.dc-start-screen-container {
			gap: var(--space-lg);
		}

		.page-header {
			padding: var(--space-sm) var(--space-md);
		}

		.page-header h2 {
			font-size: var(--text-xl);
		}

		.header-buttons {
			gap: var(--space-sm);
		}

		.header-link svg {
			width: 24px;
			height: 24px;
		}
	}

	/* ============================================
	   INSTRUCTIONS CHOICE SCREEN
	   ============================================ */

	.instructions-choice-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
		overflow-y: auto;
	}

	.choice-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		max-width: 800px;
		width: 100%;
		animation: fadeInContent 0.6s ease-out;
	}

	.choice-content h1 {
		font-size: clamp(2rem, 4vw, 3rem);
		margin-bottom: var(--space-md);
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3);
	}

	.subtitle {
		font-size: clamp(1rem, 2vw, 1.25rem);
		margin-bottom: var(--space-2xl);
		color: rgba(255, 255, 255, 0.8);
	}

	.choice-cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
	}

	.choice-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-2xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: var(--dc-default-border-radius);
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
		min-height: 180px;
		text-align: center;
	}

	.choice-card:hover,
	.choice-card:focus {
		background: linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(25, 25, 40, 0.8));
		border-color: var(--color-neon-cyan);
		transform: translateY(-4px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(0, 255, 255, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.1);
	}

	.choice-card:active {
		transform: translateY(-2px);
	}

	.skip-card {
		border-color: rgba(217, 70, 239, 0.3);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
	}

	.skip-card:hover,
	.skip-card:focus {
		border-color: var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.4),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(217, 70, 239, 0.1);
	}

	.skip-always-card {
		border-color: rgba(255, 215, 0, 0.3);
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.2),
			inset 0 0 20px rgba(255, 215, 0, 0.05);
	}

	.skip-always-card:hover,
	.skip-always-card:focus {
		border-color: var(--color-brand-yellow);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.4),
			0 0 60px rgba(255, 215, 0, 0.2),
			inset 0 0 30px rgba(255, 215, 0, 0.1);
	}

	.icon-wrapper {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
	}

	.skip-card .icon-wrapper {
		color: var(--color-cyber-magenta);
		filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.6));
	}

	.skip-always-card .icon-wrapper {
		color: var(--color-brand-yellow);
		filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
	}

	.choice-card h3 {
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		font-weight: 600;
		color: white;
		margin: 0;
	}

	.choice-card p {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.recommendation {
		font-size: var(--text-sm);
		color: var(--color-neon-cyan);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: var(--space-xs);
	}

	.skip-card .recommendation {
		color: var(--color-cyber-magenta);
	}

	.skip-always-card .recommendation {
		color: var(--color-brand-yellow);
	}

	@media (max-width: 768px) {
		.instructions-choice-container {
			padding: var(--space-lg);
		}

		.choice-content h1 {
			font-size: var(--text-2xl);
		}

		.subtitle {
			font-size: var(--text-base);
		}

		.choice-cards {
			gap: var(--space-lg);
		}

		.choice-card {
			padding: var(--space-xl);
			min-height: 160px;
		}

		.icon-wrapper svg {
			width: 36px;
			height: 36px;
		}

		.choice-card h3 {
			font-size: var(--text-lg);
		}

		.choice-card p {
			font-size: var(--text-sm);
		}
	}

	@media (max-width: 450px) {
		.instructions-choice-container {
			padding: var(--space-md);
		}

		.choice-card {
			padding: var(--space-lg);
			min-height: 140px;
		}

		.icon-wrapper svg {
			width: 32px;
			height: 32px;
		}
	}

	/* ============================================
	   INFO MODAL STYLING (About & Settings)
	   ============================================ */

	.info-modal-content {
		width: 100%;
		height: 100%;
		padding: var(--space-xl);
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.info-modal-title {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 15px rgba(0, 255, 255, 1),
			0 0 30px rgba(0, 255, 255, 0.5);
		margin: 0 0 var(--space-md) 0;
		letter-spacing: 0.08em;
		text-align: center;
		text-transform: uppercase;
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
		padding-bottom: var(--space-md);
	}

	.info-modal-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
	}

	.info-modal-body p {
		margin: 0;
	}

	.attribution {
		font-size: var(--text-sm);
		color: rgba(255, 255, 255, 0.7);
		font-style: italic;
		padding-top: var(--space-md);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: auto;
	}

	.settings-link-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		border: none;
		border-radius: 4px;
		color: white;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-base);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			inset 0 0 10px rgba(255, 255, 255, 0.1);
		margin-top: var(--space-md);
	}

	.settings-link-button:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(255, 255, 255, 0.15);
	}

	.settings-link-button:active {
		transform: translateY(0);
	}

	/* ============================================
	   SETTINGS MODAL STYLING
	   ============================================ */

	.settings-modal-content {
		width: 100%;
		height: 100%;
		padding: clamp(var(--space-lg), 3vw, var(--space-xl));
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.settings-modal-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		overflow-y: auto;
	}

	.settings-intro {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-base);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.85);
		margin: 0;
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
		margin: 0;
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

	.info-modal-button {
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

	.info-modal-button:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 25px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(255, 255, 255, 0.15);
	}

	.info-modal-button:active {
		transform: translateY(0);
	}

	/* Mobile responsive for info modals */
	@media (max-width: 600px) {
		.info-modal-content,
		.settings-modal-content {
			padding: var(--space-md);
		}

		.info-modal-title {
			font-size: var(--text-xl);
		}

		.info-modal-body {
			font-size: var(--text-sm);
		}

		.settings-intro {
			font-size: var(--text-sm);
		}

		.form-group label {
			font-size: var(--text-xs);
		}

		.field-description {
			font-size: var(--text-xs);
		}

		.settings-select {
			font-size: var(--text-sm);
			padding: var(--space-sm) var(--space-md);
			padding-right: 40px;
		}

		.info-modal-button,
		.settings-link-button,
		.settings-save-button {
			width: 100%;
			padding: var(--space-md);
		}

		.settings-save-button {
			font-size: var(--text-sm);
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.welcome-container,
		.game-card,
		.choice-card {
			animation: none !important;
		}

		.game-card:hover,
		.game-card.selected,
		.game-card:active,
		.about-link:hover,
		.about-link:active,
		.choice-card:hover,
		.choice-card:focus {
			transition: none !important;
			transform: none !important;
		}

		.info-modal-button:hover,
		.settings-link-button:hover,
		.settings-save-button:hover,
		.settings-save-button:active,
		.header-button:hover,
		.header-button:active {
			transform: none !important;
		}

		.save-status {
			animation: none !important;
		}
	}
</style>
