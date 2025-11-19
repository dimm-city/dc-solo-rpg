<script>
	import { onMount, onDestroy } from 'svelte';

	// 'idle', 'anticipating', 'materializing', 'revealed', 'dismissing'

	let { animationStage = 'idle' } = $props();
	let canvas = $state();
	let ctx = $state();
	let particles = $state([]);
	let animationFrameId = $state();

	/**
	 * Particle class for data byte effect
	 */
	class Particle {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.vx = (Math.random() - 0.5) * 2;
			this.vy = (Math.random() - 0.5) * 2;
			this.life = 1.0;
			this.size = Math.random() * 2 + 1;
			this.color = Math.random() > 0.5 ? '#00ffff' : '#d946ef';
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;
			this.life -= 0.01;
			this.vy += 0.05; // Gentle float upward

			// Wrap around edges (with safety check)
			if (canvas) {
				if (this.x < 0) this.x = canvas.width;
				if (this.x > canvas.width) this.x = 0;
				if (this.y > canvas.height) this.y = 0;
			}
		}

		draw(ctx) {
			ctx.save();
			ctx.globalAlpha = this.life * 0.6;
			ctx.fillStyle = this.color;
			ctx.shadowBlur = 10;
			ctx.shadowColor = this.color;
			ctx.fillRect(this.x, this.y, this.size, this.size);
			ctx.restore();
		}
	}

	/**
	 * Animate particle field
	 */
	function animateParticles() {
		if (!ctx || !canvas) return;

		try {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Update and filter particles
			particles = particles.filter((p) => p.life > 0);
			particles.forEach((p) => {
				p.update();
				p.draw(ctx);
			});

			// Spawn particles (with safety check for window)
			const maxParticles = typeof window !== 'undefined' && window.innerWidth < 768 ? 20 : 50;
			const spawnRate = 0.1;

			if (particles.length < maxParticles && Math.random() < spawnRate) {
				particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
			}

			animationFrameId = requestAnimationFrame(animateParticles);
		} catch (err) {
			logger.warn('Animation frame error, stopping animations:', err);
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		}
	}

	onMount(() => {
		// Skip animations in test environment or if canvas is unavailable
		if (!canvas || typeof window === 'undefined') {
			return;
		}

		try {
			ctx = canvas.getContext('2d', {
				willReadFrequently: false,
				alpha: true
			});

			if (!ctx) {
				logger.warn('Failed to get canvas 2D context, skipping animations');
				return;
			}

			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;

			// Handle window resize
			const handleResize = () => {
				if (canvas) {
					canvas.width = canvas.offsetWidth;
					canvas.height = canvas.offsetHeight;
				}
			};
			window.addEventListener('resize', handleResize);

			// Start animation loop
			animateParticles();

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		} catch (err) {
			logger.warn('Canvas initialization failed, skipping animations:', err);
		}
	});

	onDestroy(() => {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	});
</script>

<!-- Neural Background -->
<div class="neural-background">
	<!-- Particle field canvas -->
	<canvas class="particle-field" bind:this={canvas} aria-hidden="true"></canvas>

	<!-- Scan grid background -->
	<div class="scan-grid" aria-hidden="true"></div>

	<!-- Scan grid background -->
	<div class="scan-grid {animationStage}" aria-hidden="true"></div>
</div>

<style>
	/* ============================================
	   NEURAL BACKGROUND - CONTAINER
	   ============================================ */

	.neural-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 10;
	}

	/* ============================================
	   PARTICLE FIELD - CANVAS LAYER
	   ============================================ */

	.particle-field {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	/* ============================================
	   SCAN GRID - ANIMATED BACKGROUND
	   ============================================ */

	.scan-grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.3;
		z-index: 0;
		/* Grid animation removed to avoid distraction during dice rolls */
	}

	.scan-grid.idle {
		animation: none;
	}
	.scan-grid.accelerating {
		animation: grid-accelerate 0.8s ease-in-out;
	}

	/* ============================================
	   SCAN GRID - ANIMATED BACKGROUND
	   ============================================ */

	.scan-grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
		background-size: 40px 40px;
		animation: grid-pulse 4s ease-in-out infinite;
		z-index: 0;
	}

	@keyframes grid-pulse {
		0%,
		100% {
			opacity: 0.3;
			background-size: 40px 40px;
		}
		50% {
			opacity: 0.5;
			background-size: 42px 42px;
		}
	}

	@keyframes grid-accelerate {
		0% {
			background-size: 40px 40px;
			opacity: 0.3;
		}
		50% {
			background-size: 30px 30px;
			opacity: 0.7;
		}
		100% {
			background-size: 40px 40px;
			opacity: 0.5;
		}
	}

	/* ============================================
	   MOBILE RESPONSIVE
	   ============================================ */

	@media (max-width: 768px) {
		.scan-grid {
			background-size: 30px 30px;
		}
	}

	@media (max-width: 450px) {
		.scan-grid {
			background-size: 25px 25px;
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		/* Grid animation already removed - particles can continue */
	}
</style>
