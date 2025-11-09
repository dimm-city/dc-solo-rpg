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
		padding-inline: var(--dc-status-display-padding);
		padding-top: 0.5rem;

		width: 100%;
		grid-template-columns: 2fr 1fr 1fr 1fr; /* Health is 2x larger */
		grid-template-rows: 0.4fr 1.6fr;
		grid-template-areas:
			'round-area round-area round-area round-area'
			'health-area failure-area bonus-area success-area';
		gap: 0.5rem;
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
		display: grid;
		font-size: 1.1rem;
		font-weight: bold;
	}

	.failure-counters-container,
	.bonus-counters-container,
	.success-counters-container {
		display: flex;
		flex-direction: column;
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

	/* Mobile responsive layout */
	@media (max-width: 768px) {
		.status-display-container {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: auto;
			grid-template-areas:
				'round-area round-area'
				'health-area health-area'
				'failure-area bonus-area'
				'success-area success-area';
			gap: 0.75rem;
		}

		.failure-container {
			font-size: 1.2rem;
		}
	}
</style>
