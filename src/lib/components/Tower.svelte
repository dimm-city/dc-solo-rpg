<script>
	import { gameStore, nextScreen, pullFromTower, confirmTowerPull } from './WAAStore.js';

	let pulling = false;
	let pulled = false;
let result;
	async function pull() {
		pulling = true;
		result = await pullFromTower();
		pulling = false;
		pulled = true;
	}
</script>

<div class="dc-tower-container">
	<h4>Pull from Tower</h4>
	<!-- {#if $gameStore.gameOver}
		<button on:click={() => nextScreen('finalLog')}>record final log</button>
	{:else}
		<button on:click={pull}>pull from tower</button>
	{/if} -->

	{#if result}
		Rolled: {result}
		<button on:click={confirmTowerPull}>continue</button>
	{:else}
		<button on:click={pull}>pull from tower</button>
	{/if}
</div>

<style>
	.dc-tower-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
