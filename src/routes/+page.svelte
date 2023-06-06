<script>
	import Game from '$lib/components/Game.svelte';
	const games = [
		{ title: 'WAA Game Template', url: '/waa/Example.json' },
		{ title: 'Future Lost', url: '/waa/future-lost.json' }
		// { title: 'Game Template', url: '/games/GameTemplate.json' },
		// { title: 'Game 1', url: '/games/ExampleGame.json' },
		// { title: 'Game 2', url: '/games/ShortExampleGame.json' }
	];
	let players = [
		{
			name: 'Ralph'
		},
		{
			name: 'murmur'
		}
	];

	let diceThemes = [
		{
			name: 'default',
			foreground: 'white',
			background: '#1387b9',
			texture: 'glass',
			description: 'Default dice'
		},
		{
			name: 'Pink Dreams',
			category: 'Custom Sets',
			foreground: 'white',
			background: ['#ff007c', '#df73ff', '#f400a1', '#df00ff', '#ff33cc'],
			outline: '#570000',
			texture: 'glass',
			description: 'Pink Dreams, for Ethan'
		},
		{
			name: 'Fire',
			category: 'Damage Types',
			foreground: '#f8d84f',
			background: ['#f8d84f', '#f9b02d', '#f43c04', '#910200', '#4c1009'],
			outline: 'black',
			texture: 'fire',
			description: 'Fire'
		},
		{
			name: 'Ice',
			category: 'Damage Types',
			foreground: '#60E9FF',
			background: ['#214fa3', '#3c6ac1', '#253f70', '#0b56e2', '#09317a'],
			outline: 'black',
			texture: 'ice',
			description: 'Ice'
		},
		{
			name: 'Poison',
			category: 'Damage Types',
			foreground: '#D6A8FF',
			background: ['#313866', '#504099', '#66409e', '#934fc3', '#c949fc'],
			outline: 'black',
			texture: 'cloudy',
			description: 'Poison'
		},
		{
			name: 'Acid',
			category: 'Damage Types',
			foreground: '#A9FF70',
			background: ['#a6ff00', '#83b625', '#5ace04', '#69f006', '#b0f006', '#93bc25'],
			outline: 'black',
			texture: 'marble',
			description: 'Acid'
		}
	];

	function onJournalSaved(journal) {
		console.log('onJournalSaved', journal);
	}
</script>

<link rel="stylesheet" href="WAAStyles.css" />
<Game {games} {players} {diceThemes} selectedPlayer={players.at(0)} selectedGame={games.at(1)}  on:journalSaved={onJournalSaved}/>
