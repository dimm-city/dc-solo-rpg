<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
	import { gameStore, failureCheck, confirmFailureCheck } from '../stores/WAAStore.js';
	import { createEventDispatcher } from 'svelte';

	let diceRoller;
	let rolling;
	let result;

	const dispatcher = createEventDispatcher();
	async function doCheck() {
		console.log('doCheck', rolling);
		if (rolling) return;
		if ($gameStore.state == 'failureCheck') {
			result = await failureCheck();
			console.log('dice rolled for failure', result);
			await diceRoller.roll(result);
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
