<script>
	/**
	 * StoryRound - Display a single round in story mode
	 * Shows card details, journal entry, and game state for one round
	 */

	import AudioPlayer from './AudioPlayer.svelte';
	import { fade, fly } from 'svelte/transition';

	let {
		round = null, // Round data from cardLog
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
				return { label: 'Bonus', color: 'var(--color-neon-cyan)' };
			case 'challenge':
				return { label: 'Challenge', color: 'var(--color-toxic-green)' };
			case 'event':
				return { label: 'Event', color: 'var(--color-cyber-magenta)' };
			default:
				return { label: 'Unknown', color: '#ffffff' };
		}
	}

	let typeInfo = $derived(round?.card ? getCardTypeInfo(round.card.type) : null);

	// Format card identifier
	let cardDisplay = $derived(
		round?.card ? `${round.card.card} of ${capitalize(round.card.suit)}` : ''
	);

	function capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
</script>

{#if round}
	<div class="story-round" transition:fade={{ duration: 400 }}>
		<!-- Round Header -->
		<div class="round-header" data-augmented-ui="tl-clip tr-clip border">
			<div class="round-number">
				<span class="label">Round</span>
				<span class="number">{roundNumber}</span>
				<span class="total">of {totalRounds}</span>
			</div>

			{#if typeInfo}
				<div class="card-type-badge" style="--badge-color: {typeInfo.color}">
					<span class="type-label">{typeInfo.label}</span>
				</div>
			{/if}
		</div>

		<!-- Card Display -->
		<div class="card-display" data-augmented-ui="tl-clip tr-clip br-clip bl-clip border">
			<div class="card-header">
				<div class="card-identifier">
					<span class="card-name">{cardDisplay}</span>
				</div>
				{#if round.card?.modifier}
					<div class="card-modifier">
						<span class="modifier-icon">✨</span>
						<span>{round.card.modifier.replace('-', ' ')}</span>
					</div>
				{/if}
			</div>

			{#if round.card?.description}
				<div class="card-description">
					<p class="description-text">{round.card.description}</p>
				</div>
			{/if}

			{#if round.card?.story}
				<div class="card-story">
					<div class="story-content">
						{@html round.card.story.replace(/\n/g, '<br>')}
					</div>
				</div>
			{/if}
		</div>

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

		<!-- Game State Stats -->
		{#if showStats}
			<div class="round-stats" data-augmented-ui="tl-clip tr-clip border">
				<div class="stat-item">
					<span class="stat-label">Tower</span>
					<span class="stat-value">{round.gameState?.tower ?? 'N/A'}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Tokens</span>
					<span class="stat-value">{round.gameState?.tokens ?? 'N/A'}</span>
				</div>
				{#if round.gameState?.kingsRevealed !== undefined}
					<div class="stat-item">
						<span class="stat-label">Kings</span>
						<span class="stat-value">{round.gameState.kingsRevealed}/4</span>
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
	}

	/* Round Header */
	.round-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
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
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--space-md);
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
			padding: var(--space-md);
			gap: var(--space-lg);
		}

		.round-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.card-display,
		.journal-section {
			padding: var(--space-lg);
		}

		.card-name {
			font-size: 1.25rem;
		}

		.round-stats {
			flex-wrap: wrap;
		}
	}
</style>
