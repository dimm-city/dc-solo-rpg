<script>
	import IntroScreen from './IntroScreen.svelte';
	import { currentState } from './GameStore.js';
	import GameOver from './GameOver.svelte';
	import SceneViewer from './SceneViewer.svelte';
	import Shell from './Shell.svelte';
	import StartScreen from './StartScreen.svelte';
	import { fade } from 'svelte/transition';
	export let players = [];
	export let games = [];
	let debug = true;
</script>

<Shell title={$currentState?.config?.title ?? 'Please select a game'}>
	{#if $currentState.mode == 'start'}
		<div in:fade >
			<StartScreen {games} {players} />
		</div>
	{:else if $currentState.mode == 'intro'}
		<div in:fade >
			<IntroScreen />
		</div>
	{:else if $currentState.mode == 'active'}
		<div in:fade >
			<SceneViewer />
		</div>
	{:else if $currentState.mode == 'over'}
		<div in:fade >
			<GameOver />
		</div>
	{/if}
</Shell>
<style>
	div{
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		justify-content: center;
	}
</style>

<!-- <hr />
<input type="checkbox" bind:checked={debug} />
{#if debug}
	<pre>{@html `<code>${JSON.stringify($currentState, null, 2)}</code>`}</pre>
{/if}

<style>
	pre {
		padding: 1rem;
		background-color: #fff;
		border-radius: 4px;
		font-size: 0.875rem;
		line-height: 1.25rem;
		font-family: monospace;
	}
</style> -->
