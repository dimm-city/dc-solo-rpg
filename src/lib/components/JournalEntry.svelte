<script>
	import { gameState } from '../stores/gameStore.svelte.js';

	// Button logic moved to GameScreen toolbar
	let { journalText = $bindable('') } = $props();

	const currentEvents = $derived(gameState.log.filter((l) => l.round === gameState.round));
</script>

<div class="dc-journal-container" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
	<div class="journal-header-area">
		<h6>{gameState.config?.labels?.journalEntryHeader ?? 'Journal Entry'}</h6>
		<blockquote>
			{gameState.config?.labels?.journalEntrySubHeader ?? 'Record your progress'}
		</blockquote>

		{#each currentEvents as event (event.id)}
			<p>{event.description}</p>
		{/each}
	</div>
	<div class="text-entry-area">
		<textarea bind:value={journalText} rows="5"></textarea>
	</div>
	<!-- Buttons moved to GameScreen toolbar -->
</div>

<style>
	.dc-journal-container {
		display: grid;
		height: 100%;
		padding: var(--space-xl);
		grid-template-columns: 1fr;
		grid-template-rows: 1fr auto;
		row-gap: var(--space-lg);
		grid-auto-flow: row;
		grid-template-areas:
			'header-area'
			'text-entry-area';
		box-sizing: border-box;
		position: relative;
		z-index: 200; /* Above deck visualization (10) and toolbar elements (100) */

		/* Card styling with glassmorphism */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.85));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: var(--border-width-thick) solid var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.3),
			0 0 60px rgba(217, 70, 239, 0.15),
			inset 0 0 30px rgba(217, 70, 239, 0.08);

		/* Augmented UI */
		--aug-border-all: var(--border-width-thick);
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;
	}

	.journal-header-area {
		grid-area: header-area;
		overflow-y: auto;
		max-height: 40vh; /* Limit header height to prevent overflow */
		p {
			margin: var(--space-sm) 0;
		}
	}

	.text-entry-area {
		grid-area: text-entry-area;
		display: flex;
		flex-direction: column;
		min-height: 0; /* Allow flex shrinking */
	}

	textarea {
		width: 100%;
		flex: 1;
		min-height: 8rem; /* Minimum comfortable size */
		max-height: 12rem;
		box-sizing: border-box;
		resize: vertical; /* Allow vertical resizing */
		font-family: 'Courier New', monospace;
		font-size: 1rem;
		padding: var(--space-md);
		/* Matching card aesthetic */
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: 4px;
		color: var(--color-text);
		transition: all 0.3s ease;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-neon-cyan);
		box-shadow:
			0 0 10px rgba(0, 255, 255, 0.3),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}
</style>
