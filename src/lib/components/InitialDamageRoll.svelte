<script>
	import { gameState } from '../stores/gameStore.svelte.js';

	// Button logic moved to GameScreen toolbar
</script>

<div class="dc-initial-damage-roll-container">
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
		align-items: flex-start;
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
	}
</style>
