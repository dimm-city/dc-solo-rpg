<script>
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import '../../game.css';
	import { convertD20ToD6 } from '../utils/diceConversion.js';

	import LoadScreen from './LoadScreen.svelte';
	import GameOver from './GameOver.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import SuccessCheck from './SuccessCheck.svelte';
	import InitialDamageRoll from './InitialDamageRoll.svelte';
	import FinalDamageRoll from './FinalDamageRoll.svelte';
	import RollForTasks from './RollForTasks.svelte';
	import DrawCard from './DrawCard.svelte';
	import FailureCheck from './FailureCheck.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import ContinueButton from './ContinueButton.svelte';
	import ConfirmModal from './ConfirmModal.svelte';
	import MiniStatusHUD from './MiniStatusHUD.svelte';
	import KeyboardHint from './KeyboardHint.svelte';
	import DeckVisualization from './DeckVisualization.svelte';
	import ButtonBar from './ButtonBar.svelte';
	import OverlayModal from './OverlayModal.svelte';
	import { onMount } from 'svelte';
	import { rollDice } from '../stores/diceStore.svelte.js';
	import {
		rollForTasks,
		confirmTaskRoll,
		getFailureCheckRoll,
		applyFailureCheckResult,
		applyPendingDiceRoll,
		applyPendingTaskRoll,
		applyPendingSuccessCheck,
		performInitialDamageRoll,
		applyPendingInitialDamageRoll,
		applyPendingFinalDamageRoll,
		confirmFailureCheck,
		successCheck,
		startRound,
		performFinalDamageRoll,
		recordRound,
		restartGame,
		exitGame
	} from '../stores/gameActions.svelte.js';

	let {
		systemSettings = {},
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {},
		showHelpModal = $bindable(false)
	} = $props();

	const currentScreen = $derived(gameState.state);
	const TRANSITION_DURATION = 300;

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
					title: rollTasksRolled
						? `Draw ${gameState.cardsToDraw} Card${gameState.cardsToDraw !== 1 ? 's' : ''}`
						: 'Roll for Tasks',
					description: rollTasksRolled
						? 'Your fate has been determined. Proceed to draw your cards.'
						: 'Roll the dice to determine how many challenges you must face this round.',
					showStats: true
				};
			case 'drawCard':
				return null; // No background text for card drawing
			case 'failureCheck':
				return {
					title: 'Damage Check',
					description: 'An odd card demands a price. Roll to see how much damage you take.',
					showStats: true
				};
			case 'successCheck':
				return {
					title: 'Success Check',
					description:
						'The Ace of Hearts has appeared. Roll to remove a token from your countdown.',
					showStats: true
				};
			case 'finalDamageRoll':
				return {
					title: 'The Final Test',
					description:
						"You've completed the countdown, but salvation comes with one final risk. Roll one last time to see if you truly escape...",
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

	// RollForTasks button state
	let rollTasksRolled = $state(false);
	let rollTasksRolling = $state(false);
	let rollTasksConfirming = $state(false);

	// Reset rollForTasks state when screen changes
	$effect(() => {
		if (currentScreen === 'rollForTasks') {
			rollTasksRolled = false;
			rollTasksRolling = false;
			rollTasksConfirming = false;
		}
	});

	async function handleRollForTasks() {
		if (rollTasksRolling || rollTasksConfirming) return;
		if (rollTasksRolled) {
			// Confirm
			rollTasksConfirming = true;
			await confirmTaskRoll();
			rollTasksConfirming = false;
		} else {
			// Roll
			rollTasksRolling = true;
			const result = await rollForTasks();
			// Roll dice and wait for animation to complete
			await rollDice(result);
			rollTasksRolling = false;
			// Apply pending dice roll after animation completes
			applyPendingTaskRoll();
			rollTasksRolled = true;
		}
	}

	const rollForTasksButtonText = $derived(
		rollTasksRolled
			? (gameState.config?.labels?.rollForTasksResultHeader ??
					`Draw ${gameState.cardsToDraw} Card${gameState.cardsToDraw !== 1 ? 's' : ''}`)
			: (gameState.config?.labels?.rollForTasksHeader ?? 'Roll Dice')
	);
	const rollForTasksButtonDisabled = $derived(rollTasksRolling || rollTasksConfirming);

	// FailureCheck button state
	let failureCheckRolling = $state(false);
	let failureCheckResult = $state();

	$effect(() => {
		if (currentScreen === 'failureCheck') {
			failureCheckResult = undefined;
			failureCheckRolling = false;
		}
	});

	async function handleFailureCheck() {
		if (failureCheckRolling) return;
		if (currentScreen == 'failureCheck' && !failureCheckResult) {
			failureCheckRolling = true;
			const rollResult = getFailureCheckRoll();
			failureCheckResult = rollResult;
			// Store pending updates (don't apply yet)
			applyFailureCheckResult(rollResult);
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			failureCheckRolling = false;
			// NOW apply the pending updates after dice animation completes
			applyPendingDiceRoll();
			await confirmFailureCheck();
			onfailurecheckcompleted(gameState.state);
		} else if (failureCheckResult) {
			await confirmFailureCheck();
		}
	}

	const failureCheckButtonText = $derived(failureCheckResult ? 'Continue' : 'Roll for Damage');

	// SuccessCheck button state
	let successCheckRolling = $state(false);
	let successCheckResult = $state();

	$effect(() => {
		if (currentScreen === 'successCheck') {
			successCheckResult = undefined;
			successCheckRolling = false;
		}
	});

	async function handleSuccessCheck() {
		if (successCheckRolling) return;
		if (currentScreen == 'successCheck' && !successCheckResult) {
			successCheckRolling = true;
			const rollResult = await successCheck();
			successCheckResult = rollResult;
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			successCheckRolling = false;
			// Apply pending success check after animation completes
			applyPendingSuccessCheck();
		} else if (successCheckResult) {
			await startRound();
		}
	}

	const successCheckButtonText = $derived(successCheckResult ? 'Continue' : 'Roll to Remove Token');

	// FinalDamageRoll button state
	let finalDamageRolling = $state(false);
	let finalDamageResult = $state();

	$effect(() => {
		if (currentScreen === 'finalDamageRoll') {
			finalDamageResult = undefined;
			finalDamageRolling = false;
		}
	});

	async function handleFinalDamageRoll() {
		if (finalDamageRolling || finalDamageResult !== undefined) return;
		if (currentScreen !== 'finalDamageRoll') return;

		finalDamageRolling = true;
		const rollResult = convertD20ToD6(Math.floor(Math.random() * 20) + 1);
		finalDamageResult = rollResult;

		try {
			// Store pending updates
			performFinalDamageRoll(rollResult);
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			// Apply pending final damage roll after animation completes
			applyPendingFinalDamageRoll();
		} finally {
			finalDamageRolling = false;
		}
	}

	const finalDamageButtonText = $derived(
		finalDamageResult
			? gameState.win
				? 'Victory! Continue'
				: 'Defeat... Continue'
			: 'Roll Final Damage'
	);

	// InitialDamageRoll button state
	let initialDamageRolling = $state(false);
	let initialDamageResult = $state();

	$effect(() => {
		if (currentScreen === 'initialDamageRoll') {
			initialDamageResult = undefined;
			initialDamageRolling = false;
		}
	});

	async function handleInitialDamageRoll() {
		if (initialDamageRolling || initialDamageResult !== undefined) return;
		if (currentScreen !== 'initialDamageRoll') return;

		initialDamageRolling = true;
		const rollResult = convertD20ToD6(Math.floor(Math.random() * 20) + 1);
		initialDamageResult = rollResult;

		try {
			// Store pending updates
			performInitialDamageRoll(rollResult);
			// Roll dice and wait for animation to complete
			await rollDice(rollResult);
			// Apply pending initial damage roll after animation completes
			applyPendingInitialDamageRoll();
		} finally {
			initialDamageRolling = false;
		}
	}

	const initialDamageButtonText = $derived(
		initialDamageResult ? 'Continue to Round 1' : 'Roll for Initial Damage'
	);

	// DrawCard button state
	let drawCardRef = $state();

	// Reactive derived values for DrawCard button
	const drawCardButtonText = $derived(drawCardRef?.getButtonText() ?? 'Draw Card');
	const drawCardButtonDisabled = $derived(drawCardRef?.isButtonDisabled() ?? false);

	async function handleDrawCardClick() {
		if (drawCardRef) {
			await drawCardRef.handleButtonClick();
		}
	}

	// JournalEntry button state
	let journalSaved = $state(false);
	const journal = $state({ text: '', audioData: null });

	// Reset journal state when screen changes to log/finalLog
	$effect(() => {
		if (currentScreen === 'log' || currentScreen === 'finalLog') {
			journalSaved = false;
		}
	});

	async function handleJournalSave() {
		// Always save journal entry (text and audio are both optional)
		await recordRound(journal);
		journal.text = '';
		journal.audioData = null;
		journalSaved = true;
		onjournalsaved(journal);
	}

	async function handleJournalNext() {
		// recordRound already handles the state transition
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
			goto('/');
		}
	}

	// Show mini HUD during card-related screens
	const showMiniHUD = $derived(
		currentScreen === 'drawCard' ||
			currentScreen === 'failureCheck' ||
			currentScreen === 'successCheck' ||
			currentScreen === 'finalDamageRoll' ||
			currentScreen === 'log' ||
			currentScreen === 'finalLog'
	);

	let showExitModal = $state(false);
	let showKeyboardHint = $state(false);

	function handleExitClick() {
		showExitModal = true;
	}

	function handleHelpClick() {
		showHelpModal = true;
	}

	function handleHelpClose() {
		showHelpModal = false;
	}

	async function handleExitConfirm() {
		showExitModal = false;
		// Navigate to home page to reset game state
		// DiceBox persists in the layout so no reinitialization needed
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/');
	}

	function handleExitCancel() {
		showExitModal = false;
	}

	/**
	 * Global keyboard shortcut handler
	 * Allows Space/Enter to trigger primary action on each screen
	 */
	function handleKeyPress(event) {
		// Ignore if user is typing in an input/textarea
		if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
			return;
		}

		// Ignore if modal is open
		if (showExitModal) {
			return;
		}

		const key = event.key.toLowerCase();

		// Space or Enter triggers the primary action button on the current screen
		if (key === ' ' || key === 'enter') {
			event.preventDefault();

			// Find the primary action button on the current screen and click it
			const primaryButton = document.querySelector(
				'[data-testid="start-round-button"], [data-testid="card-deck-button"], [data-testid="continue-button"]'
			);

			if (primaryButton && !primaryButton.disabled) {
				primaryButton.click();
			}
		}
	}

	/**
	 * Handle clicks anywhere on the screen to advance the game
	 * Only triggers if clicking on non-interactive elements
	 */
	function handleScreenClick(event) {
		// Ignore clicks on buttons, inputs, textareas, and links
		const target = event.target;
		const isInteractive =
			target.tagName === 'BUTTON' ||
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'A' ||
			target.closest('button') ||
			target.closest('a') ||
			target.closest('[role="button"]') ||
			target.closest('.toolbar-button');

		if (isInteractive) {
			return;
		}

		// Ignore if modal is open
		if (showExitModal) {
			return;
		}

		// Trigger the appropriate action based on the current screen
		switch (currentScreen) {
			case 'showIntro':
				transitionTo('initialDamageRoll');
				break;
			case 'initialDamageRoll':
				if (!initialDamageRolling && !initialDamageResult) {
					handleInitialDamageRoll();
				}
				break;
			case 'startRound':
				transitionTo('rollForTasks');
				break;
			case 'rollForTasks':
				if (!rollForTasksButtonDisabled) {
					handleRollForTasks();
				}
				break;
			case 'drawCard':
				if (!drawCardButtonDisabled) {
					handleDrawCardClick();
				}
				break;
			case 'failureCheck':
				if (!failureCheckRolling) {
					handleFailureCheck();
				}
				break;
			case 'successCheck':
				if (!successCheckRolling) {
					handleSuccessCheck();
				}
				break;
			case 'finalDamageRoll':
				if (!finalDamageRolling) {
					handleFinalDamageRoll();
				}
				break;
			case 'log':
			case 'finalLog':
				// Journal screen - user must click the save button explicitly
				// Tapping the screen should NOT save or advance
				break;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);

		// Show keyboard hint when game starts (on desktop only)
		const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (isDesktop && currentScreen === 'startRound') {
			showKeyboardHint = true;
		}

		return () => window.removeEventListener('keydown', handleKeyPress);
	});

	// Watch for game start and show keyboard hint on first round
	$effect(() => {
		const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (isDesktop && currentScreen === 'startRound' && gameState.round === 1) {
			showKeyboardHint = true;
		}
	});
</script>

{#if currentScreen == 'loadGame'}
	<div
		class="dc-game-bg"
		data-testid="screen-loadGame"
		transition:fade={{ duration: TRANSITION_DURATION }}
	>
		<LoadScreen />
	</div>
{:else if currentScreen == 'showIntro'}
	<div
		class="dc-game-bg dc-intro-wrapper"
		data-testid="screen-showIntro"
		transition:fade={{ duration: TRANSITION_DURATION }}
		onclick={handleScreenClick}
	>
		<div class="intro-story-container">
			<div class="content">
				<h1>{gameState.config?.title || 'Game Introduction'}</h1>
				{@html marked(gameState.config?.introduction ?? '')}
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
		<!-- UI Content Layer -->
		<div class="ui-content-layer">
			<div class="status-display-area dc-fade-in" data-testid="status-display">
				<StatusDisplay onHelpClick={handleHelpClick} onExitClick={handleExitClick} />
			</div>
			<div class="main-screen-area dc-table-bg" onclick={handleScreenClick}>
				<!-- Background contextual text -->
				{#if contextText}
					{#key currentScreen}
						<div class="context-text-background" transition:fade={{ duration: 400 }}>
							<h2 class="context-title">{contextText.title}</h2>
							<p class="context-description">{contextText.description}</p>
						</div>
					{/key}
				{/if}

				{#key currentScreen}
					{#if currentScreen == 'initialDamageRoll'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-initialDamageRoll"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<InitialDamageRoll />
						</div>
					{:else if currentScreen == 'startRound'}
						<div
							class="dc-fade-in dc-screen-container dc-start-round-screen"
							data-testid="screen-startRound"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<!-- Round text now shown in background -->
						</div>
					{:else if currentScreen == 'rollForTasks'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-rollForTasks"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<RollForTasks />
						</div>
					{:else if currentScreen == 'drawCard'}
						<OverlayModal isVisible={true} zIndex={50}>
							<DrawCard bind:this={drawCardRef} />
						</OverlayModal>
					{:else if currentScreen == 'failureCheck'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-failureCheck"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<FailureCheck {onfailurecheckcompleted} />
						</div>
					{:else if currentScreen == 'successCheck'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-successCheck"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<SuccessCheck />
						</div>
					{:else if currentScreen == 'finalDamageRoll'}
						<div
							class="dc-fade-in dc-screen-container"
							data-testid="screen-finalDamageRoll"
							transition:fade={{ duration: TRANSITION_DURATION }}
						>
							<FinalDamageRoll />
						</div>
					{:else if currentScreen == 'finalLog' || currentScreen == 'log'}
						<OverlayModal isVisible={true} zIndex={50}>
							<JournalEntry
								bind:journalText={journal.text}
								bind:audioData={journal.audioData}
								{journalSaved}
								onSave={handleJournalSave}
								onNext={handleJournalNext}
								onRestart={handleJournalRestart}
								onExit={handleJournalExit}
							/>
						</OverlayModal>
					{:else}
						<div transition:fade={{ duration: TRANSITION_DURATION }}>error: {currentScreen}</div>
					{/if}
				{/key}
			</div>

			<!-- Toolbar at bottom with exit button and deck visualization -->
			<!-- <div class="toolbar-area">
				<div
					class="toolbar-background"
					data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
				></div>

				<div class="toolbar-left">
				</div>
				<div class="toolbar-center">
					{#if currentScreen === 'startRound'}
						<ContinueButton
							text="Begin Round {gameState.round}"
							onclick={() => transitionTo('rollForTasks')}
							testid="start-round-button"
						/>
					{:else if currentScreen === 'rollForTasks'}
						<ContinueButton
							text={rollForTasksButtonText}
							onclick={handleRollForTasks}
							disabled={rollForTasksButtonDisabled}
							testid="roll-tasks-button"
						/>
					{:else if currentScreen === 'drawCard'}
						<ContinueButton
							text={drawCardButtonText}
							onclick={handleDrawCardClick}
							disabled={drawCardButtonDisabled}
							testid="card-deck-button"
							class="neural-cta-wrapper"
						/>
					{:else if currentScreen === 'failureCheck'}
						<ContinueButton
							text={failureCheckButtonText}
							onclick={handleFailureCheck}
							disabled={failureCheckRolling}
							testid="failure-check-button"
						/>
					{:else if currentScreen === 'successCheck'}
						<ContinueButton
							text={successCheckButtonText}
							onclick={handleSuccessCheck}
							disabled={successCheckRolling}
							testid="success-check-button"
						/>
					{:else if currentScreen === 'finalDamageRoll'}
						<ContinueButton
							text={finalDamageButtonText}
							onclick={handleFinalDamageRoll}
							disabled={finalDamageRolling}
							testid="final-damage-roll-button"
						/>
					{:else if currentScreen === 'log' || currentScreen === 'finalLog'}
						{#if journalSaved}
							{#if gameState.gameOver}
								<ButtonBar bordered={false} gameBackground={false}>
									<ContinueButton
										text={gameState.config?.labels?.journalEntryRestartButtonText ?? 'Restart'}
										onclick={handleJournalRestart}
										testid="journal-restart-button"
									/>
									<ContinueButton
										text={gameState.config?.labels?.journalEntryExitButtonText ?? 'Exit'}
										onclick={handleJournalExit}
										testid="journal-exit-button"
									/>
								</ButtonBar>
							{:else}
								<ContinueButton
									text={gameState.config?.labels?.journalEntryNextButtonText ?? 'Continue to Next Round'}
									onclick={handleJournalNext}
									testid="journal-next-button"
								/>
							{/if}
						{:else}
							<ContinueButton
								text={gameState.config?.labels?.journalEntrySaveButtonText ?? 'Record Entry'}
								onclick={handleJournalSave}
								testid="journal-save-button"
							/>
						{/if}
					{/if}
				</div>
				<div class="toolbar-right">
					<DeckVisualization />
				</div>
			</div> -->
		</div>
	</div>
{/if}

<!-- Mini Status HUD - Shows during card screens -->
<MiniStatusHUD show={showMiniHUD} />

<!-- Keyboard Hint - Shows on desktop for first round -->
<KeyboardHint show={showKeyboardHint} />

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

<style>
	.game-screen {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	.dc-intro-wrapper {
		display: flex;
		flex-direction: column;
		overflow: visible;
		min-height: 0;
		height: 100%;
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

	/* Re-enable pointer events for interactive UI elements */
	.ui-content-layer > * {
		pointer-events: auto;
	}

	/* Toolbar Area - Bottom bar with deck viz and buttons */
	.toolbar-area {
		grid-area: toolbar-area;

		/* Layout - CSS Grid for responsive stacking */
		display: grid;
		grid-template-columns: auto 1fr auto;
		grid-template-areas: 'left center right';
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		min-height: 60px;
		padding: var(--space-md);
		position: relative;

		/* Slide-in animation from bottom - dramatic delayed entrance */
		animation: toolbar-slide-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards;
		opacity: 0; /* Start invisible */
	}

	/* Augmented UI background - positioned behind content, doesn't clip children */
	.toolbar-background {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;

		/* Augmented UI Configuration - Match player-round-bar */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, #00eeff 0%, #ff00ff 50%, #00ffaa 100%);
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;

		/* Glassmorphism Effect - Match player-round-bar */
		background: linear-gradient(
			135deg,
			rgba(100, 50, 200, 0.3),
			rgba(50, 150, 255, 0.25),
			rgba(100, 50, 200, 0.2)
		);
		backdrop-filter: blur(12px) saturate(180%);
		-webkit-backdrop-filter: blur(12px) saturate(180%);

		/* Enhanced Multi-layer Glow - Match player-round-bar */
		box-shadow:
			0 0 30px rgba(0, 238, 255, 0.7),
			0 0 60px rgba(0, 238, 255, 0.4),
			0 0 90px rgba(0, 238, 255, 0.2),
			inset 0 0 30px rgba(255, 0, 255, 0.25),
			inset 0 0 50px rgba(0, 255, 255, 0.1);
	}

	@keyframes toolbar-slide-in {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.toolbar-left {
		grid-area: left;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-md);
	}

	.toolbar-center {
		grid-area: center;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
	}

	.toolbar-right {
		grid-area: right;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-md);
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, rgba(30, 30, 40, 0.8), rgba(20, 20, 30, 0.9));
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--color-neon-cyan);
		backdrop-filter: blur(5px);
		-webkit-backdrop-filter: blur(5px);
	}

	.toolbar-button:hover {
		background: linear-gradient(135deg, rgba(40, 40, 50, 0.9), rgba(30, 30, 40, 0.95));
		border-color: var(--color-neon-cyan);
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.4),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
		transform: translateY(-2px);
	}

	.toolbar-button:active {
		transform: translateY(0);
	}

	.exit-button {
		/* No border or background - transparent styling */
		background: transparent;
		border: none;
		color: var(--color-neon-cyan);
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}

	.exit-button:hover {
		background: transparent;
		border: none;
		/* Enhanced neon cyan glow on hover */
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 15px rgba(0, 255, 255, 0.5));
		transform: scale(1.1);
	}

	.exit-button:active {
		transform: scale(1);
		filter: drop-shadow(0 0 12px rgba(0, 255, 255, 1)) drop-shadow(0 0 20px rgba(0, 255, 255, 0.7));
	}

	.help-button {
		/* Transparent styling like exit button */
		background: transparent;
		border: none;
		color: var(--color-neon-cyan);
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}

	.help-button:hover {
		background: transparent;
		border: none;
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 15px rgba(0, 255, 255, 0.5));
		transform: scale(1.1);
	}

	.help-button:active {
		transform: scale(1);
		filter: drop-shadow(0 0 12px rgba(0, 255, 255, 1)) drop-shadow(0 0 20px rgba(0, 255, 255, 0.7));
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
	}

	.main-screen-area > div.dc-screen-container {
		width: 100%;
		height: 100%;
		overflow: visible; /* Allow glows and neural effects to extend beyond container */
		box-sizing: border-box;
		position: relative; /* Ensure content appears above neural background */
		z-index: 1;
	}

	/* Background contextual text */
	.context-text-background {
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		z-index: 0;
		max-width: 90%;
	}

	.context-title {
		font-size: clamp(1.75rem, 5vw, 3.5rem);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		line-height: 1.35;
		margin: 0 0 0.75rem 0;
		font-family: 'lixdu', 'Courier New', monospace;
		opacity: 0.3;
		text-shadow:
			0 0 10px var(--yellow);
	}

	.context-description {
		font-size: clamp(0.875rem, 1.5vw, 1rem);
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.6;
		margin: 0;
		max-width: 600px;
		margin-inline: auto;
		font-weight: 400;
		letter-spacing: 0;
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
		opacity: 0.5;
	}

	.dc-table-bg {
		border-radius: var(--dc-default-border-radius);
		/* Background removed to show neural network animation on all screens */
		background: transparent;
	}

	.status-display-area {
		display: grid;
		justify-content: stretch;
		align-content: start;
		width: 100%;
		opacity: 0.9;
		grid-area: status-area;
	}

	.dc-start-round-screen {
		text-align: center;
		display: grid;
		justify-content: center;
		align-content: center;
		h4 {
			vertical-align: middle;
		}
	}

	/* Mobile responsiveness - Move exit and deck outside toolbar */
	@media (max-width: 450px) or (max-height: 600px) {
		.status-display-area {
			width: 100%;
			margin: auto;
			justify-content: stretch;
		}

		/* Allow overflow on parent containers so toolbar items can appear above */
		.game-screen,
		.ui-content-layer,
		.main-screen-area {
			overflow: visible;
		}

		/* Ensure main-screen-area is below toolbar-area in stacking order */
		.main-screen-area {
			z-index: 1;
		}

		/* Remove z-index from screen container to fix stacking context */
		.main-screen-area > div.dc-screen-container {
			z-index: auto;
		}

		.toolbar-area {
			/* Keep only center area in toolbar */
			grid-template-columns: 1fr;
			grid-template-areas: 'center';
			padding: var(--space-sm);
		}

		.toolbar-left,
		.toolbar-right {
			/* Position absolutely OUTSIDE and ABOVE the toolbar */
			position: absolute;
			bottom: calc(100% + var(--space-sm)); /* Position above the toolbar */
			width: auto;
		}

		.toolbar-left {
			left: 0;
			justify-content: flex-start;
		}

		.toolbar-right {
			right: 0;
			justify-content: flex-end;
		}

		.toolbar-center {
			/* Full width in toolbar */
			width: 100%;
		}

		/* Make buttons take full width */
		.toolbar-center > :global(*) {
			width: 100%;
		}

		.toolbar-center :global(.aug-button-wrapper),
		.toolbar-center :global(.aug-button) {
			width: 100%;
		}
	}
</style>
