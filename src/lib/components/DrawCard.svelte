<script>
	import { confirmCard, drawCard, gameStore } from './WAAStore.js';
</script>

<div class="dc-draw-card-container">
	<h4>Draw a card</h4>
	<p>{$gameStore.currentCard?.description ?? ''}</p>
	{#if $gameStore?.currentCard != null}
		<button on:click={confirmCard}>continue</button>
	{:else}
		<button on:click={drawCard}>draw a card</button>
	{/if}
</div>

<style>
	.dc-draw-card-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
