<script>
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';

	// Determine if this is a victory or loss
	let isVictory = $derived(gameState.win === true);
	let titleText = $derived(isVictory ? 'VICTORY' : 'GAME OVER');
	let titleLetters = $derived(titleText.split(''));
</script>

<div class="game-over-overlay" class:victory={isVictory}>
	<div class="game-over-content">
		<div class="game-over-title" class:victory={isVictory}>
			{#each titleLetters as letter, index}
				<span style="animation-delay: {0.1 + index * 0.15}s">{letter}</span>
			{/each}
		</div>

		<div class="game-over-message" class:victory={isVictory}>
			{#if gameState.kingsRevealed == 4}
				<p>
					{gameState.config?.labels?.failureCounterLoss ?? 'Four kings revealed - the game is over'}
				</p>
			{:else}
				<p>{gameState.status}</p>
			{/if}
		</div>

		<div class="game-over-button">
			<ContinueButton
				text="record your final log"
				onclick={() => transitionTo('finalLog')}
				testid="game-over-final-log-button"
			/>
		</div>
	</div>
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
		align-items: center;
		justify-content: center;
		overflow: hidden;
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
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
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

	.game-over-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		z-index: 1;
	}

	/* Animated title */
	.game-over-title {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		font-family: 'Orbitron', sans-serif;
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

	.game-over-title span {
		display: inline-block;
		opacity: 0;
		transform: translateY(-80px);
		animation: dropIn 0.9s forwards;
	}

	@keyframes dropIn {
		0% {
			opacity: 0;
			transform: translateY(-80px) scale(0.9);
			filter: blur(4px);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	/* Message with flicker effect */
	.game-over-message {
		font-family: 'Share Tech Mono', monospace;
		font-size: 1.125rem;
		color: var(--neon-cyan);
		text-shadow: 0 0 10px var(--neon-cyan);
		animation: flicker 3s infinite;
		text-align: center;
		max-width: 80%;
	}

	/* Victory message - green/gold */
	.game-over-message.victory {
		color: #00ff64;
		text-shadow: 0 0 10px #00ff64;
	}

	.game-over-message p {
		margin: 0;
		line-height: 1.6;
	}

	@keyframes flicker {
		0%,
		20%,
		50%,
		100% {
			opacity: 1;
		}
		10%,
		40%,
		70% {
			opacity: 0.3;
		}
	}

	/* Button container */
	.game-over-button {
		margin-top: 1rem;
		animation: fadeIn 0.6s forwards;
		animation-delay: 1.5s;
		opacity: 0;
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

	/* Responsive font sizes */
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
			font-size: 2rem;
		}

		.game-over-message {
			font-size: 0.875rem;
		}
	}
</style>
