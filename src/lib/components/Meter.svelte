<script>
	import { gameStore } from '../stores/WAAStore.js';
	let health = 100;
	export let text = '0';
	export let enableIndicator = false;
	export let indicator = 'high';
	export let result = 0; //Math.floor(($gameStore.tower / 54) * 100);
	$: {
		if (health != result) {
			text = '';
			health = result;

			setTimeout(() => {
				if (enableIndicator) indicator = health > 66 ? 'high' : health > 33 ? 'med' : 'low';
				text = result;
			}, 200);
		}
	}
</script>

<div>
	<div class="health-meter">
		<svg width="100%" height="100%" viewBox="0 0 100 100">
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				class="dc-health-meter-stroke {indicator}"
			/>
			<!-- <mask id="health-mask">
				<rect class="mask-rect {indicator}" x="0" y="0" width="100" height={enableIndicator ?  100 - health : 100} />
			</mask> -->
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				
				class="dc-health-meter-bg {indicator}"
			/>
		</svg>

		<span class="health-score dc-fade-in">{text ?? '0'}</span>
	</div>
</div>

<style>
	:root {
		--dc-health-meter-high: green;
		--dc-health-meter-med: orange;
		--dc-health-meter-low: red;
		--dc-health-meter-stroke: rgba(0, 0, 0, 0.8);
	}
	.dc-health-meter-stroke {
		stroke: var(--dc-health-meter-stroke);
	}
	.high {
		fill: var(--dc-health-meter-high);
	}
	.med {
		fill: var(--dc-health-meter-med);
	}
	.low {
		fill: var(--dc-health-meter-low);
	}
	.mask-rect,
	.dc-health-meter-stroke {
		transition: all 1s ease-in;
	}

	.health-meter {
		position: relative;
		margin-top: 0.25rem;

		margin: auto;
		max-width: 50px;
	}

	.health-score {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 2em;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}
	@media (max-width: 450px) {
		small {
			display: none;
		}
		.health-score {
			font-size: 1rem;
		}
	}
</style>
