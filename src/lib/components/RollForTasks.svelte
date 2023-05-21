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
	function action() {
		if (rolled) confirm();
		else rollTaskDice();
	}
</script>

<div class="dc-roll-tasks-container">
	{#if rolled}
		<!-- <button on:click={confirm} disabled={rolling}>continue</button> -->

		<h4>Click to continue...</h4>
	{:else}
		<h4>Roll for tasks</h4>
		<!-- <button on:click={rollTaskDice} disabled={rolling}>roll</button> -->
	{/if}

	<DiceRoller bind:this={taskDice} bind:rolling on:click={action} on:keyup={action} />
</div>

<style>
	.dc-roll-tasks-container {
		height: 100%;
		display: grid;
		flex-direction: column;
		text-align: center;
	}
</style>
