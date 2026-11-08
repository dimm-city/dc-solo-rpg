<script>
	/**
	 * StatusHUD - The game status in one row, at every width, mirrored around the middle:
	 *
	 *   Stability n/20 + bar | Kings n/4 + skulls | Roll | Cards + bar | Aces n/4 + suits | Tokens n/N + bar
	 *
	 * The outer pair are meters (a number over its bar), the next pair count four icons, and
	 * the dice and the deck sit in the middle. One centred row, at most 960px wide and 64px
	 * tall (52px on landscape phones). Each cell owns its feedback: the Stability tiers and
	 * damage flash, the King ignite and its escalating pulse, an Ace lighting its suit, the
	 * Salvation unlock. The row stays mounted for the whole game, under the card and journal
	 * overlays too, so no cell misses the change it reacts to.
	 *
	 * Every number is on the seven-segment face (DP-1-01): the lit digits over faint unlit
	 * "8"s, a mono slash and the max, all on one baseline. Every tile has tiers (DP-1-02, see
	 * hudTiers.js): as its value moves into a new one, a tint layer behind the tile and the
	 * value, label and bar colours ease to the tier's colours. Tiers change colour only.
	 *
	 * The text fits the row at any browser text size (visual-layout-s-01): the labels, values
	 * and maxes are rem sizes capped by the HUD's own width (cqi; the HUD is a size container),
	 * so at a larger root font no track's minimum outgrows its share of the half and the Roll
	 * and Cards tiles never run into each other. The caps sit just above the sizes the default
	 * root gives on phones (360-600px), so at 16px nothing changes.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import StabilityCell from './StabilityCell.svelte';
	import KingsCell from './KingsCell.svelte';
	import RollCell from './RollCell.svelte';
	import CardsCell from './CardsCell.svelte';
	import AcesCell from './AcesCell.svelte';
	import TokensCell from './TokensCell.svelte';
</script>

<div
	class="status-hud"
	data-augmented-ui="tl-clip br-clip border"
	data-testid="hud"
	role="group"
	aria-label="Game status"
>
	<!-- Two halves, so the Roll|Cards hairline is always the row's centre, whatever each
	     label needs (a custom Kings or Tokens label included) -->
	<div class="hud-half">
		<StabilityCell />
		<KingsCell />
		<RollCell />
	</div>
	<div class="hud-half">
		<CardsCell count={gameState.deck?.length || 0} />
		<AcesCell />
		<TokensCell />
	</div>
</div>

<style>
	/* ============================================
	   THE ROW
	   ============================================ */

	.status-hud {
		--aug-border-all: 2px;
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
		);
		--aug-tl: 10px;
		--aug-br: 10px;
		--hud-height: 64px;
		/* The three rows of every cell: the foot (bars, skulls, pips, modifiers) is a fixed
		   height, and the value row takes what the label and the foot leave, so the labels,
		   the values and the bottom line each sit on one line across the row */
		--hud-foot: 16px;
		--hud-pad-top: 3px;
		--hud-pad-bottom: 3px;
		/* The value sits this far above the foot row, which leaves at least as much again
		   between the label and the value (VT-1-10: 4px, 2px in landscape) */
		--value-gap: 4px;
		/* The row's side padding lives in the outer cells, so their tints run frame to frame */
		--hud-row-pad: 0.5rem;
		/* The mirrored tracks of each half: outer, icon count, middle */
		--hud-tracks: minmax(min-content, 1.3fr) minmax(min-content, 1.25fr) minmax(min-content, 1fr);
		--hud-tracks-mirror: minmax(min-content, 1fr) minmax(min-content, 1.25fr)
			minmax(min-content, 1.3fr);
		/* The numbers (DP-1-01): one size family across the six tiles */
		--value-size: 1.25rem;
		--max-size: 0.75rem;
		--label-size: 0.75rem;
		/* visual-layout-s-01: each size capped by the row's width. At the default root the caps
		   bind nowhere (18px values, 11px maxes and 12px labels in a 340-355px phone row: 5.3,
		   3.25 and 3.4cqi are just above them); at a 125% root they hold the row to its width */
		--value-fit: min(var(--value-size), 5.3cqi);
		--max-fit: min(var(--max-size), 3.25cqi);
		--label-fit: min(var(--label-size), 3.4cqi);
		container-type: inline-size;
		/* The neutral tier colours, inherited, so any cell's own tier rule wins */
		--label-color: rgba(255, 255, 255, 0.72);
		--value-color: #f2f4f8;

		/* Two equal halves around the centre; inside each, the tracks mirror the other half's:
		   the meters outside, the icon counts next, the dice and the deck in the middle. No
		   column is narrower than its content. */
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: stretch;
		width: 100%;
		max-width: 960px;
		height: var(--hud-height);
		margin-inline: auto;
		/* Only the frame's own width: the cells (and their tints) start at its inner edge */
		padding: 0 var(--aug-border-all);
		box-sizing: border-box;
		/* Near-opaque instead of a backdrop blur, which would repaint with every frame behind it */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.85));
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
		color: #fff;
	}

	/* ============================================
	   SHARED CELL ANATOMY (used by every cell component)
	   One grid per cell: the label row, then the readout, itself the value row over the
	   foot row. The foot row is a fixed height and its content (a bar, four icons, the two
	   modifiers) is pinned to its end, so a cell with a shorter value never pulls its bar up.
	   Each cell sets its tier's colours as custom properties (--tint-color, --tint-alpha,
	   --value-color, --label-color, --bar-color); the rules here read them.
	   ============================================ */

	.hud-half {
		display: grid;
		grid-template-columns: var(--hud-tracks);
		grid-template-rows: 100%;
		min-width: 0;
	}

	/* The right half is the mirror image of the left: middle, icon count, outer */
	.hud-half + .hud-half {
		grid-template-columns: var(--hud-tracks-mirror);
	}

	:global(.status-hud .hud-cell) {
		--cell-pad: 0.375rem;
		position: relative;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		justify-items: center;
		min-width: 0;
		padding: var(--hud-pad-top) var(--cell-pad) var(--hud-pad-bottom);
		overflow: hidden;
	}

	/* The outer cells carry the row's side padding (inside their tints), on both sides so
	   their labels stay centred, and clear of the frame and the hairline */
	:global(.status-hud .hud-half:first-child > .hud-cell:first-child),
	:global(.status-hud .hud-half:last-child > .hud-cell:last-child) {
		padding-inline: calc(var(--cell-pad) + var(--hud-row-pad));
	}

	/* The tier tint: one layer per cell, its first child. The Kings look: the tier's alpha at
	   the top, down to a quarter of it at the bottom. Colour and opacity ease between tiers. */
	:global(.status-hud .tint) {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background-color: var(--tint-color, transparent);
		opacity: var(--tint-alpha, 0);
		-webkit-mask-image: linear-gradient(180deg, #000, rgba(0, 0, 0, 0.25));
		mask-image: linear-gradient(180deg, #000, rgba(0, 0, 0, 0.25));
		transition:
			background-color var(--dur-overlay, 300ms) var(--ease-enter, ease-out),
			opacity var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	/* Hairline between cells, over the tints (the centre one opens the right half) */
	:global(.status-hud .hud-cell + .hud-cell::before),
	:global(.status-hud .hud-half + .hud-half > .hud-cell:first-child::before) {
		content: '';
		position: absolute;
		z-index: 2;
		left: 0;
		top: 14%;
		bottom: 14%;
		width: 1px;
		background: rgba(255, 255, 255, 0.14);
	}

	/* Labels: the UI face at 12px (Inter 600, uppercase, 0.08em), one line box. Never
	   clipped: a label's width is its column's minimum. */
	:global(.status-hud .hud-label) {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		white-space: nowrap;
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: var(--label-fit);
		font-weight: var(--font-ui-weight, 600);
		line-height: 1;
		letter-spacing: var(--tracking-ui, 0.08em);
		text-transform: uppercase;
		color: var(--label-color);
		transition: color var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	/* The readout fills the cell under the label: the value row, then the foot row */
	:global(.status-hud .hud-readout) {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-rows: minmax(0, 1fr) var(--hud-foot);
		grid-template-columns: minmax(0, 1fr);
		justify-items: center;
		align-items: center;
		align-self: stretch;
		width: 100%;
		min-width: 0;
	}

	/* The value row: the number sits a fixed gap above the foot row, so every tile's value is
	   on one baseline and the gaps to the label and the foot are the same in every tile */
	:global(.status-hud .hud-readout > .hud-value) {
		align-self: end;
		margin-bottom: var(--value-gap);
	}

	/* ============================================
	   THE NUMBERS (DP-1-01): the seven-segment face in every tile. The lit digits sit over
	   faint unlit "8"s (a fixed digit field, so a value never shifts as it changes), then a
	   mono slash and the max, on one baseline.
	   ============================================ */

	:global(.status-hud .hud-value) {
		display: inline-flex;
		align-items: baseline;
		font-size: var(--value-fit);
		line-height: 1;
		white-space: nowrap;
	}

	:global(.status-hud .led-field) {
		position: relative;
		display: inline-block;
		font-family: var(--font-led);
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
	}

	:global(.status-hud .led-off) {
		color: var(--value-color);
		opacity: 0.1;
		transition: color var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	:global(.status-hud .led-on) {
		position: absolute;
		inset: 0;
		text-align: right;
		color: var(--value-color);
		text-shadow: var(--value-glow, 0 0 6px color-mix(in srgb, var(--value-color) 45%, transparent));
		transition:
			color var(--dur-overlay, 300ms) var(--ease-enter, ease-out),
			text-shadow var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	:global(.status-hud .hud-max) {
		font-family: var(--font-led);
		font-weight: 700;
		font-size: var(--max-fit);
		line-height: 1;
		color: var(--max-color, rgba(255, 255, 255, 0.6));
		transition: color var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	/* A seven-segment "1" lights only its right-hand segments: a max that starts with one
	   ("/10") closes up to its slash instead of leaving an unlit gap after it */
	:global(.status-hud .hud-max.lead-one) {
		margin-inline-start: var(--led-lead-one);
	}

	/* A declared mono slash, a little larger than the max; it never enlarges the line box */
	:global(.status-hud .hud-slash) {
		font-family: var(--font-mono);
		font-size: calc(var(--max-fit) * 1.25);
		line-height: 0;
		margin-inline: 1px;
		color: var(--max-color, rgba(255, 255, 255, 0.6));
		transition: color var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	/* The foot sits on the row's bottom line, whatever its own height */
	:global(.status-hud .hud-foot) {
		align-self: end;
	}

	/* The meter under a number: Stability, Cards and Tokens share it. A fixed track; only
	   the fill's transform and colour change. Each cell sets --bar-color/--bar-glow. */
	:global(.status-hud .bar) {
		position: relative;
		width: 56px;
		height: 4px;
		overflow: hidden;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.14);
	}

	:global(.status-hud .fill) {
		position: absolute;
		inset: 0;
		transform-origin: left center;
		background: var(--bar-color, rgba(255, 255, 255, 0.8));
		box-shadow: 0 0 6px var(--bar-glow, transparent);
		transition:
			transform var(--dur-overlay, 300ms) var(--ease-enter, ease-out),
			background-color var(--dur-overlay, 300ms) var(--ease-enter, ease-out),
			box-shadow var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	/* Four icons under a count: the Kings' skulls and the Aces' suits. On the narrowest
	   phones the four shrink a little to fit their tile rather than spill out of it. */
	:global(.status-hud .hud-icons) {
		display: flex;
		align-items: center;
		gap: 3px;
		max-width: 100%;
	}
	:global(.status-hud .hud-icons > *) {
		flex: 0 1 var(--hud-foot);
		min-width: 0;
		width: var(--hud-foot);
		height: auto;
		aspect-ratio: 1;
	}

	:global(.status-hud .sr-only) {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* ============================================
	   PHONES (portrait): the same three rows, smaller
	   ============================================ */

	@media (max-width: 600px) {
		.status-hud {
			--aug-tl: 8px;
			--aug-br: 8px;
			--hud-foot: 12px;
			--hud-pad-top: 4px;
			--hud-pad-bottom: 6px;
			--value-gap: 5px;
			--hud-row-pad: 0.125rem;
			--value-size: 1.125rem;
			--max-size: 0.6875rem;
			/* Truly mirrored: the same weights either side of the Roll|Cards hairline */
			--hud-tracks: minmax(min-content, 1.2fr) minmax(min-content, 1fr) minmax(min-content, 1fr);
			--hud-tracks-mirror: minmax(min-content, 1fr) minmax(min-content, 1fr)
				minmax(min-content, 1.2fr);
		}

		:global(.status-hud .hud-cell) {
			--cell-pad: 0.125rem;
		}

		:global(.status-hud .hud-label) {
			letter-spacing: 0.06em;
		}

		:global(.status-hud .bar) {
			width: 40px;
			height: 3px;
		}

		:global(.status-hud .hud-icons) {
			gap: 2px;
		}
	}

	/* Six labels share 360px: 11px with tighter tracking below 375px only (VT-1-10) */
	@media (max-width: 374px) {
		.status-hud {
			--label-size: 0.6875rem;
		}

		:global(.status-hud .hud-label) {
			letter-spacing: 0.03em;
		}
	}

	/* ============================================
	   LANDSCAPE PHONES: a short row, the same three rows packed tighter
	   ============================================ */

	@media (max-height: 500px) and (min-width: 601px) {
		.status-hud {
			--hud-height: 52px;
			--hud-foot: 14px;
			--hud-pad-top: 1.5px;
			--hud-pad-bottom: 3px;
			--value-gap: 2px;
			--value-size: 1rem;
			--max-size: 0.625rem;
		}

		:global(.status-hud .bar) {
			width: 44px;
			height: 3px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.status-hud .fill),
		:global(.status-hud .tint),
		:global(.status-hud .hud-label),
		:global(.status-hud .led-off),
		:global(.status-hud .led-on),
		:global(.status-hud .hud-max),
		:global(.status-hud .hud-slash) {
			transition: none;
		}
	}
</style>
