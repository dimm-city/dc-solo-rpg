<script>
	import { loadGame, gameStore, gameConfig } from './WAAStore.js';
	export let players = [];
	export let games = [];
	export let selectedGame = null; //games.find((g) => g.title == gameConfig.title);
	export let selectedPlayer = null; // players?.find((p) => p.name == $gameStore.player);
	export let diceThemes = [];
	export let selectedDice = null;

	let status = '';
	function setConfig() {
		if (selectedGame && selectedPlayer) {
			if (!selectedGame.options) selectedGame.options = {};

			selectedGame.options.dice = selectedDice;
			console.log('game', selectedGame);
			loadGame(selectedGame, selectedPlayer);
		} else {
			status = 'Please select a player and a game';
		}
	}
</script>

<div class="dc-start-screen-container">
	<h2>Start Screen</h2>
	<div>
		<label for="player">Player:</label>
		<select id="player" bind:value={selectedPlayer}>
			<option value={null}>Please select a player</option>
			{#each players as player}
				<option value={player}>{player.name}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="gameSelect">Select a Game:</label>
		<select id="gameSelect" bind:value={selectedGame}>
			<option value={null}>Please select a game</option>
			{#each games as game}
				<option value={game}>{game.title}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="diceSelect">Select a Dice Theme:</label>
		<select id="diceSelect" bind:value={selectedDice}>
			<option value={null}>Please select a dice theme</option>
			{#each diceThemes as theme}
				<option value={theme}>{theme.name}</option>
			{/each}
		</select>
	</div>

	<button on:click={() => setConfig()}>Start Game</button>
	<span>{status}</span>
</div>

<style>
	.dc-start-screen-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: var(--dc-default-padding);
	}

	select {
		width: 100%;
	}
</style>
