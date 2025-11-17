<script>
	import '../styles.css';
	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { initializeDiceBox, diceState, isDiceBoxInitialized } from '$lib/stores/diceStore.svelte.js';

	let { children, data } = $props();
	let diceContainer = $state();

	// Show dice only when on game screens (not home, not about)
	const showDice = $derived($page.url.pathname.startsWith('/game/'));
	const diceRolling = $derived(diceState.isRolling);

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

	// Initialize DiceBox when the container becomes visible
	$effect(() => {
		// Only initialize if showing dice, container exists, and not already initialized
		// This prevents duplicate initialization during theme changes
		if (showDice && diceContainer && !isDiceBoxInitialized()) {
			initializeDiceBox(diceContainer);
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
	/* Persistent DiceBox container - fills viewport, behind all content */
	.dice-container {
		position: fixed;
		top: 2.5rem; /* Below toolbar */
		left: 0.25rem;
		right: 0.25rem;
		bottom: 0.5rem;

		z-index: -10; /* Behind everything - neural background and all content */
		pointer-events: none; /* Don't block clicks */
		background: transparent;
		opacity: 0.35; /* Very transparent when sunk into background */
		filter: brightness(0.7) blur(1px); /* Dimmed and slightly blurred for depth */
		transform: scale(1); /* Default scale */
		transition:
			opacity 2s ease-in-out,
			filter 2s ease-in-out,
			transform 2s ease-in-out;
	}

	.dice-container.hidden {
		opacity: 0;
		visibility: hidden;
	}

	/* When rolling, bring dice to front with immediate transition */
	.dice-container.rolling {
		z-index: 9999;
		opacity: 1; /* Full opacity when rolling */
		filter: brightness(1) blur(0px); /* Full brightness and sharp when on top */
		transform: scale(1); /* Normal scale when rolling */
		transition:
			opacity 0.3s ease-out,
			filter 0.3s ease-out,
			transform 0.3s ease-out,
			z-index 0s 0s; /* Immediate z-index change when becoming active */
	}

	/* Fade-out state: dice are fading but still need high z-index */
	.dice-container:not(.rolling):not(.hidden) {
		/* Keep high z-index during fade-out to prevent visual jump */
		z-index: 9999;
		opacity: 0; /* Fade to transparent */
		transform: scale(0.9); /* Scale down slightly for polish */
		filter: brightness(1) blur(0px); /* Keep sharp during fade */
		transition:
			opacity 250ms ease-out,
			transform 250ms ease-out,
			filter 250ms ease-out,
			z-index 0s 250ms; /* Delay z-index drop until after fade completes */
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
