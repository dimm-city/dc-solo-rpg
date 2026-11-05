<script>
	/**
	 * ContextBackground - Contextual background text overlay
	 *
	 * Displays screen-specific title and description text in the background
	 * of game screens. Uses fade transitions when switching between screens.
	 *
	 * Once a roll resolves, `resultLine` replaces the description at full contrast
	 * and stays until the player continues.
	 *
	 * @component
	 */

	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	let { contextText = null, resultLine = '' } = $props();
</script>

{#if contextText}
	{#key contextText.title}
		<!-- Out first, then in, so two titles are never on screen at once -->
		<div
			class="context-text-background"
			in:fade={{ duration: ANIMATION_DURATION.FAST, delay: ANIMATION_DURATION.FAST }}
			out:fade={{ duration: ANIMATION_DURATION.FAST }}
		>
			<h2 class="context-title">{contextText.title}</h2>
			{#if resultLine}
				<p class="context-result" data-testid="result-line">{resultLine}</p>
			{:else}
				<p class="context-description">{contextText.description}</p>
			{/if}
		</div>
	{/key}
{/if}

<style>
	/* Background contextual text */
	.context-text-background {
		position: absolute;
		top: 45%;
		/* Centered with auto margins rather than left:50%, which would cap the
		   shrink-to-fit width at half the container and clip long titles on phones */
		left: 0;
		right: 0;
		margin-inline: auto;
		width: min(92%, 60rem);
		transform: translateY(-50%);
		text-align: center;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		z-index: 0;
	}

	/* Display font is for titles of 24px and up only */
	.context-title {
		font-size: clamp(1.5rem, 5vw, 3.5rem);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		line-height: 1.25;
		margin: 0 0 0.75rem 0;
		font-family: var(--font-display, 'lixdu', 'Courier New', monospace);
		overflow-wrap: break-word;
		opacity: 0.6;
		text-shadow: 0 0 10px var(--yellow);
	}

	/* #b3b3b3 on the dark table is above 4.5:1 */
	.context-description {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: clamp(0.875rem, 1.5vw, 1rem);
		color: #b3b3b3;
		line-height: 1.6;
		margin: 0;
		max-width: 600px;
		margin-inline: auto;
		font-weight: 400;
		letter-spacing: 0;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
	}

	/* What the roll just did: full contrast, stays until the player continues */
	.context-result {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-variant-numeric: tabular-nums;
		font-size: clamp(1rem, 2.4vw, 1.25rem);
		font-weight: 600;
		color: #fff;
		line-height: 1.5;
		margin: 0;
		max-width: 600px;
		margin-inline: auto;
		overflow-wrap: break-word;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}
</style>
