<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import {
		recordRound,
		nextScreen,
		restartGame,
		exitGame
	} from '../stores/gameActions.svelte.js';

	let {
		onjournalsaved = () => {}
	} = $props();

	let saved = $state(false);
	const journal = $state({ text: '' });
	const currentEvents = $derived(gameState.log.filter((l) => l.round === gameState.round));

	async function save() {
		await recordRound(journal);
		journal.text = '';
		saved = true;
		onjournalsaved(journal);
	}

	function next(action) {
		nextScreen(action);
	}
</script>

<div class="dc-journal-container">
	<div class="journal-header-area">
		<h2>{gameState.config.labels.journalEntryHeader}</h2>
		<h3>{gameState.config.labels.journalEntrySubHeader}</h3>

		{#each currentEvents as event}
			<p>{event.id}:{event.description}</p>
		{/each}
	</div>
	<div class="text-entry-area">
		<textarea bind:value={journal.text} rows="5"></textarea>
	</div>
	<div class="journal-tools-center-area">
		{#if saved}
			{#if gameState.gameOver}
				<button onclick={restartGame}>{gameState.config.labels.journalEntryRestartButtonText}</button>
				<button onclick={exitGame}>{gameState.config.labels.journalEntryExitButtonText}</button>
			{:else}
				<button onclick={next}>{gameState.config.labels.journalEntryNextButtonText}</button>
			{/if}
		{:else}
			<button onclick={save}>{gameState.config.labels.journalEntrySaveButtonText}</button>
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
		overflow-y: hidden;
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
	}

	h2{
		margin-bottom: .75rem;
		font-size: clamp(0.8rem, 1.3rem, 1.5rem);
	}
	p{
		padding-block: 0.25rem;
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

	.journal-tools-center-area button {
		margin-inline: 0.25rem;
	}
</style>
