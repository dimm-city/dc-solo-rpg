<script>
	/**
	 * CompactHUD - Single-row HUD for phones (<= 600px)
	 *
	 * Stability n/20, Kings n/4, tokens, cards left and last roll in one ~64px row.
	 * Hidden above 600px; StatsGrid hides it while a card or journal overlay is open.
	 *
	 * @component
	 */
	import { gameState } from '../../stores/gameStore.svelte.js';
	import { MAX_STABILITY, stabilityTier } from './hudTiers.js';

	const tier = $derived(stabilityTier(gameState.tower));
	const kings = $derived(
		Math.max(0, Math.min(4, gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange || 0)))
	);
	const unlocked = $derived(gameState.aceOfHeartsRevealed);
	const cardsLeft = $derived(gameState.deck?.length || 0);
	const lastRoll = $derived(gameState.diceRoll > 0 ? gameState.diceRoll : '--');
	const modifier = $derived(gameState.isLucid ? 'lucid' : gameState.isSurreal ? 'surreal' : null);

	const kingsLabel = $derived(gameState.config?.labels?.failureCounters ?? 'Kings');
	const tokensLabel = $derived(gameState.config?.labels?.successCounters ?? 'Tokens');
</script>

<div
	class="compact-hud"
	data-augmented-ui="tl-clip br-clip border"
	data-testid="compact-hud"
	role="group"
	aria-label="Game status"
>
	<div class="cell tier-{tier}" data-testid="compact-stability">
		<span class="label">Stability</span>
		<span class="value stability">{gameState.tower}<span class="max">/{MAX_STABILITY}</span></span>
	</div>
	<div class="cell danger-cell" class:urgent={kings >= 3} data-testid="compact-kings">
		<span class="label">{kingsLabel}</span>
		<span class="value kings">{kings}<span class="max">/4</span></span>
	</div>
	<div class="cell" class:locked={!unlocked} data-testid="compact-tokens">
		<span class="label">{tokensLabel}</span>
		{#if unlocked}
			<span class="value tokens">{gameState.tokens}<span class="max">left</span></span>
		{:else}
			<span
				class="value lock"
				title="Find the Ace of Hearts"
				aria-label="Locked: find the Ace of Hearts"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
			</span>
		{/if}
	</div>
	<div class="cell" data-testid="compact-cards">
		<span class="label">Cards</span>
		<span class="value">{cardsLeft}</span>
	</div>
	<div class="cell" data-testid="compact-roll">
		<span class="label">Roll</span>
		<span class="value roll {modifier ?? ''}">{lastRoll}</span>
		{#if modifier}
			<span class="mod {modifier}">{modifier === 'lucid' ? 'LUCID' : 'SURREAL'}</span>
		{/if}
	</div>
</div>

<style>
	.compact-hud {
		display: none;
	}

	@media (max-width: 600px) {
		.compact-hud {
			--aug-border-all: 2px;
			--aug-border-bg: var(
				--frame-border,
				linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta))
			);
			--aug-tl: 8px;
			--aug-br: 8px;

			display: grid;
			grid-template-columns: 1.3fr 0.9fr 1.2fr 0.9fr 1fr;
			align-items: center;
			height: 64px;
			width: 100%;
			box-sizing: border-box;
			padding: 0 var(--space-xs);
			background: linear-gradient(135deg, rgba(10, 10, 20, 0.85), rgba(15, 15, 25, 0.75));
			font-family: var(--font-mono, 'Share Tech Mono', ui-monospace, monospace);
		}
	}

	.cell {
		--tier-color: #00ff88;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		min-width: 0;
		position: relative;
	}
	.cell + .cell::before {
		content: '';
		position: absolute;
		left: 0;
		top: 12%;
		bottom: 12%;
		width: 1px;
		background: rgba(255, 255, 255, 0.15);
	}

	.label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(255, 255, 255, 0.7);
		white-space: nowrap;
	}

	.value {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
		color: #fff;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.tokens .max {
		margin-inline-start: 0.25em;
	}
	.max {
		font-size: 0.75rem;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.7);
	}

	.tier-steady {
		--tier-color: #00ff88;
	}
	.tier-caution {
		--tier-color: var(--color-brand-yellow, #ffd700);
	}
	.tier-danger {
		--tier-color: #ff8a3d;
	}
	.tier-critical {
		--tier-color: var(--color-danger, #ff4d6d);
	}
	.value.stability {
		color: var(--tier-color);
	}
	.tier-critical .value.stability {
		animation: criticalPulse 1.6s ease-in-out infinite;
	}

	.danger-cell .label,
	.danger-cell .value {
		color: var(--color-danger, #ff4d6d);
	}
	.danger-cell .value {
		color: #fff;
	}
	.danger-cell.urgent .value {
		color: var(--color-danger, #ff4d6d);
		font-size: 1.5rem;
	}

	.value.tokens {
		color: var(--color-brand-yellow, #ffd700);
	}
	.locked .value {
		color: rgba(255, 255, 255, 0.7);
	}
	.value.lock {
		display: inline-flex;
	}

	.value.roll {
		color: var(--color-brand-yellow, #ffd700);
	}
	.mod {
		font-size: 0.5625rem;
		font-weight: bold;
		letter-spacing: 0.04em;
		line-height: 1;
	}
	.mod.lucid {
		color: #00ffaa;
	}
	.mod.surreal {
		color: var(--color-danger, #ff4d6d);
	}

	@keyframes criticalPulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tier-critical .value.stability {
			animation: none;
		}
	}
</style>
