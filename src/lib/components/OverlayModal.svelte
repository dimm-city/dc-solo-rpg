<script>
	/**
	 * OverlayModal - Dialog with layered fog effect
	 */
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let {
		children,
		isVisible = true,
		zIndex = 50,
		fixedHeight = null, // Optional fixed height (e.g., "70dvh")
		animateHeight = false // Whether to animate height from 40dvh to 70dvh
	} = $props();

	let modalHeight = $derived(fixedHeight ?? (animateHeight ? '70dvh' : null));

	function cloudFogTransition(node, { delay = 0, duration = 800 }) {
		return {
			delay,
			duration,
			tick: (t) => {
				const eased = cubicOut(t);
				const scale = 0.5 + eased * 0.5; // Scale from 0.5 to 1.0

				const clouds = node.querySelectorAll('.cloud');
				clouds.forEach((cloud) => {
					cloud.style.transform = `translate(-50%, -50%) scale(${scale})`;
				});

				node.style.opacity = `${eased}`;
			}
		};
	}
</script>

<!-- SVG filters for realistic fog clouds -->
<svg width="0" height="0" aria-hidden="true" style="position: absolute;">
	<defs>
		<!-- Back layer: subtle turbulence with soft edges -->
		<filter id="fog-filter-back" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.006"
				numOctaves="4"
				seed="5"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale="160"
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>
		<!-- Middle layer: moderate turbulence -->
		<filter id="fog-filter-mid" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.009"
				numOctaves="4"
				seed="7"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale="120"
				xChannelSelector="G"
				yChannelSelector="B"
			/>
		</filter>
		<!-- Front layer: sharper details, closer to viewer -->
		<filter id="fog-filter-front" x="-20%" y="-20%" width="140%" height="140%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.013"
				numOctaves="3"
				seed="11"
				result="noise"
			/>
			<feDisplacementMap
				in="SourceGraphic"
				in2="noise"
				scale="90"
				xChannelSelector="B"
				yChannelSelector="R"
			/>
		</filter>
	</defs>
</svg>

{#if isVisible}
	<!-- Fog overlay with layered clouds -->
	<div
		class="fog-overlay"
		style="z-index: {zIndex - 1};"
		in:cloudFogTransition={{ duration: 800, delay: 0 }}
		out:cloudFogTransition={{ duration: 800, delay: 600 }}
	>
		<div class="cloud back"></div>
		<div class="cloud mid"></div>
		<div class="cloud front"></div>
	</div>

	<div
		class="modal-wrapper"
		style="z-index: {zIndex};"
		style:height={modalHeight}
		data-augmented-ui="tl-clip tr-clip br-clip bl-clip"
		in:fade={{ duration: 600, delay: 800 }}
		out:fade={{ duration: 600, delay: 0 }}
	>
		{@render children()}
	</div>
{/if}

<style>
	.modal-wrapper {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;

		width: stretch;
		max-width: min(90vw, 1200px);
		height: calc(100vh - 60px - var(--space-lg) * 2);

		/* Scrollable content within modal */
		overflow-y: auto;
		overflow-x: hidden;

		/* Better scrolling on mobile */
		-webkit-overflow-scrolling: touch;
	}

	/* Fog overlay container */
	.fog-overlay {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;

		backdrop-filter: blur(6px) brightness(0.8);
		-webkit-backdrop-filter: blur(6px) brightness(0.8);
	}

	/* Cloud layers for realistic fog */
	.fog-overlay .cloud {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(1);
		border-radius: 50%;
		opacity: 1;
	}

	/* Back layer: large, faint cloud - cyberpunk dark blue */
	.fog-overlay .cloud.back {
		width: 220vw;
		height: 200vh;
		background: rgba(8, 20, 40, 0.3);
		box-shadow:
			0 0 300px 150px rgba(8, 20, 40, 0.5),
			0 0 600px 300px rgba(8, 20, 40, 0.3);
		filter: url(#fog-filter-back);
		opacity: 0.25;
	}

	/* Middle layer: medium cloud - purple tint */
	.fog-overlay .cloud.mid {
		width: 180vw;
		height: 160vh;
		background: rgba(20, 10, 30, 0.35);
		box-shadow:
			0 0 250px 120px rgba(20, 10, 30, 0.6),
			0 0 500px 240px rgba(20, 10, 30, 0.4);
		filter: url(#fog-filter-mid);
		opacity: 0.4;
	}

	/* Front layer: bright cloud closest to viewer - cyan accent */
	.fog-overlay .cloud.front {
		width: 140vw;
		height: 120vh;
		background: rgba(0, 40, 60, 0.4);
		box-shadow:
			0 0 200px 100px rgba(0, 80, 120, 0.7),
			0 0 400px 200px rgba(0, 60, 90, 0.5);
		filter: url(#fog-filter-front);
		opacity: 0.55;
	}

	@media (max-width: 768px) {
		.fog-overlay .cloud.back {
			width: 250vw;
			height: 220vh;
		}

		.fog-overlay .cloud.mid {
			width: 200vw;
			height: 180vh;
		}

		.fog-overlay .cloud.front {
			width: 160vw;
			height: 140vh;
		}
	}

	/* Improved responsive behavior */
	@media (max-width: 900px) {
		.modal-wrapper {
			max-width: 95vw;
			height: 80dvh;
		}
	}

	@media (max-width: 600px) {
		.modal-wrapper {
			width: 100%;
			max-width: 100vw;
			min-height: 60dvh;
			height: 85dvh;
			max-height: calc(100dvh - var(--space-md) * 2);
		}
	}

	@media (max-width: 400px) {
		.modal-wrapper {
			height: 90dvh;
			max-height: calc(100dvh - var(--space-sm) * 2);
		}
	}

	/* Landscape mobile optimization */
	@media (max-height: 600px) and (orientation: landscape) {
		.modal-wrapper {
			height: 95dvh;
			max-height: calc(100dvh - var(--space-sm));
		}
	}
</style>
