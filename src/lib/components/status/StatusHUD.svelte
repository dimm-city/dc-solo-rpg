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
	 * Publishes --hud-bottom on :root (the row's bottom edge plus 8px) for anything that must
	 * clear the HUD (the reduced-motion roll in +layout.svelte).
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

	// Publish where the HUD ends (see +layout.svelte)
	let hud = $state();
	$effect(() => {
		if (!hud || typeof ResizeObserver === 'undefined') return;
		let last = -1;
		const publish = () => {
			const bottom = Math.round(hud.getBoundingClientRect().bottom) + 8;
			// Only act on a real change
			if (bottom === last) return;
			last = bottom;
			document.documentElement.style.setProperty('--hud-bottom', `${bottom}px`);
		};
		const observer = new ResizeObserver(publish);
		observer.observe(hud);
		window.addEventListener('resize', publish);
		publish();
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', publish);
			document.documentElement.style.removeProperty('--hud-bottom');
		};
	});
</script>

<div
	class="status-hud"
	bind:this={hud}
	data-augmented-ui="tl-clip br-clip border"
	data-testid="hud"
	role="group"
	aria-label="Game status"
>
	<StabilityCell />
	<KingsCell />
	<RollCell />
	<CardsCell count={gameState.deck?.length || 0} />
	<AcesCell />
	<TokensCell />
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

		display: grid;
		/* Mirrored: the meters outside, the icon counts next, the dice and the deck in the
		   middle. No column is narrower than its content. */
		grid-template-columns:
			minmax(min-content, 1.3fr) minmax(min-content, 1.25fr) minmax(min-content, 1fr)
			minmax(min-content, 1fr) minmax(min-content, 1.25fr) minmax(min-content, 1.3fr);
		align-items: stretch;
		width: 100%;
		max-width: 960px;
		height: var(--hud-height);
		margin-inline: auto;
		padding: 0 0.5rem;
		box-sizing: border-box;
		/* Near-opaque instead of a backdrop blur, which would repaint with every frame behind it */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.85));
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
		color: #fff;
	}

	/* ============================================
	   SHARED CELL ANATOMY (used by every cell component)
	   label on top, then the readout: the value and its meta (a bar, four icons, a badge).
	   Written as plain two-class rules so each cell can colour its own label and value
	   with a more specific selector.
	   ============================================ */

	:global(.status-hud .hud-cell) {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		min-width: 0;
		padding: 0 0.375rem;
		overflow: hidden;
	}

	/* Hairline between cells */
	:global(.status-hud .hud-cell + .hud-cell::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 14%;
		bottom: 14%;
		width: 1px;
		background: rgba(255, 255, 255, 0.14);
	}

	/* Labels: the UI face at 12px (Inter 600, uppercase, 0.08em) */
	:global(.status-hud .hud-label) {
		display: flex;
		align-items: center;
		gap: 3px;
		max-width: 100%;
		overflow: hidden;
		white-space: nowrap;
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: 0.75rem;
		font-weight: var(--font-ui-weight, 600);
		line-height: 1.15;
		letter-spacing: var(--tracking-ui, 0.08em);
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	/* Every readout is as tall as the roll's digits, so all six labels share one line */
	:global(.status-hud .hud-readout) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 0;
		max-width: 100%;
		min-height: 1.75rem;
	}

	:global(.status-hud .hud-value) {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 1.5rem;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: #fff;
	}

	:global(.status-hud .hud-max) {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
	}

	/* The meter beside (or, on phones, under) a number: Stability, Cards and Tokens share it.
	   A fixed track; only the fill's transform changes. Each cell sets --bar-color/--bar-glow. */
	:global(.status-hud .bar) {
		position: relative;
		flex: none;
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
			background-color var(--dur-overlay, 300ms) var(--ease-enter, ease-out);
	}

	/* Four icons after a count: the Kings' skulls and the Aces' suits */
	:global(.status-hud .hud-icons) {
		display: flex;
		gap: 3px;
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
	   PHONES (portrait): the same row, each readout stacked under its label
	   ============================================ */

	@media (max-width: 600px) {
		.status-hud {
			--aug-tl: 8px;
			--aug-br: 8px;
			grid-template-columns:
				minmax(min-content, 1.3fr) minmax(min-content, 1.15fr) minmax(min-content, 1fr)
				minmax(min-content, 0.9fr) minmax(min-content, 1.15fr) minmax(min-content, 1.15fr);
			padding: 0 0.125rem;
		}

		/* Three rows (label, value, meta) on one grid: every label sits on the same line */
		:global(.status-hud .hud-cell) {
			justify-content: flex-start;
			gap: 2px;
			padding: 7px 0.125rem 0;
		}

		:global(.status-hud .hud-label) {
			font-size: 0.6875rem; /* 11px: six labels share 360px */
			letter-spacing: 0.03em;
		}

		:global(.status-hud .hud-readout) {
			flex-direction: column;
			gap: 4px;
			min-height: 0;
		}

		:global(.status-hud .hud-value) {
			font-size: 1.25rem;
		}

		:global(.status-hud .hud-max) {
			font-size: 0.75rem;
		}

		:global(.status-hud .bar) {
			width: 40px;
			height: 3px;
		}

		:global(.status-hud .hud-icons) {
			gap: 2px;
		}
	}

	/* ============================================
	   LANDSCAPE PHONES: a short row, readouts side by side again
	   ============================================ */

	@media (max-height: 500px) and (min-width: 601px) {
		.status-hud {
			--hud-height: 52px;
		}

		:global(.status-hud .hud-cell) {
			gap: 2px;
		}

		:global(.status-hud .hud-label) {
			font-size: 0.6875rem;
		}

		:global(.status-hud .hud-readout) {
			min-height: 1.375rem;
		}

		:global(.status-hud .hud-value) {
			font-size: 1.25rem;
		}

		:global(.status-hud .bar) {
			width: 44px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.status-hud .fill) {
			transition: none;
		}
	}
</style>
