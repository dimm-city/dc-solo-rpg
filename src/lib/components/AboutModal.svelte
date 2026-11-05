<script>
	/**
	 * AboutModal - About information for the application
	 * Uses ContentModal as base
	 */
	import ContentModal from './ContentModal.svelte';

	let { isOpen = false, onClose, appVersion = '0.2.0' } = $props();
</script>

<ContentModal {isOpen} title="About" {onClose}>
	<div class="about-content">
		<p class="about-lead">
			Dream Console is a solo journaling game for the quiet hours. You draw cards, roll a d20, and
			write what happens.
		</p>

		<section class="cm-section" aria-labelledby="about-play">
			<h3 class="cm-section-title" id="about-play">How it plays</h3>
			<p>
				It is built on the Wretched and Alone system. A standard 52-card deck sets the pace and a
				d20 decides the risk, while every prompt invites you to write your own story through the
				neon streets of Dimm City.
			</p>
		</section>

		<section class="cm-section" aria-labelledby="about-credits">
			<h3 class="cm-section-title" id="about-credits">Credits</h3>
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
</ContentModal>

<style>
	.about-content {
		max-width: 65ch;
	}

	.about-content p {
		margin: 0;
		color: #e2e9f2;
	}

	.about-lead + :global(.cm-section) {
		margin-top: 32px;
		padding-top: 32px;
		border-top: 1px solid rgba(255, 255, 255, 0.14);
	}

	.about-content .cm-section-title {
		margin-bottom: 12px;
	}

	.about-lead {
		font-size: 1.1875rem;
		color: #d5dfeb;
		margin-bottom: 8px;
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
