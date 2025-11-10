<script>
	let {
		players = [],
		games = [],
		selectedGame = $bindable(null), //games.find((g) => g.title == gameConfig.title);
		selectedPlayer = $bindable(null), // players?.find((p) => p.name == gameState.player);
		ongameselected = () => {}
	} = $props();

	let status = $state('');
	async function setConfig() {
		if (selectedGame && selectedPlayer) {
			ongameselected({ selectedGame, selectedPlayer });
		} else {
			status = 'Please select a player and a game';
		}
	}
</script>

<div class="dc-start-screen-container">
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

	<button onclick={() => setConfig()} data-augmented-ui="tl-clip br-clip both">Load Game</button>
</div>

<style>
	.dc-start-screen-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: var(--dc-default-padding);
		overflow: visible; /* Allow button glows to extend beyond bounds */
	}

	select {
		width: 100%;
	}
</style>
