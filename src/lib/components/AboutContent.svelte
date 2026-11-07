<script>
	/**
	 * AboutContent - the About text, shown in the About modal and on /about.
	 *
	 * @prop {2|3} [level=3] Heading level of the section titles (3 inside a modal, 2 on a page)
	 * @prop {string} [appVersion]
	 */
	let { level = 3, appVersion = '0.2.0' } = $props();

	const uid = $props.id();
	const headingTag = `h${level}`;
</script>

<div class="about-content">
	<p class="about-lead">
		Dream Console is a solo journaling game for the quiet hours. You draw cards, roll a d20, and
		write what happens.
	</p>

	<section class="about-section" aria-labelledby="about-play-{uid}">
		<svelte:element this={headingTag} class="about-title" id="about-play-{uid}">
			How it plays
		</svelte:element>
		<p>
			It is built on the Wretched and Alone system. A standard 52-card deck sets the pace and a d20
			decides the risk, while every prompt invites you to write your own story through the neon
			streets of Dimm City.
		</p>
	</section>

	<section class="about-section" aria-labelledby="about-credits-{uid}">
		<svelte:element this={headingTag} class="about-title" id="about-credits-{uid}">
			Credits
		</svelte:element>
		<p>Dream Console is made by Dimm City.</p>
		<p class="about-credit">
			This work is based on
			<a href="https://loottheroom.itch.io/wretched" target="_blank" rel="noopener noreferrer"
				>The Wretched</a
			>, product of Chris Bissette and Loot The Room, and licensed under
			<a
				href="https://creativecommons.org/licenses/by/3.0/"
				target="_blank"
				rel="noopener noreferrer">CC Attribution 3.0 Unported</a
			>.
		</p>
	</section>

	<p class="version-info">Version {appVersion}</p>
</div>

<style>
	.about-content {
		max-width: 65ch;
	}

	.about-content p {
		margin: 0;
		color: #e2e9f2;
	}

	.about-content p + p {
		margin-top: 12px;
	}

	.about-lead {
		font-size: 1.1875rem;
		color: #d5dfeb;
		margin-bottom: 8px;
	}

	.about-section {
		margin-top: 32px;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	/* Inter: these titles are 18px (the display face is for 28px and up) */
	.about-title {
		margin: 0 0 12px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: 0.02em;
		text-transform: none;
		text-shadow: none;
		color: var(--color-neon-cyan, #00ffff);
	}

	.about-content a {
		color: var(--color-neon-cyan, #00ffff);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.about-content a:focus-visible {
		outline: 2px solid var(--color-neon-cyan, #00ffff);
		outline-offset: 2px;
	}

	.about-content .version-info {
		margin-top: 40px;
		padding-top: 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.875rem;
		color: #aebbcc;
	}
</style>
