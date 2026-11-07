<script>
	/**
	 * AcesCell - Aces n/4 and what Salvation needs: "Aces 2/4 · need 14+"
	 *
	 * Every Ace lowers the Salvation roll: 17+ with one, 14+ with two, 11+ with three, and no
	 * target with all four ("auto": a Stability check, then the token comes off). The value pops
	 * for one beat when an Ace arrives.
	 *
	 * @component
	 */
	import { untrack } from 'svelte';
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { acesSummary } from './hudTiers.js';

	// Includes an Ace that is on screen but not yet confirmed
	const aces = $derived(
		acesSummary(gameState.acesRevealed + (gameState.pendingUpdates.aceChange || 0))
	);
	const needText = $derived(aces.need === 'auto' ? 'auto' : aces.need ? `need ${aces.need}` : null);
	const spoken = $derived(
		aces.need === 'auto'
			? 'Salvation needs only a Stability check'
			: aces.need
				? `Salvation needs ${aces.need.replace('+', '')} or more`
				: 'no Salvation roll yet'
	);

	let gained = $state(false);
	let previous = untrack(() => aces.count);
	let timer;
	$effect(() => {
		const current = aces.count;
		if (current > previous) {
			gained = true;
			clearTimeout(timer);
			timer = setTimeout(() => (gained = false), ANIMATION_DURATION.BEAT);
		}
		previous = current;
	});
	$effect(() => () => clearTimeout(timer));
</script>

<div
	class="hud-cell aces"
	class:active={aces.count > 0}
	class:gained
	data-testid="hud-aces"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms"
>
	<span class="hud-label">Aces</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="current">{aces.count}</span><span class="hud-max">/4</span></span
		>
		{#if needText}
			<span class="hud-meta need" data-testid="aces-need">{needText}</span>
		{/if}
	</span>
	<span class="sr-only">Aces {aces.count} of 4, {spoken}</span>
</div>

<style>
	.aces .hud-label {
		color: var(--color-neon-cyan, #00ffff);
	}

	.active .current {
		color: var(--color-neon-cyan, #00ffff);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	.aces .need {
		color: var(--color-neon-cyan, #00ffff);
	}

	.gained .current {
		display: inline-block;
		animation: acePop var(--hud-beat) var(--ease-enter, ease-out);
	}

	@keyframes acePop {
		0% {
			transform: scale(0.6);
			opacity: 0.3;
		}
		50% {
			transform: scale(1.3);
			opacity: 1;
		}
		100% {
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gained .current {
			animation: none;
		}
	}
</style>
