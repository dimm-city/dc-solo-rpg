<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { signOut } from '@auth/sveltekit/client';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import SettingsModal from '$lib/components/settings/SettingsModal.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import DiceThemePicker from '$lib/components/DiceThemePicker.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';
	import BrowseGames from '$lib/components/BrowseGames.svelte';
	import StoryMode from '$lib/components/StoryMode.svelte';
	import HomeHeader from '$lib/components/home/HomeHeader.svelte';
	import HomeGameCard from '$lib/components/home/HomeGameCard.svelte';
	import FirstRunPanel from '$lib/components/home/FirstRunPanel.svelte';
	import Toast from '$lib/components/home/Toast.svelte';
	import {
		hasSeenInstructions,
		markInstructionsAsSeen,
		hasSeenSplash,
		markSplashSeen,
		setRuleTipsEnabled
	} from '$lib/utils/instructionsStorage.js';
	import { gameSlug, saveRoundLabel } from '$lib/utils/homeGames.js';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { getCustomGames, addCustomGame, removeCustomGame } from '$lib/stores/customGames.js';
	import {
		hasSavedGame,
		getSaveMetadata,
		loadAllSaves,
		migrateFromLocalStorage,
		clearLocalStorageSaves
	} from '$lib/stores/indexedDBStorage.js';
	import { resumeGame, deleteSavedGame } from '$lib/stores/gameActions.svelte.js';
	import { initializeAudioStore } from '$lib/stores/audioStore.svelte.js';
	import { gameState } from '$lib/stores/gameStore.svelte.js';
	import { latestCompletedStory } from '$lib/components/browse/latestStory.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// App version - hardcoded for now (matches package.json)
	const APP_VERSION = '0.2.0';

	/** 'splash' (first visit on this install), 'first-run' (the one-time choice) or 'games' */
	let view = $state(null);
	let showAboutModal = $state(false);
	let showSettingsModal = $state(false);
	let showHelpModal = $state(false);
	let showDiceThemePicker = $state(false);
	/** The Game Guide was opened from the first-time panel: closing it goes on to the games */
	let rulesFromFirstRun = false;

	let allGames = $state([]);
	let fileInput = $state(null);
	let uploading = $state(false);
	let gameSaveData = $state({});
	/** Pending confirmation: { kind: 'delete' | 'new' | 'remove', game } */
	let confirmation = $state(null);

	let toast = $state('');
	/** 'status' (polite, a few seconds) or 'error' (an alert, at least 10s, dismissible) */
	let toastTone = $state('status');
	let toastTimer = null;
	const ERROR_TOAST_MS = 10000;

	// Story mode state
	let showBrowseGames = $state(false);
	let showStoryMode = $state(false);
	let selectedStoryGame = $state(null);

	// True when any modal is open (for accessibility and click blocking)
	const anyModalOpen = $derived(
		showAboutModal ||
			showSettingsModal ||
			showHelpModal ||
			showDiceThemePicker ||
			confirmation !== null
	);

	const docTitle = $derived(
		showBrowseGames || showStoryMode ? 'Story Library · Dream Console' : 'Dream Console'
	);

	/** Screen swaps: the old view leaves at once, the new one fades in over 200ms (AN-06) */
	const swapIn = () => ({
		duration: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
			? 0
			: ANIMATION_DURATION.NORMAL
	});

	onMount(async () => {
		view = hasSeenSplash() ? nextView() : 'splash';

		// Migrate localStorage saves to IndexedDB (one-time migration)
		if (browser && !sessionStorage.getItem('migrationComplete')) {
			try {
				const migratedCount = await migrateFromLocalStorage();
				if (migratedCount > 0) {
					console.log(`Migrated ${migratedCount} saves from localStorage to IndexedDB`);
					// Clear old localStorage saves after successful migration
					await clearLocalStorageSaves();
				}
				sessionStorage.setItem('migrationComplete', 'true');
			} catch (error) {
				console.error('Migration failed:', error);
			}
		}

		// ?story opens the Story Library; "Read your story" at the end of a game links here with
		// ?story=latest, which opens that run's story at once, as choosing its card does (Back
		// returns to the library)
		const story = new URLSearchParams(window.location.search).get('story');
		if (story === 'latest') await openLatestStory();
		else if (story !== null) showBrowseGames = true;

		await loadGames();
	});

	onDestroy(() => clearTimeout(toastTimer));

	async function openLatestStory() {
		try {
			const latest = latestCompletedStory(await loadAllSaves());
			if (latest) {
				handleSelectStoryGame(latest);
				return;
			}
		} catch (error) {
			console.error('Could not open the latest story:', error);
		}
		showBrowseGames = true;
	}

	/** After the splash: the first-time choice once, then straight to the games */
	function nextView() {
		return hasSeenInstructions() ? 'games' : 'first-run';
	}

	/**
	 * The game list and each game's save, shown together: a card never shows Play and then swaps
	 * it for Continue once its save has been read.
	 */
	async function loadGames() {
		const games = [...getCustomGames(), ...data.games].sort((a, b) =>
			a.title.localeCompare(b.title)
		);
		gameSaveData = await readSaveData(games);
		allGames = games;
	}

	async function updateSaveData() {
		gameSaveData = await readSaveData(allGames);
	}

	async function readSaveData(games) {
		const saveData = {};
		for (const game of games) {
			const slug = gameSlug(game);
			if (await hasSavedGame(slug)) {
				saveData[slug] = await getSaveMetadata(slug);
			}
		}
		return saveData;
	}

	function showToast(message, ms = 3000, tone = 'status') {
		clearTimeout(toastTimer);
		toast = message;
		toastTone = tone;
		toastTimer = setTimeout(() => (toast = ''), ms);
	}

	/** An error stays at least 10 seconds, as an alert, until it is dismissed */
	const showError = (message) => showToast(message, ERROR_TOAST_MS, 'error');

	function dismissToast() {
		clearTimeout(toastTimer);
		toast = '';
	}

	function openGame(game) {
		const slug = gameSlug(game);
		if (game.isCustom) {
			goto(resolve('/game/custom/[slug]', { slug }));
		} else {
			goto(resolve('/game/[slug]', { slug }));
		}
	}

	/** Play always starts a fresh game, even if this game is still loaded in memory */
	function handlePlay(game) {
		if (gameState.config?.slug === gameSlug(game)) {
			gameState.config.loaded = false;
		}
		openGame(game);
	}

	async function handleContinue(game) {
		if (await resumeGame(gameSlug(game))) {
			openGame(game);
		} else {
			showError("That save couldn't be opened. Start a new game or delete the save.");
		}
	}

	async function confirmAction() {
		if (!confirmation) return;
		const { kind, game } = confirmation;
		const slug = gameSlug(game);
		confirmation = null;

		if (kind === 'remove') {
			if (removeCustomGame(game.slug)) {
				await loadGames();
				showToast(`Removed “${game.title}”`);
			}
			return;
		}

		await deleteSavedGame(slug);
		if (gameState.config?.slug === slug) {
			gameState.config.loaded = false;
		}

		if (kind === 'new') {
			openGame(game);
		} else {
			await updateSaveData();
			showToast('Save deleted');
		}
	}

	/** Copy for the open confirmation: name what is lost */
	const confirmCopy = $derived.by(() => {
		if (!confirmation) return null;
		const { kind, game } = confirmation;
		const round = saveRoundLabel(gameSaveData[gameSlug(game)]);
		const save = `${game.title} save${round ? ` (${round})` : ''}`;

		// Cancel keeps the object, confirm names the verb and the object
		if (kind === 'delete') {
			return {
				title: 'Delete save',
				message: `Delete your ${save}? This can't be undone.`,
				confirmText: 'Delete save',
				cancelText: 'Keep save'
			};
		}
		if (kind === 'new') {
			return {
				title: 'New game',
				message: `Start ${game.title} from the beginning? Your ${round ? `${round} ` : ''}save will be replaced. This can't be undone.`,
				confirmText: 'Start new game',
				cancelText: 'Keep my save'
			};
		}
		return {
			title: 'Remove game',
			message: `Remove ${game.title} from your games? To play it again, upload its file.`,
			confirmText: 'Remove game',
			cancelText: 'Keep game'
		};
	});

	async function handleFileUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.game.md')) {
			showError('Choose a file that ends in .game.md.');
			if (fileInput) fileInput.value = '';
			return;
		}

		uploading = true;
		showToast('Reading the game file…', 10000);

		try {
			const result = addCustomGame(await file.text(), file.name);
			if (result.success) {
				await loadGames();
				showToast(`Added “${result.gameConfig.title}”`, 5000);
			} else if (result.kind === 'storage') {
				showError("Couldn't save the game in this browser. Free up some space and try again.");
			} else {
				showError(
					`Couldn't add “${file.name}”: ${result.reason}. Fix the file and upload it again.`
				);
			}
		} catch (error) {
			console.error('Upload failed:', error);
			showError("Couldn't add that file. Try again, or check it opens in a text editor.");
		} finally {
			uploading = false;
			if (fileInput) fileInput.value = '';
		}
	}

	function handleSplashComplete() {
		markSplashSeen();
		view = nextView();
	}

	// First-time panel
	function startPlaying({ tips }) {
		markInstructionsAsSeen();
		setRuleTipsEnabled(tips);
		view = 'games';
	}

	function readRulesFirst() {
		rulesFromFirstRun = true;
		showHelpModal = true;
	}

	function closeHelp() {
		showHelpModal = false;
		if (rulesFromFirstRun) {
			rulesFromFirstRun = false;
			startPlaying({ tips: true });
		}
	}

	/**
	 * Settings reads the saved audio and auto-play settings, which the store otherwise only loads
	 * when a game starts: without this, the home page showed (and on any change, saved) defaults.
	 * The settings load synchronously; a saved voice service starts up in the background.
	 */
	let audioSettingsLoaded = false;
	function openSettings() {
		if (!audioSettingsLoaded) {
			audioSettingsLoaded = true;
			initializeAudioStore();
		}
		showSettingsModal = true;
	}

	async function handleSignOut() {
		await signOut({ callbackUrl: '/signin' });
	}

	// Story mode handlers
	function handleBrowseStories() {
		showBrowseGames = true;
		showStoryMode = false;
	}

	function handleSelectStoryGame(game) {
		selectedStoryGame = game;
		showBrowseGames = false;
		showStoryMode = true;
	}

	function handleExitBrowseGames() {
		showBrowseGames = false;
		selectedStoryGame = null;
	}

	function handleExitStoryMode() {
		showStoryMode = false;
		showBrowseGames = true;
	}

	// Escape closes the top modal (ContentModal stops its own Escape; this covers the rest)
	function handleKeydown(event) {
		if (event.key !== 'Escape') return;
		if (showAboutModal) showAboutModal = false;
		else if (showSettingsModal) showSettingsModal = false;
		else if (showHelpModal) closeHelp();
		else if (showDiceThemePicker) showDiceThemePicker = false;
		else if (confirmation) confirmation = null;
	}
</script>

<svelte:head>
	<title>{docTitle}</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<!-- Behind the page: the motes show in the gaps, never over a button, card or prose (visual-layout-s-08) -->
<NeuralBackground --neural-z="-1" />

{#if view === 'splash'}
	<Splash onComplete={handleSplashComplete} />
{/if}

<!-- Story mode views -->
{#if showStoryMode && selectedStoryGame}
	<StoryMode savedGame={selectedStoryGame} onExit={handleExitStoryMode} />
{:else if showBrowseGames}
	<BrowseGames onSelectGame={handleSelectStoryGame} onBack={handleExitBrowseGames} />
{:else if view === 'first-run'}
	<div
		class="home-view"
		in:fade={swapIn()}
		inert={anyModalOpen ? true : undefined}
		aria-hidden={anyModalOpen ? 'true' : undefined}
	>
		<FirstRunPanel
			onplay={() => startPlaying({ tips: true })}
			onreadrules={readRulesFirst}
			onskiptips={() => startPlaying({ tips: false })}
		/>
	</div>
{:else if view === 'games'}
	<section
		class="home-view home-screen"
		class:modal-active={anyModalOpen}
		data-testid="home-page"
		in:fade={swapIn()}
		inert={anyModalOpen ? true : undefined}
		aria-hidden={anyModalOpen ? 'true' : undefined}
	>
		<input
			type="file"
			accept=".game.md,.md"
			bind:this={fileInput}
			onchange={handleFileUpload}
			hidden
		/>

		<HomeHeader
			{uploading}
			signedIn={!!data.session?.user}
			onupload={() => fileInput?.click()}
			onstories={handleBrowseStories}
			onsettings={openSettings}
			ondice={() => (showDiceThemePicker = true)}
			onabout={() => (showAboutModal = true)}
			onhelp={() => (showHelpModal = true)}
			onsignout={handleSignOut}
		/>

		<div class="home-column">
			<!-- Each sentence stays whole: the only break is between them -->
			<h1 class="home-pitch">
				<span class="pitch-sentence">A solo journaling game.</span>
				<span class="pitch-sentence">Draw, roll, write.</span>
			</h1>

			<div class="games" data-testid="game-selector">
				<h2 class="sr-only">Games</h2>
				<div class="game-cards-grid">
					{#each allGames as game, index (gameSlug(game))}
						<HomeGameCard
							{game}
							{index}
							save={gameSaveData[gameSlug(game)] ?? null}
							onplay={handlePlay}
							oncontinue={handleContinue}
							onnewgame={(g) => (confirmation = { kind: 'new', game: g })}
							ondeletesave={(g) => (confirmation = { kind: 'delete', game: g })}
							onremove={(g) => (confirmation = { kind: 'remove', game: g })}
						/>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<Toast message={toast} tone={toastTone} ondismiss={dismissToast} />

<ConfirmModal
	isOpen={confirmation !== null}
	title={confirmCopy?.title ?? ''}
	message={confirmCopy?.message ?? ''}
	confirmText={confirmCopy?.confirmText}
	cancelText={confirmCopy?.cancelText}
	onConfirm={confirmAction}
	onCancel={() => (confirmation = null)}
/>

<AboutModal
	isOpen={showAboutModal}
	onClose={() => (showAboutModal = false)}
	appVersion={APP_VERSION}
/>

<SettingsModal isOpen={showSettingsModal} onClose={() => (showSettingsModal = false)} />

<HelpModal isOpen={showHelpModal} onClose={closeHelp} />

<DiceThemePicker bind:isOpen={showDiceThemePicker} />

<style>
	:global(body) {
		overflow-y: auto;
	}

	.home-view {
		position: relative;
		z-index: 1;
		min-height: 100%;
	}

	.home-screen {
		display: flex;
		flex-direction: column;
	}

	/* Blocks clicks through the modal scrim to the page behind it */
	.home-screen.modal-active {
		pointer-events: none;
	}

	/* One centred column, 960px at most */
	.home-column {
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: clamp(var(--space-lg), 6vw, var(--space-3xl)) var(--space-md) var(--space-3xl);
	}

	/* The one-line pitch: Inter (a sentence, under 28px, so not the display face) */
	.home-pitch {
		margin: 0 0 clamp(var(--space-lg), 4vw, var(--space-2xl));
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 400;
		line-height: 1.35;
		letter-spacing: 0;
		text-transform: none;
		text-shadow: none;
		text-wrap: balance;
		color: #e2e9f2;
	}

	.pitch-sentence {
		display: inline-block;
		white-space: nowrap;
	}

	@media (max-width: 600px) {
		.home-pitch {
			font-size: 1.25rem;
		}
	}

	/* 2-up; equal heights per row come from the grid's stretch */
	.game-cards-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(var(--space-md), 3vw, var(--space-xl));
	}

	@media (max-width: 640px) {
		.game-cards-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
