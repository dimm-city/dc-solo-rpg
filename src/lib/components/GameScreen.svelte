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
	import RollForTasksController from './game/RollForTasksController.svelte';
	import FailureCheckController from './game/FailureCheckController.svelte';
	import SuccessCheckController from './game/SuccessCheckController.svelte';
	import InitialDamageController from './game/InitialDamageController.svelte';
	import StartRoundController from './game/StartRoundController.svelte';

	// Screen composables
	import { useRollForTasks } from '../composables/screen/useRollForTasks.svelte.js';
	import { useFailureCheck } from '../composables/screen/useFailureCheck.svelte.js';
	import { useSuccessCheck } from '../composables/screen/useSuccessCheck.svelte.js';
	import { useInitialDamage } from '../composables/screen/useInitialDamage.svelte.js';

	// Game actions
	import { recordRound, restartGame, exitGame } from '../stores/gameActions.svelte.js';

	let {
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {},
		showHelpModal = $bindable(false)
	} = $props();

	const currentScreen = $derived(gameState.state);
	// Reduced from 300ms to 200ms for snappier, more mechanical feel
	const TRANSITION_DURATION = ANIMATION_DURATION.NORMAL;

	// Instantiate screen composables
	const rollForTasks = useRollForTasks();
	const failureCheck = useFailureCheck(onfailurecheckcompleted);
	const successCheck = useSuccessCheck();
	const initialDamage = useInitialDamage();

	// Contextual background text for each screen
	const contextText = $derived.by(() => {
		switch (currentScreen) {
			case 'initialDamageRoll':
				return {
					title: 'Initial Instability',
					description:
						"Before your journey begins, the situation is already precarious. Roll to see how much ground you've already lost...",
					showStats: true
				};
			case 'rollForTasks':
				return {
					title: rollForTasks.rolled
						? `Draw ${gameState.cardsToDraw} Card${gameState.cardsToDraw !== 1 ? 's' : ''}`
						: 'Roll for Tasks',
					description: rollForTasks.rolled
						? 'Your fate has been determined. Proceed to draw your cards.'
						: 'Roll the dice to determine how many challenges you must face this round.',
					showStats: true
				};
			case 'drawCard':
				return null; // No background text for card drawing
			case 'failureCheck':
				return {
					title: 'Stability Check',
					description: 'An odd card demands a price. Roll to see how much stability you lose.',
					showStats: true
				};
			case 'successCheck':
				return {
					title: 'Success Check',
					description:
						'The Ace of Hearts has appeared. Roll to remove a token from your countdown.',
					showStats: true
				};
			case 'startRound':
				return {
					title: `Round ${gameState.round}`,
					description: 'A new chapter begins. Prepare yourself for what lies ahead.',
					showStats: true
				};
			case 'log':
				return null; // No background text for journaling
			case 'finalLog':
				return null; // No background text for final journal entry
			default:
				return null;
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

	// Screen reader announcements: result lines and key events
	let liveMessage = $state('');
	$effect(() => {
		if (resultLine) liveMessage = resultLine;
	});
	let seenKings = untrack(() => gameState.kingsRevealed);
	let seenSalvation = untrack(() => gameState.aceOfHeartsRevealed);
	$effect(() => {
		const kings = gameState.kingsRevealed;
		const salvation = gameState.aceOfHeartsRevealed;
		if (kings > seenKings) {
			liveMessage = `King revealed. ${kings} of 4.`;
		} else if (salvation && !seenSalvation) {
			liveMessage = 'Salvation unlocked. The Ace of Hearts has appeared.';
		}
		seenKings = kings;
		seenSalvation = salvation;
	});

	// The ending owns the screen: no status HUD over it
	const showStatusHUD = $derived(currentScreen !== 'gameOver' && currentScreen !== 'finalLog');

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

	let showExitModal = $state(false);
	let showSettingsModal = $state(false);

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

	async function handleExitConfirm() {
		showExitModal = false;
		// Navigate to home page to reset game state
		// DiceBox persists in the layout so no reinitialization needed
		goto(resolve('/'));
	}

	function handleExitCancel() {
		showExitModal = false;
	}

	/**
	 * The primary action of the current round step: the same thing its visible button does.
	 * Returns null for steps whose button lives elsewhere (intro, card, journal).
	 */
	function getPrimaryAction() {
		switch (currentScreen) {
			case 'initialDamageRoll':
				return {
					disabled: initialDamage.rolling,
					run: () => initialDamage.handleInitialDamageRoll(triggerAutoPlayForCurrentScreen)
				};
			case 'startRound':
				return { disabled: false, run: beginRound };
			case 'rollForTasks':
				return {
					disabled: rollForTasks.buttonDisabled,
					run: () => rollForTasks.handleRollForTasks(triggerAutoPlayForCurrentScreen)
				};
			case 'failureCheck':
				return {
					disabled: failureCheck.rolling,
					run: () => failureCheck.handleFailureCheck(triggerAutoPlayForCurrentScreen)
				};
			case 'successCheck':
				return {
					disabled: successCheck.rolling,
					run: () => successCheck.handleSuccessCheck(triggerAutoPlayForCurrentScreen)
				};
			default:
				return null;
		}
	}

	function beginRound() {
		transitionTo('rollForTasks');
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

		const action = getPrimaryAction();
		if (action) {
			event.preventDefault();
			if (!action.disabled) action.run();
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

		const action = getPrimaryAction();
		if (action && !action.disabled) {
			action.run();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
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

			// Cancel previous screen's auto-play (using untrack to prevent loop)
			untrack(() => {
				cancelAutoPlay();
			});

			// Handle screen-specific entry logic (delay to next tick)
			setTimeout(() => {
				handleScreenEntry(currentScreen);
			}, 0);
		}
	});

	/**
	 * Pure screen entry handler - called once per screen change
	 * Separated from $effect to prevent reactive loops
	 */
	function handleScreenEntry(screen) {
		switch (screen) {
			case 'showIntro':
				// Trigger auto-play for intro screen
				triggerAutoPlayForCurrentScreen();
				break;

			case 'initialDamageRoll':
				// Reset state using composable
				initialDamage.resetState();
				// Trigger auto-play
				triggerAutoPlayForCurrentScreen();
				break;

			case 'startRound':
				// Trigger auto-play
				triggerAutoPlayForCurrentScreen();
				break;

			case 'rollForTasks':
				// Reset state using composable
				rollForTasks.resetState();
				// Trigger auto-play
				triggerAutoPlayForCurrentScreen();
				break;

			case 'failureCheck':
				// Reset state using composable
				failureCheck.resetState();
				// Trigger auto-play
				triggerAutoPlayForCurrentScreen();
				break;

			case 'successCheck':
				// Reset state using composable
				successCheck.resetState();
				// Trigger auto-play
				triggerAutoPlayForCurrentScreen();
				break;

			case 'drawCard':
				// Auto-draw first card when entering drawCard state
				// Small delay to ensure CardDeck component is fully initialized
				setTimeout(() => {
					if (drawCardRef && gameState.cardsToDraw > 0) {
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
				if (gameplaySettings.autoRollDice && initialDamage.result === undefined) {
					autoPlayCanceller = autoRoll(() =>
						initialDamage.handleInitialDamageRoll(triggerAutoPlayForCurrentScreen)
					);
				}
				// Auto-continue after result if enabled
				else if (gameplaySettings.autoContinueAfterReading && initialDamage.result !== undefined) {
					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => initialDamage.handleInitialDamageRoll(triggerAutoPlayForCurrentScreen)
					});
				}
				break;

			case 'startRound':
				if (gameplaySettings.autoContinueAfterReading) {
					const roundText = `Round ${gameState.round} begins`;
					const shouldRead = audioSettings.autoReadPrompts;
					autoPlayCanceller = autoAdvance({
						text: shouldRead ? roundText : null,
						shouldRead,
						action: () => transitionTo('rollForTasks')
					});
				}
				break;

			case 'rollForTasks':
				// Auto-read prompt first if enabled and not yet rolled
				if (audioSettings.autoReadPrompts && !rollForTasks.rolled) {
					const promptText =
						'Roll the dice to determine how many challenges you must face this round.';
					speak(promptText);
				}

				// Auto-roll if enabled and not yet rolled
				if (gameplaySettings.autoRollDice && !rollForTasks.rolled && !rollForTasks.rolling) {
					autoPlayCanceller = autoRoll(() =>
						rollForTasks.handleRollForTasks(triggerAutoPlayForCurrentScreen)
					);
				}
				// Auto-confirm after roll if enabled
				else if (
					gameplaySettings.autoContinueAfterReading &&
					rollForTasks.rolled &&
					!rollForTasks.confirming
				) {
					// Announce result
					if (audioSettings.autoAnnounceRolls) {
						const resultText = `You rolled a ${gameState.diceRoll}. Draw ${gameState.cardsToDraw} card${gameState.cardsToDraw !== 1 ? 's' : ''}.`;
						speak(resultText);
					}

					autoPlayCanceller = autoAdvance({
						text: null,
						shouldRead: false,
						action: () => rollForTasks.handleRollForTasks(triggerAutoPlayForCurrentScreen)
					});
				}
				break;

			case 'failureCheck':
				// Auto-read prompt first if enabled and not yet rolled
				if (audioSettings.autoReadPrompts && failureCheck.result === undefined) {
					const promptText =
						'An odd card demands a price. Roll to see how much stability you lose.';
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
				// Auto-continue after result if enabled
				else if (gameplaySettings.autoContinueAfterReading && failureCheck.result !== undefined) {
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
					const promptText =
						'The Ace of Hearts has appeared. Roll to remove a token from your countdown.';
					speak(promptText);
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
				// Auto-continue after result if enabled
				else if (gameplaySettings.autoContinueAfterReading && successCheck.result !== undefined) {
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
		class="dc-fade-in dc-screen-container"
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
			{#if showStatusHUD}
				<div class="status-display-area dc-fade-in" data-testid="status-display">
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
				<!-- Background contextual text -->
				<ContextBackground {contextText} {resultLine} />

				{#key currentScreen}
					{#if currentScreen == 'initialDamageRoll'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-initialDamageRoll"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<InitialDamageController
								{initialDamage}
								triggerAutoPlay={triggerAutoPlayForCurrentScreen}
							/>
						</div>
					{:else if currentScreen == 'startRound'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-startRound"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<!-- Round text is shown in the background -->
							<StartRoundController onbegin={beginRound} />
						</div>
					{:else if currentScreen == 'rollForTasks'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-rollForTasks"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<RollForTasksController
								{rollForTasks}
								triggerAutoPlay={triggerAutoPlayForCurrentScreen}
							/>
						</div>
					{:else if currentScreen == 'drawCard'}
						<OverlayModal isVisible={true} label="Card drawn">
							<DrawCard bind:this={drawCardRef} />
						</OverlayModal>
					{:else if currentScreen == 'failureCheck'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-failureCheck"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<FailureCheckController
								{failureCheck}
								triggerAutoPlay={triggerAutoPlayForCurrentScreen}
							/>
						</div>
					{:else if currentScreen == 'successCheck'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-successCheck"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<SuccessCheckController
								{successCheck}
								triggerAutoPlay={triggerAutoPlayForCurrentScreen}
							/>
						</div>
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
					{:else if currentScreen == 'showIntro'}
						<!-- The intro overlay covers the table until the player begins -->
					{:else}
						<div transition:fade={{ duration: TRANSITION_DURATION }}>error: {currentScreen}</div>
					{/if}
				{/key}
				<RuleCaption />
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
					<div class="content">
						<h1>{gameState.config?.title || 'Game Introduction'}</h1>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitized via sanitizeHtml -->
						{@html sanitizeHtml(marked(gameState.config?.introduction ?? ''))}
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

<!-- Announces results and key events to screen readers -->
<div class="sr-only" role="status" aria-live="polite" aria-atomic="true" data-testid="live-region">
	{liveMessage}
</div>

<!-- Modal rendered at root level, outside game-screen container -->
<ConfirmModal
	isOpen={showExitModal}
	title="Exit Game"
	message="Are you sure you want to exit? Your current game progress will be lost and you'll return to the options screen."
	confirmText="Exit Game"
	cancelText="Continue Playing"
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

	.intro-story-container .content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: var(--space-md);
		background-color: transparent;
		min-height: 0;
		/* Reading column: no 180-character lines on desktop */
		width: 100%;
		max-width: var(--content-max, 720px);
		margin-inline: auto;
	}

	.intro-story-container .content h1 {
		font-size: var(--text-2xl);
		margin-bottom: var(--space-md);
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3);
	}

	.intro-story-container .content :global(h2) {
		font-size: var(--text-xl);
		margin-top: var(--space-lg);
		margin-bottom: var(--space-xs);
	}

	.intro-story-container .content :global(h3) {
		font-size: var(--text-lg);
		margin-top: var(--space-md);
		margin-bottom: var(--space-xs);
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

	.main-screen-area > div.dc-screen-container {
		width: 100%;
		height: 100%;
		overflow: visible; /* Allow glows and neural effects to extend beyond container */
		box-sizing: border-box;
		position: relative; /* Ensure content appears above neural background */
		z-index: 1;
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

		/* Remove z-index from screen container to fix stacking context */
		.main-screen-area > div.dc-screen-container {
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

		.main-screen-area :global(.context-title) {
			font-size: clamp(1.25rem, 8vh, 2.25rem);
			margin-bottom: 0.375rem;
		}

		/* The step button (and its Lucid/Surreal chip) in the right-hand column */
		.main-screen-area :global(.step-action) {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			width: var(--action-col);
			align-content: center;
		}

		/* The intro reads on the left with its button on the right, like the table */
		.intro-story-container {
			flex-direction: row;
			align-items: center;
		}

		.intro-story-container > :global(.button-bar) {
			flex: none;
			width: var(--action-col);
		}
	}
</style>
