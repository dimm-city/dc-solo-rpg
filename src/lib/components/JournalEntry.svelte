<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import { recordRound, restartGame, exitGame } from '../stores/gameActions.svelte.js';
	import ContinueButton from './ContinueButton.svelte';

	let { onjournalsaved = () => {} } = $props();

	let saved = $state(false);
	const journal = $state({ text: '' });
	const currentEvents = $derived(gameState.log.filter((l) => l.round === gameState.round));

	async function save() {
		await recordRound(journal);
		journal.text = '';
		saved = true;
		onjournalsaved(journal);
	}

	function next() {
		// recordRound already handles the state transition
	}
</script>

<div class="dc-journal-container">
	<div class="journal-header-area">
		<h2>{gameState.config?.labels?.journalEntryHeader ?? 'Journal Entry'}</h2>
		<h3>{gameState.config?.labels?.journalEntrySubHeader ?? 'Record your progress'}</h3>

		{#each currentEvents as event (event.id)}
			<p>{event.id}:{event.description}</p>
		{/each}
	</div>
	<div class="text-entry-area">
		<textarea bind:value={journal.text} rows="5"></textarea>
	</div>
	<div class="journal-tools-center-area">
		{#if saved}
			{#if gameState.gameOver}
				<ContinueButton
					text={gameState.config?.labels?.journalEntryRestartButtonText ?? 'Restart'}
					onclick={restartGame}
					testid="journal-restart-button"
				/>
				<ContinueButton
					text={gameState.config?.labels?.journalEntryExitButtonText ?? 'Exit'}
					onclick={exitGame}
					testid="journal-exit-button"
				/>
			{:else}
				<ContinueButton
					text={gameState.config?.labels?.journalEntryNextButtonText ?? 'Next'}
					onclick={next}
					testid="journal-next-button"
				/>
			{/if}
		{:else}
			<ContinueButton
				text={gameState.config?.labels?.journalEntrySaveButtonText ?? 'Save'}
				onclick={save}
				testid="journal-save-button"
			/>
		{/if}
	</div>
</div>

<style>
	.dc-journal-container {
		display: grid;
		height: 100%;
		padding: var(--dc-default-padding);
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto;
		row-gap: 0.5rem;
		grid-auto-flow: row;
		grid-template-areas:
			'header-area'
			'text-entry-area'
			'journal-tools-center-area';
		box-sizing: border-box;
	}

	.journal-header-area {
		grid-area: header-area;
		overflow-y: auto;
		max-height: 40vh; /* Limit header height to prevent overflow */
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
		flex-direction: column;
		min-height: 0; /* Allow flex shrinking */
	}

	h2 {
		margin-bottom: 0.75rem;
		font-size: var(--text-lg); /* Reduce from default h2 size */
	}
	h3 {
		font-size: var(--text-base); /* Reduce from default h3 size */
		margin-top: 0.5rem;
	}
	p {
		padding-block: 0.25rem;
	}
	textarea {
		width: 100%;
		flex: 1;
		min-height: 8rem; /* Minimum comfortable size */
		box-sizing: border-box;
		resize: vertical; /* Allow vertical resizing */
		font-family: inherit;
		font-size: 1rem;
		padding: 0.5rem;
	}

	.journal-tools-center-area {
		grid-area: journal-tools-center-area;
		justify-content: center;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.journal-tools-center-area :global(.aug-button-wrapper) {
		flex: 1;
		min-width: 200px;
	}

	.journal-tools-center-area :global(.aug-button) {
		width: 100%;
	}
</style>
