<script>
	/**
	 * StoryMode - Read a finished run, round by round (SM-01)
	 *
	 * Each round leads with the player's own journal entry; the cards are a line of chips above
	 * it. The AI summary is optional and out of the way: a small button in the header.
	 *
	 * Moving between rounds slides the incoming round in from the side it comes from (16px,
	 * 200ms, opacity and transform) while the outgoing round fades over 120ms. Both share one grid
	 * cell, so the content area is never empty (SM-05). Reduced motion swaps instantly.
	 */

	import { untrack } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import StoryRound from './StoryRound.svelte';
	import StoryGenerationPanel from './StoryGenerationPanel.svelte';
	import StoryProgressBar from './story/StoryProgressBar.svelte';
	import StoryNavigation from './story/StoryNavigation.svelte';
	import { useEnrichedRounds } from '$lib/composables/useEnrichedRounds.svelte.js';
	import { useStoryNavigation } from '$lib/composables/useStoryNavigation.svelte.js';
	import { getStoryOutcome, formatRounds } from '$lib/utils/storyOutcome.js';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	/** Incoming round: slide 16px from its side */
	const ROUND_ENTER_MS = ANIMATION_DURATION.ENTER;
	/** Outgoing round: a quicker fade (a 120ms state change), so the two never read as a blank swap (SM-05) */
	const ROUND_EXIT_MS = ANIMATION_DURATION.STATE;
	const ROUND_SHIFT_PX = 16;

	let {
		savedGame = null, // Complete saved game object
		onExit = () => {} // Back to the Story Library
	} = $props();

	let enrichedRounds = $derived.by(() => useEnrichedRounds(savedGame));
	let totalRounds = $derived(enrichedRounds.length);

	const nav = useStoryNavigation(() => totalRounds, onExit);
	let currentRound = $derived(enrichedRounds[nav.currentRoundIndex] || null);
	let isLastRound = $derived(nav.currentRoundIndex === totalRounds - 1);

	let gameTitle = $derived(savedGame?.gameTitle || 'Untitled game');
	let playerName = $derived(savedGame?.playerName || '');
	let outcome = $derived(getStoryOutcome(savedGame ?? {}));
	let written = $derived(enrichedRounds.map((round) => !!round.journalEntry));
	let finishedOn = $derived.by(() => {
		const when = savedGame?.lastPlayed || savedGame?.savedAt;
		return when
			? new Date(when).toLocaleDateString(undefined, {
					month: 'short',
					day: 'numeric',
					year: 'numeric'
				})
			: '';
	});

	let scroller = $state();
	let stage = $state();

	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

	function roundIn(_node, { direction }) {
		if (reducedMotion()) return { duration: 0 };
		return {
			duration: ROUND_ENTER_MS,
			easing: cubicOut,
			css: (t, u) => `opacity: ${t}; transform: translateX(${u * ROUND_SHIFT_PX * direction}px);`
		};
	}

	function roundOut() {
		if (reducedMotion()) return { duration: 0 };
		return { duration: ROUND_EXIT_MS, css: (t) => `opacity: ${t};` };
	}

	function modeTransition() {
		return {
			duration: reducedMotion() ? 0 : ANIMATION_DURATION.STORY_MODE,
			start: 0.97,
			opacity: 0,
			easing: cubicOut
		};
	}

	// After a page turn, bring the top of the new round into view if the reader had scrolled
	// past it (reading a long entry, then pressing Next at the bottom)
	let firstRun = true;
	$effect(() => {
		nav.currentRoundIndex;
		untrack(() => {
			if (firstRun) {
				firstRun = false;
				return;
			}
			if (!scroller || !stage) return;
			const top = stage.offsetTop - 16;
			if (scroller.scrollTop > top) {
				scroller.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
			}
		});
	});
</script>

{#if savedGame}
	<div
		class="story-mode"
		bind:this={scroller}
		data-testid="story-mode"
		in:scale={modeTransition()}
		out:scale={modeTransition()}
	>
		<header class="story-header">
			<button class="back-button" onclick={onExit} aria-label="Back to Story Library">
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7" /></svg>
			</button>

			<h1 class="game-title">{gameTitle}</h1>

			<p class="story-meta">
				<span class="outcome" class:won={outcome.won}>{outcome.label}</span>
				<span aria-hidden="true">·</span>
				<span>{formatRounds(savedGame.roundsSurvived ?? totalRounds)}</span>
				{#if playerName}
					<span aria-hidden="true">·</span>
					<span>{playerName}</span>
				{/if}
				{#if finishedOn}
					<span aria-hidden="true">·</span>
					<span>{finishedOn}</span>
				{/if}
			</p>

			<div class="header-ai">
				<StoryGenerationPanel {savedGame} saveKey={savedGame?.id || ''} />
			</div>
		</header>

		<div class="reader">
			<StoryProgressBar
				currentRound={nav.currentRoundIndex}
				{totalRounds}
				{written}
				onJumpToRound={nav.jumpToRound}
			/>

			<div class="round-stage" bind:this={stage}>
				{#if totalRounds === 0}
					<p class="empty">This game ended before any cards were drawn.</p>
				{/if}
				{#key nav.currentRoundIndex}
					<div
						class="round-slot"
						in:roundIn={{ direction: nav.direction }}
						out:roundOut
						data-testid="story-round"
					>
						<StoryRound
							round={currentRound}
							roundNumber={currentRound?.roundNumber || nav.currentRoundIndex + 1}
							{totalRounds}
							outcome={isLastRound ? outcome.label : ''}
						/>
					</div>
				{/key}
			</div>
		</div>

		{#if totalRounds > 0}
			<StoryNavigation
				currentRound={nav.currentRoundIndex}
				{totalRounds}
				canGoPrevious={nav.canGoPrevious}
				canGoNext={nav.canGoNext}
				onPrevious={nav.previousRound}
				onNext={nav.nextRound}
			/>
		{/if}
	</div>
{/if}

<style>
	/* Its own full-page scroller; absolute so it overlaps the library during the hand-off */
	.story-mode {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
		background: linear-gradient(
			180deg,
			rgba(10, 10, 10, 0.96),
			rgba(20, 22, 28, 0.96),
			rgba(10, 10, 10, 0.96)
		);
		font-family: var(--font-body);
	}

	/* Header, aligned to the reading column: title, then the outcome line and the optional
	   AI summary. Tablet: back | title, then meta | AI under the title. */
	.story-header {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 8px 16px;
		width: 100%;
		max-width: 704px;
		margin: 0 auto;
		padding: 32px 32px 0;
	}

	.back-button {
		grid-area: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		min-height: 48px;
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

	/* 28px and up: the display face (MN-07) */
	.game-title {
		grid-area: 1 / 2 / 2 / 4;
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4.5vw, 2.5rem);
		font-weight: 700;
		line-height: 1.15;
		color: var(--color-brand-yellow);
		text-shadow: 0 0 18px rgba(255, 215, 0, 0.35);
		overflow-wrap: break-word;
	}

	.story-meta {
		grid-area: 2 / 2;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 8px;
		margin: 0;
		font-size: 1rem;
		color: #b8c5d6;
	}

	.header-ai {
		grid-area: 2 / 3;
		justify-self: end;
	}

	.outcome {
		font-weight: 700;
		color: #ff8fa3;
	}

	.outcome.won {
		color: var(--color-brand-yellow);
	}

	/* Wide screens: the back button hangs in the margin, left of the reading column */
	@media (min-width: 900px) {
		.story-header {
			position: relative;
			grid-template-columns: minmax(0, 1fr) auto;
		}

		/* Out of the grid, so it is placed against the header box, not a grid cell */
		.back-button {
			grid-area: auto;
			position: absolute;
			top: 32px;
			left: -36px;
		}

		.game-title {
			grid-area: 1 / 1 / 2 / 3;
		}

		.story-meta {
			grid-area: 2 / 1;
		}

		.header-ai {
			grid-area: 2 / 2;
		}
	}

	/* The reading column */
	.reader {
		flex: 1 0 auto;
		display: flex;
		flex-direction: column;
		gap: 28px;
		width: 100%;
		max-width: 704px;
		margin: 0 auto;
		padding: 16px 32px 48px;
	}

	/* Outgoing and incoming rounds share one cell, so there is always text on screen */
	.round-stage {
		display: grid;
		scroll-margin-top: 16px;
	}

	.round-slot {
		grid-area: 1 / 1;
		min-width: 0;
	}

	.empty {
		margin: 0;
		color: #b8c5d6;
	}

	/* Phones: back and the AI button share the top row; the title gets the full width */
	@media (max-width: 640px) {
		.story-header {
			grid-template-columns: auto minmax(0, 1fr);
			padding: 12px 16px 0;
			gap: 12px;
		}

		.back-button {
			width: 44px;
			height: 44px;
			min-height: 44px;
		}

		.header-ai {
			grid-area: 1 / 2;
		}

		.game-title {
			grid-area: 2 / 1 / 3 / 3;
		}

		.story-meta {
			grid-area: 3 / 1 / 4 / 3;
		}

		.story-meta {
			font-size: 0.9375rem;
		}

		.reader {
			padding: 12px 16px 32px;
			gap: 20px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-button {
			transition: none;
		}
	}
</style>
