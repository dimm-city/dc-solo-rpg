<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import HomeSettingsModal from '$lib/components/HomeSettingsModal.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import Splash from '$lib/components/Splash.svelte';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';
	import BrowseGames from '$lib/components/BrowseGames.svelte';
	import StoryMode from '$lib/components/StoryMode.svelte';
	import { Difficulty } from '$lib/configuration/DifficultyLevels.js';
	import { getAllDiceThemes } from '$lib/configuration/DiceThemes.js';
	import {
		hasSeenInstructions,
		markInstructionsAsSeen,
		hasShownInstructionsInSession,
		markInstructionsShownInSession
	} from '$lib/utils/instructionsStorage.js';
	import { getCustomGames, addCustomGame, removeCustomGame } from '$lib/stores/customGames.js';
	import {
		hasSavedGame,
		getSaveMetadata,
		migrateFromLocalStorage,
		clearLocalStorageSaves
	} from '$lib/stores/indexedDBStorage.js';
	import { resumeGame, deleteSavedGame } from '$lib/stores/gameActions.svelte.js';
	import { gameState } from '$lib/stores/gameStore.svelte.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// App version - hardcoded for now (matches package.json)
	const APP_VERSION = '0.2.0';

	// Check if splash was already shown in this session
	let showSplash = $state(typeof window !== 'undefined' && !sessionStorage.getItem('splashShown'));
	let showInstructionsChoice = $state(false);
	let showContent = $state(false);
	let showAboutModal = $state(false);
	let showSettingsModal = $state(false);
	let showHelpModal = $state(false);
	let showMobileMenu = $state(false);

	// Computed: true when any modal is open (for accessibility and click blocking)
	const anyModalOpen = $derived(
		showAboutModal || showSettingsModal || showHelpModal || showDeleteModal
	);
	let customGames = $state([]);
	let allGames = $state([]);
	let fileInput = $state(null);
	let uploading = $state(false);
	let uploadStatus = $state('');
	let gameSaveData = $state({});
	let showDeleteModal = $state(false);
	let gameToDelete = $state(null);
	// Story mode state
	let showBrowseGames = $state(false);
	let showStoryMode = $state(false);
	let selectedStoryGame = $state(null);

	// Settings state
	let selectedDifficulty = $state(Difficulty.NORMAL);
	let selectedDiceTheme = $state(null);

	// Get actual dice themes from configuration
	const availableDiceThemes = getAllDiceThemes();

	// On mount, check if we should skip splash and go straight to content
	onMount(async () => {
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

		const splashAlreadyShown = sessionStorage.getItem('splashShown') === 'true';
		if (splashAlreadyShown) {
			// Splash already shown in this session, determine what to show
			const instructionsSeen = hasSeenInstructions();
			const instructionsShownInSession = hasShownInstructionsInSession();

			// Skip instructions if either permanently skipped OR already shown this session
			if (instructionsSeen || instructionsShownInSession) {
				showContent = true;
			} else {
				showInstructionsChoice = true;
			}
		}

		// Load settings from localStorage
		if (browser) {
			const savedSettings = localStorage.getItem('gameSettings');
			if (savedSettings) {
				try {
					const settings = JSON.parse(savedSettings);
					selectedDifficulty = settings.difficulty || Difficulty.NORMAL;
					selectedDiceTheme =
						availableDiceThemes.find((t) => t.key === settings.diceTheme) || availableDiceThemes[0];
				} catch (e) {
					console.error('Failed to load settings:', e);
					selectedDiceTheme = availableDiceThemes[0];
				}
			} else {
				// Set defaults if no settings exist
				selectedDiceTheme = availableDiceThemes[0];
			}
		}

		// Load custom games
		customGames = getCustomGames();
		allGames = [...customGames, ...data.games].sort((a, b) => a.title.localeCompare(b.title));

		// Check for saved games
		await updateSaveData();
	});

	async function updateSaveData() {
		const saveData = {};
		for (const game of allGames) {
			const slug = game.slug || game.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown';
			if (await hasSavedGame(slug)) {
				saveData[slug] = await getSaveMetadata(slug);
			}
		}
		gameSaveData = saveData;
	}

	function handleStartGame(game) {
		// Navigate to game without confirmation
		if (game.isCustom) {
			goto(`/game/custom/${game.slug}`);
		} else {
			goto(`/game/${game.slug}`);
		}
	}

	async function handleFileUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.name.endsWith('.game.md')) {
			uploadStatus = 'Please select a .game.md file';
			setTimeout(() => (uploadStatus = ''), 3000);
			return;
		}

		uploading = true;
		uploadStatus = 'Uploading and parsing game file...';

		try {
			const text = await file.text();
			const result = addCustomGame(text, file.name);

			if (result.success) {
				// Reload custom games list
				customGames = getCustomGames();
				allGames = [...customGames, ...data.games].sort((a, b) => a.title.localeCompare(b.title));
				updateSaveData();

				uploadStatus = `Successfully loaded "${result.gameConfig.title}"!`;
				setTimeout(() => (uploadStatus = ''), 5000);
			} else {
				uploadStatus = `Error: ${result.error}`;
				setTimeout(() => (uploadStatus = ''), 5000);
			}
		} catch (error) {
			uploadStatus = `Failed to load file: ${error.message}`;
			setTimeout(() => (uploadStatus = ''), 5000);
		} finally {
			uploading = false;
			// Clear file input
			if (fileInput) {
				fileInput.value = '';
			}
		}
	}

	function handleUploadClick() {
		fileInput?.click();
	}

	async function handleResumeGame(game, event) {
		event.stopPropagation();
		const slug = game.slug || game.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown';

		if (await resumeGame(slug)) {
			// Game resumed successfully - navigate directly without confirmation
			if (game.isCustom) {
				goto(`/game/custom/${slug}`);
			} else {
				goto(`/game/${slug}`);
			}
		} else {
			uploadStatus = 'Failed to resume game';
			setTimeout(() => (uploadStatus = ''), 3000);
		}
	}

	function handleDeleteSave(game, event) {
		event.stopPropagation();
		gameToDelete = game;
		showDeleteModal = true;
	}

	function confirmDeleteSave() {
		if (!gameToDelete) return;

		const slug =
			gameToDelete.slug ||
			gameToDelete.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
			'unknown';

		if (deleteSavedGame(slug)) {
			// Clear game state if it's the currently loaded game
			if (gameState.config?.slug === slug) {
				gameState.config.loaded = false;
			}

			updateSaveData();
			uploadStatus = 'Saved game deleted';
			setTimeout(() => (uploadStatus = ''), 3000);
		}

		showDeleteModal = false;
		gameToDelete = null;
	}

	function cancelDeleteSave() {
		showDeleteModal = false;
		gameToDelete = null;
	}

	function handleRemoveCustomGame(game, event) {
		event.stopPropagation(); // Prevent card selection
		if (confirm(`Are you sure you want to remove "${game.title}"?`)) {
			if (removeCustomGame(game.slug)) {
				customGames = getCustomGames();
				allGames = [...customGames, ...data.games].sort((a, b) => a.title.localeCompare(b.title));
				updateSaveData();
				uploadStatus = 'Custom game removed';
				setTimeout(() => (uploadStatus = ''), 3000);
			}
		}
	}

	function handleSplashComplete() {
		showSplash = false;
		// Mark splash as shown for this session
		sessionStorage.setItem('splashShown', 'true');

		// Check if user has seen instructions or if already shown this session
		const instructionsSeen = hasSeenInstructions();
		const instructionsShownInSession = hasShownInstructionsInSession();

		// Wait for splash fade-out to complete before showing next screen
		setTimeout(() => {
			if (instructionsSeen || instructionsShownInSession) {
				// Skip directly to game selection
				showContent = true;
			} else {
				// Show instructions choice screen
				showInstructionsChoice = true;
			}
		}, 850); // Wait for 800ms fade + 50ms buffer
	}

	function handleLearnToPlay() {
		// Mark as shown for this session
		markInstructionsShownInSession();
		goto('/how-to');
	}

	function handleSkipOnce() {
		// Skip to game selection without storing preference (but mark session as shown)
		markInstructionsShownInSession();
		showInstructionsChoice = false;
		setTimeout(() => {
			showContent = true;
		}, 300);
	}

	function handleSkipAlways() {
		// Skip to game selection and remember preference permanently
		markInstructionsAsSeen();
		markInstructionsShownInSession();
		showInstructionsChoice = false;
		setTimeout(() => {
			showContent = true;
		}, 300);
	}

	function handleAboutClick(e) {
		e.preventDefault();
		showAboutModal = true;
		showMobileMenu = false;
	}

	function handleHelpClick(e) {
		e.preventDefault();
		showHelpModal = true;
		showMobileMenu = false;
	}

	function handleSettingsClick(e) {
		e.preventDefault();
		showSettingsModal = true;
		showMobileMenu = false;
	}

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}

	// Story mode handlers
	function handleBrowseStories() {
		showBrowseGames = true;
		showStoryMode = false;
		showMobileMenu = false;
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

	// Keyboard event handler for modals
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			// Close any open modal when Escape is pressed
			if (showAboutModal) {
				showAboutModal = false;
			} else if (showSettingsModal) {
				showSettingsModal = false;
			} else if (showHelpModal) {
				showHelpModal = false;
			} else if (showDeleteModal) {
				cancelDeleteSave();
			}
		}
	}

	// Game descriptions/subtitles for enhanced UI
	const gameDescriptions = {
		'artful-detective': 'Solve mysteries in a noir-cyberpunk city',
		'full-example': 'Complete game demonstration',
		'future-lost': 'Navigate a post-apocalyptic wasteland',
		'gnome-alone': 'Survive as a lone gnome adventurer',
		'simple-example': 'Quick start tutorial game'
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<NeuralBackground />
<Splash visible={showSplash} onComplete={handleSplashComplete} />

{#if showInstructionsChoice}
	<section
		class="instructions-choice-container"
		transition:fade={{ duration: 600 }}
		inert={anyModalOpen ? true : undefined}
		aria-hidden={anyModalOpen ? 'true' : undefined}
	>
		<div class="choice-content">
			<h1>How To Play</h1>
			<p class="subtitle">
				Would you like to learn the game mechanics, or skip straight to the games?
			</p>

			<div class="choice-cards">
				<button class="choice-card" onclick={handleLearnToPlay}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
							<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
						</svg>
					</div>
					<h3>Learn How to Play</h3>
					<p>Understand the mechanics before diving into the story</p>
					<span class="recommendation">Recommended for first-time players</span>
				</button>

				<button class="choice-card skip-card" onclick={handleSkipOnce}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 4 15 12 5 20 5 4" />
							<line x1="19" x2="19" y1="5" y2="19" />
						</svg>
					</div>
					<h3>Skip Once</h3>
					<p>Skip to game selection this time, show instructions again next time</p>
					<span class="recommendation">Try the game first</span>
				</button>

				<button class="choice-card skip-always-card" onclick={handleSkipAlways}>
					<div class="icon-wrapper">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polygon points="5 4 15 12 5 20 5 4" />
							<polygon points="13 4 23 12 13 20 13 4" />
						</svg>
					</div>
					<h3>Skip Always</h3>
					<p>I know how to play, never show instructions again</p>
					<span class="recommendation">For experienced players</span>
				</button>
			</div>
		</div>
	</section>
{/if}

<!-- Story Mode Views -->
{#if showStoryMode && selectedStoryGame}
	<StoryMode savedGame={selectedStoryGame} onExit={handleExitStoryMode} />
{:else if showBrowseGames}
	<BrowseGames onSelectGame={handleSelectStoryGame} onBack={handleExitBrowseGames} />
{:else if showContent}
	<section
		class="form-container"
		class:modal-active={anyModalOpen}
		data-testid="home-page"
		transition:fade={{ duration: 600 }}
		inert={anyModalOpen ? true : undefined}
		aria-hidden={anyModalOpen ? 'true' : undefined}
	>
		<!-- Hidden file input -->
		<input
			type="file"
			accept=".game.md,.md"
			bind:this={fileInput}
			onchange={handleFileUpload}
			style="display: none;"
		/>

		<div class="page-header">
			<div class="header-logo">
				<img src="/d20-150.png" alt="Dream Console Logo" class="logo-dice" />
				<span class="version-text">Dream Console</span>
			</div>

			<!-- Desktop header buttons (hidden on mobile) -->
			<div class="header-buttons desktop-only">
				<button
					class="header-button upload-button"
					onclick={handleUploadClick}
					disabled={uploading}
					aria-label="Upload Custom Game"
					title="Upload Custom Game"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="17 8 12 3 7 8"></polyline>
						<line x1="12" x2="12" y1="3" y2="15"></line>
					</svg>
				</button>
				<button
					onclick={handleBrowseStories}
					class="header-button library-button"
					aria-label="Browse Story Library"
					title="Browse Story Library"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
					</svg>
				</button>
				<button onclick={handleAboutClick} class="header-button" aria-label="About">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4"></path>
						<path d="M12 8h.01"></path>
					</svg>
				</button>
				<button onclick={handleHelpClick} class="header-button" aria-label="Help">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<path d="M12 17h.01"></path>
					</svg>
				</button>
			</div>

			<!-- Mobile hamburger menu button (visible only on small screens) -->
			<button
				class="hamburger-button mobile-only"
				onclick={toggleMobileMenu}
				aria-label="Toggle menu"
				aria-expanded={showMobileMenu}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{#if showMobileMenu}
						<!-- X icon when menu is open -->
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					{:else}
						<!-- Hamburger icon when menu is closed -->
						<line x1="3" y1="12" x2="21" y2="12"></line>
						<line x1="3" y1="6" x2="21" y2="6"></line>
						<line x1="3" y1="18" x2="21" y2="18"></line>
					{/if}
				</svg>
			</button>
		</div>

		<!-- Mobile dropdown menu -->
		{#if showMobileMenu}
			<div class="mobile-menu" transition:fade={{ duration: 200 }}>
				<button class="mobile-menu-item" onclick={handleUploadClick} disabled={uploading}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
						<polyline points="17 8 12 3 7 8"></polyline>
						<line x1="12" x2="12" y1="3" y2="15"></line>
					</svg>
					<span>Upload Game</span>
				</button>
				<button class="mobile-menu-item" onclick={handleBrowseStories}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
						<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
					</svg>
					<span>Story Library</span>
				</button>
				<button class="mobile-menu-item" onclick={handleAboutClick}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M12 16v-4"></path>
						<path d="M12 8h.01"></path>
					</svg>
					<span>About</span>
				</button>
				<button class="mobile-menu-item" onclick={handleHelpClick}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<path d="M12 17h.01"></path>
					</svg>
					<span>Help</span>
				</button>
			</div>
		{/if}

		{#if uploadStatus}
			<div class="upload-status" transition:fade={{ duration: 200 }}>
				{uploadStatus}
			</div>
		{/if}
		<div class="welcome-container">
			<div class="dc-start-screen-container" data-testid="game-selector">
				<div class="game-cards-grid">
					{#each allGames as game, index}
						{@const gameSlug =
							game.slug || game.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown'}
						{@const saveData = gameSaveData[gameSlug]}
						<div class="game-card-wrapper">
							<div
								class="game-card game-card-{(index % 5) + 1}"
								class:has-custom={game.isCustom}
								data-augmented-ui={index % 5 === 0
									? 'tl-clip tr-clip-x br-clip-x border'
									: index % 5 === 1
										? 'tl-clip-y tr-clip br-clip-x border'
										: index % 5 === 2
											? 'tl-clip-y tr-clip-x br-clip border'
											: index % 5 === 3
												? 'tl-clip tr-clip-y br-clip-x bl-clip border'
												: 'tl-clip-x tr-clip br-clip-y bl-clip border'}
								data-testid="game-card-{game.slug}"
							>
								<h3 class="game-card-title">
									{game.title}
									{#if game.isCustom}
										<span class="custom-badge">Custom</span>
									{/if}
								</h3>
								<p class="game-subtitle">
									{game.isCustom
										? 'Your custom adventure'
										: gameDescriptions[game.slug] || 'Begin your adventure'}
								</p>

								<!-- Action buttons on card -->
								<div class="card-action-buttons">
									{#if saveData}
										<!-- Resume button -->
										<button
											class="icon-action-btn resume-btn"
											onclick={(e) => handleResumeGame(game, e)}
											title="Resume saved game"
											aria-label="Resume saved game"
										>
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<polygon points="5 3 19 12 5 21 5 3"></polygon>
											</svg>
										</button>
										<!-- Delete save button -->
										<button
											class="icon-action-btn delete-btn"
											onclick={(e) => handleDeleteSave(game, e)}
											title="Delete saved game"
											aria-label="Delete saved game"
										>
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<polyline points="3 6 5 6 21 6"></polyline>
												<path
													d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												></path>
											</svg>
										</button>
									{:else}
										<!-- Start/Play button -->
										<button
											class="icon-action-btn start-btn"
											onclick={() => handleStartGame(game)}
											title="Start new game"
											aria-label="Start new game"
										>
											<svg
												width="20"
												height="20"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<polygon points="5 3 19 12 5 21 5 3"></polygon>
											</svg>
										</button>
									{/if}
								</div>
							</div>

							<!-- Remove button for custom games -->
							{#if game.isCustom}
								<button
									class="remove-custom-btn"
									onclick={(e) => handleRemoveCustomGame(game, e)}
									title="Remove custom game"
									aria-label="Remove custom game"
								>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								</button>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>
{/if}

<!-- Delete Confirmation Modal -->
<ConfirmModal
	isOpen={showDeleteModal}
	title="Delete Saved Game"
	message={gameToDelete
		? `Are you sure you want to delete your saved game for "${gameToDelete.title}"?\n\nThis will permanently delete your saved progress. This cannot be undone.`
		: 'Delete saved game?'}
	confirmText="DELETE"
	cancelText="CANCEL"
	onConfirm={confirmDeleteSave}
	onCancel={cancelDeleteSave}
/>

<!-- About Modal -->
<AboutModal
	isVisible={showAboutModal}
	onClose={() => (showAboutModal = false)}
	appVersion={APP_VERSION}
/>

<!-- Settings Modal -->
<HomeSettingsModal
	isVisible={showSettingsModal}
	onClose={() => (showSettingsModal = false)}
	bind:selectedDifficulty
	bind:selectedDiceTheme
	{availableDiceThemes}
/>

<!-- Help Modal -->
<HelpModal isOpen={showHelpModal} onClose={() => (showHelpModal = false)} />

<style>
	:global(body) {
		overflow-y: auto;
	}

	/* CRITICAL: Disable all pointer events when modal is active */
	/* This prevents clicking through the modal backdrop to page content */
	.form-container.modal-active,
	.instructions-choice-container.modal-active {
		pointer-events: none;
	}

	.page-header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-md) var(--space-lg);
		background: rgba(10, 10, 20, 0.05);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
	}

	.header-logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--space-sm);
	}

	.logo-dice {
		width: clamp(48px, 8vw, 72px);
		height: auto;
		filter: drop-shadow(0 0 12px rgba(217, 70, 239, 0.6))
			drop-shadow(0 0 24px rgba(217, 70, 239, 0.3));
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.version-text {
		font-family: var(--font-display);
		font-size: clamp(0.75rem, 1.5vw, 1rem);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
	}

	.header-buttons {
		display: flex;
		gap: var(--space-md);
		align-items: center;
	}

	/* Desktop/Mobile visibility toggles */
	.desktop-only {
		display: flex;
	}

	.mobile-only {
		display: none;
	}

	/* Hamburger button styling */
	.hamburger-button {
		color: var(--color-brand-yellow);
		background: none;
		border: none;
		padding: var(--space-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.hamburger-button svg {
		filter: drop-shadow(0 0 4px var(--color-brand-yellow));
		transition: all var(--transition-fast);
	}

	.hamburger-button:hover {
		color: var(--color-neon-cyan);
		transform: scale(1.1);
	}

	.hamburger-button:hover svg {
		filter: drop-shadow(0 0 8px var(--color-neon-cyan));
	}

	.hamburger-button:active {
		transform: scale(1.05);
	}

	/* Mobile menu dropdown */
	.mobile-menu {
		position: fixed;
		top: 80px;
		right: var(--space-md);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.95), rgba(15, 15, 25, 0.95));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 2px solid var(--color-neon-cyan);
		border-radius: 8px;
		padding: var(--space-sm);
		min-width: 200px;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.3),
			0 8px 32px rgba(0, 0, 0, 0.6);
		z-index: 1001;
	}

	.mobile-menu-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-md);
		background: transparent;
		border: none;
		color: var(--color-brand-yellow);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: 4px;
		text-align: left;
	}

	.mobile-menu-item svg {
		flex-shrink: 0;
		filter: drop-shadow(0 0 4px currentColor);
	}

	.mobile-menu-item:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(217, 70, 239, 0.15));
		color: var(--color-neon-cyan);
		transform: translateX(4px);
	}

	.mobile-menu-item:active:not(:disabled) {
		transform: translateX(2px);
	}

	.mobile-menu-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.header-button {
		color: var(--color-brand-yellow);
		text-decoration: none;
		background: none;
		border: none;
		padding: var(--space-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}

	.header-button svg {
		width: 28px;
		height: 28px;
		filter: drop-shadow(0 0 4px var(--color-brand-yellow));
		transition: all var(--transition-fast);
	}

	.header-button:hover {
		color: var(--color-neon-cyan);
		transform: scale(1.1);
	}

	.header-button:hover svg {
		filter: drop-shadow(0 0 8px var(--color-neon-cyan));
	}

	.header-button:active {
		transform: scale(1.05);
	}

	.header-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.header-button:disabled:hover {
		color: var(--color-brand-yellow);
		transform: none;
	}

	.upload-button:hover:not(:disabled) {
		color: var(--color-cyber-magenta);
	}

	.upload-button:hover:not(:disabled) svg {
		filter: drop-shadow(0 0 8px var(--color-cyber-magenta));
	}

	.library-button:hover {
		color: var(--color-cyber-magenta);
	}

	.library-button:hover svg {
		filter: drop-shadow(0 0 8px var(--color-cyber-magenta));
	}

	.upload-status {
		text-align: center;
		padding: var(--space-md);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(217, 70, 239, 0.1));
		border: 1px solid rgba(0, 255, 255, 0.3);
		border-radius: 8px;
		margin: var(--space-md) var(--space-lg);
		color: var(--color-neon-cyan);
		font-size: var(--text-sm);
		text-shadow: 0 0 4px rgba(0, 255, 255, 0.5);
	}

	.welcome-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		margin-top: var(--space-lg);
		/* Fluid padding that scales with viewport */
		padding-inline: clamp(var(--space-md), 3vw, var(--space-2xl));
		gap: clamp(var(--space-lg), 2vw, var(--space-xl));
		/* Add subtle fade-in animation */
		animation: fadeInContent 0.6s ease-out;
	}

	@keyframes fadeInContent {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dc-start-screen-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
	}

	/* ============================================
	   GAME CARDS GRID
	   ============================================ */
	.game-cards-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		/* Fluid gap that scales */
		gap: clamp(var(--space-md), 2vw, var(--space-xl));
		width: 100%;
	}

	/* ============================================
	   GAME CARD BASE STYLES
	   ============================================ */
	.game-card-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.game-card {
		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		padding: clamp(var(--space-lg), 2vw, var(--space-2xl)) var(--space-lg);
		min-height: 200px;

		/* Glassmorphism Background - enhanced depth with gradient */
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.6), rgba(15, 15, 25, 0.5));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);

		/* Remove default styling */
		border: none;
		position: relative;

		/* Transitions */
		transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

		/* Staggered fade-in animation */
		animation:
			cardFadeIn 0.6s ease-out 0.3s backwards,
			float 25s ease-in-out infinite;
	}

	/* Ethereal floating animation */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	/* Stagger the fade-in and float animations for each card */
	.game-card-1 {
		animation-delay: 0.1s, 0s;
	}
	.game-card-2 {
		animation-delay: 0.2s, 1.2s;
	}
	.game-card-3 {
		animation-delay: 0.3s, 2.4s;
	}
	.game-card-4 {
		animation-delay: 0.4s, 3.6s;
	}
	.game-card-5 {
		animation-delay: 0.5s, 4.8s;
	}

	@keyframes cardFadeIn {
		from {
			opacity: 0;
			transform: translateY(20px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ============================================
	   GAME CARD VARIANTS - ROTATING AUGMENTED-UI PATTERNS
	   ============================================ */

	/* Card 1 - Cyan to Magenta gradient */
	.game-card-1 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-cyber-magenta));
		--aug-tl: 8px;
		--aug-tr: 14px;
		--aug-br: 14px;

		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			0 0 30px rgba(0, 255, 255, 0.15),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	/* Card 2 - Magenta to Yellow gradient */
	.game-card-2 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		--aug-tl: 14px;
		--aug-tr: 8px;
		--aug-br: 14px;

		box-shadow:
			0 0 15px rgba(217, 70, 239, 0.3),
			0 0 30px rgba(217, 70, 239, 0.15),
			inset 0 0 10px rgba(217, 70, 239, 0.1);
	}

	/* Card 3 - Yellow to Cyan gradient */
	.game-card-3 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-brand-yellow), var(--color-neon-cyan));
		--aug-tl: 14px;
		--aug-tr: 14px;
		--aug-br: 8px;

		box-shadow:
			0 0 15px rgba(255, 215, 0, 0.3),
			0 0 30px rgba(255, 215, 0, 0.15),
			inset 0 0 10px rgba(255, 215, 0, 0.1);
	}

	/* Card 4 - Cyan to Yellow gradient */
	.game-card-4 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-neon-cyan), var(--color-brand-yellow));
		--aug-tl: 8px;
		--aug-tr: 14px;
		--aug-br: 14px;
		--aug-bl: 8px;

		box-shadow:
			0 0 15px rgba(0, 255, 255, 0.3),
			0 0 30px rgba(0, 255, 255, 0.15),
			inset 0 0 10px rgba(0, 255, 255, 0.1);
	}

	/* Card 5 - Magenta to Cyan gradient */
	.game-card-5 {
		--aug-border-all: 2px;
		--aug-border-bg: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-neon-cyan));
		--aug-tl: 14px;
		--aug-tr: 8px;
		--aug-br: 14px;
		--aug-bl: 8px;

		box-shadow:
			0 0 15px rgba(217, 70, 239, 0.3),
			0 0 30px rgba(217, 70, 239, 0.15),
			inset 0 0 10px rgba(217, 70, 239, 0.1);
	}

	/* ============================================
	   GAME CARD ACTION BUTTONS
	   ============================================ */

	.card-action-buttons {
		display: flex;
		gap: var(--space-md);
		margin-top: var(--space-md);
		justify-content: center;
		align-items: center;
	}

	.icon-action-btn {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(217, 70, 239, 0.15));
		border: 2px solid rgba(0, 255, 255, 0.5);
		color: var(--color-neon-cyan);
		padding: var(--space-sm);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		position: relative;
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.icon-action-btn:hover {
		transform: translateY(-3px) scale(1.1);
		box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
		border-color: var(--color-neon-cyan);
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.25), rgba(217, 70, 239, 0.25));
	}

	.icon-action-btn:active {
		transform: translateY(-1px) scale(1.05);
	}

	.icon-action-btn svg {
		width: 20px;
		height: 20px;
		filter: drop-shadow(0 0 4px currentColor);
	}

	.start-btn {
		background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(217, 70, 239, 0.2));
		border-color: rgba(0, 255, 255, 0.6);
		color: var(--color-neon-cyan);
	}

	.start-btn:hover {
		border-color: var(--color-neon-cyan);
		box-shadow: 0 0 25px rgba(0, 255, 255, 0.7);
	}

	.resume-btn {
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(0, 255, 255, 0.15));
		border-color: rgba(255, 215, 0, 0.5);
		color: var(--color-brand-yellow);
	}

	.resume-btn:hover {
		border-color: var(--color-brand-yellow);
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
	}

	.delete-btn {
		background: linear-gradient(135deg, rgba(255, 0, 0, 0.15), rgba(255, 100, 100, 0.15));
		border-color: rgba(255, 100, 100, 0.5);
		color: #ff6b6b;
	}

	.delete-btn:hover {
		border-color: #ff6b6b;
		box-shadow: 0 0 20px rgba(255, 100, 100, 0.6);
		background: linear-gradient(135deg, rgba(255, 0, 0, 0.25), rgba(255, 100, 100, 0.25));
	}

	/* ============================================
	   GAME CARD TYPOGRAPHY
	   ============================================ */

	.game-card-title {
		font-family: 'lixdu', monospace;
		font-size: clamp(1.25rem, 1.8vw, 1.75rem);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		margin: 0;
		text-align: center;
		line-height: 1.2;
		/* Improve text rendering */
		font-weight: 700;
	}

	.game-subtitle {
		font-family: 'Courier New', monospace;
		font-size: clamp(0.8rem, 1vw, 0.95rem);
		color: rgba(255, 255, 255, 0.8);
		text-align: center;
		margin: 0;
		line-height: var(--line-height-relaxed);
		/* Subtle glow for better readability */
		text-shadow: 0 0 4px rgba(0, 255, 255, 0.15);
	}

	.custom-badge {
		display: inline-block;
		margin-left: var(--space-xs);
		padding: 2px 8px;
		font-size: 0.65rem;
		background: linear-gradient(135deg, var(--color-cyber-magenta), var(--color-brand-yellow));
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #000;
		font-weight: 700;
	}

	/* ============================================
	   CUSTOM GAME REMOVE BUTTON
	   ============================================ */
	.remove-custom-btn {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		background: rgba(255, 0, 0, 0.8);
		border: 1px solid #ff6b6b;
		color: white;
		padding: var(--space-xs);
		border-radius: 50%;
		width: 32px;
		height: 32px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.remove-custom-btn:hover {
		background: rgba(255, 0, 0, 1);
		transform: rotate(90deg) scale(1.1);
		box-shadow: 0 0 15px rgba(255, 0, 0, 0.6);
	}

	/* ============================================
	   RESPONSIVE LAYOUTS
	   ============================================ */

	/* Large tablet/small desktop - 3 columns maintained but tighter */
	@media (max-width: 1200px) {
		.game-cards-grid {
			gap: var(--space-md);
		}
	}

	/* Tablet - 2 columns */
	@media (max-width: 900px) {
		.game-cards-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-md);
		}

		.welcome-container {
			padding-inline: var(--space-lg);
		}

		.page-header h2 {
			font-size: var(--text-2xl);
		}
	}

	/* Medium screens - show hamburger menu to prevent crowding */
	@media (max-width: 768px) {
		.desktop-only {
			display: none !important;
		}

		.mobile-only {
			display: flex;
		}
	}

	/* Small tablet - 2 columns, more compact */
	@media (max-width: 700px) {
		.game-card {
			min-height: 180px;
			padding: var(--space-xl) var(--space-md);
		}
	}

	/* Mobile - 1 column */
	@media (max-width: 600px) {
		.game-cards-grid {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}

		.game-card {
			padding: var(--space-lg) var(--space-md);
			min-height: 160px;
		}

		.welcome-container {
			padding-inline: var(--space-md);
		}

		.dc-start-screen-container {
			gap: var(--space-lg);
		}

		.page-header {
			padding: var(--space-sm) var(--space-md);
		}

		.page-header h2 {
			font-size: var(--text-xl);
		}

		.header-buttons {
			gap: var(--space-sm);
		}

		.header-link svg {
			width: 24px;
			height: 24px;
		}

		/* Show mobile menu, hide desktop buttons */
		.desktop-only {
			display: none !important;
		}

		.mobile-only {
			display: flex;
		}

		/* Adjust logo and version for smaller screens */
		.logo-dice {
			width: 48px;
		}

		.version-text {
			font-size: 0.75rem;
		}

		/* Mobile menu positioning */
		.mobile-menu {
			right: var(--space-sm);
			left: var(--space-sm);
			min-width: auto;
		}
	}

	/* ============================================
	   INSTRUCTIONS CHOICE SCREEN
	   ============================================ */

	.instructions-choice-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
		overflow-y: auto;
	}

	.choice-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		max-width: 800px;
		width: 100%;
		animation: fadeInContent 0.6s ease-out;
	}

	.choice-content h1 {
		font-size: clamp(2rem, 4vw, 3rem);
		margin-bottom: var(--space-md);
		color: var(--color-neon-cyan);
		text-shadow:
			0 0 20px rgba(0, 255, 255, 0.6),
			0 0 40px rgba(0, 255, 255, 0.3);
	}

	.subtitle {
		font-size: clamp(1rem, 2vw, 1.25rem);
		margin-bottom: var(--space-2xl);
		color: rgba(255, 255, 255, 0.8);
	}

	.choice-cards {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		width: 100%;
	}

	.choice-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-2xl);
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: var(--dc-default-border-radius);
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
		min-height: 180px;
		text-align: center;
	}

	.choice-card:hover,
	.choice-card:focus {
		background: linear-gradient(135deg, rgba(20, 20, 35, 0.9), rgba(25, 25, 40, 0.8));
		border-color: var(--color-neon-cyan);
		transform: translateY(-4px);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.4),
			0 0 60px rgba(0, 255, 255, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.1);
	}

	.choice-card:active {
		transform: translateY(-2px);
	}

	.skip-card {
		border-color: rgba(217, 70, 239, 0.3);
		box-shadow:
			0 0 20px rgba(217, 70, 239, 0.2),
			inset 0 0 20px rgba(217, 70, 239, 0.05);
	}

	.skip-card:hover,
	.skip-card:focus {
		border-color: var(--color-cyber-magenta);
		box-shadow:
			0 0 30px rgba(217, 70, 239, 0.4),
			0 0 60px rgba(217, 70, 239, 0.2),
			inset 0 0 30px rgba(217, 70, 239, 0.1);
	}

	.skip-always-card {
		border-color: rgba(255, 215, 0, 0.3);
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.2),
			inset 0 0 20px rgba(255, 215, 0, 0.05);
	}

	.skip-always-card:hover,
	.skip-always-card:focus {
		border-color: var(--color-brand-yellow);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.4),
			0 0 60px rgba(255, 215, 0, 0.2),
			inset 0 0 30px rgba(255, 215, 0, 0.1);
	}

	.icon-wrapper {
		color: var(--color-neon-cyan);
		filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
	}

	.skip-card .icon-wrapper {
		color: var(--color-cyber-magenta);
		filter: drop-shadow(0 0 10px rgba(217, 70, 239, 0.6));
	}

	.skip-always-card .icon-wrapper {
		color: var(--color-brand-yellow);
		filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
	}

	.choice-card h3 {
		font-size: clamp(1.25rem, 2vw, 1.5rem);
		font-weight: 600;
		color: white;
		margin: 0;
	}

	.choice-card p {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.recommendation {
		font-size: var(--text-sm);
		color: var(--color-neon-cyan);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: var(--space-xs);
	}

	.skip-card .recommendation {
		color: var(--color-cyber-magenta);
	}

	.skip-always-card .recommendation {
		color: var(--color-brand-yellow);
	}

	@media (max-width: 768px) {
		.instructions-choice-container {
			padding: var(--space-lg);
		}

		.choice-content h1 {
			font-size: var(--text-2xl);
		}

		.subtitle {
			font-size: var(--text-base);
		}

		.choice-cards {
			gap: var(--space-lg);
		}

		.choice-card {
			padding: var(--space-xl);
			min-height: 160px;
		}

		.icon-wrapper svg {
			width: 36px;
			height: 36px;
		}

		.choice-card h3 {
			font-size: var(--text-lg);
		}

		.choice-card p {
			font-size: var(--text-sm);
		}
	}

	@media (max-width: 450px) {
		.instructions-choice-container {
			padding: var(--space-md);
		}

		.choice-card {
			padding: var(--space-lg);
			min-height: 140px;
		}

		.icon-wrapper svg {
			width: 32px;
			height: 32px;
		}
	}

	/* ============================================
	   ACCESSIBILITY - REDUCED MOTION
	   ============================================ */

	@media (prefers-reduced-motion: reduce) {
		.welcome-container,
		.game-card,
		.choice-card {
			animation: none !important;
		}

		.icon-action-btn:hover,
		.icon-action-btn:active,
		.choice-card:hover,
		.choice-card:focus {
			transition: none !important;
			transform: none !important;
		}

		.header-button:hover,
		.header-button:active {
			transform: none !important;
		}
	}
</style>
