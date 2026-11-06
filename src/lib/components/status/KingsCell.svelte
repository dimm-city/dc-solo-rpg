<script>
	/**
	 * KingsCell - Kings n/4 with four skulls
	 *
	 * The count includes a King that is on screen but not yet confirmed
	 * (pendingUpdates.kingsChange), so a skull lights as its card is drawn:
	 * - a new King ignites its skull for one beat (400ms);
	 * - lit skulls pulse, harder and faster with each King (an alert loop);
	 * - at 3 of 4 the cell turns urgent;
	 * - the fourth King is the ending: after a short hold, all four skulls flare in turn,
	 *   250ms apart, and the whole sequence ends within the 1.5s maximum.
	 *
	 * @component
	 */
	import { untrack } from 'svelte';
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	// The fourth King: a hold, then four flares 250ms apart, each one beat long. The hold is
	// whatever the 1.5s maximum leaves (350ms), so the card is seen before the skulls answer.
	const FINALE_STAGGER = 250;
	const FINALE_DELAY =
		ANIMATION_DURATION.SEQUENCE_MAX - 3 * FINALE_STAGGER - ANIMATION_DURATION.BEAT;

	const count = $derived(
		Math.max(0, Math.min(4, gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange || 0)))
	);
	const label = $derived(gameState.config?.labels?.failureCounters ?? 'Kings');

	// Index of the skull that just lit (one-off ignite), and the fourth-King finale
	let igniting = $state(-1);
	let finale = $state(false);
	let previous = untrack(() => count);
	let timer;
	$effect(() => {
		const current = count;
		if (current > previous) {
			igniting = current - 1;
			finale = current === 4;
			clearTimeout(timer);
			timer = setTimeout(
				() => {
					igniting = -1;
					finale = false;
				},
				finale ? ANIMATION_DURATION.SEQUENCE_MAX : ANIMATION_DURATION.BEAT
			);
		} else if (current < previous) {
			// A King went back into the deck (return-king): no flare for a skull going dark
			igniting = -1;
			finale = false;
		}
		previous = current;
	});
	$effect(() => () => clearTimeout(timer));
</script>

<div
	class="hud-cell kings"
	class:urgent={count >= 3}
	class:finale
	data-level={count}
	data-testid="hud-kings"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms; --finale-delay: {FINALE_DELAY}ms; --finale-stagger: {FINALE_STAGGER}ms"
>
	<span class="hud-label">{label}</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="current">{count}</span><span class="hud-max">/4</span></span
		>
		<span class="skulls">
			{#each [0, 1, 2, 3] as i (i)}
				<img
					class="skull"
					class:lit={i < count}
					class:igniting={i === igniting}
					style="--i: {i}"
					src="/skull-color-64.png"
					alt=""
				/>
			{/each}
		</span>
	</span>
	<span class="sr-only">{label}: {count} of 4 revealed</span>
</div>

<style>
	.kings {
		--pulse-scale: 1;
		--pulse-time: 0s;
	}

	.kings .hud-label {
		color: var(--color-danger, #ff4d6d);
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

	/* 3 of 4: danger colour, the count is the loudest thing in the HUD */
	.urgent {
		background: linear-gradient(180deg, rgba(255, 77, 109, 0.16), rgba(255, 77, 109, 0.04));
	}
	.urgent .current {
		color: var(--color-danger, #ff4d6d);
		text-shadow: 0 0 10px rgba(255, 77, 109, 0.8);
	}

	.skulls {
		display: flex;
		gap: 3px;
	}

	.skull {
		display: block;
		width: 18px;
		height: 18px;
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

	@media (max-width: 600px) {
		.skulls {
			gap: 2px;
		}
		.skull {
			width: 12px;
			height: 12px;
		}
	}

	@media (max-height: 500px) and (min-width: 601px) {
		.skull {
			width: 15px;
			height: 15px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skull.lit,
		.skull.lit.igniting,
		.finale .skull.lit,
		.finale .skull.lit.igniting {
			animation: none;
		}
	}
</style>
