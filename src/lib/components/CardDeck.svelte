<script>
	import { onDestroy, untrack } from 'svelte';
	import { sleep } from '../utils/timing.js';
	import { logger } from '../utils/logger.js';
	import { gameState } from '../stores/gameStore.svelte.js';
	import {
		getAudioSettings,
		getGameplaySettings,
		speak,
		awaitNarration,
		stopNarration
	} from '../stores/audioStore.svelte.js';
	import { autoAdvance } from '../utils/autoPlay.js';
	import CardDisplay from './card/CardDisplay.svelte';
	import {
		endsGameOnConfirm,
		getCardHoldMs,
		getContinueAction,
		getKingNumber,
		getMechanicNote,
		getModifierNote,
		isFinalKing
	} from './card/cardInfo.js';
	import { createHoldTimer } from './card/holdTimer.js';
	import { CARD_GUARD_MS, createDrawBeat } from './card/drawBeat.js';
	import { ANIMATION_DURATION } from '../constants/animations.js';

	let {
		card = $bindable(null),
		animationStage = $bindable('idle'),
		onrequestcard = () => {},
		onconfirmcard = () => {}
	} = $props();

	// Card to card in about 0.57s: dismiss 220ms, the gap before the next draw (DRAW_PAUSE, 100ms),
	// then the face rises in 250ms. It takes input 400ms after it appears (CARD_GUARD_MS)
	const RISE_MS = 250;
	const DISMISS_MS = 220;
	const NEXT_DRAW_MS = ANIMATION_DURATION.DRAW_PAUSE;
	// The fourth King: the card holds while its skulls flare (4 x 120ms stagger), then the ending
	const DOOM_HOLD_MS = 700;

	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

	const note = $derived(getMechanicNote(card, gameState));
	const modifierNote = $derived(getModifierNote(card, gameState));
	const kingNumber = $derived(getKingNumber(card, gameState));
	const continueAction = $derived(getContinueAction(card, gameState));

	/**
	 * Draw a card and show it: the face rises with all its text present.
	 */
	let drawing = false;
	async function handleProceed() {
		if (animationStage !== 'idle' || drawing) return;
		// A draw in hand (a tap or Space during the beat) replaces the pending one: never two
		drawBeat.cancel();
		drawing = true;

		try {
			onrequestcard();

			// The store sets the card synchronously; allow a short wait just in case
			let attempts = 0;
			while (!card && attempts < 20) {
				await sleep(50);
				attempts++;
			}
			if (!card) {
				logger.error('Card was not provided in time');
				return;
			}

			// The card can be dismissed once it has risen and been up CARD_GUARD_MS, with or
			// without motion (game-copy-s-01): until then a tap, Space or Enter does nothing
			animationStage = 'materializing';
			await sleep(Math.max(reducedMotion() ? 0 : RISE_MS, CARD_GUARD_MS));
			if (animationStage === 'materializing') animationStage = 'revealed';
		} catch (error) {
			logger.error('Proceed to byte failed:', error);
			animationStage = 'idle';
		} finally {
			drawing = false;
		}
	}

	const roundHasCards = () => gameState.state === 'drawCard' && gameState.cardsToDraw > 0;

	// The beat before the next card: it is drawn once, after the beat or at a tap, whichever
	// comes first, and not at all if the round or the game moved on meanwhile
	const drawBeat = createDrawBeat({
		draw: () => handleProceed(),
		canDraw: roundHasCards,
		ms: NEXT_DRAW_MS
	});
	onDestroy(() => drawBeat.cancel());

	/**
	 * Dismissing a card while more remain in the round draws the next one after the beat,
	 * in manual and auto-play alike.
	 */
	function triggerAutoDrawIfNeeded() {
		if (roundHasCards()) drawBeat.schedule();
	}

	/**
	 * Draw the next card now, if the table is empty and the round has one: the deal's first card,
	 * and a tap on the table during the beat. A no-op while a card is up.
	 */
	export async function draw() {
		if (animationStage === 'idle' && roundHasCards()) await handleProceed();
	}

	// ===== AUTO-PLAY =====
	// With read-aloud on, the card is read and then auto-advance waits its usual delay: nothing
	// moves on under the voice (so an ending never shows while its card is still being read).
	// With read-aloud off, the card holds long enough to read it (see getCardHoldMs),
	// pausing while the player is reading, with a thin progress line on the card.
	let autoPlayCanceller = null; // plain variables: no need to be reactive
	let narrationWait = null; // the wait for the voice to finish this card (awaitNarration)
	let holdTimer = null;
	let holdFrame = null;
	let lastRevealedCardId = '';
	let reading = false;
	let holdProgress = $state(null);

	function stopHold() {
		holdTimer?.cancel();
		holdTimer = null;
		cancelAnimationFrame(holdFrame);
		holdFrame = null;
		holdProgress = null;
	}

	function startHold(ms) {
		stopHold();
		holdTimer = createHoldTimer(ms, () => handleDismiss());
		if (reading) holdTimer.pause();
		const reduced = reducedMotion();
		const tick = () => {
			if (!holdTimer) return;
			const progress = holdTimer.progress();
			// Reduced motion: the line steps in quarters instead of gliding
			holdProgress = reduced ? Math.floor(progress * 4) / 4 : progress;
			holdFrame = requestAnimationFrame(tick);
		};
		tick();
	}

	function onReadingChange(isReading) {
		reading = isReading;
		if (!holdTimer) return;
		if (isReading) holdTimer.pause();
		else holdTimer.resume();
	}

	function cancelAutoPlay() {
		autoPlayCanceller?.cancel();
		autoPlayCanceller = null;
		narrationWait?.cancel();
		narrationWait = null;
		stopHold();
	}

	function startAutoPlay(shown) {
		const audioSettings = getAudioSettings();
		const gameplaySettings = getGameplaySettings();

		if (audioSettings.autoReadCards) {
			speak(`${shown.description}. ${shown.story || ''}`);
			// Only once the voice has finished the card (or was switched off) may it move on
			narrationWait = awaitNarration();
			narrationWait.promise.then((ended) => {
				narrationWait = null;
				if (!ended || animationStage !== 'revealed' || card !== shown) return;
				if (gameplaySettings.autoContinueAfterReading) {
					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => handleDismiss()
					});
				}
			});
		} else if (gameplaySettings.autoContinueAfterReading) {
			startHold(getCardHoldMs(shown));
		}
	}

	$effect(() => {
		if (animationStage === 'revealed' && card) {
			const cardId = `${card.card}-${card.suit}`;

			// Only trigger TTS and auto-continue for NEW card revelations
			if (cardId !== lastRevealedCardId) {
				lastRevealedCardId = cardId;

				// Untracked: a settings change must not cancel this card's hold or re-read it
				untrack(() => startAutoPlay(card));
			}
		} else if (animationStage !== 'revealed') {
			// Reset when leaving revealed state (allows same card to be shown again later)
			lastRevealedCardId = '';
		}

		return cancelAutoPlay;
	});

	/**
	 * Continue past the card: it lifts away in 220ms and the next step begins.
	 * The fourth King instead holds while its skulls flare, then the ending takes over.
	 */
	async function handleDismiss() {
		if (animationStage !== 'revealed') return;
		cancelAutoPlay();

		// The ending follows this card: a voice still reading it stops here, so the staging
		// and the ending never play under it (the next card's reading replaces it otherwise)
		if (endsGameOnConfirm(card, gameState)) stopNarration();

		if (isFinalKing(card, gameState) && !reducedMotion()) {
			animationStage = 'doom';
			await sleep(DOOM_HOLD_MS);
			// Ends the game; the overlay fades out over the ending's backdrop
			onconfirmcard();
			return;
		}

		animationStage = 'dismissing';
		await sleep(reducedMotion() ? 0 : DISMISS_MS);

		onconfirmcard();
		animationStage = 'idle';
		card = null;

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
</script>

<div class="dc-card-deck" class:active={animationStage !== 'idle'}>
	<CardDisplay
		{card}
		{animationStage}
		onDismiss={handleDismiss}
		{note}
		{modifierNote}
		{kingNumber}
		{continueAction}
		{holdProgress}
		{onReadingChange}
		riseMs={RISE_MS}
		dismissMs={DISMISS_MS}
	/>
</div>

<style>
	/* The column below the progress line: the card fills it, up to its own cap (CardDisplay) */
	.dc-card-deck {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1 1 auto;
		width: 100%;
		min-height: 0;
		/* Visible so the card glow is not cut off at the deck edge */
		overflow: visible;
	}
</style>
