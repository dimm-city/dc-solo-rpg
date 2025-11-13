<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';
	import { hasSeenInstructions, markInstructionsAsSeen } from '$lib/utils/instructionsStorage.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let selectedGame = $state(null);
	// Check if splash was already shown in this session
	let showSplash = $state(typeof window !== 'undefined' && !sessionStorage.getItem('splashShown'));
	let showInstructionsChoice = $state(false);
	let showContent = $state(false);
	let showModal = $state(false);

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

		// Check if user has seen instructions
		const instructionsSeen = hasSeenInstructions();

		// Wait for splash fade-out to complete before showing next screen
		setTimeout(() => {
			if (instructionsSeen) {
				// Skip directly to game selection
				showContent = true;
			} else {
				// Show instructions choice screen
				showInstructionsChoice = true;
			}
		}, 850); // Wait for 800ms fade + 50ms buffer
	}

	function handleLearnToPlay() {
		goto('/how-to');
	}

	function handleSkipOnce() {
		// Skip to game selection without storing preference
		showInstructionsChoice = false;
		setTimeout(() => {
			showContent = true;
		}, 300);
	}

	function handleSkipAlways() {
		// Skip to game selection and remember preference
		markInstructionsAsSeen();
		showInstructionsChoice = false;
		setTimeout(() => {
			showContent = true;
		}, 300);
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
			<h2>Select a Game</h2>
			<div class="header-buttons">
				<a href="/how-to" class="header-link" aria-label="How to Play">
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
				</a>
				<a href="/about" class="header-link" aria-label="About">
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
				</a>
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
							<p class="game-subtitle">{gameDescriptions[game.slug] || 'Begin your adventure'}</p>
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

<style>
	:global(body) {
		overflow-y: auto;
	}

	.page-header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		background: rgba(10, 10, 20, 0.05);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.page-header h2 {
		grid-column: 2;
		text-align: center;
		margin: 0;
		font-size: clamp(1.25rem, 2.5vw, 1.75rem);
		letter-spacing: var(--letter-spacing-widest);
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
	}

	.header-buttons {
		grid-column: 3;
		justify-self: end;
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	.header-link {
		color: var(--color-brand-yellow);
		text-decoration: none;
		padding: var(--space-sm);
		transition: all var(--transition-fast);
		display: inline-flex;
		align-items: center;
		border-radius: 50%;
	}

	.header-link svg {
		width: 28px;
		height: 28px;
		filter: drop-shadow(0 0 4px var(--color-brand-yellow));
	}

	.header-link:hover {
		color: var(--color-neon-cyan);
		transform: scale(1.1);
	}

	.header-link:hover svg {
		filter: drop-shadow(0 0 8px var(--color-neon-cyan));
	}

	.header-link:active {
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
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
		overflow-y: auto;
		z-index: 10;
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
	}
</style>
