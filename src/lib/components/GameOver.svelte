<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import { nextScreen } from '../stores/gameActions.svelte.js';
</script>

<div class="dc-game-over-container">
	<div class="dc-game-over-header"><h1>Game Over</h1></div>
	<div class="dc-game-over-content">
		{#if gameState.kingsRevealed == 4}
			<p>{gameState.config.labels.failureCounterLoss}</p>
		{:else}
			<h3>{gameState.status}</h3>
		{/if}
	</div>
	<div class="dc-game-over-toolbar">
		<button onclick={() => nextScreen('finalLog')}>record your final log</button>
	</div>
</div>

<style>
	.dc-game-over-container {
		display: grid;
		height: 100%;
		width: 100%;
		grid-template-rows: min-content 1fr min-content;
		justify-content: center;
		text-align: center;
	}

	.dc-game-over-content {
		display: grid;
		height: 100%;
		align-content: center;
	}
	.dc-game-over-toolbar {
		margin: var(--dc-default-padding);
	}
</style>
