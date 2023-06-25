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

<div class="dc-draw-card-container">
	<div class="dc-header dc-draw-card-header">
		{#if $gameStore?.currentCard != null}
			<h4 class="dc-fade-in">Click to continue...</h4>
		{:else}
			<h4 class="dc-fade-in">Draw a card</h4>
		{/if}
	</div>
	<CardDeck bind:this={deck} on:click={onDeckClicked} />
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

</style>
