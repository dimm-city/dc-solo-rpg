<script>
	import { recordRound } from './GameStore.js';

	let journalText = '';

	function next() {
		recordRound({ text: journalText?.toString() });
		journalText = '';
	}
</script>

<div class="container">
	<div class="text-entry-area">
		<textarea bind:value={journalText} rows=5 />
	</div>
	<div class="journal-tools-right-area">
		<button on:click={next}>record</button>
	</div>
	<div class="journal-tools-left-area" />
	<div class="journal-tools-center-area" />
</div>

<style>
	.container {
		display: grid;
        width: 100%;
		grid-template-columns: min-content auto min-content;
		grid-template-rows: 1fr min-content;
		gap: 0;
		grid-auto-flow: row;
		grid-template-areas:
			'text-entry-area text-entry-area text-entry-area'
			'journal-tools-left-area journal-tools-center-area journal-tools-right-area';
	}

	.text-entry-area {
		grid-area: text-entry-area;
	}
textarea{
    width: 100%;
    max-width: 100svw;
    box-sizing: border-box;
}
	.journal-tools-right-area {
		grid-area: journal-tools-right-area;
        display: flex;
        justify-content: flex-end;
	}

	.journal-tools-left-area {
		grid-area: journal-tools-left-area;
	}

	.journal-tools-center-area {
		grid-area: journal-tools-center-area;
	}
</style>
