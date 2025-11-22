<script>
	/**
	 * ContextBackground - Contextual background text overlay
	 *
	 * Displays screen-specific title and description text in the background
	 * of game screens. Uses fade transitions when switching between screens.
	 *
	 * @component
	 */

	import { fade } from 'svelte/transition';

	let { contextText = null } = $props();
</script>

{#if contextText}
	{#key contextText.title}
		<div class="context-text-background" transition:fade={{ duration: 400 }}>
			<h2 class="context-title">{contextText.title}</h2>
			<p class="context-description">{contextText.description}</p>
		</div>
	{/key}
{/if}

<style>
	/* Background contextual text */
	.context-text-background {
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		z-index: 0;
		max-width: 90%;
	}

	.context-title {
		font-size: clamp(1.75rem, 5vw, 3.5rem);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		line-height: 1.35;
		margin: 0 0 0.75rem 0;
		font-family: 'lixdu', 'Courier New', monospace;
		opacity: 0.3;
		text-shadow: 0 0 10px var(--yellow);
	}

	.context-description {
		font-size: clamp(0.875rem, 1.5vw, 1rem);
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.6;
		margin: 0;
		max-width: 600px;
		margin-inline: auto;
		font-weight: 400;
		letter-spacing: 0;
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
		opacity: 0.5;
	}
</style>
