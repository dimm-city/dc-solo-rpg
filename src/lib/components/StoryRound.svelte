<script>
	/**
	 * StoryRound - Display a single round in story mode
	 * Shows card details, journal entry, and game state for one round
	 */

	import AudioPlayer from './AudioPlayer.svelte';
	import { fade, fly } from 'svelte/transition';

	let {
		round = null, // Round data with cards array
		roundNumber = 0,
		totalRounds = 0,
		showStats = true
	} = $props();

	// Get card type display info
	function getCardTypeInfo(type) {
		switch (type) {
			case 'primary-success':
				return { label: 'Victory', color: 'var(--color-brand-yellow)' };
			case 'failure-counter':
				return { label: 'Doom', color: 'var(--color-cyber-red)' };
			case 'narrative':
				return { label: 'Ability', color: 'var(--color-neon-cyan)' };
			case 'challenge':
				return { label: 'Challenge', color: 'var(--color-toxic-green)' };
			case 'event':
				return { label: 'Event', color: 'var(--color-cyber-magenta)' };
			default:
				return { label: 'Unknown', color: '#ffffff' };
		}
	}

	// Format card identifier (for reference)
	function formatCardIdentifier(card) {
		return `${card.card} of ${capitalize(card.suit)}`;
	}

	function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
</script>

{#if round}
	<div class="story-round" transition:fade={{ duration: 300 }}>
		<!-- Round Header -->
		<div class="round-header" data-augmented-ui="tl-clip tr-clip border">
			<div class="round-number">
				<span class="label">Round</span>
				<span class="number">{roundNumber}</span>
				<span class="total">of {totalRounds}</span>
			</div>
		</div>

		<!-- Cards Display - Loop through all cards in this round -->
		{#each round.cards || [] as card, index (index)}
			{@const typeInfo = getCardTypeInfo(card.type)}
			<div class="card-display" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
				<div class="card-header">
					<!-- Card Type Badge (prominent) -->
					<div class="card-type-badge-large" style="--badge-color: {typeInfo.color}">
						<span class="type-label">{typeInfo.label}</span>
					</div>
					<!-- Card identifier (subtle reference) -->
					<div class="card-identifier-small">
						{formatCardIdentifier(card)}
					</div>
					{#if card.modifier}
						<div class="card-modifier">
							<span class="modifier-icon">✨</span>
							<span>{card.modifier.replace('-', ' ')}</span>
						</div>
					{/if}
				</div>

				{#if card.description}
					<div class="card-description">
						<p class="description-text">{card.description}</p>
					</div>
				{/if}

				{#if card.story}
					<div class="card-story">
						<div class="story-content">
							{@html card.story.replace(/\n/g, '<br>')}
						</div>
					</div>
				{/if}

				<!-- Stability Roll Result (if this card triggered a stability check) -->
				{#if card.damageRoll !== undefined}
					<div class="damage-roll-result">
						<div class="roll-header">
							<span class="roll-label">Stability Check</span>
						</div>
						<div class="roll-details">
							<div class="roll-die">
								<svg
									class="die-icon"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect
										x="3"
										y="3"
										width="18"
										height="18"
										rx="2"
										stroke="currentColor"
										stroke-width="2"
									/>
									<circle cx="12" cy="12" r="1.5" fill="currentColor" />
								</svg>
								<span class="roll-number">{card.damageRoll}</span>
							</div>
							<div class="damage-dealt">
								<span class="damage-arrow">→</span>
								<span class="damage-value">-{card.damageDealt}</span>
								<span class="damage-label">tower</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}

		<!-- Journal Entry -->
		{#if round.journalEntry}
			<div class="journal-section" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
				<div class="journal-header">
					<h3>Journal Entry</h3>
				</div>

				<div class="journal-content">
					{#if round.journalEntry.text}
						<div class="journal-text">
							{round.journalEntry.text}
						</div>
					{/if}

					{#if round.journalEntry.audio}
						<div class="journal-audio">
							<AudioPlayer audioData={round.journalEntry.audio} />
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Game Over Message (Victory/Loss) -->
		{#if round.gameOverMessage}
			<div
				class="game-over-section"
				class:victory={round.isWon}
				data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
			>
				<div class="game-over-header">
					<h3>{round.isWon ? 'Victory' : 'Defeat'}</h3>
				</div>
				<div class="game-over-content">
					<p class="game-over-message">{round.gameOverMessage}</p>
				</div>
			</div>
		{/if}

		<!-- Game State Stats -->
		{#if showStats && round.gameState}
			<div class="round-stats" data-augmented-ui="tl-clip tr-clip border">
				<div class="stat-item">
					<span class="stat-label">Tower</span>
					<span class="stat-value">{round.gameState.tower ?? 'N/A'}</span>
				</div>
				{#if round.gameState.kingsRevealed !== undefined}
					<div class="stat-item">
						<span class="stat-label">Failures</span>
						<span class="stat-value">{round.gameState.kingsRevealed}/4</span>
					</div>
				{/if}
				{#if round.gameState.tokens !== undefined}
					<div class="stat-item">
						<span class="stat-label">
							{round.gameState.aceOfHeartsRevealed ? 'Success' : 'Tokens'}
						</span>
						<span class="stat-value">
							{round.gameState.aceOfHeartsRevealed
								? `${10 - round.gameState.tokens}/10`
								: round.gameState.tokens}
						</span>
					</div>
				{/if}
				{#if round.gameState.acesRevealed !== undefined && round.gameState.acesRevealed > 0}
					<div class="stat-item">
						<span class="stat-label">Abilities</span>
						<span class="stat-value">{round.gameState.acesRevealed}</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.story-round {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		padding: var(--space-xl);
		max-width: 900px;
		margin: 0 auto;
		width: 100%;
		min-height: 60vh; /* Prevent layout jumping */
	}

	/* Round Header */
	.round-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(26, 26, 26, 0.6));
		border: 2px solid rgba(255, 215, 0, 0.3);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		--aug-border-bg: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(255, 215, 0, 0.3);
	}

	.round-number {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		font-family: var(--font-display);
	}

	.round-number .label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.round-number .number {
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
	}

	.round-number .total {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.card-type-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--badge-color) 20%, transparent),
			color-mix(in srgb, var(--badge-color) 10%, transparent)
		);
		border: 2px solid color-mix(in srgb, var(--badge-color) 50%, transparent);
		border-radius: 6px;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.type-label {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--badge-color);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-shadow: 0 0 10px color-mix(in srgb, var(--badge-color) 50%, transparent);
	}

	/* Large Card Type Badge (prominent) */
	.card-type-badge-large {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--badge-color) 25%, transparent),
			color-mix(in srgb, var(--badge-color) 15%, transparent)
		);
		border: 3px solid var(--badge-color);
		border-radius: 8px;
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		box-shadow: 0 0 20px color-mix(in srgb, var(--badge-color) 30%, transparent);
	}

	.card-type-badge-large .type-label {
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: 0.15em;
	}

	/* Small Card Identifier (subtle reference) */
	.card-identifier-small {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.4);
		font-family: 'Courier New', monospace;
		padding: var(--space-xs) var(--space-sm);
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
		letter-spacing: 0.05em;
	}

	/* Card Display */
	.card-display {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(100, 50, 200, 0.2), rgba(50, 150, 255, 0.15));
		border: 2px solid rgba(138, 43, 226, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		--aug-border-bg: linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.2));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(138, 43, 226, 0.4);
		box-shadow: 0 0 30px rgba(138, 43, 226, 0.2);
	}

	.card-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-sm);
	}

	.card-identifier {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.card-name {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
	}

	.card-modifier {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-md);
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15));
		border: 1px solid rgba(255, 215, 0, 0.4);
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-brand-yellow);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.modifier-icon {
		font-size: 1rem;
	}

	.card-description {
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.3);
		border-left: 4px solid var(--color-cyber-magenta);
		border-radius: 4px;
	}

	.description-text {
		font-size: 1.125rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
		font-style: italic;
	}

	.card-story {
		padding: var(--space-lg);
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.story-content {
		font-size: 1rem;
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.85);
	}

	.story-content :global(strong) {
		color: var(--color-neon-cyan);
		font-weight: 700;
	}

	.story-content :global(em) {
		color: var(--color-cyber-magenta);
		font-style: italic;
	}

	/* Damage Roll Result */
	.damage-roll-result {
		margin-top: var(--space-md);
		padding: var(--space-lg);
		background: linear-gradient(135deg, rgba(255, 69, 0, 0.1), rgba(220, 20, 60, 0.1));
		border: 2px solid rgba(255, 69, 0, 0.3);
		border-radius: 8px;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	.roll-header {
		margin-bottom: var(--space-md);
	}

	.roll-label {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.roll-details {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		flex-wrap: wrap;
	}

	.roll-die {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.die-icon {
		width: 32px;
		height: 32px;
		color: var(--color-brand-yellow);
		filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
	}

	.roll-number {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
	}

	.damage-dealt {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.damage-arrow {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.damage-value {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 700;
		color: #ff4500;
		text-shadow: 0 0 10px rgba(255, 69, 0, 0.5);
	}

	.damage-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: lowercase;
	}

	/* Journal Section */
	.journal-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(75, 0, 130, 0.2));
		border: 2px solid rgba(186, 85, 211, 0.4);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		--aug-border-bg: linear-gradient(135deg, rgba(186, 85, 211, 0.2), rgba(138, 43, 226, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(186, 85, 211, 0.4);
	}

	.journal-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.journal-header h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: rgba(186, 85, 211, 1);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-shadow: 0 0 10px rgba(186, 85, 211, 0.5);
		margin: 0;
	}

	.journal-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.journal-text {
		padding: var(--space-lg);
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		border-left: 4px solid rgba(186, 85, 211, 0.6);
		font-size: 1rem;
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.9);
		white-space: pre-wrap;
	}

	/* Game Over Section (Victory/Loss Message) */
	.game-over-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: linear-gradient(135deg, rgba(220, 20, 60, 0.15), rgba(139, 0, 0, 0.2));
		border: 3px solid rgba(220, 20, 60, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		--aug-border-bg: linear-gradient(135deg, rgba(220, 20, 60, 0.3), rgba(139, 0, 0, 0.2));
		--aug-border: 3px;
		--aug-border-fallback-color: rgba(220, 20, 60, 0.6);
		box-shadow: 0 0 25px rgba(220, 20, 60, 0.4);
	}

	.game-over-section.victory {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(0, 255, 100, 0.1));
		border-color: rgba(255, 215, 0, 0.6);
		--aug-border-bg: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(0, 255, 100, 0.2));
		--aug-border-fallback-color: rgba(255, 215, 0, 0.6);
		box-shadow: 0 0 25px rgba(255, 215, 0, 0.4);
	}

	.game-over-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
	}

	.game-over-header h3 {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		color: rgba(220, 20, 60, 1);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		text-shadow: 0 0 15px rgba(220, 20, 60, 0.8);
		margin: 0;
	}

	.game-over-section.victory .game-over-header h3 {
		color: var(--color-brand-yellow);
		text-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
	}

	.game-over-content {
		padding: var(--space-lg);
		background: rgba(0, 0, 0, 0.4);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.game-over-message {
		font-size: 1.125rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.95);
		font-family: var(--font-body);
		margin: 0;
		text-align: center;
	}

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
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
	}

	.stat-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.stat-value {
		font-family: 'Courier New', monospace;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.story-round {
			padding: var(--space-sm);
			gap: var(--space-md);
			max-width: 100%;
		}

		.round-header {
			flex-direction: column;
			align-items: flex-start;
			padding: var(--space-md);
			gap: var(--space-sm);
		}

		.round-number {
			width: 100%;
		}

		.round-number .number {
			font-size: 1.5rem;
		}

		.card-type-badge {
			width: 100%;
			justify-content: center;
			padding: var(--space-xs) var(--space-md);
		}

		.card-display,
		.journal-section {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.card-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.card-name {
			font-size: 1.125rem;
			word-break: break-word;
		}

		.card-modifier {
			font-size: 0.7rem;
		}

		.description-text {
			font-size: 1rem;
		}

		.story-content {
			font-size: 0.9rem;
			line-height: 1.6;
		}

		.journal-text {
			font-size: 0.9rem;
			padding: var(--space-md);
		}

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
			font-size: 1rem;
		}
	}

	/* Extra small screens */
	@media (max-width: 375px) {
		.story-round {
			padding: var(--space-xs);
		}

		.card-name {
			font-size: 1rem;
		}

		.description-text,
		.story-content,
		.journal-text {
			font-size: 0.875rem;
		}

		.stat-item {
			flex: 1 1 45%;
		}
	}
</style>
