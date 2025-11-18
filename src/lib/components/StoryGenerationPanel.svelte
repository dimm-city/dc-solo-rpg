<script>
	/**
	 * StoryGenerationPanel - AI story generation and display
	 * Integrated into StoryMode to generate narrative summaries
	 */
	import AugmentedButton from './AugmentedButton.svelte';
	import AudioPlayer from './AudioPlayer.svelte';
	import AISettings from './AISettings.svelte';
	import { generateStory } from '../services/storyGeneration.js';
	import { generateAudioNarration, isTTSAvailable } from '../services/textToSpeech.js';
	import { saveAIStory, loadAIStory, deleteAIStory } from '../stores/indexedDBStorage.js';
	import { isAIConfigured } from '../services/aiSettings.js';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	let {
		savedGame = null, // Complete saved game object
		saveKey = '' // IndexedDB save key (gameSlug:completed:timestamp)
	} = $props();

	// Story state
	let story = $state(null);
	let hasStory = $state(false);

	// UI state
	let isGenerating = $state(false);
	let isGeneratingAudio = $state(false);
	let generateAudio = $state(true);
	let showSettings = $state(false);
	let errorMessage = $state('');
	let aiConfigured = $state(false);
	let ttsAvailable = $state(false);

	// Progress messages
	let progressMessage = $state('');

	onMount(async () => {
		// Check if AI is configured
		aiConfigured = await isAIConfigured();

		// Check if TTS is available
		ttsAvailable = await isTTSAvailable();

		// Load existing story if it exists
		if (saveKey) {
			const existingStory = await loadAIStory(saveKey);
			if (existingStory) {
				story = existingStory;
				hasStory = true;
			}
		}
	});

	async function handleGenerate() {
		if (!aiConfigured) {
			showSettings = true;
			return;
		}

		isGenerating = true;
		errorMessage = '';
		progressMessage = 'Generating story with AI...';

		try {
			// Build game data for story generation
			const gameData = {
				playerName: savedGame.playerName,
				gameTitle: savedGame.gameTitle || savedGame.config?.title,
				introText: savedGame.config?.introduction?.text || '',
				cardLog: savedGame.cardLog || [],
				journalEntries: savedGame.journalEntries || [],
				isWon: savedGame.isWon,
				finalTower: savedGame.finalTower,
				roundsSurvived: savedGame.roundsSurvived
			};

			// Generate story text
			const generatedStory = await generateStory(gameData);
			story = generatedStory;

			// Generate audio if requested
			let audioBlob = null;
			if (generateAudio && ttsAvailable) {
				progressMessage = 'Generating audio narration...';
				isGeneratingAudio = true;

				try {
					audioBlob = await generateAudioNarration(generatedStory.text);
				} catch (audioError) {
					console.error('Audio generation failed:', audioError);
					errorMessage = `Story generated, but audio failed: ${audioError.message}`;
				} finally {
					isGeneratingAudio = false;
				}
			}

			// Save to IndexedDB
			progressMessage = 'Saving story...';
			await saveAIStory(saveKey, generatedStory, audioBlob);

			// Reload story to get audio data
			const savedStory = await loadAIStory(saveKey);
			if (savedStory) {
				story = savedStory;
			}

			hasStory = true;
			progressMessage = '';
		} catch (error) {
			console.error('Story generation failed:', error);
			errorMessage = error.message || 'Failed to generate story';
			progressMessage = '';
		} finally {
			isGenerating = false;
			isGeneratingAudio = false;
		}
	}

	async function handleRegenerate() {
		// Delete existing story and regenerate
		await deleteAIStory(saveKey);
		story = null;
		hasStory = false;
		await handleGenerate();
	}

	function handleOpenSettings() {
		showSettings = true;
	}

	function handleCloseSettings() {
		showSettings = false;
		// Re-check if AI is configured
		isAIConfigured().then((configured) => {
			aiConfigured = configured;
		});
	}
</script>

{#if showSettings}
	<AISettings onClose={handleCloseSettings} />
{/if}

<div class="story-generation-panel" transition:slide={{ duration: 300 }}>
	<div class="panel-header" data-augmented-ui="tl-clip tr-clip border">
		<div class="header-content">
			<h3>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				AI Story Summary
			</h3>
			<button class="settings-button" onclick={handleOpenSettings} aria-label="AI Settings">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<circle cx="12" cy="12" r="3" />
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 1v6m0 6v6m9.071-13.071l-4.242 4.242m-5.656 5.656l-4.242 4.242M1 12h6m6 0h6m1.071-9.071l-4.242 4.242m-5.656 5.656l-4.242 4.242"
					/>
				</svg>
			</button>
		</div>
		<p class="panel-description">
			Generate a narrative summary of your game session using AI, with optional audio narration.
		</p>
	</div>

	<div class="panel-body">
		{#if !hasStory}
			{#if !aiConfigured}
				<div class="info-card" transition:fade={{ duration: 200 }}>
					<p>Configure your AI provider to generate story summaries.</p>
					<AugmentedButton onclick={handleOpenSettings} label="Configure AI">
						Configure AI Settings
					</AugmentedButton>
				</div>
			{:else}
				<div class="generation-controls" transition:fade={{ duration: 200 }}>
					{#if ttsAvailable}
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={generateAudio} disabled={isGenerating} />
							<span>Generate audio narration</span>
						</label>
					{/if}

					<AugmentedButton
						onclick={handleGenerate}
						disabled={isGenerating}
						label="Generate AI Story"
					>
						{isGenerating ? progressMessage : 'Generate Story'}
					</AugmentedButton>

					{#if errorMessage}
						<div class="error-message" transition:fade={{ duration: 200 }}>
							{errorMessage}
						</div>
					{/if}
				</div>
			{/if}
		{:else}
			<!-- Story Display -->
			<div class="story-content" transition:fade={{ duration: 300 }}>
				<div class="story-text">
					{story.text}
				</div>

				{#if story.audioData}
					<div class="story-audio">
						<AudioPlayer audioData={story.audioData} />
					</div>
				{/if}

				<div class="story-metadata">
					<span>Generated with {story.provider}</span>
					<span>•</span>
					<span>{new Date(story.generatedAt).toLocaleDateString()}</span>
				</div>

				<div class="story-actions">
					<AugmentedButton
						onclick={handleRegenerate}
						disabled={isGenerating}
						style="secondary"
						label="Regenerate Story"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							slot="icon"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Regenerate
					</AugmentedButton>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.story-generation-panel {
		background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(75, 0, 130, 0.2));
		border: 2px solid rgba(186, 85, 211, 0.4);
		border-radius: 8px;
		overflow: hidden;
	}

	.panel-header {
		padding: var(--space-lg);
		background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(26, 26, 26, 0.6));
		border-bottom: 2px solid rgba(186, 85, 211, 0.3);
		--aug-border-bg: linear-gradient(135deg, rgba(186, 85, 211, 0.2), rgba(138, 43, 226, 0.1));
		--aug-border: 2px;
		--aug-border-fallback-color: rgba(186, 85, 211, 0.3);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
	}

	.panel-header h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-cyber-magenta);
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.panel-header h3 svg {
		color: var(--color-cyber-magenta);
	}

	.panel-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.5;
	}

	.settings-button {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(138, 43, 226, 0.2);
		border: 2px solid rgba(138, 43, 226, 0.4);
		border-radius: 50%;
		color: var(--color-cyber-magenta);
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.settings-button:hover {
		background: rgba(138, 43, 226, 0.3);
		border-color: rgba(138, 43, 226, 0.6);
		transform: scale(1.05);
	}

	.panel-body {
		padding: var(--space-xl);
	}

	.info-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background: rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		text-align: center;
	}

	.info-card p {
		margin: 0;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
	}

	.generation-controls {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: stretch;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.9);
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.error-message {
		padding: var(--space-md);
		background: rgba(220, 20, 60, 0.2);
		border: 1px solid rgba(220, 20, 60, 0.4);
		border-radius: 4px;
		color: rgba(220, 20, 60, 1);
		font-size: 0.875rem;
		text-align: center;
	}

	.story-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.story-text {
		padding: var(--space-xl);
		background: rgba(0, 0, 0, 0.3);
		border-left: 4px solid var(--color-cyber-magenta);
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.9);
		white-space: pre-wrap;
	}

	.story-audio {
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.2);
		border-radius: 4px;
	}

	.story-metadata {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		justify-content: center;
	}

	.story-actions {
		display: flex;
		justify-content: center;
		padding-top: var(--space-md);
	}

	@media (max-width: 640px) {
		.panel-header {
			padding: var(--space-md);
		}

		.panel-body {
			padding: var(--space-md);
		}

		.story-text {
			padding: var(--space-md);
			font-size: 0.9rem;
		}
	}
</style>
