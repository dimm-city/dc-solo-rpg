<script>
	import {
		selectedGame,
		currentState,
		nextRound,
		recordRound,
		failurePercent,
		successPercent,
		isWaitingForDice,
        diceRollResolver
	} from './GameStore.js';


	let journalText = '';

	function next() {
		recordRound({ text: journalText?.toString() });
		journalText = '';
	}

    function onDiceRoll() {
        console.log('dice rolled');
        $diceRollResolver(Math.floor(Math.random() * (6 - 2) + 1));
        $isWaitingForDice = false;
    }
</script>

{#if $currentState.currentRound == 0}
	<div>
		<h2>Intro</h2>
	</div>
	<button on:click={nextRound}>next</button>
{:else}
	<div class="game-toolbar">
		Round: {$currentState?.currentRound}
		Failure: {$failurePercent}
		Success: {$successPercent}
		Health: {$currentState.primaryFailureCounter}
		Success: {$currentState.successCounter}
		Available: {$currentState.availableTasks?.length}
		Current: {$currentState.currentTasks?.length}
		Completed: {$currentState.completedTasks?.length}
	</div>
	{#if $isWaitingForDice == true}
		<button on:click={onDiceRoll}>roll dice</button>
	{:else}
		<textarea bind:value={journalText} />
		<button on:click={next}>record</button>
		{#each $currentState.currentTasks as task (task.id)}
			<p>{task.title}</p>
		{:else}
			<p>No tasks this round</p>
		{/each}
	{/if}
{/if}

<style>
	.game-toolbar {
		display: flex;
		flex-direction: row;
	}
</style>
