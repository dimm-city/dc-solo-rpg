<script>
	import { startGame } from './GameStore.js';
	export let players = [];
	export let games = [];
	let game;
	let selectedPlayer;
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
	<select id="gameSelect" bind:value={game}>
		{#each games as game}
			<option value={game}>{game.title}</option>
		{/each}
	</select>
	<button on:click={() => startGame(game.url, selectedPlayer)}>Start Game</button>
</div>