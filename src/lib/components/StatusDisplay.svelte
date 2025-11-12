<script>
	import { gameState } from '../stores/gameStore.svelte.js';

	import { exitGame } from '../stores/gameActions.svelte.js';

	import AugmentedButton from './AugmentedButton.svelte';
	const successPercent = $derived(10 - gameState.tokens);
	const bonusPercent = $derived(gameState.bonus);
	const failurePercent = $derived(gameState.kingsRevealed);
</script>

<div class="status-display-container">
	<!-- Player and Round Info Bar with Augmented UI -->
	<div
		class="player-round-bar"
		data-augmented-ui="tl-clip-x tr-2-clip-x br-clip bl-2-clip-x border"
	>
		<div class="info-segment">
			<span class="label">PLAYER:</span>
			<span class="value">{gameState.player.name.toUpperCase()}</span>
		</div>
		<div>
			<h5>{gameState.config?.title}</h5>
		</div>
		<div class="info-segment">
			<span class="label">{gameState.config?.labels.statusDisplayRoundText ?? 'ROUND:'}</span>
			<span class="value">{gameState?.round}</span>

			<button class="dc-exit-button" onclick={exitGame} aria-label="Exit game">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="stat-item health-stat" data-augmented-ui="tl-clip tr-clip-x br-clip-x border">
			<div class="stat-label">HEALTH</div>
			<div class="stat-value">
				<span class="current">{gameState.tower}</span><span class="divider">/</span><span
					class="max">100</span
				>
			</div>
			<div class="stat-bar">
				<div class="stat-fill health-fill" style="width: {gameState.tower}%"></div>
			</div>
		</div>

		<div class="stat-item failure-stat" data-augmented-ui="l-rect tr-clip br-clip-x border">
			<div class="stat-label">
				{gameState.config?.labels?.failureCounters?.toUpperCase() ?? 'FAILURE'}
			</div>
			<div class="stat-value">
				<span class="current">{failurePercent}</span><span class="divider">/</span><span class="max"
					>4</span
				>
			</div>
			<div class="stat-bar">
				<div class="stat-fill failure-fill" style="width: {(failurePercent / 4) * 100}%"></div>
			</div>
		</div>

		<div class="stat-item bonus-stat" data-augmented-ui="tl-clip-y l-rect-y tr-clip-x br-clip-x border">
			<div class="stat-label">LUCK</div>
			<div class="stat-value">
				<span class="current">{bonusPercent}</span><span class="divider">/</span><span class="max"
					>10</span
				>
			</div>
			<div class="stat-bar">
				<div class="stat-fill bonus-fill" style="width: {(bonusPercent / 10) * 100}%"></div>
			</div>
		</div>

		<div
			class="stat-item success-stat"
			data-augmented-ui=" tl-clip-inset tr-2-clip-y br-clip bl-2-clip-x border"
		>
			<div class="stat-label">
				{gameState.config?.labels?.successCounters?.toUpperCase() ?? 'SUCCESS'}
			</div>
			<div class="stat-value">
				<span class="current">{successPercent}</span><span class="divider">/</span><span class="max"
					>10</span
				>
			</div>
			<div class="stat-bar">
				<div class="stat-fill success-fill" style="width: {(successPercent / 10) * 100}%"></div>
			</div>
		</div>
	</div>
</div>

<style>
	.dc-exit-button {
		background: transparent;
		border: none;
		color: #fff;
		cursor: pointer;

		/* CRITICAL FIX: Ensure 44px minimum touch target */
		padding: var(--space-sm);
		margin-left: var(--space-md);
		min-width: 44px;
		min-height: 44px;

		/* Center the icon within larger touch area */
		display: inline-flex;
		align-items: center;
		justify-content: center;

		transition: color var(--transition-base);
	}

	.dc-exit-button:hover {
		color: var(--color-brand-yellow);
		filter: brightness(1.2);
	}

	.dc-exit-button:focus-visible {
		outline: 3px solid var(--color-neon-cyan);
		outline-offset: 2px;
	}
	.status-display-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: visible;
	}

	/* Player/Round Info Bar - Augmented UI with Glassmorphism */
	.player-round-bar {
		/* Augmented UI Configuration - Uniform corner clips */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, #00eeff 0%, #ff00ff 50%, #00ffaa 100%);
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 14px;

		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm);
		position: relative;

		/* Glassmorphism Effect */
		background: linear-gradient(
			135deg,
			rgba(100, 50, 200, 0.3),
			rgba(50, 150, 255, 0.25),
			rgba(100, 50, 200, 0.2)
		);
		backdrop-filter: blur(12px) saturate(180%);
		-webkit-backdrop-filter: blur(12px) saturate(180%);

		/* Enhanced Multi-layer Glow */
		box-shadow:
			0 0 30px rgba(0, 238, 255, 0.7),
			0 0 60px rgba(0, 238, 255, 0.4),
			0 0 90px rgba(0, 238, 255, 0.2),
			inset 0 0 30px rgba(255, 0, 255, 0.25),
			inset 0 0 50px rgba(0, 255, 255, 0.1);

		/* Subtle animation - removed for reduced visual noise */
	}

	@keyframes bar-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 30px rgba(0, 238, 255, 0.7),
				0 0 60px rgba(0, 238, 255, 0.4),
				0 0 90px rgba(0, 238, 255, 0.2),
				inset 0 0 30px rgba(255, 0, 255, 0.25),
				inset 0 0 50px rgba(0, 255, 255, 0.1);
		}
		50% {
			box-shadow:
				0 0 40px rgba(0, 238, 255, 0.9),
				0 0 70px rgba(0, 238, 255, 0.5),
				0 0 100px rgba(0, 238, 255, 0.3),
				inset 0 0 40px rgba(255, 0, 255, 0.3),
				inset 0 0 60px rgba(0, 255, 255, 0.15);
		}
	}

	.info-segment {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-family: 'Courier New', monospace;
		text-transform: uppercase;
	}

	.info-segment .label {
		font-size: var(--text-xs);
		font-weight: bold;
		color: #00eeff;
		text-shadow:
			0 0 10px rgba(0, 238, 255, 1),
			0 0 20px rgba(0, 238, 255, 0.6);
		letter-spacing: 0.1em;
	}

	.info-segment .value {
		font-size: 1rem;
		font-weight: bold;
		color: #fff;
		text-shadow:
			0 0 10px rgba(255, 255, 255, 1),
			0 0 20px rgba(255, 255, 255, 0.5);
	}
	.info-segment .label:first-of-type {
		padding-inline-start: 0.5rem;
	}
	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-sm);
		width: 100%;
	}

	.stat-item {
		/* Augmented UI Base Configuration */
		--aug-border-all: 2px;

		/* Truly Compact Layout */
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		position: relative;
		overflow: visible;
		min-height: 48px;

		/* Darker Glassmorphism Background */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);

		/* Subtle inner shine */
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.health-stat {
		/* Augmented UI Configuration - Entry point with rightward tab */
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 8px;   /* Gentle entry */
		--aug-tr: 14px;  /* Strong tab → connects to Failure */
		--aug-br: 14px;  /* Strong tab → connects to Bonus (mobile) */

		/* Enhanced Glow - animation removed */
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	@keyframes health-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 20px rgba(0, 255, 255, 0.6),
				0 0 40px rgba(0, 255, 255, 0.3),
				inset 0 0 15px rgba(0, 255, 255, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.05);
		}
		50% {
			box-shadow:
				0 0 25px rgba(0, 255, 255, 0.8),
				0 0 50px rgba(0, 255, 255, 0.4),
				inset 0 0 20px rgba(0, 255, 255, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.08);
		}
	}

	.failure-stat {
		/* Augmented UI Configuration - Receiver with downward tab */
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 14px;  /* Slot ← receives Health's tab */
		--aug-tr: 8px;   /* Gentle transition */
		--aug-l: 8px;
		--aug-br: 14px;  /* Strong tab → connects to Success (mobile) */

		/* Enhanced Glow - animation removed */
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.6),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(217, 70, 239, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	@keyframes failure-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 20px rgba(217, 70, 239, 0.6),
				0 0 40px rgba(217, 70, 239, 0.3),
				inset 0 0 15px rgba(217, 70, 239, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.05);
		}
		50% {
			box-shadow:
				0 0 25px rgba(217, 70, 239, 0.8),
				0 0 50px rgba(217, 70, 239, 0.4),
				inset 0 0 20px rgba(217, 70, 239, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.08);
		}
	}

	.bonus-stat {
		/* Augmented UI Configuration - Power source with rightward tab */
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		--aug-tl: 10px;
		  /* Slot ← receives Health's tab (mobile) */
		--aug-l: 0px;
		--aug-tr: 12px;  /* Strong tab → connects to Success */
		--aug-br: 8px;   /* Gentle terminus */
		padding: var(--space-sm);
		padding-left: var(--space-md);
		/* Enhanced Glow - animation removed */
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.6),
			0 0 40px rgba(255, 215, 0, 0.3),
			inset 0 0 15px rgba(255, 215, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	@keyframes bonus-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 20px rgba(255, 215, 0, 0.6),
				0 0 40px rgba(255, 215, 0, 0.3),
				inset 0 0 15px rgba(255, 215, 0, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.05);
		}
		50% {
			box-shadow:
				0 0 25px rgba(255, 215, 0, 0.8),
				0 0 50px rgba(255, 215, 0, 0.4),
				inset 0 0 20px rgba(255, 215, 0, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.08);
		}
	}

	.success-stat {
		/* Augmented UI Configuration - Terminus with receiving slot */
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-brand-yellow));
		--aug-tl: 8px;  /* Slot ← receives Bonus's tab (desktop) OR Failure's tab (mobile) */
		--aug-tr: 8px;   /* Gentle endpoint */
		--aug-br: 4px;   /* Gentle terminus */
		--aug-bl: 4px;   /* Visual anchor */

		padding: 1rem;
		/* Enhanced Glow - animation removed */
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	@keyframes success-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 20px rgba(0, 255, 255, 0.6),
				0 0 40px rgba(0, 255, 255, 0.3),
				inset 0 0 15px rgba(0, 255, 255, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.05);
		}
		50% {
			box-shadow:
				0 0 25px rgba(0, 255, 255, 0.8),
				0 0 50px rgba(0, 255, 255, 0.4),
				inset 0 0 20px rgba(0, 255, 255, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.08);
		}
	}

	.stat-label {
		font-size: var(--text-xs);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: 'Courier New', monospace;
		opacity: 0.9;
		text-align: left;
		align-self: center;
		flex: 0 0 auto;
		white-space: nowrap;
		min-width: 65px;
		/* Add padding to avoid clip zones */
		padding-left: 4px;
	}

	.health-stat .stat-label {
		color: #00ffaa;
		text-shadow:
			0 0 10px rgba(0, 255, 170, 1),
			0 0 20px rgba(0, 255, 170, 0.6);
	}

	.failure-stat .stat-label {
		color: #ff0066;
		text-shadow:
			0 0 10px rgba(255, 0, 102, 1),
			0 0 20px rgba(255, 0, 102, 0.6);
	}

	.bonus-stat .stat-label {
		color: #00eeff;
		text-shadow:
			0 0 10px rgba(0, 238, 255, 1),
			0 0 20px rgba(0, 238, 255, 0.6);
	}

	.success-stat .stat-label {
		color: #ffee00;
		text-shadow:
			0 0 10px rgba(255, 238, 0, 1),
			0 0 20px rgba(255, 238, 0, 0.6);
	}

	.stat-value {
		font-size: 1rem;
		font-weight: bold;
		font-family: 'Courier New', monospace;
		color: #fff;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
		line-height: 1;
		display: flex;
		align-items: baseline;
		align-self: center;
		gap: 0.1rem;
		justify-content: center;
		flex: 0 0 auto;
		white-space: nowrap;
		min-width: 50px;
	}

	.stat-value .current {
		font-size: 1rem;
	}

	.stat-value .divider {
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.stat-value .max {
		font-size: 0.7rem;
		opacity: 0.8;
	}

	/* Stat Bars */
	.stat-bar {
		height: 6px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
		align-self: center;
		flex: 1 1 auto;
		min-width: 40px;
		border-radius: 2px;
		/* Add margin to avoid clip zones */
		margin-right: 4px;
	}

	.stat-fill {
		height: 100%;
		transition: width 0.3s ease;
		position: relative;
		box-shadow: 0 0 10px currentColor;
	}

	.health-fill {
		background: linear-gradient(90deg, #00ff88, #00cc66);
		box-shadow: 0 0 10px #00ff88;
	}

	.failure-fill {
		background: linear-gradient(90deg, #ff0055, #cc0044);
		box-shadow: 0 0 10px #ff0055;
	}

	.bonus-fill {
		background: linear-gradient(90deg, #00d9ff, #0088cc);
		box-shadow: 0 0 10px #00d9ff;
	}

	.success-fill {
		background: linear-gradient(90deg, #ffdd00, #ccaa00);
		box-shadow: 0 0 10px #ffdd00;
	}

	/* Tablet - 2 columns */
	@media (max-width: 900px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-sm);
		}

		.stat-value .current {
			font-size: 1.3rem;
		}

		.stat-value .divider {
			font-size: 0.9rem;
		}

		.stat-value .max {
			font-size: 0.8rem;
		}

		.player-round-bar {
			padding: var(--space-sm) var(--space-md);
		}
	}

	/* Mobile - 2x2 grid */
	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-sm);
		}

		.stat-item {
			padding: var(--space-xs);
			min-height: 44px;
			gap: 4px;
		}

		.stat-label {
			font-size: 0.65rem;
			min-width: 50px;
			letter-spacing: 0.1em;
		}

		.stat-value {
			font-size: 0.85rem;
			min-width: 40px;
		}

		.stat-value .current {
			font-size: 0.85rem;
		}

		.stat-value .divider {
			font-size: 0.65rem;
		}

		.stat-value .max {
			font-size: 0.6rem;
		}

		.stat-bar {
			height: 5px;
			min-width: 30px;
		}

		.info-segment {
			gap: var(--space-xs);
		}

		.info-segment .label {
			font-size: 0.7rem;
		}

		.info-segment .value {
			font-size: 0.8rem;
		}

		.player-round-bar {
			padding: var(--space-sm);
			gap: var(--space-sm);
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.player-round-bar,
		.health-stat,
		.failure-stat,
		.bonus-stat,
		.success-stat {
			animation: none !important;
		}

		.stat-fill {
			transition: none !important;
		}
	}
</style>
