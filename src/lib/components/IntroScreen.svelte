<script>
	import { nextScreen, gameConfig, exitGame } from './WAAStore.js';
</script>

<div class="dc-intro-container">
	<div class="content">
		<h2>Intro</h2>
		<p>{@html gameConfig.intro?.replace('\n', '<br /><br />')}</p>
	</div>
	<div class="button-bar">
		<button on:click={() => exitGame()}>exit</button>
		<button on:click={() => nextScreen('rollForTasks')}>start</button>
	</div>
</div>

<style>
	.dc-intro-container {
		display: flex;
		height: 100%;
		width: 100%;
		flex-direction: column;
	}
	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.button-bar {
		position: sticky;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding-block: 0.5rem;
	}
	.button-bar button{
		margin-inline: 0.25rem;
	}
</style>
