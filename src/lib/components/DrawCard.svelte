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
		if (animationStage === 'idle') return 'PROCEED TO NEXT BYTE';
		if (animationStage === 'anticipating' || animationStage === 'materializing')
			return 'LOADING...';
		if (animationStage === 'revealed') {
			// Determine what happens next based on the card
			const card = gameState.currentCard;
			if (card) {
				// Per Wretched & Alone SRD: A, 3, 5, 7, 9 are odd-ranked and trigger damage
				const oddRanks = ['A', '3', '5', '7', '9'];
				const isOdd = oddRanks.includes(card.card);

				if (isOdd) {
					return 'TAP CARD TO ROLL FOR DAMAGE';
				} else if (gameState.cardsToDraw > 0) {
					return 'TAP CARD TO DRAW NEXT';
				} else {
					return 'TAP CARD TO CONTINUE';
				}
			}
			return 'CONTINUE';
		}
		return 'UPLOADING...';
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
		bind:animationStage={animationStage}
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
