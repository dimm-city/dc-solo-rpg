<script>
	import DiceRoller from './3DiceRoller.svelte';
	import { gameStore, nextScreen, pullFromTower, confirmTowerPull } from './WAAStore.js';

	let diceRoller;
	let rolling;
	let result;

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'pullFromTower') {
			result = await diceRoller.roll();
			await pullFromTower(result);
		} else {
			await confirmTowerPull();
		}
	}
</script>

<div class="dc-tower-container">
	{#if result}
		<h4>Click to continue...</h4>
	{:else}
		<h4>Failure check</h4>
	{/if}


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
