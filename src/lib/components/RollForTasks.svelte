<script>
	import DiceRoller from './3DiceRoller.svelte';

	import { confirmTaskRoll, rollForTasks } from './WAAStore.js';

	let taskDice;
	let rolled = false;
	let rolling = false;
	async function rollTaskDice() {
		if (rolling) return;
		const result = await taskDice.roll();
		await rollForTasks(result);
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
	{#if rolled}
		<!-- <button on:click={confirm} disabled={rolling}>continue</button> -->

		<h4>Click to continue...</h4>
	{:else}
		<h4>Roll for tasks</h4>
		<!-- <button on:click={rollTaskDice} disabled={rolling}>roll</button> -->
	{/if}
<div class="dc-roll-tasks-container">


	<DiceRoller bind:this={taskDice} bind:rolling on:click={action} on:keyup={action} />
</div>

<style>
	.dc-roll-tasks-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}
</style>
