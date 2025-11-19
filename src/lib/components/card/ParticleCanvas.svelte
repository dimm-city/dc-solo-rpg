<script>
/**
 * ParticleCanvas - Canvas element for particle animations
 *
 * Provides a canvas element for rendering particle effects.
 * Currently minimal implementation - ready for future particle system expansion.
 *
 * This component is REUSABLE for any particle-based visual effects.
 *
 * @component
 */

import { onMount, onDestroy } from 'svelte';

let canvas = $state();
let ctx = $state();
let animationFrameId = $state();

onMount(() => {
	if (canvas) {
		ctx = canvas.getContext('2d');
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		// Handle window resize
		const handleResize = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}
});

onDestroy(() => {
	if (animationFrameId) {
		cancelAnimationFrame(animationFrameId);
	}
});
</script>

<canvas bind:this={canvas} class="particle-canvas" aria-hidden="true"></canvas>

<style>
	.particle-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		opacity: 0.6;
	}
</style>
