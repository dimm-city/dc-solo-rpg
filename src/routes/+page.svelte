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
		{ title: 'WAA Game Template', url: '/games/full-example' }
	];
	const players = [
		{
			name: 'Guest'
		}
	];

	let gameComponent;
	let ready = false;
	let selectedGame;
	let selectedPlayer = players.at(0);
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
	$: {
		if ($currentScreen === 'gameOver') ready = true;
		console.log('ready changed', ready, $currentScreen);
	}
</script>

<!-- {@debug ready}
{@debug $currentScreen} -->

<section class="form-container">
	<div class="game-container" class:hidden={!ready || $currentScreen == 'loadGame'}>
		<Game
			bind:this={gameComponent}
			{systemSettings}
			on:dc-solo-rpg.journalSaved={onJournalSaved}
			on:dc-solo-rpg.gameOver={onGameOver}
			on:dc-solo-rpg.exitGame={onExitGame}
		/>
	</div>
	<div class="welcome-container" class:hidden={ready && $currentScreen != 'loadGame'}>
		<section class="hero">
			<h1>Dimm City: Solo RPG</h1>
			<p>Demo</p>
		</section>
		<GameSelector
			{games}
			{players}
			bind:selectedPlayer
			bind:selectedGame
			on:dc-solo-rpg.gameSelected={loadGame}
		/>
	</div>
	<!-- 	
	<form>
		<label for="name">Name</label>
		<input type="text" id="name" placeholder="Your name">
		
		<label for="email">Email</label>
		<input type="email" id="email" placeholder="Your email">
		
		<label for="select">Select an option</label>
		<select id="select">
			<option value="option1">Option 1</option>
			<option value="option2">Option 2</option>
			<option value="option3">Option 3</option>
		</select>
		
		<label for="message">Message</label>
		<textarea id="message" rows="4" placeholder="Your message"></textarea>
		
		<button type="submit">Submit</button>
	</form> -->
</section>

<style>
	.game-container {
		display: grid;
		flex: 1;
		min-height: 0;
		height: 100%;
		overflow: hidden; /* Contain children within bounds */
	}
	.welcome-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start; /* Align to top to prevent content overflow */
	}
	.hidden {
		display: none;
	}
</style>
