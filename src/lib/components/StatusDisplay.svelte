<script>
	import FailureCounter from './FailureCounter.svelte';
	import { gameStore } from './WAAStore.js';
	import FailureMeter from './FailureMeter.svelte';
	import SuccessCounter from './SuccessCounter.svelte';
</script>

<div class="status-display-container">
	<div>
		<h4>Round: {$gameStore?.round}</h4>
		<!-- <h5>Cards Remaining: {$gameStore.cardsToDraw}</h5> -->
	</div>
	<div class="failure-container">
		<FailureMeter />		
		<FailureCounter />
	</div>
	<div>
		<SuccessCounter />
	</div>
</div>

<style>
	h4,
	h5 {
		margin-block: var(--dc-header-block-margin);
		white-space: nowrap;
	}
	.status-display-container {
		margin-inline: 0.25rem;
		text-align: center;
		display: grid;
	
		row-gap: 2rem;
	}
	.failure-container{
		display: grid;
		row-gap: 0.9rem;
	}
</style>
