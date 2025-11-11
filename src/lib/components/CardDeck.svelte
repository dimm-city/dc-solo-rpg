<script>
	import { onMount, onDestroy } from 'svelte';
	import { sleep } from '../utils/timing.js';
	import { logger } from '../utils/logger.js';
	import ContinueButton from './ContinueButton.svelte';

	let { card = $bindable(null), onrequestcard = () => {}, onconfirmcard = () => {} } = $props();

	let animationStage = $state('idle'); // 'idle', 'anticipating', 'materializing', 'revealed', 'dismissing'
	let canvas = $state();
	let ctx = $state();
	let particles = $state([]);
	let animationFrameId = $state();
	let gridPulsePhase = $state(0);

	// Derived state for button text
	let buttonText = $derived.by(() => {
		if (animationStage === 'idle') return 'PROCEED TO NEXT BYTE';
		if (animationStage === 'anticipating' || animationStage === 'materializing')
			return 'LOADING...';
		if (animationStage === 'revealed') return 'CONTINUE';
		return 'UPLOADING...';
	});

	// Derived state for button disabled condition
	let isButtonDisabled = $derived(
		animationStage === 'anticipating' ||
			animationStage === 'materializing' ||
			animationStage === 'dismissing'
	);

	/**
	 * Handle proceed button click - request card draw and start animation
	 */
	async function onProceed() {
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

			// Materialization phase - byte appears with glitch
			animationStage = 'materializing';
			await sleep(1000);

			// Revealed phase - stable display
			animationStage = 'revealed';
		} catch (error) {
			logger.error('Proceed to byte failed:', error);
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
	export async function onButtonClick() {
		if (animationStage === 'idle') {
			await onProceed();
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
	<!-- Byte container -->
	<div
		class="byte-container"
		class:materializing={animationStage === 'materializing'}
		class:revealed={animationStage === 'revealed'}
		class:dismissing={animationStage === 'dismissing'}
	>
		{#if animationStage !== 'idle' && animationStage !== 'anticipating'}
			<div class="byte-shell">
				<!-- Bio-pulse rings -->
				<div class="bio-pulse" aria-hidden="true"></div>

				<!-- Corruption overlay for glitch effect -->
				<div class="corruption-overlay" aria-hidden="true"></div>

				<!-- Byte content -->
				{#if card}
					<div class="byte-content">
						<p class="byte-data">{card.description || ''}</p>
						<small class="byte-id">
							BYTE-{card.card}-{card.suit?.slice(0, 3).toUpperCase() || 'UNK'}
						</small>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<div class="dc-dice-roller-header dc-header">
		<!-- Neural CTA button -->
		<ContinueButton
			text={buttonText}
			onclick={onButtonClick}
			disabled={isButtonDisabled}
			testid="card-deck-button"
			class="neural-cta-wrapper"
		/>
	</div>
</div>

<style>
	/* ============================================
	   CARD DECK CONTAINER
	   ============================================ */

	.dc-card-deck {
		display: grid;
		grid-template-rows: 1fr auto;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-items: center;
		gap: 1rem;
	}

	/* ============================================
	   BYTE CONTAINER
	   ============================================ */

	.byte-container {
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

	.byte-container.materializing {
		animation: byte-materialize 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.byte-container.revealed {
		opacity: 1;
		transform: scale(1);
	}

	.byte-container.dismissing {
		animation: byte-dismiss 600ms cubic-bezier(0.4, 0, 1, 1) forwards;
	}

	@keyframes byte-materialize {
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

	@keyframes byte-dismiss {
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
	   BYTE SHELL - MAIN CARD
	   ============================================ */

	.byte-shell {
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

	.byte-container.materializing .byte-shell {
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
	   BYTE CONTENT
	   ============================================ */

	.byte-content {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg, 1.5rem);
		color: var(--color-text-primary, #fff);
	}

	.byte-data {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--text-lg, 1.125rem);
		line-height: var(--line-height-relaxed, 1.75);
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.85));
		margin: 0;
		opacity: 0;
		animation: text-materialize 800ms ease-out 200ms forwards;
	}

	.byte-id {
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
	   Override ContinueButton/AugmentedButton styling for cyberpunk aesthetic
	   ============================================ */

	/* Wrapper positioning and z-index */
	:global(.neural-cta-wrapper) {
		z-index: 3;
	}

	/* Override the AugmentedButton wrapper glow with neural styling */
	:global(.neural-cta-wrapper .aug-button-wrapper) {
		/* Enhanced cyberpunk glow */
		filter: drop-shadow(0 4px 15px rgba(217, 70, 239, 0.4))
			drop-shadow(0 0 20px rgba(0, 255, 255, 0.3));
		transition: all 0.3s ease;
	}

	:global(.neural-cta-wrapper .aug-button-wrapper:hover) {
		filter: drop-shadow(0 6px 25px rgba(217, 70, 239, 0.6))
			drop-shadow(0 0 30px rgba(0, 255, 255, 0.5));
	}

	/* Override the button itself with neural gradient */
	:global(.neural-cta-wrapper .aug-button) {
		position: relative;
		padding: var(--space-md, 1rem) var(--space-xl, 2rem);
		background: linear-gradient(
			135deg,
			var(--color-cyber-magenta, #d946ef) 0%,
			var(--color-neon-cyan, #00ffff) 100%
		);
		color: var(--color-text-primary, #fff);
		font-size: var(--text-base, 1rem);
		overflow: hidden;
		box-shadow:
			inset 0 0 20px rgba(0, 255, 255, 0.1),
			0 0 15px rgba(217, 70, 239, 0.2);
	}

	:global(.neural-cta-wrapper .aug-button:hover:not(:disabled)) {
		transform: translateY(-2px);
		box-shadow:
			inset 0 0 30px rgba(0, 255, 255, 0.15),
			0 0 25px rgba(217, 70, 239, 0.3);
	}

	:global(.neural-cta-wrapper .aug-button:active:not(:disabled)) {
		transform: translateY(0);
	}

	:global(.neural-cta-wrapper .aug-button:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
		filter: grayscale(0.3);
	}

	/* Add glow sweep animation effect */
	:global(.neural-cta-wrapper .aug-button)::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		animation: neural-glow-sweep 2s ease-in-out infinite;
		pointer-events: none;
		z-index: 1;
	}

	@keyframes neural-glow-sweep {
		0% {
			left: -100%;
		}
		100% {
			left: 200%;
		}
	}

	/* Ensure text is above the glow sweep */
	:global(.neural-cta-wrapper .aug-button) {
		position: relative;
	}

	/* ============================================
	   MOBILE RESPONSIVE
	   ============================================ */

	@media (max-width: 768px) {
		.byte-container {
			max-width: 95%;
			min-height: 200px;
		}

		.byte-shell {
			min-height: 200px;
			padding: var(--space-lg, 1.5rem);
		}

		.byte-data {
			font-size: var(--text-base, 1rem);
		}

		:global(.neural-cta-wrapper .aug-button) {
			padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
			font-size: var(--text-sm, 0.875rem);
			min-height: 44px; /* Ensure touch target size */
		}
	}

	@media (max-width: 450px) or (max-height: 667px) {
		.byte-container {
			min-height: 100px;
			max-width: 98%;
			margin: 0;
		}

		.byte-shell {
			min-height: 100px;
			padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		}

		.byte-data {
			font-size: var(--text-sm, 0.875rem);
			line-height: var(--line-height-base, 1.5);
		}

		.byte-id {
			font-size: 0.625rem;
		}

		:global(.neural-cta-wrapper .aug-button) {
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
		.corruption-overlay {
			animation: none !important;
		}

		/* Disable neural glow sweep animation */
		:global(.neural-cta-wrapper .aug-button)::before {
			animation: none !important;
		}

		.byte-container.materializing {
			animation: byte-materialize-reduced 300ms ease forwards;
		}

		.byte-container.dismissing {
			animation: byte-dismiss-reduced 200ms ease forwards;
		}

		@keyframes byte-materialize-reduced {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}

		@keyframes byte-dismiss-reduced {
			from {
				opacity: 1;
			}
			to {
				opacity: 0;
			}
		}

		.byte-data,
		.byte-id {
			animation: none !important;
			opacity: 1 !important;
		}

		:global(.neural-cta-wrapper .aug-button:hover:not(:disabled)) {
			transform: none;
		}
	}
</style>
