<script>
	import { onMount } from 'svelte';
	import AugmentedButton from './AugmentedButton.svelte';
	import { hasSavedGame, getSaveMetadata } from '../stores/indexedDBStorage.js';
	import { resumeGame, deleteSavedGame } from '../stores/gameActions.svelte.js';
	import {
		getCustomGames,
		addCustomGame,
		removeCustomGame,
		getCustomGame
	} from '../stores/customGames.js';

	let {
		players = [],
		games = [],
		selectedGame = $bindable(null), //games.find((g) => g.title == gameConfig.title);
		selectedPlayer = $bindable(null), // players?.find((p) => p.name == gameState.player);
		ongameselected = () => {},
		onbrowsestories = () => {} // Callback when user wants to browse completed games
	} = $props();

	let status = $state('');
	let savedGameExists = $state(false);
	let saveMetadata = $state(null);
	let customGames = $state([]);
	let fileInput = $state(null);
	let uploading = $state(false);

	// ✅ FIXED: Use $derived instead of chained $effect
	// Merge custom games with server games reactively
	let allGames = $derived(
		[...customGames, ...games].sort((a, b) => a.title.localeCompare(b.title))
	);

	// ✅ FIXED: Use onMount instead of $effect for one-time initialization
	onMount(() => {
		customGames = getCustomGames();
	});

	// ✅ FIXED: Use guard pattern to prevent re-triggering on same game
	let lastCheckedSlug = '';
	$effect(() => {
		if (selectedGame) {
			const gameSlug =
				selectedGame.slug ||
				selectedGame.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
				'default';

			// Only check if slug changed (prevent re-trigger on state updates)
			if (gameSlug !== lastCheckedSlug) {
				lastCheckedSlug = gameSlug;

				// Check for saved game (async)
				hasSavedGame(gameSlug).then((exists) => {
					savedGameExists = exists;
					if (exists) {
						// Load metadata if save exists
						getSaveMetadata(gameSlug).then((metadata) => {
							saveMetadata = metadata;
						});
					} else {
						saveMetadata = null;
					}
				});
			}
		} else {
			// Reset when no game selected
			lastCheckedSlug = '';
			savedGameExists = false;
			saveMetadata = null;
		}
	});

	async function setConfig() {
		if (selectedGame && selectedPlayer) {
			// If this is a custom game, we need to pass the full config
			// Otherwise pass the slug for server-side loading
			if (selectedGame.isCustom) {
				// For custom games, the game object is already the full config
				ongameselected({ selectedGame, selectedPlayer });
			} else {
				// For server games, pass the game reference (has slug)
				ongameselected({ selectedGame, selectedPlayer });
			}
		} else {
			status = 'Please select a player and a game';
		}
	}

	async function handleFileUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.name.endsWith('.game.md')) {
			status = 'Please select a .game.md file';
			return;
		}

		uploading = true;
		status = 'Uploading and parsing game file...';

		try {
			const text = await file.text();
			const result = addCustomGame(text, file.name);

			if (result.success) {
				// Reload custom games list
				customGames = getCustomGames();

				// Auto-select the newly uploaded game
				selectedGame = result.gameConfig;

				status = `Successfully loaded "${result.gameConfig.title}"!`;
			} else {
				status = `Error: ${result.error}`;
			}
		} catch (error) {
			status = `Failed to load file: ${error.message}`;
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

	function handleRemoveCustomGame() {
		if (!selectedGame?.isCustom) {
			return;
		}

		if (confirm(`Are you sure you want to remove "${selectedGame.title}"?`)) {
			if (removeCustomGame(selectedGame.slug)) {
				customGames = getCustomGames();
				selectedGame = null;
				status = 'Custom game removed';
			}
		}
	}

	async function handleResumeGame() {
		if (!selectedGame) {
			status = 'Please select a game to resume';
			return;
		}

		const gameSlug =
			selectedGame.slug ||
			selectedGame.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
			'default';

		if (await resumeGame(gameSlug)) {
			// Game resumed successfully
			status = 'Game resumed!';
		} else {
			status = 'Failed to resume game';
		}
	}

	function handleDeleteSave() {
		if (!selectedGame) {
			return;
		}

		if (confirm('Are you sure you want to delete your saved game? This cannot be undone.')) {
			const gameSlug =
				selectedGame.slug ||
				selectedGame.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
				'default';

			if (deleteSavedGame(gameSlug)) {
				savedGameExists = false;
				saveMetadata = null;
				status = 'Saved game deleted';
			}
		}
	}
</script>

<div class="dc-start-screen-container">
	<!-- Hidden file input -->
	<input
		type="file"
		accept=".game.md,.md"
		bind:this={fileInput}
		onchange={handleFileUpload}
		style="display: none;"
	/>

	<div>
		<label for="player">Player:</label>
		<select id="player" bind:value={selectedPlayer}>
			<option value={null}>Please select a player</option>
			{#each players as player}
				<option value={player}>{player.name}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="gameSelect">Select a Game:</label>
		<select id="gameSelect" bind:value={selectedGame}>
			<option value={null}>Please select a game</option>
			{#each allGames as game}
				<option value={game}>
					{game.title}{game.isCustom ? ' (Custom)' : ''}
				</option>
			{/each}
		</select>
	</div>

	<!-- Upload custom game button -->
	<div class="upload-section">
		<AugmentedButton
			text={uploading ? 'Uploading...' : 'Upload Custom Game'}
			onclick={handleUploadClick}
			disabled={uploading}
		/>
		{#if selectedGame?.isCustom}
			<AugmentedButton text="Remove Custom Game" onclick={handleRemoveCustomGame} />
		{/if}
	</div>

	<!-- Browse Completed Games -->
	<div class="browse-section">
		<AugmentedButton text="Browse Story Library" onclick={onbrowsestories} style="secondary" />
	</div>

	{#if savedGameExists && saveMetadata}
		<div class="saved-game-panel">
			<h4>Saved Game Found</h4>
			<div class="save-info">
				<p><strong>Player:</strong> {saveMetadata.playerName}</p>
				<p><strong>Round:</strong> {saveMetadata.round}</p>
				<p>
					<strong>Tower:</strong>
					{saveMetadata.tower} |
					<strong>Tokens:</strong>
					{saveMetadata.tokens}
				</p>
				<p class="save-time">
					<strong>Saved:</strong>
					{new Date(saveMetadata.timestamp).toLocaleString()}
				</p>
			</div>
			<div class="button-group">
				<AugmentedButton text="Resume Game" onclick={handleResumeGame} />
				<AugmentedButton text="Delete Save" onclick={handleDeleteSave} />
			</div>
		</div>
	{/if}

	{#if !savedGameExists}
		<AugmentedButton text="Load Game" onclick={() => setConfig()} />
	{/if}

	{#if status}
		<p class="status-message">{status}</p>
	{/if}
</div>

<style>
	.dc-start-screen-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: var(--dc-default-padding);
		overflow: visible; /* Allow button glows to extend beyond bounds */
	}

	select {
		width: 100%;
	}

	.upload-section {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0.5rem 0;
		border-top: 1px solid rgba(0, 255, 255, 0.2);
		margin: 0.5rem 0;
	}

	.browse-section {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		padding: 0.5rem 0;
		border-top: 1px solid rgba(138, 43, 226, 0.3);
		border-bottom: 1px solid rgba(138, 43, 226, 0.3);
		margin: 0.5rem 0;
	}

	.saved-game-panel {
		background: linear-gradient(135deg, rgba(0, 20, 40, 0.5), rgba(10, 10, 30, 0.7));
		border: 2px solid var(--color-neon-cyan, #00ffff);
		border-radius: 8px;
		padding: 1rem;
		margin: 0.5rem 0;
		box-shadow:
			0 0 20px rgba(0, 255, 255, 0.2),
			inset 0 0 20px rgba(0, 255, 255, 0.05);
	}

	.saved-game-panel h4 {
		margin: 0 0 0.75rem 0;
		color: var(--color-neon-cyan, #00ffff);
		text-align: center;
		font-size: 1.1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
	}

	.save-info {
		margin-bottom: 1rem;
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.save-info p {
		margin: 0.25rem 0;
		color: var(--color-text-primary, #e0e0e0);
	}

	.save-info strong {
		color: var(--color-brand-yellow, #ffd700);
		font-weight: 700;
	}

	.save-time {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(0, 255, 255, 0.2);
		font-size: 0.8rem;
		opacity: 0.8;
	}

	.button-group {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.status-message {
		text-align: center;
		color: var(--color-brand-yellow, #ffd700);
		font-size: 0.9rem;
		margin: 0.5rem 0;
	}
</style>
