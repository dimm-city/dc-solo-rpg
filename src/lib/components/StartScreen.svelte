<script>
	import { loadSystemConfig } from '../stores/gameActions.svelte.js';
	import AugmentedButton from './AugmentedButton.svelte';

	/**
	 * @property  {SystemSettings} systemSettings - Current system settings
	 */
	let {
		systemSettings = $bindable({}),
		players = [],
		games = [],
		selectedGame = $bindable(null), //games.find((g) => g.title == gameConfig.title);
		selectedPlayer = $bindable(null) // players?.find((p) => p.name == gameState.player);
	} = $props();

	let status = $state('');
	async function setConfig() {
		if (selectedGame && selectedPlayer) {
			if (!selectedGame.options) selectedGame.options = {};

			systemSettings.gameConfigUrl = selectedGame.url;

			await loadSystemConfig(systemSettings);
		} else {
			status = 'Please select a player and a game';
		}
	}
</script>

<div class="dc-start-screen-container">
	<h2>Start Screen</h2>
	<div>
		<label for="player">Player:</label>
		<select id="player" bind:value={systemSettings.player}>
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

	<AugmentedButton text="Start Game" onclick={() => setConfig()} />
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
