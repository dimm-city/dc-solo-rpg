<script>
	import { goto } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
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
	<h1>How To Play</h1>

	<h2>The Die</h2>
	<p>
		This determines how many tasks you must face in each scene. It's also used for tests to see if
		you are successful on the salvation mechanism and failure checks.
	</p>

	<h2>The Oracle (a deck of cards)</h2>
	<p>
		The deck provides the tasks and challenges you face. Generally, a deck has four topics/areas.
		There are four cards in the deck that act as your countdowns to failure, one from each topic.
		When all four failure cards are revealed, something in your setting ends your quest. This may
		mean death, giving up, becoming lost, or something else. The primary success card acts as a
		salvation mechanism (see below). The success cards of the other topics give some bonus. Other
		cards require you to roll a failure check, while others are safe.
	</p>

	<h2>Success Checks</h2>
	<p>
		Each game has a way of winning. This mechanism arrives with the primary success card. Once the
		card is drawn, the player rolls a success check at the end of each round. If their roll is
		successful, they earn a success token. After the player has collected all of the required
		success tokens, their character completes their quest! This may come with a final roll or a
		failure check. If your health meter drops to zero at this stage, it would snatch conquest away
		at the last moment.
	</p>

	<h2>Failure Checks</h2>
	<p>
		Your health meter is one of your countdowns to losing. Some of your tasks from the deck will
		make you roll a failure check. It represents the fragility of your path to completing your task.
		When your health meter reaches zero, you fail.
	</p>

	<h2>Tokens</h2>
	<p>
		The tokens are used to track the progress of the salvation mechanism on the Ace of Hearts.
		Tokens can be anything physical that players can easily keep track of, but it is recommended
		that you suggest something fitting to the theme of your game. For example, The Wretched tasks
		the player with trying to repair their ship, and the suggested tokens are screws, nuts, and
		bolts.
	</p>

	<h2>The Journal</h2>
	<p>
		Wretched and Alone games are best recorded and documented. Depending on the theme and topic of
		the game, this might be video/audio logs, a handwritten diary, a typed document, or something
		else entirely.
	</p>

	<h2>Win Conditions</h2>
	<p>
		If you complete all of the required success checks, the game is over and you have won! Some
		games may allow for additional win conditions.
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
