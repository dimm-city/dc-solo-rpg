<script>
	import { onMount } from 'svelte';
	import { currentState, isWaitingForDice } from './GameStore.js';
	let container;
	onMount(() => {
		console.log(container);
        
	});
</script>

<div class="story-container" bind:this={container}>
	{#each $currentState.completedTasks as task (task.id)}
		<p>{task.title}</p>
	{/each}
	{#each $currentState.currentTasks as task (task.id)}
		<p>{task.title}</p>
	{:else}
		<p>No tasks this round</p>
	{/each}
</div>

<style>
	.story-container {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}
</style>
