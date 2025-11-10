<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import {
		getFailureCheckRoll,
		applyFailureCheckResult,
		confirmFailureCheck
	} from '../stores/gameActions.svelte.js';

	let { onfailurecheckcompleted = () => {} } = $props();

	let diceRoller = $state();
	let rolling = $state(false);
	let result = $state();

	async function doCheck() {
		if (rolling) return;
		if (gameState.state == 'failureCheck') {
			// Get roll result WITHOUT updating health yet
			result = getFailureCheckRoll();
			// Animate the dice
			await diceRoller.roll(result);
			// NOW apply the health consequences AFTER animation
			applyFailureCheckResult(result);
			onfailurecheckcompleted(gameState.state);
		} else {
			await confirmFailureCheck();
		}
	}

	const header = $derived(result ? 'Click to continue' : 'Roll failure check');
</script>

<div class="dc-failure-check-container">
	<DiceRoller bind:this={diceRoller} bind:rolling onclick={doCheck} onkeyup={doCheck} {header} />
</div>

<style>
	.dc-failure-check-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}
</style>
