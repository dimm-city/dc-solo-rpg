<script>
	/**
	 * StartRoundController - "Begin Round N" step
	 *
	 * Gives the round start a visible button in the same slot as every other step.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';
	import StepAction from './StepAction.svelte';

	let { onbegin } = $props();
</script>

<div class="step-screen">
	<StepAction text="Begin Round {gameState.round}" onclick={onbegin} testid="start-round-button" />
</div>

<style>
	.step-screen {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: end;
		text-align: center;
	}
</style>
