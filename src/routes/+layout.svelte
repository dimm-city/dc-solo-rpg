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

<!-- Reduced motion (or no 3D dice): the roll as numbers in a d20 outline, shown without motion -->
{#if showDice && diceState.staticRoll}
	<div class="static-roll" data-testid="static-roll" aria-hidden="true">
		{#each diceState.staticRoll.rolls as value, index (index)}
			<svg
				class="static-die"
				class:dropped={diceState.staticRoll.rolls.length > 1 && value !== diceState.staticRoll.kept}
				viewBox="0 0 100 100"
				width="96"
				height="96"
			>
				<polygon class="die-outline" points="50,4 90,27 90,73 50,96 10,73 10,27" />
				<polygon class="die-face" points="50,12 84,70 16,70" />
				<text x="50" y="54" text-anchor="middle" dominant-baseline="middle">{value}</text>
			</svg>
		{/each}
	</div>
{/if}

<div class="page-content">
	{@render children()}
</div>

<style>
	/* Persistent DiceBox container. The throw area is the lower part of the table, between
	   44% of the table (the title and result line end at 40%, see ContextBackground) and the
	   button bar, so a die never comes to rest on the result line. --hud-bottom is published
	   by StatsGrid. */
	.dice-container {
		--dice-table-top: var(--hud-bottom, 2.5rem);
		position: fixed;
		top: calc(var(--dice-table-top) + (100dvh - var(--dice-table-top)) * 0.44);
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

	/* The static roll sits where the dice would land */
	.static-roll {
		--dice-table-top: var(--hud-bottom, 2.5rem);
		position: fixed;
		top: calc(var(--dice-table-top) + (100dvh - var(--dice-table-top)) * 0.44);
		left: 0;
		right: 0;
		bottom: 6rem;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		pointer-events: none;
	}

	.static-die .die-outline {
		fill: rgba(8, 8, 20, 0.9);
		stroke: var(--color-neon-cyan, #00ffff);
		stroke-width: 3;
		stroke-linejoin: round;
	}

	.static-die .die-face {
		fill: none;
		stroke: rgba(0, 255, 255, 0.25);
		stroke-width: 1.5;
	}

	.static-die text {
		fill: #fff;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 30px;
		font-weight: 700;
	}

	/* The die that did not count, under Lucid or Surreal */
	.static-die.dropped {
		opacity: 0.4;
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
