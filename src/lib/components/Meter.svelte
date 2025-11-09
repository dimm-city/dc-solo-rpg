<script>
	export let text = '0';
	export let enableIndicator = false;
	export let indicator = 'high';
	export let result = 0;
	export let meterType = 'default'; // 'failure', 'bonus', 'success', or 'default'

	let currentValue = 0;
	let isChanging = false;

	/**
	 * Reactive statement for value changes with dematerialize/materialize animation
	 */
	$: {
		if (currentValue != result) {
			// Dematerialize phase
			isChanging = true;
			text = '';
			currentValue = result;

			setTimeout(() => {
				// Update indicator if enabled
				if (enableIndicator) {
					indicator = currentValue > 66 ? 'high' : currentValue > 33 ? 'med' : 'low';
				}
				// Materialize phase
				text = result;
				isChanging = false;
			}, 200);
		}
	}

	/**
	 * Get color class based on meter type
	 */
	function getMeterColorClass() {
		if (meterType === 'failure') return 'meter-failure';
		if (meterType === 'bonus') return 'meter-bonus';
		if (meterType === 'success') return 'meter-success';
		return 'meter-default';
	}
</script>

<div class="meter-container">
	<div class="meter {getMeterColorClass()}">
		<svg width="100%" height="100%" viewBox="0 0 100 100" class="meter-svg">
			<!-- Neural scan line and holographic gradients -->
			<defs>
				<linearGradient id="scan-gradient-{meterType}" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style="stop-color:#00ffff;stop-opacity:0" />
					<stop offset="50%" style="stop-color:#00ffff;stop-opacity:0.5" />
					<stop offset="100%" style="stop-color:#00ffff;stop-opacity:0" />
				</linearGradient>

				<linearGradient id="holographic-gradient-{meterType}" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" style="stop-color:rgba(255,255,255,0)" />
					<stop offset="50%" style="stop-color:rgba(255,255,255,0.2)" />
					<stop offset="100%" style="stop-color:rgba(255,255,255,0)" />
				</linearGradient>
			</defs>

			<!-- Main hexagon border with neon glow -->
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				class="meter-stroke neural-border"
			/>

			<!-- Hexagon fill -->
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				class="meter-fill {indicator}"
			/>

			<!-- Scan line overlay -->
			<rect
				class="scan-line"
				x="5"
				y="0"
				width="90"
				height="15"
				fill="url(#scan-gradient-{meterType})"
			/>

			<!-- Holographic sheen overlay -->
			<rect
				class="holographic-sheen"
				x="-100"
				y="0"
				width="50"
				height="100"
				fill="url(#holographic-gradient-{meterType})"
				opacity="0.3"
			/>
		</svg>

		{#if text}
			<span
				class="meter-score dc-fade-in"
				class:materializing={!isChanging}
				class:dematerializing={isChanging}
			>
				{text ?? '0'}
			</span>
		{/if}
	</div>
</div>

<style>
	:root {
		/* Failure meter - Red/Magenta tones */
		--meter-failure-color: #ff0066;
		--meter-failure-glow: rgba(255, 0, 102, 0.6);

		/* Bonus meter - Cyan tones */
		--meter-bonus-color: #00ffff;
		--meter-bonus-glow: rgba(0, 255, 255, 0.6);

		/* Success meter - Green-Cyan tones */
		--meter-success-color: #00ff88;
		--meter-success-glow: rgba(0, 255, 136, 0.6);

		/* Default meter colors */
		--meter-default-color: #888888;
		--meter-default-glow: rgba(136, 136, 136, 0.5);

		/* Neural border */
		--neural-cyan: #00ffff;
	}

	/* Container */
	.meter-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.meter {
		position: relative;
		width: 50px;
		height: 50px;
	}

	/* SVG container */
	.meter-svg {
		position: relative;
		z-index: 1;
	}

	/* Neural border with glow based on meter type */
	.meter-stroke.neural-border {
		fill: none;
		stroke-width: 2;
		transition: all 0.4s ease-out;
	}

	/* Meter type specific border colors */
	.meter-failure .meter-stroke.neural-border {
		stroke: var(--meter-failure-color);
		filter: drop-shadow(0 0 3px var(--meter-failure-glow));
	}

	.meter-bonus .meter-stroke.neural-border {
		stroke: var(--meter-bonus-color);
		filter: drop-shadow(0 0 3px var(--meter-bonus-glow));
	}

	.meter-success .meter-stroke.neural-border {
		stroke: var(--meter-success-color);
		filter: drop-shadow(0 0 3px var(--meter-success-glow));
	}

	.meter-default .meter-stroke.neural-border {
		stroke: var(--neural-cyan);
		filter: drop-shadow(0 0 3px rgba(0, 255, 255, 0.5));
	}

	/* Fill colors based on meter type */
	.meter-fill {
		transition: fill 0.4s ease-out, filter 0.4s ease-out;
	}

	/* Failure meter fill */
	.meter-failure .meter-fill {
		fill: var(--meter-failure-color);
		filter: drop-shadow(0 0 2px var(--meter-failure-glow));
	}

	/* Bonus meter fill */
	.meter-bonus .meter-fill {
		fill: var(--meter-bonus-color);
		filter: drop-shadow(0 0 2px var(--meter-bonus-glow));
	}

	/* Success meter fill */
	.meter-success .meter-fill {
		fill: var(--meter-success-color);
		filter: drop-shadow(0 0 2px var(--meter-success-glow));
	}

	/* Default meter fill (if indicator is used) */
	.meter-default .meter-fill.high {
		fill: #00ff00;
		filter: drop-shadow(0 0 2px rgba(0, 255, 0, 0.5));
	}

	.meter-default .meter-fill.med {
		fill: #ff9900;
		filter: drop-shadow(0 0 2px rgba(255, 153, 0, 0.5));
	}

	.meter-default .meter-fill.low {
		fill: #ff0000;
		filter: drop-shadow(0 0 2px rgba(255, 0, 0, 0.5));
	}

	/* Scan line animation */
	.scan-line {
		animation: scan-sweep 2s ease-in-out infinite;
		opacity: 0.6;
		pointer-events: none;
	}

	@keyframes scan-sweep {
		0% {
			y: 0;
			opacity: 0;
		}
		50% {
			opacity: 0.6;
		}
		100% {
			y: 85;
			opacity: 0;
		}
	}

	/* Holographic sheen animation */
	.holographic-sheen {
		animation: holographic-sweep 3s ease-in-out infinite;
		pointer-events: none;
		mix-blend-mode: overlay;
	}

	@keyframes holographic-sweep {
		0% {
			x: -100;
		}
		100% {
			x: 150;
		}
	}

	/* Meter score text */
	.meter-score {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 1.1em;
		font-weight: bold;
		color: white;
		text-shadow: 0 0 8px rgba(0, 0, 0, 0.9),
		             2px 2px 4px rgba(0, 0, 0, 0.8);
		z-index: 2;
		pointer-events: none;
	}

	/* Dematerialize animation */
	.meter-score.dematerializing {
		animation: dematerialize 200ms ease-out forwards;
	}

	/* Materialize animation */
	.meter-score.materializing {
		animation: materialize 300ms ease-out forwards;
	}

	@keyframes dematerialize {
		0% {
			transform: translate(-50%, -50%) scale(1);
			filter: blur(0px);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -50%) scale(0.8);
			filter: blur(5px);
			opacity: 0;
		}
	}

	@keyframes materialize {
		0% {
			transform: translate(-50%, -50%) scale(1.2);
			filter: blur(8px);
			opacity: 0;
		}
		100% {
			transform: translate(-50%, -50%) scale(1);
			filter: blur(0px);
			opacity: 1;
		}
	}

	/* Color-coded text glow based on meter type */
	.meter-failure .meter-score {
		text-shadow: 0 0 8px var(--meter-failure-glow),
		             0 0 12px var(--meter-failure-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.9);
	}

	.meter-bonus .meter-score {
		text-shadow: 0 0 8px var(--meter-bonus-glow),
		             0 0 12px var(--meter-bonus-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.9);
	}

	.meter-success .meter-score {
		text-shadow: 0 0 8px var(--meter-success-glow),
		             0 0 12px var(--meter-success-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.9);
	}

	/* Responsive sizing */
	@media (max-width: 768px) {
		.meter {
			width: 45px;
			height: 45px;
		}

		.meter-score {
			font-size: 1em;
		}

		/* Reduce intensity on tablet (80%) */
		.scan-line,
		.holographic-sheen {
			opacity: 0.5;
		}
	}

	@media (max-width: 450px) {
		.meter {
			width: 40px;
			height: 40px;
		}

		.meter-score {
			font-size: 0.95em;
		}

		/* Minimal effects on mobile (60%) */
		.scan-line,
		.holographic-sheen {
			opacity: 0.35;
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.scan-line,
		.holographic-sheen {
			animation: none;
		}

		.meter-score.dematerializing {
			animation: dematerialize-reduced 200ms ease-out forwards;
		}

		.meter-score.materializing {
			animation: materialize-reduced 300ms ease-out forwards;
		}

		@keyframes dematerialize-reduced {
			0% {
				opacity: 1;
			}
			100% {
				opacity: 0;
			}
		}

		@keyframes materialize-reduced {
			0% {
				opacity: 0;
			}
			100% {
				opacity: 1;
			}
		}
	}
</style>
