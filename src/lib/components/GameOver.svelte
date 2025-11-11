<script>
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
</script>

<div class="dc-game-over-container">
	<div class="dc-game-over-header"><h1>Game Over</h1></div>
	<div class="dc-game-over-content">
		{#if gameState.kingsRevealed == 4}
			<p>{gameState.config?.labels?.failureCounterLoss ?? 'Four kings revealed - the game is over'}</p>
		{:else}
			<h3>{gameState.status}</h3>
		{/if}
	</div>
	<div class="dc-game-over-toolbar">
		<ContinueButton
			text="record your final log"
			onclick={() => transitionTo('finalLog')}
			testid="game-over-final-log-button"
		/>
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
