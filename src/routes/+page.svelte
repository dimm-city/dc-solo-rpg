<script>
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let selectedGame = $state(null);

	function loadGame() {
		if (selectedGame) {
			goto(`/game/${selectedGame.slug}`);
		}
	}
</script>

<section class="form-container">
	<div class="welcome-container">
		<section class="hero">
			<h1>Dimm City: Solo RPG</h1>
			<p>Demo</p>
		</section>
		<div class="dc-start-screen-container">
			<h2>Select a Game</h2>
			<div>
				<label for="gameSelect">Choose your game:</label>
				<select id="gameSelect" bind:value={selectedGame}>
					<option value={null}>Please select a game</option>
					{#each data.games as game}
						<option value={game}>{game.title}</option>
					{/each}
				</select>
			</div>

			<button onclick={loadGame} disabled={!selectedGame}>Load Game</button>
		</div>
	</div>
</section>

<style>
	.welcome-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start; /* Align to top to prevent content overflow */
	}
</style>

