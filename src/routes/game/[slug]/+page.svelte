<script>
	import Game from '$lib/components/Game.svelte';
	import { initializeGame } from '$lib/stores/gameInit.js';
	import { gameState } from '$lib/stores/gameStore.svelte.js';
	import { getAllDiceThemes } from '$lib/configuration/DiceThemes.js';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	const availableDiceThemes = getAllDiceThemes();

	onMount(() => {
		// Only initialize if the game isn't already loaded (e.g., from resume)
		// Check if the current gameState matches this game
		const isAlreadyLoaded =
			gameState.config?.slug === data.gameConfig.slug && gameState.config?.loaded === true;

		if (!isAlreadyLoaded) {
			// Initialize game state using centralized initialization logic
			initializeGame(data.gameConfig, data.player);
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={data.gameConfig.stylesheet} />
</svelte:head>

<div class="game-page" data-testid="game-page">
	<Game systemSettings={{ player: data.player, availableDiceThemes }} />
</div>

<style>
	/* Fullscreen styles moved to game/+layout.svelte */
	.game-page {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
