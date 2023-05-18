<script>
	import FailureCounter from './FailureCounter.svelte';

	import { currentState, failurePercent, successPercent } from './GameStore.js';
	import SuccessCounter from './SuccessCounter.svelte';
</script>

<div class="status-display-container">
	<h4>Round: {$currentState?.currentRound}</h4>
	<FailureCounter failureCounter={$currentState.primaryFailureCounter} />
	<SuccessCounter successScore={$currentState.successCounter} />
</div>

<style>
    h4{
        margin-block: var(--dc-header-block-margin);
    }
	.status-display-container {		
        text-align: center;
	}
</style>
