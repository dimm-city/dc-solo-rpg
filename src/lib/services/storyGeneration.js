/**
 * Story Generation Service
 * Generates narrative summaries of completed games using AI
 */
import { logger } from '../utils/logger.js';
import { loadAISettings } from './aiSettings.js';

/**
 * Build the prompt for story generation
 * @param {Object} gameData - Completed game data
 * @param {string} gameData.playerName - Player name
 * @param {string} gameData.gameTitle - Game title
 * @param {string} gameData.introText - Game introduction text
 * @param {Array} gameData.cardLog - Array of card events
 * @param {Array} gameData.journalEntries - Player journal entries
 * @param {boolean} gameData.isWon - Whether the player won
 * @param {number} gameData.finalTower - Final tower value
 * @param {number} gameData.roundsSurvived - Number of rounds survived
 * @returns {string} Formatted prompt for AI
 */
function buildStoryPrompt(gameData) {
	const {
		playerName,
		gameTitle,
		introText,
		cardLog = [],
		journalEntries = [],
		isWon,
		finalTower,
		roundsSurvived
	} = gameData;

	// Build narrative from card log
	const cardNarrative = cardLog
		.filter(entry => entry.type !== 'initial-damage' && entry.type !== 'final-damage')
		.map((entry, index) => {
			const round = entry.round || Math.floor(index / 3) + 1;
			let text = `Round ${round}: `;

			if (entry.description) {
				text += entry.description;
			}

			if (entry.story) {
				text += ` - ${entry.story.replace(/<[^>]*>/g, '').substring(0, 200)}`;
			}

			if (entry.damageRoll && entry.damageDealt) {
				text += ` (Stability check: rolled ${entry.damageRoll}, lost ${entry.damageDealt} stability)`;
			}

			return text;
		})
		.join('\n');

	// Build narrative from journal entries
	const journalNarrative = journalEntries
		.filter(entry => entry.text && entry.text.trim().length > 0)
		.map(entry => {
			return `Round ${entry.round} - Player reflection: "${entry.text}"`;
		})
		.join('\n');

	const outcome = isWon ? 'Victory' : 'Defeat';

	// Construct the prompt
	const prompt = `You are a narrative writer creating an immersive story summary of a solo role-playing game session.

Game: ${gameTitle}
Player: ${playerName}
Outcome: ${outcome} (${roundsSurvived} rounds survived, ${finalTower} stability remaining)

INTRODUCTION:
${introText || 'No introduction provided.'}

GAME EVENTS:
${cardNarrative || 'No game events recorded.'}

${journalNarrative ? `PLAYER REFLECTIONS:\n${journalNarrative}\n` : ''}

Please write a compelling narrative summary (400-600 words) of this game session. The story should:
1. Be written in third person, referring to the player as "${playerName}"
2. Capture the emotional journey and key moments
3. Weave together the game events and player reflections into a cohesive narrative
4. Include vivid descriptions and atmosphere consistent with the game's tone
5. Build toward the ${outcome.toLowerCase()} ending
6. Be engaging and dramatic, suitable for reading aloud

Write the story now:`;

	return prompt;
}

/**
 * Generate story using OpenAI API
 * @param {string} prompt - Story generation prompt
 * @param {Object} settings - AI settings
 * @returns {Promise<string>} Generated story text
 */
async function generateWithOpenAI(prompt, settings) {
	const { apiKey, model = 'gpt-4o' } = settings;

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.8,
			max_tokens: 1500
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
	}

	const data = await response.json();
	return data.choices[0].message.content.trim();
}

/**
 * Generate story using Anthropic Claude API
 * @param {string} prompt - Story generation prompt
 * @param {Object} settings - AI settings
 * @returns {Promise<string>} Generated story text
 */
async function generateWithAnthropic(prompt, settings) {
	const { apiKey, model = 'claude-3-5-sonnet-20241022' } = settings;

	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model,
			max_tokens: 1500,
			temperature: 0.8,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			]
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
	}

	const data = await response.json();
	return data.content[0].text.trim();
}

/**
 * Generate story using custom endpoint
 * @param {string} prompt - Story generation prompt
 * @param {Object} settings - AI settings
 * @returns {Promise<string>} Generated story text
 */
async function generateWithCustom(prompt, settings) {
	const { apiKey, customEndpoint, model = 'default' } = settings;

	if (!customEndpoint) {
		throw new Error('Custom endpoint not configured');
	}

	const response = await fetch(customEndpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			prompt,
			max_tokens: 1500,
			temperature: 0.8
		})
	});

	if (!response.ok) {
		throw new Error(`Custom API error: ${response.statusText}`);
	}

	const data = await response.json();

	// Try common response formats
	if (data.text) return data.text.trim();
	if (data.response) return data.response.trim();
	if (data.choices && data.choices[0]?.text) return data.choices[0].text.trim();
	if (data.content) return data.content.trim();

	throw new Error('Could not parse response from custom endpoint');
}

/**
 * Generate story summary from game data
 * @param {Object} gameData - Completed game data
 * @returns {Promise<Object>} Generated story with metadata
 */
export async function generateStory(gameData) {
	try {
		logger.info('[storyGeneration] Starting story generation');

		// Load AI settings
		const settings = await loadAISettings();

		if (!settings || !settings.apiKey) {
			throw new Error('AI provider not configured. Please add your API key in settings.');
		}

		// Build the prompt
		const prompt = buildStoryPrompt(gameData);
		logger.debug('[storyGeneration] Prompt built, length:', prompt.length);

		// Generate story based on provider
		let storyText;
		switch (settings.provider) {
			case 'openai':
				logger.info('[storyGeneration] Using OpenAI');
				storyText = await generateWithOpenAI(prompt, settings);
				break;

			case 'anthropic':
				logger.info('[storyGeneration] Using Anthropic Claude');
				storyText = await generateWithAnthropic(prompt, settings);
				break;

			case 'custom':
				logger.info('[storyGeneration] Using custom endpoint');
				storyText = await generateWithCustom(prompt, settings);
				break;

			default:
				throw new Error(`Unknown AI provider: ${settings.provider}`);
		}

		logger.info('[storyGeneration] Story generated successfully, length:', storyText.length);

		return {
			text: storyText,
			generatedAt: new Date().toISOString(),
			provider: settings.provider,
			model: settings.model || 'default'
		};
	} catch (error) {
		logger.error('[storyGeneration] Failed to generate story:', error);
		throw error;
	}
}

/**
 * Estimate token count for cost calculation
 * @param {Object} gameData - Game data
 * @returns {number} Estimated tokens
 */
export function estimateTokens(gameData) {
	const prompt = buildStoryPrompt(gameData);
	// Rough estimate: 1 token ≈ 4 characters
	return Math.ceil(prompt.length / 4) + 1500; // prompt + max response
}
