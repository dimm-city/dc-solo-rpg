<script>
	/**
	 * StatusHUD - The game status in one row, at every width
	 *
	 *   Stability n/20 | Kings n/4 | Aces n/4 · need 14+ | Tokens | Cards | Roll
	 *
	 * One centred row, at most 960px wide and 64px tall (52px on landscape phones). Each
	 * cell owns its feedback: the Stability tiers and damage flash, the King ignite and its
	 * escalating pulse, the Salvation unlock. The row stays mounted for the whole game,
	 * under the card and journal overlays too, so no cell misses the change it reacts to.
	 *
	 * Publishes --hud-bottom on :root (the row's bottom edge plus 8px) so the dice throw
	 * area, and anything else that must clear the HUD, can start below it.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { resizeDiceBox } from '../../stores/diceStore.svelte.js';
	import StabilityCell from './StabilityCell.svelte';
	import KingsCell from './KingsCell.svelte';
	import AcesCell from './AcesCell.svelte';
	import TokensCell from './TokensCell.svelte';
	import RollCell from './RollCell.svelte';

	const cardsLeft = $derived(gameState.deck?.length || 0);

	// Publish where the HUD ends so the dice throw area starts below it (see +layout.svelte)
	let hud = $state();
	$effect(() => {
		if (!hud || typeof ResizeObserver === 'undefined') return;
		let last = -1;
		const publish = () => {
			const bottom = Math.round(hud.getBoundingClientRect().bottom) + 8;
			// resizeDiceBox() fires a window resize, so only act on a real change
			if (bottom === last) return;
			last = bottom;
			document.documentElement.style.setProperty('--hud-bottom', `${bottom}px`);
			resizeDiceBox();
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
	<AcesCell />
	<TokensCell />
	<div class="hud-cell cards" data-testid="hud-cards">
		<span class="hud-label">Cards</span>
		<span class="hud-readout" aria-hidden="true">
			<span class="hud-value">{cardsLeft}</span>
			<span class="hud-meta">left</span>
		</span>
		<span class="sr-only">{cardsLeft} cards left</span>
	</div>
	<RollCell />
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
		grid-template-columns: 1.35fr 1.3fr 1.15fr 1.1fr 0.9fr 1fr;
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
	   label on top, then the readout: the value and its meta (bar, skulls, need, badge).
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
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: 0.75rem;
		font-weight: var(--font-ui-weight, 600);
		line-height: 1.15;
		letter-spacing: var(--tracking-ui, 0.08em);
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
	}

	/* Every readout is one value line tall, so a lock or a badge never shifts its label */
	:global(.status-hud .hud-readout) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 0;
		max-width: 100%;
		min-height: 1.5rem;
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

	:global(.status-hud .hud-meta) {
		font-family: var(--font-ui, var(--font-body, sans-serif));
		font-size: 0.75rem;
		font-weight: var(--font-ui-weight, 600);
		line-height: 1.15;
		letter-spacing: 0.04em;
		white-space: nowrap;
		color: rgba(255, 255, 255, 0.72);
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
			grid-template-columns: 1.45fr 1.25fr 1fr 1fr 0.85fr 1fr;
			padding: 0 0.125rem;
		}

		:global(.status-hud .hud-cell) {
			gap: 2px;
			padding: 0 0.125rem;
		}

		:global(.status-hud .hud-label) {
			font-size: 0.6875rem; /* 11px: six labels share 360px */
			letter-spacing: 0.04em;
		}

		:global(.status-hud .hud-readout) {
			flex-direction: column;
			gap: 3px;
			min-height: 0;
		}

		:global(.status-hud .hud-value) {
			font-size: 1.25rem;
		}

		:global(.status-hud .hud-max) {
			font-size: 0.75rem;
		}

		:global(.status-hud .hud-meta) {
			font-size: 0.6875rem;
			letter-spacing: 0.02em;
		}

		/* "left" under the card count says nothing a phone has room for */
		.cards .hud-meta {
			display: none;
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
			min-height: 1.25rem;
		}

		:global(.status-hud .hud-value) {
			font-size: 1.25rem;
		}
	}
</style>
