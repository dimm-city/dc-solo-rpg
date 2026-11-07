<script>
	/**
	 * ContextBackground - Contextual background text overlay
	 *
	 * Displays screen-specific title and description text in the upper part of the table.
	 * Uses fade transitions when switching between screens.
	 *
	 * Once a roll resolves, `resultLine` replaces the description at full contrast
	 * and stays until the game moves on.
	 *
	 * contextText: { title, description, eyebrow?, notice? }
	 * - eyebrow: a small line above the title, e.g. the card that caused a Stability check
	 * - notice: what a card modifier just did ("King of Hearts returns to the deck · 1 of 4")
	 * children: the rule caption, which sits above the block, in the same column
	 *
	 * The column's bottom edge sits at 40% of the table and the text grows upwards from it; the
	 * dice land below 44% (see the dice container in src/routes/+layout.svelte), so a die
	 * never comes to rest on the result line. NV-02: the caption is part of the column, so it
	 * pushes the block instead of covering it; and when the column is taller than the space
	 * above the 40% line, it starts at the top of the table and runs down instead of up.
	 *
	 * @component
	 */

	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	let { contextText = null, resultLine = '', children = undefined } = $props();
</script>

<div class="context-text-background">
	<div class="context-column">
		{@render children?.()}
		{#if contextText}
			<!-- One grid cell: the old and new blocks overlap during the swap, with no jump -->
			<div class="context-stack">
				{#key contextText.title}
					<!-- Out first, then in, so two titles are never on screen at once -->
					<div
						class="context-block"
						in:fade={{ duration: ANIMATION_DURATION.FAST, delay: ANIMATION_DURATION.FAST }}
						out:fade={{ duration: ANIMATION_DURATION.FAST }}
					>
						{#if contextText.eyebrow}
							<p class="context-eyebrow" data-testid="context-card">{contextText.eyebrow}</p>
						{/if}
						<h2 class="context-title" data-testid="context-title">{contextText.title}</h2>
						{#if resultLine}
							<p class="context-result" data-testid="result-line">{resultLine}</p>
						{:else}
							<p class="context-description">{contextText.description}</p>
						{/if}
						{#if contextText.notice}
							<p class="context-notice" data-testid="context-notice">{contextText.notice}</p>
						{/if}
					</div>
				{/key}
			</div>
		{/if}
	</div>
</div>

<style>
	/* The space above the 40% line of the table (from 8px below its top) */
	.context-text-background {
		position: absolute;
		top: var(--space-sm, 8px);
		bottom: 60%;
		/* Centered with auto margins rather than left:50%, which would cap the
		   shrink-to-fit width at half the container and clip long titles on phones */
		left: 0;
		right: 0;
		margin-inline: auto;
		width: min(92%, 60rem);
		display: flex;
		flex-direction: column;
		text-align: center;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		z-index: 0;
	}

	/* Caption, card line, title and result in one column, sitting on the 40% line. The auto
	   margin pushes it down while it fits and becomes 0 when it does not, so a tall column starts
	   at the top and runs down instead of rising out of the table. */
	.context-column {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.context-stack {
		display: grid;
		width: 100%;
	}

	.context-block {
		grid-area: 1 / 1;
	}

	/* The card behind this check: "7♠ · Caught in a toxic gas leak" */
	.context-eyebrow {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: #d9d9e6;
		margin: 0 0 0.5rem 0;
		max-width: 600px;
		margin-inline: auto;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}

	/* The display face is for 28px and up only (styles.css); below that, phones get the UI face
	   (NV-05). Whole words wrap, never mid-word. */
	.context-title {
		font-size: clamp(1.75rem, 6.5vw, 3.5rem);
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		line-height: 1.2;
		margin: 0 0 0.75rem 0;
		font-family: var(--font-display, 'lixdu', 'Courier New', monospace);
		overflow-wrap: normal;
		word-break: normal;
		hyphens: none;
		text-wrap: balance;
		opacity: 0.6;
		text-shadow: 0 0 10px var(--yellow);
	}

	/* Under 431px wide, 6.5vw is under 28px: Inter, uppercase. (The display face at 28px does
	   not fit "INSTABILITY" in a 360px phone's 328px column.) */
	@media (max-width: 430px) {
		.context-title {
			font-family: var(--font-ui, var(--font-body, 'Inter', sans-serif));
			font-size: clamp(1.25rem, 6.5vw, 1.75rem);
			letter-spacing: var(--tracking-ui, 0.08em);
		}
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

	/* What the roll just did: full contrast, stays until the game moves on */
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
		text-wrap: balance;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}

	/* What a card modifier just did */
	.context-notice {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: clamp(0.875rem, 1.8vw, 1rem);
		font-weight: 600;
		color: var(--color-neon-cyan, #00ffff);
		line-height: 1.5;
		margin: 0.5rem auto 0;
		max-width: 600px;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}
</style>
