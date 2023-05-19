<script>
	import DiceRoller from './DiceRoller.svelte';
	import { gameStore, startRound, successCheck } from './WAAStore.js';
	let diceRoller;
	let rolling = false;

	async function doCheck() {
		if (rolling) return;
		const result = await successCheck();
		await diceRoller.roll(result);
	}
</script>

<div class="dc-fade-in">
	{#if $gameStore.state == 'successCheck'}
		<button on:click={doCheck}>successCheck</button>
	{:else}
		<button on:click={startRound}>startRound</button>
	{/if}
	<DiceRoller bind:this={diceRoller} bind:rolling />
</div>
