<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
	import { gameStore, getFailureCheckRoll, applyFailureCheckResult, confirmFailureCheck } from '../stores/WAAStore.js';
	import { createEventDispatcher } from 'svelte';

	let diceRoller;
	let rolling;
	let result;

	const dispatcher = createEventDispatcher();
	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'failureCheck') {
			// Get roll result WITHOUT updating health yet
			result = getFailureCheckRoll();
			// Animate the dice
			await diceRoller.roll(result);
			// NOW apply the health consequences AFTER animation
			applyFailureCheckResult(result);
			dispatcher('dc-solo-rpg.failureCheckCompleted', $gameStore.state);
		} else {
			await confirmFailureCheck();
		}
	}

	$: header = result ? 'Click to continue' : 'Roll failure check';
</script>

<div class="dc-failure-check-container">
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck} {header} />
</div>

<style>
	.dc-failure-check-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}
</style>
