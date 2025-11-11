<script>
	import Game from '$lib/components/Game.svelte';
	import { initializeGame } from '$lib/stores/gameInit.js';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	onMount(() => {
		// Initialize game state using centralized initialization logic
		initializeGame(data.gameConfig, data.player);
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={data.gameConfig.stylesheet} />
</svelte:head>

<div class="game-page" data-testid="game-page">
	<Game systemSettings={{ player: data.player }} />
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
