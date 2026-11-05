<script>
	/**
	 * RollForTasksController - Roll for Tasks screen controller
	 *
	 * Manages the Roll for Tasks screen using the useRollForTasks composable.
	 * Handles button state, dice rolling, and auto-play integration.
	 *
	 * @component
	 */

	import ContinueButton from '../ContinueButton.svelte';
	import ButtonBar from '../ButtonBar.svelte';

	// rollForTasks: the useRollForTasks() instance owned by GameScreen, shared with its
	// table-tap and auto-play handlers so they all see the same roll state
	let { rollForTasks, triggerAutoPlay = null } = $props();

	// Handle button click
	async function handleClick() {
		await rollForTasks.handleRollForTasks(triggerAutoPlay);
	}
</script>

<div class="roll-for-tasks-screen">
	<ButtonBar>
		<ContinueButton
			text={rollForTasks.buttonText}
			onclick={handleClick}
			disabled={rollForTasks.buttonDisabled}
			testid="roll-tasks-button"
		/>
	</ButtonBar>
</div>

<style>
	.roll-for-tasks-screen {
		width: 100%;
		height: 100%;
		display: grid;
		align-items: end;
		text-align: center;
	}
</style>
