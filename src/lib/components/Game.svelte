<script>
	import { selectedGame, currentState } from './GameStore.js';
	import GameOver from './GameOver.svelte';
	import SceneViewer from './SceneViewer.svelte';
	import Shell from './Shell.svelte';
	import StartScreen from './StartScreen.svelte';

	export let players = [];
	export let games = [];
	let debug = true;
	


</script>

<Shell title={$selectedGame?.title ?? 'Please select a game'}>
	{#if $currentState.mode == 'start'}
		<StartScreen {games} {players} />
	{:else if $currentState.mode == 'active'}
		<SceneViewer />
	{:else if $currentState.mode == 'over'}
		<GameOver />
	{/if}

	<hr/>
	<input type="checkbox" bind:checked={debug}>
	{#if debug}
	<pre>{@html `<code>${JSON.stringify($currentState, null, 2)}</code>`}</pre>
	{/if}
</Shell>

<style>
	pre {
		padding: 1rem;
		background-color: #fff;
		border-radius: 4px;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-family: monospace;
	}
</style>
