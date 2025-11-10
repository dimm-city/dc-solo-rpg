<script>
	import { gameStore } from '../stores/WAAStore.js';
	import HealthMeter from './HealthMeter.svelte';
	import Meter from './Meter.svelte';

	$: successPercent = (10 - $gameStore.tokens);
	$: bonusPercent = $gameStore.bonus;
	$: failurePercent = $gameStore.kingsRevealed;
</script>

<div class="status-display-container">
	<div class="round-container">
		<div>
			<h4>Player: {$gameStore.player.name}</h4>
			<h4>{$gameStore.config?.labels.statusDisplayRoundText}{$gameStore?.round}</h4>
		</div>		
		<hr />
	</div>
	<div class="failure-container">
		<small>Health</small>
		<HealthMeter />
	</div>
	<div class="failure-counters-container">
		<small>{$gameStore.config?.labels?.failureCounters ?? 'Failure'}</small>
		<Meter result={failurePercent} meterType="failure" />
	</div>
	<div class="bonus-counters-container">
		<small>{$gameStore.config?.labels?.bonusCounters ?? 'Bonus'}</small>
		<Meter result={bonusPercent} meterType="bonus" />
	</div>
	<div class="success-counters-container">
		<small>{$gameStore.config?.labels?.successCounters ?? 'Success'}</small>
		<Meter result={successPercent} meterType="success" />
	</div>
</div>

<style>
	h4 {
		margin-block: var(--dc-header-block-margin);
		margin: 0;
		white-space: nowrap;
		font-size: 0.9rem;
	}
	.status-display-container {
		text-align: center;
		display: grid;

		box-shadow: var(--dc-default-box-shadow);
		background-color: var(--dc-default-container-bg);
		border-radius: var(--dc-default-border-radius);
		padding: 0.75rem; /* Equal padding all around for meter glows */

		width: 100%;
		grid-template-columns: repeat(4, 1fr); /* Equal width columns */
		grid-template-rows: auto auto;
		grid-template-areas:
			'round-area round-area round-area round-area'
			'health-area failure-area bonus-area success-area';
		gap: 0.75rem; /* Increased gap for better spacing */
		align-items: center;
		overflow: visible; /* Allow hexagon glow effects to extend beyond bounds */
	}
	.round-container {
		grid-area: round-area;
	}
	.round-container > div {
		display: flex;
		justify-content: space-between;
	}
	.failure-container {
		grid-area: health-area;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 1.1rem;
		font-weight: bold;
		overflow: visible; /* Allow health meter glow to extend */
		min-height: 0; /* Allow shrinking */
	}

	.failure-counters-container,
	.bonus-counters-container,
	.success-counters-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: visible; /* Allow meter glows to extend beyond bounds */
		min-height: 0; /* Allow shrinking */
	}

	.failure-counters-container {
		grid-area: failure-area;
	}
	.success-counters-container {
		grid-area: success-area;
	}
	.bonus-counters-container {
		grid-area: bonus-area;
	}

	/* Tablet and smaller - 2 columns */
	@media (max-width: 900px) {
		.status-display-container {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: auto auto auto;
			grid-template-areas:
				'round-area round-area'
				'health-area failure-area'
				'bonus-area success-area';
			gap: 0.75rem;
			padding: 0.5rem;
		}
	}

	/* Small screens - single column */
	@media (max-width: 600px) {
		.status-display-container {
			grid-template-columns: 1fr;
			grid-template-rows: auto;
			grid-template-areas:
				'round-area'
				'health-area'
				'failure-area'
				'bonus-area'
				'success-area';
			gap: 0.5rem;
			padding: 0.5rem;
		}
	}
</style>
