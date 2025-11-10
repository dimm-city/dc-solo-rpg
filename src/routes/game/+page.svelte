<script>
	import Game from '$lib/components/Game.svelte';
	import { SystemSettings } from '$lib/configuration/SystemSettings.js';
	import { onMount } from 'svelte';

	let systemSettings = new SystemSettings();
	systemSettings.gameConfigUrl = '/games/artful-detective/config.yml';
	systemSettings.player = { name: 'Guest' };

	let gameComponent;

	onMount(async () => {
		if (gameComponent?.startGame) {
			await gameComponent.startGame();
		}
	});
</script>

<div class="game-page">
	<Game bind:this={gameComponent} {systemSettings} />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden; /* Prevent page-level scrolling */
	}

	/* Hide header and footer for fullscreen game */
	:global(body > header),
	:global(body > footer) {
		display: none;
	}

	:global(body > main) {
		padding: 0;
		margin: 0;
		height: 100vh;
		overflow: hidden;
	}

	.game-page {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden; /* Prevent scrolling */
		display: flex;
		flex-direction: column;
	}
</style>
