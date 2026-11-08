<script>
	import '../styles.css';
	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { untrack } from 'svelte';
	import { animationTokensCss } from '$lib/constants/animations.js';
	import { initializeDiceBox, resetDiceBox, diceState } from '$lib/stores/diceStore.svelte.js';

	let { children, data } = $props();

	// The motion tokens (--dur-*, --ease-*) as one :root rule, from the same constants JS uses
	const motionTokens = `<style id="motion-tokens">${animationTokensCss()}</style>`;
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

	// The one DiceBox lives as long as the page. Entering the game screens initializes it, or
	// from the second game on reuses it (re-measured, in that game's theme); leaving them
	// clears the dice and keeps the renderer, so no game adds a WebGL context. The store's own
	// state is read untracked, so the effect only follows the route.
	$effect(() => {
		if (showDice && !lastShowDiceValue && diceContainer) {
			lastShowDiceValue = true;
			untrack(() =>
				initializeDiceBox(diceContainer).catch((error) => {
					console.warn(
						'[Layout] Failed to initialize DiceBox, dice animations disabled:',
						error.message
					);
					// Game remains functional without 3D dice
				})
			);
		} else if (!showDice && lastShowDiceValue) {
			lastShowDiceValue = false;
			untrack(resetDiceBox);
		}
	});
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static tokens built from animations.js -->
	{@html motionTokens}
	<link rel="icon" href={data.icon || '/d20-150.png'} />
</svelte:head>
<!-- Persistent DiceBox container that never unmounts, but can be hidden. While a roll is up
     it is on top of everything; then it sinks beneath the board (see the styles below). -->
<div
	bind:this={diceContainer}
	id="dice-roller-container"
	class="dice-container"
	class:hidden={!showDice}
	class:rolling={diceRolling}
	style:transform-origin={diceState.sinkOrigin}
></div>

<div class="page-content">
	{@render children()}
</div>

<style>
	/* Persistent DiceBox container: the whole screen is the throw area.
	   - Rolling (.rolling): on top of every part of the game, header and HUD included (1000:
	     over the page content at 1, under the menu at 1500 and the dialogs at 5000 and up,
	     which are portalled to the body). It never takes a tap: a tap still reaches the
	     button, and skips the roll.
	   - Sinking (the moment .rolling goes, when the roll resolves): the z-index drops at
	     once, behind the page content, so the HUD, the title, the result line and the button
	     are in front; the dice then drop 8px, shrink 10% in place and darken out over 350ms,
	     ease-in, under the table's grid. The result line appears in that same moment, so it
	     is never covered.
	   - At rest: under the board and invisible. */
	.dice-container {
		position: fixed;
		inset: 0;

		z-index: -10;
		pointer-events: none;
		background: transparent;
		opacity: 0;
		/* Shrinks about the landed dice (diceState.sinkOrigin), so they sink in place */
		transform: translateY(var(--rise-enter, 8px)) scale(0.9);
		filter: brightness(0.3);
		/* No z-index in the list: it changes the moment the sink starts. The drop and the
		   darkening ease in; the fade eases in harder, so the dice are seen going down. */
		transition:
			transform var(--dur-dice-sink, 350ms) ease-in,
			filter var(--dur-dice-sink, 350ms) ease-in,
			opacity var(--dur-dice-sink, 350ms) var(--ease-exit, ease-in);
	}

	/* Hidden off the game screens */
	.dice-container.hidden {
		visibility: hidden;
	}

	/* Rolling: on top, rising out of the board as the throw starts */
	.dice-container.rolling {
		z-index: 1000;
		opacity: 1;
		transform: none;
		filter: none;
		transition:
			opacity var(--dur-enter, 200ms) var(--ease-enter, ease-out),
			transform var(--dur-enter, 200ms) var(--ease-enter, ease-out),
			filter var(--dur-enter, 200ms) var(--ease-enter, ease-out);
	}

	/* Reduced motion: no movement, the sink is a plain fade */
	@media (prefers-reduced-motion: reduce) {
		.dice-container,
		.dice-container.rolling {
			transform: none;
			filter: none;
			transition: opacity var(--dur-dice-sink, 350ms) linear;
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

	/* Page navigation (View Transitions API): the old page fades out, the new one fades in
	   with an 8px rise, both over the 200ms enter/exit token */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: var(--dur-enter, 200ms);
	}

	:global(::view-transition-old(root)) {
		animation-name: page-fade-out;
		animation-timing-function: var(--ease-exit, ease-in);
	}

	:global(::view-transition-new(root)) {
		animation-name: page-fade-in-rise;
		animation-timing-function: var(--ease-enter, ease-out);
	}

	@keyframes -global-page-fade-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes -global-page-fade-in-rise {
		from {
			opacity: 0;
			transform: translateY(var(--rise-enter, 8px));
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
