<script>
	/**
	 * TokensCell - Tokens n/N over a bar, the mirror of Stability (the outer right of the HUD)
	 *
	 * N is the tokens the game started with, and the bar is the tokens left out of N: the
	 * same reading as Stability's, so the number and the bar always agree. Removing the last
	 * token wins, so here an emptying bar is good news. On Hard, failed Salvation rolls add
	 * tokens past the start ("12/10"): the bar stays full and turns striped.
	 *
	 * Wretched & Alone: the tokens arrive with the Ace of Hearts. Until then the same layout
	 * is dimmed, with a lock in the foot row in place of the bar. When it unlocks, the
	 * Salvation moment plays once: a gold flash, a ring closing in on the cell and the count
	 * striking in, within 600ms.
	 *
	 * Tiers (tokensTier, DP-1-02): falling is good news. Gold while there is a way to go,
	 * green from 2 left, orange past the start on Hard.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';
	import { DEFAULT_STARTING_TOKENS, tokenMeter, tokensTier, tokensSpoken } from './hudTiers.js';

	const unlocked = $derived(gameState.aceOfHeartsRevealed);
	const tokens = $derived(Math.max(0, gameState.tokens));
	const start = $derived(gameState.config?.options?.startingTokens || DEFAULT_STARTING_TOKENS);
	const meter = $derived(tokenMeter(tokens, start));
	const label = $derived(gameState.config?.labels?.successCounters ?? 'Tokens');
	const tier = $derived(tokensTier({ unlocked, tokens, start }));
	const spoken = $derived(tokensSpoken({ unlocked, tokens, start, label }));

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
	class="hud-cell tokens tier-{tier}"
	class:locked={!unlocked}
	class:over={unlocked && meter.over > 0}
	class:unlocking
	data-tier={tier}
	data-testid="hud-tokens"
	title={unlocked ? undefined : 'Find the Ace of Hearts to unlock Salvation'}
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms; --hud-enter: {ANIMATION_DURATION.ENTER}ms"
>
	<span class="tint" aria-hidden="true"></span>
	<span class="fx fx-flash" aria-hidden="true"></span>
	<span class="fx fx-ring" aria-hidden="true"></span>
	<span class="hud-label" aria-hidden="true">{label}</span>
	<span class="hud-readout" aria-hidden="true">
		<span class="hud-value"
			><span class="led-field"
				><span class="led-off" aria-hidden="true">88</span><span class="led-on current"
					>{tokens}</span
				></span
			><span class="hud-slash" aria-hidden="true">/</span><span
				class="hud-max"
				class:lead-one={String(start).startsWith('1')}>{start}</span
			></span
		>
		{#if unlocked}
			<span class="hud-foot bar"
				><span class="fill" style="transform: scaleX({meter.fraction})"></span></span
			>
		{:else}
			<!-- Locked: the lock sits where the bar will be, so nothing moves when it opens -->
			<svg
				class="hud-foot lock"
				data-testid="tokens-lock"
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
	</span>
	<span class="sr-only">{spoken}</span>
</div>

<style>
	/* The tier ladder (DP-1-02): tint colour at its top alpha, value colour, label colour.
	   The bar follows the value colour. */
	.tokens {
		--tint-color: #ffd700;
		--tint-alpha: 0;
		--value-color: #ffd700;
		--label-color: #ffd700;
		--bar-color: var(--value-color);
		--bar-glow: rgba(255, 215, 0, 0.45);
	}
	.tier-half {
		--tint-alpha: 0.06;
	}
	.tier-near,
	.tier-clear {
		--tint-color: #00ff88;
		--value-color: #00ff88;
		--label-color: #00ff88;
		--bar-glow: rgba(0, 255, 136, 0.45);
	}
	.tier-near {
		--tint-alpha: 0.1;
	}
	.tier-clear {
		--tint-alpha: 0.12;
	}
	.tier-over {
		--tint-color: #ff8a3d;
		--tint-alpha: 0.08;
		--value-color: #ff8a3d;
		--label-color: #ff8a3d;
		--bar-glow: rgba(255, 138, 61, 0.45);
	}

	/* Locked: the same layout, dimmed, with the lock in the foot row */
	.tokens.locked {
		--tint-alpha: 0;
		--value-color: rgba(255, 255, 255, 0.6);
		--label-color: rgba(255, 255, 255, 0.72);
		--max-color: rgba(255, 255, 255, 0.5);
		--value-glow: none;
	}
	.lock {
		display: block;
		justify-self: center;
		width: var(--hud-foot, 16px);
		height: var(--hud-foot, 16px);
		color: rgba(255, 255, 255, 0.6);
	}

	/* More tokens than at the start (Hard): the bar is full and striped */
	.over .fill {
		background: repeating-linear-gradient(
			-60deg,
			var(--value-color) 0 4px,
			color-mix(in srgb, var(--value-color) 35%, transparent) 4px 7px
		);
	}

	/* The Salvation moment: effects live in child spans so the row's frame is untouched */
	.fx {
		position: absolute;
		inset: 0;
		z-index: 0;
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
