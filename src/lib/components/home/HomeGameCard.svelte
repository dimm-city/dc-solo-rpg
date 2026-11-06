<script>
	/**
	 * HomeGameCard - one game on the home screen: generated key art, title, the game's own
	 * subtitle, a time estimate, and labelled actions pinned to the bottom of the card.
	 *
	 * Without a save: Play. With a save: Continue (round and time since the save), New game
	 * (the page confirms the overwrite) and a small Delete save link.
	 */
	import GameKeyArt from './GameKeyArt.svelte';
	import {
		gameSlug,
		gameSubtitle,
		saveSummaryParts,
		SESSION_ESTIMATE
	} from '../../utils/homeGames.js';

	let {
		game,
		index = 0,
		/** getSaveMetadata() for this game, or null */
		save = null,
		onplay,
		oncontinue,
		onnewgame,
		ondeletesave,
		onremove
	} = $props();

	const AUG_PATTERNS = [
		'tl-clip tr-clip-x br-clip-x border',
		'tl-clip-y tr-clip br-clip-x border',
		'tl-clip-y tr-clip-x br-clip border',
		'tl-clip tr-clip-y br-clip-x bl-clip border',
		'tl-clip-x tr-clip br-clip-y bl-clip border'
	];

	const uid = $props.id();
	const titleId = `game-title-${uid}`;
	const slug = $derived(gameSlug(game));
	const subtitle = $derived(gameSubtitle(game));
	const saveParts = $derived(saveSummaryParts(save));
</script>

<article class="game-card-wrapper">
	<div
		class="game-card game-card-{(index % 5) + 1}"
		class:has-custom={game.isCustom}
		data-augmented-ui={AUG_PATTERNS[index % 5]}
		data-testid="game-card-{slug}"
	>
		<div class="key-art">
			<GameKeyArt seed={slug} />
		</div>

		<div class="card-body">
			<h3 class="game-card-title" id={titleId}>{game.title}</h3>
			<!-- Always rendered: each part of the card is a row shared with the cards beside it -->
			<p class="game-subtitle">{subtitle}</p>
			<p class="game-meta">
				<span>{SESSION_ESTIMATE}</span>
				{#if game.isCustom}
					<span class="custom-badge">Custom</span>
				{/if}
			</p>

			<div class="card-actions">
				{#if save}
					<button
						class="card-btn card-btn-primary resume-btn"
						onclick={() => oncontinue(game)}
						aria-label={['Continue', ...saveParts].join(', ')}
						aria-describedby={titleId}
					>
						<span class="btn-label">Continue</span>
						{#if saveParts.length}
							<span class="btn-detail">· {saveParts.join(' · ')}</span>
						{/if}
					</button>
					<div class="secondary-actions">
						<button
							class="card-btn card-btn-secondary new-game-btn"
							onclick={() => onnewgame(game)}
							aria-describedby={titleId}
						>
							New game
						</button>
						<button
							class="text-link delete-btn"
							onclick={() => ondeletesave(game)}
							aria-describedby={titleId}
						>
							Delete save
						</button>
					</div>
				{:else}
					<button
						class="card-btn card-btn-primary start-btn"
						onclick={() => onplay(game)}
						aria-describedby={titleId}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="none"
							aria-hidden="true"
						>
							<polygon points="6 4 20 12 6 20 6 4"></polygon>
						</svg>
						<span class="btn-label">Play</span>
					</button>
				{/if}
			</div>
		</div>
	</div>

	{#if game.isCustom}
		<button
			class="remove-custom-btn"
			onclick={() => onremove(game)}
			title="Remove custom game"
			aria-label="Remove custom game"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	{/if}
</article>

<style>
	/*
	 * Line cards up with subgrid: each card spans five rows of the page grid (art, title,
	 * subtitle, meta, actions), so a row is as tall as its tallest card and every subtitle and
	 * button sits on the same line, whatever the title length. Without subgrid support the
	 * cards simply stack their parts.
	 */
	.game-card-wrapper {
		position: relative;
		display: grid;
		grid-row: span 5;
		grid-template-rows: subgrid;
		row-gap: 0;
		min-width: 0;
	}

	.game-card {
		grid-row: 1 / -1;
		display: grid;
		grid-template-rows: subgrid;
		row-gap: 0;
		min-width: 0;
		background: linear-gradient(160deg, rgba(10, 14, 26, 0.82), rgba(14, 12, 28, 0.74));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: none;
		animation: card-in 250ms ease-out both;

		--aug-border-all: 2px;
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;
	}

	@keyframes card-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Rotating frame gradients (one per card, five variants) */
	.game-card-1 {
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
	}
	.game-card-2 {
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
	}
	.game-card-3 {
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
	}
	.game-card-4 {
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-brand-yellow));
	}
	.game-card-5 {
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
	}

	/* 16:9 key-art band, full bleed under the clipped frame */
	.key-art {
		grid-row: 1;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
		background: #05070d;
	}

	.card-body {
		grid-row: 2 / -1;
		display: grid;
		grid-template-rows: subgrid;
		row-gap: var(--space-sm);
		padding: var(--space-lg);
	}

	/* Display face at 28px */
	.game-card-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-wrap: balance;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
	}

	.game-subtitle {
		margin: 0;
		font-family: var(--font-body);
		font-size: 1rem;
		line-height: 1.5;
		color: #d5dfeb;
	}

	.game-meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #9fb3c8;
	}

	.custom-badge {
		padding: 2px 8px;
		border: 1px solid var(--color-cyber-magenta);
		border-radius: 3px;
		font-family: var(--font-body);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: #f0abfc;
	}

	/* Actions sit at the bottom of their row */
	.card-actions {
		align-self: end;
		padding-top: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.card-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 2px 6px;
		min-height: 48px;
		padding: 8px var(--space-lg);
		border-radius: 4px;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			transform 120ms ease-out,
			background-color 120ms ease-out,
			border-color 120ms ease-out,
			opacity 120ms ease-out;
	}

	.card-btn-primary {
		width: 100%;
		background: linear-gradient(135deg, #831d98, #6d22c7);
		border: 1px solid var(--color-cyber-magenta);
		color: var(--color-brand-yellow);
	}

	.card-btn-primary:hover {
		transform: translateY(-1px);
		opacity: 0.94;
	}

	.btn-detail {
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: none;
		color: #fde68a;
	}

	.secondary-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
	}

	.card-btn-secondary {
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.55);
		color: var(--color-neon-cyan);
	}

	.card-btn-secondary:hover {
		background: rgba(0, 255, 255, 0.1);
		border-color: var(--color-neon-cyan);
	}

	.text-link {
		min-height: 44px;
		padding: 0 var(--space-xs);
		background: none;
		border: none;
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 500;
		color: #ff8fa3;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.text-link:hover {
		color: var(--color-danger);
	}

	.card-btn:focus-visible,
	.text-link:focus-visible,
	.remove-custom-btn:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}

	.remove-custom-btn {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		padding: 0;
		background: rgba(5, 7, 13, 0.82);
		border: 1px solid rgba(255, 77, 109, 0.7);
		border-radius: 50%;
		color: #ff8fa3;
		cursor: pointer;
		transition: background-color 120ms ease-out;
	}

	.remove-custom-btn:hover {
		background: rgba(255, 77, 109, 0.2);
	}

	@media (max-width: 600px) {
		.key-art {
			aspect-ratio: 2 / 1;
		}

		.card-body {
			padding: var(--space-md) var(--space-md) var(--space-lg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.game-card {
			animation: none;
		}

		.card-btn,
		.remove-custom-btn {
			transition: none;
		}

		.card-btn-primary:hover {
			transform: none;
		}
	}
</style>
