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

<style>
	.profile-container {
		position: relative;
		align-items: center;
		display: grid;
		height: 100%;
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
	}

	.main-screen-area > div {
		width: 100%;
		height: 100%;
	}

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
