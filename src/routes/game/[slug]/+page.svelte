<script>
	import Game from '$lib/components/Game.svelte';
	import { gameState, transitionTo } from '$lib/stores/gameStore.svelte.js';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// Helper for shuffling array
	function shuffle(array) {
		let currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	onMount(() => {
		// Initialize game state directly with pre-loaded config
		gameState.config = data.gameConfig;
		gameState.stylesheet = data.gameConfig.stylesheet;
		gameState.systemConfig = { gameConfigUrl: `/games/${data.slug}/` };
		
		// Initialize player and game state
		gameState.state = 'intro'; // Set directly to intro since we bypassed loadGame and options
		gameState.round = 1;
		gameState.player = data.player;
		gameState.playerName = data.player.name;
		gameState.tokens = 10;
		gameState.kingsRevealed = 0;
		gameState.kingOfHearts = false;
		gameState.kingOfDiamonds = false;
		gameState.kingOfClubs = false;
		gameState.kingOfSpades = false;
		gameState.aceOfHeartsRevealed = false;
		gameState.gameOver = false;
		gameState.win = false;
		gameState.tower = 54;
		gameState.bonus = 0;
		gameState.log = [];
		gameState.journalEntries = [];
		gameState.cardsToDraw = 0;
		gameState.currentCard = null;
		gameState.diceRoll = 0;

		// Set up deck
		gameState.deck = shuffle([...data.gameConfig.deck]);

		// Handle difficulty 0 (easy mode - remove Ace of Hearts)
		if (data.gameConfig.options?.difficulty === 0) {
			gameState.aceOfHeartsRevealed = true;
			gameState.deck = gameState.deck.filter((c) => !(c.card === 'A' && c.suit === 'hearts'));
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={data.gameConfig.stylesheet} />
</svelte:head>

<div class="game-page">
	<Game systemSettings={{ player: data.player }} />
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
