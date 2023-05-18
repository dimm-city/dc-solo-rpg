<script>
	import { currentState } from './GameStore.js';

</script>

<div class="task-container">
	{#each $currentState.currentTasks as task (task.id)}
		<p>{task.title}</p>
	{:else}
		<p>No tasks this round</p>
	{/each}
</div>

<style>
	.task-container {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}
</style>
