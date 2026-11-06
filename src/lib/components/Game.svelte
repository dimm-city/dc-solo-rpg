<script>
	import { onMount } from 'svelte';
	import { gameState } from '../stores/gameStore.svelte.js';
	import { initializeAudioStore } from '../stores/audioStore.svelte.js';
	import NeuralBackground from './NeuralBackground.svelte';
	import GameScreen from './GameScreen.svelte';
	import HelpModal from './HelpModal.svelte';

	let {
		systemSettings = $bindable({}),
		ongameover = () => {},
		onexitgame = () => {},
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {}
	} = $props();

	const gameStylesheet = $derived(gameState.stylesheet);
	const currentScreen = $derived(gameState.state);

	let showHelpModal = $state(false);

	function handleHelpClose() {
		showHelpModal = false;
	}

	// ✅ IMPROVED: Use onMount for one-time initialization (clearer intent)
	onMount(async () => {
		await initializeAudioStore();
	});

	// React to screen changes for callbacks
	$effect(() => {
		if (currentScreen == 'gameOver') {
			ongameover(gameState.state);
		} else if (currentScreen == 'exitGame') {
			onexitgame(gameState.state);
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={gameStylesheet} />
</svelte:head>
<div
	class="dc-game-container dc-game-bg"
	class:modal-active={showHelpModal}
	data-testid="game-container"
	inert={showHelpModal ? true : undefined}
	aria-hidden={showHelpModal ? 'true' : undefined}
>
	<NeuralBackground />
	<GameScreen {systemSettings} {onfailurecheckcompleted} {onjournalsaved} bind:showHelpModal />
</div>

<!-- Help Modal rendered at game container level -->
<HelpModal isOpen={showHelpModal} onClose={handleHelpClose} />

<style>
	:root {
		--dc-default-font-family: inherit;
		--dc-default-text-color: inherit;
		--dc-default-border-radius: 0.5rem;
		--dc-default-padding: 0.25rem;
		--dc-default-boxshadow: 0 2px 5px rgba(0, 0, 0, 0.1);

		--dc-default-game-bg: rgba(145, 177, 248);
		--dc-default-container-bg: rgba(255, 255, 255, 0.3);

		--dc-button-bg: #1387b9;
		--dc-accent-color: rgb(58, 159, 199);
		--dc-toolbar-height: 3rem;
		--dc-header-block-margin: 0.25rem;

		--dc-dice-roller-bg: #cccfd1;

		--dc-card-border: 1px solid #000000;
		--dc-card-border-radius: 1rem;
		--dc-card-back-color: white;
		--dc-card-back-bg: #1387b9;
		--dc-card-front-bg: rgb(235, 235, 235);
		--dc-card-front-color: inherit;

		--dc-status-display-padding: var(--dc-default-padding);
		--dc-success-token-stroke: var(--dc-default-text-color);
		--dc-success-token-fill: var(--dc-accent-color);
		--dc-failure-token-stroke: var(--dc-card-back-bg);
		--dc-failure-token-fill: var(--dc-accent-color);
	}

	* {
		-webkit-tap-highlight-color: transparent;
	}

	.dc-game-container {
		display: grid;
		height: 100%;
		width: 100%; /* CRITICAL: Take full parent width */
		max-width: 100%; /* CRITICAL: Prevent horizontal overflow */
		min-width: 0; /* CRITICAL: Allow grid to shrink horizontally */
		min-height: 0; /* CRITICAL: Allow grid to shrink below content size */
		grid-template-rows: 100%; /* Constrain grid row to parent height */
		box-sizing: border-box;
		font-family: var(--dc-default-font-family);
		color: var(--dc-default-text-color);
		overflow: hidden; /* CRITICAL: Prevent all scrolling */
		position: relative; /* Position context for the neural background */
		/* Own stacking context: the neural background (z-index -1) paints above this
		   container's background and below every screen, without forcing a position on them.
		   Fixed and absolute children (modals, the live region) keep their own positioning. */
		isolation: isolate;
		--neural-z: -1;
	}

	/* CRITICAL: Disable all pointer events when modal is active */
	/* This prevents clicking through the modal backdrop to game content */
	.dc-game-container.modal-active {
		pointer-events: none;
	}
	.dc-game-container {
		border-radius: var(--dc-default-border-radius);
	}

	/* Screen-specific styles moved to GameScreen.svelte */
	:global(.dc-game-bg) {
		background: var(--dc-default-game-bg);
	}
	:global(.dc-game-container select, .dc-game-container input, .dc-game-container textarea) {
		color: var(--dc-default-text-color);
		background: var(--dc-default-game-bg);
		font-family: var(--dc-default-font-family);
	}
	:global(
		.dc-game-container button:not(.aug-button),
		.dc-game-container button:not(.aug-button):hover,
		.dc-game-container button:not(.aug-button):focus-visible
	) {
		background: var(--dc-button-bg);
		color: var(--dc-button-color);
		text-shadow: none;
		font-family: var(--dc-default-font-family);
	}

	/* Animations and media queries remain global for all screens */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	:global(.dc-fade-in) {
		animation: fadeIn 350ms ease-in;
	}

	/* Allow overflow on mobile for toolbar elements to appear above toolbar */
	@media (max-width: 450px) or (max-height: 600px) {
		.dc-game-container {
			overflow: visible;
		}
	}
</style>
