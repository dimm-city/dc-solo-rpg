<script>
	import IntroScreen from './IntroScreen.svelte';
	import { gameStore, gameConfig, currentScreen } from './WAAStore.js';
	import SceneViewer from './SceneViewer.svelte';
	import Shell from './Shell.svelte';
	import StartScreen from './StartScreen.svelte';
	import { fade } from 'svelte/transition';
	export let players = [];
	export let selectedPlayer = null;
	export let games = [];
	export let selectedGame = null;	
</script>

<Shell title={gameConfig?.title ?? 'Please select a game'}>
	{#if $currentScreen == 'loadGame' || $currentScreen == 'options'}
		<div in:fade>
			<StartScreen {games} {players} {selectedPlayer} {selectedGame} />
		</div>
	{:else if $currentScreen == 'intro'}
		<div in:fade>
			<IntroScreen />
		</div>
	{:else}
		<div in:fade>
			<SceneViewer />
		</div>
	{/if}
</Shell>
<style>
	div {
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		justify-content: center;
	}
</style>
