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
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck}>
		<div class="dc-success-check-header dc-header-container">
			{#if $gameStore.state == 'successCheck'}
				<h4>Roll for Success</h4>
			{:else}
				<h4>Click to continue...</h4>
			{/if}
			<SuccessCounter />
		</div>
	</DiceRoller>
</div>

<style>
	.dc-success-check-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
	}
	.dc-success-check-header {
		justify-self: center;
		--dc-success-counter-grid-flow: column;
	}
</style>
