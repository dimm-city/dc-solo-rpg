<script>
	/**
	 * GameTimeline - the whole run beside the final log: one block per round, in order, each
	 * a short list of the round's important events (see utils/gameTimeline.js). A quiet round
	 * says so. The list scrolls inside its pane; the sheet never scrolls.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { buildTimeline } from '../../utils/gameTimeline.js';
	import SuitText from '../card/SuitText.svelte';
	import { clauseRuns, rowClauses } from './timelineClauses.js';

	const blocks = $derived(buildTimeline(gameState));
</script>

<ol class="timeline" data-testid="game-timeline">
	{#each blocks as block (block.round)}
		<li class="tl-round" data-round={block.round}>
			<h4 class="tl-title">{block.title}</h4>
			{#if block.events.length > 0}
				<ul class="tl-events">
					{#each block.events as event, i (i)}
						{@const parts = rowClauses(event.text)}
						<li class="tl-event" data-kind={event.kind}>
							<span class="tl-clause"
								><span class="tl-label"><SuitText text={event.label} /></span
								>{#if parts.length}&nbsp;<span class="tl-sep">·</span>{/if}</span
							>{parts.length ? ' ' : ''}{#each parts as part, p (p)}{@const run =
									clauseRuns(part)}<span class="tl-clause" class:breaks={run.lead}
									>{#if run.lead}<SuitText text={run.lead} />{/if}<span class="tl-hold"
										>{#each run.held as piece, k (k)}{#if k > 0}&nbsp;<span class="tl-sep">·</span
												>&nbsp;{/if}<SuitText
												text={piece}
											/>{/each}{#if p < parts.length - 1}&nbsp;<span class="tl-sep">·</span
											>{/if}</span
									></span
								>{p < parts.length - 1 ? ' ' : ''}{/each}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="tl-quiet">Nothing of note</p>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.875rem;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.88);
	}

	/* Each round hangs off one rail */
	.tl-round {
		position: relative;
		margin: 0;
		padding: 0 0 var(--space-sm) var(--space-md);
		border-left: 2px solid rgba(255, 255, 255, 0.14);
	}

	.tl-round + .tl-round {
		padding-top: var(--space-sm);
	}

	.tl-round::before {
		content: '';
		position: absolute;
		left: -5px;
		top: 0.45em;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.4);
	}

	.tl-round + .tl-round::before {
		top: calc(var(--space-sm) + 0.45em);
	}

	.tl-title {
		margin: 0 0 var(--space-xs);
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-shadow: none;
		color: rgba(255, 255, 255, 0.72);
	}

	.tl-events {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* A short line each: the card (or roll) in the mono face, then what it did */
	.tl-event {
		margin: 0;
		padding: 0.125rem 0 0.125rem 0.75rem;
		text-indent: -0.75rem;
		font-variant-numeric: tabular-nums;
	}

	.tl-label {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 1rem;
		color: var(--event-accent, rgba(255, 255, 255, 0.72));
	}

	/* One clause, kept whole: the separator ends its line, never starts the next */
	.tl-clause,
	.tl-hold {
		white-space: nowrap;
	}

	/* A long clause holding a total breaks at its own spaces, so the card label never sits alone
	   on its line; its last word stays with the total ("deck · Kings 0 of 4"): game-copy-s-12 */
	.tl-clause.breaks {
		white-space: normal;
	}

	.tl-sep {
		color: rgba(255, 255, 255, 0.5);
	}

	/* The ending may be an author's own sentence: let it wrap like prose */
	.tl-event[data-kind='end'] .tl-clause,
	.tl-event[data-kind='end'] .tl-hold {
		white-space: normal;
	}

	.tl-event[data-kind='king'] {
		--event-accent: var(--color-danger, #ff4d6d);
	}
	.tl-event[data-kind='ace'] {
		--event-accent: var(--color-brand-yellow, #ffe400);
	}
	.tl-event[data-kind='check'] {
		--event-accent: #ff8800;
	}
	.tl-event[data-kind='salvation'] {
		--event-accent: var(--color-neon-cyan, #0ff);
	}
	/* No lone word on the ending's last line ("…was / revealed."): VT-1-14 */
	.tl-event[data-kind='end'] {
		--event-accent: var(--color-danger, #ff4d6d);
		padding-top: var(--space-xs);
		text-wrap: pretty;
	}
	.tl-event[data-kind='end'] .tl-label {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	/* A won run ends in the escape's colour */
	:global(.journal-sheet.won) .tl-event[data-kind='end'] {
		--event-accent: #00ff64;
	}

	.tl-quiet {
		margin: 0;
		padding: 0.125rem 0;
		font-style: italic;
		color: rgba(255, 255, 255, 0.5);
	}
</style>
