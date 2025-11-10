<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import { startGame } from '../stores/gameActions.svelte.js';
	import { Difficulty } from '../configuration/DifficultyLevels.js';

	let { systemSettings = {} } = $props();

	let options = $state({});
	// export let selectedGame = null; //games.find((g) => g.title == gameConfig.title);
	// export let selectedPlayer = null; // players?.find((p) => p.name == gameState.player);
	// export let diceThemes = [];
	// export let selectedDice = null;

	let status = $state('');
	function setConfig() {
		if (systemSettings.player && gameState.config.loaded) {
			startGame(systemSettings.player, options);
		} else {
			status = 'Please select a player and a game';
		}
	}
</script>

<div class="dc-start-screen-container">
	<h2>{gameState.config.title ?? 'Game'}</h2>
	<div>
		<label for="diceSelect">Select a Dice Theme:</label>
		<select id="diceSelect" bind:value={options.dice}>
			<!-- <option value={null}>Please select a dice theme</option> -->
			{#each systemSettings?.availableDiceThemes as theme}
				<option value={theme}>{theme.name}</option>
			{/each}
		</select>

		<label for="difficulty">Select a difficulty:</label>
		<select bind:value={options.difficulty}>
			{#each Difficulty.getEntries() as entry (entry.value)}
				<option value={entry.value}>{entry.key?.replaceAll('_', ' ')}</option>
			{/each}
		</select>
	</div>

	<button onclick={() => setConfig()}>Start Game</button>
</div>

<style>
	.dc-start-screen-container {
		display: flex;
		height: 100%;
		flex-direction: column;
		gap: 0.5rem;
		padding: var(--dc-default-padding);
		justify-content: space-between;
	}

	select {
		width: 100%;
	}
</style>
