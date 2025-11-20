<script>
/**
 * GameOverMessage - Display victory or defeat message
 *
 * Shows the game over message with appropriate styling
 *
 * @component
 * @example
 * <GameOverMessage
 *   message="You have escaped the void!"
 *   isWon={true}
 * />
 */

let {
	message = '',
	isWon = false
} = $props();
</script>

{#if message}
	<div class="game-over-section" class:victory={isWon} data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
		<div class="game-over-header">
			<h3>{isWon ? 'Victory' : 'Defeat'}</h3>
		</div>
		<div class="game-over-content">
			<p class="game-over-message">{message}</p>
		</div>
	</div>
{/if}

<style>
	.game-over-section {
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(26, 26, 26, 0.8));
		border: 2px solid rgba(255, 0, 0, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		--aug-border-bg: linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(178, 34, 34, 0.2));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(255, 0, 0, 0.4);
	}

	.game-over-section.victory {
		border-color: rgba(255, 215, 0, 0.6);
		--aug-border-bg: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.2));
		--aug-border-fallback-color: rgba(255, 215, 0, 0.6);
	}

	.game-over-header {
		text-align: center;
		margin-bottom: var(--space-lg);
	}

	.game-over-header h3 {
		font-family: var(--font-display);
		font-size: 2rem;
		color: rgba(255, 0, 0, 0.9);
		text-shadow:
			0 0 20px rgba(255, 0, 0, 0.6),
			0 0 40px rgba(255, 0, 0, 0.3);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.game-over-section.victory h3 {
		color: rgba(255, 215, 0, 1);
		text-shadow:
			0 0 20px rgba(255, 215, 0, 0.8),
			0 0 40px rgba(255, 215, 0, 0.4);
	}

	.game-over-content {
		text-align: center;
	}

	.game-over-message {
		font-size: var(--text-lg);
		line-height: var(--line-height-relaxed);
		color: rgba(255, 255, 255, 0.9);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.game-over-section {
			padding: var(--space-lg);
		}

		.game-over-header h3 {
			font-size: 1.5rem;
		}

		.game-over-message {
			font-size: var(--text-base);
		}
	}
</style>
