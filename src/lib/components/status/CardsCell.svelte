<script>
	/**
	 * CardsCell - Cards left in the deck, over a meter of the 52-card Oracle
	 *
	 * The same number-and-bar reading as Stability: the bar is the cards left out of a full
	 * deck, so it drains as the game goes on. Tiers (cardsTier, DP-1-02): the deck running out
	 * is pressure, never danger, so it warms from neutral (13 and up) to yellow (7-12) to
	 * orange (6 or fewer), and is never red.
	 *
	 * @component
	 */
	import { DECK_SIZE, cardsTier, cardsSpoken } from './hudTiers.js';

	/** @type {{ count: number }} */
	let { count = 0 } = $props();

	const fraction = $derived(Math.max(0, Math.min(1, count / DECK_SIZE)));
	const tier = $derived(cardsTier(count));
</script>

<div class="hud-cell cards tier-{tier}" data-tier={tier} data-testid="hud-cards">
	<span class="tint" aria-hidden="true"></span>
	<span class="hud-label" aria-hidden="true">Cards</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="led-field"
				><span class="led-off" aria-hidden="true">88</span><span class="led-on current"
					>{count}</span
				></span
			></span
		>
		<span class="hud-foot bar"
			><span class="fill" style="transform: scaleX({fraction})"></span></span
		>
	</span>
	<span class="sr-only">{cardsSpoken(count)}</span>
</div>

<style>
	/* The tier ladder (DP-1-02): tint colour at its top alpha, value colour, label colour */
	.cards {
		--tint-color: #ffd700;
		--tint-alpha: 0;
		--value-color: #e2e9f2;
		--bar-color: rgba(226, 233, 242, 0.85);
		--bar-glow: rgba(226, 233, 242, 0.35);
	}
	.tier-low {
		--tint-color: #ffd700;
		--tint-alpha: 0.05;
		--value-color: #ffe08a;
		--label-color: #ffd700;
		--bar-color: #ffd700;
		--bar-glow: rgba(255, 215, 0, 0.4);
	}
	.tier-out {
		--tint-color: #ff8a3d;
		--tint-alpha: 0.09;
		--value-color: #ff8a3d;
		--label-color: #ff8a3d;
		--bar-color: #ff8a3d;
		--bar-glow: rgba(255, 138, 61, 0.45);
	}
</style>
