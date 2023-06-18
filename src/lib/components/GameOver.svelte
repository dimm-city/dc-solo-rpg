<script>
	import { nextScreen, gameStore } from '../stores/WAAStore.js';
</script>

<div class="dc-game-over-container">
	<div class="dc-game-over-header"><h1>Game Over</h1></div>
	<div class="dc-game-over-content">
		<h3>{$gameStore.status}</h3>
	</div>
	<div class="dc-game-over-toolbar">
		<button on:click={() => nextScreen('finalLog')}>record your final log</button>
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
