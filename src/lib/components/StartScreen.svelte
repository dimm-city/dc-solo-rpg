<script>
	import { loadGame, gameStore, gameConfig } from './WAAStore.js';
	export let players = [];
	export let games = [];
	export let selectedGame = games.find((g) => g.title == gameConfig.title);
	export let selectedPlayer = players?.find((p) => p.name == $gameStore.player);
</script>

<div>
	<h2>Start Screen</h2>
	<label for="player">Player:</label>
	<select id="player" bind:value={selectedPlayer}>
		{#each players as player}
			<option value={player}>{player.name}</option>
		{/each}
	</select>
	<label for="gameSelect">Select a Game:</label>
	<select id="gameSelect" bind:value={selectedGame}>
		{#each games as game}
			<option value={game}>{game.title}</option>
		{/each}
	</select>
	<button on:click={() => loadGame(selectedGame, selectedPlayer)}>Start Game</button>
</div>
