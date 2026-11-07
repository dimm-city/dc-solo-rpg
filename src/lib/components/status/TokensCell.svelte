<script>
	/**
	 * TokensCell - Tokens n/N over a bar, the mirror of Stability (the outer right of the HUD)
	 *
	 * N is the tokens the game started with, and the bar is the tokens left out of N: the
	 * same reading as Stability's, so the number and the bar always agree. Removing the last
	 * token wins, so here an emptying bar is good news. Failed Salvation rolls can add tokens
	 * past the start ("12/10"): the bar stays full and turns striped.
	 *
	 * Wretched & Alone: the tokens arrive with the Ace of Hearts. Until then the same layout
	 * is dimmed, with a lock by the label. When it unlocks, the Salvation moment plays once:
	 * a gold flash, a ring closing in on the cell and the count striking in, within 600ms.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { DEFAULT_STARTING_TOKENS, tokenMeter } from './hudTiers.js';

	const unlocked = $derived(gameState.aceOfHeartsRevealed);
	const tokens = $derived(Math.max(0, gameState.tokens));
	const start = $derived(gameState.config?.options?.startingTokens || DEFAULT_STARTING_TOKENS);
	const meter = $derived(tokenMeter(tokens, start));
	const label = $derived(gameState.config?.labels?.successCounters ?? 'Tokens');
	const spoken = $derived(
		!unlocked
			? `${label} locked: find the Ace of Hearts`
			: `${tokens} of ${start} ${label} left${meter.over ? `, ${meter.over} more than at the start` : ''}`
	);

	// The Ace of Hearts beat: once, when the cell unlocks mid-game
	const UNLOCK_MS = ANIMATION_DURATION.BEAT + ANIMATION_DURATION.ENTER;
	let unlocking = $state(false);
	let wasUnlocked = gameState.aceOfHeartsRevealed;
	let timer;
	$effect(() => {
		const now = unlocked;
		if (now && !wasUnlocked) {
			unlocking = true;
			clearTimeout(timer);
			timer = setTimeout(() => (unlocking = false), UNLOCK_MS);
		}
		wasUnlocked = now;
	});
	$effect(() => () => clearTimeout(timer));
</script>

<div
	class="hud-cell tokens"
	class:locked={!unlocked}
	class:over={unlocked && meter.over > 0}
	class:unlocking
	data-testid="hud-tokens"
	title={unlocked ? undefined : 'Find the Ace of Hearts to unlock Salvation'}
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms; --hud-enter: {ANIMATION_DURATION.ENTER}ms"
>
	<span class="fx fx-flash" aria-hidden="true"></span>
	<span class="fx fx-ring" aria-hidden="true"></span>
	<span class="hud-label" aria-hidden="true">
		{#if !unlocked}
			<svg
				class="lock"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
		{/if}
		{label}
	</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="current">{tokens}</span><span class="hud-max">/{start}</span></span
		>
		<span class="bar"><span class="fill" style="transform: scaleX({meter.fraction})"></span></span>
	</span>
	<span class="sr-only">{spoken}</span>
</div>

<style>
	.tokens {
		--bar-color: var(--color-brand-yellow, #ffd700);
		--bar-glow: rgba(255, 215, 0, 0.45);
	}

	.tokens .hud-label,
	.tokens .current {
		color: var(--color-brand-yellow, #ffd700);
	}
	.tokens .current {
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.45);
	}

	/* Locked: the same layout, dimmed, with a lock by the label */
	.locked {
		--bar-color: rgba(255, 255, 255, 0.28);
		--bar-glow: transparent;
	}
	.locked .hud-label,
	.locked .current {
		color: rgba(255, 255, 255, 0.6);
		text-shadow: none;
	}
	.locked .hud-max {
		color: rgba(255, 255, 255, 0.4);
	}
	/* The label keeps the lock's room either side once it opens, so the column (and the row)
	   does not move at the Salvation moment */
	.tokens .hud-label {
		--lock-room: calc(0.9em + 3px);
		padding-inline: calc(var(--lock-room) / 2);
	}
	.locked .hud-label {
		padding-inline: 0;
	}
	.lock {
		flex: none;
		display: block;
		width: 0.9em;
		height: 0.9em;
	}

	/* More tokens than at the start: the bar is full and striped */
	.over .fill {
		background: repeating-linear-gradient(
			-60deg,
			var(--color-brand-yellow, #ffd700) 0 4px,
			rgba(255, 215, 0, 0.35) 4px 7px
		);
	}

	/* The Salvation moment: effects live in child spans so the row's frame is untouched */
	.fx {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
	}
	.unlocking .fx-flash {
		background: var(--color-brand-yellow, #ffd700);
		animation: aceFlash var(--hud-beat) var(--ease-enter, ease-out);
	}
	.unlocking .fx-ring {
		border: 2px solid var(--color-brand-yellow, #ffd700);
		animation: aceRing var(--hud-beat) var(--ease-enter, ease-out) var(--hud-enter);
	}
	.unlocking .hud-readout {
		animation: aceStrike var(--hud-beat) var(--ease-enter, ease-out) backwards;
	}

	@keyframes aceFlash {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 0;
		}
	}
	/* The cell clips its content, so the ring converges inward */
	@keyframes aceRing {
		from {
			opacity: 0;
			transform: scale(1.4);
		}
		50% {
			opacity: 0.9;
		}
		to {
			opacity: 0;
			transform: scale(1);
		}
	}
	@keyframes aceStrike {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		/* Unlock: a plain highlight, no movement */
		.unlocking .fx-ring,
		.unlocking .hud-readout {
			animation: none;
		}
		.unlocking .fx-flash {
			animation: none;
			opacity: 0.25;
		}
	}
</style>
