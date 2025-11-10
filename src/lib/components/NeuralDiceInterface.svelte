<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { sleep } from '../utils/timing.js';
	import ThreeJSDiceBoxRoller from './ThreeJSDiceBoxRoller.svelte';

	export let header = 'INITIATE PROBABILITY SCAN';

	const dispatch = createEventDispatcher();
	let animationStage = 'idle'; // 'idle', 'anticipating', 'rolling', 'settling', 'revealed'
	let canvas;
	let ctx;
	let particles = [];
	let animationFrameId;
	let probabilityStreams = [];
	let diceRoller;
	let diceResult = null;

	/**
	 * Particle class for neural data field effect
	 * Reused from CardDeck.svelte with same implementation
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
			this.rushToCenter = false;
		}

		update(centerX, centerY) {
			if (this.rushToCenter) {
				// Rush to center during settling phase
				const dx = centerX - this.x;
				const dy = centerY - this.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist > 5) {
					this.vx = (dx / dist) * 8;
					this.vy = (dy / dist) * 8;
				} else {
					this.life -= 0.05; // Fade out when reaching center
				}
			}

			this.x += this.vx;
			this.y += this.vy;
			this.life -= animationStage === 'settling' ? 0.02 : 0.01;

			if (!this.rushToCenter) {
				this.vy += 0.05; // Gentle float

				// Wrap around edges
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
	 * Probability stream for visual feedback during rolling
	 */
	class ProbabilityStream {
		constructor(x) {
			this.x = x;
			this.y = 0;
			this.height = Math.random() * 100 + 50;
			this.speed = Math.random() * 3 + 2;
			this.opacity = Math.random() * 0.3 + 0.2;
			this.color = Math.random() > 0.5 ? '#00ffff' : '#d946ef';
		}

		update() {
			this.y += this.speed;
			if (this.y > canvas.height) {
				this.y = -this.height;
			}
		}

		draw(ctx) {
			ctx.save();
			const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
			gradient.addColorStop(0, 'transparent');
			gradient.addColorStop(0.5, this.color);
			gradient.addColorStop(1, 'transparent');

			ctx.globalAlpha = this.opacity;
			ctx.fillStyle = gradient;
			ctx.fillRect(this.x, this.y, 2, this.height);
			ctx.restore();
		}
	}

	/**
	 * Animate particle field with dynamic behavior based on stage
	 */
	function animateParticles() {
		if (!ctx || !canvas) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const centerX = canvas.width / 2;
		const centerY = canvas.height / 2;

		// Update and filter particles
		particles = particles.filter(p => p.life > 0);
		particles.forEach(p => {
			p.update(centerX, centerY);
			p.draw(ctx);
		});

		// Update probability streams during rolling
		if (animationStage === 'rolling') {
			probabilityStreams.forEach(stream => {
				stream.update();
				stream.draw(ctx);
			});
		}

		// Spawn particles based on stage
		const isMobile = window.innerWidth < 450;
		const isTablet = window.innerWidth < 768;
		const maxParticles = isMobile ? 15 : isTablet ? 30 : 50;
		let spawnRate = 0.1;

		if (animationStage === 'anticipating') {
			spawnRate = 0.3;
		} else if (animationStage === 'rolling') {
			spawnRate = 0.4;
		} else if (animationStage === 'settling') {
			spawnRate = 0.5;
			// Mark particles to rush to center during settling
			particles.forEach(p => {
				if (!p.rushToCenter) {
					p.rushToCenter = true;
				}
			});
		}

		if (particles.length < maxParticles && Math.random() < spawnRate) {
			particles.push(new Particle(
				Math.random() * canvas.width,
				Math.random() * canvas.height
			));
		}

		animationFrameId = requestAnimationFrame(animateParticles);
	}

	/**
	 * Initialize probability streams for rolling phase
	 */
	function initProbabilityStreams() {
		const streamCount = window.innerWidth < 450 ? 5 : 10;
		probabilityStreams = [];
		for (let i = 0; i < streamCount; i++) {
			probabilityStreams.push(new ProbabilityStream(
				Math.random() * canvas.width
			));
		}
	}

	/**
	 * Get button text based on current animation stage
	 */
	function getButtonText() {
		switch (animationStage) {
			case 'idle':
				return 'INITIATE PROBABILITY SCAN';
			case 'anticipating':
				return 'INITIATING...';
			case 'rolling':
				return 'PROCESSING QUANTUM STATE...';
			case 'settling':
				return 'ANALYZING RESULT...';
			case 'revealed':
				return 'ACKNOWLEDGE RESULT';
			default:
				return header;
		}
	}

	/**
	 * Public API - trigger dice roll
	 */
	export async function roll(values = null) {
		if (animationStage !== 'idle') return null;

		try {
			// Dispatch roll start event
			dispatch('rollstart');

			// Anticipation phase - grid accelerates, particles speed up
			animationStage = 'anticipating';
			await sleep(400);

			// Initialize probability streams
			initProbabilityStreams();

			// Rolling phase - trigger actual dice roll
			animationStage = 'rolling';
			const result = await diceRoller.roll(values);
			diceResult = result;

			// Clear probability streams
			probabilityStreams = [];

			// Settling phase - bio-pulse rings, particle burst
			animationStage = 'settling';
			await sleep(600);

			// Revealed phase - show result
			animationStage = 'revealed';

			// Dispatch roll complete event
			dispatch('rollcomplete', { result });

			return result;

		} catch (error) {
			console.error('Neural dice roll failed:', error);
			animationStage = 'idle';
			diceResult = null;
			return null;
		}
	}

	/**
	 * Handle button click based on current stage
	 */
	async function onButtonClick() {
		if (animationStage === 'idle') {
			await roll();
		} else if (animationStage === 'revealed') {
			// Acknowledge result
			dispatch('resultacknowledged', { result: diceResult });
			animationStage = 'idle';
			diceResult = null;
		}
	}

	/**
	 * Handle dice roller events
	 */
	function handleDiceRollStart() {
		// Already handled in roll() method
	}

	function handleDiceRollComplete() {
		// Already handled in roll() method
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

<div class="neural-dice-interface" class:active={animationStage !== 'idle'}>
	<!-- Particle field canvas -->
	<canvas
		class="particle-field"
		bind:this={canvas}
		aria-hidden="true"
	></canvas>

	<!-- Neural scan grid background -->
	<div
		class="scan-grid"
		class:accelerating={animationStage === 'anticipating'}
		class:active-rolling={animationStage === 'rolling'}
		aria-hidden="true"
	></div>

	<!-- Neural frame overlay with corner brackets -->
	<div class="neural-frame" aria-hidden="true">
		<div class="frame-corner top-left"></div>
		<div class="frame-corner top-right"></div>
		<div class="frame-corner bottom-left"></div>
		<div class="frame-corner bottom-right"></div>
	</div>

	<!-- Bio-pulse rings during settling -->
	{#if animationStage === 'settling' || animationStage === 'revealed'}
		<div class="bio-pulse-container" aria-hidden="true">
			<div class="bio-pulse"></div>
		</div>
	{/if}

	<!-- Result overlay -->
	{#if animationStage === 'revealed' && diceResult !== null}
		<div class="result-overlay">
			<div class="result-hud">
				<div class="result-label">PROBABILITY LOCKED</div>
				<div class="result-value">{diceResult}</div>
				<div class="result-id">QUANTUM-STATE-{Date.now().toString(36).toUpperCase()}</div>
			</div>
		</div>
	{/if}

	<!-- Dice roller component -->
	<div class="dice-container">
		<ThreeJSDiceBoxRoller
			bind:this={diceRoller}
			{header}
			on:rollstart={handleDiceRollStart}
			on:rollcomplete={handleDiceRollComplete}
		/>
	</div>

	<!-- Neural CTA button -->
	<button
		class="neural-cta"
		class:pulsing={animationStage === 'idle'}
		class:processing={animationStage === 'anticipating' || animationStage === 'rolling' || animationStage === 'settling'}
		class:ready={animationStage === 'revealed'}
		on:click={onButtonClick}
		disabled={animationStage === 'anticipating' || animationStage === 'rolling' || animationStage === 'settling'}
		type="button"
	>
		<span class="cta-glow" aria-hidden="true"></span>
		<span class="cta-text">
			{getButtonText()}
			{#if animationStage === 'anticipating' || animationStage === 'rolling' || animationStage === 'settling'}
				<span class="ellipsis">...</span>
			{/if}
		</span>
	</button>
</div>

<style>
	/* ============================================
	   NEURAL DICE INTERFACE - CONTAINER
	   ============================================ */

	.neural-dice-interface {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 600px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--color-bg-darker, #000);
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
		animation: grid-pulse 4s ease-in-out infinite;
		z-index: 0;
	}

	.scan-grid.accelerating {
		animation: grid-accelerate 0.8s ease-in-out forwards;
	}

	.scan-grid.active-rolling {
		animation: grid-scan 2s linear infinite;
	}

	@keyframes grid-pulse {
		0%, 100% {
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
			background-size: 35px 35px;
			opacity: 0.6;
		}
	}

	@keyframes grid-scan {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 40px 40px;
		}
	}

	/* ============================================
	   NEURAL FRAME - CORNER BRACKETS
	   ============================================ */

	.neural-frame {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 4;
	}

	.frame-corner {
		position: absolute;
		width: 60px;
		height: 60px;
		border: 2px solid var(--color-neon-cyan, #00ffff);
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}

	.neural-dice-interface.active .frame-corner {
		opacity: 1;
		box-shadow: 0 0 10px var(--color-neon-cyan, #00ffff);
	}

	.frame-corner.top-left {
		top: 20px;
		left: 20px;
		border-right: none;
		border-bottom: none;
	}

	.frame-corner.top-right {
		top: 20px;
		right: 20px;
		border-left: none;
		border-bottom: none;
	}

	.frame-corner.bottom-left {
		bottom: 20px;
		left: 20px;
		border-right: none;
		border-top: none;
	}

	.frame-corner.bottom-right {
		bottom: 20px;
		right: 20px;
		border-left: none;
		border-top: none;
	}

	/* ============================================
	   BIO-PULSE RINGS - SETTLING PHASE
	   ============================================ */

	.bio-pulse-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bio-pulse {
		position: relative;
		width: 100px;
		height: 100px;
	}

	.bio-pulse::before,
	.bio-pulse::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		height: 100%;
		border: 2px solid var(--color-cyber-magenta, #d946ef);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		animation: bio-pulse-ring 2s ease-out infinite;
		opacity: 0;
	}

	.bio-pulse::after {
		animation-delay: 1s;
	}

	@keyframes bio-pulse-ring {
		0% {
			width: 100px;
			height: 100px;
			opacity: 0.8;
		}
		100% {
			width: 400px;
			height: 400px;
			opacity: 0;
		}
	}

	/* ============================================
	   RESULT OVERLAY - NEURAL HUD
	   ============================================ */

	.result-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 40px;
		pointer-events: none;
		z-index: 5;
		animation: result-fade-in 400ms ease-out forwards;
	}

	@keyframes result-fade-in {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.result-hud {
		background: linear-gradient(135deg,
			rgba(10, 10, 10, 0.95) 0%,
			rgba(26, 26, 26, 0.9) 50%,
			rgba(10, 10, 10, 0.95) 100%
		);
		border: 2px solid var(--color-neon-cyan, #00ffff);
		border-radius: 8px;
		padding: var(--space-lg, 1.5rem) var(--space-xl, 2rem);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(217, 70, 239, 0.3),
			inset 0 0 40px rgba(0, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
	}

	.result-label {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: var(--letter-spacing-wider, 0.1em);
		color: var(--color-neon-cyan, #00ffff);
		text-transform: uppercase;
		opacity: 0.8;
	}

	.result-value {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-text-primary, #fff);
		text-shadow:
			0 0 20px var(--color-cyber-magenta, #d946ef),
			0 0 40px var(--color-neon-cyan, #00ffff);
		animation: result-pulse 2s ease-in-out infinite;
	}

	@keyframes result-pulse {
		0%, 100% {
			transform: scale(1);
			filter: brightness(1);
		}
		50% {
			transform: scale(1.05);
			filter: brightness(1.2);
		}
	}

	.result-id {
		font-family: var(--font-mono, 'Courier New', monospace);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: var(--letter-spacing-wide, 0.05em);
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.6));
		text-transform: uppercase;
	}

	/* ============================================
	   DICE CONTAINER
	   ============================================ */

	.dice-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
	}

	/* Make dice roller transparent and non-blocking */
	.dice-container :global(.dc-dice-roller-container) {
		background: transparent !important;
	}

	.dice-container :global(.dc-dice-roller-header) {
		display: none !important;
	}

	/* ============================================
	   NEURAL CTA BUTTON
	   ============================================ */

	.neural-cta {
		position: absolute;
		bottom: 40px;
		left: 50%;
		transform: translateX(-50%);
		padding: var(--space-md, 1rem) var(--space-xl, 2rem);
		background: linear-gradient(135deg,
			var(--color-cyber-magenta, #d946ef) 0%,
			var(--color-neon-cyan, #00ffff) 100%
		);
		border: none;
		border-radius: 4px;
		font-family: var(--font-display, 'Orbitron', sans-serif);
		font-size: var(--text-base, 1rem);
		font-weight: 700;
		letter-spacing: var(--letter-spacing-wide, 0.05em);
		color: var(--color-text-primary, #fff);
		text-transform: uppercase;
		cursor: pointer;
		z-index: 6;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow:
			0 4px 15px rgba(217, 70, 239, 0.4),
			0 0 20px rgba(0, 255, 255, 0.3);
	}

	.neural-cta.pulsing {
		animation: button-pulse 2s ease-in-out infinite;
	}

	@keyframes button-pulse {
		0%, 100% {
			box-shadow:
				0 4px 15px rgba(217, 70, 239, 0.4),
				0 0 20px rgba(0, 255, 255, 0.3);
		}
		50% {
			box-shadow:
				0 4px 20px rgba(217, 70, 239, 0.6),
				0 0 30px rgba(0, 255, 255, 0.5);
		}
	}

	.neural-cta.processing {
		background: linear-gradient(135deg,
			rgba(217, 70, 239, 0.6) 0%,
			rgba(0, 255, 255, 0.6) 100%
		);
	}

	.neural-cta.ready {
		background: var(--color-neon-cyan, #00ffff);
		color: var(--color-bg-darker, #000);
		animation: ready-pulse 1s ease-in-out infinite;
	}

	@keyframes ready-pulse {
		0%, 100% {
			box-shadow:
				0 4px 20px rgba(0, 255, 255, 0.6),
				0 0 40px rgba(0, 255, 255, 0.8);
		}
		50% {
			box-shadow:
				0 6px 30px rgba(0, 255, 255, 0.8),
				0 0 60px rgba(0, 255, 255, 1);
		}
	}

	.neural-cta:hover:not(:disabled) {
		transform: translateX(-50%) translateY(-2px);
		box-shadow:
			0 6px 25px rgba(217, 70, 239, 0.6),
			0 0 30px rgba(0, 255, 255, 0.5);
	}

	.neural-cta:active:not(:disabled) {
		transform: translateX(-50%) translateY(0);
	}

	.neural-cta:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.cta-glow {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.3),
			transparent
		);
		animation: cta-glow-sweep 2s ease-in-out infinite;
	}

	@keyframes cta-glow-sweep {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}

	.cta-text {
		position: relative;
		z-index: 1;
		display: inline-block;
	}

	.ellipsis {
		display: inline-block;
		animation: ellipsis-pulse 1.5s steps(4) infinite;
	}

	@keyframes ellipsis-pulse {
		0%, 100% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}

	/* ============================================
	   MOBILE RESPONSIVE
	   ============================================ */

	@media (max-width: 768px) {
		.neural-dice-interface {
			min-height: 500px;
		}

		.frame-corner {
			width: 40px;
			height: 40px;
		}

		.frame-corner.top-left,
		.frame-corner.top-right {
			top: 10px;
		}

		.frame-corner.bottom-left,
		.frame-corner.bottom-right {
			bottom: 10px;
		}

		.frame-corner.top-left,
		.frame-corner.bottom-left {
			left: 10px;
		}

		.frame-corner.top-right,
		.frame-corner.bottom-right {
			right: 10px;
		}

		.result-overlay {
			padding-top: 20px;
		}

		.result-hud {
			padding: var(--space-md, 1rem) var(--space-lg, 1.5rem);
		}

		.result-value {
			font-size: 2.5rem;
		}

		.neural-cta {
			bottom: 30px;
			padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
			font-size: var(--text-sm, 0.875rem);
		}

		.scan-grid {
			background-size: 30px 30px;
		}
	}

	@media (max-width: 450px) {
		.neural-dice-interface {
			min-height: 450px;
		}

		.frame-corner {
			width: 30px;
			height: 30px;
		}

		.result-value {
			font-size: 2rem;
		}

		.neural-cta {
			bottom: 20px;
		}

		.scan-grid {
			background-size: 25px 25px;
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.scan-grid,
		.bio-pulse::before,
		.bio-pulse::after,
		.cta-glow,
		.ellipsis,
		.result-value {
			animation: none !important;
		}

		.neural-cta.pulsing,
		.neural-cta.ready {
			animation: none !important;
		}

		.result-overlay {
			animation: result-fade-in-reduced 200ms ease forwards;
		}

		@keyframes result-fade-in-reduced {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		.neural-cta:hover:not(:disabled) {
			transform: translateX(-50%);
		}

		.neural-cta:active:not(:disabled) {
			transform: translateX(-50%);
		}
	}
</style>
