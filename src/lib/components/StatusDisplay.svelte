<script>
	import { gameState } from '../stores/gameStore.svelte.js';

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
		<div class="info-segment">
			<span class="label">{gameState.config?.labels.statusDisplayRoundText ?? 'ROUND:'}</span>
			<span class="value">{gameState?.round}</span>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div
			class="stat-item health-stat"
			data-augmented-ui="tr-clip tl-clip-x br-2-clip-x border"
		>
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

		<div
			class="stat-item failure-stat"
			data-augmented-ui="tl-2-clip-y tr-clip bl-clip-x border"
		>
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

		<div class="stat-item bonus-stat" data-augmented-ui="tr-clip-y tl-clip br-2-clip-x border">
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
			data-augmented-ui="tl-clip-x tr-2-clip bl-clip-y br-clip border"
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
	.status-display-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: visible;
	}

	/* Player/Round Info Bar - Augmented UI with Glassmorphism */
	.player-round-bar {
		/* Augmented UI Configuration */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, #00eeff 0%, #ff00ff 50%, #00ffaa 100%);
		--aug-tl: 10px;
		--aug-tr: 10px;
		--aug-br: 10px;
		--aug-bl: 10px;

		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1.5rem;
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

		/* Subtle animation */
		animation: bar-glow-pulse 3s ease-in-out infinite;
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
		font-size: 0.7rem;
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

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		width: 100%;
	}

	.stat-item {
		/* Augmented UI Base Configuration */
		--aug-border-all: 2px;

		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.85rem 0.65rem 0.65rem 0.65rem;
		position: relative;
		overflow: visible;

		/* Glassmorphism Background */
		background: linear-gradient(135deg, rgba(20, 20, 40, 0.5), rgba(30, 30, 50, 0.4));
		backdrop-filter: blur(10px) saturate(150%);
		-webkit-backdrop-filter: blur(10px) saturate(150%);

		/* Subtle inner shine */
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.health-stat {
		/* Augmented UI Configuration */
		--aug-border-bg: linear-gradient(135deg, #00ff88, #00cc66, #00ffaa);
		--aug-tr: 10px;
		--aug-tl: 8px;
		--aug-br: 12px;

		/* Enhanced Glow with Animation */
		box-shadow:
			0 0 30px rgba(0, 255, 136, 0.9),
			0 0 50px rgba(0, 255, 136, 0.5),
			0 0 80px rgba(0, 255, 136, 0.3),
			inset 0 0 25px rgba(0, 255, 136, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		animation: health-glow-pulse 2.5s ease-in-out infinite;
	}

	@keyframes health-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 30px rgba(0, 255, 136, 0.9),
				0 0 50px rgba(0, 255, 136, 0.5),
				0 0 80px rgba(0, 255, 136, 0.3),
				inset 0 0 25px rgba(0, 255, 136, 0.25),
				inset 0 1px 0 rgba(255, 255, 255, 0.1);
		}
		50% {
			box-shadow:
				0 0 40px rgba(0, 255, 136, 1),
				0 0 60px rgba(0, 255, 136, 0.6),
				0 0 100px rgba(0, 255, 136, 0.4),
				inset 0 0 30px rgba(0, 255, 136, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.15);
		}
	}

	.failure-stat {
		/* Augmented UI Configuration */
		--aug-border-bg: linear-gradient(135deg, #ff0055, #cc0044, #ff0066);
		--aug-tl: 12px;
		--aug-tr: 10px;
		--aug-bl: 8px;

		/* Enhanced Glow with Animation */
		box-shadow:
			0 0 30px rgba(255, 0, 85, 0.9),
			0 0 50px rgba(255, 0, 85, 0.5),
			0 0 80px rgba(255, 0, 85, 0.3),
			inset 0 0 25px rgba(255, 0, 85, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		animation: failure-glow-pulse 2.2s ease-in-out infinite;
	}

	@keyframes failure-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 30px rgba(255, 0, 85, 0.9),
				0 0 50px rgba(255, 0, 85, 0.5),
				0 0 80px rgba(255, 0, 85, 0.3),
				inset 0 0 25px rgba(255, 0, 85, 0.25),
				inset 0 1px 0 rgba(255, 255, 255, 0.1);
		}
		50% {
			box-shadow:
				0 0 40px rgba(255, 0, 85, 1),
				0 0 60px rgba(255, 0, 85, 0.6),
				0 0 100px rgba(255, 0, 85, 0.4),
				inset 0 0 30px rgba(255, 0, 85, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.15);
		}
	}

	.bonus-stat {
		/* Augmented UI Configuration */
		--aug-border-bg: linear-gradient(135deg, #00d9ff, #0088cc, #00eeff);
		--aug-tr: 12px;
		--aug-tl: 10px;
		--aug-br: 10px;

		/* Enhanced Glow with Animation */
		box-shadow:
			0 0 30px rgba(0, 217, 255, 0.9),
			0 0 50px rgba(0, 217, 255, 0.5),
			0 0 80px rgba(0, 217, 255, 0.3),
			inset 0 0 25px rgba(0, 217, 255, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		animation: bonus-glow-pulse 2.8s ease-in-out infinite;
	}

	@keyframes bonus-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 30px rgba(0, 217, 255, 0.9),
				0 0 50px rgba(0, 217, 255, 0.5),
				0 0 80px rgba(0, 217, 255, 0.3),
				inset 0 0 25px rgba(0, 217, 255, 0.25),
				inset 0 1px 0 rgba(255, 255, 255, 0.1);
		}
		50% {
			box-shadow:
				0 0 40px rgba(0, 217, 255, 1),
				0 0 60px rgba(0, 217, 255, 0.6),
				0 0 100px rgba(0, 217, 255, 0.4),
				inset 0 0 30px rgba(0, 217, 255, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.15);
		}
	}

	.success-stat {
		/* Augmented UI Configuration */
		--aug-border-bg: linear-gradient(135deg, #ffdd00, #ccaa00, #ffee00);
		--aug-tl: 8px;
		--aug-tr: 12px;
		--aug-bl: 10px;
		--aug-br: 10px;

		/* Enhanced Glow with Animation */
		box-shadow:
			0 0 30px rgba(255, 221, 0, 0.9),
			0 0 50px rgba(255, 221, 0, 0.5),
			0 0 80px rgba(255, 221, 0, 0.3),
			inset 0 0 25px rgba(255, 221, 0, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		animation: success-glow-pulse 3s ease-in-out infinite;
	}

	@keyframes success-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 30px rgba(255, 221, 0, 0.9),
				0 0 50px rgba(255, 221, 0, 0.5),
				0 0 80px rgba(255, 221, 0, 0.3),
				inset 0 0 25px rgba(255, 221, 0, 0.25),
				inset 0 1px 0 rgba(255, 255, 255, 0.1);
		}
		50% {
			box-shadow:
				0 0 40px rgba(255, 221, 0, 1),
				0 0 60px rgba(255, 221, 0, 0.6),
				0 0 100px rgba(255, 221, 0, 0.4),
				inset 0 0 30px rgba(255, 221, 0, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.15);
		}
	}

	.stat-label {
		font-size: 0.65rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: 'Courier New', monospace;
		opacity: 0.8;
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
		font-size: 1.5rem;
		font-weight: bold;
		font-family: 'Courier New', monospace;
		color: #fff;
		text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
		line-height: 1;
		display: flex;
		align-items: baseline;
		gap: 0.1rem;
		justify-content: center;
	}

	.stat-value .current {
		font-size: 1.5rem;
	}

	.stat-value .divider {
		font-size: 1rem;
		opacity: 0.7;
	}

	.stat-value .max {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	/* Stat Bars */
	.stat-bar {
		height: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
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
			gap: 0.5rem;
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
			padding: 0.4rem 0.8rem;
		}
	}

	/* Mobile - 2x2 grid */
	@media (max-width: 600px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.4rem;
		}

		.stat-item {
			padding: 0.4rem;
		}

		.stat-label {
			font-size: 0.55rem;
		}

		.stat-value .current {
			font-size: 1.1rem;
		}

		.stat-value .divider {
			font-size: 0.75rem;
		}

		.stat-value .max {
			font-size: 0.7rem;
		}

		.stat-bar {
			height: 0.4rem;
		}

		.info-segment {
			gap: 0.3rem;
		}

		.info-segment .label {
			font-size: 0.55rem;
		}

		.info-segment .value {
			font-size: 0.8rem;
		}

		.player-round-bar {
			padding: 0.3rem 0.5rem;
			gap: 0.5rem;
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
