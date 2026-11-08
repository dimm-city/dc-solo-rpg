<script>
	/**
	 * ContextBackground - The table's text column: what this step is, and what the roll did
	 *
	 * Four slots, always present, so nothing moves from one game state to the next (design
	 * polish DP-1-04):
	 * - the eyebrow: the card behind a Stability check ("7♠ · Caught in a toxic gas leak"), one
	 *   line, its slot kept (empty) on steps without a card;
	 * - the title: a fixed box of two lines on phones and one from 600px wide (and in landscape),
	 *   its last line on a fixed baseline;
	 * - a 12px gap;
	 * - the body: the description before the roll, the result line after it, then the notice
	 *   of what a card modifier just did. Its height is reserved for two result lines and a
	 *   notice, so the column is the same height in every state.
	 *
	 * The result line breaks only between its clauses (" · "), never inside one, and its last
	 * clause, when it is the modifier the roll earned ("Lucid", "Surreal"), is its own coloured
	 * word. Suit symbols are drawn with the HUD's pip shapes (SuitText).
	 *
	 * Portrait: the column's bottom sits on the 40% line of the table; the dice land below 44%
	 * (see the dice container in src/routes/+layout.svelte), so a die never comes to rest on the
	 * text. Landscape: the column starts at the top of the table, left of the action column.
	 *
	 * contextText: { title, description, eyebrow?, notice? }
	 *
	 * @component
	 */

	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import SuitText from '../card/SuitText.svelte';

	let { contextText = null, resultLine = '' } = $props();

	const MODIFIERS = { Lucid: 'lucid', Surreal: 'surreal' };
	/** The one place a result line may break: the space after a clause's separator */
	const BREAK = ' ';

	/** The result line as clauses, each kept whole; the separator stays at the end of a line */
	const clauses = $derived(
		(resultLine ?? '')
			.split(' · ')
			.filter(Boolean)
			.map((text, index, all) => {
				const last = index === all.length - 1;
				return {
					text: last ? text : `${text} ·`,
					modifier: last && index > 0 ? (MODIFIERS[text] ?? null) : null
				};
			})
	);
</script>

<div class="context-text-background">
	<div class="context-column">
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
							<p class="context-eyebrow" data-testid="context-card" title={contextText.eyebrow}>
								<SuitText text={contextText.eyebrow} />
							</p>
						{:else}
							<p class="context-eyebrow empty" aria-hidden="true">&nbsp;</p>
						{/if}
						<h2 class="context-title" data-testid="context-title">{contextText.title}</h2>
						<div class="context-below">
							{#if resultLine}
								<p class="context-result" data-testid="result-line">
									{#each clauses as clause, index (index)}{#if index > 0}{BREAK}{/if}<span
											class="clause {clause.modifier ?? ''}"
											class:modifier={clause.modifier}>{clause.text}</span
										>{/each}
								</p>
							{:else}
								<p class="context-description" data-testid="context-description">
									{contextText.description}
								</p>
							{/if}
							{#if contextText.notice}
								<p class="context-notice" data-testid="context-notice">
									<SuitText text={contextText.notice} />
								</p>
							{/if}
						</div>
					</div>
				{/key}
			</div>
		{/if}
	</div>
</div>

<style>
	/* The space above the 40% line of the table (from 8px below its top) */
	.context-text-background {
		/* Two lines of title on phones, one from 600px wide (and in landscape) */
		--title-lines: 2;
		--title-size: clamp(1.375rem, 6.5vw, 1.75rem);
		/* The result line: 16px on phones and in landscape, 18px on tablets, 20px from 1024px */
		--result-size: 1rem;
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

	/* Eyebrow, title and body in one column of constant height, sitting on the 40% line */
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
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	/* The card behind this check: "7♠ · Caught in a toxic gas leak", always one line */
	.context-eyebrow {
		box-sizing: border-box;
		max-width: min(100%, 600px);
		margin: 0 0 8px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 21px;
		letter-spacing: 0.02em;
		color: #d9d9e6;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}

	.context-eyebrow.empty {
		visibility: hidden;
	}

	/* Owner override of the "display face at 28px and up only" rule (styles.css, NV-05): the
	   screen title is the board's one large word and is set in lixdu at every width, phones and
	   landscape included. The title is a fixed box: its last line sits on one baseline whatever
	   the title, so a one-line and a two-line title end in the same place. Whole words wrap,
	   never mid-word. */
	.context-title {
		box-sizing: border-box;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		width: 100%;
		height: calc(var(--title-lines) * 1.15em);
		margin: 0 0 12px;
		font-family: var(--font-display, 'lixdu', 'Courier New', monospace);
		font-size: var(--title-size);
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-align: center;
		color: #19c3c6;
		text-shadow: 0 0 12px rgba(0, 255, 255, 0.35);
		overflow-wrap: normal;
		word-break: normal;
		hyphens: none;
		text-wrap: balance;
	}

	/* The body: room for two result lines and a notice line, so the column never changes height */
	.context-below {
		display: grid;
		align-content: start;
		justify-items: center;
		width: 100%;
		min-height: calc(3 * var(--result-size) + 29px);
	}

	/* #b3b3b3 on the dark table is above 4.5:1 */
	.context-description {
		max-width: 600px;
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.5;
		letter-spacing: 0;
		color: #b3b3b3;
		text-wrap: pretty;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
	}

	/* What the roll just did: full contrast, stays until the game moves on. Each clause is
	   kept whole, so a line breaks only after a separator. */
	.context-result {
		max-width: 600px;
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-variant-numeric: tabular-nums;
		font-size: var(--result-size);
		font-weight: 600;
		line-height: 1.5;
		color: #fff;
		text-wrap: balance;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}

	.clause {
		white-space: nowrap;
	}

	/* The modifier the roll earned, in its HUD colour (the rule is on the hint line) */
	.clause.lucid {
		color: #00ffaa;
	}
	.clause.surreal {
		color: #f07cff;
	}

	/* What a card modifier just did */
	.context-notice {
		max-width: 600px;
		margin: 8px 0 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 21px;
		color: var(--color-neon-cyan, #00ffff);
		text-wrap: pretty;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
	}

	@media (min-width: 600px) {
		.context-text-background {
			--title-lines: 1;
			--title-size: clamp(1.75rem, 4.8vw, 3rem);
			--result-size: 1.125rem;
		}
	}

	@media (min-width: 1024px) {
		.context-text-background {
			--result-size: 1.25rem;
		}
	}

	/* Landscape phones: one title line at 28px, 16px results, and the column hangs from the top
	   of the table (left of the action column, see GameScreen) */
	@media (max-height: 500px) and (orientation: landscape) {
		.context-text-background {
			--title-lines: 1;
			--title-size: 1.75rem;
			--result-size: 1rem;
			bottom: auto;
		}

		.context-column {
			margin-top: 0;
		}
	}
</style>
