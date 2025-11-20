<script>
/**
 * RoundStats - Display game state statistics for a round
 *
 * Shows tower, failures (kings), tokens/success, and abilities (aces)
 *
 * @component
 * @example
 * <RoundStats gameState={{
 *   tower: 15,
 *   kingsRevealed: 2,
 *   tokens: 5,
 *   aceOfHeartsRevealed: true,
 *   acesRevealed: 3
 * }} />
 */

let {
	gameState = null
} = $props();
</script>

{#if gameState}
	<div class="round-stats" data-augmented-ui="tl-clip tr-clip border">
		<div class="stat-item">
			<span class="stat-label">Tower</span>
			<span class="stat-value">{gameState.tower ?? 'N/A'}</span>
		</div>
		{#if gameState.kingsRevealed !== undefined}
			<div class="stat-item">
				<span class="stat-label">Failures</span>
				<span class="stat-value">{gameState.kingsRevealed}/4</span>
			</div>
		{/if}
		{#if gameState.tokens !== undefined}
			<div class="stat-item">
				<span class="stat-label">
					{gameState.aceOfHeartsRevealed ? 'Success' : 'Tokens'}
				</span>
				<span class="stat-value">
					{gameState.aceOfHeartsRevealed
						? `${10 - gameState.tokens}/10`
						: gameState.tokens}
				</span>
			</div>
		{/if}
		{#if gameState.acesRevealed !== undefined && gameState.acesRevealed > 0}
			<div class="stat-item">
				<span class="stat-label">Abilities</span>
				<span class="stat-value">{gameState.acesRevealed}</span>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Round Stats */
	.round-stats {
		display: flex;
		align-items: center;
		justify-content: space-around;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(26, 26, 26, 0.5));
		border: 2px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		--aug-border-bg: rgba(255, 255, 255, 0.05);
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(255, 255, 255, 0.1);
		--aug-tl: 12px;
		--aug-tr: 12px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
	}

	.stat-label {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		font-family: var(--font-display);
	}

	.stat-value {
		font-size: 1.5rem;
		color: var(--color-neon-cyan);
		font-weight: 700;
		font-family: 'Courier New', monospace;
		text-shadow:
			0 0 10px rgba(0, 255, 255, 0.5),
			0 0 20px rgba(0, 255, 255, 0.3);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.round-stats {
			flex-wrap: wrap;
			padding: var(--space-md);
			gap: var(--space-sm);
		}

		.stat-item {
			flex: 1 1 30%;
			min-width: 80px;
		}

		.stat-value {
			font-size: 1.25rem;
		}

		.stat-label {
			font-size: 0.65rem;
		}
	}
</style>
