<script>
	import FailureCounter from './FailureCounter.svelte';
	import { gameConfig, gameStore } from './WAAStore.js';
	import SuccessCounter from './SuccessCounter.svelte';
	import HealthMeter from './HealthMeter.svelte';
</script>

<div class="status-display-container">
	<div>
		<h4>{$gameStore.player?.name}</h4>
		<hr />
		<h4>{gameConfig.labels.statusDisplayRoundText}{$gameStore?.round}</h4>
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
		max-width: 7rem;
		box-shadow: var(--dc-default-box-shadow); 
		background-color: var(--dc-default-container-bg);
		border-radius: var(--dc-default-border-radius);
		padding: var(--dc-status-display-padding);
		z-index: 3;
		pointer-events: none;
	}
	.failure-container {
		display: grid;
		row-gap: 0.9rem;
	}
</style>
