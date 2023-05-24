<script>
	import FailureCounter from './FailureCounter.svelte';
	import { gameStore } from './WAAStore.js';
	import FailureMeter from './FailureMeter.svelte';
	import SuccessCounter from './SuccessCounter.svelte';
	import HealthMeter from './HealthMeter.svelte';
</script>

<div class="status-display-container">
	<div>
		<h4>Round: {$gameStore?.round}</h4>
	</div>
	<div class="failure-container">
		<HealthMeter />
		<FailureCounter />
	</div>
	<div>
		<SuccessCounter />
	</div>
</div>

<style>
	h4 {
		margin-block: var(--dc-header-block-margin);
		white-space: nowrap;
	}
	.status-display-container {
		text-align: center;
		display: grid;
		row-gap: 2rem;
	}
	.failure-container {
		display: grid;
		row-gap: 0.9rem;
	}
</style>
