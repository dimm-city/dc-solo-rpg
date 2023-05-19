<script>
	import { gameStore, nextScreen, pullFromTower } from './WAAStore.js';

	let pulling = false;

	async function pull() {
		pulling = true;
		await pullFromTower();
		pulling = false;
	}
</script>

<div>
	<h4>Pull from Tower ({$gameStore.gameOver})</h4>
	{#if $gameStore.gameOver}
		<button on:click={() => nextScreen('finalLog')}>record final log</button>
	{:else}
		<button on:click={pull}>pull from tower</button>
	{/if}
</div>
