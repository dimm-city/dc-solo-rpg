<script>
	/**
	 * RollCell - The last d20 result on a two-digit seven-segment display, with the two roll
	 * modifiers under it
	 *
	 * The digits are the HUD's shared LED field (DP-1-01, StatusHUD): DSEG7 Classic over a
	 * faint "88", so a 4 sits in the ones place like a real display. "--" before the first
	 * roll, and while a roll is in flight (the 3D dice or the reduced-motion static roll), until
	 * the result lands. Under the number, on the HUD's bottom line, sit two icons that are
	 * always there: an up arrow for Lucid (the next roll keeps the higher of two dice) and a
	 * down arrow for Surreal (keeps the lower). Off, an icon is dim and colourless; on, it is
	 * lit in its colour and ignites for one beat (400ms), like a King's skull.
	 *
	 * Tiers (rollTier, DP-1-02): idle and plain read yellow with no tint; a pending Lucid or
	 * Surreal tints the tile and colours the digits, ghosts and label. While the dice are in
	 * flight the tier holds, and is worked out again when the result lands.
	 *
	 * @component
	 */
	import { untrack } from 'svelte';
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { diceState } from '../../stores/diceStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { describeTwoDiceRoll, rollModifiers, rollTier, rollSpoken } from './hudTiers.js';

	const hasRolled = $derived(gameState.diceRoll > 0);
	const inFlight = $derived(diceState.isRolling || !!diceState.staticRoll);
	const detail = $derived(describeTwoDiceRoll(diceState.lastRoll, gameState.diceRoll));
	const mods = $derived(rollModifiers(gameState));

	// The tier as the state stands, and the tier the tile shows: held while a roll is in flight
	// (the roll uses its modifier up as it starts), worked out again when the result lands
	const liveTier = $derived(
		rollTier({ hasRolled, isLucid: gameState.isLucid, isSurreal: gameState.isSurreal })
	);
	let heldTier = $state(untrack(() => liveTier));
	$effect(() => {
		const current = liveTier;
		if (!inFlight) heldTier = current;
	});
	const tier = $derived(inFlight ? heldTier : liveTier);
	const showDigits = $derived(hasRolled && !inFlight);
	const spoken = $derived(
		rollSpoken({ inFlight, value: gameState.diceRoll, last: diceState.lastRoll })
	);

	// Filled arrows: up for Lucid (keep the higher), down for Surreal (keep the lower)
	const ARROW = {
		lucid: 'M12 3.25 19.75 11h-4.9v9.75h-5.7V11H4.25z',
		surreal: 'M12 20.75 4.25 13h4.9V3.25h5.7V13h4.9z'
	};

	// The modifier that just came on ignites for one beat; one that is used up only dims
	let igniting = $state(null);
	let wasLucid = gameState.isLucid;
	let wasSurreal = gameState.isSurreal;
	let timer;
	$effect(() => {
		const lucid = gameState.isLucid;
		const surreal = gameState.isSurreal;
		const lit = lucid && !wasLucid ? 'lucid' : surreal && !wasSurreal ? 'surreal' : null;
		wasLucid = lucid;
		wasSurreal = surreal;
		if (!lit) return;
		igniting = lit;
		clearTimeout(timer);
		timer = setTimeout(() => (igniting = null), ANIMATION_DURATION.BEAT);
	});
	$effect(() => () => clearTimeout(timer));
</script>

<div
	class="hud-cell roll tier-{tier}"
	class:idle={!showDigits}
	data-tier={tier}
	data-testid="hud-roll"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms"
>
	<span class="tint" aria-hidden="true"></span>
	<span class="hud-label" aria-hidden="true">Roll</span>
	<span class="hud-readout">
		<span
			class="hud-value led"
			aria-hidden="true"
			title={detail && showDigits ? `Two dice: ${detail}` : undefined}
			><span class="led-field"
				><span class="led-off" aria-hidden="true">88</span><span class="led-on current"
					>{showDigits ? gameState.diceRoll : '--'}</span
				></span
			></span
		>
		<span class="hud-foot mods">
			{#each mods as mod (mod.kind)}
				<span
					class="mod {mod.kind}"
					class:on={mod.on}
					class:igniting={mod.on && igniting === mod.kind}
					role="img"
					aria-label={mod.label}
					title={mod.label}
					data-testid="roll-{mod.kind}"
				>
					<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d={ARROW[mod.kind]} />
					</svg>
				</span>
			{/each}
		</span>
	</span>
	<span class="sr-only">{spoken}</span>
</div>

<style>
	/* The tier ladder (DP-1-02): idle and plain are yellow on no tint; a pending modifier tints
	   the tile and colours the digits, the ghosts and the label */
	.roll {
		--tint-color: #00ffaa;
		--tint-alpha: 0;
		--value-color: var(--color-brand-yellow, #ffd700);
		--mod-size: 16px;
		--mod-gap: 8px;
	}
	.tier-lucid {
		--tint-color: #00ffaa;
		--tint-alpha: 0.1;
		--value-color: #00ffaa;
		--label-color: #00ffaa;
	}
	.tier-surreal {
		--tint-color: #f07cff;
		--tint-alpha: 0.1;
		--value-color: #f07cff;
		--label-color: #f07cff;
	}

	/* "--" before the first roll and while one is in flight: lit, but quieter */
	.idle .led-on {
		opacity: 0.6;
	}

	/* The two modifiers, side by side on the bottom line */
	.mods {
		display: flex;
		gap: var(--mod-gap);
	}

	.mod {
		display: block;
		width: var(--mod-size);
		height: var(--mod-size);
		/* Off: dim and colourless */
		color: #fff;
		opacity: 0.3;
		cursor: help;
		transition:
			opacity var(--dur-state, 120ms) var(--ease-enter, ease-out),
			color var(--dur-state, 120ms) var(--ease-enter, ease-out);
	}
	.mod svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	.mod.lucid {
		--mod-color: #00ffaa;
		--mod-glow: rgba(0, 255, 170, 0.85);
	}
	.mod.surreal {
		--mod-color: #f07cff;
		--mod-glow: rgba(240, 124, 255, 0.85);
	}

	/* On: lit in its colour */
	.mod.on {
		color: var(--mod-color);
		opacity: 1;
		filter: drop-shadow(0 0 3px var(--mod-glow));
	}

	/* Just turned on: one beat of flare, like a King's skull */
	.mod.on.igniting {
		animation: modIgnite var(--hud-beat) var(--ease-enter, ease-out);
	}

	@keyframes modIgnite {
		0% {
			transform: scale(0.6);
			opacity: 0.3;
		}
		40% {
			transform: scale(1.45);
			opacity: 1;
			filter: brightness(1.8) drop-shadow(0 0 8px var(--mod-glow));
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (max-width: 600px) {
		.roll {
			--mod-size: 12px;
			--mod-gap: 6px;
		}
	}

	@media (max-height: 500px) and (min-width: 601px) {
		.roll {
			--mod-size: 14px;
			--mod-gap: 6px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mod.on.igniting {
			animation: none;
		}
	}
</style>
