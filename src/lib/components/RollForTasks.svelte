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
	<!-- {:else}
		<button on:click={rollTaskDice} disabled={rolling}>roll</button>
	{/if} -->
	<h4>Roll for tasks</h4>
	<DiceRoller bind:this={taskDice} bind:rolling on:click={action} on:keyup={action} />
	{#if rolled}
		<button on:click={confirm} disabled={rolling}>continue</button>
	{/if}
</div>
