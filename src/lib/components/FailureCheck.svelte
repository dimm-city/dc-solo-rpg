<script>
	import DiceRoller from './3DiceRoller.svelte';
	import { gameStore, failureCheck, confirmTowerPull } from './WAAStore.js';

	let diceRoller;
	let rolling;
	let result;

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'failureCheck') {
			result = await diceRoller.roll();
			await failureCheck(result);
		} else {
			await confirmTowerPull();
		}
	}
</script>

<div class="dc-tower-container">
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck}>
		<div class="dc-header dc-tower-header">
			{#if result}
				<h4>Click to continue...</h4>
			{:else}
				<h4>Failure check</h4>
			{/if}
		</div>
	</DiceRoller>
</div>

<style>
	.dc-tower-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}	
</style>
