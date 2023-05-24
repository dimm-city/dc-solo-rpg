<script>
	import { recordRound, gameStore, currentEvents, nextScreen, restartGame, exitGame } from './WAAStore.js';
	
	let saved = false;
	let journalText = '';
	function save() {
		recordRound({ text: journalText?.toString() });
		journalText = '';
		saved = true;
	}

	function next(action) {
		nextScreen(action);
	}
</script>

<div class="dc-journal-container">
	<div class="journal-header-area">
		<h4>Record your journal entry</h4>
		<h5>Summary of events</h5>
		{#each $currentEvents as event (event)}
		   <p>{event.description}</p>
		{/each}		
	</div>
	<div class="text-entry-area">
		<textarea bind:value={journalText} rows="5" />
	</div>
	<div class="journal-tools-center-area">
		{#if saved}
			{#if $gameStore.gameOver}
				<button on:click={restartGame}>restart</button>
				<button on:click={exitGame}>new game</button>
			{:else}
				<button on:click={next}>continue</button>
			{/if}
		{:else}
			<button on:click={save}>record</button>
		{/if}
	</div>
</div>

<style>
	.dc-journal-container {
		display: grid;
		margin: 3rem;
		grid-template-columns: 1fr;
		grid-template-rows: min-content 1fr min-content;
		row-gap: 0.5rem;
		grid-auto-flow: row;
		grid-template-areas:
			'header-area'
			'text-entry-area'
			'journal-tools-center-area';
	}

	.journal-header-area{
		grid-area: header-area;
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
		
	}
	textarea,
	button {		
		width: 100%;
		box-sizing: border-box;
	}

	/* textarea{
		display: flex;
		flex:1;
		resize: none;

	} */
	/* .journal-tools-right-area {
		grid-area: journal-tools-right-area;
		display: flex;
		justify-content: flex-end;
	}

	.journal-tools-left-area {
		grid-area: journal-tools-left-area;
	} */

	.journal-tools-center-area {
		grid-area: journal-tools-center-area;
		justify-content: center;
		display: flex;
	}
</style>
