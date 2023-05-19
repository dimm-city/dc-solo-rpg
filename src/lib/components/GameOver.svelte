<script>
	import { nextScreen, gameStore } from "./WAAStore.js";


</script>

<div>
	<h2>Game Over</h2>
	<h3>{$gameStore.status}</h3>
	<button on:click={() => nextScreen('finalLog')}>start new game</button>
</div>
