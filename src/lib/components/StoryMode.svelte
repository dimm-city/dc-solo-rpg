<script>
	/**
	 * StoryMode - Immersive story viewer for completed games
	 * Allows users to navigate through their completed game rounds
	 */

	import StoryRound from './StoryRound.svelte';
	import AugmentedButton from './AugmentedButton.svelte';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let {
		savedGame = null, // Complete saved game object
		onExit = () => {} // Callback when user exits story mode
	} = $props();

	let currentRoundIndex = $state(0);
	let isNavigating = $state(false);

	// Group cards by round number and merge with journal entries
	let enrichedRounds = $derived.by(() => {
		if (!savedGame?.cardLog) return [];

		const cardLog = savedGame.cardLog;
		const journalEntries = savedGame.journalEntries || [];

		// Filter out non-card entries (like 'initial-damage', 'final-damage')
		const cardEntries = cardLog.filter(entry => entry.type !== 'initial-damage' && entry.type !== 'final-damage');

		// Group cards by round number
		const roundsMap = new Map();
		for (const cardEntry of cardEntries) {
			const roundNum = cardEntry.round;
			if (!roundsMap.has(roundNum)) {
				roundsMap.set(roundNum, []);
			}
			roundsMap.get(roundNum).push(cardEntry);
		}

		// Convert map to array of round objects
		return Array.from(roundsMap.entries())
			.sort((a, b) => a[0] - b[0]) // Sort by round number
			.map(([roundNum, cards]) => {
				// Find journal entry for this round
				const journalEntry = journalEntries.find(j => j.round === roundNum);

				// Get game state from the last card in the round (most recent state)
				const lastCard = cards[cards.length - 1];

				return {
					roundNumber: roundNum,
					cards: cards.map(cardEntry => ({
						card: cardEntry.card,
						suit: cardEntry.suit,
						type: cardEntry.type,
						modifier: cardEntry.modifier,
						description: cardEntry.description,
						story: cardEntry.story,
						damageRoll: cardEntry.damageRoll,
						damageDealt: cardEntry.damageDealt
					})),
					journalEntry: journalEntry ? {
						text: journalEntry.text,
						audio: journalEntry.audioData
					} : null,
					gameState: lastCard.gameState || {
						tower: 'N/A',
						tokens: 'N/A',
						bonus: 0,
						kingsRevealed: 0,
						aceOfHeartsRevealed: false
					}
				};
			});
	});

	// Get total rounds from enriched data
	let totalRounds = $derived(enrichedRounds.length);
	let currentRound = $derived(enrichedRounds[currentRoundIndex] || null);
	let canGoPrevious = $derived(currentRoundIndex > 0);
	let canGoNext = $derived(currentRoundIndex < totalRounds - 1);

	// Game metadata
	let gameTitle = $derived(savedGame?.gameTitle || 'Untitled Game');
	let playerName = $derived(savedGame?.playerName || 'Anonymous');
	let isWon = $derived(savedGame?.isWon || false);
	let roundsSurvived = $derived(savedGame?.roundsSurvived || 0);
	let finalTower = $derived(savedGame?.finalTower || 0);

	function previousRound() {
		if (!canGoPrevious || isNavigating) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex--;
			isNavigating = false;
		}, 150);
	}

	function nextRound() {
		if (!canGoNext || isNavigating) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex++;
			isNavigating = false;
		}, 150);
	}

	function jumpToRound(index) {
		if (index === currentRoundIndex || isNavigating) return;
		if (index < 0 || index >= totalRounds) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex = index;
			isNavigating = false;
		}, 150);
	}

	function handleKeyboard(event) {
		if (event.key === 'ArrowLeft') {
			previousRound();
		} else if (event.key === 'ArrowRight') {
			nextRound();
		} else if (event.key === 'Escape') {
			onExit();
		}
	}

	// Keyboard navigation
	$effect(() => {
		window.addEventListener('keydown', handleKeyboard);
		return () => {
			window.removeEventListener('keydown', handleKeyboard);
		};
	});
</script>

{#if savedGame}
	<div class="story-mode" transition:fade={{ duration: 300 }}>
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

		<!-- Progress Bar -->
		<div class="progress-section">
			<div class="progress-bar-container">
				<div class="progress-track">
					<div
						class="progress-fill"
						style="width: {((currentRoundIndex + 1) / totalRounds) * 100}%"
					></div>
				</div>
				<div class="progress-markers">
					{#each Array(totalRounds) as _, i}
						<button
							class="progress-marker"
							class:active={i === currentRoundIndex}
							class:completed={i < currentRoundIndex}
							onclick={() => jumpToRound(i)}
							aria-label="Jump to round {i + 1}"
						>
							<span class="marker-number">{i + 1}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Current Round Display -->
		<div class="round-container">
			{#key currentRoundIndex}
				<div class="round-wrapper" transition:fade={{ duration: 300 }}>
					<StoryRound
						round={currentRound}
						roundNumber={currentRound?.roundNumber || currentRoundIndex + 1}
						{totalRounds}
						showStats={true}
					/>
				</div>
			{/key}
		</div>

		<!-- Navigation Controls -->
		<div class="navigation-controls" data-augmented-ui="tl-clip tr-clip border">
			<AugmentedButton
				onclick={previousRound}
				disabled={!canGoPrevious}
				label="Previous Round"
				style="secondary"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					slot="icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 16l-6-6 6-6"
					/>
				</svg>
				Previous
			</AugmentedButton>

			<div class="round-indicator">
				<span class="current">{currentRoundIndex + 1}</span>
				<span class="separator">/</span>
				<span class="total">{totalRounds}</span>
			</div>

			<AugmentedButton
				onclick={nextRound}
				disabled={!canGoNext}
				label="Next Round"
				style="secondary"
			>
				Next
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					stroke="currentColor"
					slot="icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 4l6 6-6 6"
					/>
				</svg>
			</AugmentedButton>
		</div>

		<!-- Keyboard hints -->
		<div class="keyboard-hints">
			<span class="hint">
				<kbd>←</kbd>
				Previous
			</span>
			<span class="hint">
				<kbd>→</kbd>
				Next
			</span>
			<span class="hint">
				<kbd>Esc</kbd>
				Exit
			</span>
		</div>
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

	/* Progress Section */
	.progress-section {
		padding: 0 var(--space-xl);
	}

	.progress-bar-container {
		position: relative;
		width: 100%;
	}

	.progress-track {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		border-radius: 4px;
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 15px rgba(217, 70, 239, 0.6);
	}

	.progress-markers {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-md);
		gap: var(--space-xs);
	}

	.progress-marker {
		flex: 1;
		max-width: 48px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		cursor: pointer;
		transition: all var(--transition-base);
		position: relative;
	}

	.progress-marker:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
	}

	.progress-marker.active {
		background: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		border-color: var(--color-neon-cyan);
		box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
	}

	.progress-marker.completed {
		background: rgba(0, 255, 255, 0.2);
		border-color: rgba(0, 255, 255, 0.4);
	}

	.marker-number {
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
	}

	.progress-marker.active .marker-number {
		color: rgba(10, 10, 10, 1);
	}

	/* Round Container */
	.round-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.round-wrapper {
		width: 100%;
	}

	/* Navigation Controls */
	.navigation-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(26, 26, 26, 0.6));
		border: 2px solid rgba(138, 43, 226, 0.3);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		--aug-border-bg: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(138, 43, 226, 0.3);
	}

	.round-indicator {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
		font-family: 'Courier New', monospace;
	}

	.round-indicator .current {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
	}

	.round-indicator .separator {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.round-indicator .total {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Keyboard Hints */
	.keyboard-hints {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xl);
		padding: var(--space-md);
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.875rem;
	}

	.hint {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	kbd {
		padding: var(--space-xs) var(--space-sm);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.8);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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

		.progress-section {
			padding: 0 var(--space-md);
		}

		.progress-track {
			height: 6px;
		}

		.progress-markers {
			display: none; /* Too many markers on mobile */
		}

		.round-container {
			overflow-x: hidden;
		}

		.navigation-controls {
			flex-direction: row;
			justify-content: space-between;
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.navigation-controls :global(button) {
			flex: 1;
			min-width: 0;
			font-size: 0.875rem;
			padding: var(--space-sm) var(--space-md);
		}

		.round-indicator {
			position: relative;
			flex-shrink: 0;
			gap: var(--space-xs);
		}

		.round-indicator .current {
			font-size: 1.5rem;
		}

		.round-indicator .separator,
		.round-indicator .total {
			font-size: 1rem;
		}

		.keyboard-hints {
			display: none; /* Hide on mobile */
		}
	}

	/* Tablet optimizations */
	@media (min-width: 641px) and (max-width: 1024px) {
		.story-mode {
			padding: var(--space-md);
		}

		.progress-marker {
			max-width: 36px;
			height: 28px;
		}

		.marker-number {
			font-size: 0.625rem;
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

		.navigation-controls {
			padding: var(--space-sm);
		}

		.round-indicator .current {
			font-size: 1.25rem;
		}
	}
</style>
