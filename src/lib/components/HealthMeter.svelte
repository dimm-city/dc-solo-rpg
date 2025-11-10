<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import { onMount, onDestroy } from 'svelte';

	let health = $state(100);
	let text = $state('100');
	let indicator = $state('high');
	let isChanging = $state(false);
	let canvas = $state();
	let ctx = $state();
	let particles = $state([]);
	let animationFrameId = $state();

	/**
	 * Particle class for critical state warning effect
	 */
	class CriticalParticle {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.vx = (Math.random() - 0.5) * 3;
			this.vy = (Math.random() - 0.5) * 3;
			this.life = 1.0;
			this.size = Math.random() * 2 + 0.5;
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;
			this.life -= 0.02;
			this.vy += 0.1; // Gravity effect
		}

		draw(ctx) {
			ctx.save();
			ctx.globalAlpha = this.life * 0.8;
			ctx.fillStyle = '#ff0000';
			ctx.shadowBlur = 10;
			ctx.shadowColor = '#ff0000';
			ctx.fillRect(this.x, this.y, this.size, this.size);
			ctx.restore();
		}
	}

	/**
	 * Animate critical state particles
	 */
	function animateParticles() {
		if (!ctx || !canvas || indicator !== 'critical') {
			return;
		}

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			return;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Update and filter particles
		particles = particles.filter(p => p.life > 0);
		particles.forEach(p => {
			p.update();
			p.draw(ctx);
		});

		// Spawn particles (mobile: 5-8, desktop: 8-10)
		const maxParticles = window.innerWidth < 768 ? 6 : 10;
		if (particles.length < maxParticles && Math.random() < 0.3) {
			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2;
			particles.push(new CriticalParticle(
				centerX + (Math.random() - 0.5) * 30,
				centerY + (Math.random() - 0.5) * 30
			));
		}

		animationFrameId = requestAnimationFrame(animateParticles);
	}

	/**
	 * Effect for health changes
	 */
	$effect(() => {
		const result = Math.floor((gameState.tower / 54) * 100);
		if (health != result) {
			// Dematerialize phase
			isChanging = true;
			text = '';
			health = result;

			setTimeout(() => {
				// Update indicator and materialize phase
				indicator = health >= 70 ? 'high' : health >= 40 ? 'medium' : health >= 20 ? 'low' : 'critical';
				text = result;
				isChanging = false;

				// Start particles for critical state
				if (indicator === 'critical' && canvas) {
					particles = [];
					animateParticles();
				}
			}, 200);
		}
	});

	onMount(() => {
		if (canvas) {
			ctx = canvas.getContext('2d');
			const rect = canvas.parentElement.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;

			if (indicator === 'critical') {
				animateParticles();
			}
		}
	});

	onDestroy(() => {
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
	});
</script>

	<div class="health-meter">
		<!-- Particle canvas for critical state -->
		<canvas bind:this={canvas} class="particle-canvas"></canvas>

		<svg width="100%" height="100%" viewBox="0 0 100 100" class="health-svg">
			<!-- Neural scan line overlay -->
			<defs>
				<linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style="stop-color:#00ffff;stop-opacity:0" />
					<stop offset="50%" style="stop-color:#00ffff;stop-opacity:0.6" />
					<stop offset="100%" style="stop-color:#00ffff;stop-opacity:0" />
				</linearGradient>

				<linearGradient id="holographic-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" style="stop-color:rgba(255,255,255,0)" />
					<stop offset="50%" style="stop-color:rgba(255,255,255,0.3)" />
					<stop offset="100%" style="stop-color:rgba(255,255,255,0)" />
				</linearGradient>

				<mask id="health-mask">
					<rect class="mask-rect {indicator}" x="0" y="0" width="100" height={100 - health} />
				</mask>
			</defs>

			<!-- Main hexagon border (cyan neon glow) -->
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				class="dc-health-meter-stroke neural-border {indicator}"
			/>

			<!-- Health fill with mask -->
			<polygon
				points="50 1 95 25 95 75 50 99 5 75 5 25"
				mask="url(#health-mask)"
				class="dc-health-meter-bg fill-polygon {indicator}"
			/>

			<!-- Scan line overlay (animated sweep) -->
			<rect
				class="scan-line {indicator}"
				x="5"
				y="0"
				width="90"
				height="15"
				fill="url(#scan-gradient)"
			/>

			<!-- Holographic sheen overlay -->
			<rect
				class="holographic-sheen"
				x="-100"
				y="0"
				width="50"
				height="100"
				fill="url(#holographic-gradient)"
				opacity="0.4"
			/>
		</svg>

		{#if text}
			<span
				class="health-score dc-fade-in"
				class:materializing={!isChanging}
				class:dematerializing={isChanging}
				data-health-level={indicator}
			>
				{text}
			</span>
		{/if}

		<!-- Critical state warning indicator -->
		{#if indicator === 'critical'}
			<div class="critical-warning">CRITICAL</div>
		{/if}
	</div>

<style>
	:root {
		--dc-health-meter-high: #00ff00;
		--dc-health-meter-high-glow: rgba(0, 255, 0, 0.6);
		--dc-health-meter-medium: #ffd700;
		--dc-health-meter-medium-glow: rgba(255, 215, 0, 0.6);
		--dc-health-meter-low: #ff6b00;
		--dc-health-meter-low-glow: rgba(255, 107, 0, 0.7);
		--dc-health-meter-critical: #ff0000;
		--dc-health-meter-critical-glow: rgba(255, 0, 0, 0.8);
		--neural-cyan-border: #00ffff;
	}

	/* Container */
	.health-meter {
		position: relative;
		margin: auto;
		width: 60px;
		height: 60px;
	}

	/* Particle canvas */
	.particle-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
	}

	/* SVG container */
	.health-svg {
		position: relative;
		z-index: 1;
	}

	/* Neural border with cyan glow */
	.dc-health-meter-stroke.neural-border {
		fill: none;
		stroke: var(--neural-cyan-border);
		stroke-width: 2;
		filter: drop-shadow(0 0 4px var(--neural-cyan-border));
		transition: all 0.4s ease-out;
	}

	/* Critical state border pulse */
	.dc-health-meter-stroke.neural-border.critical {
		animation: border-pulse 1s ease-in-out infinite;
	}

	@keyframes border-pulse {
		0%, 100% {
			filter: drop-shadow(0 0 4px var(--neural-cyan-border));
		}
		50% {
			filter: drop-shadow(0 0 12px #ff0000) drop-shadow(0 0 6px var(--neural-cyan-border));
		}
	}

	/* Fill polygon colors with smooth transition */
	.fill-polygon {
		transition: fill 0.4s ease-out, filter 0.4s ease-out;
	}

	.fill-polygon.high {
		fill: var(--dc-health-meter-high);
		filter: drop-shadow(0 0 3px var(--dc-health-meter-high-glow));
	}

	.fill-polygon.medium {
		fill: var(--dc-health-meter-medium);
		filter: drop-shadow(0 0 3px var(--dc-health-meter-medium-glow));
	}

	.fill-polygon.low {
		fill: var(--dc-health-meter-low);
		filter: drop-shadow(0 0 4px var(--dc-health-meter-low-glow));
	}

	.fill-polygon.critical {
		fill: var(--dc-health-meter-critical);
		filter: drop-shadow(0 0 5px var(--dc-health-meter-critical-glow));
	}

	/* Mask rectangle transition */
	.mask-rect {
		fill: white;
		transition: height 0.4s ease-out;
	}

	/* Scan line animation */
	.scan-line {
		animation: scan-sweep 2s ease-in-out infinite;
		opacity: 0.7;
		pointer-events: none;
	}

	.scan-line.critical {
		animation: scan-sweep-critical 0.5s ease-in-out infinite;
	}

	@keyframes scan-sweep {
		0% {
			y: 0;
			opacity: 0;
		}
		50% {
			opacity: 0.7;
		}
		100% {
			y: 85;
			opacity: 0;
		}
	}

	@keyframes scan-sweep-critical {
		0% {
			y: 0;
			opacity: 0;
		}
		50% {
			opacity: 1;
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

	/* Health score text */
	.health-score {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 1.25em;
		font-weight: bold;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
		z-index: 2;
		pointer-events: none;
	}

	/* Dematerialize animation */
	.health-score.dematerializing {
		animation: dematerialize 200ms ease-out forwards;
	}

	/* Materialize animation */
	.health-score.materializing {
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

	/* High health: 70-100% - Green with glow */
	.health-score[data-health-level="high"] {
		color: var(--dc-health-meter-high);
		text-shadow: 0 0 10px var(--dc-health-meter-high-glow),
		             0 0 20px var(--dc-health-meter-high-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.8);
	}

	/* Medium health: 40-69% - Yellow with glow */
	.health-score[data-health-level="medium"] {
		color: var(--dc-health-meter-medium);
		text-shadow: 0 0 10px var(--dc-health-meter-medium-glow),
		             0 0 20px var(--dc-health-meter-medium-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.8);
	}

	/* Low health: 20-39% - Orange with warning pulse */
	.health-score[data-health-level="low"] {
		color: var(--dc-health-meter-low);
		text-shadow: 0 0 10px var(--dc-health-meter-low-glow),
		             0 0 20px var(--dc-health-meter-low-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.8);
		animation: health-warning-pulse 1.5s ease-in-out infinite;
	}

	/* Critical health: 0-19% - Red with urgent pulse */
	.health-score[data-health-level="critical"] {
		color: var(--dc-health-meter-critical);
		text-shadow: 0 0 15px var(--dc-health-meter-critical-glow),
		             0 0 30px var(--dc-health-meter-critical-glow),
		             2px 2px 4px rgba(0, 0, 0, 0.8);
		animation: health-critical-pulse 1s ease-in-out infinite;
	}

	@keyframes health-warning-pulse {
		0%, 100% {
			opacity: 1;
			filter: brightness(1);
		}
		50% {
			opacity: 0.8;
			filter: brightness(1.2);
		}
	}

	@keyframes health-critical-pulse {
		0%, 100% {
			opacity: 1;
			filter: brightness(1);
		}
		50% {
			opacity: 0.9;
			filter: brightness(1.4);
		}
	}

	/* Critical warning text */
	.critical-warning {
		position: absolute;
		bottom: -18px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.6em;
		font-weight: bold;
		color: #ff0000;
		text-shadow: 0 0 8px rgba(255, 0, 0, 0.8);
		letter-spacing: 1px;
		animation: critical-flash 1s ease-in-out infinite;
		z-index: 2;
		white-space: nowrap;
	}

	@keyframes critical-flash {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	/* Responsive sizing */
	@media (max-width: 768px) {
		.health-meter {
			width: 50px;
			height: 50px;
		}

		.health-score {
			font-size: 1.1em;
		}

		.critical-warning {
			font-size: 0.55em;
		}

		/* Reduce intensity on tablet */
		.scan-line,
		.holographic-sheen {
			opacity: 0.6;
		}
	}

	@media (max-width: 450px) {
		.health-meter {
			width: 45px;
			height: 45px;
		}

		.health-score {
			font-size: 1rem;
		}

		.critical-warning {
			font-size: 0.5em;
			bottom: -16px;
		}

		/* Minimal effects on mobile */
		.scan-line,
		.holographic-sheen {
			opacity: 0.4;
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.scan-line,
		.holographic-sheen,
		.health-score[data-health-level="low"],
		.health-score[data-health-level="critical"],
		.dc-health-meter-stroke.neural-border.critical,
		.critical-warning {
			animation: none;
		}

		.health-score.dematerializing {
			animation: dematerialize-reduced 200ms ease-out forwards;
		}

		.health-score.materializing {
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
