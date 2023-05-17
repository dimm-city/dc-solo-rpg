<script>
	import SceneViewer from './SceneViewer.svelte';
	import { currentState, endGame } from './GameStore.js';
	import Shell from './Shell.svelte';
	import StartScreen from './StartScreen.svelte';
</script>

<div>
	<h2>Game Over</h2>
	<h3>{$currentState.status}</h3>
	<button on:click={() => endGame({ text: 'the end' })}>start new game</button>
</div>
