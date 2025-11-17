<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import { innerWidth } from 'svelte/reactivity/window';
	import DeckVisualization from './DeckVisualization.svelte';
	import DiceThemePicker from './DiceThemePicker.svelte';

	let { onHelpClick, onExitClick } = $props();

	let showDiceThemePicker = $state(false);

	const tokensRemaining = $derived(gameState.tokens);
	const bonusPercent = $derived(gameState.acesRevealed + (gameState.pendingUpdates.aceChange || 0));
	const failurePercent = $derived(
		gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange || 0)
	);

	// Cards progress tracking
	const cardsDrawn = $derived(gameState.cardsDrawn || 0);
	const totalCards = 52;
	const progressPercent = $derived((cardsDrawn / totalCards) * 100);
	const cardsRemaining = $derived(gameState.deck?.length || 0);

	// Token visualization - create array of token states (count down from 10 to 0)
	const tokenStates = $derived(
		Array.from({ length: 10 }, (_, i) => ({
			index: i,
			active: i < tokensRemaining
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

	// Stability gradient - changes based on value (low = red, high = green)
	const stabilityGradient = $derived(() => {
		const stability = gameState.tower;
		if (stability >= 10) {
			// High stability - positive colors (green)
			return 'linear-gradient(90deg, #00ff88, #00cc66)';
		} else {
			// Low stability - warning/danger colors (red/magenta)
			return 'linear-gradient(90deg, #ff0055, #d946ef)';
		}
	});

	const stabilityGlow = $derived(() => {
		const stability = gameState.tower;
		return stability >= 10 ? '#00ff88' : '#ff0055';
	});

	// Dice pips - convert dice roll to 5 pips (dice pattern)
	// Pips are arranged like 5 on a six-sided die: 4 corners + 1 center
	const dicePips = $derived(() => {
		const roll = gameState.diceRoll || 0;
		// Create array of 5 boolean values - which pips are active based on the roll value
		const pips = [false, false, false, false, false];

		// Map d20 roll to pip pattern (0-20 range, using 5-bit binary)
		const binary = roll.toString(2).padStart(5, '0');
		for (let i = 0; i < 5; i++) {
			pips[i] = binary[i] === '1';
		}

		return pips;
	});

	// Modifier state display
	const modifierState = $derived(() => {
		if (gameState.isLucid) return 'LUCID';
		if (gameState.isSurreal) return 'SURREAL';
		return null;
	});

	const modifierColor = $derived(() => {
		if (gameState.isLucid) return '#00ffaa'; // Green for advantage
		if (gameState.isSurreal) return '#ff0066'; // Red for disadvantage
		return null;
	});
</script>

<div class="status-display-container">
	<!-- Player and Round Info Bar with Augmented UI -->
	<div
		class="player-round-bar slide-down"
		data-augmented-ui="tl-2-clip-x tr-2-clip-x br-clip bl-clip border"
		style="animation-delay: 0s; animation-duration: 0.6s"
	>
		<!-- Exit Button on far left -->
		<button class="status-bar-button exit-button" onclick={onExitClick} aria-label="Exit game">
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

		<!-- Dice Theme Picker Button -->
		<button class="status-bar-button dice-theme-button" onclick={() => showDiceThemePicker = true} aria-label="Change dice theme">
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
				<rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
				<path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
				<path d="M6 18h.01" />
				<path d="M10 14h.01" />
				<path d="M15 6h.01" />
				<path d="M18 9h.01" />
			</svg>
		</button>

		<!-- Help Button on far right -->
		<button class="status-bar-button help-button" onclick={onHelpClick} aria-label="Game help">
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
				<circle cx="12" cy="12" r="10" />
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
				<path d="M12 17h.01" />
			</svg>
		</button>
	</div>

	<!-- Dice Theme Picker Modal -->
	<DiceThemePicker bind:isOpen={showDiceThemePicker} />

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div>
			<div
				class="stat-item health-stat slide-down"
				data-augmented-ui={healthAugmentedUI}
				style="animation-delay: 0.15s; animation-duration: 0.7s"
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
					STABILITY
				</div>
				<div class="stat-bar stability-bar">
					<div
						class="stat-fill stability-fill"
						style="width: {(gameState.tower / 20) * 100}%; background: {stabilityGradient()}; box-shadow: 0 0 10px {stabilityGlow()}"
					></div>
				</div>
			</div>

			<div
				class="stat-item failure-stat slide-down"
				data-augmented-ui={failureAugmentedUI}
				style="animation-delay: 0.25s; animation-duration: 0.85s"
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
						<path d="m12.5 17-.5-1-.5 1h1z" />
						<path
							d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"
						/>
						<circle cx="15" cy="12" r="1" />
						<circle cx="9" cy="12" r="1" />
					</svg>
					{gameState.config?.labels?.failureCounters?.toUpperCase() ?? 'FAILURE'}
				</div>
				<div class="king-indicators">
					{#each Array(4) as _, i (i)}
						<div class="king-icon" class:revealed={i < failurePercent}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path
									d="M2 20h20v-4a6 6 0 0 0-12 0v4zm0 0v-4a6 6 0 1 1 12 0v4zM12 2v4m-4-2 4 2 4-2"
								/>
							</svg>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div>
			<div
				class="dice-readout slide-down"
				data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
				style="animation-delay: 0.35s; animation-duration: 0.75s"
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
				{#if modifierState()}
					<div class="modifier-state" style="color: {modifierColor()}">
						{#if gameState.isLucid}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
								<polyline points="16 7 22 7 22 13"></polyline>
							</svg>
						{:else if gameState.isSurreal}
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
								<polyline points="16 17 22 17 22 11"></polyline>
							</svg>
						{/if}
					</div>
				{/if}
				<div class="dice-value">{gameState.diceRoll}</div>
				<div class="dice-pips">
					<!-- Top row -->
					<div class="pip-row">
						<span class="dice-pip" class:active={dicePips()[0]} style="--pip-delay: 0ms">
							<span class="pip-dot"></span>
						</span>
						<span class="dice-pip" class:active={dicePips()[1]} style="--pip-delay: 150ms">
							<span class="pip-dot"></span>
						</span>
					</div>
					<!-- Center row -->
					<div class="pip-row center-row">
						<span class="dice-pip center-pip" class:active={dicePips()[2]} style="--pip-delay: 300ms">
							<span class="pip-dot"></span>
						</span>
					</div>
					<!-- Bottom row -->
					<div class="pip-row">
						<span class="dice-pip" class:active={dicePips()[3]} style="--pip-delay: 450ms">
							<span class="pip-dot"></span>
						</span>
						<span class="dice-pip" class:active={dicePips()[4]} style="--pip-delay: 600ms">
							<span class="pip-dot"></span>
						</span>
					</div>
				</div>
			</div>

			<div
				class="deck-readout slide-down"
				data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
				style="animation-delay: 0.45s; animation-duration: 0.75s"
			>
				<div class="deck-label">
					<svg
						class="deck-icon"
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
						<path d="M12 2v20M2 12h20" />
						<rect x="4" y="4" width="16" height="16" rx="2" />
					</svg>
					CARDS LEFT
				</div>
				<DeckVisualization />
				<!-- <div class="deck-value">{cardsRemaining}</div>
				<div class="deck-stack">
					{#each Array(Math.min(cardsRemaining, 5)) as _, i (i)}
						<div class="card-layer" style="--layer-index: {i}"></div>
					{/each}
				</div> -->
			</div>
		</div>
		<div>
			<div
				class="stat-item bonus-stat slide-down"
				data-augmented-ui={luckAugmentedUI}
				style="animation-delay: 0.55s; animation-duration: 0.85s"
			>
				<div class="stat-label">
					ABILITIES
				</div>
				<div class="ability-icons">
					<!-- Sparkles - Luck/Fortune -->
					<svg class="ability-icon" class:active={bonusPercent >= 1} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
					</svg>
					<!-- Shield - Protection/Defense -->
					<svg class="ability-icon" class:active={bonusPercent >= 2} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
					</svg>
					<!-- Heart - Health/Resilience -->
					<svg class="ability-icon" class:active={bonusPercent >= 3} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
					</svg>
					<!-- Zap - Energy/Action -->
					<svg class="ability-icon" class:active={bonusPercent >= 4} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
					</svg>
				</div>
				<!-- <div class="stat-value">
					<span class="current">{bonusPercent}</span><span class="divider">/</span><span class="max"
						>4</span
					>
				</div> -->
				<div class="stat-bar">
					<div class="stat-fill bonus-fill" style="width: {(bonusPercent / 4) * 100}%"></div>
				</div>
			</div>

			<div
				class="stat-item success-stat slide-down"
				data-augmented-ui={successAugmentedUI}
				style="animation-delay: 0.65s; animation-duration: 0.75s"
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
			style="animation-delay: 0.75s; animation-duration: 0.7s"
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

<style>
	.status-display-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: visible;
	}

	/* Mechanical Assembly Animation - Step 1: Linear drop */
	@keyframes slideDown {
		0% {
			transform: translateY(-100%);
			opacity: 0;
		}
		100% {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.slide-down {
		animation: slideDown 0.4s linear forwards;
		opacity: 0;
	}

	/* Mechanical Assembly - Step 1: Linear drop, Step 2: Ease left into slot */
	@keyframes slideDownAndLeft {
		0% {
			transform: translateY(-100%) translateX(0);
			opacity: 0;
		}
		45% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
		45.01% {
			transform: translateY(0) translateX(50px);
		}
		100% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
	}

	/* Mechanical Assembly - Step 1: Linear drop, Step 2: Ease right into slot */
	@keyframes slideDownAndRight {
		0% {
			transform: translateY(-100%) translateX(0);
			opacity: 0;
		}
		45% {
			transform: translateY(0) translateX(0);
			opacity: 1;
		}
		45.01% {
			transform: translateY(0) translateX(-50px);
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

		/* Layout with buttons on both ends + dice theme picker */
		display: grid;
		align-items: center;
		grid-template-columns: auto 1fr auto 1fr auto auto;
		gap: var(--space-sm);
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

	/* Status Bar Buttons */
	.status-bar-button {
		background: transparent;
		border: none;
		color: #00eeff;
		cursor: pointer;
		padding: var(--space-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: all 0.2s ease;
		position: relative;
	}

	.status-bar-button:hover {
		color: #fff;
		background: rgba(0, 238, 255, 0.1);
		box-shadow: 0 0 10px rgba(0, 238, 255, 0.3);
	}

	.status-bar-button:active {
		transform: scale(0.95);
	}

	.status-bar-button svg {
		filter: drop-shadow(0 0 4px currentColor);
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
		justify-content: center;
	}

	.info-segment:first-of-type {
		display: flex;
		flex-direction: column;
		gap: 0;
		justify-content: center;
		align-items: center;
	}

	.info-segment .label {
		font-size: var(--text-xs);
		font-weight: 900; /* Increased weight for better readability */
		color: #00ffff; /* Pure cyan for better contrast */
		text-shadow:
			0 0 12px rgba(0, 255, 255, 1),
			0 0 24px rgba(0, 255, 255, 0.7),
			0 1px 2px rgba(0, 0, 0, 0.9); /* Dark outline for contrast */
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
		
		& > div {
			display: flex;
			flex-direction: column;
			align-items: center;
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
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		position: relative;
		overflow: visible;
		min-height: 36px;

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

		/* PRIMARY importance - Enhanced Glow */
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(0, 255, 255, 0.25),
			inset 0 0 15px rgba(0, 255, 255, 0.12),
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
		--aug-l-extend1: 40px;
		--aug-l-inset1: 10px;

		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-inline-start: -30px;
		padding-inline-start: 2rem;
		/* SECONDARY importance - Reduced Glow */
		box-shadow:
			0 0 12px rgba(217, 70, 239, 0.4),
			0 0 24px rgba(217, 70, 239, 0.2),
			inset 0 0 10px rgba(217, 70, 239, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.failure-stat.slide-down {
		animation-name: slideDownAndLeft;
		animation-timing-function: linear;
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
		padding: 0.375rem;
		padding-left: 0.75rem;
		/* TERTIARY importance - Subtle Glow */
		box-shadow:
			0 0 8px rgba(255, 215, 0, 0.3),
			0 0 16px rgba(255, 215, 0, 0.15),
			inset 0 0 8px rgba(255, 215, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.bonus-stat.slide-down {
		animation-name: slideDownAndRight;
		animation-timing-function: linear;
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

		padding: 0.5rem;
		/* SECONDARY importance - Reduced Glow */
		box-shadow:
			0 0 12px rgba(0, 255, 255, 0.4),
			0 0 24px rgba(0, 255, 255, 0.2),
			inset 0 0 10px rgba(0, 255, 255, 0.1),
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
		font-size: 0.75rem; /* 12px - compact for desktop */
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-family: 'Courier New', monospace;
		opacity: 1; /* Remove opacity, rely on color/shadow for hierarchy */
		text-align: left;
		align-self: center;
		flex: 0 0 auto;
		white-space: nowrap;
		min-width: 58px;
		/* Add padding to avoid clip zones */
		padding-left: 2px;
		/* Display help icon inline */
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}

	.stat-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		display: inline-block;
		vertical-align: middle;
		filter: drop-shadow(0 0 3px currentColor);
	}

	.health-stat .stat-label {
		color: #00ffaa;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	.failure-stat .stat-label {
		color: #ff0066;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	.bonus-stat .stat-label {
		color: #00eeff;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	.success-stat .stat-label {
		color: #ffee00;
		text-shadow:
			0 0 12px currentColor,
			0 0 24px currentColor,
			0 1px 2px rgba(0, 0, 0, 0.8); /* Add dark shadow for contrast */
	}

	.stat-value {
		font-size: 0.875rem;
		font-weight: bold;
		font-family: 'Courier New', monospace;
		color: #fff;
		text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
		line-height: 1;
		display: flex;
		align-items: baseline;
		align-self: center;
		gap: 0.1rem;
		justify-content: center;
		flex: 0 0 auto;
		white-space: nowrap;
		min-width: 45px;
	}

	.stat-value .current {
		font-size: 0.95rem;
	}

	.stat-value .divider {
		font-size: 0.65rem;
		opacity: 0.7;
	}

	.stat-value .max {
		font-size: 0.65rem;
		opacity: 0.9;
		font-weight: 600;
	}

	/* Stat Bars */
	.stat-bar {
		height: 5px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.2);
		position: relative;
		overflow: hidden;
		align-self: center;
		flex: 1 1 auto;
		min-width: 35px;
		border-radius: 2px;
		/* Add margin to avoid clip zones */
		margin-right: 2px;
	}

	@keyframes fillBarGrow {
		from {
			width: 0;
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.stat-fill {
		height: 100%;
		transition: width 0.3s linear;
		position: relative;
		box-shadow: 0 0 10px currentColor;
		animation: fillBarGrow 0.5s linear forwards;
	}

	/* Stability bar - larger since no stat value */
	.stability-bar {
		height: 12px;
		flex: 1 1 auto;
		min-width: 80px;
	}

	/* Stability fill - gradient and glow set via inline styles (reactive) */
	.stability-fill {
		transition: all 0.3s ease;
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

	/* King Indicators for Failure Stat */
	.king-indicators {
		display: flex;
		gap: 3px;
		align-items: center;
		justify-content: center;
		flex: 0 0 auto;
		padding: 2px;
	}

	.king-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s linear;
		opacity: 0.2;
	}

	.king-icon svg {
		width: 100%;
		height: 100%;
		stroke: #ff0066;
		filter: drop-shadow(0 0 2px rgba(255, 0, 102, 0.3));
	}

	.king-icon.revealed {
		opacity: 1;
		filter: grayscale(0);
		animation: kingReveal 0.2s linear forwards;
	}

	.king-icon.revealed svg {
		stroke: #ff0066;
		filter: drop-shadow(0 0 6px rgba(255, 0, 102, 0.9));
	}

	@keyframes kingReveal {
		0% {
			transform: scale(0.7);
			opacity: 0.2;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
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
		justify-content: space-between;
		gap: var(--space-xs);
		padding: var(--space-sm);
		min-width: 90px;
		min-height: 100px;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.8));
		backdrop-filter: blur(10px) saturate(150%);
		-webkit-backdrop-filter: blur(10px) saturate(150%);

		/* TERTIARY importance - Subtle Glow */
		box-shadow:
			0 0 8px rgba(0, 255, 255, 0.3),
			0 0 16px rgba(217, 70, 239, 0.15),
			inset 0 0 8px rgba(0, 255, 255, 0.08);
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

	/* Modifier state indicator */
	.modifier-state {
		font-size: var(--text-xs);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		font-family: 'Courier New', monospace;
		text-shadow:
			0 0 10px currentColor,
			0 0 20px currentColor;
		animation: modifier-pulse 1s ease-in-out infinite;
	}

	@keyframes modifier-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
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

	/* Binary pips container */
	.binary-pips {
		display: flex;
		gap: 4px;
		justify-content: center;
		align-items: center;
	}

	/* Binary pip - box shape with inner fill */
	.binary-pip {
		width: 10px;
		height: 10px;
		border: 1px solid rgba(0, 255, 255, 0.4);
		border-radius: 2px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.2s ease;
		animation: binary-pip-in 0.2s ease-out backwards;
		animation-delay: calc(0.5s + var(--pip-index, 0) * 0.05s);
	}

	.binary-pip:nth-child(1) {
		--pip-index: 0;
	}
	.binary-pip:nth-child(2) {
		--pip-index: 1;
	}
	.binary-pip:nth-child(3) {
		--pip-index: 2;
	}
	.binary-pip:nth-child(4) {
		--pip-index: 3;
	}
	.binary-pip:nth-child(5) {
		--pip-index: 4;
	}

	@keyframes binary-pip-in {
		0% {
			opacity: 0;
			transform: scale(0.5);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Inner fill for active bits (1) */
	.pip-inner {
		width: 6px;
		height: 6px;
		border-radius: 1px;
		background: transparent;
		transition: all 0.2s ease;
	}

	.binary-pip.active {
		border-color: rgba(0, 255, 255, 1);
		box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
	}

	.binary-pip.active .pip-inner {
		background: linear-gradient(135deg, #00eeff, #d946ef);
		box-shadow:
			0 0 5px rgba(0, 255, 255, 0.8),
			inset 0 0 3px rgba(255, 255, 255, 0.4);
		animation: binary-glow 2s ease-in-out infinite;
	}

	@keyframes binary-glow {
		0%,
		100% {
			filter: brightness(1);
		}
		50% {
			filter: brightness(1.3);
		}
	}

	/* Legacy decimal pips (keep for compatibility if needed elsewhere) */
	.dice-pips {
		display: flex;
		gap: 3px;
		flex-wrap: nowrap;
		justify-content: center;
		min-width: 54px;
	}

	@keyframes pipPopIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.pip {
		width: 6px;
		height: 6px;
		background: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		border-radius: 50%;
		box-shadow:
			0 0 5px rgba(0, 255, 255, 0.8),
			0 0 10px rgba(217, 70, 239, 0.4);
		animation:
			pipPopIn 0.15s linear 0.5s backwards,
			pip-pulse 2s ease-in-out 1s infinite;
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

	/* Deck Readout */
	.deck-readout {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		--aug-tl: 6px;
		--aug-tr: 6px;
		--aug-br: 6px;
		--aug-bl: 6px;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm);
		min-width: 90px;
		height: 100px;

		background: linear-gradient(135deg, rgba(10, 10, 20, 0.9), rgba(15, 15, 25, 0.8));
		backdrop-filter: blur(10px) saturate(150%);
		-webkit-backdrop-filter: blur(10px) saturate(150%);

		/* TERTIARY importance - Subtle Glow */
		box-shadow:
			0 0 8px rgba(255, 215, 0, 0.3),
			0 0 16px rgba(0, 255, 255, 0.15),
			inset 0 0 8px rgba(255, 215, 0, 0.08);
	}

	.deck-label {
		font-size: var(--text-xs);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: 'Courier New', monospace;
		color: #ffd700;
		text-shadow:
			0 0 10px rgba(255, 215, 0, 1),
			0 0 20px rgba(255, 215, 0, 0.6);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.deck-icon {
		flex-shrink: 0;
		display: inline-block;
		vertical-align: middle;
		filter: drop-shadow(0 0 4px currentColor);
	}

	/* Token Grid */
	.token-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.25rem;
		padding: 0.25rem;
	}

	@keyframes tokenPopIn {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.token-shape {
		width: 16px;
		height: 16px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s linear;
		animation: tokenPopIn 0.15s linear forwards;
		animation-delay: calc(0.7s + var(--token-index) * 0.03s);
		opacity: 0;
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

		.dice-readout {
			min-width: 85px;
			min-height: 90px;
		}

		.dice-value {
			font-size: 1.5rem;
		}

		.deck-readout {
			min-width: 85px;
			min-height: 90px;
		}

		.token-shape {
			width: 16px;
			height: 16px;
		}
	}

	/* Mobile - Simple 2x3 Grid Layout */
	@media (max-width: 600px) {
		.stats-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto auto;
			gap: var(--space-xs);
			width: 100%;
		}

		/* Reset all column positioning to auto-flow */
		.stats-grid > div {
			display: contents;
		}

		/* Row 1: Health, Dice, Bonus */
		.health-stat {
			grid-column: 1;
			grid-row: 1;
		}

		.dice-readout {
			grid-column: 2;
			grid-row: 1;
		}

		.bonus-stat {
			grid-column: 3;
			grid-row: 1;
		}

		/* Row 2: Failure, Deck, Success */
		.failure-stat {
			grid-column: 1;
			grid-row: 2;
		}

		.deck-readout {
			grid-column: 2;
			grid-row: 2;
		}

		.success-stat {
			grid-column: 3;
			grid-row: 2;
		}

		/* Compact stat items for mobile */
		.stat-item {
			padding: 4px;
			min-height: auto;
			gap: 1px;
			min-width: auto;
			width: 100%;
			flex-direction: column;
			align-items: center;
			justify-content: space-between;
		}

		/* Dice and deck - compact vertical layout */
		.dice-readout,
		.deck-readout {
			min-width: auto;
			width: 100%;
			min-height: auto;
			padding: 4px;
			gap: 1px;
		}

		.dice-label,
		.deck-label {
			font-size: 0.55rem;
			text-align: center;
		}

		.dice-value {
			font-size: 1rem;
		}

		.pip {
			width: 4px;
			height: 4px;
		}

		.dice-pips {
			min-width: auto;
			gap: 2px;
			flex-wrap: wrap;
			max-width: 40px;
		}

		.stat-label {
			font-size: 0.6rem;
			min-width: auto;
			letter-spacing: 0.05em;
			gap: 2px;
			text-align: center;
			white-space: nowrap;
		}

		.stat-icon {
			width: 12px;
			height: 12px;
		}

		.stat-value {
			font-size: 0.7rem;
			min-width: auto;
			text-align: center;
		}

		.stat-value .current {
			font-size: 1.1rem;
		}

		.stat-value .divider {
			font-size: 0.55rem;
		}

		.stat-value .max {
			font-size: 0.55rem;
		}

		/* Compact stat bars for mobile */
		.stat-bar {
			height: 2px;
			min-width: 100%;
			width: 100%;
			border-radius: 1px;
			margin: 0;
			margin-top: 1px;
		}

		/* Hide help icons on mobile */
		.stat-label :global(button) {
			display: none;
		}

		.info-segment {
			gap: 2px;
			justify-content: center;
		}

		.info-segment:first-of-type {
			flex-direction: column;
			margin-inline-start: var(--space-md);
			justify-content: center;
		}

		.info-segment .label {
			font-size: 0.6rem;
		}

		.info-segment .value {
			font-size: 0.7rem;
		}

		.player-round-bar {
			padding: var(--space-sm) var(--space-md);
			gap: 4px;
			grid-template-columns: auto 1fr auto 1fr auto auto;
			font-size: 0.75rem;
		}

		.player-round-bar h5 {
			font-size: 0.7rem;
			max-width: 120px;
			overflow: hidden;
			text-wrap: balance;
			line-height: 1.3;
			text-align: center;
			margin: 0;
		}

		.status-bar-button {
			padding: 0;
			margin-top: var(--space-md);
		}

		.status-bar-button svg {
			width: 18px;
			height: 18px;
		}

	

		/* Reset augmented-ui settings for compact mobile layout */
		.health-stat,
		.failure-stat,
		.bonus-stat,
		.success-stat {
			--aug-tl: 6px;
			--aug-tr: 6px;
			--aug-br: 6px;
			--aug-bl: 6px;
			--aug-l-extend1: 0;
			--aug-l-inset1: 0;
			--aug-r-extend1: 0;
			--aug-r-inset1: 0;
			margin-inline-start: 0;
			padding-inline-start: var(--space-xs);
			flex-direction: column;
		}

		.failure-stat {
			justify-content: center;
			gap: 5px;
		}

		/* Compact token grid for mobile */
		.token-grid {
			grid-template-columns: repeat(5, 1fr);
			gap: 1px;
			padding: 1px;
			width: 100%;
			max-width: 100%;
			justify-items: center;
		}

		.token-shape {
			width: 20px;
			height: 20px;
		}

		/* Ensure all stats have consistent height */
		.stat-item,
		.dice-readout,
		.deck-readout {
			min-height: auto;
			height: 100%;
		}

		/* Compact king indicators for mobile */
		.king-indicators {
			gap: 5px;
			padding: 1px;
			width: 100%;
			justify-content: center;
		}

		.king-icon {
			width: 20px;
			height: 20px;
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
		transition: width 0.3s linear;
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
		position: relative;
		animation: fillBarGrow 0.6s linear forwards;
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
			opacity: 1 !important;
		}

		.stat-fill,
		.progress-fill,
		.token-inner {
			transition: none !important;
			animation: none !important;
			opacity: 1 !important;
		}
	}

	/* Dice pips styles */
	.pip-row {
		display: flex;
		gap: 8px;
		justify-content: space-between;
		align-items: center;
	}

	.pip-row.center-row {
		justify-content: center;
	}

	.dice-pip {
		width: 6px;
		height: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		opacity: 0.3;
		transition: opacity 0.3s ease;
	}

	.dice-pip.active {
		opacity: 1;
	}

	.pip-dot {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: transparent;
		border: 1px solid rgba(0, 255, 255, 0.4);
		transition: all 0.3s ease;
	}

	.dice-pip.active .pip-dot {
		background: linear-gradient(135deg, #00eeff, #d946ef);
		border-color: rgba(0, 255, 255, 1);
		box-shadow:
			0 0 6px rgba(0, 255, 255, 0.8),
			inset 0 0 3px rgba(255, 255, 255, 0.4);
		animation: pip-pulse 2s ease-in-out infinite;
		animation-delay: var(--pip-delay, 0ms);
	}

	@keyframes pip-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
			box-shadow:
				0 0 6px rgba(0, 255, 255, 0.8),
				inset 0 0 3px rgba(255, 255, 255, 0.4);
		}
		50% {
			opacity: 0.7;
			transform: scale(0.9);
			box-shadow:
				0 0 4px rgba(0, 255, 255, 0.5),
				inset 0 0 2px rgba(255, 255, 255, 0.2);
		}
	}

	/* Ability icons */
	.ability-icons {
		display: flex;
		gap: 6px;
		justify-content: center;
		align-items: center;
		margin-top: 4px;
	}

	.ability-icon {
		opacity: 0.3;
		transition: all 0.3s ease;
		filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.3));
	}

	.ability-icon.active {
		opacity: 1;
		filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.8));
		animation: ability-glow 2s ease-in-out infinite;
	}

	@keyframes ability-glow {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
