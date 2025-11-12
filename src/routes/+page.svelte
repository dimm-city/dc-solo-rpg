<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import AugmentedButton from '$lib/components/AugmentedButton.svelte';
	import Splash from '$lib/components/Splash.svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let selectedGame = $state(null);
	let showSplash = $state(true);
	let showContent = $state(false);

	function selectGame(game) {
		selectedGame = game;
	}

	function loadGame() {
		if (selectedGame) {
			goto(`/game/${selectedGame.slug}`);
		}
	}

	function handleSplashComplete() {
		showSplash = false;
		// Wait for splash fade-out to complete before showing content
		setTimeout(() => {
			showContent = true;
		}, 850); // Wait for 800ms fade + 50ms buffer
	}

	// Show splash on mount and on navigation back to home
	onMount(() => {
		showSplash = true;
		showContent = false;
	});

	// Game descriptions/subtitles for enhanced UI
	const gameDescriptions = {
		'artful-detective': 'Solve mysteries in a noir-cyberpunk city',
		'full-example': 'Complete game demonstration',
		'future-lost': 'Navigate a post-apocalyptic wasteland',
		'gnome-alone': 'Survive as a lone gnome adventurer',
		'simple-example': 'Quick start tutorial game'
	};
</script>

<Splash visible={showSplash} onComplete={handleSplashComplete} />

{#if showContent}
	<section class="form-container" data-testid="home-page" transition:fade={{ duration: 600 }}>
	<div class="welcome-container">
		<section class="hero">
			<h1 data-testid="page-title">Dimm City: Solo RPG</h1>
			<p>Demo</p>
		</section>
		<div class="dc-start-screen-container" data-testid="game-selector">
			<h2>Select a Game</h2>

			<div class="game-cards-grid">
				{#each data.games as game, index}
					<button
						class="game-card game-card-{index + 1}"
						class:selected={selectedGame?.slug === game.slug}
						onclick={() => selectGame(game)}
						data-augmented-ui={index === 0 ? 'tl-clip tr-clip-x br-clip-x border' :
										   index === 1 ? 'tl-clip-y tr-clip br-clip-x border' :
										   index === 2 ? 'tl-clip-y tr-clip-x br-clip border' :
										   index === 3 ? 'tl-clip tr-clip-y br-clip-x bl-clip border' :
										   'tl-clip-x tr-clip br-clip-y bl-clip border'}
						data-testid="game-card-{game.slug}"
					>
						<h3 class="game-card-title">{game.title}</h3>
						<p class="game-subtitle">{gameDescriptions[game.slug] || 'Begin your adventure'}</p>
					</button>
				{/each}
			</div>

			<div class="load-button-container">
				<AugmentedButton
					onclick={loadGame}
					disabled={!selectedGame}
					text="LOAD GAME"
					testid="load-game-button"
				/>
			</div>
		</div>
	</div>
	</section>
{/if}

<style>
	:global(body){
		overflow-y: auto;
	}
	.welcome-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		padding: var(--space-lg);
		gap: var(--space-lg);
	}

	.dc-start-screen-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
	}

	.dc-start-screen-container h2 {
		text-align: center;
		margin: 0;
	}

	/* ============================================
	   GAME CARDS GRID
	   ============================================ */
	.game-cards-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-lg);
		width: 100%;
		max-height: 60vh;
		overflow-y: auto;
		overflow-x: hidden;
		padding-right: var(--space-sm);

		/* Custom scrollbar styling */
		scrollbar-width: thin;
		scrollbar-color: var(--color-cyber-magenta) rgba(255, 255, 255, 0.1);
	}

	.game-cards-grid::-webkit-scrollbar {
		width: 8px;
	}

	.game-cards-grid::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.game-cards-grid::-webkit-scrollbar-thumb {
		background: var(--color-cyber-magenta);
		border-radius: 4px;
	}

	.game-cards-grid::-webkit-scrollbar-thumb:hover {
		background: var(--color-neon-cyan);
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
		gap: var(--space-sm);
		padding: var(--space-xl) var(--space-lg);
		min-height: 180px;

		/* Glassmorphism Background */
		background: linear-gradient(
			135deg,
			rgba(10, 10, 20, 0.7),
			rgba(15, 15, 25, 0.6)
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);

		/* Remove default button styling */
		border: none;
		cursor: pointer;
		position: relative;

		/* Transitions */
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		will-change: transform, box-shadow, filter;
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
		transform: translateY(-4px);
		filter: brightness(1.15);
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
		transform: translateY(-6px);
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
		font-size: 1.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		margin: 0;
		text-align: center;
		line-height: var(--line-height-tight);
	}

	.game-subtitle {
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
		margin: 0;
		line-height: var(--line-height-base);
	}

	/* ============================================
	   LOAD BUTTON CONTAINER
	   ============================================ */

	.load-button-container {
		display: flex;
		justify-content: center;
		margin-top: var(--space-lg);
		:global(.aug-button-wrapper, button){
			width: stretch;
		}
	}

	/* ============================================
	   RESPONSIVE LAYOUTS
	   ============================================ */

	/* Tablet - 2 columns */
	@media (max-width: 900px) {
		.game-cards-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-md);
		}

		.welcome-container {
			padding: var(--space-md);
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
			min-height: 150px;
		}

		.game-card-title {
			font-size: 1.25rem;
		}

		.game-subtitle {
			font-size: 0.8rem;
		}

		.welcome-container {
			padding: var(--space-sm);
		}

		.dc-start-screen-container {
			gap: var(--space-lg);
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.game-card,
		.game-card:hover,
		.game-card.selected,
		.game-card:active {
			transition: none !important;
			transform: none !important;
		}
	}
</style>

