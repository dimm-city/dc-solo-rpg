<script>
/**
 * StatsGrid - Grid container for status panels
 *
 * Organizes stat panels in a responsive 3-column grid (desktop) that adapts to
 * 2-column (tablet) and 3-column x 2-row (mobile) layouts.
 *
 * @component
 */

import StabilityPanel from './StabilityPanel.svelte';
import FailureCounterPanel from './FailureCounterPanel.svelte';
import DiceReadout from './DiceReadout.svelte';
import AbilitiesPanel from './AbilitiesPanel.svelte';
import SuccessTokensPanel from './SuccessTokensPanel.svelte';
import DeckVisualization from '../DeckVisualization.svelte';
import { innerWidth } from 'svelte/reactivity/window';

// Reactive screen width tracking
const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

// Reactive data-augmented-ui attribute for deck readout
const deckAugmentedUI = 'tl-clip tr-clip br-clip bl-clip border';
</script>

<div class="stats-grid">
	<!-- Left column: Stability + Failure -->
	<div>
		<StabilityPanel animationDelay={0.15} animationDuration={0.7} />
		<FailureCounterPanel animationDelay={0.25} animationDuration={0.85} />
	</div>

	<!-- Center column: Dice + Deck -->
	<div>
		<DiceReadout animationDelay={0.35} animationDuration={0.75} />
		<div
			class="deck-readout slide-down"
			data-augmented-ui={deckAugmentedUI}
			style="animation-delay: 0.45s; animation-duration: 0.75s"
		>
			<div class="deck-label">
				<svg
					class="deck-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M12 2v20M2 12h20" />
					<rect x="4" y="4" width="16" height="16" rx="2" />
				</svg>
				CARDS LEFT
			</div>
			<DeckVisualization />
		</div>
	</div>

	<!-- Right column: Abilities + Success Tokens -->
	<div>
		<AbilitiesPanel animationDelay={0.55} animationDuration={0.85} />
		<SuccessTokensPanel animationDelay={0.65} animationDuration={0.75} />
	</div>
</div>

<style>
	/* Animation */
	.slide-down {
		animation: slideDown 0.4s linear forwards;
		opacity: 0;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
		width: stretch;
		& > div {
			display: flex;
			flex-direction: row;
		}
		& > div:nth-of-type(2) {
			justify-content: center;
		}
		& > div:last-of-type {
			justify-content: flex-end;
		}
	}

	/* Deck Readout */
	.deck-readout {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 6px;
		--aug-tr: 6px;
		--aug-br: 6px;
		--aug-bl: 6px;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-sm);
		padding: var(--space-sm);
		min-width: 90px;
		min-height: 100px;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.8));
		backdrop-filter: blur(10px) saturate(150%);
		-webkit-backdrop-filter: blur(10px) saturate(150%);

		box-shadow:
			0 0 8px rgba(0, 255, 255, 0.3),
			0 0 16px rgba(217, 70, 239, 0.15),
			inset 0 0 8px rgba(0, 255, 255, 0.08);
	}

	.deck-label {
		font-size: var(--text-xs);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: 'Courier New', monospace;
		color: #00eeff;
		text-shadow:
			0 0 10px rgba(0, 238, 255, 1),
			0 0 20px rgba(0, 238, 255, 0.6);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.deck-icon {
		flex-shrink: 0;
		display: inline-block;
		vertical-align: middle;
		filter: drop-shadow(0 0 4px currentColor);
	}

	/* Tablet - 2 columns */
	@media (max-width: 900px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-sm);
		}

		.deck-readout {
			min-width: 85px;
			min-height: 90px;
		}
	}

	/* Mobile - Simple 2x3 Grid Layout */
	@media (max-width: 600px) {
		.stats-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto auto;
			gap: var(--space-xs);
			width: 100%;
		}

		/* Reset all column positioning to auto-flow */
		.stats-grid > div {
			display: contents;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}
	}
</style>
