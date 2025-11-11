<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { startRound, successCheck } from '../stores/gameActions.svelte.js';

	let diceRoller = $state();
	let rolling = $state(false);

	async function doCheck() {
		if (rolling) return;
		if (gameState.state == 'successCheck') {
			const result = await successCheck();
			await diceRoller.roll(result);
		} else {
			await startRound();
		}
	}

	const header = $derived(
		gameState.state == 'successCheck'
			? gameState.config?.labels?.successCheckHeader ?? 'Success Check'
			: gameState.config?.labels?.successCheckResultHeader ?? 'Result'
	);
</script>

<div class="dc-success-check-container">
	<DiceRoller bind:this={diceRoller} bind:rolling onclick={doCheck} onkeyup={doCheck} {header} />
</div>

<style>
	.dc-success-check-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
	}
</style>
