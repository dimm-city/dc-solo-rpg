<script>
	import DiceRoller from './DiceRoller.svelte';

	import { confirmTaskRoll, rollForTasks } from './WAAStore.js';

	let taskDice;
	let rolled = false;
	let rolling = false;
	async function rollTaskDice() {
		if (rolling) return;
		const result = await rollForTasks();
		await taskDice.roll(result);
		rolled = true;
	}
	function confirm() {
		if (rolling) return;
		rolled = false;
		confirmTaskRoll();
	}
</script>

<div>
	{#if rolled}
		<button on:click={confirm} disabled={rolling}>continue</button>
	{:else}
		<button on:click={rollTaskDice} disabled={rolling}>roll</button>
	{/if}
	<DiceRoller bind:this={taskDice} bind:rolling />
</div>
