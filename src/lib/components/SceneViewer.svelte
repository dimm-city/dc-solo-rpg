<script>
	import DiceRoller from './DiceRoller.svelte';
	
	import StatusDisplay from './StatusDisplay.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import { currentState, isWaitingForDice } from './GameStore.js';
	import Toolbar from './Toolbar.svelte';


</script>

<div class="profile-container">
	<div class="toolbar-area">
		<Toolbar />
	</div>
	<div class="status-display-area">
		<StatusDisplay />
	</div>
	<div class="main-screen-area">
		{#if $isWaitingForDice == true}
				<DiceRoller />
		{:else}
			{#each $currentState.completedTasks as task (task.id)}
				<p>{task.title}</p>
			{/each}
			{#each $currentState.currentTasks as task (task.id)}
				<p>{task.title}</p>
			{:else}
				<p>No tasks this round</p>
			{/each}
		{/if}
	</div>
	<div class="journal-entry-area">
		{#if !$isWaitingForDice}
			<JournalEntry />
		{/if}
	</div>
</div>

<style>
	.profile-container {
		display: grid;
		width: 100%;
		height: 100%;
		min-height: 100svh;
		grid-template-columns: auto min-content;
		grid-template-rows: min-content 1fr min-content;
		gap: 1rem;
		grid-auto-flow: row;
		grid-template-areas:
			'toolbar-area toolbar-area'
			'main-screen-area status-display-area'
			'journal-entry-area status-display-area';
	}

	.journal-entry-area {
		grid-area: journal-entry-area;
		padding-inline: 0.25rem;
	}

	.toolbar-area {
		grid-area: toolbar-area;
	}

	.main-screen-area {
		grid-area: main-screen-area;
		padding-inline: 0.25rem;
		overflow-y: auto;
	}



	.status-display-area {
		grid-area: status-display-area;
		padding-inline: 0.25rem;
	}
</style>
