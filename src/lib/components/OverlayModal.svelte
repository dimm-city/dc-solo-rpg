<script>
	/**
	 * OverlayModal - Dialog with layered fog effect
	 */
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let {
		children,
		isVisible = true,
		zIndex = 50,
		fixedHeight = null, // Optional fixed height (e.g., "70dvh")
		animateHeight = false // Whether to animate height from 40dvh to 70dvh
	} = $props();

	let modalHeight = $derived(fixedHeight ?? (animateHeight ? '70dvh' : null));

	/**
	 * Cloud fog transition for modal backdrop
	 * Speed: 200ms (mechanical/ethereal aesthetic)
	 * Easing: cubicOut for natural deceleration on entry, cubicIn for acceleration on exit
	 * Effect: Fades in/out fog with subtle scale (0.95 to 1.0)
	 */
	function cloudFogTransition(node, { delay = 0, duration = ANIMATION_DURATION.NORMAL }) {
		return {
			delay,
			duration,
			tick: (t) => {
				// Use cubicOut for smoother easing (matches the scale transition)
				const eased = cubicOut(t);
				const scale = 0.95 + eased * 0.05; // Subtle scale from 0.95 to 1.0

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
	<!-- Animation: Fades in/out simultaneously with modal at 200ms -->
	<div
		class="fog-overlay"
		style="z-index: {zIndex - 1};"
		in:cloudFogTransition={{ duration: ANIMATION_DURATION.NORMAL, delay: 0 }}
		out:cloudFogTransition={{ duration: ANIMATION_DURATION.NORMAL, delay: 0 }}
	>
		<div class="cloud back"></div>
		<div class="cloud mid"></div>
		<div class="cloud front"></div>
	</div>

	<!-- Modal content wrapper -->
	<!-- Animation: Fades in/out with scale (0.95 to 1.0) simultaneously with fog at 200ms -->
	<!-- Entry: ease-out for deceleration, Exit: ease-in for acceleration (modal pattern) -->
	<div
		class="modal-wrapper"
		style="z-index: {zIndex};"
		style:height={modalHeight}
		data-augmented-ui="tl-clip tr-clip br-clip bl-clip"
		in:scale={{
			duration: ANIMATION_DURATION.NORMAL,
			delay: 0,
			start: 0.95,
			opacity: 0,
			easing: cubicOut
		}}
		out:scale={{
			duration: ANIMATION_DURATION.NORMAL,
			delay: 0,
			start: 0.95,
			opacity: 0,
			easing: cubicOut
		}}
	>
		{@render children()}
	</div>
{/if}

<style>
	.modal-wrapper {
		display: flex;
		justify-content: center;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;

			width: 100%;
		max-width: min(90vw, 1200px);
		height: calc(100vh - 60px - var(--space-lg) * 2);

		/* Scrollable content within modal */
		overflow-y: auto;
		overflow-x: hidden;

		/* Better scrolling on mobile */
		-webkit-overflow-scrolling: touch;
	}

	/* Fog overlay container */
	/* CRITICAL: pointer-events: auto to capture all clicks and prevent interaction with content below */
	.fog-overlay {
		position: fixed;
		inset: 0;
		pointer-events: auto; /* CHANGED: Capture clicks to prevent clicking through to game content */
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;

		opacity: 0.75;
		backdrop-filter: blur(6px) brightness(0.8);
		-webkit-backdrop-filter: blur(6px) brightness(0.8);
		cursor: default; /* Show default cursor on backdrop */
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
	/* @media (max-width: 900px) {
		.modal-wrapper {
			max-width: 95vw;
			height: 80dvh;
		}
	} */

	@media (max-width: 800px) {
		.modal-wrapper {
		
			max-width: 100vw;
			min-height: 60dvh;
			max-height: calc(100dvh - var(--space-md) * 2);
			/* Shift modal down to avoid covering status display */
			top: calc(50% + 30px);
		}
	}

	@media (max-width: 400px) {
		.modal-wrapper {
			bottom: 0;
			position: absolute;
			height: calc(100vh - 300px);
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
