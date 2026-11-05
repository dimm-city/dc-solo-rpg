<script>
	/**
	 * SuccessTokensPanel - Success tokens panel
	 *
	 * Locked until the Ace of Hearts is revealed (Wretched & Alone: tokens arrive with the Ace).
	 * Then shows the remaining tokens as stars plus "n left". Tokens can exceed 10 because
	 * failed Salvation rolls add tokens, so the star count follows the token count.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.65,
		/** Animation duration in seconds */
		animationDuration = 0.75
	} = $props();

	const STARTING_TOKENS = 10;

	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);
	const successAugmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tl-clip-x border' : 'tl-2-clip-x tr-2-clip-x border'
	);

	const unlocked = $derived(gameState.aceOfHeartsRevealed);
	const tokens = $derived(Math.max(0, gameState.tokens));

	// One slot per starting token, growing if failed Salvation rolls pile on more
	const tokenStates = $derived(
		Array.from({ length: Math.max(STARTING_TOKENS, tokens) }, (_, i) => ({
			index: i,
			active: i < tokens
		}))
	);

	const successLabel = $derived(
		gameState.config?.labels?.successCounters?.toUpperCase() ?? 'SUCCESS'
	);

	// The Ace of Hearts beat: play once when the panel unlocks mid-game
	let unlocking = $state(false);
	let wasUnlocked = gameState.aceOfHeartsRevealed;
	let unlockTimer;
	$effect(() => {
		const now = unlocked;
		if (now && !wasUnlocked) {
			unlocking = true;
			clearTimeout(unlockTimer);
			unlockTimer = setTimeout(() => (unlocking = false), 1200); // ANIMATION_DURATION.SLOW x4
		}
		wasUnlocked = now;
		return () => clearTimeout(unlockTimer);
	});
</script>

<div
	class="stat-item success-stat slide-down"
	class:locked={!unlocked}
	class:unlocking
	data-augmented-ui={successAugmentedUI}
	data-testid="success-panel"
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="fx fx-flash" aria-hidden="true"></div>
	<div class="fx fx-ring" aria-hidden="true"></div>
	<div class="stat-label">{successLabel}</div>

	{#if unlocked}
		<div class="token-count" aria-label="{tokens} tokens left">
			<span class="current">{tokens}</span><span class="left">left</span>
		</div>
		<div class="token-grid" aria-hidden="true">
			{#each tokenStates as token (token.index)}
				<div
					class="token-shape"
					class:active={token.active}
					class:disabled={!token.active}
					style="--token-index: {token.index}"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="token-inner"
						><path
							d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
						/></svg
					>
				</div>
			{/each}
		</div>
	{:else}
		<div class="locked-state">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
				<path d="M7 11V7a5 5 0 0 1 10 0v4" />
			</svg>
			<span>Find the Ace of Hearts</span>
		</div>
	{/if}
</div>

<style>
	.slide-down {
		animation: slideDown 0.4s linear forwards;
		opacity: 0;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.stat-item {
		--aug-border-all: 2px;

		width: min-content;
		min-width: 120px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.25rem;
		padding: 0.375rem 0.625rem;
		position: relative;
		overflow: visible;
		min-height: 36px;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);
	}

	.success-stat {
		--aug-border-bg: var(
			--frame-border,
			linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
		);
		--aug-tl: 6px;
		--aug-tr: 8px;
		--aug-br: 4px;
		--aug-bl: 4px;
		grid-area: success;
		box-shadow:
			0 0 12px rgba(255, 215, 0, 0.25),
			inset 0 0 10px rgba(255, 215, 0, 0.08);
	}

	.stat-label {
		font-size: 0.75rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		color: var(--color-brand-yellow, #ffd700);
		text-align: center;
		align-self: center;
		white-space: nowrap;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.token-count {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}
	.token-count .current {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-brand-yellow, #ffd700);
	}
	.token-count .left {
		margin-inline-start: 0.3em;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* Locked: dim, with the way to unlock it */
	.locked-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0;
		max-width: 110px;
		text-align: center;
		color: rgba(255, 255, 255, 0.7);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 0.75rem;
		line-height: 1.2;
	}
	.locked .stat-label {
		color: rgba(255, 255, 255, 0.7);
	}
	.locked {
		box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
	}

	.token-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		padding: 0.25rem;
	}

	.token-shape {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.token-inner {
		width: 100%;
		height: 100%;
		transition: opacity 0.2s linear;
	}

	/* Remaining tokens glow yellow; removed ones go dark */
	.token-shape.active .token-inner {
		fill: var(--color-brand-yellow, #ffd700);
		stroke: var(--color-brand-yellow, #ffd700);
		animation: token-glow 5s ease-in-out infinite;
	}
	.token-shape.disabled .token-inner {
		fill: none;
		stroke: rgba(255, 255, 255, 0.25);
	}

	@keyframes token-glow {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.75;
		}
	}

	/* Ace of Hearts beat: a flash, a ring closing in on the panel, stars striking in one by one */
	/* (Effects live in child elements: the host's ::before/::after draw the augmented-ui frame) */
	.fx {
		position: absolute;
		inset: 0;
		pointer-events: none;
		opacity: 0;
	}
	.unlocking .fx-flash {
		background: var(--color-brand-yellow, #ffd700);
		animation: aceFlash 0.6s ease-out;
	}
	.unlocking .fx-ring {
		border: 2px solid var(--color-brand-yellow, #ffd700);
		animation: aceRing 1.2s ease-out;
	}
	.unlocking .token-shape {
		animation: aceStar 0.3s ease-out backwards;
		animation-delay: calc(0.2s + var(--token-index) * 0.06s);
	}
	.unlocking .token-count {
		animation: aceStar 0.3s ease-out backwards;
	}

	@keyframes aceFlash {
		from {
			opacity: 0.5;
		}
		to {
			opacity: 0;
		}
	}
	/* The panel is clipped by its frame, so the ring converges inward */
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
	@keyframes aceStar {
		from {
			opacity: 0;
			transform: scale(0.2);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (max-width: 600px) {
		.stat-item {
			width: 100%;
			max-width: 100%;
			min-width: 0;
			padding: 0.25rem 0.5rem;
		}
		.stat-label {
			font-size: 0.625rem;
		}
		.token-shape {
			width: 18px;
			height: 18px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}
		.token-shape.active .token-inner {
			animation: none;
		}
		/* Unlock: a plain highlight, no movement */
		.unlocking .fx-ring,
		.unlocking .token-shape,
		.unlocking .token-count {
			animation: none;
		}
		.unlocking .fx-flash {
			animation: none;
			opacity: 0.25;
		}
	}
</style>
