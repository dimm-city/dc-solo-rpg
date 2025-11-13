<script>
	import { gameState } from '$lib/stores/gameStore.svelte.js';

	let { show = false } = $props();

	// Reactive access to game state using $derived
	const tower = $derived(gameState.tower);
	const kingsRevealed = $derived(gameState.kingsRevealed);
	const tokens = $derived(gameState.tokens);
</script>

{#if show}
	<div class="mini-status-hud" data-augmented-ui="tl-clip tr-clip br-clip border">
		<div class="stat" title="Tower (Health)">
			<!-- Heart SVG icon -->
			<svg
				class="icon"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path
					d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
				/>
			</svg>
			<span class="value">{tower}</span>
		</div>
		<div class="stat" title="Kings Revealed">
			<!-- Skull SVG icon -->
			<svg
				class="icon"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="9" cy="12" r="1" />
				<circle cx="15" cy="12" r="1" />
				<path d="M8 20v2h8v-2" />
				<path d="m12.5 17-.5-1-.5 1h1z" />
				<path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" />
			</svg>
			<span class="value">{kingsRevealed}/4</span>
		</div>
		<div class="stat" title="Tokens (Win Condition)">
			<!-- Star SVG icon -->
			<svg
				class="icon"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polygon
					points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
				/>
			</svg>
			<span class="value">{tokens}</span>
		</div>
	</div>
{/if}

<style>
	.mini-status-hud {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;

		/* Augmented UI Configuration */
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 8px;
		--aug-tr: 8px;
		--aug-br: 8px;

		/* Glassmorphism Effect */
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(12px) saturate(180%);
		-webkit-backdrop-filter: blur(12px) saturate(180%);
		border-radius: 0.5rem;
		padding: 0.75rem;

		/* Layout */
		display: flex;
		gap: 1rem;

		/* Glow */
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.5),
			0 0 40px rgba(217, 70, 239, 0.3),
			inset 0 0 15px rgba(0, 255, 255, 0.1);

		/* Font */
		font-size: 0.875rem;
		font-family: 'Courier New', monospace;
		color: white;
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}

	.stat .icon {
		color: rgba(255, 255, 255, 0.7);
		flex-shrink: 0;
	}

	.value {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 8px rgba(0, 255, 255, 0.8),
			0 0 15px rgba(0, 255, 255, 0.4);
	}

	/* Touch-friendly for mobile */
	@media (max-width: 768px) {
		.mini-status-hud {
			top: 0.5rem;
			right: 0.5rem;
			padding: 0.5rem;
			gap: 0.75rem;
			font-size: 0.75rem;
		}

		.stat .icon {
			width: 14px;
			height: 14px;
		}
	}

	/* Extra small screens */
	@media (max-width: 450px) {
		.mini-status-hud {
			top: 0.25rem;
			right: 0.25rem;
			padding: 0.4rem;
			gap: 0.5rem;
			font-size: 0.7rem;
		}

		.stat .icon {
			width: 12px;
			height: 12px;
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.mini-status-hud {
			animation: none !important;
		}
	}
</style>
