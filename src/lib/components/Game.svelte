<script>
  import RuleScreen from './RuleScreen.svelte';

	import { onMount } from 'svelte';
	import { currentScreen, gameStore, loadSystemConfig, nextScreen } from './WAAStore.js';
	import IntroScreen from './IntroScreen.svelte';
	import SuccessCheck from './SuccessCheck.svelte';
	import RollForTasks from './RollForTasks.svelte';
	import DrawCard from './DrawCard.svelte';
	import FailureCheck from './FailureCheck.svelte';
	import GameOver from './GameOver.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import Toolbar from './Toolbar.svelte';
	import StartScreen from './StartScreen.svelte';
	export let players = [];
	export let selectedPlayer = null;
	export let games = [];
	export let selectedGame = null;
	export let diceThemes = [];
	export let selectedDice = null;
	export let systemConfig = {};

	onMount(() => {
		loadSystemConfig(systemConfig);
	});
</script>

<div class="dc-game-container">
	{#if $currentScreen == 'loadGame' || $currentScreen == 'options'}
		<slot name="start-screen">
			<StartScreen {games} {players} {diceThemes} {selectedPlayer} {selectedGame} {selectedDice} />
		</slot>
	{:else if $currentScreen == 'rules'}
		<slot name="intro-screen">
			<RuleScreen></RuleScreen>
		</slot>
	{:else if $currentScreen == 'intro'}
		<slot name="intro-screen">
			<IntroScreen />
		</slot>
	{:else}
		<div class="game-screen">
			{#if $currentScreen != 'log' && $currentScreen != 'finalLog'}
				<div class="status-display-area dc-fade-in">
					<StatusDisplay />
				</div>
			{/if}
			<div class="toolbar-area">
				<Toolbar />
			</div>
			<div class="main-screen-area dc-table-bg">
				{#if $currentScreen == 'startRound'}
					<div class="dc-fade-in">
						<h4>Round {$gameStore.round}</h4>
						<button on:click={() => nextScreen('rollForTasks')}>Roll for tasks</button>
					</div>
				{:else if $currentScreen == 'rollForTasks'}
					<div class="dc-fade-in">
						<RollForTasks />
					</div>
				{:else if $currentScreen == 'drawCard'}
					<div class="dc-fade-in">
						<DrawCard />
					</div>
				{:else if $currentScreen == 'failureCheck'}
					<div class="dc-fade-in">
						<FailureCheck />
					</div>
				{:else if $currentScreen == 'log'}
					<div class="dc-fade-in">
						<JournalEntry />
					</div>
				{:else if $currentScreen == 'successCheck'}
					<div class="dc-fade-in">
						<SuccessCheck />
					</div>
				{:else if $currentScreen == 'finalLog'}
					<div class="dc-fade-in">
						<JournalEntry />
					</div>
				{:else if $currentScreen == 'gameOver'}
					<div class="dc-fade-in">
						<GameOver />
					</div>
				{:else}
					<div>error</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	* {
		-webkit-tap-highlight-color: transparent;
	}
	.dc-game-container {
		display: contents;
		box-sizing: border-box;
		font-family: arial;
	}

	.game-screen {
		position: relative;
		align-items: center;
		display: grid;
		height: 100%;
		width: 100%;
		grid-template-rows: min-content 1fr;
		row-gap: 1rem;
		grid-template-areas:
			'toolbar-area'
			'main-screen-area';
	}

	.toolbar-area {
		grid-area: toolbar-area;
	}

	.main-screen-area {
		grid-area: main-screen-area;
		width: calc(100% - var(--dc-default-padding));
		margin-inline: auto;
		display: grid;
		height: 99%;
		box-sizing: border-box;
	}

	.main-screen-area > div {
		width: 100%;
		height: 100%;
	}

	/*.dc-table-bg {
		 border-radius: var(--dc-default-border-radius);
		background: var(--dc-dice-roller-bg); 
	}*/

	.status-display-area {
		position: absolute;
		width: min-content;
		right: 1.5rem;
		z-index: 3;
		opacity: 0.9;
	}

	@media (max-width: 768px) {
		.status-display-area {
			right: 0.5rem;
			font-size: 0.9rem;
		}
	}
	@media (max-width: 350px) {
		.status-display-area {
			display: none;
		}
	}
</style>
