<script>
	import { gameState } from '../stores/gameStore.svelte.js';

	// Button logic moved to GameScreen toolbar
</script>

<div class="dc-final-damage-roll-container">
	<div class="dc-final-damage-description">
		<h2>The Final Test</h2>
		<p>
			You've completed the countdown, but salvation comes with one final risk. Roll one last time to
			see if you truly escape...
		</p>
		<div class="dc-final-damage-stats">
			<p><strong>Current Resources:</strong> {gameState.tower}</p>
			<p><strong>Bonus Counter:</strong> {gameState.bonus}</p>
			<p><strong>Possible Damage:</strong> 1-6, reduced by bonus</p>
		</div>
	</div>
</div>

<style>
	.dc-final-damage-roll-container {
		height: 100%;
		width: 100%;
		display: grid;
		text-align: center;
		padding: 2rem;
	}

	.dc-final-damage-description {
		margin-bottom: 2rem;
	}

	.dc-final-damage-description h2 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: var(--dc-accent-color, #ff6b6b);
	}

	.dc-final-damage-description p {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.dc-final-damage-stats {
		margin: 1.5rem auto;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		max-width: 400px;
	}

	.dc-final-damage-stats p {
		margin: 0.5rem 0;
		font-size: 1.1rem;
	}
</style>
