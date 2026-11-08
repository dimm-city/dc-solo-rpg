<script>
	import CardDeck from './CardDeck.svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { confirmCard, drawCard } from '../stores/gameActions.svelte.js';
	import { getRoundProgress } from './card/cardInfo.js';

	// Reference to CardDeck component
	let cardDeckRef;

	// Track animation stage so button state updates reactively
	let animationStage = $state('idle');

	// "Card 2 of 5": this round's cards drawn so far, plus the ones still to draw
	const progress = $derived(gameState.currentCard ? getRoundProgress(gameState) : null);

	async function handleRequestCard() {
		await drawCard();
	}

	async function handleConfirmCardDeck() {
		await confirmCard();
	}

	/**
	 * Expose button click handler for toolbar
	 */
	export async function handleButtonClick() {
		if (cardDeckRef) {
			await cardDeckRef.onButtonClick();
		}
	}

	/**
	 * Expose button disabled state for toolbar - derived from animation stage
	 */
	export function isButtonDisabled() {
		return animationStage !== 'idle' && animationStage !== 'revealed';
	}
</script>

<div class="dc-draw-card-container">
	<!-- The fourth King: the ending's backdrop comes up behind the card before the cut -->
	<div class="ending-backdrop" class:shown={animationStage === 'doom'} aria-hidden="true"></div>

	<p class="card-progress" data-testid="card-progress">
		{#if progress}
			<span>Round {gameState.round}</span>
			<span aria-hidden="true">·</span>
			<span>Card {progress.index} of {progress.total}</span>
		{/if}
	</p>

	<CardDeck
		bind:this={cardDeckRef}
		bind:card={gameState.currentCard}
		bind:animationStage
		onrequestcard={handleRequestCard}
		onconfirmcard={handleConfirmCardDeck}
	/>
</div>

<style>
	/* The progress line sits just above the card; the pair is centred in the stage */
	.dc-draw-card-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		min-height: 0;
		padding: var(--space-sm, 0.5rem) 0 var(--space-md, 1rem);
		overflow: visible; /* card glow extends past the card edge */
		box-sizing: border-box;
	}

	.card-progress {
		position: relative;
		z-index: 1;
		flex: none;
		display: flex;
		gap: 0.5em;
		min-height: 1.5rem;
		margin: 0 0 var(--space-sm, 0.5rem);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.5rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
		color: rgba(255, 255, 255, 0.78);
	}

	/* Same backdrop as the loss ending (GameOver), so the cut to it is seamless */
	.ending-backdrop {
		position: fixed;
		inset: 0;
		background-color: #05070a;
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.08), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(255, 42, 109, 0.1), transparent 70%);
		opacity: 0;
		pointer-events: none;
		transition: opacity 300ms ease-out;
	}

	.ending-backdrop.shown {
		opacity: 1;
	}

	@media (max-height: 500px) {
		.dc-draw-card-container {
			padding: var(--space-xs, 0.25rem) 0;
		}

		.card-progress {
			min-height: 1.25rem;
			margin-bottom: var(--space-xs, 0.25rem);
			font-size: 0.75rem;
			line-height: 1.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ending-backdrop {
			transition: none;
		}
	}
</style>
