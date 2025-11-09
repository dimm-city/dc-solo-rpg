<script>
	import CardDeck from './CardDeck.svelte';
	import { confirmCard, drawCard, gameStore } from '../stores/WAAStore.js';

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
		card={$gameStore.currentCard}
		on:requestcard={onRequestCard}
		on:confirmcard={onConfirmCardDeck}
	/>
</div>

<style>
	.dc-draw-card-container {
		display: grid;
		height: 100%;
		width: 100%;
		justify-content: center;
		align-content: center;
		text-align: center;
		background: var(--color-bg-darker, #000);
	}

	@media (max-width: 450px) or (max-height: 600px) {
		.dc-draw-card-container {
			align-content: start;
			padding-top: 0.5rem;
		}
	}
</style>
