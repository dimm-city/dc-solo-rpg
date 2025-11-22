<!--
 * GameCard - Individual game card for completed games
 *
 * Displays game metadata with outcome badge and view story CTA
 *
 * @component ⭐ HIGHLY REUSABLE
 * @example
 * <GameCard
 *   {game}
 *   {index}
 *   onSelect={() => viewGame(game)}
 *   {formatDate}
 *   {formatDuration}
 * />
 -->

<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		game = null,
		index = 0,
		onSelect = () => {},
		formatDate = (d) => d,
		formatDuration = (r) => r
	} = $props();
</script>

<button
	class="game-card"
	class:won={game.isWon}
	onclick={() => onSelect(game)}
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
				<path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
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
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4l6 6-6 6" />
		</svg>
	</div>
</button>

<style>
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
		.game-card {
			padding: var(--space-md);
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
		.game-card {
			padding: var(--space-sm);
		}

		.game-title {
			font-size: 1rem;
		}
	}
</style>
