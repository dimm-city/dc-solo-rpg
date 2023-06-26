<script>
	import {  gameStore, exitGame } from '../stores/WAAStore.js';
</script>

<div class="dc-toolbar">
	<div class="left">
		<h3>{$gameStore.config?.title ?? 'Please select a game'}</h3>
		<!-- <small>Player: {$gameStore.player.name}</small> -->
	</div>
	<div class="center" />
	<div class="right">
		<button class="dc-exit-button" on:click={exitGame}>{@html $gameStore.config?.labels.toolbarExitButtonText}</button>		
		<!-- <small>{$gameStore.config?.labels.statusDisplayRoundText}{$gameStore?.round}</small> -->
	</div>
</div>

<style>
	.dc-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: .5rem;
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
		flex-direction: column;
		align-self: start;
	}

	.right button {
		height: min-content;
		width: min-content;
		
		margin: 0;
		padding: 0.1rem;
		background-color: transparent;
	}
</style>
