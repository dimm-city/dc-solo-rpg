<script>
	import '../styles.css';
	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import {
		initializeDiceBox,
		diceState,
		isDiceBoxInitialized
	} from '$lib/stores/diceStore.svelte.js';

	let { children, data } = $props();
	let diceContainer = $state();

	// Show dice only when on game screens (not home, not about)
	const showDice = $derived($page.url.pathname.startsWith('/game/'));
	const diceRolling = $derived(diceState.isRolling);

	// ✅ FIXED: Use $state for initialization tracking to ensure persistence
	let lastShowDiceValue = $state(false);

	onNavigate((navigation) => {
		// Only run in browser environment (SSR safety)
		if (!browser) return;

		// Graceful degradation for browsers without view transitions support
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// ✅ FIXED: Improved DiceBox initialization with proper state tracking
	// Only react when showDice changes from false -> true
	$effect(() => {
		// Only initialize when transitioning from not showing to showing
		if (showDice && !lastShowDiceValue && diceContainer) {
			lastShowDiceValue = true;

			// Check initialization WITHOUT reactive dependency using untrack
			// This prevents the effect from re-running when isInitialized changes
			const alreadyInitialized = untrack(() => isDiceBoxInitialized());

			if (!alreadyInitialized) {
				// Initialize DiceBox with error handling
				initializeDiceBox(diceContainer).catch((error) => {
					console.warn(
						'[Layout] Failed to initialize DiceBox, dice animations disabled:',
						error.message
					);
					// Game remains functional without 3D dice
				});
			}
		} else if (!showDice) {
			// Reset tracking when leaving game screens
			// This allows re-initialization if user navigates back
			lastShowDiceValue = false;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={data.icon || '/d20-150.png'} />
</svelte:head>
<!-- Persistent DiceBox container that never unmounts, but can be hidden -->
<div
	bind:this={diceContainer}
	id="dice-roller-container"
	class="dice-container"
	class:hidden={!showDice}
	class:rolling={diceRolling}
></div>

<div class="page-content">
	{@render children()}
</div>

<style>
	/* Persistent DiceBox container. The throw area sits between the HUD and the button bar:
	   --hud-bottom is published by StatsGrid, the bottom offset leaves room for the button bar. */
	.dice-container {
		position: fixed;
		top: var(--hud-bottom, 2.5rem);
		left: 0.25rem;
		right: 0.25rem;
		bottom: 6rem;

		z-index: -10;
		pointer-events: none;
		background: transparent;
		/* Resting state: gone. Settled dice never linger over the HUD, card or button. */
		opacity: 0;
		transform: scale(0.95);
		/* Delayed z-index pattern: after .rolling ends the container keeps its z-index of 9999 while
		   it fades, then drops behind (250ms = ANIMATION_DURATION.DICE_FADE) */
		transition:
			opacity 250ms ease-out,
			transform 250ms ease-out,
			z-index 0s 250ms;
	}

	/* Hidden off the game screens */
	.dice-container.hidden {
		visibility: hidden;
	}

	/* Rolling: in front, fully visible, immediately */
	.dice-container.rolling {
		z-index: 9999;
		opacity: 1;
		transform: scale(1);
		transition:
			opacity 150ms ease-out,
			transform 150ms ease-out,
			z-index 0s 0s;
	}

	@media (prefers-reduced-motion: reduce) {
		.dice-container,
		.dice-container.rolling {
			transition: none;
		}
	}

	/* Canvas from DiceBox should fill the container */
	:global(.dice-container > canvas) {
		width: 100% !important;
		height: 100% !important;
		display: block;
	}

	.page-content {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 100%;
	}

	/* View Transition API styles for smooth page transitions */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: var(--anim-fast);
	}

	:global(::view-transition-old(root)) {
		animation-name: fade-out-scale;
	}

	:global(::view-transition-new(root)) {
		animation-name: fade-in-rise;
	}

	@keyframes fade-out-scale {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.95);
		}
	}

	@keyframes fade-in-rise {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none !important;
		}
	}
</style>
