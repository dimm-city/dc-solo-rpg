<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';

	import { confirmTaskRoll, gameStore, rollForTasks } from '../stores/WAAStore.js';

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

	$:header = rolled ? $gameStore.config.labels.rollForTasksResultHeader : $gameStore.config.labels.rollForTasksHeader;
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
