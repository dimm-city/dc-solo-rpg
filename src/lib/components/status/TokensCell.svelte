<script>
	/**
	 * TokensCell - Tokens left, locked until the Ace of Hearts
	 *
	 * Wretched & Alone: the tokens arrive with the Ace of Hearts. Until then the cell shows
	 * a lock and how to open it. When it unlocks, the Salvation moment plays once: a gold
	 * flash, a ring closing in on the cell and the count striking in, all within 600ms.
	 * Tokens can exceed 10 (failed Salvation rolls add them back).
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { ANIMATION_DURATION } from '../../constants/animations.js';

	const unlocked = $derived(gameState.aceOfHeartsRevealed);
	const tokens = $derived(Math.max(0, gameState.tokens));
	const label = $derived(gameState.config?.labels?.successCounters ?? 'Tokens');

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
	class:unlocking
	data-testid="hud-tokens"
	title={unlocked ? undefined : 'Find the Ace of Hearts to unlock Salvation'}
	style="--hud-beat: {ANIMATION_DURATION.BEAT}ms; --hud-enter: {ANIMATION_DURATION.ENTER}ms"
>
	<span class="fx fx-flash" aria-hidden="true"></span>
	<span class="fx fx-ring" aria-hidden="true"></span>
	<span class="hud-label">{label}</span>
	<span class="hud-readout" aria-hidden="true">
		{#if unlocked}
			<span class="hud-value current">{tokens}</span>
			<span class="hud-meta">left</span>
		{:else}
			<svg
				class="lock"
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
			<span class="hud-meta">find A♥</span>
		{/if}
	</span>
	<span class="sr-only"
		>{unlocked ? `${tokens} ${label} left` : `${label} locked: find the Ace of Hearts`}</span
	>
</div>

<style>
	.tokens .hud-label,
	.tokens .current {
		color: var(--color-brand-yellow, #ffd700);
	}
	.tokens .current {
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.45);
	}

	/* Locked: dim, with the way to unlock it */
	.locked .hud-label,
	.locked .hud-readout {
		color: rgba(255, 255, 255, 0.6);
	}
	.lock {
		flex: none;
		display: block;
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
