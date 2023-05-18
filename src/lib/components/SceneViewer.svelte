<script>
	import TaskViewer from './TaskViewer.svelte';
  import StoryViewer from './StoryViewer.svelte';

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
			<TaskViewer />
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
		max-height: 100svh;
		grid-template-columns: auto minmax(10rem, min-content);
		grid-template-rows: min-content 1fr min-content;
		gap: 1rem;
		grid-auto-flow: row;
		grid-template-areas:
			'toolbar-area toolbar-area'
			'main-screen-area status-display-area'
			'journal-entry-area journal-entry-area';
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

	.story-container {
		display:flex;
		flex-direction: column;
		overflow-y: auto;
	}
	.status-display-area {
		grid-area: status-display-area;
		padding-inline: 0.25rem;
	}
</style>
