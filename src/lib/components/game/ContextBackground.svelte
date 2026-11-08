<script>
	/**
	 * ContextBackground - The readout: the table's one panel of text, what this step is and what
	 * the roll did (OWN-4)
	 *
	 * One framed panel in the board's own language (the HUD's frame and fill, edge to edge with
	 * the HUD), pinned under the HUD, with one job per line and every slot reserved, so moving
	 * from one game state to the next only swaps text:
	 * - the card tab, on the panel's top edge: the card behind a Stability check ("7♠"). With no
	 *   card there is no tab and nothing else moves;
	 * - the title: the phase, in a fixed box of two lines on phones and one from 600px wide (and
	 *   in landscape). Its size is capped by the panel's width (cqi), so it never overflows;
	 * - a hairline;
	 * - the body: the stakes before the roll, the result line after it, in a slot reserved for two
	 *   lines (a longer result extends the panel's bottom edge; nothing above it moves);
	 * - the notice tab, on the panel's bottom edge: what a card modifier just did. It grows
	 *   downward, away from the panel.
	 *
	 * The result line and the notice break only between their clauses (" · "), never inside one,
	 * and nothing in the panel is clipped (OWN-5). The result line's last clause, when it is the
	 * modifier the roll earned ("Lucid", "Surreal"), is its own coloured word. Suit symbols are
	 * drawn with the HUD's pip shapes (SuitText).
	 *
	 * Landscape: the panel takes the table left of the action column (see GameScreen).
	 *
	 * contextText: { title, description, card?, notice? }
	 *
	 * @component
	 */

	import { fade } from 'svelte/transition';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import SuitText from '../card/SuitText.svelte';

	let { contextText = null, resultLine = '' } = $props();

	const MODIFIERS = { Lucid: 'lucid', Surreal: 'surreal' };
	/** The one place a clause line may break: the space after a clause's separator */
	const BREAK = ' ';
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
	/** 120ms state changes, instant under reduced motion */
	const STATE_MS = reduceMotion ? 0 : ANIMATION_DURATION.FAST;

	/** A " · " line as clauses, each kept whole; the separator stays at the end of a line */
	const toClauses = (line) =>
		(line ?? '')
			.split(' · ')
			.filter(Boolean)
			.map((text, index, all) => {
				const last = index === all.length - 1;
				return {
					text: last ? text : `${text} ·`,
					modifier: last && index > 0 ? (MODIFIERS[text] ?? null) : null
				};
			});

	const clauses = $derived(toClauses(resultLine));
	const noticeClauses = $derived(toClauses(contextText?.notice));
</script>

<div class="context-text-background">
	{#if contextText}
		<div class="readout" data-testid="readout" transition:fade={{ duration: STATE_MS }}>
			<span class="readout-frame" data-augmented-ui="tl-clip br-clip border" aria-hidden="true"
			></span>

			{#if contextText.card}
				<p
					class="readout-tab card-tab"
					data-augmented-ui="tl-clip br-clip border"
					data-testid="context-card"
					transition:fade={{ duration: STATE_MS }}
				>
					<SuitText text={contextText.card} />
				</p>
			{/if}

			<!-- One grid cell: the old and new blocks overlap during the swap, with no jump -->
			<div class="context-stack">
				{#key contextText.title}
					<!-- Out first, then in, so two titles are never on screen at once -->
					<div
						class="context-block"
						in:fade={{ duration: STATE_MS, delay: STATE_MS }}
						out:fade={{ duration: STATE_MS }}
					>
						<h2 class="context-title" data-testid="context-title">{contextText.title}</h2>
						<div class="readout-rule" aria-hidden="true"></div>
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
						</div>
					</div>
				{/key}
			</div>

			{#if contextText.notice}
				<p
					class="readout-tab notice-tab"
					data-augmented-ui="tl-clip br-clip border"
					data-testid="context-notice"
					transition:fade={{ duration: STATE_MS }}
				>
					{#each noticeClauses as clause, index (index)}{#if index > 0}{BREAK}{/if}<span
							class="clause"><SuitText text={clause.text} /></span
						>{/each}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* The readout's place: the top of the table, across its width (in landscape, the part left
	   of the action column: GameScreen sets right and the side padding) */
	.context-text-background {
		/* Phones: two title lines, 16px body, edge to edge with the HUD */
		--readout-top: 16px;
		--readout-max: 100%;
		--pad-top: 18px;
		--pad-x: 16px;
		--pad-bottom: 20px;
		--rule-gap: 10px;
		--title-lines: 2;
		--title-size: min(clamp(1.375rem, 6.5vw, 1.75rem), 7.2cqi);
		--body-size: 1rem;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		padding-top: var(--readout-top);
		text-align: center;
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		z-index: 0;
	}

	/* The panel: the HUD's frame (quieter: 1px, 55%) and fill. It is the container for the
	   title's size cap (cqi = 1% of its inner width). */
	.readout {
		position: relative;
		isolation: isolate;
		box-sizing: border-box;
		width: 100%;
		max-width: var(--readout-max);
		padding: var(--pad-top) var(--pad-x) var(--pad-bottom);
		container-type: inline-size;
	}

	.readout-frame {
		--aug-border-all: 1px;
		--aug-border-bg: linear-gradient(135deg, rgba(0, 255, 255, 0.55), rgba(217, 70, 239, 0.55));
		--aug-tl: 8px;
		--aug-br: 8px;
		position: absolute;
		inset: 0;
		z-index: -1;
		display: block;
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.85));
	}

	/* The tabs: small plates on the panel's top and bottom edges, with the frame's corners */
	.readout-tab {
		--aug-border-all: 1px;
		--aug-border-bg: rgba(0, 255, 255, 0.6);
		--aug-tl: 4px;
		--aug-br: 4px;
		position: absolute;
		left: 50%;
		z-index: 1;
		box-sizing: border-box;
		margin: 0;
		background: #08080f;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-weight: 600;
	}

	/* The card behind the check: rank and suit, centred on the top edge (11px above it) */
	.card-tab {
		top: 0;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		height: 22px;
		padding: 0 10px;
		font-size: 0.875rem;
		line-height: 1;
		letter-spacing: 0.02em;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: #fff;
	}

	/* What a card modifier did: centred on the bottom edge, growing downward when it wraps */
	.notice-tab {
		top: 100%;
		transform: translate(-50%, -11px);
		width: max-content;
		max-width: calc(100% - 32px);
		min-height: 22px;
		padding: 2px 10px;
		font-size: 0.875rem;
		line-height: 18px;
		color: var(--color-neon-cyan, #00ffff);
		text-wrap: balance;
	}

	.context-stack {
		display: grid;
	}

	.context-block {
		grid-area: 1 / 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	/* Owner override of the "display face at 28px and up only" rule (styles.css, NV-05): the
	   screen title is the board's one large word and is set in lixdu at every width. A fixed
	   box, the title centred in it; whole words wrap, never mid-word. The cqi cap keeps the
	   longest title inside the panel, with room to spare, at any text size: "STABILITY CHECK" is
	   18.55em wide, so at 5cqi it fills 93% of a one-line slot; the longest word, "INSTABILITY",
	   is 13.02em, 94% of a two-line slot at 7.2cqi. */
	.context-title {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: calc(var(--title-lines) * 1.15em);
		margin: 0;
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

	/* The hairline between the phase and what is at stake */
	.readout-rule {
		width: 80%;
		height: 1px;
		margin: var(--rule-gap) 0;
		background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.35), transparent);
	}

	/* The body: two lines reserved, the text centred in them */
	.context-below {
		display: grid;
		align-content: center;
		justify-items: center;
		width: 100%;
		min-height: calc(2 * 1.5 * var(--body-size));
	}

	/* The stakes: #b8b8c8 on the panel is above 9:1 */
	.context-description {
		max-width: 600px;
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--body-size);
		font-weight: 400;
		line-height: 1.5;
		color: #b8b8c8;
		text-wrap: balance;
	}

	/* What the roll just did: full contrast, stays until the game moves on. Each clause is
	   kept whole, so a line breaks only after a separator. */
	.context-result {
		max-width: 600px;
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-variant-numeric: tabular-nums;
		font-size: var(--body-size);
		font-weight: 600;
		line-height: 1.5;
		color: #fff;
		text-wrap: balance;
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

	/* 600px and up: one title line, the HUD's width (960px at most), 18px body */
	@media (min-width: 600px) {
		.context-text-background {
			--readout-top: 20px;
			--readout-max: 960px;
			--pad-top: 20px;
			--pad-x: 28px;
			--pad-bottom: 22px;
			--rule-gap: 12px;
			--title-lines: 1;
			--title-size: min(clamp(1.75rem, 4.2vw, 2.5rem), 5cqi);
			--body-size: 1.125rem;
		}
	}

	@media (min-width: 1024px) {
		.context-text-background {
			--body-size: 1.25rem;
		}
	}

	/* Landscape phones: one 28px title line (capped by the panel), 16px body, tighter padding */
	@media (max-height: 500px) and (orientation: landscape) {
		.context-text-background {
			--readout-top: 14px;
			--readout-max: 100%;
			--pad-top: 16px;
			--pad-x: 16px;
			--pad-bottom: 18px;
			--rule-gap: 8px;
			--title-lines: 1;
			--title-size: min(1.75rem, 5cqi);
			--body-size: 1rem;
		}
	}
</style>
