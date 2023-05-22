<script>
	import SuccessCounter from './SuccessCounter.svelte';
	import DiceRoller from './3DiceRoller.svelte';
	import { gameStore, startRound, successCheck } from './WAAStore.js';
	let diceRoller;
	let rolling = false;

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'successCheck') {			
			const result = await diceRoller.roll();
			await successCheck(result);
		} else {
			startRound();
		}
	}
</script>

<div class="dc-success-check-container">
	<div class="dc-success-check-header">
	{#if $gameStore.state == 'successCheck'}
		<h4>Roll for Success</h4>
	{:else}
		<h4>Click to continue...</h4>
	{/if}
		<SuccessCounter />
	</div>
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck} />
</div>

<style>
	.dc-success-check-container{
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
	}
	.dc-success-check-header {
		--dc-success-counter-grid-flow: column;
	}
</style>