<script>
	import Game from '$lib/components/Game.svelte';
	const games = [
		{ title: 'Game 1', url: '/games/ExampleGame.json' },
		{ title: 'Game 2', url: '/games/ExampleGame.json' }
	];
	let players = [
		{
			name: 'Ralph'
		}
	];
</script>
<Game {games} {players} />
