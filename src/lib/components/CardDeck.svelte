<script>
	import { sleep } from '../utils/timing.js';
	import { logger } from '../utils/logger.js';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
	import { autoAdvance } from '../utils/autoPlay.js';
	import CardDisplay from './card/CardDisplay.svelte';

	let {
		card = $bindable(null),
		animationStage = $bindable('idle'),
		onrequestcard = () => {},
		onconfirmcard = () => {}
	} = $props();

	// animationStage is now bindable so changes propagate to parent
	let particles = $state([]);

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
	async function handleProceed() {
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
				// Don't trigger auto-draw on error
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
			// Don't trigger auto-draw on error
		}
	}

	/**
	 * Auto-trigger card draw when entering idle state
	 * Uses direct function call instead of $effect to avoid infinite loops
	 * CRITICAL: Only auto-trigger if we're still in drawCard state AND have cards to draw
	 * This prevents infinite loop when confirmCard() transitions to next phase
	 *
	 * NOTE: This handles auto-drawing the NEXT card after dismissing the current one.
	 * The autoContinueAfterReading setting controls whether cards auto-dismiss after reading,
	 * but doesn't control whether the next card auto-draws.
	 */
	function triggerAutoDrawIfNeeded() {
		// Auto-draw next card if we're in drawCard state with cards to draw
		// This applies to both manual and auto modes - dismissing a card should
		// automatically proceed to draw the next one
		if (gameState.state === 'drawCard' && gameState.cardsToDraw > 0) {
			// Small delay to avoid immediate re-trigger and allow UI to settle
			setTimeout(() => {
				handleProceed();
			}, 100);
		}
	}

	/**
	 * Auto-read card and auto-continue when revealed
	 * ✅ FIXED: Guard pattern to prevent multiple TTS triggers for same card
	 * ✅ FIXED: Guard variable must be plain variable, not $state (prevents reactive loop)
	 */
	let autoPlayCanceller = null; // Plain variable - no need for $state, just holds reference
	let lastRevealedCardId = ''; // Plain variable - used only for comparison, not rendering

	$effect(() => {
		if (animationStage === 'revealed' && card) {
			const cardId = `${card.card}-${card.suit}`;

			// Only trigger TTS and auto-continue for NEW card revelations
			if (cardId !== lastRevealedCardId) {
				lastRevealedCardId = cardId;

				const audioSettings = getAudioSettings();
				const gameplaySettings = getGameplaySettings();

				// Build card text for TTS
				const cardText = `${card.description}. ${card.story || ''}`;

				// Auto-read if enabled
				if (audioSettings.autoReadCards) {
					speak(cardText).then(() => {
						// After reading, auto-continue if enabled
						if (gameplaySettings.autoContinueAfterReading) {
							autoPlayCanceller = autoAdvance({
								text: null,
								shouldRead: false,
								action: () => handleDismiss()
							});
						}
					});
				}
				// Just auto-continue without reading if enabled
				else if (gameplaySettings.autoContinueAfterReading) {
					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => handleDismiss()
					});
				}
			}
		} else if (animationStage !== 'revealed') {
			// Reset when leaving revealed state (allows same card to be shown again later)
			lastRevealedCardId = '';
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
	async function handleDismiss() {
		if (animationStage !== 'revealed') return;

		// Cancel auto-play on manual interaction
		if (autoPlayCanceller) {
			autoPlayCanceller.cancel();
			autoPlayCanceller = null;
		}

		animationStage = 'dismissing';
		await sleep(ANIMATION_DURATION.CARD_DISMISS);

		// Notify parent that card was confirmed
		onconfirmcard();

		// Reset state
		animationStage = 'idle';
		particles = []; // Clear particles
		card = null;

		// Trigger auto-draw if conditions are met (event-driven, not $effect)
		triggerAutoDrawIfNeeded();
	}

	/**
	 * Handle button click based on current stage
	 */
	export async function onButtonClick() {
		if (animationStage === 'idle') {
			await handleProceed();
		} else if (animationStage === 'revealed') {
			await handleDismiss();
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
			await handleDismiss();
		} else {
			animationStage = 'idle';
			particles = [];
			card = null;
			// Don't trigger auto-draw on manual reset
		}
	};

</script>

<div class="dc-card-deck" class:active={animationStage !== 'idle'}>
	<!-- Card Display Component -->
	<CardDisplay {card} {animationStage} onDismiss={handleDismiss} />
</div>

<style>
	/* ============================================
	   CARD DECK CONTAINER
	   ============================================ */

	.dc-card-deck {
		display: flex;
		width: 100%;
		height: 100%;
		max-height: calc(100svh - var(--toolbar-height, 250px)); /* Account for toolbar height */
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: var(--space-md, 1rem);
	}
</style>