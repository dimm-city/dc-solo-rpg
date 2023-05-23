<script>
	import SuccessCheck from './SuccessCheck.svelte';
	import RollForTasks from './RollForTasks.svelte';
	import DrawCard from './DrawCard.svelte';
	import Tower from './Tower.svelte';
	import GameOver from './GameOver.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import { currentScreen, gameStore, nextScreen } from './WAAStore.js';
	import Toolbar from './Toolbar.svelte';
</script>

<div class="profile-container">
	<div class="toolbar-area">
		<Toolbar />
	</div>

	<div class="main-screen-area">
		{#if $currentScreen == 'startRound'}
			<div class="dc-fade-in">
				<h4>Round {$gameStore.round}</h4>
				<button on:click={() => nextScreen('rollForTasks')}>Roll for tasks</button>
			</div>
		{:else if $currentScreen == 'rollForTasks'}
			<RollForTasks />
		{:else if $currentScreen == 'drawCard'}
			<div class="dc-fade-in">
				<DrawCard />
			</div>
		{:else if $currentScreen == 'pullFromTower'}
			<div class="dc-fade-in">
				<Tower />
			</div>
		{:else if $currentScreen == 'endTurn'}
			<div class="dc-fade-in">
				<h4>Turn Over</h4>
				<button on:click={() => nextScreen('log')}>next</button>
			</div>
		{:else if $currentScreen == 'log'}
			<div class="dc-fade-in">
				<JournalEntry />
			</div>
		{:else if $currentScreen == 'successCheck'}
			<SuccessCheck />
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
		<div class="status-display-area">
		{#if $currentScreen != 'rollForTasks' && $currentScreen != 'pullFromTower' && $currentScreen != 'successCheck'}
			<StatusDisplay />
	{/if}
		</div>
	<!-- <div class="journal-entry-area">
		<button on:click={() => nextScreen()}>next</button>
	</div> -->
</div>

<!-- <div class="button-bar">
	<button on:click={() => exitGame()}>run away!</button>
	<button on:click={() => nextScreen('startRound')}>start your adventure</button>
</div> -->

<style>
	.profile-container {
		display: grid;
		width: 100%;
		height: 100svh;
		max-height: 100svh;
		grid-template-columns: auto minmax(0,min-content);
		grid-template-rows: min-content 1fr;
		row-gap: 1rem;
		column-gap: 0.5rem;
		grid-auto-flow: row;
		grid-template-areas:
			'toolbar-area toolbar-area'
			'main-screen-area status-display-area';
	}

	/* .journal-entry-area {
		grid-area: journal-entry-area;
		padding-inline: 0.25rem;
	} */

	.toolbar-area {
		grid-area: toolbar-area;
	}

	.main-screen-area {
		grid-area: main-screen-area;
		padding-inline: 0.25rem;
		overflow-y: auto;

		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.main-screen-area > div {
		width: 100%;
		height: 100%;
	}

	.status-display-area {
		grid-area: status-display-area;
	}

	/* .button-bar {
		position: sticky;
		height: min-content;
		top: 100svh;
		width: 100%;
		display: flex;
		justify-content: center;
		background-color: #363636c4;
		padding-block: 0.5rem;
	} */
</style>
