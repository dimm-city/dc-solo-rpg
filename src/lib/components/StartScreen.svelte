<script>
	import { loadGame, gameStore, gameConfig } from './WAAStore.js';
	export let players = [];
	export let games = [];
	export let selectedGame = games.find((g) => g.title == gameConfig.title);
	export let selectedPlayer = players?.find((p) => p.name == $gameStore.player);
</script>

<div class="dc-start-screen-container">
	<h2>Start Screen</h2>
	<div>
		<label for="player">Player:</label>
		<select id="player" bind:value={selectedPlayer}>
			{#each players as player}
				<option value={player}>{player.name}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="gameSelect">Select a Game:</label>
		<select id="gameSelect" bind:value={selectedGame}>
			{#each games as game}
				<option value={game}>{game.title}</option>
			{/each}
		</select>
	</div>

	<button on:click={() => loadGame(selectedGame, selectedPlayer)}>Start Game</button>
</div>

<style>
	.dc-start-screen-container{
		display: grid;
		row-gap: 0.5rem;
	}
	
	select{
		width: 100%;
	}
</style>