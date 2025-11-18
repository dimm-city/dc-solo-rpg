<script>
	import { onMount, onDestroy } from 'svelte';
	import { sleep } from '../utils/timing.js';
	import { logger } from '../utils/logger.js';
	import ContinueButton from './ContinueButton.svelte';
	import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
	import { autoAdvance } from '../utils/autoPlay.js';

	let {
		card = $bindable(null),
		animationStage = $bindable('idle'),
		onrequestcard = () => {},
		onconfirmcard = () => {}
	} = $props();

	// animationStage is now bindable so changes propagate to parent
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
	 * Auto-trigger card draw when entering idle state
	 * This skips the "PROCEED TO NEXT BYTE" button click
	 */
	$effect(() => {
		if (animationStage === 'idle') {
			// Small delay to avoid immediate re-trigger and allow UI to settle
			const timeout = setTimeout(() => {
				onProceed();
			}, 100);
			return () => clearTimeout(timeout);
		}
	});

	/**
	 * Auto-read card and auto-continue when revealed
	 */
	let autoPlayCanceller = $state(null);

	$effect(() => {
		if (animationStage === 'revealed' && card) {
			const audioSettings = getAudioSettings();
			const gameplaySettings = getGameplaySettings();

			// Build card text for TTS
			const cardText = `${card.description}. ${card.story || ''}`;

			// Auto-read if enabled
			if (audioSettings.autoReadCards) {
				speak(cardText).then(() => {
					// After reading, auto-continue if enabled
					if (gameplaySettings.autoContinueAfterReading) {
						autoAdvance({
							text: null,
							shouldRead: false,
							action: () => onDismiss()
						}).then((canceller) => {
							autoPlayCanceller = canceller;
						});
					}
				});
			}
			// Just auto-continue without reading if enabled
			else if (gameplaySettings.autoContinueAfterReading) {
				autoAdvance({
					text: null,
					shouldRead: false,
					action: () => onDismiss()
				}).then((canceller) => {
					autoPlayCanceller = canceller;
				});
			}
		}

		// Cancel auto-play when animation stage changes
		return () => {
			if (autoPlayCanceller) {
				autoPlayCanceller.cancel();
				autoPlayCanceller = null;
			}
		};
	});

	/**
	 * Handle dismiss/continue - upload animation and notify parent
	 */
	async function onDismiss() {
		if (animationStage !== 'revealed') return;

		// Cancel auto-play on manual interaction
		if (autoPlayCanceller) {
			autoPlayCanceller.cancel();
			autoPlayCanceller = null;
		}

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
	 * Get current button text based on animation stage
	 */
	export function getButtonText() {
		if (animationStage === 'idle') return 'PROCEED TO NEXT BYTE';
		if (animationStage === 'anticipating' || animationStage === 'materializing')
			return 'LOADING...';
		if (animationStage === 'revealed') return 'CONTINUE';
		return 'UPLOADING...';
	}

	/**
	 * Get button disabled state based on animation stage
	 */
	export function getButtonDisabled() {
		return (
			animationStage === 'anticipating' ||
			animationStage === 'materializing' ||
			animationStage === 'dismissing'
		);
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
		class:clickable={animationStage === 'revealed'}
		onclick={() => {
			if (animationStage === 'revealed') onDismiss();
		}}
		role="button"
		tabindex={animationStage === 'revealed' ? '0' : '-1'}
		onkeydown={(e) => {
			if (animationStage === 'revealed' && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				onDismiss();
			}
		}}
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
						<!-- Card Type Indicator -->
						{#if card.type}
							<div class="card-type-badge" data-type={card.type}>
								{#if card.type === 'primary-success'}
									<!-- Crown icon for Primary Success -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
									</svg>
									<span class="type-label">Victory</span>
								{:else if card.type === 'failure-counter'}
									<!-- Skull icon for Failure Counter (Kings) -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<circle cx="9" cy="12" r="1" />
										<circle cx="15" cy="12" r="1" />
										<path d="M8 20v2h8v-2" />
										<path d="m12.5 17-.5-1-.5 1h1z" />
										<path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
									</svg>
									<span class="type-label">Doom</span>
								{:else if card.type === 'narrative'}
									<!-- Star icon for Narrative (Bonus/Help) -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<polygon
											points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
										/>
									</svg>
									<span class="type-label">Bonus</span>
								{:else if card.type === 'challenge'}
									<!-- Zap icon for Challenge -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
									</svg>
									<span class="type-label">Challenge</span>
								{:else if card.type === 'event'}
									<!-- BookOpen icon for Event -->
									<svg
										class="type-icon"
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
										<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
									</svg>
									<span class="type-label">Event</span>
								{/if}
							</div>
						{/if}

						<p class="byte-data">{card.description || ''}</p>
						<small class="byte-id">
							BYTE-{card.card}-{card.suit?.slice(0, 3).toUpperCase() || 'UNK'}
						</small>
						<p>
							{card.story}
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<!-- Button moved to GameScreen toolbar -->
</div>

<style>
	/* ============================================
	   CARD DECK CONTAINER
	   ============================================ */

	.dc-card-deck {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
	}

	/* ============================================
	   BYTE CONTAINER
	   ============================================ */

	.byte-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
		max-width: 80ch;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: scale(0.8);
		transition: none;
	}

	/* Clickable state when revealed */
	.byte-container.clickable {
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.byte-container.clickable:hover {
		transform: scale(1.02);
		box-shadow:
			0 0 40px rgba(0, 255, 255, 0.5),
			0 0 80px rgba(217, 70, 239, 0.3),
			inset 0 0 40px rgba(0, 255, 255, 0.15);
	}

	.byte-container.clickable:active {
		transform: scale(0.98);
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
		height: 100%;
		padding: var(--space-xl, 2rem);
		overflow-y: auto; /* Allow scrolling for long content */
		overflow-x: hidden;
		box-sizing: border-box;
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

	/* Card Type Badge Styles */
	.card-type-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-family: var(--font-display, 'Orbitron', monospace);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		align-self: flex-start;
		opacity: 0;
		animation: badge-materialize 600ms ease-out 400ms forwards;
		border: 2px solid;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	/* Primary Success - Victory (Gold) */
	.card-type-badge[data-type='primary-success'] {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border-color: var(--color-brand-yellow, #ffd700);
		color: var(--color-brand-yellow, #ffd700);
		box-shadow:
			0 0 15px rgba(255, 215, 0, 0.4),
			inset 0 0 10px rgba(255, 215, 0, 0.1);
	}

	.card-type-badge[data-type='primary-success'] .type-icon {
		color: var(--color-brand-yellow, #ffd700);
		filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
	}

	/* Failure Counter - Doom (Red) */
	.card-type-badge[data-type='failure-counter'] {
		background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(185, 28, 28, 0.15));
		border-color: #ff0055;
		color: #ff0055;
		box-shadow:
			0 0 15px rgba(255, 0, 85, 0.4),
			inset 0 0 10px rgba(255, 0, 85, 0.1);
	}

	.card-type-badge[data-type='failure-counter'] .type-icon {
		color: #ff0055;
		filter: drop-shadow(0 0 4px rgba(255, 0, 85, 0.6));
	}

	/* Narrative - Bonus (Cyan) */
	.card-type-badge[data-type='narrative'] {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 200, 200, 0.15));
		border-color: var(--color-neon-cyan, #00ffff);
		color: var(--color-neon-cyan, #00ffff);
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.4),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	.card-type-badge[data-type='narrative'] .type-icon {
		color: var(--color-neon-cyan, #00ffff);
		filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.6));
	}

	/* Challenge - Danger (Orange) */
	.card-type-badge[data-type='challenge'] {
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.15));
		border-color: #ff8800;
		color: #ff8800;
		box-shadow:
			0 0 15px rgba(255, 136, 0, 0.4),
			inset 0 0 10px rgba(255, 136, 0, 0.1);
	}

	.card-type-badge[data-type='challenge'] .type-icon {
		color: #ff8800;
		filter: drop-shadow(0 0 4px rgba(255, 136, 0, 0.6));
	}

	/* Event - Safe (Green) */
	.card-type-badge[data-type='event'] {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15));
		border-color: #00ff88;
		color: #00ff88;
		box-shadow:
			0 0 15px rgba(0, 255, 136, 0.4),
			inset 0 0 10px rgba(0, 255, 136, 0.1);
	}

	.card-type-badge[data-type='event'] .type-icon {
		color: #00ff88;
		filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.6));
	}

	@keyframes badge-materialize {
		0% {
			opacity: 0;
			transform: translateX(-20px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.type-icon {
		flex-shrink: 0;
	}

	.type-label {
		white-space: nowrap;
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
			width: 95%;
			max-width: 95%;
			min-height: 350px;
			--aug-tl: 12px;
			--aug-tr: 12px;
			--aug-br: 12px;
			--aug-bl: 12px;
		}

		.byte-shell {
			min-height: 350px;
			padding: var(--space-lg, 1.5rem);
		}

		.byte-data {
			font-size: var(--text-base, 1rem);
		}

		.card-type-badge {
			font-size: 0.75rem;
			padding: 0.4rem 0.75rem;
			gap: 0.375rem;
		}

		.card-type-badge .type-icon {
			width: 14px;
			height: 14px;
		}

		:global(.neural-cta-wrapper .aug-button) {
			padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
			font-size: var(--text-sm, 0.875rem);
			min-height: 44px; /* Ensure touch target size */
		}
	}

	@media (max-width: 450px) or (max-height: 667px) {
		.byte-container {
			min-height: 250px;
			width: 98%;
			max-width: 98%;
			margin: 0;
			--aug-tl: 8px;
			--aug-tr: 8px;
			--aug-br: 8px;
			--aug-bl: 8px;
		}

		.byte-shell {
			min-height: 250px;
			padding: var(--space-md, 1rem);
		}

		.byte-data {
			font-size: var(--text-sm, 0.875rem);
			line-height: var(--line-height-base, 1.5);
		}

		.byte-id {
			font-size: 0.625rem;
		}

		.card-type-badge {
			font-size: 0.65rem;
			padding: 0.3rem 0.6rem;
			gap: 0.3rem;
		}

		.card-type-badge .type-icon {
			width: 12px;
			height: 12px;
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
		.byte-id,
		.card-type-badge {
			animation: none !important;
			opacity: 1 !important;
		}

		:global(.neural-cta-wrapper .aug-button:hover:not(:disabled)) {
			transform: none;
		}
	}
</style>
