<script>
	import { onMount, onDestroy } from 'svelte';

	let canvas = $state();
	let ctx = $state();
	let particles = $state([]);
	let animationFrameId = $state();

	/**
	 * Particle class for data fragment effect
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

			// Wrap around edges
			if (this.x < 0) this.x = canvas.width;
			if (this.x > canvas.width) this.x = 0;
			if (this.y > canvas.height) this.y = 0;
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

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Update and filter particles
		particles = particles.filter((p) => p.life > 0);
		particles.forEach((p) => {
			p.update();
			p.draw(ctx);
		});

		// Spawn particles
		const maxParticles = window.innerWidth < 768 ? 20 : 50;
		const spawnRate = 0.1;

		if (particles.length < maxParticles && Math.random() < spawnRate) {
			particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
		}

		animationFrameId = requestAnimationFrame(animateParticles);
	}

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

			// Start animation loop
			animateParticles();

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

<!-- Neural Background -->
<div class="neural-background">
	<!-- Particle field canvas -->
	<canvas class="particle-field" bind:this={canvas} aria-hidden="true"></canvas>

	<!-- Scan grid background -->
	<div class="scan-grid" aria-hidden="true"></div>
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
		z-index: 0;
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
