<script>
	import { goto } from '$app/navigation';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	function goHome() {
		goto('/');
	}
</script>

<NeuralBackground />

<div class="page-container">
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
		<h1 class="page-title">How To Play</h1>
	</nav>

	<article class="content-wrapper">
		<div class="intro-section" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<p class="intro-text">
				Welcome to the Wretched and Alone solo RPG experience. This narrative-driven system combines
				dice, cards, and your imagination to create unique stories of survival and perseverance.
			</p>
		</div>

		<section class="mechanic-card" data-augmented-ui="tl-clip-x tr-clip br-clip-y border">
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<circle cx="15.5" cy="15.5" r="1.5" />
				</svg>
				<h2>The Die</h2>
			</div>
			<p>
				This determines how many tasks you must face in each scene. It's also used for tests to see
				if you are successful on the salvation mechanism and failure checks.
			</p>
		</section>

		<section class="mechanic-card" data-augmented-ui="tl-clip tr-clip-x br-clip bl-clip-y border">
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="2" y="5" width="20" height="14" rx="2" />
					<path d="M2 10h20" />
				</svg>
				<h2>The Oracle (a deck of cards)</h2>
			</div>
			<p>
				The deck provides the tasks and challenges you face. Generally, a deck has four
				topics/areas. There are four cards in the deck that act as your countdowns to failure, one
				from each topic. When all four failure cards are revealed, something in your setting ends
				your quest. This may mean death, giving up, becoming lost, or something else. The primary
				success card acts as a salvation mechanism (see below). The success cards of the other
				topics give some bonus. Other cards require you to roll a failure check, while others are
				safe.
			</p>
		</section>

		<section class="mechanic-card" data-augmented-ui="tl-clip-y tr-clip br-clip bl-clip-x border">
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				<h2>Success Checks</h2>
			</div>
			<p>
				Each game has a way of winning. This mechanism arrives with the primary success card. Once
				the card is drawn, the player rolls a success check at the end of each round. If their roll
				is successful, they earn a success token. After the player has collected all of the required
				success tokens, their character completes their quest! This may come with a final roll or a
				failure check. If your health meter drops to zero at this stage, it would snatch conquest
				away at the last moment.
			</p>
		</section>

		<section class="mechanic-card" data-augmented-ui="tl-clip tr-clip-y br-clip-x bl-clip border">
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
					/>
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
				<h2>Failure Checks</h2>
			</div>
			<p>
				Your health meter is one of your countdowns to losing. Some of your tasks from the deck will
				make you roll a failure check. It represents the fragility of your path to completing your
				task. When your health meter reaches zero, you fail.
			</p>
		</section>

		<section class="mechanic-card" data-augmented-ui="tl-clip-x tr-clip-y br-clip bl-clip border">
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle cx="12" cy="12" r="10" />
					<circle cx="12" cy="12" r="6" />
					<circle cx="12" cy="12" r="2" />
				</svg>
				<h2>Tokens</h2>
			</div>
			<p>
				The tokens are used to track the progress of the salvation mechanism on the Ace of Hearts.
				Tokens can be anything physical that players can easily keep track of, but it is recommended
				that you suggest something fitting to the theme of your game. For example, The Wretched
				tasks the player with trying to repair their ship, and the suggested tokens are screws,
				nuts, and bolts.
			</p>
		</section>

		<section class="mechanic-card" data-augmented-ui="tl-clip-y tr-clip br-clip-x bl-clip-y border">
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
					<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
				</svg>
				<h2>The Journal</h2>
			</div>
			<p>
				Wretched and Alone games are best recorded and documented. Depending on the theme and topic
				of the game, this might be video/audio logs, a handwritten diary, a typed document, or
				something else entirely.
			</p>
		</section>

		<section
			class="mechanic-card win-condition"
			data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
		>
			<div class="card-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
					<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
					<path d="M4 22h16" />
					<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
					<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
					<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
				</svg>
				<h2>Win Conditions</h2>
			</div>
			<p>
				If you complete all of the required success checks, the game is over and you have won! Some
				games may allow for additional win conditions.
			</p>
		</section>
	</article>
</div>

<style>
	.page-container {
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		background: var(--color-bg-primary);
	}

	.page-nav {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(
			135deg,
			rgba(10, 10, 20, 0.95),
			rgba(15, 10, 30, 0.9),
			rgba(10, 15, 25, 0.95)
		);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-bottom: var(--border-width-thick) solid var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
	}

	.page-title {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 900;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-widest);
		text-align: center;
		margin: 0;
		text-shadow:
			0 0 20px rgba(255, 215, 0, 0.6),
			0 0 40px rgba(255, 215, 0, 0.3);
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--color-brand-yellow);
		background: linear-gradient(135deg, rgba(30, 30, 40, 0.6), rgba(20, 20, 30, 0.7));
		border: var(--border-width-default) solid var(--color-cyber-magenta);
		padding: var(--space-sm) var(--space-md);
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-fast);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		align-self: flex-start;
	}

	.back-button:hover {
		color: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
		transform: translateX(-2px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.4),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
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

	.content-wrapper {
		flex: 1;
		padding: clamp(var(--space-lg), 3vw, var(--space-2xl));
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.intro-section {
		position: relative;
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(0, 255, 255, 0.1));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: var(--border-width-default) solid var(--color-neon-cyan);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.3),
			inset 0 0 30px rgba(0, 255, 255, 0.05);

		/* Augmented UI */
		--aug-border-all: var(--border-width-default);
		--aug-border-bg: var(--color-neon-cyan);
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;
	}

	.intro-text {
		font-size: var(--text-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-primary);
		text-align: center;
		margin: 0;
		max-width: 65ch;
		margin-inline: auto;
	}

	.mechanic-card {
		position: relative;
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: var(--border-width-default) solid var(--color-cyber-magenta);
		transition: all var(--transition-base);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);

		/* Augmented UI */
		--aug-border-all: var(--border-width-default);
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		--aug-tl: 12px;
		--aug-tr: 12px;
		--aug-br: 12px;
		--aug-bl: 12px;
	}

	.mechanic-card:hover {
		transform: translateY(-4px);
		border-color: var(--color-neon-cyan);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.1);
	}

	.win-condition {
		border-color: var(--color-brand-yellow);
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.25),
			inset 0 0 20px rgba(255, 215, 0, 0.05);
	}

	.win-condition:hover {
		border-color: var(--color-brand-yellow);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.5),
			0 0 60px rgba(255, 215, 0, 0.3),
			inset 0 0 30px rgba(255, 215, 0, 0.1);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.card-header svg {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
		flex-shrink: 0;
	}

	.win-condition .card-header svg {
		color: var(--color-brand-yellow);
		filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
	}

	.mechanic-card h2 {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
		text-shadow: var(--text-glow-yellow);
	}

	.mechanic-card p {
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-secondary);
		margin: 0;
		max-width: 65ch;
	}

	@media (max-width: 768px) {
		.content-wrapper {
			padding: var(--space-md);
			gap: var(--space-lg);
		}

		.page-nav {
			padding: var(--space-md);
		}

		.intro-section,
		.mechanic-card {
			padding: var(--space-lg);
		}

		.card-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.card-header svg {
			width: 28px;
			height: 28px;
		}

		.mechanic-card h2 {
			font-size: var(--text-lg);
		}
	}

	@media (max-width: 450px) {
		.content-wrapper {
			padding: var(--space-sm);
			gap: var(--space-md);
		}

		.intro-section,
		.mechanic-card {
			padding: var(--space-md);
		}

		.intro-text {
			font-size: var(--text-base);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-button:hover,
		.back-button:active,
		.mechanic-card:hover {
			transform: none !important;
			transition: none !important;
		}

		.back-button:hover svg {
			transform: none !important;
		}
	}
</style>
