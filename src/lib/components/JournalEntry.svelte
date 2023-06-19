<script>
	import { createEventDispatcher } from 'svelte';
	import {
		recordRound,
		gameStore,
		currentEvents,
		nextScreen,
		restartGame,
		exitGame		
	} from '../stores/WAAStore.js';

	const dispatcher = createEventDispatcher();
	let saved = false;
	const journal = { text: '' };
	function save() {
		recordRound(journal);
		journal.text = '';
		saved = true;
		dispatcher('dc-solo-rpg.journalSaved', journal);
	}

	function next(action) {
		nextScreen(action);
	}
</script>

<div class="dc-journal-container">
	<div class="journal-header-area">
		<h4>{$gameStore.config.labels.journalEntryHeader}</h4>
		<h5>{$gameStore.config.labels.journalEntrySubHeader}</h5>
		<div />
		{#each $currentEvents as event (event)}
			<p>{event.description}</p>
		{/each}
	</div>
	<div class="text-entry-area">
		<textarea bind:value={journal.text} rows="5" />
	</div>
	<div class="journal-tools-center-area">
		{#if saved}
			{#if $gameStore.gameOver}
				<button on:click={restartGame}>{$gameStore.config.labels.journalEntryRestartButtonText}</button>
				<button on:click={exitGame}>{$gameStore.config.labels.journalEntryExitButtonText}</button>
			{:else}
				<button on:click={next}>{$gameStore.config.labels.journalEntryNextButtonText}</button>
			{/if}
		{:else}
			<button on:click={save}>{$gameStore.config.labels.journalEntrySaveButtonText}</button>
		{/if}
	</div>
</div>

<style>
	.dc-journal-container {
		display: grid;
		height: calc(100% - var(--dc-default-padding));
		margin-inline: var(--dc-default-padding);
		grid-template-columns: 1fr;
		grid-template-rows: 1fr min-content;
		row-gap: 0.5rem;
		grid-auto-flow: row;
		grid-template-areas:
			'header-area'
			'text-entry-area'
			'journal-tools-center-area';
	}

	.journal-header-area {
		grid-area: header-area;
		margin-top: var(--dc-default-padding);
		overflow-y: auto;
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
	}
	textarea,
	button {
		width: 100%;
		height: min(5rem, min-content);
		box-sizing: border-box;
		resize: none;
	}

	.journal-tools-center-area {
		grid-area: journal-tools-center-area;
		justify-content: center;
		display: flex;
	}
</style>
