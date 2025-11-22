<script>
	/**
	 * DiceReadout - Dice roll display panel
	 *
	 * Displays the last dice roll with:
	 * - Large numerical value
	 * - Binary pips representing the roll
	 * - Modifier state (Lucid/Surreal) with icons
	 *
	 * This component is HIGHLY REUSABLE - can be used in other game screens.
	 *
	 * @component
	 */

	import { gameState } from '../../stores/gameStore.svelte.js';

	let {
		/** Animation delay in seconds */
		animationDelay = 0.35,
		/** Animation duration in seconds */
		animationDuration = 0.75
	} = $props();

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
	const modifierState = $derived.by(() => {
		if (gameState.isLucid) return 'LUCID';
		if (gameState.isSurreal) return 'SURREAL';
		return null;
	});

	const modifierColor = $derived.by(() => {
		if (gameState.isLucid) return '#00ffaa'; // Green for advantage
		if (gameState.isSurreal) return '#ff0066'; // Red for disadvantage
		return null;
	});
</script>

<div
	class="dice-readout slide-down"
	data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
	style="animation-delay: {animationDelay}s; animation-duration: {animationDuration}s"
>
	<div class="dice-label" style="color: {modifierColor}">
		{#if gameState.isLucid}
			<svg
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
				<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
				<polyline points="16 7 22 7 22 13"></polyline>
			</svg>
		{:else if gameState.isSurreal}
			<svg
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
				<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
				<polyline points="16 17 22 17 22 11"></polyline>
			</svg>
		{:else}
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
		{/if}

		LAST ROLL
	</div>

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

<style>
	/* Animation */
	.slide-down {
		animation: slideDown 0.4s linear forwards;
		opacity: 0;
	}

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

	/* Dice pips display */
	.dice-pips {
		display: flex;
		gap: 3px;
		flex-wrap: nowrap;
		justify-content: center;
		min-width: 54px;
		flex-direction: column;
	}

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
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	/* Mobile responsive */
	@media (max-width: 600px) {
		.stat-item {
			width: 100%;
			max-width: 100%;
			min-width: 0;
			padding: 0.25rem 0.5rem;
			gap: 0.25rem;
		}

		.stat-label {
			font-size: 0.625rem;
			min-width: 48px;
			letter-spacing: 0.08em;
		}

		.stat-icon {
			width: 12px;
			height: 12px;
		}

		.dice-grid {
			gap: 2px;
		}

		.dice-pip {
			width: 13px;
			height: 13px;
		}

		.pip-dot {
			width: 4px;
			height: 4px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slide-down {
			animation: none;
			opacity: 1;
		}

		.modifier-state {
			animation: none;
		}

		.dice-pip.active .pip-dot {
			animation: none;
		}
	}
</style>
