<script>
	import DiceRoller from './DiceRoller.svelte';
	import { gameStore, nextScreen, pullFromTower, confirmTowerPull } from './WAAStore.js';

	let diceRoller;
	let rolling = false;
	let pulled = false;
	let result;
	async function pull() {
		rolling = true;
		result = await pullFromTower();
		rolling = false;
		pulled = true;
	}

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'pullFromTower') {
			const result = await pullFromTower();
			await diceRoller.roll(result);
		} else {
			await confirmTowerPull();
		}
	}
</script>

<div class="dc-tower-container">
	{#if result}
		<!-- Rolled: {result} -->
		<h4>Click to continue...</h4>
		<!-- <button on:click={confirmTowerPull}>continue</button> -->
	{:else}
		<h4>Failure check</h4>
		<!-- <button on:click={pull}>pull from tower</button> -->
	{/if}

	<!-- {#if $gameStore.gameOver}
		<button on:click={() => nextScreen('finalLog')}>record final log</button>
	{:else}
		<button on:click={pull}>pull from tower</button>
	{/if} -->

	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck} />
</div>

<style>
	.dc-tower-container {
		width: 100%;
		height: 100%;
		display: grid;
		justify-content: center;
		text-align: center;
	}
</style>
