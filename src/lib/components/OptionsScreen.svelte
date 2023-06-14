<script>
	import { startGame, gameStore, gameConfig } from './WAAStore.js';
	import { Difficulty } from '../configuration/DifficultyLevels.js';
	export let systemSettings = {};
	let options = {};
	// export let selectedGame = null; //games.find((g) => g.title == gameConfig.title);
	// export let selectedPlayer = null; // players?.find((p) => p.name == $gameStore.player);
	// export let diceThemes = [];
	// export let selectedDice = null;

	let status = '';
	function setConfig() {
		if (systemSettings.player && $gameStore.config.loaded) {
			startGame(systemSettings.player, options);
		} else {
			status = 'Please select a player and a game';
			console.log(systemSettings, options);
		}
	}
</script>

<div class="dc-start-screen-container">
	<h2>{$gameStore.config.title ?? 'Game'} Options</h2>
	<div>
		<label for="diceSelect">Select a Dice Theme:</label>
		<select id="diceSelect" bind:value={options.dice}>
			<!-- <option value={null}>Please select a dice theme</option> -->
			{#each systemSettings?.availableDiceThemes as theme}
				<option value={theme}>{theme.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="difficulty">Select a difficulty:</label>
		<select bind:value={options.difficulty}>
			{#each Difficulty.getEntries() as entry (entry.value)}
				<option value={entry.value}>{entry.key?.replaceAll("_", " ")}</option>
			{/each}
		</select>
	</div>

	<button on:click={() => setConfig()}>Start Game</button>
	{status}
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
