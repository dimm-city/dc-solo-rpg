<script>
	import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { confirmTaskRoll, rollForTasks } from '../stores/gameActions.svelte.js';
	import { logger } from '../utils/logger.js';

	let taskDice = $state();
	let rolled = $state(false);
	let rolling = $state(false);
	let confirming = $state(false);

	async function rollTaskDice() {
		logger.debug('[RollForTasks.rollTaskDice] Called, rolling:', rolling, 'rolled:', rolled);
		if (rolling || confirming) return;
		const result = await rollForTasks();
		await taskDice.roll(result);
		rolled = true;
		logger.debug('[RollForTasks.rollTaskDice] Completed, rolled is now:', rolled);
	}

	async function confirm() {
		logger.debug(
			'[RollForTasks.confirm] Called, rolling:',
			rolling,
			'rolled:',
			rolled,
			'confirming:',
			confirming
		);
		if (rolling || confirming) return;
		confirming = true;
		// Don't reset rolled to false here - it causes rollForTasks() to be called again
		// during the transition, overwriting the cardsToDraw value
		await confirmTaskRoll();
		confirming = false;
		logger.debug('[RollForTasks.confirm] Completed, rolled is now:', rolled);
	}
	function action() {
		logger.debug('[RollForTasks.action] Called, rolled:', rolled);
		if (rolled) confirm();
		else rollTaskDice();
	}

	const header = $derived(
		rolled
			? gameState.config?.labels?.rollForTasksResultHeader ?? 'Result'
			: gameState.config?.labels?.rollForTasksHeader ?? 'Roll for Tasks'
	);
</script>

<div class="dc-roll-tasks-container">
	<DiceRoller bind:this={taskDice} bind:rolling onclick={action} onkeyup={action} {header}
	></DiceRoller>
</div>

<style>
	.dc-roll-tasks-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
	}
</style>
