<script>
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import { fade } from 'svelte/transition';

	import LoadScreen from './LoadScreen.svelte';
	import OptionsScreen from './OptionsScreen.svelte';
	import IntroScreen from './IntroScreen.svelte';
	import GameOver from './GameOver.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import SuccessCheck from './SuccessCheck.svelte';
	import RollForTasks from './RollForTasks.svelte';
	import DrawCard from './DrawCard.svelte';
	import FailureCheck from './FailureCheck.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import Toolbar from './Toolbar.svelte';
	import AugmentedButton from './AugmentedButton.svelte';

	let {
		systemSettings = {},
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {}
	} = $props();

	const currentScreen = $derived(gameState.state);
	const TRANSITION_DURATION = 300;
</script>

{#if currentScreen == 'loadGame'}
	<div class="dc-game-bg" data-testid="screen-loadGame" transition:fade={{ duration: TRANSITION_DURATION }}>
		<LoadScreen />
	</div>
{:else if currentScreen == 'options'}
	<div class="dc-game-bg" data-testid="screen-options" transition:fade={{ duration: TRANSITION_DURATION }}>
		<OptionsScreen {systemSettings} />
	</div>
{:else if currentScreen == 'intro'}
	<div class="dc-game-bg dc-intro-wrapper" data-testid="screen-intro" transition:fade={{ duration: TRANSITION_DURATION }}>
		<IntroScreen />
	</div>
{:else if currentScreen == 'gameOver'}
	<div class="dc-fade-in dc-screen-container" data-testid="screen-gameOver" transition:fade={{ duration: TRANSITION_DURATION }}>
		<GameOver />
	</div>
{:else if currentScreen == 'finalLog' || currentScreen == 'log'}
	<div class="dc-fade-in dc-screen-container dc-journal-screen" data-testid="screen-journal" transition:fade={{ duration: TRANSITION_DURATION }}>
		<JournalEntry {onjournalsaved} />
	</div>
{:else if currentScreen == 'exitGame'}
	<div data-testid="screen-exitGame" transition:fade={{ duration: TRANSITION_DURATION }}>Game Exited</div>
{:else}
	<div class="game-screen dc-game-bg">
		<div class="toolbar-area">
			<Toolbar />
		</div>
		<div class="status-display-area dc-fade-in" data-testid="status-display">
			{#if currentScreen != 'log' && currentScreen != 'finalLog'}
				<StatusDisplay />
			{/if}
		</div>
		<div class="main-screen-area dc-table-bg">
			{#if currentScreen == 'startRound'}
				<div class="dc-fade-in dc-screen-container" data-testid="screen-startRound" transition:fade={{ duration: TRANSITION_DURATION }}>
					<h4>Round {gameState.round}</h4>
					<AugmentedButton
						text="Roll for tasks"
						onclick={() => transitionTo('rollForTasks')}
						testid="start-round-button"
					/>
				</div>
			{:else if currentScreen == 'rollForTasks'}
				<div class="dc-fade-in dc-screen-container" data-testid="screen-rollForTasks" transition:fade={{ duration: TRANSITION_DURATION }}>
					<RollForTasks />
				</div>
			{:else if currentScreen == 'drawCard'}
				<div class="dc-fade-in dc-screen-container" data-testid="screen-drawCard" transition:fade={{ duration: TRANSITION_DURATION }}>
					<DrawCard />
				</div>
			{:else if currentScreen == 'failureCheck'}
				<div class="dc-fade-in dc-screen-container" data-testid="screen-failureCheck" transition:fade={{ duration: TRANSITION_DURATION }}>
					<FailureCheck {onfailurecheckcompleted} />
				</div>
			{:else if currentScreen == 'successCheck'}
				<div class="dc-fade-in dc-screen-container" data-testid="screen-successCheck" transition:fade={{ duration: TRANSITION_DURATION }}>
					<SuccessCheck />
				</div>
			{:else}
				<div transition:fade={{ duration: TRANSITION_DURATION }}>error: {currentScreen}</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.dc-intro-wrapper {
		display: flex;
		flex-direction: column;
		overflow: visible; /* Allow glow effects to extend beyond bounds */
		min-height: 0; /* Allow flex shrinking */
		height: 100%; /* Fill parent */
	}

	.game-screen {
		position: relative;
		align-items: center;
		display: grid;
		height: 100%;
		width: 100%;
		min-width: 0; /* CRITICAL: Allow grid to shrink */
		grid-template-rows: min-content min-content 1fr;
		row-gap: 0.5rem;
		padding: 0.5rem;
		box-sizing: border-box;
		grid-template-areas:
			'toolbar-area'
			'status-area'
			'main-screen-area';
	}

	.toolbar-area {
		grid-area: toolbar-area;
		padding-inline: 0.25rem;
		min-width: 0; /* CRITICAL: Allow grid area to shrink */
	}

	.main-screen-area {
		grid-area: main-screen-area;
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

	.dc-journal-screen {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.dc-journal-screen :global(.dc-journal-container) {
		position: relative;
		z-index: 1;
	}

	@media (max-width: 450px) or (max-height: 600px) {
		.status-display-area {
			width: 100%;
			margin: auto;
			justify-content: stretch;
		}
	}
</style>
