<script>
	import GameSelector from '../lib/components/GameSelector.svelte';
	import { SystemSettings } from '$lib/configuration/SystemSettings.js';
	import { currentScreen } from '$lib/stores/WAAStore.js';

	import Game from '$lib/components/Game.svelte';

	let systemSettings = new SystemSettings();
	const games = [
		{ title: 'Artful Detective', url: '/games/artful-detective' },
		{ title: 'Gnome Alone', url: '/games/gnome-alone' },
		{ title: 'Future Lost', url: '/games/future-lost/' },
		{ title: 'WAA Game Template', url: '/games/example' }
	];
	const players = [
		{
			name: 'Ralph'
		},
		{
			name: 'murmur'
		}
	];

	let gameComponent;
	let ready = false;
	let selectedGame;
	let selectedPlayer;
	function loadGame() {
		ready = true;
		systemSettings.gameConfigUrl = selectedGame.url;
		systemSettings.player = selectedPlayer;
		gameComponent.startGame();
	}
	function onJournalSaved(journal) {
		console.log('onJournalSaved', journal);
	}
	function onGameOver(params) {
		console.log('onGameOver', params);
	}
	function onExitGame(params) {
		console.log('onExitGame', params);
		ready = false;
	}
	$:{
		if($currentScreen === "gameOver") ready = true;
		console.log('ready changed', ready, $currentScreen);
	}
</script>
<!-- {@debug ready}
{@debug $currentScreen} -->
<div class:hidden={!ready || $currentScreen == 'loadGame'}>
	<Game
		bind:this={gameComponent}
		{systemSettings}
		on:dc-solo-rpg.journalSaved={onJournalSaved}
		on:dc-solo-rpg.gameOver={onGameOver}
		on:dc-solo-rpg.exitGame={onExitGame}
	/>
</div>
<div class:hidden={ready && $currentScreen != 'loadGame'}>
	<GameSelector
		{games}
		{players}
		bind:selectedPlayer
		bind:selectedGame
		on:dc-solo-rpg.gameSelected={loadGame}
	/>
</div>

<style>
	div {
		display: grid;
		height: 100%;
	}
	.hidden {
		display: none;
	}
</style>
