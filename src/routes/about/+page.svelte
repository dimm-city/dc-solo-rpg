<script>
	import { goto } from '$app/navigation';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';

	/** @type {import('./$types').PageData} */
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
		<h1 class="page-title">About Dream Console</h1>
	</nav>

	<article class="content-wrapper">
		<div class="hero-section" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<div class="hero-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="64"
					height="64"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
					<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
				</svg>
			</div>
			<h2>Dimm City Solo RPG</h2>
			<p class="hero-subtitle">
				An immersive web-based solo RPG experience built on the Wretched and Alone system
			</p>
		</div>

		<section class="content-card" data-augmented-ui="tl-clip-x tr-clip br-clip-y bl-clip border">
			<h3>Overview</h3>
			<p>
				The Dimm City Solo RPG is a narrative-driven, solo role-playing game that takes players on a
				thrilling adventure that changes each time they play. The game is designed to be played
				alone, with the game system guiding the player through the story, presenting challenges, and
				shaping the narrative based on the cards that are drawn and the roll of the dice.
			</p>
		</section>

		<section
			class="content-card features-card"
			data-augmented-ui="tl-clip tr-clip-x br-clip bl-clip-y border"
		>
			<h3>Key Features</h3>
			<ul class="features-list">
				<li>
					<div class="feature-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					</div>
					<div>
						<strong>Solo RPG Experience</strong>
						<p>Designed for immersive, single-player narrative adventures</p>
					</div>
				</li>
				<li>
					<div class="feature-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="3" />
							<path
								d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2"
							/>
						</svg>
					</div>
					<div>
						<strong>Highly Configurable</strong>
						<p>Extensive customization of gameplay, narrative content, and visual appearance</p>
					</div>
				</li>
				<li>
					<div class="feature-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<circle cx="15.5" cy="15.5" r="1.5" />
						</svg>
					</div>
					<div>
						<strong>Selectable Dice Themes</strong>
						<p>Multiple 3D dice visual themes to match your game's aesthetic</p>
					</div>
				</li>
				<li>
					<div class="feature-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="2" y="5" width="20" height="14" rx="2" />
							<path d="M2 10h20" />
						</svg>
					</div>
					<div>
						<strong>Card-Based Narrative</strong>
						<p>52-card Oracle system drives unique stories every playthrough</p>
					</div>
				</li>
			</ul>
		</section>

		<section
			class="content-card creation-card"
			data-augmented-ui="tl-clip-y tr-clip br-clip-x bl-clip border"
		>
			<div class="section-header">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M12 20h9" />
					<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
				</svg>
				<h3>Easy Game Creation</h3>
			</div>
			<p>
				The game creation process for Dream Console uses a simple markdown-based format. Create a
				game by writing a single <code>.game.md</code> file with:
			</p>
			<ol class="creation-steps">
				<li>YAML frontmatter with title, subtitle, win/lose messages</li>
				<li>Introduction sections using markdown headers</li>
				<li>
					52 card definitions organized by type (Primary Success, Failure Counter, Narrative,
					Challenge, Event)
				</li>
			</ol>
			<p class="info-note">
				For more information about building a game, see the documentation in the
				<a href="https://github.com/dimm-city/dc-solo-rpg" target="_blank" rel="noopener noreferrer"
					>repository</a
				>.
			</p>
		</section>

		<section
			class="content-card license-card"
			data-augmented-ui="tl-clip tr-clip-y br-clip bl-clip-x border"
		>
			<div class="section-header">
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
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
				<h3>License Attribution</h3>
			</div>
			<p>
				This work is based on <strong>The Wretched</strong> (found at
				<a href="http://loottheroom.itch.io/wretched" target="_blank" rel="noopener noreferrer"
					>loottheroom.itch.io/wretched</a
				>), product of Chris Bissette and Loot The Room, and licensed for our use under the
				<a
					href="http://creativecommons.org/licenses/by/3.0/"
					target="_blank"
					rel="noopener noreferrer">Creative Commons Attribution 3.0 Unported license</a
				>.
			</p>
		</section>

		<section
			class="content-card dimm-city-card"
			data-augmented-ui="tl-clip-x tr-clip br-clip-y bl-clip-x border"
		>
			<div class="dimm-city-branding">
				<h3>Part of the Dimm City Universe</h3>
				<p>
					This project is part of the <strong class="brand-highlight">Dimm City</strong>
					creaturepunk universe—a world of neon-lit cityscapes, cybernetic creatures, and narrative-driven
					experiences.
				</p>
				<a
					href="https://dimm.city"
					target="_blank"
					rel="noopener noreferrer"
					class="dimm-city-link"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<polyline points="15 3 21 3 21 9" />
						<line x1="10" y1="14" x2="21" y2="3" />
					</svg>
					Visit Dimm.City
				</a>
			</div>
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
		font-size: clamp(1.5rem, 3.5vw, 2.25rem);
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
		padding-bottom: var(--space-3xl);
	}

	/* Hero Section */
	.hero-section {
		position: relative;
		padding: var(--space-2xl);
		background: linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(0, 255, 255, 0.1));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: var(--border-width-thick) solid var(--color-neon-cyan);
		text-align: center;
		box-shadow:
			0 0 40px rgba(0, 255, 255, 0.3),
			inset 0 0 40px rgba(0, 255, 255, 0.05);

		--aug-border-all: var(--border-width-thick);
		--aug-border-bg: var(--color-neon-cyan);
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;
	}

	.hero-icon {
		display: inline-flex;
		margin-bottom: var(--space-md);
	}

	.hero-icon svg {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 12px rgba(0, 255, 255, 0.8));
	}

	.hero-section h2 {
		font-family: var(--font-display);
		font-size: clamp(1.75rem, 3vw, 2.5rem);
		font-weight: 900;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-widest);
		margin: 0 0 var(--space-md) 0;
		text-shadow: var(--text-glow-yellow);
	}

	.hero-subtitle {
		font-size: var(--text-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-primary);
		margin: 0;
		max-width: 60ch;
		margin-inline: auto;
	}

	/* Content Cards */
	.content-card {
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

		--aug-border-all: var(--border-width-default);
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		--aug-tl: 12px;
		--aug-tr: 12px;
		--aug-br: 12px;
		--aug-bl: 12px;
	}

	.content-card:hover {
		transform: translateY(-2px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.3),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.08);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.section-header svg {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.6));
		flex-shrink: 0;
	}

	.content-card h3 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0 0 var(--space-lg) 0;
		text-shadow: var(--text-glow-yellow);
	}

	.section-header h3 {
		margin: 0;
	}

	.content-card p {
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-md) 0;
		max-width: 70ch;
	}

	.content-card p:last-child {
		margin-bottom: 0;
	}

	/* Features List */
	.features-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.features-list li {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
		padding: var(--space-md);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(217, 70, 239, 0.05));
		border-left: 3px solid var(--color-neon-cyan);
		transition: all var(--transition-fast);
	}

	.features-list li:hover {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(217, 70, 239, 0.08));
		border-left-color: var(--color-brand-yellow);
		transform: translateX(4px);
	}

	.feature-icon {
		flex-shrink: 0;
	}

	.feature-icon svg {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 6px rgba(0, 255, 255, 0.5));
	}

	.features-list strong {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin-bottom: var(--space-xs);
	}

	.features-list p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	/* Creation Steps */
	.creation-steps {
		list-style: none;
		counter-reset: step-counter;
		padding: 0;
		margin: var(--space-lg) 0;
	}

	.creation-steps li {
		counter-increment: step-counter;
		position: relative;
		padding-left: var(--space-2xl);
		margin-bottom: var(--space-md);
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
	}

	.creation-steps li::before {
		content: counter(step-counter);
		position: absolute;
		left: 0;
		top: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow: var(--text-glow-cyan);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(217, 70, 239, 0.1));
		border: 2px solid var(--color-neon-cyan);
	}

	.info-note {
		margin-top: var(--space-lg);
		padding: var(--space-md);
		background: rgba(0, 255, 255, 0.05);
		border-left: 3px solid var(--color-neon-cyan);
		font-size: var(--text-sm);
	}

	/* Code Styling */
	code {
		font-family: 'Courier New', monospace;
		font-size: var(--text-sm);
		color: var(--color-toxic-green);
		background: var(--color-bg-darker);
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-cyber-magenta);
	}

	/* Links */
	a {
		color: var(--color-neon-cyan);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
		transition: all var(--transition-fast);
		font-weight: 600;
	}

	a:hover {
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		text-decoration-thickness: 2px;
	}

	/* Dimm City Branding Card */
	.dimm-city-card {
		border-color: var(--color-brand-yellow);
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-cyber-magenta));
		box-shadow:
			0 0 25px rgba(255, 215, 0, 0.25),
			inset 0 0 25px rgba(255, 215, 0, 0.05);
	}

	.dimm-city-card:hover {
		box-shadow:
			0 0 35px rgba(255, 215, 0, 0.4),
			0 0 70px rgba(255, 215, 0, 0.2),
			inset 0 0 35px rgba(255, 215, 0, 0.1);
	}

	.dimm-city-branding {
		text-align: center;
	}

	.dimm-city-branding h3 {
		margin-bottom: var(--space-md);
	}

	.dimm-city-branding p {
		max-width: 60ch;
		margin-inline: auto;
		margin-bottom: var(--space-lg);
	}

	.brand-highlight {
		color: var(--color-brand-yellow);
		font-family: var(--font-display);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		text-shadow: var(--text-glow-yellow);
	}

	.dimm-city-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 700;
		color: var(--color-brand-yellow);
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(217, 70, 239, 0.1));
		border: 2px solid var(--color-brand-yellow);
		padding: var(--space-md) var(--space-lg);
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		transition: all var(--transition-fast);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.dimm-city-link:hover {
		color: var(--color-neon-cyan);
		border-color: var(--color-neon-cyan);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(217, 70, 239, 0.15));
		transform: translateY(-2px);
		box-shadow:
			0 0 25px rgba(255, 215, 0, 0.5),
			inset 0 0 15px rgba(0, 255, 255, 0.1);
	}

	.dimm-city-link svg {
		filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
	}

	/* License Card */
	.license-card {
		border-color: var(--color-cyber-magenta);
	}

	@media (max-width: 768px) {
		.content-wrapper {
			padding: var(--space-md);
			gap: var(--space-lg);
		}

		.page-nav {
			padding: var(--space-md);
		}

		.hero-section,
		.content-card {
			padding: var(--space-lg);
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.section-header svg {
			width: 28px;
			height: 28px;
		}

		.features-list li {
			flex-direction: column;
		}
	}

	@media (max-width: 450px) {
		.content-wrapper {
			padding: var(--space-sm);
			gap: var(--space-md);
		}

		.hero-section,
		.content-card {
			padding: var(--space-md);
		}

		.hero-section h2 {
			font-size: var(--text-xl);
		}

		.hero-subtitle,
		.content-card h3 {
			font-size: var(--text-lg);
		}

		.creation-steps li {
			padding-left: var(--space-xl);
		}

		.creation-steps li::before {
			width: 28px;
			height: 28px;
			font-size: var(--text-base);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.back-button:hover,
		.back-button:active,
		.content-card:hover,
		.features-list li:hover,
		.dimm-city-link:hover {
			transform: none !important;
			transition: none !important;
		}

		.back-button:hover svg {
			transform: none !important;
		}
	}
</style>
