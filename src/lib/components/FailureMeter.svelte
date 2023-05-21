<script>
	import { gameStore } from './WAAStore.js';
	const maxCounter = 54; // 100; // Maximum failure counter value

	// Calculate the percentage of failure progress
	$: failureProgress = Math.floor(100 - ($gameStore.tower / maxCounter) * 100);

	// Determine the fill color based on the failure counter value
	$: fillColor = $gameStore.tower < 25 ? '#FF0000' : '#00FF00';
</script>

<h4>Failure Meter</h4>
<div class="progress-bar">
	<div class="fill" style="width: {failureProgress}%; background-color: {fillColor}" />
	<span>{failureProgress}%</span>
</div>

<style>
	h4 {
		margin-block: var(--dc-header-block-margin);
	}
	.progress-bar {
		position: relative;
		width: 100%;
		height: 1rem;
		background-color: #eeeeee;
		border-radius: 10px;
		overflow: hidden;
	}

	.progress-bar span {
		position: absolute;
		top: 0;
	}
	.fill {
		height: 100%;
		opacity: 1;
		transition: all 0.3s ease;
		transform-origin: bottom;
	}
</style>
