/**
 * useCardAnimationState - Card animation state management composable
 *
 * Manages the card reveal animation state machine and timing:
 * - Animation stages: idle → anticipating → materializing → revealed → dismissing
 * - Auto-play integration
 * - Button state (text, disabled)
 * - Public API for external control
 *
 * @returns {Object} Card animation state and methods
 */

import { sleep } from '../utils/timing.js';
import { logger } from '../utils/logger.js';
import { ANIMATION_DURATION } from '$lib/constants/animations.js';
import { gameState } from '../stores/gameStore.svelte.js';
import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
import { autoAdvance } from '../utils/autoPlay.js';

export function useCardAnimationState() {
	// Animation stage state machine
	let animationStage = $state('idle');

	// Current card reference
	let card = $state(null);

	// Auto-play cancellation token
	let autoPlayCanceller = $state(null);

	/**
	 * Request card and start anticipation animation
	 */
	async function onProceed(onRequestCard) {
		if (animationStage !== 'idle') return;

		try {
			// Request a new card from the parent
			onRequestCard();

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
	 * CRITICAL: Only auto-trigger if we're still in drawCard state AND have cards to draw
	 */
	function triggerAutoDrawIfNeeded(onProceedCallback) {
		const gameplaySettings = getGameplaySettings();

		// Only auto-draw when:
		// 1. Auto-continue is enabled
		// 2. Still in drawCard state with cards to draw
		if (
			gameplaySettings.autoContinueAfterReading &&
			gameState.state === 'drawCard' &&
			gameState.cardsToDraw > 0
		) {
			// Small delay to avoid immediate re-trigger and allow UI to settle
			setTimeout(() => {
				onProceedCallback();
			}, 100);
		}
	}

	/**
	 * Auto-read card and auto-continue when revealed
	 */
	function setupAutoPlay(onDismissCallback) {
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
						autoPlayCanceller = autoAdvance({
							text: null,
							shouldRead: false,
							action: onDismissCallback
						});
					}
				});
			}
			// Just auto-continue without reading if enabled
			else if (gameplaySettings.autoContinueAfterReading) {
				autoPlayCanceller = autoAdvance({
					text: null,
					shouldRead: false,
					action: onDismissCallback
				});
			}
		}
	}

	/**
	 * Cancel auto-play
	 */
	function cancelAutoPlay() {
		if (autoPlayCanceller) {
			autoPlayCanceller.cancel();
			autoPlayCanceller = null;
		}
	}

	/**
	 * Handle dismiss/continue - upload animation and notify parent
	 */
	async function onDismiss(onConfirmCard, onProceedCallback) {
		if (animationStage !== 'revealed') return;

		// Cancel auto-play on manual interaction
		cancelAutoPlay();

		animationStage = 'dismissing';
		await sleep(ANIMATION_DURATION.CARD_DISMISS);

		// Notify parent that card was confirmed
		onConfirmCard();

		// Reset state
		animationStage = 'idle';
		card = null;

		// Trigger auto-draw if conditions are met (event-driven, not $effect)
		triggerAutoDrawIfNeeded(onProceedCallback);
	}

	/**
	 * Handle button click based on current stage
	 */
	async function onButtonClick(onRequestCard, onConfirmCard, onProceedCallback) {
		if (animationStage === 'idle') {
			await onProceed(onRequestCard);
		} else if (animationStage === 'revealed') {
			await onDismiss(onConfirmCard, onProceedCallback);
		}
	}

	/**
	 * Set card (called by parent when card is ready)
	 */
	function setCard(newCard) {
		card = newCard;
	}

	/**
	 * Manually trigger card display
	 */
	async function showCard(newCard) {
		card = newCard;
		if (animationStage === 'anticipating') {
			// Card arrived, continue animation
			return;
		}
		// Otherwise start from beginning
		animationStage = 'materializing';
		await sleep(1000);
		animationStage = 'revealed';
	}

	/**
	 * Reset the interface
	 */
	async function reset(onConfirmCard, onProceedCallback) {
		if (animationStage === 'revealed') {
			await onDismiss(onConfirmCard, onProceedCallback);
		} else {
			animationStage = 'idle';
			card = null;
			// Don't trigger auto-draw on manual reset
		}
	}

	// Reactive button text
	const buttonText = $derived.by(() => {
		if (animationStage === 'idle') return 'PROCEED TO NEXT BYTE';
		if (animationStage === 'anticipating' || animationStage === 'materializing')
			return 'LOADING...';
		if (animationStage === 'revealed') return 'CONTINUE';
		return 'UPLOADING...';
	});

	// Reactive button disabled state
	const isButtonDisabled = $derived(
		animationStage === 'anticipating' ||
			animationStage === 'materializing' ||
			animationStage === 'dismissing'
	);

	return {
		// State (read-only via getters)
		get animationStage() {
			return animationStage;
		},
		get card() {
			return card;
		},
		get buttonText() {
			return buttonText;
		},
		get isButtonDisabled() {
			return isButtonDisabled;
		},

		// Actions
		onProceed,
		onDismiss,
		onButtonClick,
		setCard,
		showCard,
		reset,
		setupAutoPlay,
		cancelAutoPlay,
		triggerAutoDrawIfNeeded
	};
}
