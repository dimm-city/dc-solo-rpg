<script>
	import Game from '$lib/components/Game.svelte';
	import { initializeGame } from '$lib/stores/gameInit.js';
	import { getAllDiceThemes } from '$lib/configuration/DiceThemes.js';
	import { getCustomGame } from '$lib/stores/customGames.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const availableDiceThemes = getAllDiceThemes();
	let gameConfig = $state(null);
	let player = $state({ name: 'Guest' });
	let error = $state(null);

	onMount(() => {
		const slug = $page.params.slug;

		if (!slug) {
			error = 'No game slug provided';
			return;
		}

		// Load custom game from localStorage
		const customGame = getCustomGame(slug);

		if (!customGame) {
			error = `Custom game "${slug}" not found`;
			// Redirect back to home after showing error
			setTimeout(() => {
				goto('/');
			}, 3000);
			return;
		}

		gameConfig = customGame;

		// Initialize game state
		initializeGame(gameConfig, player);
	});
</script>

{#if error}
	<div class="error-screen">
		<h1>Game Not Found</h1>
		<p>{error}</p>
		<p>Redirecting to home...</p>
	</div>
{:else if gameConfig}
	<div class="game-page" data-testid="game-page">
		<Game systemSettings={{ player, availableDiceThemes }} />
	</div>
{:else}
	<div class="loading-screen">
		<p>Loading custom game...</p>
	</div>
{/if}

<style>
	.game-page {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.error-screen,
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		padding: var(--space-xl);
		text-align: center;
		color: var(--color-text-primary);
	}

	.error-screen h1 {
		color: var(--color-brand-yellow);
		margin-bottom: var(--space-lg);
	}

	.error-screen p {
		margin: var(--space-sm) 0;
	}
</style>
