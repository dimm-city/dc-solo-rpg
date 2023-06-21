<script>
	import { createEventDispatcher } from 'svelte';
	import {
		currentScreen,
		gameStore,
		gameStylesheet,
		loadSystemConfig,
		nextScreen
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
		<div class="dc-game-bg">
			<slot name="intro-screen">
				<IntroScreen />
			</slot>
		</div>
	{:else}
		<div class="game-screen dc-game-bg">
			<div class="toolbar-area">
				<Toolbar />
			</div>
			<div class="main-screen-area dc-table-bg">
				{#if $currentScreen != 'log' && $currentScreen != 'finalLog'}
					<div class="status-display-area dc-fade-in">
						<StatusDisplay />
					</div>
				{/if}
				{#if $currentScreen == 'startRound'}
					<div class="dc-fade-in dc-screen-container">
						<h4>Round {$gameStore.round}</h4>
						<button on:click={() => nextScreen('rollForTasks')}>Roll for tasks</button>
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
					<div>error: {$currentScreen}</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--dc-default-font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
			'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
		--dc-default-border-radius: 1rem;
		--dc-default-padding: 1rem;
		--dc-default-boxshadow: 0 2px 5px rgba(0, 0, 0, 0.1);

		--dc-default-game-bg: rgba(145, 177, 248);
		--dc-default-container-bg: rgba(255, 255, 255, 0.3);

		--dc-accent-color: rgb(58, 159, 199);
		--dc-toolbar-height: 3rem;
		--dc-header-block-margin: 0.25rem;

		--dc-dice-roller-bg: #cccfd1;

		--dc-card-border: 1px solid #000000;
		--dc-card-border-radius: 1rem;
		--dc-card-back-color: white;
		--dc-card-back-bg: #1387b9;
		--dc-card-front-bg: rgb(235, 235, 235);

		--dc-status-display-padding: var(--dc-default-padding);
	}

	* {
		-webkit-tap-highlight-color: transparent;
	}

	.dc-game-container {
		display: contents;
		box-sizing: border-box;
		font-family: var(--dc-default-font-family);
	}
	:global(.dc-game-bg) {
		background: var(--dc-default-game-bg);
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
		position: relative;
	}

	.main-screen-area > div.dc-screen-container {
		width: 100%;
		height: 100%;
	}
	.dc-table-bg {
		border-radius: var(--dc-default-border-radius);
		background: var(--dc-dice-roller-bg);

		/* background: rgb(19,135,185);
background: radial-gradient(circle, rgba(19,135,185,1) 0%, rgba(29,63,78,1) 71%, rgba(136,136,136,1) 100%); */
	}

	/*.dc-table-bg {
		 border-radius: var(--dc-default-border-radius);
		background: var(--dc-dice-roller-bg); 
	}*/

	:global(.dc-header) {
		position: absolute;
		display: grid;
		justify-self: center;
		width: calc(100% - var(--dc-default-padding));
		border-radius: var(--dc-default-border-radius);
		box-shadow: var(--dc-default-box-shadow);
		background-color: var(--dc-default-container-bg);
	}
	.status-display-area {
		position: absolute;
		display: grid;
		justify-content: center;
		align-content: center;

		width: min-content;
		right: 1.5rem;
		z-index: 3;
		opacity: 0.9;

		top: 0;
		bottom: 0;
		margin: auto 0;
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
		animation: fadeIn 1s ease-in;
	}

	@media (max-width: 768px) {
		.status-display-area {
			right: 0.5rem;
			font-size: 0.9rem;
			bottom: 0;
		}
	}
	@media (max-width: 350px) {
		.status-display-area {
			display: none;
		}
	}
</style>
