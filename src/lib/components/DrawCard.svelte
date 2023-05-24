<script>
	import CardDeck from './CardDeck.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import { confirmCard, drawCard, gameStore } from './WAAStore.js';
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
	<div class="dc-draw-card-header">
		{#if $gameStore?.currentCard != null}
			<h4>Click to continue...</h4>
			<!-- <button on:click={onConfirmCard}>continue</button> -->
		{:else}
			<h4>Draw a card</h4>
			<!-- <button on:click={onDrawCard}>draw a card</button> -->
		{/if}
	</div>
	<!-- <div class="dc-draw-card-sidebar">
		<StatusDisplay />
	</div> -->
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
	.dc-draw-card-header {
		position: absolute;
		display: grid;
		width: 100%;
	}
	.dc-draw-card-sidebar {
		position: absolute;
		display: grid;
		width: min-content;
		right: 1.5rem;
		margin-top: 1.5rem;
	}
</style>
