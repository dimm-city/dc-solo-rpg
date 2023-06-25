<script>
	import { gameStore } from '../stores/WAAStore.js';
	import HealthMeter from './HealthMeter.svelte';

	$: successTokens = Array.from({ length: 10 }, (_, index) => index < $gameStore.tokens);
	$: bonusTokens = Array.from({ length: 4 }, (_, index) => index < $gameStore.bonus);
	$: failureTokens = Array.from({ length: 4 }, (_, index) => index < $gameStore.kingsRevealed);
</script>

<div class="status-display-container">
	<div class="round-container">
		<h4>{$gameStore.config?.labels.statusDisplayRoundText}{$gameStore?.round}</h4>
		<hr />
	</div>
	<div class="failure-container">
		<HealthMeter />
	</div>
	<div class="failure-counters-container">
		<small>{$gameStore.config?.labels?.failureCounters ?? 'Failure'}</small>
		<div class="token-wrapper">
			{#each failureTokens as token, index}
				<svg class="token" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<polygon points="50,5 95,30 95,70 50,95 5,70 5,30" class:filled={token} />
				</svg>
			{/each}
		</div>
	</div>
	<div class="bonus-counters-container">
		<small>{$gameStore.config?.labels?.bonusCounters ?? 'Bonus'}</small>
		<div class="token-wrapper">
			{#each bonusTokens as token, index}
				<svg class="token" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<polygon points="50,5 95,30 95,70 50,95 5,70 5,30" class:filled={token} />
				</svg>
			{/each}
		</div>
	</div>
	<div class="success-counters-container">
		<small>{$gameStore.config?.labels?.successCounters ?? 'Success'}</small>
		<div class="token-wrapper">
			{#each successTokens as token, index}
				<svg class="token" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
					<polygon points="50,5 95,30 95,70 50,95 5,70 5,30" class:filled={token} />
				</svg>
			{/each}
		</div>
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
		grid-template-rows: min-content repeat(4, 1fr);
		grid-template-columns: 1fr;
		grid-template-areas: 'round-area'
			'health-area'
			'failure-area'
			'bonus-area'
			'success-area';
		row-gap: 0.25rem;
		box-shadow: var(--dc-default-box-shadow);
		background-color: var(--dc-default-container-bg);
		border-radius: var(--dc-default-border-radius);
		padding: var(--dc-status-display-padding);
		z-index: 3;
		pointer-events: none;
	}
	.round-container {
		grid-area: round-area;
	}
	.failure-container {
		grid-area: health-area;
		display: grid;
		row-gap: 0.25rem;
	}

	.token {
		stroke: var(--dc-accent-color);
		stroke-width: 3;
		fill: transparent;
		transition: all 0.3s ease;
		max-width: 0.75rem;
	}

	.filled {
		fill: var(--dc-accent-color);
		transition: all 0.3s ease-in-out;
	}

	.failure-counters-container .token {
		stroke: var(--dc-failure-token-stroke);
	}
	.failure-counters-container .token .filled {
		stroke: var(--dc-failure-token-fill);
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
	.success-counters-container .token,
	.bonus-counters-container .token {
		stroke: var(--dc-success-token-stroke);
	}
	.success-counters-container .token .filled,
	.bonus-counters-container .token .filled {
		stroke: var(--dc-success-token-fill);
	}

	.token-wrapper {
		display: flex;
		flex-flow: row;
		flex-wrap: wrap;
		gap: 0.25rem;
		justify-content: center;
	}

	@media (max-width: 450px) {
		.status-display-container {
			width: 100%;
			grid-template-columns: repeat(4, 1fr);
			grid-template-rows: 0.4fr 1.6fr;
			grid-template-areas:
				'round-area round-area round-area round-area'
				'health-area failure-area bonus-area success-area';
		}
	}
</style>
