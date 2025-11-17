<script>
	/**
	 * BrowseGames - Library view for completed games
	 * Displays a polished gallery of completed games with metadata
	 */

	import { loadAllSaves } from '$lib/stores/indexedDBStorage.js';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		onSelectGame = (game) => {}, // Callback when game is selected
		onBack = () => {} // Callback to return to main menu
	} = $props();

	let completedGames = $state([]);
	let isLoading = $state(true);
	let error = $state(null);
	let sortBy = $state('recent'); // recent, oldest, won, lost
	let mounted = $state(false);

	// Load completed games on mount (run only once)
	$effect(() => {
		if (!mounted) {
			mounted = true;
			loadCompletedGames();
		}
	});

	async function loadCompletedGames() {
		isLoading = true;
		error = null;

		try {
			const allSaves = await loadAllSaves();

			// Filter for completed games (won or lost)
			const completed = allSaves.filter((save) => {
				return save.isWon === true || save.isWon === false;
			});

			completedGames = completed;
		} catch (err) {
			console.error('Failed to load completed games:', err);
			error = 'Failed to load saved games. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// Sort games
	let sortedGames = $derived.by(() => {
		const games = [...completedGames];

		switch (sortBy) {
			case 'recent':
				return games.sort((a, b) => {
					const dateA = new Date(a.lastPlayed || a.savedAt || 0);
					const dateB = new Date(b.lastPlayed || b.savedAt || 0);
					return dateB - dateA;
				});
			case 'oldest':
				return games.sort((a, b) => {
					const dateA = new Date(a.lastPlayed || a.savedAt || 0);
					const dateB = new Date(b.lastPlayed || b.savedAt || 0);
					return dateA - dateB;
				});
			case 'won':
				return games.filter((g) => g.isWon === true);
			case 'lost':
				return games.filter((g) => g.isWon === false);
			default:
				return games;
		}
	});

	function formatDate(dateString) {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatDuration(rounds) {
		if (!rounds) return 'Unknown';
		if (rounds === 1) return '1 round';
		return `${rounds} rounds`;
	}
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

		<div class="sort-controls">
			<label for="sort-select">Sort by:</label>
			<select id="sort-select" bind:value={sortBy}>
				<option value="recent">Most Recent</option>
				<option value="oldest">Oldest First</option>
				<option value="won">Victories Only</option>
				<option value="lost">Defeats Only</option>
			</select>
		</div>
	</div>

	<!-- Content -->
	<div class="browse-content">
		{#if isLoading}
			<div class="loading-state" transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
				<div class="loading-spinner"></div>
				<p>Loading your stories...</p>
			</div>
		{:else if error}
			<div class="error-state" transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
				<div class="error-icon">⚠️</div>
				<p class="error-message">{error}</p>
				<button class="retry-button" onclick={loadCompletedGames}>Try Again</button>
			</div>
		{:else if sortedGames.length === 0}
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
				{#each sortedGames as game, index (game.id)}
					<button
						class="game-card"
						class:won={game.isWon}
						onclick={() => onSelectGame(game)}
						data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
						in:fly={{
							y: 20,
							duration: ANIMATION_DURATION.SLOW,
							delay: index * 50,
							easing: quintOut
						}}
					>
						<!-- Outcome Badge -->
						<div class="outcome-indicator" class:won={game.isWon}>
							{#if game.isWon}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							{/if}
						</div>

						<!-- Game Info -->
						<div class="game-header">
							<h3 class="game-title">{game.gameTitle || 'Untitled Game'}</h3>
						</div>

						<div class="game-meta">
							<div class="meta-row">
								<span class="meta-label">Player:</span>
								<span class="meta-value">{game.playerName || 'Anonymous'}</span>
							</div>
							<div class="meta-row">
								<span class="meta-label">Journey:</span>
								<span class="meta-value">{formatDuration(game.roundsSurvived)}</span>
							</div>
							<div class="meta-row">
								<span class="meta-label">Tower:</span>
								<span class="meta-value">{game.finalTower ?? 'N/A'}</span>
							</div>
							<div class="meta-row">
								<span class="meta-label">Completed:</span>
								<span class="meta-value">{formatDate(game.lastPlayed || game.savedAt)}</span>
							</div>
						</div>

						<!-- View Story CTA -->
						<div class="view-story-cta">
							<span>View Story</span>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 4l6 6-6 6"
								/>
							</svg>
						</div>
					</button>
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

	.sort-controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.sort-controls select {
		padding: var(--space-sm) var(--space-md);
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(138, 43, 226, 0.4);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.9);
		font-family: var(--font-body);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.sort-controls select:hover,
	.sort-controls select:focus {
		border-color: rgba(186, 85, 211, 0.6);
		background: rgba(0, 0, 0, 0.6);
		outline: none;
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

	.game-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(100, 50, 200, 0.15), rgba(50, 150, 255, 0.1));
		border: 2px solid rgba(138, 43, 226, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		cursor: pointer;
		transition: all var(--transition-base);
		text-align: left;
		--aug-border-bg: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.2));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(138, 43, 226, 0.4);
	}

	.game-card:hover {
		background: linear-gradient(135deg, rgba(100, 50, 200, 0.25), rgba(50, 150, 255, 0.2));
		border-color: rgba(186, 85, 211, 0.6);
		box-shadow: 0 8px 32px rgba(138, 43, 226, 0.3);
		transform: translateY(-4px);
	}

	.game-card.won {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.05));
		border-color: rgba(255, 215, 0, 0.4);
		--aug-border-bg: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1));
		--aug-border-fallback-color: rgba(255, 215, 0, 0.4);
	}

	.game-card.won:hover {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border-color: rgba(255, 215, 0, 0.6);
		box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
	}

	.outcome-indicator {
		position: absolute;
		top: var(--space-lg);
		right: var(--space-lg);
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.3), rgba(139, 0, 0, 0.4));
		border: 2px solid rgba(220, 20, 60, 0.6);
		border-radius: 50%;
		box-shadow: 0 0 15px rgba(220, 20, 60, 0.4);
	}

	.outcome-indicator.won {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.4));
		border-color: rgba(255, 215, 0, 0.6);
		box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
	}

	.outcome-icon {
		font-size: 1.5rem;
	}

	.game-header {
		padding-right: var(--space-3xl); /* Space for outcome badge */
	}

	.game-title {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
		margin: 0;
		line-height: 1.3;
		word-break: break-word;
	}

	.game-card.won .game-title {
		color: var(--color-brand-yellow);
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.game-meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.meta-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-sm);
		align-items: center;
		font-size: 0.875rem;
	}

	.meta-label {
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.meta-value {
		color: rgba(255, 255, 255, 0.9);
		text-align: right;
		font-family: 'Courier New', monospace;
	}

	.view-story-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(138, 43, 226, 0.4);
		border-radius: 6px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-cyber-magenta);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: all var(--transition-base);
	}

	.game-card:hover .view-story-cta {
		background: rgba(138, 43, 226, 0.2);
		border-color: rgba(186, 85, 211, 0.6);
		color: var(--color-neon-cyan);
	}

	.game-card.won .view-story-cta {
		border-color: rgba(255, 215, 0, 0.4);
		color: rgba(255, 215, 0, 0.9);
	}

	.game-card.won:hover .view-story-cta {
		background: rgba(255, 215, 0, 0.2);
		border-color: rgba(255, 215, 0, 0.6);
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

		.sort-controls {
			width: 100%;
			flex-wrap: wrap;
			gap: var(--space-sm);
		}

		.sort-controls :global(button) {
			flex: 1;
			min-width: calc(50% - var(--space-xs));
			font-size: 0.8125rem;
			padding: var(--space-xs) var(--space-sm);
		}

		.games-grid {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}

		.game-card {
			padding: var(--space-md);
		}

		.game-card-header {
			gap: var(--space-xs);
		}

		.game-title {
			font-size: 1.125rem;
		}

		.game-meta {
			flex-wrap: wrap;
			gap: var(--space-xs);
			font-size: 0.75rem;
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

		.game-card {
			padding: var(--space-sm);
		}

		.game-title {
			font-size: 1rem;
		}

		.sort-controls :global(button) {
			flex: 1 1 100%;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.browse-games,
		.game-card {
			animation: none !important;
			transition: opacity 0.1s linear !important;
		}
	}
</style>
