<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import HelpIcon from './HelpIcon.svelte';
	import HelpModal from './HelpModal.svelte';
	import { innerWidth } from 'svelte/reactivity/window';

	const successPercent = $derived(10 - gameState.tokens);
	const bonusPercent = $derived(gameState.bonus);
	const failurePercent = $derived(gameState.kingsRevealed);

	// Cards progress tracking
	const cardsDrawn = $derived(gameState.cardsDrawn || 0);
	const totalCards = 52;
	const progressPercent = $derived((cardsDrawn / totalCards) * 100);

	// Help modal state
	let showHelp = $state(null);

	// Token visualization - create array of token states
	const tokenStates = $derived(
		Array.from({ length: 10 }, (_, i) => ({
			index: i,
			active: i < successPercent
		}))
	);

	// Reactive screen width tracking
	const isMobile = $derived((innerWidth.current ?? 1024) <= 600);

	// Reactive data-augmented-ui attribute for failure stat
	const failureAugmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tr-clip-x border' : 'l-rect tr-clip br-clip-x border'
	);

	// Reactive data-augmented-ui attribute for health stat
	const healthAugmentedUI = $derived(
		isMobile ? 'tl-clip tr-clip br-clip-x border' : 'tl-clip tr-clip-x br-clip-x border'
	);

	// Reactive data-augmented-ui attribute for luck stat
	const luckAugmentedUI = $derived(
		isMobile ? 'tr-clip tl-clip bl-clip-x border' : 'tl-clip-y l-rect-y tr-clip-x br-clip-x border'
	);

	// Reactive data-augmented-ui attribute for success stat
	const successAugmentedUI = $derived(
		isMobile ? 'bl-clip br-clip tl-clip-x border' : 'tl-2-clip-x tr-2-clip-x border'
	);
</script>

<div class="status-display-container">
	<!-- Player and Round Info Bar with Augmented UI -->
	<div
		class="player-round-bar slide-down"
		data-augmented-ui="tl-clip-x tr-2-clip-x br-clip bl-2-clip-x border"
		style="animation-delay: 0.3s"
	>
		<div class="info-segment">
			<span class="label">PLAYER</span>
			<span class="value">{gameState.player.name.toUpperCase()}</span>
		</div>
		<div>
			<h5>{gameState.config?.title}</h5>
		</div>
		<div class="info-segment">
			<div>
				<span class="value">{gameState?.round}</span>
				<span class="label">{gameState.config?.labels.statusDisplayRoundText ?? 'ROUND'}</span>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div>
			<div
				class="stat-item health-stat slide-down"
				data-augmented-ui={healthAugmentedUI}
				style="animation-delay: 0.2s"
			>
				<div class="stat-label">
					<svg
						class="stat-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
						/>
						<path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
					</svg>
					HEALTH
					<HelpIcon onclick={() => (showHelp = 'tower')} ariaLabel="Help: What is Health?" />
				</div>
				<div class="stat-value">
					<span class="current">{gameState.tower}</span><span class="divider">/</span><span
						class="max">100</span
					>
				</div>
				<div class="stat-bar">
					<div class="stat-fill health-fill" style="width: {gameState.tower}%"></div>
				</div>
			</div>

			<div class="stat-item failure-stat slide-down" data-augmented-ui={failureAugmentedUI}>
				<div class="stat-label">
					<svg
						class="stat-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="m12.5 17-.5-1-.5 1h1z" />
						<path
							d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"
						/>
						<circle cx="15" cy="12" r="1" />
						<circle cx="9" cy="12" r="1" />
					</svg>
					{gameState.config?.labels?.failureCounters?.toUpperCase() ?? 'FAILURE'}
					<HelpIcon onclick={() => (showHelp = 'kings')} ariaLabel="Help: What are Kings?" />
				</div>
				<div class="stat-value">
					<span class="current">{failurePercent}</span><span class="divider">/</span><span
						class="max">4</span
					>
				</div>
				<div class="stat-bar">
					<div class="stat-fill failure-fill" style="width: {(failurePercent / 4) * 100}%"></div>
				</div>
			</div>
		</div>
		<div>
			<div
				class="dice-readout slide-down"
				data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
				style="animation-delay: 1.25s"
			>
				<div class="dice-label">
					<svg
						class="dice-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
						<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
						<path d="M6 18h.01" />
						<path d="M10 14h.01" />
						<path d="M15 6h.01" />
						<path d="M18 9h.01" />
					</svg>
					LAST ROLL
				</div>
				<div class="dice-value">{gameState.diceRoll}</div>
				<div class="dice-pips">
					{#each Array(gameState.diceRoll) as _, i (i)}
						<span class="pip"></span>
					{/each}
				</div>
			</div>
		</div>
		<div>
			<div class="stat-item bonus-stat slide-down" data-augmented-ui={luckAugmentedUI}>
				<div class="stat-label">
					<svg
						class="stat-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path
							d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"
						/>
						<path d="M20 2v4" />
						<path d="M22 4h-4" />
						<circle cx="4" cy="20" r="2" />
					</svg>
					LUCK
					<HelpIcon onclick={() => (showHelp = 'bonus')} ariaLabel="Help: What is Luck?" />
				</div>
				<div class="stat-value">
					<span class="current">{bonusPercent}</span><span class="divider">/</span><span class="max"
						>4</span
					>
				</div>
				<div class="stat-bar">
					<div class="stat-fill bonus-fill" style="width: {(bonusPercent / 4) * 100}%"></div>
				</div>
			</div>

			<div
				class="stat-item success-stat slide-down"
				data-augmented-ui={successAugmentedUI}
				style="animation-delay: 0.5s"
			>
				<div class="stat-label">
					<svg
						class="stat-icon"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
						<path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978" />
						<path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
						<path d="M4 22h16" />
						<path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
						<path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
					</svg>
					{gameState.config?.labels?.successCounters?.toUpperCase() ?? 'SUCCESS'}
					<HelpIcon
						onclick={() => (showHelp = 'tokens')}
						ariaLabel="Help: What are Success Tokens?"
					/>
				</div>
				<div class="token-grid">
					{#each tokenStates as token (token.index)}
						<div
							class="token-shape"
							class:active={token.active}
							class:disabled={!token.active}
							style="--token-index: {token.index}"
						>
							<div class="token-inner"></div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Cards Remaining Progress Tracker -->
	{#if cardsDrawn > 0}
		<div
			class="progress-tracker slide-down"
			data-augmented-ui={successAugmentedUI}
			style="animation-delay: 0.5s"
		>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progressPercent}%"></div>
			</div>
			<div class="progress-text">
				<span class="drawn">{cardsDrawn}</span>
				<span class="separator">/</span>
				<span class="total">{totalCards}</span>
				<span class="label">CARDS DRAWN</span>
			</div>
		</div>
	{/if}
</div>

<!-- Help Modal -->
<HelpModal isOpen={showHelp !== null} helpKey={showHelp} onClose={() => (showHelp = null)} />

<style>
	.status-display-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: visible;
	}

	/* Slide Down Animation */
	@keyframes slideDown {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.slide-down {
		animation: slideDown 0.5s ease-in forwards;
		opacity: 0;
	}

	/* Slide Down Animation */
	@keyframes slideDownAndLeft {
		0% {
			transform: translateY(-100%) translateX(100px);
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		50% {
			transform: translateY(0) translateX(100px);
			opacity: 1;
		}
		100% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
	}
	/* Slide Down Animation */
	@keyframes slideDownAndRight {
		0% {
			transform: translateY(-100%) translateX(-100px);
			opacity: 0;
		}
		25% {
			opacity: 1;
		}
		50% {
			transform: translateY(0) translateX(-100px);
			opacity: 1;
		}
		100% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
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
		display: grid;
		align-items: center;
		grid-template-columns: 1fr auto 1fr;
		padding-inline: var(--space-md);
		padding-block: var(--space-sm);
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
		gap: 0.5rem;
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

	.info-segment:last-of-type {
		display: flex;
		justify-content: flex-end;
		& > div {
			display: flex;
			flex-direction: column;
			gap: 0;
		}
	}
	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-sm);
		width: stretch;
		& > div {
			display: flex;
			flex-direction: row;
		}
		& > div:nth-of-type(2) {
			justify-content: center;
		}
		& > div:last-of-type {
			justify-content: flex-end;
		}
	}

	.stat-item {
		/* Augmented UI Base Configuration */
		--aug-border-all: 2px;

		width: min-content;
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
		--aug-tl: 8px; /* Gentle entry */
		--aug-tr: 14px; /* Strong tab → connects to Failure */
		--aug-br: 14px; /* Strong tab → connects to Bonus (mobile) */

		/* Right side rectangle extension - creates puzzle tab */
		--aug-r-extend1: 30px;
		--aug-r-inset1: 12px;

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
		/* Augmented UI Configuration - Receiver with matching inset */
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 14px; /* Slot ← receives Health's tab */
		--aug-tr: 8px; /* Gentle transition */
		--aug-br: 14px; /* Strong tab → connects to Success (mobile) */

		/* Left side rectangle inset - receives puzzle tab from health */
		/* Match health's right extension for perfect fit */
		--aug-l-extend1: 20px;
		--aug-l-inset1: 10px;
		margin-inline-start: -28px;
		padding-inline-start: var(--space-xl);
		/* Enhanced Glow - animation removed */
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.6),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(217, 70, 239, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.failure-stat.slide-down {
		animation-delay: 0.35s;
		animation-duration: 1s;
		animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
		animation-name: slideDownAndLeft;
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
		--aug-tr: 12px; /* Strong tab → connects to Success */
		--aug-br: 8px; /* Gentle terminus */
		padding: var(--space-sm);
		padding-left: var(--space-md);
		/* Enhanced Glow - animation removed */
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.6),
			0 0 40px rgba(255, 215, 0, 0.3),
			inset 0 0 15px rgba(255, 215, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.bonus-stat.slide-down {
		animation-name: slideDownAndRight;
		animation-delay: 1s;
		animation-timing-function: ease-in;
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
		--aug-tl: 6px; /* Slot ← receives Bonus's tab (desktop) OR Failure's tab (mobile) */
		--aug-tr: 8px; /* Gentle endpoint */
		--aug-br: 4px; /* Gentle terminus */
		--aug-bl: 4px; /* Visual anchor */

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
		/* Display help icon inline */
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-icon {
		flex-shrink: 0;
		display: inline-block;
		vertical-align: middle;
		filter: drop-shadow(0 0 4px currentColor);
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

	/* Digital Dice Readout */
	.dice-readout {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 6px;
		--aug-tr: 6px;
		--aug-br: 6px;
		--aug-bl: 6px;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm);
		aspect-ratio: 1;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.8));
		backdrop-filter: blur(10px) saturate(150%);
		-webkit-backdrop-filter: blur(10px) saturate(150%);

		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 20px rgba(0, 255, 255, 0.15);
	}

	.dice-label {
		font-size: var(--text-xs);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: 'Courier New', monospace;
		color: #00eeff;
		text-shadow:
			0 0 10px rgba(0, 238, 255, 1),
			0 0 20px rgba(0, 238, 255, 0.6);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.dice-icon {
		flex-shrink: 0;
		display: inline-block;
		vertical-align: middle;
		filter: drop-shadow(0 0 4px currentColor);
	}

	.dice-value {
		font-size: 2rem;
		font-weight: 900;
		font-family: 'Courier New', monospace;
		color: #ffee00;
		text-shadow:
			0 0 15px rgba(255, 238, 0, 1),
			0 0 30px rgba(255, 238, 0, 0.6),
			0 0 45px rgba(255, 238, 0, 0.3);
		line-height: 1;
	}

	.dice-pips {
		display: flex;
		gap: 3px;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 60px;
	}

	.pip {
		width: 6px;
		height: 6px;
		background: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		border-radius: 50%;
		box-shadow:
			0 0 5px rgba(0, 255, 255, 0.8),
			0 0 10px rgba(217, 70, 239, 0.4);
		animation: pip-pulse 2s ease-in-out infinite;
	}

	@keyframes pip-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(0.9);
		}
	}

	/* Token Grid */
	.token-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: var(--space-xs);
		padding: var(--space-xs);
	}

	.token-shape {
		width: 20px;
		height: 20px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.token-inner {
		width: 100%;
		height: 100%;
		clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
		transition: all 0.3s ease;
	}

	.token-shape.active .token-inner {
		background: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		box-shadow:
			0 0 10px rgba(255, 238, 0, 0.8),
			0 0 20px rgba(0, 255, 255, 0.4);
		animation: token-glow 2s ease-in-out infinite;
	}

	.token-shape.disabled .token-inner {
		background: rgba(100, 100, 100, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	@keyframes token-glow {
		0%,
		100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.3);
		}
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

		.dice-value {
			font-size: 1.5rem;
		}

		.token-shape {
			width: 16px;
			height: 16px;
		}
	}

	/* Mobile - Grid areas layout with dice in center */
	@media (max-width: 600px) {
		.stats-grid {
			/* Grid with 3 columns: left stats, center dice, right stats */
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			grid-template-rows: auto auto;
			grid-template-areas:
				'health dice luck'
				'failure dice success';
			gap: var(--space-xs);
		}

		/* Position first column (Health + Failure) */
		.stats-grid > div:first-of-type {
			grid-column: 1;
			grid-row: 1 / 3;
			display: flex;
			flex-direction: column;
			gap: var(--space-xs);
			align-items: flex-end;
		}

		/* Position Dice Readout in center spanning both rows */
		.stats-grid > div:nth-of-type(2) {
			grid-column: 2;
			grid-row: 1 / 3;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0 var(--space-xs);
		}

		.dice-readout {
			min-width: 60px;
			padding: var(--space-xs) var(--space-sm);
			justify-content: center;
			aspect-ratio: 16/9;
		}

		.dice-label {
			font-size: 0.6rem;
			display: none;
		}
		.dice-value {
			font-size: 1.25rem;
			display: none;
		}

		.pip {
			width: 6px;
			height: 6px;
		}

		.dice-pips {
			max-width: 50px;
			gap: 3px;
		}

		/* Position third column (Bonus + Success) */
		.stats-grid > div:last-of-type {
			grid-column: 3;
			grid-row: 1 / 3;
			display: flex;
			flex-direction: column;
			gap: var(--space-xs);
		}

		.stat-item {
			padding: var(--space-xs) var(--space-sm);
			min-height: 44px;
			gap: 4px;
			min-width: 135px;
			width: min-content;
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
			font-size: 1.85rem;
		}

		.stat-value .divider {
			font-size: 0.65rem;
		}

		.stat-value .max {
			font-size: 0.6rem;
		}

		/* Hide progress bars and labels on mobile for compact layout */
		.stat-bar {
			display: none;
		}

		.stat-label {
			font-size: 0; /* Hide text but keep icons */
			gap: 0;
			min-width: auto;
		}

		.stat-icon {
			font-size: 1rem; /* Reset font-size for icons to show them */
			width: 20px;
			height: 20px;
		}

		/* Hide help icons on mobile */
		.stat-label :global(button) {
			display: none;
		}

		.info-segment {
			gap: var(--space-xs);
		}

		.info-segment:first-of-type {
			flex-direction: column-reverse;
		}
		.info-segment .label {
			font-size: 0.7rem;
		}

		.info-segment .value {
			font-size: 0.8rem;
		}

		.player-round-bar {
			padding: var(--space-md);
			gap: var(--space-sm);
			flex-wrap: wrap;
		}

		.player-round-bar h5 {
			font-size: 0.8rem;
			max-width: 150px;
			max-height: 3.6em; /* ~3 lines */
			overflow: hidden;
			text-wrap: balance;
			line-height: 1.2;
			text-align: center;
		}

		/* Mobile Puzzle Piece Interlocking - Horizontal only */
		/* Health: Top-left - extends right to Failure */
		.health-stat {
			--aug-r-extend1: 20px;
			--aug-r-inset1: 8px;

			--aug-br: 12px; /* Slot ← receives Bonus's tab (desktop) OR Failure's tab (mobile) */
			--aug-tl: 8px; /* Gentle endpoint */
			--aug-bl: unset; /* Gentle terminus */
			--aug-tr: unset; /* Visual anchor */
		}

		/* Failure: Top-right - receives left from Health */
		.failure-stat {
			--aug-l-extend1: 20px;
			--aug-l-inset1: 8px;
			margin-inline-start: 0;
			padding-inline-start: calc(var(--space-md) + var(--space-xs));
		}

		/* Bonus: Bottom-left - extends right to Success */
		.bonus-stat {
			--aug-bl: 12px; /* Slot ← receives Bonus's tab (desktop) OR Failure's tab (mobile) */
			--aug-tr: 8px; /* Gentle endpoint */
			--aug-br: unset; /* Gentle terminus */
			--aug-tl: unset; /* Visual anchor */
			padding-inline-start: var(--space-sm);
			display: flex;
			flex-direction: row-reverse;
			.stat-value{
				flex-direction: row-reverse;
			}
			.stat-label {
				padding-inline-start: var(--space-lg);
			}
		}

		/* Success: Bottom-right - receives left from Bonus */
		.success-stat {
			margin-inline-start: 0;
			padding-inline-start: calc(var(--space-md) + var(--space-xs));
			display: flex;
			flex-direction: row-reverse;
			--aug-tl: 12px; /* Slot ← receives Bonus's tab (desktop) OR Failure's tab (mobile) */
			--aug-tr: 8px; /* Gentle endpoint */
			--aug-br: unset; /* Gentle terminus */
			--aug-bl: unset; /* Visual anchor */
		}

		.token-grid {
			grid-template-columns: repeat(5, 1fr);
			gap: 2px;
			padding: var(--space-xs);
		}

		.token-shape {
			width: 12px;
			height: 12px;
		}
	}

	/* Progress Tracker Styles */
	.progress-tracker {
		/* Augmented UI Configuration */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 12px;
		--aug-tr: 12px;

		width: 100%;
		padding: var(--space-sm);
		display: flex;
		align-items: center;
		gap: var(--space-sm);

		/* Glassmorphism Effect */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.7), rgba(15, 15, 25, 0.6));
		backdrop-filter: blur(8px) saturate(140%);
		-webkit-backdrop-filter: blur(8px) saturate(140%);

		/* Glow */
		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.4),
			0 0 30px rgba(217, 70, 239, 0.2),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	.progress-bar {
		flex: 1;
		height: 8px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		transition: width 0.3s ease;
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
		position: relative;
	}

	.progress-text {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		font-family: 'Courier New', monospace;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.progress-text .drawn {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 10px rgba(0, 255, 255, 1),
			0 0 20px rgba(0, 255, 255, 0.6);
	}

	.progress-text .separator {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.5);
		opacity: 0.7;
	}

	.progress-text .total {
		font-size: 1rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
	}

	.progress-text .label {
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-left: var(--space-xs);
	}

	/* Mobile adjustments for progress tracker */
	@media (max-width: 600px) {
		/* Hide progress tracker on mobile */
		.progress-tracker {
			display: none;
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.player-round-bar,
		.health-stat,
		.failure-stat,
		.bonus-stat,
		.success-stat,
		.slide-down,
		.pip,
		.token-shape {
			animation: none !important;
		}

		.stat-fill,
		.progress-fill,
		.token-inner {
			transition: none !important;
		}
	}
</style>
