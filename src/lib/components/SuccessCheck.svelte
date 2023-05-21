<script>
	import DiceRoller from './DiceRoller.svelte';
	import { gameStore, startRound, successCheck } from './WAAStore.js';
	let diceRoller;
	let rolling = false;

	async function doCheck() {
		if (rolling) return;
		if ($gameStore.state == 'successCheck') {
			const result = await successCheck();
			await diceRoller.roll(result);
		} else {
			startRound();
		}
	}
</script>

<div class="dc-success-check-container">
	<h4>Roll for Success</h4>
	<!-- {#if $gameStore.state == 'successCheck'}
		<button on:click={doCheck}>successCheck</button>
	{:else}
		<button on:click={startRound}>startRound</button>
	{/if} -->
	<DiceRoller bind:this={diceRoller} bind:rolling on:click={doCheck} on:keyup={doCheck} />
</div>
