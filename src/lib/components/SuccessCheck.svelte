<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
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

	$: header = $gameStore.state == 'successCheck' ? 'Roll success check' : 'Click to continue';
</script>

<div class="dc-success-check-container">
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck} {header}/>
</div>

<style>
	.dc-success-check-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
	}
</style>
