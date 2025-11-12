<script>
	import { goto } from '$app/navigation';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	function goHome() {
		goto('/');
	}
</script>

<nav class="page-nav">
	<button onclick={goHome} class="back-button" aria-label="Go back to home">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="m15 18-6-6 6-6" />
		</svg>
		Back to Home
	</button>
</nav>

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
		The game creation process for the DC Solo RPG system uses a simple markdown-based format. Create
		a game by writing a single <code>.game.md</code> file with:
	</p>

	<ol>
		<li>YAML frontmatter with title, subtitle, win/lose messages</li>
		<li>Introduction sections using markdown headers</li>
		<li>
			52 card definitions organized by type (Primary Success, Failure Counter, Narrative, Challenge,
			Event)
		</li>
	</ol>

	<p>For more information about building a game, see the documentation in the repository.</p>

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
	.page-nav {
		padding: var(--space-md) var(--space-lg);
		background: var(--color-bg-primary);
		border-bottom: var(--border-width-default) solid var(--color-cyber-magenta);
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand-yellow);
		background: transparent;
		border: var(--border-width-default) solid var(--color-cyber-magenta);
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-fast);
	}

	.back-button:hover {
		color: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
		transform: translateX(-2px);
		box-shadow: var(--glow-cyan);
	}

	.back-button:active {
		transform: translateX(-1px);
	}

	.back-button svg {
		transition: transform var(--transition-fast);
	}

	.back-button:hover svg {
		transform: translateX(-2px);
	}

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

	@media (prefers-reduced-motion: reduce) {
		.back-button:hover,
		.back-button:active {
			transform: none !important;
		}

		.back-button:hover svg {
			transform: none !important;
		}
	}
</style>
