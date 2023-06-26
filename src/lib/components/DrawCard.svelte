<script>
	import CardDeck from './CardDeck.svelte';
	import { confirmCard, drawCard, gameStore } from '../stores/WAAStore.js';
	let deck;
	async function onDrawCard() {
		await drawCard();
		deck.drawCard($gameStore.currentCard);
	}
	async function onConfirmCard() {
		deck.reset();
		await confirmCard();
	}
	async function onDeckClicked() {
		if ($gameStore?.currentCard != null) await onConfirmCard();
		else await onDrawCard();
	}
</script>

<div
	class="dc-draw-card-container"
	on:keyup={onDeckClicked}
	on:click={onDeckClicked}
	role="button"
	tabindex="0"
>
	<div class="dc-header dc-draw-card-header">
		{#if $gameStore?.currentCard != null}
			<button>Click to continue...</button>
		{:else}
			<button>Click to draw a card...</button>
		{/if}
	</div>
	<CardDeck bind:this={deck} />
</div>

<style>
	.dc-draw-card-container {
		display: grid;
		height: 100%;
		width: 100%;
		justify-content: center;
		align-content: center;
		text-align: center;
	}

	@media (max-width: 450px) or (max-height: 600px) {
		.dc-draw-card-container {
			align-content: start;
			padding-top: 0.5rem;
		}
	}
</style>
