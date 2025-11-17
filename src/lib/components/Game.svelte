<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import NeuralBackground from './NeuralBackground.svelte';
	import GameScreen from './GameScreen.svelte';
	import HelpModal from './HelpModal.svelte';

	let {
		systemSettings = $bindable({}),
		ongameloaded = () => {},
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
		position: relative; /* CRITICAL: Position context for neural background */
	}

	/* CRITICAL: Disable all pointer events when modal is active */
	/* This prevents clicking through the modal backdrop to game content */
	.dc-game-container.modal-active {
		pointer-events: none;
	}
	.dc-game-container,
	:global(.dc-intro-container) {
		border-radius: var(--dc-default-border-radius);
	}

	/* Neural background at game container level */
	.dc-game-container > :global(.neural-background) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		pointer-events: none;
	}

	/* GameScreen component appears above neural background */
	.dc-game-container > :global(*:not(.neural-background)) {
		position: relative;
		/* z-index removed to prevent stacking context - modals need to escape */
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

	:global(.dc-header) {
		position: absolute;
		display: grid;
		justify-self: center;
		width: auto;
		min-width: 80%;
		bottom: 0.25rem;
		padding: 0.5rem;
		border-radius: var(--dc-default-border-radius);
		overflow: visible; /* Allow button glows to extend beyond bounds */
	}
	:global(.dc-header .aug-button-wrapper) {
		width: 100%;
	}
	:global(.dc-header .aug-button) {
		display: grid;
		justify-self: center;
		align-self: center;
		width: 100%;
		margin: 0;
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

	@media (max-width: 450px) or (max-height: 600px) {
		:global(.dc-header) {
			width: 90%;
			bottom: 0.5rem; /* Slightly higher on small screens for better thumb access */
			padding: 0.25rem;
		}
	}

	/* Ensure button always stays at bottom on very small screens */
	@media (max-height: 500px) {
		:global(.dc-header) {
			bottom: 0.25rem;
			min-width: 85%;
		}
	}

	/* Allow overflow on mobile for toolbar elements to appear above toolbar */
	@media (max-width: 450px) or (max-height: 600px) {
		.dc-game-container {
			overflow: visible;
		}
	}
</style>
