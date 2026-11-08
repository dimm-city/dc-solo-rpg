<script>
	/**
	 * BrowseGames - The Story Library: every finished run, newest first.
	 * Each card says how the run ended; Delete sits in the card's overflow menu and asks first.
	 */

	import SortControls from './browse/SortControls.svelte';
	import GameCard from './browse/GameCard.svelte';
	import ConfirmModal from './ConfirmModal.svelte';
	import { useSavedGames } from '$lib/composables/useSavedGames.svelte.js';
	import { getStoryOutcome } from '$lib/utils/storyOutcome.js';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		onSelectGame = () => {}, // Callback when game is selected
		onBack = () => {} // Callback to return to main menu
	} = $props();

	const saves = useSavedGames();

	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
	const duration = (ms) => (reducedMotion() ? 0 : ms);

	/** The game waiting for delete confirmation */
	let pendingDelete = $state(null);
	let notice = $state('');

	let deleteMessage = $derived(
		pendingDelete
			? `“${pendingDelete.gameTitle || 'Untitled game'}” (${getStoryOutcome(pendingDelete).label}, ${saves.formatDate(pendingDelete.lastPlayed || pendingDelete.savedAt)}) and its journal will be deleted. This can't be undone.`
			: ''
	);

	async function confirmDelete() {
		const game = pendingDelete;
		pendingDelete = null;
		const deleted = await saves.deleteGame(game.id);
		notice = deleted
			? `Deleted “${game.gameTitle || 'Untitled game'}”.`
			: "That story couldn't be deleted. Try again.";
	}
</script>

<div
	class="browse-games"
	in:fly={{ y: 20, duration: duration(ANIMATION_DURATION.STORY_MODE), easing: quintOut }}
	out:fade={{ duration: duration(ANIMATION_DURATION.STATE) }}
>
	<header class="browse-header">
		<button class="back-button" onclick={onBack} aria-label="Back to home">
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="title-section">
			<h1 class="page-title">Story Library</h1>
			<p class="subtitle">Your finished games, in your own words.</p>
		</div>

		{#if !saves.isLoading && saves.completedGames.length > 0}
			<SortControls bind:sortBy={saves.sortBy} />
		{/if}
	</header>

	<p class="notice" role="status" aria-live="polite">{notice}</p>

	<div class="browse-content">
		{#if saves.isLoading}
			<div class="loading-state" in:fade={{ duration: duration(ANIMATION_DURATION.NORMAL) }}>
				<div class="loading-spinner"></div>
				<p>Loading your stories…</p>
			</div>
		{:else if saves.error}
			<div class="error-state" in:fade={{ duration: duration(ANIMATION_DURATION.NORMAL) }}>
				<p class="error-message">{saves.error}</p>
				<button class="text-button" onclick={saves.loadCompletedGames}>Try again</button>
			</div>
		{:else if saves.sortedGames.length === 0}
			<div class="empty-state" in:fade={{ duration: duration(ANIMATION_DURATION.NORMAL) }}>
				<svg class="empty-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
				</svg>
				{#if saves.completedGames.length === 0}
					<h2>No stories yet</h2>
					<p>Finish a game, win or lose, and its story is kept here to read again.</p>
					<button class="text-button" onclick={onBack}>Choose a game</button>
				{:else}
					<h2>Nothing to show</h2>
					<p>No stories match this filter.</p>
					<button class="text-button" onclick={() => (saves.sortBy = 'recent')}>Show all</button>
				{/if}
			</div>
		{:else}
			<ul class="games-grid">
				{#each saves.sortedGames as game, index (game.id)}
					<GameCard
						{game}
						{index}
						onSelect={onSelectGame}
						onDelete={(g) => (pendingDelete = g)}
						formatDate={saves.formatDate}
					/>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<ConfirmModal
	isOpen={!!pendingDelete}
	title="Delete story"
	message={deleteMessage}
	confirmText="Delete story"
	cancelText="Keep story"
	onConfirm={confirmDelete}
	onCancel={() => (pendingDelete = null)}
/>

<style>
	.browse-games {
		display: flex;
		flex-direction: column;
		/* Its own full-page scroller (the page body does not scroll). Absolute, so the library and
		   story mode overlap while one fades out and the other in, instead of stacking */
		position: absolute;
		inset: 0;
		/* 85%: the background motes show faintly through, behind every card and line of text
		   (visual-layout-s-08) */
		background: linear-gradient(
			180deg,
			rgba(10, 10, 10, 0.85),
			rgba(26, 26, 26, 0.85),
			rgba(10, 10, 10, 0.85)
		);
		padding: var(--space-xl) var(--space-xl) var(--space-2xl);
		gap: var(--space-lg);
		overflow-y: auto;
	}

	/* Header: back, title, and the sort control at its own size */
	.browse-header {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-md) var(--space-lg);
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		min-height: 48px;
		/* No padding: the global phone button padding squeezed the chevron to nothing (SM-04) */
		padding: 0;
		background: rgba(138, 43, 226, 0.2);
		border: 1px solid rgba(217, 70, 239, 0.6);
		border-radius: 50%;
		color: #f3d9fb;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			border-color 150ms ease-out;
	}

	.back-button svg {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.25;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.back-button:hover {
		background: rgba(138, 43, 226, 0.35);
		border-color: var(--color-cyber-magenta);
	}

	.title-section {
		min-width: 0;
	}

	.page-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 6vw, 2.5rem);
		font-weight: 700;
		line-height: 1.15;
		color: var(--color-cyber-magenta);
		text-shadow: 0 0 20px rgba(217, 70, 239, 0.5);
		overflow-wrap: break-word;
	}

	.subtitle {
		margin: var(--space-xs) 0 0;
		font-size: 1rem;
		color: #b8c5d6;
	}

	.notice {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		min-height: 0;
		font-size: 0.875rem;
		color: #b8c5d6;
	}

	.notice:empty {
		display: none;
	}

	.browse-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
	}

	.loading-state,
	.error-state,
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		padding: var(--space-3xl) var(--space-lg);
		text-align: center;
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 3px solid rgba(255, 255, 255, 0.1);
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
	.error-message,
	.empty-state p {
		max-width: 420px;
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		color: #b8c5d6;
	}

	.empty-icon {
		width: 56px;
		height: 56px;
		fill: none;
		stroke: var(--color-cyber-magenta);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Below 28px the display face is hard to read: Inter for small headings (MN-07) */
	.empty-state h2 {
		margin: 0;
		font-family: var(--font-body);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-transform: none;
		text-shadow: none;
		color: #fff;
	}

	.text-button {
		min-height: 44px;
		margin-top: var(--space-sm);
		padding: 8px 20px;
		background: transparent;
		border: 1px solid var(--color-neon-cyan);
		border-radius: 4px;
		color: #fff;
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 150ms ease-out;
	}

	.text-button:hover {
		background: rgba(0, 255, 255, 0.14);
	}

	.games-grid {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-lg);
	}

	@media (max-width: 640px) {
		.browse-games {
			padding: var(--space-md) var(--space-md) var(--space-xl);
			gap: var(--space-md);
		}

		/* Back and the sort control share the top row; the title gets the full width */
		.browse-header {
			grid-template-columns: auto minmax(0, 1fr);
		}

		.browse-header :global(.sort-controls) {
			grid-area: 1 / 2;
			justify-self: end;
		}

		.title-section {
			grid-area: 2 / 1 / 3 / 3;
		}

		.back-button {
			width: 44px;
			height: 44px;
			min-height: 44px;
		}

		.subtitle {
			font-size: 0.875rem;
		}

		.games-grid {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-button,
		.text-button {
			transition: none;
		}

		.loading-spinner {
			animation: none;
		}
	}
</style>
