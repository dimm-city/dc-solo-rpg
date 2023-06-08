<script>
	import { gameConfig, exitGame } from './WAAStore.js';
</script>

<div class="dc-toolbar">
	<div class="left">
		<h3>{gameConfig?.title ?? 'Please select a game'}</h3>
	</div>
	<div class="center" />
	<div class="right">
		<button class="dc-exit-button" on:click={exitGame}>exit</button>
	</div>
</div>

<style>
	.dc-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
	}
	.dc-toolbar h3 {
		margin: 0;
	}

	.dc-toolbar .left {
		text-align: left;
	}

	.dc-toolbar .center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dc-toolbar .right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.right button {
		margin-left: 1rem;
		height: min-content;
	}
</style>
