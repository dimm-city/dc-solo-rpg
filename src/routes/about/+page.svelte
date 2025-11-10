<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<article>
	<h1>Dimm City Solo RPG</h1>

	<p>
		Welcome to the Dimm City Solo RPG project! This project provides a highly interactive and
		immersive web component that allows users to play Dimm City Solo RPG games in their browser. The
		Dimm City RPG is a variation of the Wretched and Alone game system. More information about the
		original game system see the License Attribution below.
	</p>

	<h2>Overview</h2>

	<p>
		The Dimm City Solo RPG is a narrative-driven, solo role-playing game that takes players on a
		thrilling adventure that changes each time they play. The game is designed to be played alone,
		with the game system guiding the player through the story, presenting challenges, and shaping
		the narrative based on the cards that are drawn and the roll of the dice.
	</p>

	<h2>Key Features</h2>

	<ul>
		<li><strong>Solo RPG</strong>: Designed for immersive, single-player RPG experiences.</li>
		<li>
			<strong>Configurable</strong>: Allows for extensive customization of game play, narrative
			content, and visual appearance.
		</li>
		<li>
			<strong>Selectable Dice Themes</strong>: Designed for immersive, single-player RPG
			experiences.
		</li>
	</ul>

	<h2>Easy Game Creation</h2>

	<p>
		The game creation process for the DC Solo RPG system is designed to be easy for anyone. The
		three steps to create a game are:
	</p>

	<ol>
		<li><a href="https://github.com/dimm-city/dc-solo-rpg/raw/main/docs/templates.zip">Download the game templates</a></li>
		<li>
			Modify the <code>config.yml</code> file that holds the game configuration, such as the title, subtitle,
			introduction, and more.
		</li>
		<li>
			Modify the description of each card in the <code>deck.csv</code> file to provide the card text.
		</li>
		<li>
			Modify the <code>theme.css</code> file to achieve the desired visual style, such as colors, fonts,
			and layout.
		</li>
	</ol>

	<p>If you would like more information about building a game, you can read the full guide here: <a href="https://github.com/dimm-city/dc-solo-rpg/blob/main/docs/how-to-build-a-game.md" target="_blank">How to build a game</a></p>

	<h2>License Attribution</h2>

	<p>
		This work is based on The Wretched (found at <a href="http://loottheroom.itch.io/wretched"
			>http://loottheroom.itch.io/wretched</a
		>), product of Chris Bissette and Loot The Room, and licensed for our use under the Creative
		Commons Attribution 3.0 Unported license (<a href="http://creativecommons.org/licenses/by/3.0/"
			>http://creativecommons.org/licenses/by/3.0/</a
		>).
	</p>
</article>
<style>
article {
	padding: var(--space-lg);
	max-width: 800px;
	margin: 0 auto;
}

h1 {
	margin-bottom: 1rem;
	color: var(--accent-color);
}
h2 {
	margin-top: 1.25rem;
	color: var(--secondary-color);
}
</style>