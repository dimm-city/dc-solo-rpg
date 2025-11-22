<script>
	/**
	 * BrowseGames - Library view for completed games
	 * Displays a polished gallery of completed games with metadata
	 */

	import SortControls from './browse/SortControls.svelte';
	import GameCard from './browse/GameCard.svelte';
	import { useSavedGames } from '$lib/composables/useSavedGames.svelte.js';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		onSelectGame = (game) => {}, // Callback when game is selected
		onBack = () => {} // Callback to return to main menu
	} = $props();

	// Use saved games composable
	const saves = useSavedGames();
</script>

<div
	class="browse-games"
	in:fly={{ y: 20, duration: ANIMATION_DURATION.STORY_MODE, easing: quintOut }}
	out:fade={{ duration: ANIMATION_DURATION.STORY_MODE }}
>
	<!-- Header -->
	<div class="browse-header" data-augmented-ui="tl-clip tr-clip border">
		<div class="header-content">
			<button class="back-button" onclick={onBack} aria-label="Back to menu">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>

			<div class="title-section">
				<h1 class="page-title">Story Library</h1>
				<p class="subtitle">Relive your completed adventures</p>
			</div>
		</div>

		<SortControls bind:sortBy={saves.sortBy} />
	</div>

	<!-- Content -->
	<div class="browse-content">
		{#if saves.isLoading}
			<div class="loading-state" transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
				<div class="loading-spinner"></div>
				<p>Loading your stories...</p>
			</div>
		{:else if saves.error}
			<div class="error-state" transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
				<div class="error-icon">⚠️</div>
				<p class="error-message">{saves.error}</p>
				<button class="retry-button" onclick={saves.loadCompletedGames}>Try Again</button>
			</div>
		{:else if saves.sortedGames.length === 0}
			<div class="empty-state" transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
				<div class="empty-icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="64"
						height="64"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
					</svg>
				</div>
				<h2>No Completed Games</h2>
				<p>Complete a game to view it here in story mode!</p>
				<button class="start-button" onclick={onBack}>Start a New Game</button>
			</div>
		{:else}
			<div class="games-grid">
				{#each saves.sortedGames as game, index (game.id)}
					<GameCard
						{game}
						{index}
						onSelect={onSelectGame}
						formatDate={saves.formatDate}
						formatDuration={saves.formatDuration}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.browse-games {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: linear-gradient(
			180deg,
			rgba(10, 10, 10, 0.95),
			rgba(26, 26, 26, 0.95),
			rgba(10, 10, 10, 0.95)
		);
		padding: var(--space-lg);
		gap: var(--space-xl);
		overflow-y: auto;
	}

	/* Header */
	.browse-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(26, 26, 26, 0.6));
		border: 2px solid rgba(138, 43, 226, 0.3);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		--aug-border-bg: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(138, 43, 226, 0.3);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
	}

	.back-button {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.3));
		border: 2px solid rgba(138, 43, 226, 0.5);
		border-radius: 50%;
		color: var(--color-cyber-magenta);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.back-button:hover {
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.4));
		border-color: rgba(186, 85, 211, 0.8);
		box-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
		transform: scale(1.05);
	}

	.title-section {
		flex: 1;
	}

	.page-title {
		font-family: var(--font-display);
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-cyber-magenta);
		text-shadow: 0 0 20px rgba(217, 70, 239, 0.6);
		margin: 0;
		line-height: 1.2;
	}

	.subtitle {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.6);
		margin: var(--space-xs) 0 0 0;
	}

	/* Content */
	.browse-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	/* Loading/Error/Empty States */
	.loading-state,
	.error-state,
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-3xl);
		text-align: center;
	}

	.loading-spinner {
		width: 64px;
		height: 64px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: var(--color-cyber-magenta);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-state p,
	.error-message {
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.error-icon,
	.empty-icon {
		color: var(--color-cyber-magenta);
		filter: drop-shadow(0 0 20px rgba(217, 70, 239, 0.6));
	}

	.empty-state h2 {
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.empty-state p {
		color: rgba(255, 255, 255, 0.6);
		max-width: 400px;
	}

	.retry-button,
	.start-button {
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(135deg, var(--color-cyber-magenta), rgba(75, 0, 130, 0.8));
		border: 2px solid rgba(186, 85, 211, 0.6);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.95);
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.retry-button:hover,
	.start-button:hover {
		background: linear-gradient(135deg, rgba(217, 70, 239, 0.9), rgba(138, 43, 226, 0.9));
		border-color: rgba(217, 70, 239, 0.8);
		box-shadow: 0 0 25px rgba(217, 70, 239, 0.5);
		transform: translateY(-2px);
	}

	/* Games Grid */
	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-xl);
		padding: var(--space-lg);
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.browse-games {
			padding: var(--space-sm);
			gap: var(--space-md);
		}

		.browse-header {
			padding: var(--space-md);
			position: relative;
		}

		.page-title {
			font-size: 1.5rem;
			line-height: 1.3;
		}

		.subtitle {
			font-size: 0.875rem;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}

		.back-button {
			position: absolute;
			top: var(--space-md);
			left: var(--space-md);
			width: 40px;
			height: 40px;
		}

		.title-section {
			padding-top: var(--space-2xl);
			width: 100%;
		}

		.games-grid {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}
	}

	/* Extra small screens */
	@media (max-width: 375px) {
		.browse-games {
			padding: var(--space-xs);
		}

		.browse-header {
			padding: var(--space-sm);
		}

		.page-title {
			font-size: 1.25rem;
		}

		.back-button {
			width: 36px;
			height: 36px;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.browse-games {
			animation: none !important;
			transition: opacity 0.1s linear !important;
		}
	}
</style>
