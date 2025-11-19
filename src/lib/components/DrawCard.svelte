<script>
	import CardDeck from './CardDeck.svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { confirmCard, drawCard } from '../stores/gameActions.svelte.js';

	// Reference to CardDeck component
	let cardDeckRef;

	// Track animation stage so button state updates reactively
	let animationStage = $state('idle');

	/**
	 * Handle card request from neural interface
	 * Triggered when user clicks "PROCEED TO NEXT BYTE"
	 */
	async function handleRequestCard() {
		// Draw card from game store
		await drawCard();
	}

	/**
	 * Handle card confirmation from neural interface
	 * Triggered when user clicks "CONTINUE" after seeing the card
	 */
	async function handleConfirmCardDeck() {
		// Confirm in the game store and proceed
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
	 * Expose button text for toolbar - derived from animation stage and card state
	 */
	export function getButtonText() {
		if (animationStage === 'idle') return 'Draw Card';
		if (animationStage === 'anticipating' || animationStage === 'materializing')
			return 'Drawing...';
		if (animationStage === 'revealed') {
			// Determine what happens next based on the card
			const card = gameState.currentCard;
			if (card) {
				// Per Wretched & Alone SRD: A, 3, 5, 7, 9 are odd-ranked and trigger damage
				const oddRanks = ['A', '3', '5', '7', '9'];
				const isOdd = oddRanks.includes(card.card);

				if (isOdd) {
					return 'Roll for Damage';
				} else if (gameState.cardsToDraw > 0) {
					return `Draw Next Card (${gameState.cardsToDraw} left)`;
				} else {
					return 'Continue';
				}
			}
			return 'Continue';
		}
		return 'Uploading...';
	}

	/**
	 * Expose button disabled state for toolbar - derived from animation stage
	 */
	export function isButtonDisabled() {
		return (
			animationStage === 'anticipating' ||
			animationStage === 'materializing' ||
			animationStage === 'dismissing'
		);
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
		Button is now in GameScreen toolbar
	-->
	<CardDeck
		bind:this={cardDeckRef}
		bind:card={gameState.currentCard}
		bind:animationStage
		onrequestcard={handleRequestCard}
		onconfirmcard={handleConfirmCardDeck}
	/>
</div>

<style>
	.dc-draw-card-container {
		display: grid;
		height: calc(100% - 75px);

		width: 100%;
		max-width: 100%; /* Prevent horizontal overflow */
		justify-content: center;
		align-content: center;
		text-align: center;
		overflow: hidden; /* Allow neural interface glows to extend beyond bounds */
		box-sizing: border-box;
	}

	@media (max-width: 450px) or (max-height: 600px) {
		.dc-draw-card-container {
			align-content: start;
			height: calc(100% - 50px);
		}
	}
</style>
