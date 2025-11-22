<script>
	/**
	 * StoryMode - Immersive story viewer for completed games
	 * Allows users to navigate through their completed game rounds
	 */

	import StoryRound from './StoryRound.svelte';
	import StoryGenerationPanel from './StoryGenerationPanel.svelte';
	import StoryProgressBar from './story/StoryProgressBar.svelte';
	import StoryNavigation from './story/StoryNavigation.svelte';
	import { useEnrichedRounds } from '$lib/composables/useEnrichedRounds.svelte.js';
	import { useStoryNavigation } from '$lib/composables/useStoryNavigation.svelte.js';
	import { scale, crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	// Create crossfade for smooth round transitions
	const [send, receive] = crossfade({
		duration: ANIMATION_DURATION.ROUND_TRANSITION,
		easing: cubicOut
	});

	let {
		savedGame = null, // Complete saved game object
		onExit = () => {} // Callback when user exits story mode
	} = $props();

	// Use composables for enriched rounds and navigation
	let enrichedRounds = $derived.by(() => useEnrichedRounds(savedGame));
	let totalRounds = $derived(enrichedRounds.length);

	const nav = useStoryNavigation(totalRounds, onExit);
	let currentRound = $derived(enrichedRounds[nav.currentRoundIndex] || null);

	// Game metadata
	let gameTitle = $derived(savedGame?.gameTitle || 'Untitled Game');
	let playerName = $derived(savedGame?.playerName || 'Anonymous');
	let isWon = $derived(savedGame?.isWon || false);
	let roundsSurvived = $derived(savedGame?.roundsSurvived || 0);
	let finalTower = $derived(savedGame?.finalTower || 0);
</script>

{#if savedGame}
	<div
		class="story-mode"
		in:scale={{
			duration: ANIMATION_DURATION.STORY_MODE,
			start: 0.95,
			opacity: 0,
			easing: cubicOut
		}}
		out:scale={{
			duration: ANIMATION_DURATION.STORY_MODE,
			start: 0.95,
			opacity: 0,
			easing: cubicOut
		}}
	>
		<!-- Header with game info and controls -->
		<div class="story-header" data-augmented-ui="tl-clip tr-clip border">
			<div class="game-info">
				<div class="game-title-section">
					<h1 class="game-title">{gameTitle}</h1>
					<div class="outcome-badge" class:won={isWon}>
						<span class="outcome-text">{isWon ? 'Victory' : 'Defeat'}</span>
					</div>
				</div>
				<div class="meta-info">
					<span class="player-name">
						<strong>Player:</strong>
						{playerName}
					</span>
					<span class="rounds-survived">
						<strong>Rounds:</strong>
						{roundsSurvived}
					</span>
					<span class="final-tower">
						<strong>Tower:</strong>
						{finalTower}
					</span>
				</div>
			</div>

			<button class="exit-button" onclick={onExit} aria-label="Exit story mode">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- AI Story Generation Panel -->
		<div class="story-generation-section">
			<StoryGenerationPanel {savedGame} saveKey={savedGame?.id || ''} />
		</div>

		<!-- Progress Bar -->
		<StoryProgressBar
			currentRound={nav.currentRoundIndex}
			{totalRounds}
			onJumpToRound={nav.jumpToRound}
		/>

		<!-- Current Round Display -->
		<div class="round-container">
			{#key nav.currentRoundIndex}
				<div
					class="round-wrapper"
					in:receive={{ key: nav.currentRoundIndex }}
					out:send={{ key: nav.currentRoundIndex }}
				>
					<StoryRound
						round={currentRound}
						roundNumber={currentRound?.roundNumber || nav.currentRoundIndex + 1}
						{totalRounds}
						showStats={true}
					/>
				</div>
			{/key}
		</div>

		<!-- Navigation Controls -->
		<StoryNavigation
			currentRound={nav.currentRoundIndex}
			{totalRounds}
			canGoPrevious={nav.canGoPrevious}
			canGoNext={nav.canGoNext}
			onPrevious={nav.previousRound}
			onNext={nav.nextRound}
		/>
	</div>
{/if}

<style>
	.story-mode {
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
	.story-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(26, 26, 26, 0.6));
		border: 2px solid rgba(255, 215, 0, 0.3);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		--aug-border-bg: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(255, 215, 0, 0.3);
	}

	.game-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.game-title-section {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	.game-title {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		margin: 0;
		line-height: 1.2;
	}

	.outcome-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.2), rgba(139, 0, 0, 0.3));
		border: 2px solid rgba(220, 20, 60, 0.5);
		border-radius: 6px;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.outcome-badge.won {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border-color: rgba(255, 215, 0, 0.5);
	}

	.outcome-icon {
		font-size: 1.25rem;
	}

	.outcome-text {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(220, 20, 60, 1);
	}

	.outcome-badge.won .outcome-text {
		color: var(--color-brand-yellow);
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.meta-info {
		display: flex;
		align-items: center;
		gap: var(--space-xl);
		flex-wrap: wrap;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.meta-info > span {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.player-name {
		color: var(--color-neon-cyan);
		font-weight: 600;
	}

	.exit-button {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.2), rgba(139, 0, 0, 0.3));
		border: 2px solid rgba(220, 20, 60, 0.5);
		border-radius: 50%;
		color: rgba(220, 20, 60, 1);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.exit-button:hover {
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.3), rgba(139, 0, 0, 0.4));
		border-color: rgba(220, 20, 60, 0.8);
		box-shadow: 0 0 20px rgba(220, 20, 60, 0.5);
		transform: scale(1.05);
	}

	/* Story Generation Section */
	.story-generation-section {
		padding: 0 var(--space-xl);
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.story-mode {
			padding: var(--space-sm);
			gap: var(--space-md);
			min-height: 100vh;
			min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
		}

		.story-header {
			flex-direction: column;
			align-items: stretch;
			padding: var(--space-md);
			position: relative;
			gap: var(--space-md);
		}

		.game-info {
			padding-right: 56px; /* Space for exit button */
		}

		.game-title-section {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.game-title {
			font-size: 1.25rem;
			line-height: 1.3;
			word-break: break-word;
		}

		.outcome-badge {
			align-self: flex-start;
			padding: var(--space-xs) var(--space-md);
		}

		.outcome-text {
			font-size: 0.75rem;
		}

		.meta-info {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-xs);
			font-size: 0.8125rem;
		}

		.exit-button {
			position: absolute;
			top: var(--space-md);
			right: var(--space-md);
			width: 40px;
			height: 40px;
		}

		.exit-button svg {
			width: 20px;
			height: 20px;
		}

		.story-generation-section {
			padding: 0 var(--space-md);
		}
	}

	/* Tablet optimizations */
	@media (min-width: 641px) and (max-width: 1024px) {
		.story-mode {
			padding: var(--space-md);
		}
	}
	/* Extra small screens */
	@media (max-width: 375px) {
		.story-mode {
			padding: var(--space-xs);
		}

		.story-header {
			padding: var(--space-sm);
		}

		.game-title {
			font-size: 1.125rem;
		}

		.meta-info {
			font-size: 0.75rem;
		}

		.exit-button {
			width: 36px;
			height: 36px;
		}
	}

	/* Accessibility - Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.story-mode,
		.round-wrapper {
			animation: none !important;
			transition: opacity 0.1s linear !important;
		}
	}
</style>
