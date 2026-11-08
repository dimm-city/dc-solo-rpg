<script>
	/**
	 * KingsCell - Kings n/4 with four skulls
	 *
	 * The count includes a King that is on screen but not yet confirmed
	 * (pendingUpdates.kingsChange), so a skull lights as its card is drawn:
	 * - a new King ignites its skull for one beat (400ms);
	 * - a King sent back into the deck (return-king) un-ignites: its skull runs the ignite in
	 *   reverse, one beat, as the count drops, so the player sees the King leave;
	 * - lit skulls pulse, harder and faster with each King (an alert loop);
	 * - the label is red from the first King; at 3 of 4 the tile turns urgent (kingsTier): the
	 *   strongest tint in the HUD and a red, glowing count;
	 * - the fourth King is the ending: after a short hold, all four skulls flare in turn,
	 *   250ms apart, and the whole sequence ends within the 1.5s maximum.
	 *
	 * @component
	 */
	import { untrack } from 'svelte';
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { kingsTier, kingsSpoken } from './hudTiers.js';

	// The fourth King: a hold, then four flares 250ms apart, each one beat long. The hold is
	// whatever the 1.5s maximum leaves (350ms), so the card is seen before the skulls answer.
	const FINALE_STAGGER = 250;
	const FINALE_DELAY =
		ANIMATION_DURATION.SEQUENCE_MAX - 3 * FINALE_STAGGER - ANIMATION_DURATION.BEAT;

	const count = $derived(
		Math.max(0, Math.min(4, gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange || 0)))
	);
	const label = $derived(gameState.config?.labels?.failureCounters ?? 'Kings');
	const tier = $derived(kingsTier(count));

	// Index of the skull that just lit (one-off ignite), the skulls that just went dark
	// (dimFrom up to dimTo), and the fourth-King finale
	let igniting = $state(-1);
	let dimFrom = $state(-1);
	let dimTo = $state(-1);
	let finale = $state(false);
	let previous = untrack(() => count);
	let timer;
	$effect(() => {
		const current = count;
		if (current === previous) return;
		const rising = current > previous;
		igniting = rising ? current - 1 : -1;
		finale = rising && current === 4;
		// A King went back into the deck (return-king): its skull dims back, one beat
		dimFrom = rising ? -1 : current;
		dimTo = rising ? -1 : previous;
		clearTimeout(timer);
		timer = setTimeout(
			() => {
				igniting = -1;
				dimFrom = dimTo = -1;
				finale = false;
			},
			finale ? ANIMATION_DURATION.SEQUENCE_MAX : ANIMATION_DURATION.BEAT
		);
		previous = current;
	});
	$effect(() => () => clearTimeout(timer));
</script>

<div
	class="hud-cell kings"
	class:urgent={tier === 'urgent'}
	class:finale
	data-level={count}
	data-tier={tier}
	data-testid="hud-kings"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms; --finale-delay: {FINALE_DELAY}ms; --finale-stagger: {FINALE_STAGGER}ms"
>
	<span class="tint" aria-hidden="true"></span>
	<span class="hud-label" aria-hidden="true">{label}</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="led-field"
				><span class="led-off" aria-hidden="true">8</span><span class="led-on current">{count}</span
				></span
			><span class="hud-slash" aria-hidden="true">/</span><span class="hud-max">4</span></span
		>
		<span class="hud-foot skulls hud-icons">
			{#each [0, 1, 2, 3] as i (i)}
				<img
					class="skull"
					class:lit={i < count}
					class:igniting={i === igniting}
					class:dimming={i >= dimFrom && i < dimTo}
					style="--i: {i}"
					src="/skull-color-64.png"
					alt=""
				/>
			{/each}
		</span>
	</span>
	<span class="sr-only">{kingsSpoken(count, label)}</span>
</div>

<style>
	/* calm: no tint, a white count; the label turns red with the first King (VT-1-15) */
	.kings {
		--pulse-scale: 1;
		--pulse-time: 0s;
		--tint-color: #ff4d6d;
		--tint-alpha: 0;
		--value-color: #f2f4f8;
	}
	.kings:not([data-level='0']) {
		--label-color: #ff4d6d;
	}

	/* Lit skulls pulse harder and faster as Kings fall */
	.kings[data-level='1'] {
		--pulse-scale: 1.04;
		--pulse-time: 3s;
	}
	.kings[data-level='2'] {
		--pulse-scale: 1.08;
		--pulse-time: 2.2s;
	}
	.kings[data-level='3'] {
		--pulse-scale: 1.12;
		--pulse-time: 1.4s;
	}
	.kings[data-level='4'] {
		--pulse-scale: 1.16;
		--pulse-time: 0.9s;
	}

	/* urgent (3-4): the strongest tint in the HUD (.16, through the shared tint layer) and a
	   red count with the HUD's one strong glow: the loudest thing on the row */
	.urgent {
		--tint-alpha: 0.16;
		--value-color: #ff4d6d;
		--value-glow: 0 0 10px rgba(255, 77, 109, 0.8);
	}

	.skull {
		display: block;
		opacity: 0.22;
		filter: grayscale(1);
	}

	.skull.lit {
		opacity: 1;
		filter: drop-shadow(0 0 4px rgba(255, 77, 109, 0.9));
		animation: kingPulse var(--pulse-time) ease-in-out infinite;
	}

	/* Newly lit skull: one beat of flare, then it joins the pulse */
	.skull.lit.igniting {
		animation:
			kingIgnite var(--hud-beat) var(--ease-enter, ease-out),
			kingPulse var(--pulse-time) ease-in-out var(--hud-beat) infinite;
	}

	/* A King back in the deck: the ignite in reverse, from lit through the flare to dark */
	.skull.dimming {
		animation: kingIgnite var(--hud-beat) var(--ease-enter, ease-out) reverse;
	}

	/* The fourth King: after the hold, each skull flares in turn, then they all pulse */
	.finale .skull.lit,
	.finale .skull.lit.igniting {
		animation:
			kingIgnite var(--hud-beat) var(--ease-enter, ease-out)
				calc(var(--finale-delay) + var(--i) * var(--finale-stagger)) backwards,
			kingPulse var(--pulse-time) ease-in-out
				calc(var(--finale-delay) + 3 * var(--finale-stagger) + var(--hud-beat)) infinite;
	}

	@keyframes kingPulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(var(--pulse-scale));
		}
	}

	@keyframes kingIgnite {
		0% {
			transform: scale(0.6);
			opacity: 0.25;
			filter: grayscale(1) brightness(2);
		}
		40% {
			transform: scale(1.45);
			opacity: 1;
			filter: grayscale(0) brightness(2.2) drop-shadow(0 0 10px rgba(255, 77, 109, 1));
		}
		100% {
			transform: scale(1);
			opacity: 1;
			filter: drop-shadow(0 0 4px rgba(255, 77, 109, 0.9));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skull.lit,
		.skull.lit.igniting,
		.skull.dimming,
		.finale .skull.lit,
		.finale .skull.lit.igniting {
			animation: none;
		}
	}
</style>
