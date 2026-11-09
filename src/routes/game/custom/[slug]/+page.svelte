<script>
	import Game from '$lib/components/Game.svelte';
	import { initializeGame } from '$lib/stores/gameInit.js';
	import { gameState } from '$lib/stores/gameStore.svelte.js';
	import { getAllDiceThemes } from '$lib/configuration/DiceThemes.js';
	import { getCustomGame } from '$lib/stores/customGames.js';
	import { getSourceGame } from '$lib/stores/gameSources.svelte.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ErrorScreen from '$lib/components/ErrorScreen.svelte';

	const availableDiceThemes = getAllDiceThemes();
	let gameConfig = $state(null);
	let player = $state({ name: 'Guest' });
	let error = $state(null);
	const docTitle = $derived(
		error ? 'Signal lost · Dream Console' : `${gameConfig?.title ?? 'Loading'} · Dream Console`
	);

	onMount(() => {
		const slug = $page.params.slug;

		if (!slug) {
			error = 'No game slug provided';
			return;
		}

		// An uploaded game, or one from a GitHub source: both are stored in this browser
		const customGame = getCustomGame(slug) ?? getSourceGame(slug);

		if (!customGame) {
			error = `We couldn't find a game called “${slug}” in this browser.`;
			return;
		}

		gameConfig = customGame;

		// Only initialize if the game isn't already loaded (e.g., from resume)
		const isAlreadyLoaded =
			gameState.config?.slug === slug &&
			gameState.config?.loaded === true &&
			gameState.config?.isCustom === true;

		if (!isAlreadyLoaded) {
			// Initialize game state
			initializeGame(gameConfig, player);
		}
	});
</script>

<svelte:head>
	<title>{docTitle}</title>
</svelte:head>

{#if error}
	<ErrorScreen message={error} />
{:else if gameConfig}
	<div class="game-page" data-testid="game-page">
		<Game systemSettings={{ player, availableDiceThemes }} />
	</div>
{:else}
	<div class="loading-screen">
		<p>Loading the game…</p>
	</div>
{/if}

<style>
	.game-page {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

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
</style>
