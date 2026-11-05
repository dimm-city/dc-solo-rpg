<script>
	import { onMount } from 'svelte';
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
	import RunRecap from './RunRecap.svelte';
	import { getEndingText, getEndingCause, MAX_STABILITY } from '../utils/endingSummary.js';

	// Final beat before the title: skulls ignite (King loss) or Stability drains (Stability loss)
	const BEAT_DURATION = 1500;
	const SKULL_STAGGER = 250;

	let isVictory = $derived(gameState.win === true);
	let ending = $derived(getEndingText(gameState, gameState.config?.labels));
	let words = $derived((isVictory ? 'VICTORY' : 'GAME OVER').split(' '));

	// Victory has no beat; reduced-motion players skip it
	const hasBeat =
		typeof window !== 'undefined' &&
		!gameState.win &&
		!!getEndingCause(gameState) &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let beatDone = $state(!hasBeat);
	console.log('DBG', hasBeat, gameState.win, getEndingCause(gameState), gameState.kingsRevealed);
	let drained = $state(0);
	let startStability = $state(MAX_STABILITY);

	// Where the Stability reading drains from: last snapshot taken before the loss
	function lastStability() {
		const snapshots = gameState.log
			.map((entry) => entry.gameState?.tower ?? entry.tower)
			.filter((value) => typeof value === 'number' && value > 0);
		return snapshots.length ? snapshots[snapshots.length - 1] : MAX_STABILITY;
	}

	onMount(() => {
		if (!hasBeat) return;

		startStability = lastStability();
		drained = startStability;

		let frame;
		const started = performance.now();
		if (ending.cause === 'stability') {
			const tick = (now) => {
				const progress = Math.min(1, (now - started) / BEAT_DURATION);
				drained = Math.round(startStability * (1 - progress));
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		}
		const timer = setTimeout(() => (beatDone = true), BEAT_DURATION);
		return () => {
			clearTimeout(timer);
			cancelAnimationFrame(frame);
		};
	});
</script>

<div
	class="game-over-overlay"
	class:victory={isVictory}
	class:beat={!beatDone}
	class:kings={ending.cause === 'kings'}
>
	{#if !beatDone}
		<div class="beat-stage" data-testid="game-over-beat" aria-hidden="true">
			{#if ending.cause === 'kings'}
				<div class="skulls">
					{#each [0, 1, 2, 3] as n (n)}
						<svg
							class="skull"
							style="animation-delay: {n * SKULL_STAGGER}ms"
							viewBox="0 0 24 24"
							width="56"
							height="56"
							fill="currentColor"
						>
							<path
								d="M12 2C7.6 2 4 5.4 4 9.7c0 2.5 1.2 4.6 3 6V19a1 1 0 0 0 1 1h1v2h2v-2h2v2h2v-2h1a1 1 0 0 0 1-1v-3.3c1.8-1.4 3-3.5 3-6C20 5.4 16.4 2 12 2Zm-3.5 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
							/>
						</svg>
					{/each}
				</div>
			{:else}
				<div class="drain">
					<span class="drain-label">Stability</span>
					<span class="drain-value">{drained}/{MAX_STABILITY}</span>
					<span class="drain-bar"
						><span class="drain-fill" style="transform: scaleX({drained / MAX_STABILITY})"
						></span></span
					>
				</div>
			{/if}
		</div>
	{:else}
		<div class="game-over-content">
			<h1 class="game-over-title" class:victory={isVictory} aria-label={words.join(' ')}>
				{#each words as word, w (w)}
					<span class="word" aria-hidden="true">
						{#each word.split('') as letter, index (index)}
							<span class="letter" style="animation-delay: {0.1 + (w * 5 + index) * 0.1}s"
								>{letter}</span
							>
						{/each}
					</span>
				{/each}
			</h1>

			<div class="game-over-message" class:victory={isVictory}>
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
					text={gameState.config?.labels?.gameOverButtonText ?? 'record your final log'}
					onclick={() => transitionTo('finalLog')}
					testid="game-over-final-log-button"
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	:root {
		--bg-color: #05070a;
		--neon-yellow: #ffe400;
		--neon-cyan: #00ffff;
		--neon-magenta: #ff00ff;
		--neon-red: #ff2a6d;
	}

	.game-over-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--bg-color);
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.08), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(255, 42, 109, 0.1), transparent 70%);
		display: flex;
		align-items: safe center;
		justify-content: center;
		overflow-x: hidden;
		overflow-y: auto;
		z-index: 100;
	}

	/* Victory state - positive colors */
	.game-over-overlay.victory {
		background-image:
			radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.12), transparent 75%),
			radial-gradient(circle at 25% 75%, rgba(0, 255, 100, 0.1), transparent 70%);
	}

	/* Scanlines overlay */
	.game-over-overlay::before {
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
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(-4px);
		}
	}

	/* Final beat: the screen darkens (opacity only) */
	.game-over-overlay.kings.beat::after {
		content: '';
		position: fixed;
		inset: 0;
		background: #000;
		pointer-events: none;
		animation: darken 1.5s ease-out forwards;
	}

	@keyframes darken {
		from {
			opacity: 0;
		}
		to {
			opacity: 0.75;
		}
	}

	.beat-stage {
		z-index: 1;
		display: flex;
		justify-content: center;
		padding: var(--space-lg, 1.5rem);
	}

	.skulls {
		display: flex;
		gap: var(--space-lg, 1.5rem);
	}

	.skull {
		color: var(--color-danger, #ff4d6d);
		opacity: 0.15;
		animation: ignite 0.4s ease-out forwards;
	}

	@keyframes ignite {
		0% {
			opacity: 0.15;
			transform: scale(0.9);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.drain {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm, 0.5rem);
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		color: var(--color-danger, #ff4d6d);
	}

	.drain-label {
		font-size: 0.875rem;
		letter-spacing: 0.15em;
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
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg, 1.5rem);
		z-index: 1;
		width: 100%;
		max-width: var(--content-max, 720px);
		box-sizing: border-box;
		padding: var(--space-lg, 1.5rem) var(--space-md, 1rem);
	}

	/* Animated title */
	.game-over-title {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 0.4em;
		margin: 0;
		font-family: var(--font-display, 'lixdu', 'Orbitron', sans-serif);
		font-weight: normal;
		font-size: 4rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--neon-red);
		text-shadow:
			0 0 5px var(--neon-red),
			0 0 20px var(--neon-magenta),
			0 0 35px var(--neon-magenta);
	}

	/* Victory title - gold and green */
	.game-over-title.victory {
		color: var(--neon-yellow);
		text-shadow:
			0 0 5px var(--neon-yellow),
			0 0 20px rgba(255, 215, 0, 0.8),
			0 0 35px rgba(0, 255, 100, 0.6);
	}

	.word {
		display: inline-flex;
		white-space: nowrap;
	}

	.letter {
		display: inline-block;
		opacity: 0;
		transform: translateY(-80px);
		animation: dropIn 0.9s forwards;
	}

	@keyframes dropIn {
		0% {
			opacity: 0;
			transform: translateY(-80px) scale(0.9);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.game-over-message {
		font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		font-size: 1.125rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		text-align: center;
		max-width: 90%;
		opacity: 0;
		animation: fadeIn 0.6s 0.8s forwards;
	}

	.game-over-message.victory {
		color: #00ff64;
		text-shadow: 0 0 10px #00ff64;
	}

	.game-over-message p {
		margin: 0;
		line-height: 1.6;
	}

	.game-over-message .cause {
		margin-top: var(--space-sm, 0.5rem);
		font-size: 0.9375rem;
		color: var(--color-danger, #ff4d6d);
		text-shadow: none;
	}

	.game-over-recap {
		width: 100%;
		display: flex;
		justify-content: center;
		opacity: 0;
		animation: fadeIn 0.6s 1.1s forwards;
	}

	.afterword {
		margin: 0;
		max-width: 34rem;
		text-align: center;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-style: italic;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.8);
		opacity: 0;
		animation: fadeIn 0.6s 1.4s forwards;
	}

	.game-over-button {
		opacity: 0;
		animation: fadeIn 0.6s 1.7s forwards;
	}

	@keyframes fadeIn {
		0% {
			opacity: 0;
			transform: translateY(10px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.game-over-title {
			font-size: 3rem;
		}

		.game-over-message {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.game-over-title {
			font-size: 2.25rem;
		}

		.game-over-message {
			font-size: 0.9375rem;
		}

		.game-over-content {
			gap: var(--space-md, 1rem);
		}

		.skulls {
			gap: var(--space-sm, 0.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.game-over-overlay::before {
			animation: none;
		}

		.letter,
		.game-over-message,
		.game-over-recap,
		.afterword,
		.game-over-button {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
