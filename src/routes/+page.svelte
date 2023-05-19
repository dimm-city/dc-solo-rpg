<script>
	import Game from '$lib/components/Game.svelte';
	const games = [
		{ title: 'WAA Game Template', url: '/waa/Example.json' },
		{ title: 'Future Lost', url: '/waa/future-lost.json' },
		// { title: 'Game Template', url: '/games/GameTemplate.json' },
		// { title: 'Game 1', url: '/games/ExampleGame.json' },
		// { title: 'Game 2', url: '/games/ShortExampleGame.json' }
	];
	let players = [
		{
			name: 'Ralph'
		},
		{
			name: "murmur"
		}
	];
</script>

<Game {games} {players} selectedPlayer={players.at(1)} selectedGame={games.at(1)} />
