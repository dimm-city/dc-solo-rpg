<script>
	import { selectedPlayer,  startGame, availableGames } from './GameStore.js';
	export let players = [{
		name: 'Ralph'
	}];
	//export let onStart = () => {}; // Event emitter for starting the game
let game;

	// function startGame() {
	// 	if (selectedPlayer && selectedGame) {
	// 		onStart({ selectedPlayer, selectedGame });
	// 	}
	// }
</script>

<div>
	<h2>Start Screen</h2>
	<label for="player">Player:</label>
	<select id="player" bind:value={$selectedPlayer}>
		{#each players as player}
			<option value={player}>{player.name}</option>
		{/each}
	</select>
	<label for="gameSelect">Select a Game:</label>
	<select id="gameSelect" bind:value={game}>
		{#each $availableGames as game}
			<option value={game}>{game.title}</option>
		{/each}
	</select>

	<button on:click={() => startGame(game.url)}>Start Game</button>
</div>

<style>
	/* Component styles go here */
</style>
