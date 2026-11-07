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
	import { formatIntroGoal } from '../utils/rollResult.js';
	import { createAnnouncer } from '../utils/liveAnnouncer.js';
	import { skipRoll } from '../stores/diceStore.svelte.js';
	import { saveGame } from '../stores/indexedDBStorage.js';
	import { useRuleCaptions } from '../composables/useRuleCaptions.svelte.js';

	import LoadScreen from './LoadScreen.svelte';
	import GameOver from './GameOver.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import DrawCard from './DrawCard.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import ContinueButton from './ContinueButton.svelte';
	import ConfirmModal from './ConfirmModal.svelte';
	import RuleCaption from './RuleCaption.svelte';
	import ButtonBar from './ButtonBar.svelte';
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
		getCurrentSalvationThreshold
	} from '../stores/gameActions.svelte.js';

	let {
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {},
		showHelpModal = $bindable(false)
	} = $props();

	const currentScreen = $derived(gameState.state);
	// Reduced from 300ms to 200ms for snappier, more mechanical feel
	const TRANSITION_DURATION = ANIMATION_DURATION.NORMAL;
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

	/** "7♠ · Caught in a toxic gas leak" */
	function cardLine(card) {
		if (!card) return null;
		const name = `${card.card}${SUIT_SYMBOLS[card.suit] ?? ''}`;
		return card.description ? `${name} · ${card.description}` : name;
	}

	/** What a modifier card confirmed this round did, while the table shows it */
	const modifierNotice = $derived(
		gameState.lastCard?.round === gameState.round
			? (gameState.lastCard?.modifierResult ?? null)
			: null
	);

	function salvationDescription() {
		const need = getCurrentSalvationThreshold();
		return need === 0
			? 'All four Aces are out. No target to beat now: survive one Stability check and a token comes off.'
			: `Roll to remove a token. You need ${need}+.`;
	}

	// Contextual background text for each screen
	const contextText = $derived.by(() => {
		switch (currentScreen) {
			case 'initialDamageRoll':
				return {
					title: 'Instability',
					description:
						"Before your journey begins, the situation is already precarious. Roll to see how much ground you've already lost..."
				};
			case 'rollForTasks':
				// The round opens here; after the roll the title stays and the result line gives the count
				return {
					title: `Round ${gameState.round}`,
					description: 'Roll to see how many cards you draw this round.'
				};
			case 'failureCheck':
				return {
					title: 'Stability Check',
					eyebrow: cardLine(gameState.lastCard),
					description: 'An odd card demands a price. Roll to see how much Stability you lose.',
					notice: modifierNotice
				};
			case 'successCheck':
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

	function stepFor(screen) {
		const trigger = triggerAutoPlayForCurrentScreen;
		switch (screen) {
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
				return null; // The intro, card and journal have their own controls
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
		if (!stepMeaning) return;
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
	$effect(() => {
		if (resultLine) announcer.announce(resultLine, { first: true });
	});
	$effect(() => {
		if (modifierNotice) announcer.announce(modifierNotice);
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
			aceRevealed: gameState.aceOfHeartsRevealed
		})
	);

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

	// Buttons that live outside the round steps (intro and journal)
	const OTHER_PRIMARY_BUTTONS = [
		'story-continue-button',
		'journal-save-button',
		'journal-next-button'
	];

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
			lastScreen = currentScreen;
			const screen = currentScreen;

			untrack(() => {
				// Cancel previous screen's auto-play
				cancelAutoPlay();
				// Reset the step's roll state at once, so the button never shows the last visit's label
				resetStep(screen);
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
				// A game saved mid-roll resumes on that roll's result
				successCheck.resumePending();
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
				drawTimer = setTimeout(() => {
					if (
						!leaving &&
						gameState.state === 'drawCard' &&
						drawCardRef &&
						gameState.cardsToDraw > 0
					) {
						drawCardRef.handleButtonClick();
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
					const promptText =
						'Roll for Initial Damage. Before your journey begins, the situation is already precarious.';
					speak(promptText);
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
					speak(`Round ${gameState.round}. Roll to see how many cards you draw this round.`);
				}

				// Auto-roll if enabled and not yet rolled (the cards are dealt on their own after the roll)
				if (gameplaySettings.autoRollDice && !rollForTasks.rolled && !rollForTasks.rolling) {
					autoPlayCanceller = autoRoll(() =>
						rollForTasks.handleRollForTasks(triggerAutoPlayForCurrentScreen)
					);
				} else if (rollForTasks.rolled && audioSettings.autoAnnounceRolls) {
					const resultText = `You rolled a ${gameState.diceRoll}. Draw ${gameState.cardsToDraw} card${gameState.cardsToDraw !== 1 ? 's' : ''}.`;
					speak(resultText);
				}
				break;

			case 'failureCheck':
				// Auto-read prompt first if enabled and not yet rolled
				if (audioSettings.autoReadPrompts && failureCheck.result === undefined) {
					const promptText =
						'An odd card demands a price. Roll to see how much Stability you lose.';
					speak(promptText);
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
				// Auto-continue after a result that does not move on by itself (the fatal roll)
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

{#if currentScreen == 'loadGame'}
	<div
		class="dc-game-bg"
		data-testid="screen-loadGame"
		transition:fade={{ duration: TRANSITION_DURATION }}
	>
		<LoadScreen />
	</div>
{:else if currentScreen == 'gameOver'}
	<div
		class="dc-screen-container"
		data-testid="screen-gameOver"
		transition:fade={{ duration: TRANSITION_DURATION }}
	>
		<GameOver />
	</div>
{:else if currentScreen == 'exitGame'}
	<div data-testid="screen-exitGame" transition:fade={{ duration: TRANSITION_DURATION }}>
		Game Exited
	</div>
{:else}
	<div class="game-screen dc-game-bg">
		<!-- The table stays mounted under the intro, so the hand-off never goes through black -->
		<!-- UI Content Layer -->
		<div
			class="ui-content-layer"
			class:behind-intro={currentScreen == 'showIntro'}
			inert={currentScreen == 'showIntro'}
		>
			{#if step}
				<!-- AC-03: the first tab stop skips the header and goes to the step button -->
				<a class="skip-link" href="#step-action" onclick={skipToStep}>Skip to action</a>
			{/if}
			{#if showStatusHUD}
				<div class="status-display-area" data-testid="status-display">
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
				<!-- Background contextual text, with the rule caption above it in the same column -->
				<ContextBackground {contextText} {resultLine}>
					<RuleCaption {captions} />
				</ContextBackground>

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
					<!-- No entrance of its own: coming back from the card, the overlay fades off it -->
					<div class="step-slot" data-testid="screen-{currentScreen}">
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
							testid={step.testid}
							onclick={runStep}
						/>
					</div>
				{/if}
			</div>
		</div>

		{#if currentScreen == 'showIntro'}
			<!-- Fades out (300ms) first; the table then fades in underneath it -->
			<div
				class="dc-game-bg dc-intro-wrapper"
				data-testid="screen-showIntro"
				in:fade|global={{ duration: TRANSITION_DURATION }}
				out:fade={{ duration: ANIMATION_DURATION.SLOW }}
			>
				<div class="intro-story-container">
					<div class="intro-scroll-area">
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
					<ButtonBar>
						<ContinueButton
							text="Begin Your Journey"
							onclick={() => transitionTo('initialDamageRoll')}
							testid="story-continue-button"
						/>
					</ButtonBar>
				</div>
			</div>
		{/if}
	</div>
{/if}

<!-- The game's one live region: result lines, key events and rule captions, in that order -->
<div class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="live-region">
	{liveMessage}
</div>

<!-- Modal rendered at root level, outside game-screen container -->
<ConfirmModal
	isOpen={showExitModal}
	title="Leave the game?"
	message="Your progress is saved. Continue it from the home screen."
	confirmText="Leave"
	cancelText="Keep playing"
	onConfirm={handleExitConfirm}
	onCancel={handleExitCancel}
/>

<!-- Settings Modal -->
<SettingsModal isOpen={showSettingsModal} onClose={handleSettingsClose} />

<style>
	.game-screen {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	/* The intro sits over the table, which stays mounted underneath */
	.dc-intro-wrapper {
		position: absolute;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		overflow: visible;
		min-height: 0;
		height: 100%;
	}

	/* AC-03: hidden until focused, then a visible chip at the top of the table */
	.skip-link {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
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

	.intro-story-container .content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--space-md);
		background-color: transparent;
		min-height: 0;
		width: 100%;
		box-sizing: border-box;
	}

	.intro-story-container .content.overflows:not(.at-end) {
		mask-image: linear-gradient(to bottom, #000 calc(100% - 24px), transparent);
	}

	/* Reading column: no 180-character lines on desktop */
	.intro-column {
		margin-block: auto;
		width: 100%;
		max-width: var(--content-max, 720px);
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
		bottom: 0.25rem;
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
		padding: 0.5rem;
		box-sizing: border-box;
		grid-template-areas:
			'status-area'
			'main-screen-area'
			'toolbar-area';
		pointer-events: none; /* Allow dice clicks through */
	}

	/* The table fades in once the intro has faded out (300ms), never over it */
	.ui-content-layer {
		transition: opacity 300ms ease-out 300ms;
	}

	.ui-content-layer.behind-intro {
		opacity: 0;
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.ui-content-layer {
			transition: none;
		}
	}

	/* Re-enable pointer events for interactive UI elements */
	.ui-content-layer > * {
		pointer-events: auto;
	}

	.main-screen-area {
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

	/* ============================================
	   VP-01: LANDSCAPE PHONES (up to 500px tall)
	   The HUD is the short one-row HUD. The step button moves to a right-hand column beside
	   the table, so the HUD, the table and the button share the width, not the height.
	   ============================================ */
	@media (max-height: 500px) and (orientation: landscape) {
		.game-screen {
			--action-col: clamp(200px, 32vw, 280px);
		}

		.ui-content-layer {
			row-gap: 0.375rem;
			padding: 0.375rem max(0.5rem, env(safe-area-inset-right)) 0.375rem
				max(0.5rem, env(safe-area-inset-left));
		}

		/* Title and result line centre in the space left of the button column */
		.main-screen-area :global(.context-text-background) {
			right: var(--action-col);
			width: auto;
			padding-inline: 0.5rem;
		}

		/* 28px and up: the display face's floor (NV-05) */
		.main-screen-area :global(.context-title) {
			font-size: clamp(1.75rem, 8vh, 2.25rem);
			margin-bottom: 0.375rem;
		}

		/* The step button's slot is the right-hand column, full table height, button centred */
		.step-slot {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			width: var(--action-col);
			display: grid;
			align-content: center;
		}

		/* The intro reads on the left with its button on the right, like the table */
		.intro-story-container {
			flex-direction: row;
			align-items: center;
		}

		/* NV-01: the text takes the full height and scrolls; only the button is centred. Centred
		   itself, a text area taller than the screen overflowed above it, out of reach. (The
		   column inside still centres with margin-block: auto, which never pushes it off.) */
		.intro-scroll-area {
			align-self: stretch;
		}

		.intro-story-container > :global(.button-bar) {
			flex: none;
			width: var(--action-col);
		}
	}
</style>
