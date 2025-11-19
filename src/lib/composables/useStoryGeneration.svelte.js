/**
 * useStoryGeneration - AI story generation state management
 *
 * Manages story generation, loading, and AI configuration state
 *
 * @param {Object} savedGame - Complete saved game object
 * @param {string} saveKey - IndexedDB save key (gameSlug:completed:timestamp)
 * @returns {Object} Story generation state and control functions
 *
 * @example
 * const storyGen = useStoryGeneration(savedGame, saveKey);
 * await storyGen.generateStory(); // Generate AI story
 */

import { generateStory } from '$lib/services/storyGeneration.js';
import { generateAudioNarration, isTTSAvailable } from '$lib/services/textToSpeech.js';
import { saveAIStory, loadAIStory, deleteAIStory } from '$lib/stores/indexedDBStorage.js';
import { isAIConfigured } from '$lib/services/aiSettings.js';

export function useStoryGeneration(savedGame, saveKey) {
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

	// Initialize on mount
	$effect(() => {
		async function initialize() {
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
		}

		initialize();
	});

	async function generateStoryFn() {
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

	async function regenerateStory() {
		// Delete existing story and regenerate
		await deleteAIStory(saveKey);
		story = null;
		hasStory = false;
		await generateStoryFn();
	}

	function openSettings() {
		showSettings = true;
	}

	async function closeSettings() {
		showSettings = false;
		// Re-check if AI is configured
		aiConfigured = await isAIConfigured();
	}

	return {
		get story() {
			return story;
		},
		get hasStory() {
			return hasStory;
		},
		get isGenerating() {
			return isGenerating;
		},
		get isGeneratingAudio() {
			return isGeneratingAudio;
		},
		get generateAudio() {
			return generateAudio;
		},
		set generateAudio(value) {
			generateAudio = value;
		},
		get showSettings() {
			return showSettings;
		},
		get errorMessage() {
			return errorMessage;
		},
		get aiConfigured() {
			return aiConfigured;
		},
		get ttsAvailable() {
			return ttsAvailable;
		},
		get progressMessage() {
			return progressMessage;
		},
		generateStory: generateStoryFn,
		regenerateStory,
		openSettings,
		closeSettings
	};
}
