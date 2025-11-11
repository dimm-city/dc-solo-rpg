<script>
	import { onMount, onDestroy } from 'svelte';
	import { sleep } from '../utils/timing.js';
	import { logger } from '../utils/logger.js';

	let { card = $bindable(null), onrequestcard = () => {}, onconfirmcard = () => {} } = $props();

	let animationStage = $state('idle'); // 'idle', 'anticipating', 'materializing', 'revealed', 'dismissing'
	let canvas = $state();
	let ctx = $state();
	let particles = $state([]);
	let animationFrameId = $state();
	let gridPulsePhase = $state(0);



	/**
	 * Handle intercept button click - request card draw and start animation
	 */
	async function onIntercept() {
		if (animationStage !== 'idle') return;

		try {
			// Request a new card from the parent
			onrequestcard();

			// Anticipation phase - grid accelerates
			animationStage = 'anticipating';
			await sleep(400);

			// Wait for card to be set by parent
			let attempts = 0;
			while (!card && attempts < 20) {
				await sleep(50);
				attempts++;
			}

			if (!card) {
				logger.error('Card was not provided in time');
				animationStage = 'idle';
				return;
			}

			// Materialization phase - fragment appears with glitch
			animationStage = 'materializing';
			await sleep(1000);

			// Revealed phase - stable display
			animationStage = 'revealed';
		} catch (error) {
			logger.error('Intercept failed:', error);
			animationStage = 'idle';
		}
	}

	/**
	 * Handle dismiss/continue - upload animation and notify parent
	 */
	async function onDismiss() {
		if (animationStage !== 'revealed') return;

		animationStage = 'dismissing';
		await sleep(600);

		// Notify parent that card was confirmed
		onconfirmcard();

		// Reset state
		animationStage = 'idle';
		particles = []; // Clear particles
		card = null;
	}

	/**
	 * Handle button click based on current stage
	 */
	async function onButtonClick() {
		if (animationStage === 'idle') {
			await onIntercept();
		} else if (animationStage === 'revealed') {
			await onDismiss();
		}
	}

	/**
	 * Public API - manually trigger card display (if needed)
	 */
	export const showCard = async (newCard) => {
		card = newCard;
		if (animationStage === 'anticipating') {
			// Card arrived, continue animation
			return;
		}
		// Otherwise start from beginning
		animationStage = 'materializing';
		await sleep(1000);
		animationStage = 'revealed';
	};

	/**
	 * Public API - reset the interface
	 */
	export const reset = async () => {
		if (animationStage === 'revealed') {
			await onDismiss();
		} else {
			animationStage = 'idle';
			particles = [];
			card = null;
		}
	};

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

			// // Start animation loop
			// animateParticles();

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

<div class="dc-card-deck" class:active={animationStage !== 'idle'}>
	<!-- Fragment container -->
	<div
		class="fragment-container"
		class:materializing={animationStage === 'materializing'}
		class:revealed={animationStage === 'revealed'}
		class:dismissing={animationStage === 'dismissing'}
	>
		{#if animationStage !== 'idle' && animationStage !== 'anticipating'}
			<div class="fragment-shell">
				<!-- Bio-pulse rings -->
				<div class="bio-pulse" aria-hidden="true"></div>

				<!-- Corruption overlay for glitch effect -->
				<div class="corruption-overlay" aria-hidden="true"></div>

				<!-- Fragment content -->
				{#if card}
					<div class="fragment-content">
						<p class="fragment-data">{card.description || ''}</p>
						<small class="fragment-id">
							FRAGMENT-{card.card}-{card.suit?.slice(0, 3).toUpperCase() || 'UNK'}
						</small>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Neural CTA button -->
	<button
		class="neural-cta"
		onclick={onButtonClick}
		disabled={animationStage === 'anticipating' ||
			animationStage === 'materializing' ||
			animationStage === 'dismissing'}
		type="button"
		data-testid="card-deck-button"
	>
		<span class="cta-glow" aria-hidden="true"></span>
		<span class="cta-text">
			{#if animationStage === 'idle'}
				INTERCEPT FRAGMENT
			{:else if animationStage === 'anticipating' || animationStage === 'materializing'}
				INTERCEPTING<span class="ellipsis">...</span>
			{:else if animationStage === 'revealed'}
				CONTINUE
			{:else}
				UPLOADING...
			{/if}
		</span>
	</button>
</div>

<style>


	/* ============================================
	   FRAGMENT CONTAINER
	   ============================================ */

	.fragment-container {
		position: relative;
		width: 90%;
		max-width: 500px;
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		opacity: 0;
		transform: scale(0.8);
		transition: none;
	}

	.fragment-container.materializing {
		animation: fragment-materialize 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.fragment-container.revealed {
		opacity: 1;
		transform: scale(1);
	}

	.fragment-container.dismissing {
		animation: fragment-dismiss 600ms cubic-bezier(0.4, 0, 1, 1) forwards;
	}

	@keyframes fragment-materialize {
		0% {
			opacity: 0;
			transform: scale(0.8) rotateX(20deg);
			filter: blur(10px);
		}
		60% {
			opacity: 0.8;
			transform: scale(1.05) rotateX(-5deg);
			filter: blur(2px);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotateX(0deg);
			filter: blur(0px);
		}
	}

	@keyframes fragment-dismiss {
		0% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(-50px) scale(0.9);
			filter: brightness(2) blur(5px);
		}
	}

	/* ============================================
	   FRAGMENT SHELL - MAIN CARD
	   ============================================ */

	.fragment-shell {
		position: relative;
		width: 100%;
		min-height: 300px;
		padding: var(--space-xl, 2rem);
	
		border: 2px solid var(--color-neon-cyan, #00ffff);
		border-radius: 8px;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.3),
			0 0 40px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.05);
		overflow: hidden;
	}

	.fragment-container.materializing .fragment-shell {
		animation: glitch-effect 200ms steps(2) 3;
	}

	@keyframes glitch-effect {
		0%,
		100% {
			transform: translate(0);
			filter: hue-rotate(0deg);
		}
		25% {
			transform: translate(-2px, 2px);
			filter: hue-rotate(90deg);
		}
		75% {
			transform: translate(2px, -2px);
			filter: hue-rotate(-90deg);
		}
	}

	/* ============================================
	   BIO-PULSE RINGS
	   ============================================ */

	.bio-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100px;
		height: 100px;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 0;
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
			opacity: 0.6;
		}
		100% {
			width: 300px;
			height: 300px;
			opacity: 0;
		}
	}

	/* ============================================
	   CORRUPTION OVERLAY
	   ============================================ */

	.corruption-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			45deg,
			transparent 30%,
			rgba(0, 255, 255, 0.03) 50%,
			transparent 70%
		);
		background-size: 200% 200%;
		animation: corruption-scan 3s linear infinite;
		pointer-events: none;
		z-index: 1;
	}

	@keyframes corruption-scan {
		0% {
			background-position: 0% 0%;
		}
		100% {
			background-position: 200% 200%;
		}
	}

	/* ============================================
	   FRAGMENT CONTENT
	   ============================================ */

	.fragment-content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg, 1.5rem);
		color: var(--color-text-primary, #fff);
	}

	.fragment-data {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-lg, 1.125rem);
		line-height: var(--line-height-relaxed, 1.75);
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		margin: 0;
		opacity: 0;
		animation: text-materialize 800ms ease-out 200ms forwards;
	}

	.fragment-id {
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-xs, 0.75rem);
		letter-spacing: var(--letter-spacing-wider, 0.1em);
		color: var(--color-neon-cyan, #00ffff);
		text-transform: uppercase;
		opacity: 0;
		animation: text-materialize 600ms ease-out 600ms forwards;
	}

	@keyframes text-materialize {
		0% {
			opacity: 0;
			transform: translateY(10px);
			filter: blur(5px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	/* ============================================
	   NEURAL CTA BUTTON
	   ============================================ */

	.neural-cta {
		position: relative;
		padding: var(--space-md, 1rem) var(--space-xl, 2rem);
		background: linear-gradient(
			135deg,
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
		z-index: 3;
		overflow: hidden;
		transition: all 0.3s ease;
		box-shadow:
			0 4px 15px rgba(217, 70, 239, 0.4),
			0 0 20px rgba(0, 255, 255, 0.3);
	}

	.neural-cta:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow:
			0 6px 25px rgba(217, 70, 239, 0.6),
			0 0 30px rgba(0, 255, 255, 0.5);
	}

	.neural-cta:active:not(:disabled) {
		transform: translateY(0);
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
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
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
		0%,
		100% {
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


		.fragment-container {
			max-width: 95%;
			min-height: 200px;
		}

		.fragment-shell {
			min-height: 200px;
			padding: var(--space-lg, 1.5rem);
		}

		.fragment-data {
			font-size: var(--text-base, 1rem);
		}

		.neural-cta {
			padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
			font-size: var(--text-sm, 0.875rem);
			min-height: 44px; /* Ensure touch target size */
		}

	}

	@media (max-width: 450px) or (max-height: 667px) {
		

		.fragment-container {
			min-height: 100px;
			max-width: 98%;
			margin: 0;
		}

		.fragment-shell {
			min-height: 100px;
			padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		}

	

		.fragment-data {
			font-size: var(--text-sm, 0.875rem);
			line-height: var(--line-height-base, 1.5);
		}

		.fragment-id {
			font-size: 0.625rem;
		}

		.neural-cta {
			padding: var(--space-xs, 0.25rem) var(--space-md, 1rem);
			font-size: var(--text-xs, 0.75rem);
			min-height: 44px; /* Ensure touch target size */
			min-width: 44px;
			flex-shrink: 0; /* Prevent button from shrinking */
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
	
		.bio-pulse::before,
		.bio-pulse::after,
		.corruption-overlay,
		.cta-glow,
		.ellipsis {
			animation: none !important;
		}

		.fragment-container.materializing {
			animation: fragment-materialize-reduced 300ms ease forwards;
		}

		.fragment-container.dismissing {
			animation: fragment-dismiss-reduced 200ms ease forwards;
		}

		@keyframes fragment-materialize-reduced {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		@keyframes fragment-dismiss-reduced {
			from {
				opacity: 1;
			}
			to {
				opacity: 0;
			}
		}

		.fragment-data,
		.fragment-id {
			animation: none !important;
			opacity: 1 !important;
		}

		.neural-cta:hover:not(:disabled) {
			transform: none;
		}
	}
</style>
