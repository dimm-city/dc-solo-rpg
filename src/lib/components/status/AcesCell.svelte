<script>
	/**
	 * AcesCell - Aces n/4 with a pip for each suit, the mirror of Kings
	 *
	 * The pips read ♥ ♠ ♦ ♣ and light as each Ace is drawn. The Ace of Hearts is the gold one:
	 * it unlocks Salvation (the Tokens cell beside it). Every Ace lowers the Salvation roll:
	 * 17+ with one, 14+ with two, 11+ with three, and no target with all four (a Stability check,
	 * then the token comes off). That threshold is in the cell's tooltip and its spoken text. The
	 * count includes an Ace that is on screen but not yet confirmed; a new Ace pops the count and
	 * ignites its pip for one beat.
	 *
	 * @component
	 */
	import { untrack } from 'svelte';
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { acesSummary, aceSuits } from './hudTiers.js';

	// Includes an Ace that is on screen but not yet confirmed
	const aces = $derived(
		acesSummary(gameState.acesRevealed + (gameState.pendingUpdates.aceChange || 0))
	);
	const suits = $derived(
		aceSuits({
			count: aces.count,
			aceOfHeartsRevealed: gameState.aceOfHeartsRevealed,
			log: gameState.log
		})
	);
	const litSuits = $derived(suits.filter((pip) => pip.lit).map((pip) => pip.suit));
	const need = $derived(
		aces.need === 'auto'
			? 'Salvation needs only a Stability check'
			: aces.need
				? `Salvation needs ${aces.need.replace('+', '')} or more`
				: 'no Salvation roll yet'
	);
	const spoken = $derived(
		`Aces ${aces.count} of 4${litSuits.length ? ` (${litSuits.join(', ')})` : ''}, ${need}`
	);
	const tooltip = $derived(
		aces.need === 'auto'
			? 'All four Aces: Salvation needs only a Stability check'
			: aces.need
				? `Salvation needs ${aces.need}`
				: 'Each Ace makes Salvation easier'
	);

	// A new Ace: the count pops and its suit ignites, for one beat
	let gained = $state(false);
	let igniting = $state(null);
	let previous = untrack(() => litSuits);
	let previousCount = untrack(() => aces.count);
	let timer;
	$effect(() => {
		const lit = litSuits;
		const count = aces.count;
		if (count > previousCount) {
			gained = true;
			igniting = lit.find((suit) => !previous.includes(suit)) ?? null;
			clearTimeout(timer);
			timer = setTimeout(() => {
				gained = false;
				igniting = null;
			}, ANIMATION_DURATION.BEAT);
		}
		previous = lit;
		previousCount = count;
	});
	$effect(() => () => clearTimeout(timer));
</script>

<div
	class="hud-cell aces"
	class:active={aces.count > 0}
	class:gained
	data-testid="hud-aces"
	data-need={aces.need ?? ''}
	title={tooltip}
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms"
>
	<span class="hud-label">Aces</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="current">{aces.count}</span><span class="hud-max">/4</span></span
		>
		<span class="hud-icons">
			{#each suits as pip (pip.suit)}
				<svg
					class="pip {pip.suit}"
					class:lit={pip.lit}
					class:igniting={pip.suit === igniting}
					data-suit={pip.suit}
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					{#if pip.suit === 'hearts'}
						<path
							d="M12 20.5S3.5 14.6 3.5 9.1C3.5 6.3 5.6 4.25 8.1 4.25c1.75 0 3.1.95 3.9 2.35.8-1.4 2.15-2.35 3.9-2.35 2.5 0 4.6 2.05 4.6 4.85 0 5.5-8.5 11.4-8.5 11.4z"
						/>
					{:else if pip.suit === 'spades'}
						<path
							d="M12 3c-2.4 3.4-8 6.9-8 11a3.9 3.9 0 0 0 7 2.35L9.8 20.75h4.4L13 16.35A3.9 3.9 0 0 0 20 14c0-4.1-5.6-7.6-8-11z"
						/>
					{:else if pip.suit === 'diamonds'}
						<path d="M12 2.75 19 12l-7 9.25L5 12z" />
					{:else}
						<circle cx="12" cy="7.25" r="4.1" />
						<circle cx="7.1" cy="13.6" r="4.1" />
						<circle cx="16.9" cy="13.6" r="4.1" />
						<path d="M12 10.5 14.4 20.75H9.6z" />
					{/if}
				</svg>
			{/each}
		</span>
	</span>
	<span class="sr-only">{spoken}</span>
</div>

<style>
	.aces {
		--pip-color: var(--color-neon-cyan, #00ffff);
		--pip-glow: rgba(0, 255, 255, 0.85);
		--key-color: var(--color-brand-yellow, #ffd700);
		--key-glow: rgba(255, 215, 0, 0.9);
	}

	.aces .hud-label {
		color: var(--pip-color);
	}

	.active .current {
		color: var(--pip-color);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	.gained .current {
		display: inline-block;
		animation: acePop var(--hud-beat) var(--ease-enter, ease-out);
	}

	/* The same footprint as the Kings' skulls; dim until its Ace is drawn */
	.pip {
		display: block;
		flex: none;
		width: 18px;
		height: 18px;
		color: rgba(255, 255, 255, 0.2);
	}

	/* The Ace of Hearts is the key: gold, even while it is still in the deck */
	.pip.hearts {
		--pip-color: var(--key-color);
		--pip-glow: var(--key-glow);
		color: rgba(255, 215, 0, 0.32);
	}

	.pip.lit {
		color: var(--pip-color);
		filter: drop-shadow(0 0 3px var(--pip-glow));
	}

	/* A newly drawn Ace: one beat of flare */
	.pip.lit.igniting {
		animation: aceIgnite var(--hud-beat) var(--ease-enter, ease-out);
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

	@keyframes aceIgnite {
		0% {
			transform: scale(0.6);
			opacity: 0.3;
		}
		40% {
			transform: scale(1.45);
			opacity: 1;
			filter: brightness(1.8) drop-shadow(0 0 8px var(--pip-glow));
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (max-width: 600px) {
		.pip {
			width: 12px;
			height: 12px;
		}
	}

	@media (max-height: 500px) and (min-width: 601px) {
		.pip {
			width: 15px;
			height: 15px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gained .current,
		.pip.lit.igniting {
			animation: none;
		}
	}
</style>
