<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';

	import { confirmTaskRoll, gameStore, rollForTasks } from '../stores/WAAStore.js';

	let taskDice;
	let rolled = false;
	let rolling = false;
	let confirming = false;

	async function rollTaskDice() {
		console.log('[RollForTasks.rollTaskDice] Called, rolling:', rolling, 'rolled:', rolled);
		if (rolling || confirming) return;
		const result = await rollForTasks();
		await taskDice.roll(result);
		rolled = true;
		console.log('[RollForTasks.rollTaskDice] Completed, rolled is now:', rolled);
	}

	async function confirm() {
		console.log('[RollForTasks.confirm] Called, rolling:', rolling, 'rolled:', rolled, 'confirming:', confirming);
		if (rolling || confirming) return;
		confirming = true;
		// Don't reset rolled to false here - it causes rollForTasks() to be called again
		// during the transition, overwriting the cardsToDraw value
		await confirmTaskRoll();
		confirming = false;
		console.log('[RollForTasks.confirm] Completed, rolled is now:', rolled);
	}
	function action() {
		console.log('[RollForTasks.action] Called, rolled:', rolled);
		if (rolled) confirm();
		else rollTaskDice();
	}

	$:header = rolled ? $gameStore.config?.labels.rollForTasksResultHeader : $gameStore.config.labels.rollForTasksHeader;
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
