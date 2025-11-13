<script>
	import { onMount } from 'svelte';

	let { show = false } = $props();
	let visible = $state(false);

	onMount(() => {
		if (show) {
			// Show hint after a brief delay
			const showTimer = setTimeout(() => {
				visible = true;
			}, 1000);

			// Hide hint after 5 seconds
			const hideTimer = setTimeout(() => {
				visible = false;
			}, 6000);

			return () => {
				clearTimeout(showTimer);
				clearTimeout(hideTimer);
			};
		}
	});
</script>

{#if visible && show}
	<div class="keyboard-hint" role="status" aria-live="polite">
		<div class="hint-content">
			<kbd>Space</kbd> or <kbd>Enter</kbd> to continue
		</div>
	</div>
{/if}

<style>
	.keyboard-hint {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 900;
		animation: fade-in-out 5s ease-in-out forwards;
		pointer-events: none;
	}

	.hint-content {
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 2px solid var(--color-neon-cyan, #00ffff);
		border-radius: 0.5rem;
		padding: 0.75rem 1.25rem;
		font-family: 'Courier New', monospace;
		font-size: 0.875rem;
		color: white;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.4),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
	}

	kbd {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 200, 200, 0.15));
		border: 1px solid var(--color-neon-cyan, #00ffff);
		border-radius: 0.25rem;
		padding: 0.25rem 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-neon-cyan, #00ffff);
		text-shadow:
			0 0 8px rgba(0, 255, 255, 0.8),
			0 0 15px rgba(0, 255, 255, 0.4);
		box-shadow:
			0 0 8px rgba(0, 255, 255, 0.3),
			inset 0 0 5px rgba(0, 255, 255, 0.1);
		min-width: 2rem;
		text-align: center;
		display: inline-block;
	}

	@keyframes fade-in-out {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(10px);
		}
		20% {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		80% {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateX(-50%) translateY(10px);
		}
	}

	/* Hide on mobile/touch devices */
	@media (hover: none) and (pointer: coarse) {
		.keyboard-hint {
			display: none;
		}
	}

	/* Smaller screens */
	@media (max-width: 600px) {
		.keyboard-hint {
			bottom: 1rem;
		}

		.hint-content {
			font-size: 0.75rem;
			padding: 0.5rem 1rem;
		}

		kbd {
			font-size: 0.7rem;
			padding: 0.2rem 0.4rem;
			min-width: 1.75rem;
		}
	}

	/* Accessibility - Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.keyboard-hint {
			animation: none;
		}

		@keyframes fade-in-out {
			0% {
				opacity: 0;
			}
			20%,
			80% {
				opacity: 1;
			}
			100% {
				opacity: 0;
			}
		}
	}
</style>
