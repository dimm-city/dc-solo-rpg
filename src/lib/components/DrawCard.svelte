<script>
	import { confirmCard, currentScreen, drawCard, gameStore, nextScreen } from './WAAStore.js';

	let pending = true;
</script>

<div>
	<h4>Draw a card</h4>
	<p>{$gameStore.currentCard?.description ?? ""}</p>
	{#if $gameStore?.currentCard != null}
		<button on:click={confirmCard}>continue</button>
	{:else}
		<button on:click={drawCard}>draw a card</button>
	{/if}
</div>
