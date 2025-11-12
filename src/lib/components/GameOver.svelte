<script>
	import { gameState, transitionTo } from '../stores/gameStore.svelte.js';
	import ContinueButton from './ContinueButton.svelte';
</script>

<div class="game-over-overlay">
	<div class="game-over-content">
		<div class="game-over-title">
			<span>G</span><span>A</span><span>M</span><span>E</span>
			<span>&nbsp;</span>
			<span>O</span><span>V</span><span>E</span><span>R</span>
		</div>

		<div class="game-over-message">
			{#if gameState.kingsRevealed == 4}
				<p>{gameState.config?.labels?.failureCounterLoss ?? 'Four kings revealed - the game is over'}</p>
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
		background-image: radial-gradient(
				circle at 50% 50%,
				rgba(255, 0, 255, 0.08),
				transparent 75%
			),
			radial-gradient(circle at 25% 75%, rgba(255, 42, 109, 0.1), transparent 70%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		z-index: 100;
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
		text-shadow: 0 0 5px var(--neon-red), 0 0 20px var(--neon-magenta),
			0 0 35px var(--neon-magenta);
	}

	.game-over-title span {
		display: inline-block;
		opacity: 0;
		transform: translateY(-80px);
		animation: dropIn 0.9s forwards;
	}

	/* Delays for each letter */
	.game-over-title span:nth-child(1) {
		animation-delay: 0.1s;
	}
	.game-over-title span:nth-child(2) {
		animation-delay: 0.25s;
	}
	.game-over-title span:nth-child(3) {
		animation-delay: 0.4s;
	}
	.game-over-title span:nth-child(4) {
		animation-delay: 0.55s;
	}
	.game-over-title span:nth-child(5) {
		animation-delay: 0.7s;
	}
	.game-over-title span:nth-child(6) {
		animation-delay: 0.85s;
	}
	.game-over-title span:nth-child(7) {
		animation-delay: 1s;
	}
	.game-over-title span:nth-child(8) {
		animation-delay: 1.15s;
	}
	.game-over-title span:nth-child(9) {
		animation-delay: 1.3s;
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
