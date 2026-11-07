<script>
	/**
	 * CardsCell - Cards left in the deck, over a meter of the 52-card Oracle
	 *
	 * The same number-and-bar reading as Stability: the bar is the cards left out of a full
	 * deck, so it drains as the game goes on.
	 *
	 * @component
	 */
	import { DECK_SIZE } from './hudTiers.js';

	/** @type {{ count: number }} */
	let { count = 0 } = $props();

	const fraction = $derived(Math.max(0, Math.min(1, count / DECK_SIZE)));
</script>

<div class="hud-cell cards" data-testid="hud-cards">
	<span class="hud-label">Cards</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value current">{count}</span>
		<span class="bar"><span class="fill" style="transform: scaleX({fraction})"></span></span>
	</span>
	<span class="sr-only">{count} of {DECK_SIZE} cards left</span>
</div>

<style>
	.cards {
		--bar-color: rgba(226, 233, 242, 0.85);
		--bar-glow: rgba(226, 233, 242, 0.35);
	}
</style>
