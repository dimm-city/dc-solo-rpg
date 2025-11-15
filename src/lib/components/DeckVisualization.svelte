<script>
	import { gameState } from '$lib/stores/gameStore.svelte.js';

	const cardsRemaining = $derived(gameState.deck?.length || 0);
	const cardsDrawn = $derived(52 - cardsRemaining);
	const deckHeight = $derived(Math.min((cardsRemaining / 52) * 52, 52)); // Max height 200px
	const visibleLayers = $derived(Math.min(Math.ceil(cardsRemaining / 5), 10)); // Show up to 10 layers
</script>

{#if cardsRemaining > 0}
	<div class="deck-container" title="{cardsRemaining} cards remaining">
		<div class="deck-stack" style="height: {deckHeight}px">
			{#each Array(visibleLayers) as _, i}
				<div
					class="card-layer"
					style="top: {i * 3}px; opacity: {1 - i * 0.08}; z-index: {visibleLayers - i}"
				></div>
			{/each}
		</div>
		<div class="deck-label">
			<span class="count">{cardsRemaining}</span>
			<!-- <span class="text">cards left</span> -->
		</div>
	</div>
{:else}
	<div class="deck-container empty" title="Deck exhausted">
		<div class="deck-empty">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" x2="6" y1="6" y2="18" />
				<line x1="6" x2="18" y1="6" y2="18" />
			</svg>
		</div>
		<div class="deck-label">
			<span class="text">Deck Complete</span>
		</div>
	</div>
{/if}

<style>
	.deck-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		min-width: 100px;
		position: relative;
	}

	.deck-stack {
		position: relative;
		width: 80px;
		transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 20px;
		display: flex;
		align-items: flex-end;
	}

	.card-layer {
		position: absolute;
		width: 100%;
		height: 24px;
		background: linear-gradient(135deg, rgba(30, 58, 138, 0.9), rgba(30, 64, 175, 0.8));
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		box-shadow:
			0 2px 6px rgba(0, 0, 0, 0.4),
			0 0 10px rgba(0, 255, 255, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
		transition:
			opacity 0.3s ease,
			top 0.3s ease;
	}

	.deck-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		font-family: 'lixdu', 'Courier New', monospace;
		text-align: center;
		position: absolute;
		z-index: 10;
	}

	.count {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow:
			0 0 10px rgba(0, 255, 255, 1),
			0 0 20px rgba(0, 255, 255, 0.6);
		font-variant-numeric: tabular-nums;
	}

	.text {
		font-size: 0.5rem;
		font-family: 'Orbitron', sans-serif;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.deck-empty {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(20, 20, 30, 0.5), rgba(15, 15, 25, 0.4));
		border: 2px dashed rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.3);
	}

	.deck-container.empty .deck-label {
		opacity: 0.5;
	}

	@media (max-width: 768px) {
		.deck-stack {
			width: 60px;
		}

		.card-layer {
			height: 20px;
		}

		.count {
			font-size: 1.25rem;
		}

		.text {
			font-size: 0.7rem;
		}

		.deck-empty {
			width: 60px;
			height: 60px;
		}

		.deck-empty svg {
			width: 24px;
			height: 24px;
		}
	}

	@media (max-width: 450px) {
		.deck-stack {
			width: 50px;
		}

		.card-layer {
			height: 18px;
		}

		.count {
			font-size: 1.125rem;
		}

		.text {
			font-size: 0.65rem;
		}

		.deck-empty {
			width: 50px;
			height: 50px;
		}

		.deck-empty svg {
			width: 20px;
			height: 20px;
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.deck-stack,
		.card-layer {
			transition: none !important;
		}
	}
</style>
