<script>
	import { createEventDispatcher } from 'svelte';
	import {
		currentScreen,
		gameStore,
		gameStylesheet,
		loadSystemConfig,
		nextScreen,
		transitionToScreen
	} from '../stores/WAAStore.js';
	import OptionsScreen from './OptionsScreen.svelte';
	import IntroScreen from './IntroScreen.svelte';
	import SuccessCheck from './SuccessCheck.svelte';
	import RollForTasks from './RollForTasks.svelte';
	import DrawCard from './DrawCard.svelte';
	import FailureCheck from './FailureCheck.svelte';
	import GameOver from './GameOver.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import Toolbar from './Toolbar.svelte';
	import LoadScreen from './LoadScreen.svelte';

	export let systemSettings = {};
	export const startGame = async () => {
		if (systemSettings.gameConfigUrl && systemSettings.player?.name) {
			await loadSystemConfig(systemSettings);
			dispatcher('dc-solo-rpg.gameLoaded', systemSettings);
		} else {
			$gameStore.status = 'Please select a player and a game';
		}
	};

	const dispatcher = createEventDispatcher();

	$: if ($currentScreen == 'gameOver') {
		dispatcher('dc-solo-rpg.gameOver', $gameStore.state);
	} else if ($currentScreen == 'exitGame') {
		dispatcher('dc-solo-rpg.exitGame', $gameStore.state);
	}
</script>

<svelte:head>
	<link rel="stylesheet" href={$gameStylesheet} />
</svelte:head>
<div class="dc-game-container dc-game-bg">
	{#if $currentScreen == 'loadGame'}
		<div class="dc-game-bg">
			<slot name="load-screen">
				<LoadScreen />
			</slot>
		</div>
	{:else if $currentScreen == 'options'}
		<div class="dc-game-bg">
			<slot name="options-screen">
				<OptionsScreen {systemSettings} />
			</slot>
		</div>
	{:else if $currentScreen == 'intro'}
		<div class="dc-game-bg dc-intro-wrapper">
			<slot name="intro-screen">
				<IntroScreen />
			</slot>
		</div>
	{:else if $currentScreen == 'gameOver'}
		<div class="dc-fade-in dc-screen-container">
			<GameOver />
		</div>
	{:else if $currentScreen == 'finalLog' || $currentScreen == 'log'}
		<div class="dc-fade-in dc-screen-container">
			<JournalEntry on:dc-solo-rpg.journalSaved />
		</div>
	{:else if $currentScreen == 'exitGame'}
		<slot name="options-screen">
			<div>Game Exited</div>
		</slot>
	{:else}
		<div class="game-screen dc-game-bg">
			<div class="toolbar-area">
				<Toolbar />
			</div>
			<div class="status-display-area dc-fade-in">
				{#if $currentScreen != 'log' && $currentScreen != 'finalLog'}
					<StatusDisplay />
				{/if}
			</div>
			<div class="main-screen-area dc-table-bg">
				{#if $currentScreen == 'startRound'}
					<div class="dc-fade-in dc-screen-container">
						<h4>Round {$gameStore.round}</h4>
						<button on:click={async () => await transitionToScreen('rollForTasks')}>Roll for tasks</button>
					</div>
				{:else if $currentScreen == 'rollForTasks'}
					<div class="dc-fade-in dc-screen-container">
						<RollForTasks />
					</div>
				{:else if $currentScreen == 'drawCard'}
					<div class="dc-fade-in dc-screen-container">
						<DrawCard />
					</div>
				{:else if $currentScreen == 'failureCheck'}
					<div class="dc-fade-in dc-screen-container">
						<FailureCheck on:dc-solo-rpg.failureCheckCompleted />
					</div>
				{:else if $currentScreen == 'successCheck'}
					<div class="dc-fade-in dc-screen-container">
						<SuccessCheck />
					</div>
				{:else}
					<div>error: {$currentScreen}</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--dc-default-font-family: inherit;
		--dc-default-text-color: inherit;
		--dc-default-border-radius: 0.5rem;
		--dc-default-padding: 0.25rem;
		--dc-default-boxshadow: 0 2px 5px rgba(0, 0, 0, 0.1);

		--dc-default-game-bg: rgba(145, 177, 248);
		--dc-default-container-bg: rgba(255, 255, 255, 0.3);

		--dc-button-bg: #1387b9;
		--dc-accent-color: rgb(58, 159, 199);
		--dc-toolbar-height: 3rem;
		--dc-header-block-margin: 0.25rem;

		--dc-dice-roller-bg: #cccfd1;

		--dc-card-border: 1px solid #000000;
		--dc-card-border-radius: 1rem;
		--dc-card-back-color: white;
		--dc-card-back-bg: #1387b9;
		--dc-card-front-bg: rgb(235, 235, 235);
		--dc-card-front-color: inherit;

		--dc-status-display-padding: var(--dc-default-padding);
		--dc-success-token-stroke: var(--dc-default-text-color);
		--dc-success-token-fill: var(--dc-accent-color);
		--dc-failure-token-stroke: var(--dc-card-back-bg);
		--dc-failure-token-fill: var(--dc-accent-color);
	}

	* {
		-webkit-tap-highlight-color: transparent;
	}

	.dc-game-container {
		display: grid;
		height: 100%;
		min-height: 0; /* CRITICAL: Allow grid to shrink below content size */
		grid-template-rows: 100%; /* Constrain grid row to parent height */
		box-sizing: border-box;
		font-family: var(--dc-default-font-family);
		color: var(--dc-default-text-color);
		overflow: visible; /* Allow glows to extend beyond bounds */
	}
	.dc-game-container,
	.dc-game-container > div,
	:global(.dc-intro-container) {
		border-radius: var(--dc-default-border-radius);
	}

	.dc-intro-wrapper {
		display: flex;
		flex-direction: column;
		overflow: hidden; /* IntroScreen handles its own overflow */
		min-height: 0; /* Allow flex shrinking */
		height: 100%; /* Fill parent */
	}
	:global(.dc-game-bg) {
		background: var(--dc-default-game-bg);
	}
	:global(.dc-game-container select, .dc-game-container input, .dc-game-container textarea) {
		color: var(--dc-default-text-color);
		background: var(--dc-default-game-bg);
		font-family: var(--dc-default-font-family);
	}
	:global(
			.dc-game-container button,
			.dc-game-container button:hover,
			.dc-game-container button:focus-visible
		) {
		background: var(--dc-button-bg);
		color: var(--dc-button-color);
		text-shadow: none;
		font-family: var(--dc-default-font-family);
	}
	.game-screen {
		position: relative;
		align-items: center;
		display: grid;
		height: 100%;
		width: 100%;
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
	}

	.main-screen-area {
		grid-area: main-screen-area;
		width: 100%;
		margin-inline: auto;
		display: grid;
		min-height: 100%;
		box-sizing: border-box;
		position: relative;
		overflow: visible; /* Allow glows and effects to extend */
	}

	.main-screen-area > div.dc-screen-container {
		width: 100%;
		height: 100%;
		overflow: visible; /* Allow glows and neural effects to extend beyond container */
		box-sizing: border-box;
	}
	.dc-table-bg {
		border-radius: var(--dc-default-border-radius);
		background: var(--dc-dice-roller-bg);

		/* background: rgb(19,135,185);
background: radial-gradient(circle, rgba(19,135,185,1) 0%, rgba(29,63,78,1) 71%, rgba(136,136,136,1) 100%); */
	}


	:global(.dc-header) {
		position: absolute;
		display: grid;
		justify-self: center;
		width: auto;
		min-width: 80%;
		bottom: 0.25rem;
		padding: 0.5rem;
		border-radius: var(--dc-default-border-radius);
		box-shadow: var(--dc-default-box-shadow);
	}
	:global(.dc-header button) {
		display: grid;
		justify-self: center;
		align-self: center;
		width: 100%;
		margin: 0;
		background-color: var(--dc-default-container-bg);
	}
	.status-display-area {
		display: grid;
		justify-content: stretch;
		align-content: start;
		width: 100%;
		opacity: 0.9;
		grid-area: status-area;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	:global(.dc-fade-in) {
		animation: fadeIn 350ms ease-in;
	}

	@media (max-width: 450px) or (max-height: 600px) {
		.status-display-area {
			width: 100%;
			margin: auto;
			justify-content: stretch;
		}

		:global(.dc-header) {
			width: 90%;
		}
	}
</style>
