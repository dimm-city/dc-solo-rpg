<script>

	import {
		currentState,
		recordRound,
		failurePercent,
		successPercent,
		isWaitingForDice,
		diceRollResolver
	} from './GameStore.js';

</script>

<pre>
    Round: {$currentState?.currentRound}
    Failure: {$failurePercent}
    Success: {$successPercent}
    Health: {$currentState.primaryFailureCounter}
    Success: {$currentState.successCounter}
    Available: {$currentState.availableTasks?.length}
    Current: {$currentState.currentTasks?.length}
    Completed: {$currentState.completedTasks?.length}
</pre>

<style>

</style>

