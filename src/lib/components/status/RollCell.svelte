<script>
	/**
	 * RollCell - The last d20 result on a two-digit seven-segment display, with the two roll
	 * modifiers under it
	 *
	 * The digits are DSEG7 Classic (--font-led) over a faint "88", the unlit segments, so a 4
	 * sits in the ones place like a real display. "--" before the first roll. Under the
	 * number, on the HUD's bottom line, sit two icons that are always there: an up arrow for
	 * Lucid (the next roll keeps the higher of two dice) and a down arrow for Surreal (keeps
	 * the lower). Off, an icon is dim and colourless; on, it is lit in its colour and ignites
	 * for one beat (400ms), like a King's skull. Each has an accessible name that carries its
	 * state and the rule, and the same text as a tooltip. Lucid/Surreal applies to the next
	 * d20 roll, whichever roll that is. When the last roll was 2d20, the display's tooltip and
	 * the spoken text say which die counted.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { diceState } from '../../stores/diceStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { describeTwoDiceRoll, rollModifiers } from './hudTiers.js';

	const hasRolled = $derived(gameState.diceRoll > 0);
	const detail = $derived(describeTwoDiceRoll(diceState.lastRoll, gameState.diceRoll));
	const mods = $derived(rollModifiers(gameState));

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
	class="hud-cell roll"
	class:idle={!hasRolled}
	data-testid="hud-roll"
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms"
>
	<span class="hud-label">Roll</span>
	<span class="hud-readout">
		<span class="led" aria-hidden="true" title={detail ? `Two dice: ${detail}` : undefined}>
			<span class="led-off">88</span>
			<span class="hud-value led-on">{hasRolled ? gameState.diceRoll : '--'}</span>
		</span>
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
	<span class="sr-only"
		>{hasRolled
			? `Last roll ${gameState.diceRoll}${detail ? ` (${detail})` : ''}`
			: 'No roll yet'}</span
	>
</div>

<style>
	.roll {
		--led-color: var(--color-brand-yellow, #ffd700);
		/* A touch larger than the other numbers (1.5rem), within the value row */
		--led-size: 1.625rem;
		--mod-size: 16px;
		--mod-gap: 8px;
	}

	/* Two digit cells: the unlit "88" sets the size, the lit digits sit on it, right-aligned */
	.led {
		position: relative;
		display: block;
		font-family: var(--font-led, var(--font-mono, monospace));
		font-size: var(--led-size);
		font-weight: 700;
		line-height: 1;
		white-space: nowrap;
	}

	.led-off {
		display: block;
		color: var(--led-color);
		opacity: 0.1;
	}

	.roll .led-on {
		position: absolute;
		inset: 0;
		font: inherit;
		text-align: right;
		color: var(--led-color);
		text-shadow:
			0 0 6px rgba(255, 215, 0, 0.55),
			0 0 14px rgba(255, 215, 0, 0.25);
	}

	/* "--" before the first roll: lit, but quieter */
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
			--led-size: 1.375rem;
			--mod-size: 12px;
			--mod-gap: 6px;
		}
	}

	@media (max-height: 500px) and (min-width: 601px) {
		.roll {
			--led-size: 1.25rem;
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
