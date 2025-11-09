<script>
	import { gameStore } from '../stores/WAAStore.js';
	let health = 100;
	let text = '100';
	let indicator = 'high';
	$: {
		const result = Math.floor(($gameStore.tower / 54) * 100);
		if (health != result) {
			text = '';
			health = result;

			setTimeout(() => {
				// Enhanced color progression with 4 levels
				indicator = health >= 70 ? 'high' : health >= 40 ? 'medium' : health >= 20 ? 'low' : 'critical';
				text = result;
			}, 200);
		}
	}
</script>

	<div class="health-meter">
		<svg width="100%" height="100%" viewBox="0 0 100 100">
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				class="dc-health-meter-stroke {indicator}"
			/>
			<mask id="health-mask">
				<rect class="mask-rect {indicator}" x="0" y="0" width="100" height={100 - health} />
			</mask>
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				mask="url(#health-mask)"
				class="dc-health-meter-bg"
			/>
		</svg>
		{#if text}
			<span class="health-score dc-fade-in" data-health-level={indicator}>{text}</span>
		{/if}
	</div>

<style>
	:root {
		--dc-health-meter-high: #00ff00;
		--dc-health-meter-medium: #ffd700;
		--dc-health-meter-low: #ff6b00;
		--dc-health-meter-critical: #ff0000;
		--dc-health-meter-stroke: rgba(0, 0, 0, 0.8);
	}

	.dc-health-meter-stroke {
		stroke: var(--dc-health-meter-stroke);
	}

	/* Background fill colors for health meter */
	.high {
		fill: var(--dc-health-meter-high);
	}
	.medium {
		fill: var(--dc-health-meter-medium);
	}
	.low {
		fill: var(--dc-health-meter-low);
	}
	.critical {
		fill: var(--dc-health-meter-critical);
	}

	.mask-rect,
	.dc-health-meter-stroke {
		transition: all 0.5s ease-out;
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
		transform: translate(-50%, -60%);
		font-size: 1.25em;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
		transition: all 0.5s ease-out;
	}

	/* High health: 70-100% - Green with subtle glow */
	.health-score[data-health-level="high"] {
		color: var(--dc-health-meter-high);
		text-shadow: 0 0 10px rgba(0, 255, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	/* Medium health: 40-69% - Yellow with subtle glow */
	.health-score[data-health-level="medium"] {
		color: var(--dc-health-meter-medium);
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	/* Low health: 20-39% - Orange with warning pulse */
	.health-score[data-health-level="low"] {
		color: var(--dc-health-meter-low);
		text-shadow: 0 0 10px rgba(255, 107, 0, 0.6), 2px 2px 4px rgba(0, 0, 0, 0.5);
		animation: health-warning-pulse 1.5s ease-in-out infinite;
	}

	/* Critical health: 0-19% - Red with urgent pulse */
	.health-score[data-health-level="critical"] {
		color: var(--dc-health-meter-critical);
		text-shadow: 0 0 15px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5);
		animation: health-critical-pulse 1s ease-in-out infinite;
	}

	@keyframes health-warning-pulse {
		0%, 100% {
			opacity: 1;
			transform: translate(-50%, -60%) scale(1);
		}
		50% {
			opacity: 0.7;
			transform: translate(-50%, -60%) scale(1.05);
		}
	}

	@keyframes health-critical-pulse {
		0%, 100% {
			opacity: 1;
			transform: translate(-50%, -60%) scale(1);
			filter: brightness(1);
		}
		50% {
			opacity: 0.8;
			transform: translate(-50%, -60%) scale(1.1);
			filter: brightness(1.3);
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.health-score[data-health-level="low"],
		.health-score[data-health-level="critical"] {
			animation: none;
		}
	}

	@media (max-width: 450px) {
		.health-score {
			font-size: 1rem;
		}
	}
</style>
