<script>
	import { selectedGame, currentState, nextRound } from './GameStore.js';
	import Shell from './Shell.svelte';
	import StartScreen from './StartScreen.svelte';

</script>

<Shell title={$selectedGame?.title ?? "Please select a game" }>
	<StartScreen />
  <button on:click={nextRound}>next</button>
	<pre>
  Round: {$currentState?.currentRound}
  Health: {$currentState.primaryFailureCounter}
  
  Available: {$currentState.availableTasks?.length}
  Current: {$currentState.currentTasks?.length}
  Completed: {$currentState.completedTasks?.length}
  
  </pre>
  {#each $currentState.currentTasks as task (task.id)}
     <p>{task.title}</p>
  {:else}
     <p>No tasks this round</p>
  {/each}
  
  <div>
    {JSON.stringify($currentState)}
  </div>
</Shell>
