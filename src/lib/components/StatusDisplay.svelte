<script>
	import { gameStore } from "./WAAStore.js";
	import FailureCounter from './FailureCounter.svelte';
	import SuccessCounter from './SuccessCounter.svelte';
</script>

<div class="status-display-container">
	<h4>Round: {$gameStore?.round}</h4>
	<h5>Cards Remaining: {$gameStore.cardsToDraw} ({$gameStore.deck?.length})</h5>
	<FailureCounter />
	<SuccessCounter  />
</div>

<style>
    h4, h5{
        margin-block: var(--dc-header-block-margin);
    }
	.status-display-container {		
        text-align: center;
	}
</style>
