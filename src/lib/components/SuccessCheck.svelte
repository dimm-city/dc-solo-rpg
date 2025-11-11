<script>
	import { rollDice } from '../stores/diceStore.svelte.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { startRound, successCheck } from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';

	let rolling = $state(false);
	let result = $state();

	// Reset state when entering successCheck screen
	$effect(() => {
		if (gameState.state === 'successCheck') {
			result = undefined;
			rolling = false;
		}
	});

	async function doCheck() {
		if (rolling) return;
		if (gameState.state == 'successCheck' && !result) {
			rolling = true;

			// Get roll result
			const rollResult = await successCheck();
			result = rollResult;

			// Animate the dice
			await rollDice(rollResult);

			rolling = false;
		} else if (result) {
			// This branch is for when user clicks "continue" after seeing result
			await startRound();
		}
	}

	const header = $derived(result ? 'Click to continue' : 'Roll success check');
</script>

<div class="dc-success-check-container">
	<div class="dc-dice-roller-header dc-header">
		<ContinueButton
			text={header}
			onclick={doCheck}
			disabled={rolling}
			testid="success-check-button"
		/>
	</div>
</div>

<style>
	.dc-success-check-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
	}
</style>
