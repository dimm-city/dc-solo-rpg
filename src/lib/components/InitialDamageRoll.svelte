<script>
	import { gameState } from '../stores/gameStore.svelte.js';

	// Button logic moved to GameScreen toolbar
</script>

<div class="dc-initial-damage-roll-container">
	<h2 class="dc-initial-damage-title">Initial Instability</h2>
	<p class="dc-initial-damage-description">
		Before your journey begins, the situation is already precarious. Roll to see how much ground you've already lost...
	</p>
	<div class="dc-initial-damage-stats">
		<p><strong>Starting Resources:</strong> {gameState.tower}</p>
		<p><strong>Possible Damage:</strong> 1-6</p>
	</div>
</div>

<style>
	.dc-initial-damage-roll-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
		padding: 2rem;
		align-content: center;
	}

	.dc-initial-damage-stats {
		margin: 1.5rem auto;
		padding: 1.5rem;
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: var(--dc-default-border-radius);
		max-width: 400px;
		backdrop-filter: blur(10px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
	}

	.dc-initial-damage-stats p {
		margin: 0.5rem 0;
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.dc-initial-damage-stats strong {
		color: var(--color-neon-cyan, #00eeff);
		text-shadow: 0 0 10px rgba(0, 238, 255, 0.6);
	}

	.dc-initial-damage-title {
		font-family: 'lixdu', 'Courier New', monospace;
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 900;
		color: var(--color-neon-cyan);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0 0 1.5rem 0;
		text-shadow:
			0 0 40px rgba(0, 255, 255, 0.8),
			0 0 80px rgba(0, 255, 255, 0.5),
			0 0 120px rgba(0, 255, 255, 0.3);
		opacity: 1;
	}

	.dc-initial-damage-description {
		font-size: clamp(1rem, 2.5vw, 1.3rem);
		color: rgba(255, 255, 255, 0.95);
		line-height: 1.8;
		margin: 0 0 2rem 0;
		max-width: 600px;
		margin-inline: auto;
		text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
		opacity: 1;
	}

	@media (max-width: 768px) {
		.dc-initial-damage-roll-container {
			padding: 1.5rem;
		}

		.dc-initial-damage-stats {
			padding: 1rem;
		}

		.dc-initial-damage-stats p {
			font-size: 1rem;
		}

		.dc-initial-damage-title {
			font-size: clamp(2rem, 6vw, 3rem);
			margin-bottom: 1rem;
		}

		.dc-initial-damage-description {
			font-size: 1rem;
			margin-bottom: 1.5rem;
		}
	}
</style>
