<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
	import {  gameStore, startRound, successCheck } from '../stores/WAAStore.js';
	let diceRoller;
	let rolling = false;

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'successCheck') {
			const result = await successCheck();
			await diceRoller.roll(result);

		} else {
			await startRound();
		}
	}

	$: header =
		$gameStore.state == 'successCheck'
			? $gameStore.config.labels.successCheckHeader
			: $gameStore.config.labels.successCheckResultHeader;
</script>

<div class="dc-success-check-container">
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck} {header} />
</div>

<style>
	.dc-success-check-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
	}
</style>
