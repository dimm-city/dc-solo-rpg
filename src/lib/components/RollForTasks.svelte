<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';

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

	$:header = rolled ? "Click to continue" : "Roll for tasks";
</script>

<div class="dc-roll-tasks-container">
	<DiceRoller bind:this={taskDice} bind:rolling on:click={action} on:keyup={action} {header}>
		
	</DiceRoller>
</div>

<style>
	.dc-roll-tasks-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}
</style>
