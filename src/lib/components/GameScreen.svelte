<script>
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { marked } from 'marked';
	import { sanitizeHtml } from '../utils/sanitizeHtml.js';
	import '../../game.css';
	import { getAudioSettings, getGameplaySettings, speak } from '../stores/audioStore.svelte.js';
	import { autoAdvance, autoRoll } from '../utils/autoPlay.js';
	import { ANIMATION_DURATION } from '../constants/animations.js';
	import {
		formatIntroGoal,
		formatModifierNotice,
		formatResultTotals
	} from '../utils/rollResult.js';
	import { fourthAceWins, isHardGame } from '../constants/difficulty.js';
	import { createAnnouncer } from '../utils/liveAnnouncer.js';
	import { skipRoll, diceState } from '../stores/diceStore.svelte.js';
	import { saveGame } from '../stores/indexedDBStorage.js';
	import { useRuleCaptions } from '../composables/useRuleCaptions.svelte.js';

	import LoadScreen from './LoadScreen.svelte';
	import GameOver from './GameOver.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import DrawCard from './DrawCard.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import ConfirmModal from './ConfirmModal.svelte';
	import RuleCaption from './RuleCaption.svelte';
	import OverlayModal from './OverlayModal.svelte';
	import SettingsModal from './settings/SettingsModal.svelte';
	import { onMount, untrack } from 'svelte';

	// Screen-specific components
	import ContextBackground from './game/ContextBackground.svelte';
	import StepAction from './game/StepAction.svelte';

	// Screen composables
	import { useRollForTasks } from '../composables/screen/useRollForTasks.svelte.js';
	import { useFailureCheck } from '../composables/screen/useFailureCheck.svelte.js';
	import { useSuccessCheck } from '../composables/screen/useSuccessCheck.svelte.js';
	import { useInitialDamage } from '../composables/screen/useInitialDamage.svelte.js';

	// Game actions
	import {
		recordRound,
		restartGame,
		exitGame,
		getCurrentSalvationThreshold,
		isFinalStabilityCheck
	} from '../stores/gameActions.svelte.js';

	let {
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {},
		showHelpModal = $bindable(false)
	} = $props();

	const currentScreen = $derived(gameState.state);
	// Reduced from 300ms to 200ms for snappier, more mechanical feel
	const TRANSITION_DURATION = ANIMATION_DURATION.NORMAL;
	// The static roll fades as the 3D dice sink (OWN-6); under reduced motion, a short fade
	const staticRollFadeMs = () =>
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? ANIMATION_DURATION.DICE_SINK_REDUCED
			: ANIMATION_DURATION.DICE_SINK;
	/** After the step button changes meaning, presses are held off this long (it is highlighted) */
	const STEP_GUARD_MS = 400;

	// Instantiate screen composables
	const rollForTasks = useRollForTasks();
	const failureCheck = useFailureCheck(onfailurecheckcompleted);
	const successCheck = useSuccessCheck();
	const initialDamage = useInitialDamage();

	let showExitModal = $state(false);
	let showSettingsModal = $state(false);

	// Overlays (card, journal) and dialogs cover the table: rule captions wait while they do
	const overlayOpen = $derived(
		currentScreen === 'drawCard' ||
			currentScreen === 'log' ||
			currentScreen === 'finalLog' ||
			showExitModal ||
			showSettingsModal ||
			showHelpModal
	);
	const captions = useRuleCaptions({ isPaused: () => overlayOpen });

	const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

	/**
	 * "7♠": the card behind a Stability check, on the readout's card tab (OWN-4). Its text was
	 * read in full on the card a moment before; on the board it is only the check's cause.
	 */
	const cardName = (card) => (card ? `${card.card}${SUIT_SYMBOLS[card.suit] ?? ''}` : null);

	/**
	 * What a modifier card just did, on the first table screen after it (NV-06): its own
	 * Stability check, or Salvation when it was the round's last card. Once that step is done
	 * the notice is gone, so a later screen never reads as if it were the one affected. A
	 * modifier that did nothing ("No King was out to return") has no notice (OWN-4).
	 */
	let noticeDoneFor = $state(null);
	/** The modifier card whose notice is on the board now, or null */
	const noticeCard = $derived.by(() => {
		const card = gameState.lastCard;
		if (!formatModifierNotice(card?.modifierResult) || card.round !== gameState.round) return null;
		return card.id !== undefined && card.id === noticeDoneFor ? null : card;
	});
	// The board's notice drops the Kings count the HUD shows; the announcement keeps it
	// (game-copy-s-03)
	const modifierNotice = $derived(
		noticeCard && formatModifierNotice(noticeCard.modifierResult, { withTotals: false })
	);
	const modifierAnnouncement = $derived(
		noticeCard && formatModifierNotice(noticeCard.modifierResult)
	);

	// DP-1-06: one job per element. The title names the step, the description says what is at
	// stake (the target lives here, not on the button), the button names the action.
	const INSTABILITY_DESCRIPTION =
		'The situation is already precarious. 10 or less costs Stability.';
	const TASKS_DESCRIPTION = 'Your roll sets how many cards you draw, from 1 to 6.';

	function salvationDescription() {
		const need = getCurrentSalvationThreshold();
		// No target with four Aces (Normal and Hard; on Easy the fourth Ace ends the game first)
		if (need === 0) return 'No target now. Survive this Stability check and a Token comes off.';
		const miss = isHardGame(gameState) ? ' A miss adds one.' : '';
		return `You need ${need}+ to remove a Token.${miss}`;
	}

	/**
	 * On Easy the fourth Ace's check is the last roll of the game: say what is at stake. Otherwise
	 * the stakes alone (OWN-4): the cause is the card tab and the rule caption.
	 */
	function stabilityCheckDescription() {
		return isFinalStabilityCheck()
			? 'Come through this roll with any Stability left and you escape.'
			: '10 or less costs Stability.';
	}

	// Contextual background text for each screen
	const contextText = $derived.by(() => {
		switch (currentScreen) {
			case 'initialDamageRoll':
				return { title: 'Instability', description: INSTABILITY_DESCRIPTION };
			case 'rollForTasks':
				// The round opens here; after the roll the title stays and the result line gives the count
				return { title: `Round ${gameState.round}`, description: TASKS_DESCRIPTION };
			case 'failureCheck':
				return {
					title: isFinalStabilityCheck() ? 'Final Check' : 'Stability Check',
					card: cardName(gameState.lastCard),
					description: stabilityCheckDescription(),
					notice: modifierNotice
				};
			case 'successCheck':
				// DP-1-08: the notice names its card in the past tense, so it reads as it is
				return {
					title: 'Salvation',
					description: salvationDescription(),
					notice: modifierNotice
				};
			default:
				return null; // Card, journal and ending screens have no background text
		}
	});

	// What the last roll on this screen did, shown at full contrast until the player continues
	const resultLine = $derived.by(() => {
		switch (currentScreen) {
			case 'initialDamageRoll':
				return initialDamage.resultLine;
			case 'rollForTasks':
				return rollForTasks.resultLine;
			case 'failureCheck':
				return failureCheck.resultLine;
			case 'successCheck':
				return successCheck.resultLine;
			default:
				return '';
		}
	});

	// ===== The step button: one slot, mounted once, for every round step =====

	/** The intro's step has no roll, so it never rolls, holds or shows a hint */
	const INTRO_STEP = {
		buttonText: 'Begin your journey',
		buttonHint: null,
		rolling: false,
		hold: { active: false, progress: () => 0, paused: false, waiting: false }
	};

	function stepFor(screen) {
		const trigger = triggerAutoPlayForCurrentScreen;
		switch (screen) {
			// visual-layout-s-06: the intro's button is the step button, in the step slot, so the
			// primary action never moves as the board takes over; only its label changes
			case 'showIntro':
				return {
					composable: INTRO_STEP,
					testid: 'story-continue-button',
					run: () => transitionTo('initialDamageRoll')
				};
			case 'initialDamageRoll':
				return {
					composable: initialDamage,
					testid: 'initial-damage-button',
					run: () => initialDamage.handleInitialDamageRoll(trigger)
				};
			case 'rollForTasks':
				return {
					composable: rollForTasks,
					testid: 'roll-tasks-button',
					disabled: rollForTasks.buttonDisabled,
					run: () => rollForTasks.handleRollForTasks(trigger)
				};
			case 'failureCheck':
				return {
					composable: failureCheck,
					testid: 'failure-check-button',
					run: () => failureCheck.handleFailureCheck(trigger)
				};
			case 'successCheck':
				return {
					composable: successCheck,
					testid: 'success-check-button',
					run: () => successCheck.handleSuccessCheck(trigger)
				};
			default:
				return null; // The card and journal have their own controls
		}
	}

	/**
	 * The primary action of the current round step: what its button, Space/Enter and a tap
	 * on the table all do. While the dice roll, it skips to the result.
	 */
	const step = $derived.by(() => {
		const s = stepFor(currentScreen);
		if (!s) return null;
		return {
			text: s.composable.buttonText,
			hint: s.composable.buttonHint,
			busy: s.composable.rolling,
			disabled: s.disabled ?? false,
			hold: s.composable.hold,
			testid: s.testid,
			run: s.run
		};
	});

	// A result moves on by itself after a beat (the result hold). While a dialog covers the
	// table, or the tab is hidden, the hold waits, so nothing moves on unseen.
	const stepComposables = [initialDamage, rollForTasks, failureCheck, successCheck];
	let pageHidden = $state(false);
	const holdPaused = $derived(showExitModal || showSettingsModal || showHelpModal || pageHidden);
	$effect(() => {
		const paused = holdPaused;
		untrack(() => {
			for (const composable of stepComposables) {
				if (paused) composable.hold.pause();
				else composable.hold.resume();
			}
		});
	});
	function onVisibilityChange() {
		pageHidden = document.hidden;
	}

	function cancelHolds() {
		for (const composable of stepComposables) composable.hold.cancel();
	}

	// LS-06: when the button changes meaning (Roll → Rolling… → Continue), hold presses off
	// briefly and highlight it, so a press meant for the old button never lands on the new one
	let stepGuardUntil = 0;
	let stepChanged = $state(false);
	let stepChangedTimer = null;
	const stepMeaning = $derived(
		step ? `${currentScreen}|${step.text}|${step.hint ?? ''}|${step.disabled}` : ''
	);
	$effect(() => {
		// The intro's button is the first step button: there is no earlier one to guard against
		if (!stepMeaning || currentScreen === 'showIntro') return;
		stepGuardUntil = performance.now() + STEP_GUARD_MS;
		stepChanged = true;
		clearTimeout(stepChangedTimer);
		stepChangedTimer = setTimeout(() => (stepChanged = false), STEP_GUARD_MS);
	});

	/** Run the step action, unless it is disabled or has only just changed meaning */
	function runStep() {
		if (!step || step.disabled || leaving) return false;
		if (performance.now() < stepGuardUntil) return false;
		cancelAutoPlay();
		step.run();
		return true;
	}

	// ===== Screen reader: one polite live region for results, events and captions =====
	let liveMessage = $state('');
	const announcer = createAnnouncer((message) => (liveMessage = message));
	// DP-1-07: the result line carries no totals (the HUD shows them); the announcement adds them
	function resultTotals() {
		const totals = {
			stability: gameState.tower,
			tokens: Math.max(0, gameState.tokens),
			start: gameState.config?.options?.startingTokens || 10
		};
		switch (currentScreen) {
			case 'initialDamageRoll':
			case 'failureCheck':
				return formatResultTotals('stability', totals);
			case 'successCheck':
				return formatResultTotals(
					getCurrentSalvationThreshold() === 0 ? 'salvation-four' : 'salvation',
					totals
				);
			default:
				return '';
		}
	}
	$effect(() => {
		if (resultLine) {
			const line = resultLine;
			untrack(() => announcer.announce(`${line}${resultTotals()}`, { first: true }));
		}
	});
	$effect(() => {
		if (modifierAnnouncement) announcer.announce(modifierAnnouncement);
	});
	let announcedCaption = null;
	$effect(() => {
		const caption = captions.current;
		if (!caption || captions.paused || caption.id === announcedCaption) return;
		announcedCaption = caption.id;
		untrack(() => announcer.announce(caption.text));
	});
	let seenKings = untrack(() => gameState.kingsRevealed);
	let seenSalvation = untrack(() => gameState.aceOfHeartsRevealed);
	$effect(() => {
		const kings = gameState.kingsRevealed;
		const salvation = gameState.aceOfHeartsRevealed;
		if (kings > seenKings) {
			announcer.announce(`King revealed. ${kings} of 4.`, { first: true });
		} else if (salvation && !seenSalvation) {
			announcer.announce('Salvation unlocked. The Ace of Hearts has appeared.', { first: true });
		}
		seenKings = kings;
		seenSalvation = salvation;
	});

	// The ending owns the screen: no status HUD over it
	const showStatusHUD = $derived(currentScreen !== 'gameOver' && currentScreen !== 'finalLog');

	// The intro's closing line, built from this game's numbers
	const introGoal = $derived(
		formatIntroGoal({
			stability: gameState.tower,
			tokens: gameState.tokens,
			aceRevealed: gameState.aceOfHeartsRevealed,
			fourthAceWins: fourthAceWins(gameState)
		})
	);

	/**
	 * visual-layout-s-06: the intro covers the table except the step slot, whose button begins
	 * the game. Its edge is measured from the slot: above it (portrait phones, tablets, desktop;
	 * on phones the hidden header's row stays below the button, where the header will be), or
	 * left of it in the landscape action column (the same query as the CSS).
	 */
	const ACTION_COLUMN_QUERY = '(max-height: 500px) and (orientation: landscape)';
	let gameScreenEl = $state();
	let stepSlotEl = $state();
	let introInset = $state({ bottom: 0, right: 0 });
	function measureIntroInset() {
		if (!gameScreenEl || !stepSlotEl) return;
		const screen = gameScreenEl.getBoundingClientRect();
		const slot = stepSlotEl.getBoundingClientRect();
		const anchor = (stepSlotEl.querySelector('.step-action') ?? stepSlotEl).getBoundingClientRect();
		const column = window.matchMedia?.(ACTION_COLUMN_QUERY).matches === true;
		const bottom = column ? 0 : Math.max(0, Math.round(screen.bottom - anchor.top));
		const right = column ? Math.max(0, Math.round(screen.right - slot.left)) : 0;
		if (bottom !== introInset.bottom || right !== introInset.right) introInset = { bottom, right };
	}
	$effect(() => {
		if (currentScreen !== 'showIntro' || !gameScreenEl || !stepSlotEl) return;
		measureIntroInset();
		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measureIntroInset);
		// The screen, the slot, and the table it sits in (it moves when the header row resizes)
		observer.observe(gameScreenEl);
		observer.observe(stepSlotEl);
		if (stepSlotEl.parentElement) observer.observe(stepSlotEl.parentElement);
		document.fonts?.ready.then(measureIntroInset);
		return () => observer.disconnect();
	});

	// The intro column: a fade mask and a scroll cue while there is more text below
	let introScroller = $state();
	let introOverflows = $state(false);
	let introAtEnd = $state(true);
	function measureIntro() {
		if (!introScroller) return;
		const { scrollTop, scrollHeight, clientHeight } = introScroller;
		introOverflows = scrollHeight > clientHeight + 1;
		introAtEnd = scrollTop + clientHeight >= scrollHeight - 8;
	}
	$effect(() => {
		if (!introScroller || typeof ResizeObserver === 'undefined') return;
		// The observer's first callback comes after layout, so the cue never flashes on a column that fits
		const observer = new ResizeObserver(measureIntro);
		observer.observe(introScroller);
		if (introScroller.firstElementChild) observer.observe(introScroller.firstElementChild);
		return () => observer.disconnect();
	});
	function scrollIntro() {
		introScroller?.scrollBy({ top: introScroller.clientHeight * 0.8, behavior: 'smooth' });
	}

	// DrawCard ref for auto-draw on screen entry
	let drawCardRef = $state();

	// JournalEntry button state
	let journalSaved = $state(false);
	const journal = $state({ text: '', audioData: null });

	async function handleJournalSave() {
		// Always save journal entry (text and audio are both optional)
		await recordRound(journal);
		journal.text = '';
		journal.audioData = null;
		journalSaved = true;
		onjournalsaved(journal);
	}

	async function handleJournalRestart() {
		await restartGame();
	}

	async function handleJournalExit() {
		await exitGame();
		// Full page reload to ensure clean state
		if (typeof window !== 'undefined') {
			window.location.href = '/';
		} else {
			goto(resolve('/'));
		}
	}

	function handleExitClick() {
		showExitModal = true;
	}

	function handleHelpClick() {
		showHelpModal = true;
	}

	function handleSettingsClick() {
		showSettingsModal = true;
	}

	function handleSettingsClose() {
		showSettingsModal = false;
	}

	/** Set while leaving: no auto-play, auto-deal or auto-draw may start */
	let leaving = false;

	/**
	 * Leave for the home screen with the progress saved, as the Exit dialog promises:
	 * a roll in flight lands first, a result on screen is committed (as Continue would),
	 * then the game is saved and the run is reset, so the next game starts clean.
	 */
	async function handleExitConfirm() {
		showExitModal = false;
		leaving = true;
		cancelAutoPlay();
		cancelHolds();

		const current = stepFor(currentScreen);
		if (current?.composable.rolling) {
			skipRoll();
			for (let i = 0; i < 40 && current.composable.rolling; i++) {
				await new Promise((r) => setTimeout(r, 25));
			}
		}
		if (current && current.composable.result !== undefined && !current.composable.rolling) {
			await current.run();
		}
		// An ending reached on the way was saved as a completed game already
		if (gameState.state !== 'gameOver') await saveGame(gameState);

		await goto(resolve('/'));
		await exitGame();
	}

	function handleExitCancel() {
		showExitModal = false;
	}

	// Buttons that live outside the round steps (the journal)
	const OTHER_PRIMARY_BUTTONS = ['journal-save-button', 'journal-next-button'];

	function clickVisiblePrimaryButton() {
		for (const testid of OTHER_PRIMARY_BUTTONS) {
			const button = document.querySelector(`[data-testid="${testid}"]`);
			if (button && !button.disabled && button.getClientRects().length > 0) {
				button.click();
				return true;
			}
		}
		return false;
	}

	/**
	 * Global keyboard shortcut handler
	 * Space/Enter trigger the visible, enabled primary button of the current step.
	 * A focused button, link or field keeps its own native behaviour.
	 */
	function handleKeyPress(event) {
		if (event.key !== ' ' && event.key !== 'Enter') return;
		if (event.defaultPrevented || event.repeat) return;

		// Typing, or a focused control that activates itself
		const target = event.target;
		if (
			target.isContentEditable ||
			target.closest?.('input, textarea, select, button, a, summary, [role="button"]')
		) {
			cancelAutoPlay();
			return;
		}

		// Ignore if a modal is open
		if (showExitModal || showSettingsModal || showHelpModal) {
			return;
		}

		// Cancel any auto-play on user interaction
		cancelAutoPlay();

		if (step) {
			event.preventDefault();
			runStep();
		} else if (currentScreen === 'drawCard') {
			// The card is the control on this step
			if (drawCardRef && !drawCardRef.isButtonDisabled()) {
				event.preventDefault();
				drawCardRef.handleButtonClick();
			}
		} else if (clickVisiblePrimaryButton()) {
			event.preventDefault();
		}
	}

	/**
	 * Handle clicks on the table: does exactly what the visible primary button does,
	 * and only while that button is enabled. Never advances without a button.
	 */
	function handleScreenClick(event) {
		// Cancel any auto-play on user interaction
		cancelAutoPlay();

		// Ignore clicks on buttons, inputs, textareas, and links
		const target = event.target;
		const isInteractive =
			target.tagName === 'BUTTON' ||
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'A' ||
			target.closest('button') ||
			target.closest('a') ||
			target.closest('[role="button"]');

		if (isInteractive) {
			return;
		}

		// Ignore if a modal is open
		if (showExitModal || showSettingsModal || showHelpModal) {
			return;
		}

		// On the draw step the card is the control. Between cards (the beat before the next
		// one, OWN-7) there is none on the table, so a tap there draws the next card now rather
		// than being lost; while a card is up it does nothing.
		if (currentScreen === 'drawCard') {
			drawCardRef?.draw();
			return;
		}

		// The intro begins from its button (or Space/Enter) only, never from a stray tap beside it
		if (currentScreen === 'showIntro') return;

		runStep();
	}

	/** AC-03: the skip link takes keyboard users from the header straight to the step button */
	function skipToStep(event) {
		event.preventDefault();
		document.querySelector('#step-action button')?.focus();
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			leaving = true;
			cancelAutoPlay();
			cancelHolds();
			announcer.clear();
			clearTimeout(drawTimer);
			clearTimeout(stepChangedTimer);
		};
	});

	// ===== AUTO-PLAY (Event-driven, NOT using $effect to avoid infinite loops) =====
	let autoPlayCanceller = $state(null);

	// Cancel auto-play when screen changes or user interacts
	function cancelAutoPlay() {
		if (autoPlayCanceller) {
			autoPlayCanceller.cancel();
			autoPlayCanceller = null;
		}
	}

	// LS-07: arm auto-play the moment it is switched on, and drop the pending step when it is
	// switched off (the header toggle only changes the setting)
	const autoPlayOn = $derived.by(() => {
		const gameplay = getGameplaySettings();
		return gameplay.autoRollDice || gameplay.autoContinueAfterReading;
	});
	let autoPlayWasOn = untrack(() => autoPlayOn);
	$effect(() => {
		const on = autoPlayOn;
		if (on === autoPlayWasOn) return;
		autoPlayWasOn = on;
		untrack(() => {
			cancelAutoPlay();
			if (on) triggerAutoPlayForCurrentScreen();
		});
	});

	/**
	 * SINGLE UNIFIED SCREEN CHANGE HANDLER
	 * ✅ FIXED: Use guard pattern to prevent re-triggering on same screen
	 * Consolidates all screen-entry logic to avoid multiple $effect blocks interfering
	 * Handles: state resets, keyboard hints, auto-play triggers
	 */
	let lastScreen = '';
	$effect(() => {
		// Only run when screen actually changes
		if (currentScreen !== lastScreen) {
			const left = lastScreen;
			lastScreen = currentScreen;
			const screen = currentScreen;

			untrack(() => {
				// Cancel previous screen's auto-play
				cancelAutoPlay();
				// NV-04: clear the step just left, so its next visit starts clean. Reset on entry
				// came after the first render, which showed (and announced) the last visit's result.
				resetStep(left);
				// NV-06: a modifier's notice belongs to the first table screen after its card
				if ((left === 'failureCheck' || left === 'successCheck') && modifierNotice) {
					noticeDoneFor = gameState.lastCard?.id;
				}
				// A game saved mid-roll resumes on that roll's result
				if (screen === 'successCheck') successCheck.resumePending();
			});

			// Handle screen-specific entry logic (delay to next tick)
			setTimeout(() => {
				handleScreenEntry(screen);
			}, 0);
		}
	});

	function resetStep(screen) {
		switch (screen) {
			case 'initialDamageRoll':
				initialDamage.resetState();
				break;
			case 'rollForTasks':
				rollForTasks.resetState();
				break;
			case 'failureCheck':
				failureCheck.resetState();
				break;
			case 'successCheck':
				successCheck.resetState();
				break;
		}
	}

	let drawTimer = null;

	/**
	 * Pure screen entry handler - called once per screen change
	 * Separated from $effect to prevent reactive loops
	 */
	function handleScreenEntry(screen) {
		if (leaving || screen !== currentScreen) return;
		switch (screen) {
			case 'rollForTasks':
				triggerAutoPlayForCurrentScreen();
				break;

			case 'showIntro':
			case 'initialDamageRoll':
			case 'failureCheck':
			case 'successCheck':
				triggerAutoPlayForCurrentScreen();
				break;

			case 'drawCard':
				// Auto-draw first card when entering drawCard state
				// Small delay to ensure CardDeck component is fully initialized
				clearTimeout(drawTimer);
				// (Draw only: a card already up from an early press is not dismissed by this)
				drawTimer = setTimeout(() => {
					if (
						!leaving &&
						gameState.state === 'drawCard' &&
						drawCardRef &&
						gameState.cardsToDraw > 0
					) {
						drawCardRef.draw();
					}
				}, 100);
				break;

			case 'log':
			case 'finalLog':
				// Reset journal state
				journalSaved = false;
				break;
		}
	}

	/**
	 * Trigger auto-play for the current screen
	 * Called directly from event handlers to avoid $effect infinite loops
	 */
	function triggerAutoPlayForCurrentScreen() {
		if (leaving) return;
		// One pending auto step at a time
		cancelAutoPlay();
		const audioSettings = getAudioSettings();
		const gameplaySettings = getGameplaySettings();

		switch (currentScreen) {
			case 'showIntro':
				if (gameplaySettings.autoContinueAfterReading) {
					const introText = gameState.config?.introduction ?? '';
					const shouldRead = audioSettings.autoReadPrompts;
					autoPlayCanceller = autoAdvance({
						text: shouldRead ? introText : null,
						shouldRead,
						action: () => transitionTo('initialDamageRoll')
					});
				}
				break;

			case 'initialDamageRoll':
				// Auto-read prompt first if enabled
				if (audioSettings.autoReadPrompts && initialDamage.result === undefined) {
					speak(`Instability. ${INSTABILITY_DESCRIPTION}`);
				}

				// Auto-roll if enabled and not yet rolled
				if (
					gameplaySettings.autoRollDice &&
					initialDamage.result === undefined &&
					!initialDamage.rolling
				) {
					autoPlayCanceller = autoRoll(() =>
						initialDamage.handleInitialDamageRoll(triggerAutoPlayForCurrentScreen)
					);
				}
				// Auto-continue after a result that does not move on by itself
				else if (
					gameplaySettings.autoContinueAfterReading &&
					initialDamage.result !== undefined &&
					!initialDamage.rolling &&
					!initialDamage.hold.active
				) {
					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => initialDamage.handleInitialDamageRoll(triggerAutoPlayForCurrentScreen)
					});
				}
				break;

			case 'rollForTasks':
				// Auto-read prompt first if enabled and not yet rolled
				if (audioSettings.autoReadPrompts && !rollForTasks.rolled) {
					speak(`Round ${gameState.round}. ${TASKS_DESCRIPTION}`);
				}

				// Auto-roll if enabled and not yet rolled. The composable reads the result out
				// ("Announce dice rolls") and deals once the voice has finished.
				if (gameplaySettings.autoRollDice && !rollForTasks.rolled && !rollForTasks.rolling) {
					autoPlayCanceller = autoRoll(() =>
						rollForTasks.handleRollForTasks(triggerAutoPlayForCurrentScreen)
					);
				}
				break;

			case 'failureCheck':
				// Auto-read prompt first if enabled and not yet rolled
				if (audioSettings.autoReadPrompts && failureCheck.result === undefined) {
					speak(stabilityCheckDescription());
				}

				// Auto-roll if enabled and not yet rolled
				if (
					gameplaySettings.autoRollDice &&
					failureCheck.result === undefined &&
					!failureCheck.rolling
				) {
					autoPlayCanceller = autoRoll(() =>
						failureCheck.handleFailureCheck(triggerAutoPlayForCurrentScreen)
					);
				}
				// Auto-continue after a result that does not move on by itself (an ending)
				else if (
					gameplaySettings.autoContinueAfterReading &&
					failureCheck.result !== undefined &&
					!failureCheck.rolling &&
					!failureCheck.hold.active
				) {
					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => failureCheck.handleFailureCheck(triggerAutoPlayForCurrentScreen)
					});
				}
				break;

			case 'successCheck':
				// Auto-read prompt first if enabled and not yet rolled
				if (audioSettings.autoReadPrompts && successCheck.result === undefined) {
					speak(`Salvation. ${salvationDescription()}`);
				}

				// Auto-roll if enabled and not yet rolled
				if (
					gameplaySettings.autoRollDice &&
					successCheck.result === undefined &&
					!successCheck.rolling
				) {
					autoPlayCanceller = autoRoll(() =>
						successCheck.handleSuccessCheck(triggerAutoPlayForCurrentScreen)
					);
				}
				// Auto-continue after a result that does not move on by itself (an ending)
				else if (
					gameplaySettings.autoContinueAfterReading &&
					successCheck.result !== undefined &&
					!successCheck.rolling &&
					!successCheck.hold.active
				) {
					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => successCheck.handleSuccessCheck(triggerAutoPlayForCurrentScreen)
					});
				}
				break;
		}
	}
</script>

<!-- LR-1-02: every screen block shares one grid cell, so an outgoing screen fading out never
     pushes the incoming one down a viewport: the intro fades in where it will stay -->
<div class="screen-stack">
	{#if currentScreen == 'loadGame'}
		<div
			class="dc-game-bg screen-block"
			data-testid="screen-loadGame"
			transition:fade={{ duration: TRANSITION_DURATION }}
		>
			<LoadScreen />
		</div>
	{:else if currentScreen == 'gameOver'}
		<div
			class="dc-screen-container screen-block"
			data-testid="screen-gameOver"
			transition:fade={{ duration: TRANSITION_DURATION }}
		>
			<GameOver />
		</div>
	{:else if currentScreen == 'exitGame'}
		<div
			class="screen-block"
			data-testid="screen-exitGame"
			transition:fade={{ duration: TRANSITION_DURATION }}
		>
			Game Exited
		</div>
	{:else}
		<div class="game-screen dc-game-bg screen-block" bind:this={gameScreenEl}>
			{#if currentScreen == 'showIntro'}
				<!-- Fades out (300ms) first; the table then fades in underneath it. First in the DOM, so
				     the story reads before the button that begins it (the button is the table's). -->
				<div
					class="dc-game-bg dc-intro-wrapper"
					data-testid="screen-showIntro"
					style:bottom="{introInset.bottom}px"
					style:right="{introInset.right}px"
					style:--intro-right="{introInset.right}px"
					in:fade|global={{ duration: TRANSITION_DURATION }}
					out:fade={{ duration: ANIMATION_DURATION.SLOW }}
				>
					<div class="intro-story-container">
						<div class="intro-scroll-area" class:overflows={introOverflows}>
							<div
								class="content"
								class:overflows={introOverflows}
								class:at-end={introAtEnd}
								bind:this={introScroller}
								onscroll={measureIntro}
							>
								<div class="intro-column">
									<h1>{gameState.config?.title || 'Game Introduction'}</h1>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via sanitizeHtml -->
									{@html sanitizeHtml(marked(gameState.config?.introduction ?? ''))}
									<p class="intro-goal" data-testid="intro-goal">{introGoal}</p>
								</div>
							</div>
							{#if introOverflows && !introAtEnd}
								<button
									type="button"
									class="intro-scroll-cue"
									aria-label="Scroll the introduction"
									onclick={scrollIntro}
									in:fade={{ duration: ANIMATION_DURATION.FAST, delay: ANIMATION_DURATION.SLOW }}
									out:fade={{ duration: ANIMATION_DURATION.FAST }}
								>
									<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
										<path
											d="M6 9l6 6 6-6"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- The table stays mounted under the intro, so the hand-off never goes through black.
			     Under the intro all of it is hidden but the step slot, whose button begins the game. -->
			<!-- UI Content Layer -->
			<div class="ui-content-layer" class:behind-intro={currentScreen == 'showIntro'}>
				{#if step && currentScreen != 'showIntro'}
					<!-- AC-03: the first tab stop skips the header and goes to the step button -->
					<a class="skip-link" href="#step-action" onclick={skipToStep}>Skip to action</a>
				{/if}
				{#if showStatusHUD}
					<div
						class="status-display-area"
						data-testid="status-display"
						inert={currentScreen == 'showIntro'}
					>
						<StatusDisplay
							onHelpClick={handleHelpClick}
							onExitClick={handleExitClick}
							onSettingsClick={handleSettingsClick}
						/>
					</div>
				{/if}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="main-screen-area dc-table-bg" onclick={handleScreenClick}>
					<!-- The readout: card tab, title, stakes or result, notice tab, every slot reserved (OWN-4) -->
					<ContextBackground {contextText} {resultLine} />

					{#key currentScreen}
						{#if currentScreen == 'drawCard'}
							<OverlayModal isVisible={true} label="Card drawn">
								<DrawCard bind:this={drawCardRef} />
							</OverlayModal>
						{:else if currentScreen == 'finalLog' || currentScreen == 'log'}
							<OverlayModal
								isVisible={true}
								label={gameState.gameOver ? 'Final log' : 'Journal entry'}
								tone={gameState.gameOver ? (gameState.win ? 'victory' : 'loss') : 'default'}
							>
								<JournalEntry
									bind:journalText={journal.text}
									bind:audioData={journal.audioData}
									{journalSaved}
									onSave={handleJournalSave}
									onRestart={handleJournalRestart}
									onExit={handleJournalExit}
								/>
							</OverlayModal>
						{:else if !step && currentScreen != 'showIntro'}
							<div transition:fade={{ duration: TRANSITION_DURATION }}>error: {currentScreen}</div>
						{/if}
					{/key}

					<!-- AN-02: one step button for every round step, mounted once. Moving to the next
				     step changes its label only; it never blinks out between steps. -->
					{#if step}
						<!-- No entrance of its own: coming back from the card, the overlay fades off it. At
						     game start it fades in with the intro, its first step. -->
						<div
							class="step-slot"
							data-testid={currentScreen == 'showIntro' ? undefined : `screen-${currentScreen}`}
							bind:this={stepSlotEl}
							in:fade|global={{ duration: currentScreen == 'showIntro' ? TRANSITION_DURATION : 0 }}
						>
							<!-- The step anchor: the hint line and the button. A rule caption docks above
						     it, beside the action it explains (DP-1-09). -->
							<div class="step-anchor">
								<RuleCaption {captions} />
								<StepAction
									id="step-action"
									text={step.text}
									hint={step.hint}
									busy={step.busy}
									disabled={step.disabled}
									changed={stepChanged}
									advancing={step.hold.active}
									advanceProgress={step.hold.progress}
									advancePaused={step.hold.paused}
									advanceWaiting={step.hold.waiting}
									testid={step.testid}
									onclick={runStep}
								/>
							</div>
						</div>
					{/if}

					<!-- Reduced motion (or no 3D dice): the roll as numbers in a d20 outline, shown
				     without motion in the lower table, between the text and the step button;
				     where the dice would sink, it fades (DP-1-10) -->
					{#if diceState.staticRoll}
						<div
							class="static-roll"
							data-testid="static-roll"
							aria-hidden="true"
							out:fade={{ duration: staticRollFadeMs() }}
						>
							{#each diceState.staticRoll.rolls as value, index (index)}
								<svg
									class="static-die"
									class:dropped={diceState.staticRoll.rolls.length > 1 &&
										value !== diceState.staticRoll.kept}
									viewBox="0 0 100 100"
								>
									<polygon class="die-outline" points="50,4 90,27 90,73 50,96 10,73 10,27" />
									<polygon class="die-face" points="50,12 84,70 16,70" />
									<text x="50" y="54" text-anchor="middle" dominant-baseline="middle">{value}</text>
								</svg>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- The game's one live region: result lines, key events and rule captions, in that order -->
<div class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="live-region">
	{liveMessage}
</div>

<!-- Modal rendered at root level, outside game-screen container -->
<ConfirmModal
	isOpen={showExitModal}
	title="Exit the game?"
	message="Your progress is saved. Pick it up from home."
	confirmText="Exit game"
	cancelText="Keep playing"
	onConfirm={handleExitConfirm}
	onCancel={handleExitCancel}
/>

<!-- Settings Modal -->
<SettingsModal isOpen={showSettingsModal} onClose={handleSettingsClose} />

<style>
	/* One grid cell for every screen block (LR-1-02): during a 200ms swap the old and new
	   blocks overlap in place instead of stacking */
	.screen-stack {
		display: grid;
		grid-template: minmax(0, 1fr) / minmax(0, 1fr);
		height: 100%;
		min-height: 0;
		min-width: 0;
	}

	.screen-block {
		grid-area: 1 / 1;
		min-height: 0;
		min-width: 0;
	}

	.game-screen {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	/* The intro sits over the table, which stays mounted underneath; its bottom or right edge
	   stops at the step slot (measured, visual-layout-s-06) */
	.dc-intro-wrapper {
		position: absolute;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		overflow: visible;
		min-height: 0;
	}

	/* AC-03: hidden until focused, then a visible chip at the top of the table */
	.skip-link {
		position: absolute;
		top: 0.5rem;
		left: max(0.5rem, env(safe-area-inset-left, 0px));
		z-index: 300;
		padding: 0.5rem 0.75rem;
		background: #08080f;
		color: var(--color-neon-cyan, #00ffff);
		border: 2px solid var(--color-neon-cyan, #00ffff);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-weight: 600;
		text-decoration: none;
		transform: translateY(calc(-100% - 1rem));
	}

	.skip-link:focus-visible {
		transform: none;
		outline: none;
	}

	/* The step button sits at the bottom of the table, above the dice */
	.step-slot {
		align-self: end;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	/* The hint line and the button; a rule caption docks above it (RuleCaption) */
	.step-anchor {
		position: relative;
	}

	/* ===== The reduced-motion roll (DP-1-10): a band of the lower table, from the dice line
	   (44%) down to 12px above the step anchor, so it never covers the text or the button ===== */
	.static-roll {
		position: absolute;
		left: 0;
		right: 0;
		top: 44%;
		bottom: calc(var(--step-anchor-h) + 12px);
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		pointer-events: none;
		container-type: size;
	}

	.static-die {
		flex: none;
		width: 96px;
		height: 96px;
	}

	/* A short band (under 112px) takes the small die */
	@container (max-height: 111px) {
		.static-die {
			width: 64px;
			height: 64px;
		}
	}

	.static-die .die-outline {
		fill: rgba(8, 8, 20, 0.9);
		stroke: var(--color-neon-cyan, #00ffff);
		stroke-width: 3;
		stroke-linejoin: round;
	}

	.static-die .die-face {
		fill: none;
		stroke: rgba(0, 255, 255, 0.25);
		stroke-width: 1.5;
	}

	.static-die text {
		fill: #fff;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 30px;
		font-weight: 600;
	}

	/* The die that did not count, under Lucid or Surreal */
	.static-die.dropped {
		opacity: 0.4;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.intro-story-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		width: 100%;
		position: relative;
		overflow: visible;
		box-sizing: border-box;
	}

	/* The intro's text area: the column is centred while it fits, and scrolls from the top
	   (with a fade mask and a scroll cue at the bottom edge) when it does not */
	.intro-scroll-area {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
	}

	/* VT-1-13: while the intro overflows, the scroll cue has a band of its own under the text
	   (kept at the end too, so the text never jumps), and no line ever scrolls under it */
	.intro-scroll-area.overflows {
		padding-bottom: 52px;
	}

	.intro-story-container .content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
		/* visual-layout-s-16: the intro lies outside the table's safe-area padding, so its text
		   clears a landscape notch itself. Its right edge is the action column there (already
		   inside the inset), so only the part of the inset it still covers counts. */
		padding: var(--space-md);
		padding-left: max(var(--space-md), env(safe-area-inset-left, 0px));
		padding-right: max(
			var(--space-md),
			calc(env(safe-area-inset-right, 0px) - var(--intro-right, 0px))
		);
		background-color: transparent;
		min-height: 0;
		width: 100%;
		box-sizing: border-box;
	}

	.intro-story-container .content.overflows:not(.at-end) {
		mask-image: linear-gradient(to bottom, #000 calc(100% - 24px), transparent);
	}

	/* Reading column: the reading measure (visual-layout-s-17), centred */
	.intro-column {
		margin-block: auto;
		width: 100%;
		max-width: min(var(--content-max, 720px), var(--measure, 30em));
		margin-inline: auto;
	}

	/* What winning takes, in this game's numbers */
	.intro-goal {
		margin-top: var(--space-lg);
		font-weight: 600;
		color: #fff;
	}

	.intro-scroll-cue {
		position: absolute;
		left: 50%;
		bottom: 4px;
		transform: translateX(-50%);
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		padding: 0;
		border: 1px solid rgba(0, 255, 255, 0.5);
		border-radius: 50%;
		background: rgba(8, 8, 20, 0.85);
		color: var(--color-neon-cyan, #00ffff);
		cursor: pointer;
	}

	.intro-scroll-cue:focus-visible {
		outline: 3px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	.intro-story-container .content h1 {
		font-size: var(--text-2xl);
		margin-bottom: var(--space-md);
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3);
	}

	/* MN-07: section headings under 28px are the UI face (Inter 600, uppercase), not the
	   display face, which misreads at small sizes */
	.intro-story-container .content :global(:is(h2, h3)) {
		font-family: var(--font-ui, var(--font-body));
		font-weight: var(--font-ui-weight, 600);
		letter-spacing: var(--tracking-ui, 0.08em);
		text-transform: uppercase;
		margin-bottom: var(--space-xs);
	}

	.intro-story-container .content :global(h2) {
		font-size: var(--text-xl);
		margin-top: var(--space-lg);
	}

	.intro-story-container .content :global(h3) {
		font-size: var(--text-lg);
		margin-top: var(--space-md);
	}

	.intro-story-container .content :global(p) {
		margin-bottom: var(--space-sm);
		line-height: 1.6;
	}

	/* UI Content Layer */
	.ui-content-layer {
		position: relative;
		align-items: center;
		display: grid;
		height: 100%;
		width: 100%;
		min-width: 0; /* CRITICAL: Allow grid to shrink */
		grid-template-rows: min-content 1fr min-content;
		row-gap: 0.5rem;
		/* DP-1-13: the bottom clears the home indicator (--safe-bottom, styles.css) */
		padding: 0.5rem 0.5rem max(0.5rem, var(--safe-bottom, 0px));
		box-sizing: border-box;
		grid-template-areas:
			'status-area'
			'main-screen-area'
			'toolbar-area';
		pointer-events: none; /* Allow dice clicks through */
	}

	/* The table fades in once the intro has faded out (300ms), never over it. The step slot is
	   the exception: its button is the intro's, so it stays put and on screen (visual-layout-s-06).
	   (The header and HUD are named, not their wrappers: on portrait phones those are
	   display: contents, which takes no opacity.) */
	.status-display-area :global(:is(.dock-toolbar, .dock-hud)),
	.main-screen-area > :global(.context-text-background) {
		transition: opacity 300ms ease-out 300ms;
	}

	.behind-intro .status-display-area :global(:is(.dock-toolbar, .dock-hud)),
	.behind-intro .main-screen-area > :global(.context-text-background) {
		opacity: 0;
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.status-display-area :global(:is(.dock-toolbar, .dock-hud)),
		.main-screen-area > :global(.context-text-background) {
			transition: none;
		}
	}

	/* Re-enable pointer events for interactive UI elements */
	.ui-content-layer > * {
		pointer-events: auto;
	}

	.main-screen-area {
		/* The step anchor's height: the hint line (20px + 4px), the 48px button and the
		   button bar's padding. The reduced-motion roll stops 12px above it. */
		--step-anchor-h: calc(24px + 48px + 2 * var(--space-md, 1rem));
		grid-area: main-screen-area;
		cursor: pointer;
		width: 100%;
		min-width: 0;
		margin-inline: auto;
		display: grid;
		min-height: 0; /* CRITICAL: Allow grid to shrink */
		height: 100%; /* Take full available height */
		box-sizing: border-box;
		position: relative; /* CRITICAL: Position context for content */
		overflow: hidden; /* CRITICAL: Prevent scrolling */
		align-items: center;
	}

	.dc-table-bg {
		border-radius: var(--dc-default-border-radius);
		/* Background removed to show neural network animation on all screens */
		background: transparent;
	}

	/* The header and the one-row HUD. AN-05: the block fades in once (.dc-fade-in, 200ms) or,
	   at game start, with the table as the intro leaves; nothing in it slides. */
	.status-display-area {
		display: grid;
		justify-content: stretch;
		align-content: start;
		width: 100%;
		grid-area: status-area;
		z-index: 100;
		position: relative;
	}

	/* Mobile responsiveness */
	@media (max-width: 450px) or (max-height: 600px) {
		.status-display-area {
			width: 100%;
			margin: auto;
			justify-content: stretch;
			z-index: auto; /* Remove z-index to allow natural stacking */
		}

		/* Allow overflow on parent containers */
		.game-screen,
		.ui-content-layer,
		.main-screen-area {
			overflow: visible;
		}

		/* Ensure main-screen-area is below status bars in stacking order */
		.main-screen-area {
			z-index: 1;
			align-items: flex-end; /* Align card to bottom on mobile to prevent status bar overlap */
		}

		/* No z-index on the step slot on phones, to keep the stacking context flat */
		.step-slot {
			z-index: auto;
		}
	}

	/* OWN-3: phones in portrait. The HUD is the top row and the header docks in the bottom row,
	   under the step button (StatusDisplay places both in this grid, with the same query). The
	   top clears a notch in a home-screen app; the bottom already clears the home indicator. */
	@media (max-width: 600px) and (orientation: portrait) {
		.ui-content-layer {
			padding-top: max(0.5rem, env(safe-area-inset-top, 0px));
		}

		.status-display-area {
			display: contents;
		}
	}

	/* ============================================
	   VP-01: LANDSCAPE PHONES (up to 500px tall)
	   The HUD is the short one-row HUD. The step button moves to a right-hand column beside
	   the table, so the HUD, the table and the button share the width, not the height.
	   ============================================ */
	@media (max-height: 500px) and (orientation: landscape) {
		.game-screen {
			/* Room for a 16px one-line label (about 205px) and its hint (DP-1-05) */
			--action-col: clamp(248px, 32vw, 280px);
		}

		.ui-content-layer {
			row-gap: 0.375rem;
			padding: 0.375rem max(0.5rem, env(safe-area-inset-right))
				max(0.375rem, var(--safe-bottom, 0px)) max(0.5rem, env(safe-area-inset-left));
		}

		/* The readout takes the table left of the button column: its left edge on the HUD's,
		   8px clear of the column */
		.main-screen-area :global(.context-text-background) {
			right: var(--action-col);
			width: auto;
			padding-inline: 0 0.5rem;
		}

		/* The reduced-motion roll: left of the action column, 12px under the readout and its
		   notice tab (the readout's fixed landscape height: its 14px top, 16px padding, one
		   28px title line, the hairline and its 8px gaps, the 2-line body, 18px padding, then
		   the tab's 11px below the edge; see ContextBackground) */
		.static-roll {
			right: var(--action-col);
			top: calc(14px + 16px + 1.75rem * 1.15 + 17px + 3rem + 18px + 11px + 12px);
			bottom: 8px;
		}

		.static-die {
			width: 64px;
			height: 64px;
		}

		/* The step button's slot is the right-hand column, full table height */
		.step-slot {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			/* The full column height (a grid item would otherwise keep align-self: end) */
			align-self: stretch;
			width: var(--action-col);
			display: grid;
			/* The button block sits at the foot of the column, in thumb reach, which leaves the
			   column above it for a rule caption (centred, a four-line caption reached the HUD) */
			align-content: end;
		}

		/* The button spans the column (the table's own padding is its margin), so a 16px label
		   has 216px or more even in the narrowest column */
		.step-slot :global(.step-action .button-bar) {
			padding-inline: 0;
		}

		/* The intro reads on the left of the action column, whose step button begins the game
		   (the intro's right edge is measured from it). NV-01: the text takes the full height
		   and scrolls; the column inside centres with margin-block: auto, which never pushes it
		   off the top. */
	}
</style>
