<script>
	/**
	 * GameOver - the ending: title, what happened, the run in a few tiles, then the final log.
	 *
	 * It lives on the same overlay layer as the card and the journal, with the ending's
	 * backdrop at full opacity from the first frame, so it never fades up from black:
	 * - Kings: the fourth King's card already staged the beat (CardDeck), and its overlay
	 *   fades out over this one. The title follows at once.
	 * - Stability: a short drain of the Stability reading to 0, then the title.
	 * - Victory: the title at once.
	 * The title fades in as one word over 400ms; the rest follows 100ms apart.
	 */
	import { onMount } from 'svelte';
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import OverlayModal from './OverlayModal.svelte';
	import RunRecap from './RunRecap.svelte';
	import { getEndingCause, getEndingText, MAX_STABILITY } from '../utils/endingSummary.js';

	// Stability loss: the reading drains to 0, holds a moment, then the title
	const DRAIN_MS = 600;
	const DRAIN_HOLD_MS = 150;

	let isVictory = $derived(gameState.win === true);
	let ending = $derived(getEndingText(gameState, gameState.config?.labels));
	let title = $derived(isVictory ? 'Victory' : 'Game Over');

	const reducedMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
	const hasDrain = !reducedMotion && getEndingCause(gameState) === 'stability';

	let beatDone = $state(!hasDrain);
	let drained = $state(0);

	// Where the Stability reading drains from: last snapshot taken before the loss
	function lastStability() {
		const snapshots = gameState.log
			.map((entry) => entry.gameState?.tower ?? entry.tower)
			.filter((value) => typeof value === 'number' && value > 0);
		return snapshots.length ? snapshots[snapshots.length - 1] : MAX_STABILITY;
	}

	onMount(() => {
		if (!hasDrain) return;

		const from = lastStability();
		drained = from;
		let frame;
		const started = performance.now();
		const tick = (now) => {
			const progress = Math.min(1, (now - started) / DRAIN_MS);
			drained = Math.round(from * (1 - progress));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		const timer = setTimeout(() => (beatDone = true), DRAIN_MS + DRAIN_HOLD_MS);
		return () => {
			clearTimeout(timer);
			cancelAnimationFrame(frame);
		};
	});
</script>

<OverlayModal label={title} tone={isVictory ? 'victory' : 'loss'} zIndex={4900} isVisible={true}>
	<div class="game-over" class:victory={isVictory} data-testid="game-over">
		{#if !beatDone}
			<div class="drain" data-testid="game-over-beat" aria-hidden="true">
				<span class="drain-label">Stability</span>
				<span class="drain-value">{drained}/{MAX_STABILITY}</span>
				<span class="drain-bar">
					<span class="drain-fill" style="transform: scaleX({drained / MAX_STABILITY})"></span>
				</span>
			</div>
		{:else}
			<div class="game-over-content">
				<h1 class="game-over-title">{title}</h1>

				<div class="game-over-message">
					<p data-testid="game-over-message">{ending.message}</p>
					{#if ending.causeLine}
						<p class="cause" data-testid="game-over-cause">{ending.causeLine}</p>
					{/if}
				</div>

				<div class="game-over-recap">
					<RunRecap />
				</div>

				{#if !isVictory && ending.afterword}
					<p class="afterword" data-testid="game-over-afterword">{ending.afterword}</p>
				{/if}

				<div class="game-over-button">
					<ContinueButton
						text={gameState.config?.labels?.gameOverButtonText ?? 'Write your final log'}
						onclick={() => transitionTo('finalLog')}
						testid="game-over-final-log-button"
						variant="primary"
					/>
				</div>
			</div>
		{/if}
	</div>
</OverlayModal>

<style>
	.game-over {
		--ending-accent: #ff2a6d;
		--ending-glow: #ff00ff;
		--ending-message: #9ff7ff;

		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: safe center;
		justify-content: center;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.game-over.victory {
		--ending-accent: #ffe400;
		--ending-glow: rgba(0, 255, 100, 0.6);
		--ending-message: #7dffb3;
	}

	/* Scanlines over the backdrop (static apart from a slow 4px drift) */
	.game-over::before {
		content: '';
		position: fixed;
		inset: 0;
		background-image: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.05) 0px,
			rgba(255, 255, 255, 0.05) 2px,
			transparent 2px,
			transparent 4px
		);
		pointer-events: none;
		animation: scan 10s linear infinite;
	}

	@keyframes scan {
		to {
			transform: translateY(-4px);
		}
	}

	/* Stability loss: the reading drains to zero */
	.drain {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--color-danger, #ff4d6d);
	}

	.drain-label {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.drain-value {
		font-size: 3.5rem;
		line-height: 1;
	}

	.drain-bar {
		display: block;
		width: min(70vw, 20rem);
		height: 6px;
		background: rgba(255, 255, 255, 0.12);
	}

	.drain-fill {
		display: block;
		height: 100%;
		background: var(--color-danger, #ff4d6d);
		transform-origin: left;
	}

	.game-over-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg, 1.5rem);
		width: 100%;
		max-width: 880px;
		box-sizing: border-box;
		/* No safe-area term: OverlayModal's stage already pads by the insets, so with a landscape
		   notch this sits 16px inside it (visual-layout-s-14) */
		padding: var(--space-xl, 2rem) var(--space-md, 1rem);
	}

	/* The title arrives as one word: 400ms fade plus an 8px rise */
	.game-over-title {
		margin: 0;
		font-family: var(--font-display, 'lixdu', 'Orbitron', sans-serif);
		font-weight: normal;
		font-size: clamp(2rem, 9vw, 4rem);
		line-height: 1.1;
		max-inline-size: 100%;
		overflow-wrap: break-word;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ending-accent);
		text-shadow:
			0 0 5px var(--ending-accent),
			0 0 20px var(--ending-glow),
			0 0 35px var(--ending-glow);
		animation: rise-in 400ms cubic-bezier(0.33, 1, 0.68, 1) 100ms both;
	}

	.game-over-message,
	.game-over-recap,
	.afterword,
	.game-over-button {
		animation: rise-in 200ms cubic-bezier(0.33, 1, 0.68, 1) both;
	}

	.game-over-message {
		max-width: 40rem;
		text-align: center;
		animation-delay: 500ms;
	}

	.game-over-recap {
		width: 100%;
		display: flex;
		justify-content: center;
		animation-delay: 600ms;
	}

	.afterword {
		animation-delay: 700ms;
	}

	.game-over-button {
		animation-delay: 800ms;
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.game-over-message p {
		margin: 0;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		line-height: 1.55;
		color: var(--ending-message);
		text-wrap: balance;
	}

	.game-over-message .cause {
		margin-top: var(--space-sm, 0.5rem);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-danger, #ff4d6d);
	}

	/* A win has a cause line too (the fourth Ace, the last Token): the victory accent, not red */
	.game-over.victory .game-over-message .cause {
		color: var(--ending-accent);
	}

	.afterword {
		margin: 0;
		max-width: 34rem;
		text-align: center;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1rem;
		font-style: italic;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.8);
		text-wrap: balance;
	}

	@media (max-width: 600px) {
		.game-over-content {
			gap: var(--space-md, 1rem);
			padding: var(--space-lg, 1.5rem) var(--space-md, 1rem);
		}
	}

	/* Landscape phones: everything shrinks a step so the button stays in reach */
	@media (max-height: 500px) {
		.game-over-content {
			gap: var(--space-sm, 0.5rem);
			padding: var(--space-md, 1rem);
		}

		.game-over-title {
			font-size: 2.25rem;
		}

		.game-over-message p {
			font-size: 1rem;
		}

		.afterword {
			font-size: 0.875rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.game-over::before,
		.game-over-title,
		.game-over-message,
		.game-over-recap,
		.afterword,
		.game-over-button {
			animation: none;
		}
	}
</style>
