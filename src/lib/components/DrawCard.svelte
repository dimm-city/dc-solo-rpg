<script>
	import CardDeck from './CardDeck.svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { confirmCard, drawCard } from '../stores/gameActions.svelte.js';

	/**
	 * Handle card request from neural interface
	 * Triggered when user clicks "INTERCEPT FRAGMENT"
	 */
	async function onRequestCard() {
		// Draw card from game store
		await drawCard();
	}

	/**
	 * Handle card confirmation from neural interface
	 * Triggered when user clicks "CONTINUE" after seeing the card
	 */
	async function onConfirmCardDeck() {
		// Confirm in the game store and proceed
		await confirmCard();
	}
</script>

<!-- Neural Interface Container -->
<div class="dc-draw-card-container">
	<!--
		The neural interface is now completely self-contained.
		It dispatches two events:
		- 'requestcard': When user wants to draw a new card
		- 'confirmcard': When user confirms the revealed card

		Card is passed reactively from the game store
	-->
	<CardDeck
		bind:card={gameState.currentCard}
		onrequestcard={onRequestCard}
		onconfirmcard={onConfirmCardDeck}
	/>
</div>

<style>
	.dc-draw-card-container {
		display: grid;
		height: 100%;
		width: 100%;
		max-width: 100%; /* Prevent horizontal overflow */
		justify-content: center;
		align-content: center;
		text-align: center;
		background: var(--color-bg-darker, #000);
		overflow: visible; /* Allow neural interface glows to extend beyond bounds */
		box-sizing: border-box;
	}

	@media (max-width: 450px) or (max-height: 600px) {
		.dc-draw-card-container {
			align-content: start;
			padding-top: 0.5rem;
		}
	}

	/* Very small screens */
	@media (max-width: 375px) or (max-height: 500px) {
		.dc-draw-card-container {
			padding: 0.25rem;
		}
	}
</style>
