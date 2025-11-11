<script>
	import { rollDice } from '../stores/diceStore.svelte.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { confirmTaskRoll, rollForTasks } from '../stores/gameActions.svelte.js';
	import { logger } from '../utils/logger.js';
	import ContinueButton from './ContinueButton.svelte';

	let rolled = $state(false);
	let rolling = $state(false);
	let confirming = $state(false);

	// Reset state when entering rollForTasks screen
	$effect(() => {
		if (gameState.state === 'rollForTasks') {
			rolled = false;
			rolling = false;
			confirming = false;
		}
	});

	async function rollTaskDice() {
		logger.debug('[RollForTasks.rollTaskDice] Called, rolling:', rolling, 'rolled:', rolled);
		if (rolling || confirming) return;
		rolling = true;

		const result = await rollForTasks();
		await rollDice(result);

		rolling = false;
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
			? (gameState.config?.labels?.rollForTasksResultHeader ?? 'Result')
			: (gameState.config?.labels?.rollForTasksHeader ?? 'Roll for Tasks')
	);
</script>

<div class="dc-roll-tasks-container">
	<div class="dc-dice-roller-header dc-header">
		<ContinueButton
			text={header}
			onclick={action}
			disabled={rolling || confirming}
			testid="roll-tasks-button"
		/>
	</div>
</div>

<style>
	.dc-roll-tasks-container {
		width: 100%;
		height: 100%;
		display: grid;
		text-align: center;
		align-items: center;
		justify-content: center;
	}
</style>
