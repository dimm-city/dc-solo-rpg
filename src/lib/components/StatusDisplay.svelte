<script>
	import { gameStore } from '../stores/WAAStore.js';
	import HealthMeter from './HealthMeter.svelte';
	import Meter from './Meter.svelte';

	$: successPercent = (10 - $gameStore.tokens);
	$: bonusPercent = $gameStore.bonus;
	$: failurePercent = $gameStore.kingsRevealed;
</script>

<div class="status-display-container">
	<!-- Player and Round Info Bar -->
	<div class="player-round-bar">
		<div class="info-segment">
			<span class="label">PLAYER:</span>
			<span class="value">{$gameStore.player.name.toUpperCase()}</span>
		</div>
		<div class="info-segment">
			<span class="label">{$gameStore.config?.labels.statusDisplayRoundText ?? 'ROUND:' }</span>
			<span class="value">{$gameStore?.round}</span>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="stat-item health-stat">
			<div class="stat-label">HEALTH</div>
			<div class="stat-value">
				<span class="current">{$gameStore.tower}</span><span class="divider">/</span><span class="max">100</span>
			</div>
			<div class="stat-bar">
				<div class="stat-fill health-fill" style="width: {$gameStore.tower}%"></div>
			</div>
		</div>

		<div class="stat-item failure-stat">
			<div class="stat-label">{$gameStore.config?.labels?.failureCounters?.toUpperCase() ?? 'FAILURE'}</div>
			<div class="stat-value">
				<span class="current">{failurePercent}</span><span class="divider">/</span><span class="max">4</span>
			</div>
			<div class="stat-bar">
				<div class="stat-fill failure-fill" style="width: {(failurePercent / 4) * 100}%"></div>
			</div>
		</div>

		<div class="stat-item bonus-stat">
			<div class="stat-label">LUCK</div>
			<div class="stat-value">
				<span class="current">{bonusPercent}</span><span class="divider">/</span><span class="max">10</span>
			</div>
			<div class="stat-bar">
				<div class="stat-fill bonus-fill" style="width: {(bonusPercent / 10) * 100}%"></div>
			</div>
		</div>

		<div class="stat-item success-stat">
			<div class="stat-label">{$gameStore.config?.labels?.successCounters?.toUpperCase() ?? 'SUCCESS'}</div>
			<div class="stat-value">
				<span class="current">{successPercent}</span><span class="divider">/</span><span class="max">10</span>
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

	/* Player/Round Info Bar - Creaturepunk Style */
	.player-round-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: linear-gradient(135deg, rgba(100, 50, 200, 0.4), rgba(50, 150, 255, 0.4));
		border: 2px solid #00eeff;
		border-left: 4px solid #ff00ff;
		border-right: 4px solid #00ffaa;
		padding: 0.5rem 1rem;
		position: relative;
		box-shadow:
			0 0 25px rgba(0, 238, 255, 0.6),
			0 0 40px rgba(0, 238, 255, 0.3),
			inset 0 0 25px rgba(255, 0, 255, 0.2);
		clip-path: polygon(
			0 0,
			calc(100% - 1rem) 0,
			100% 1rem,
			100% 100%,
			1rem 100%,
			0 calc(100% - 1rem)
		);
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
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background: rgba(20, 20, 40, 0.6);
		border: 2px solid;
		padding: 0.5rem;
		position: relative;
		overflow: visible;
		clip-path: polygon(
			0.5rem 0,
			100% 0,
			100% calc(100% - 0.5rem),
			calc(100% - 0.5rem) 100%,
			0 100%,
			0 0.5rem
		);
	}

	.health-stat {
		border-color: #00ff88;
		box-shadow:
			0 0 25px rgba(0, 255, 136, 0.8),
			0 0 40px rgba(0, 255, 136, 0.4),
			inset 0 0 20px rgba(0, 255, 136, 0.2);
	}

	.failure-stat {
		border-color: #ff0055;
		box-shadow:
			0 0 25px rgba(255, 0, 85, 0.8),
			0 0 40px rgba(255, 0, 85, 0.4),
			inset 0 0 20px rgba(255, 0, 85, 0.2);
	}

	.bonus-stat {
		border-color: #00d9ff;
		box-shadow:
			0 0 25px rgba(0, 217, 255, 0.8),
			0 0 40px rgba(0, 217, 255, 0.4),
			inset 0 0 20px rgba(0, 217, 255, 0.2);
	}

	.success-stat {
		border-color: #ffdd00;
		box-shadow:
			0 0 25px rgba(255, 221, 0, 0.8),
			0 0 40px rgba(255, 221, 0, 0.4),
			inset 0 0 20px rgba(255, 221, 0, 0.2);
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
</style>
