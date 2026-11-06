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
export function buildStoryPrompt(gameData) {
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
		.filter((entry) => entry.type !== 'initial-damage' && entry.type !== 'final-damage')
		.map((entry, index) => {
			const round = entry.round || Math.floor(index / 3) + 1;
			let text = `Round ${round}: `;

			if (entry.description) {
				text += entry.description;
			}

			if (entry.story) {
				text += ` - ${entry.story.replace(/<[^>]*>/g, '').substring(0, 200)}`;
			}

			if (entry.diceRoll !== undefined && entry.damageDealt) {
				text += ` (Stability check: rolled ${entry.diceRoll}, lost ${entry.damageDealt} Stability)`;
			}

			return text;
		})
		.join('\n');

	// Build narrative from journal entries
	const journalNarrative = journalEntries
		.filter((entry) => entry.text && entry.text.trim().length > 0)
		.map((entry) => {
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

/** Claude models offered in settings. IDs from the Claude API model list (Nov 2026). */
export const CLAUDE_MODELS = [
	{ id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5 (recommended)' },
	{ id: 'claude-opus-5-5', label: 'Claude Opus 5.5 (richest prose, slower)' },
	{ id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5 (fastest, cheapest)' }
];

/**
 * One default per provider. OpenAI's current IDs could not be checked from here, so its model
 * is a free-text field with this default; "Test key" confirms the model exists for the key.
 */
export const DEFAULT_MODELS = {
	anthropic: 'claude-sonnet-5-5',
	openai: 'gpt-5-mini',
	custom: ''
};

const PROVIDER_NAMES = { anthropic: 'Anthropic', openai: 'OpenAI', custom: 'Your endpoint' };

const ANTHROPIC_API = 'https://api.anthropic.com/v1';
const OPENAI_API = 'https://api.openai.com/v1';

/** Claude models that accept server-side refusal fallback (`fallbacks: "default"`) */
const CLAUDE_FALLBACK_MODELS = new Set(['claude-sonnet-5-5', 'claude-opus-5-5']);

/**
 * The model to call for a provider. Settings saved before SM-02 hold retired Claude 3 IDs
 * (and switching provider used to carry a Claude ID over to OpenAI), so anything that is not a
 * current choice for the provider falls back to its default.
 * @param {string} provider
 * @param {string} [model]
 * @returns {string}
 */
export function resolveModel(provider, model) {
	const id = (model || '').trim();
	if (provider === 'anthropic') {
		return CLAUDE_MODELS.some((m) => m.id === id) ? id : DEFAULT_MODELS.anthropic;
	}
	if (provider === 'openai') {
		return id && !id.startsWith('claude-') ? id : DEFAULT_MODELS.openai;
	}
	return id || 'default';
}

function anthropicHeaders(apiKey) {
	return {
		'content-type': 'application/json',
		'x-api-key': apiKey,
		'anthropic-version': '2023-06-01',
		// The game calls the API from the player's browser with the player's own key
		'anthropic-dangerous-direct-browser-access': 'true'
	};
}

function openaiHeaders(apiKey) {
	return { 'content-type': 'application/json', Authorization: `Bearer ${apiKey}` };
}

/**
 * Plain-words explanation of a failed provider call.
 * @param {string} provider
 * @param {number} status - HTTP status
 * @param {string} model
 * @param {string} [detail] - the provider's own error message, if any
 * @returns {string}
 */
export function describeFailure(provider, status, model, detail = '') {
	const name = PROVIDER_NAMES[provider] ?? 'The provider';
	switch (true) {
		case status === 401:
			return `${name} didn't accept this API key. Check that you copied all of it.`;
		case status === 403:
			return `This API key isn't allowed to use ${model}. Check the key's permissions or pick another model.`;
		case status === 404:
			return `${name} doesn't offer the model "${model}" to this key. Pick another model.`;
		case status === 429:
			return `${name} is busy, or this key has reached its limit. Wait a minute and try again.`;
		case status >= 500:
			return `${name} is having trouble right now. Try again in a few minutes.`;
		default:
			return `${name} couldn't use these settings${detail ? `: ${detail}` : '.'}`;
	}
}

async function readErrorDetail(response) {
	try {
		const body = await response.json();
		return body?.error?.message || body?.message || '';
	} catch {
		return '';
	}
}

/**
 * fetch with plain-words errors: a network failure or a non-2xx status throws an Error whose
 * message can be shown to the player as it is.
 */
async function request(provider, model, url, init, fetchImpl) {
	let response;
	try {
		response = await fetchImpl(url, init);
	} catch {
		const name = PROVIDER_NAMES[provider] ?? 'the provider';
		throw new Error(`Couldn't reach ${name}. Check your internet connection and try again.`);
	}
	if (!response.ok) {
		const detail = await readErrorDetail(response);
		const error = new Error(describeFailure(provider, response.status, model, detail));
		error.status = response.status;
		throw error;
	}
	return response;
}

/**
 * Generate story using OpenAI API
 * @param {string} prompt - Story generation prompt
 * @param {Object} settings - AI settings
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<string>} Generated story text
 */
async function generateWithOpenAI(prompt, settings, fetchImpl) {
	const model = resolveModel('openai', settings.model);
	const response = await request(
		'openai',
		model,
		`${OPENAI_API}/chat/completions`,
		{
			method: 'POST',
			headers: openaiHeaders(settings.apiKey),
			body: JSON.stringify({
				model,
				messages: [{ role: 'user', content: prompt }],
				// Current OpenAI models take max_completion_tokens (reasoning counts against it)
				// and reject a non-default temperature
				max_completion_tokens: 8000
			})
		},
		fetchImpl
	);
	const data = await response.json();
	const message = data.choices?.[0]?.message;
	if (message?.refusal) throw new Error('OpenAI declined to write this story. Try again.');
	const text = message?.content?.trim();
	if (!text) throw new Error('OpenAI sent back an empty story. Try again.');
	return text;
}

/**
 * Generate story using Anthropic Claude API
 * @param {string} prompt - Story generation prompt
 * @param {Object} settings - AI settings
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<string>} Generated story text
 */
async function generateWithAnthropic(prompt, settings, fetchImpl) {
	const model = resolveModel('anthropic', settings.model);
	const headers = anthropicHeaders(settings.apiKey);
	const body = {
		model,
		max_tokens: 16000,
		// A summary needs little thinking; low effort keeps the wait short.
		// No temperature: current Claude models only accept the default.
		output_config: { effort: 'low' },
		messages: [{ role: 'user', content: prompt }]
	};
	if (CLAUDE_FALLBACK_MODELS.has(model)) {
		// If a safety classifier declines, the API retries on its recommended fallback model
		headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
		body.fallbacks = 'default';
	}

	const response = await request(
		'anthropic',
		model,
		`${ANTHROPIC_API}/messages`,
		{ method: 'POST', headers, body: JSON.stringify(body) },
		fetchImpl
	);
	const data = await response.json();
	if (data.stop_reason === 'refusal') {
		throw new Error('Claude declined to write this story. Try again, or pick another model.');
	}
	// The reply can hold thinking and fallback blocks before the text
	const text = (data.content || [])
		.filter((block) => block.type === 'text')
		.map((block) => block.text)
		.join('')
		.trim();
	if (!text) throw new Error('Claude sent back an empty story. Try again.');
	return text;
}

/**
 * Generate story using custom endpoint
 * @param {string} prompt - Story generation prompt
 * @param {Object} settings - AI settings
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<string>} Generated story text
 */
async function generateWithCustom(prompt, settings, fetchImpl) {
	const { apiKey, customEndpoint } = settings;
	const model = resolveModel('custom', settings.model);

	if (!customEndpoint) {
		throw new Error('Enter your endpoint URL in the AI settings first.');
	}

	const response = await request(
		'custom',
		model,
		customEndpoint,
		{
			method: 'POST',
			headers: openaiHeaders(apiKey),
			body: JSON.stringify({ model, prompt, max_tokens: 1500 })
		},
		fetchImpl
	);

	const data = await response.json();

	// Try common response formats
	if (data.text) return data.text.trim();
	if (data.response) return data.response.trim();
	if (data.choices && data.choices[0]?.text) return data.choices[0].text.trim();
	if (typeof data.content === 'string') return data.content.trim();

	throw new Error("Couldn't read the story from your endpoint's reply.");
}

/**
 * Check an API key with one tiny call before the player leaves settings.
 * Anthropic and OpenAI: look up the chosen model (free, no tokens), which checks the key and
 * the model at once. Custom endpoints: ask for a five-token reply.
 * @param {{provider: string, apiKey: string, model?: string, customEndpoint?: string}} settings
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ok: boolean, message: string}>} message is plain words for the player
 */
export async function testAIConnection(settings, fetchImpl = globalThis.fetch) {
	const { provider, customEndpoint } = settings;
	const apiKey = (settings.apiKey || '').trim();
	const model = resolveModel(provider, settings.model);

	if (!apiKey) return { ok: false, message: 'Paste your API key first.' };

	try {
		if (provider === 'anthropic') {
			await request(
				provider,
				model,
				`${ANTHROPIC_API}/models/${encodeURIComponent(model)}`,
				{ headers: anthropicHeaders(apiKey) },
				fetchImpl
			);
			const label = CLAUDE_MODELS.find((m) => m.id === model)?.label.replace(/ \(.*\)$/, '');
			return { ok: true, message: `Key works. ${label} is ready to write your story.` };
		}
		if (provider === 'openai') {
			await request(
				provider,
				model,
				`${OPENAI_API}/models/${encodeURIComponent(model)}`,
				{ headers: openaiHeaders(apiKey) },
				fetchImpl
			);
			return { ok: true, message: `Key works. ${model} is ready to write your story.` };
		}
		if (provider === 'custom') {
			if (!customEndpoint) return { ok: false, message: 'Enter your endpoint URL first.' };
			await request(
				provider,
				model,
				customEndpoint,
				{
					method: 'POST',
					headers: openaiHeaders(apiKey),
					body: JSON.stringify({ model, prompt: 'Reply with the word OK.', max_tokens: 5 })
				},
				fetchImpl
			);
			return { ok: true, message: 'Your endpoint answered. It is ready to write your story.' };
		}
		return { ok: false, message: 'Choose a provider first.' };
	} catch (error) {
		return { ok: false, message: error.message };
	}
}

/**
 * Generate story summary from game data
 * @param {Object} gameData - Completed game data
 * @param {{fetchImpl?: typeof fetch}} [options] - fetchImpl is for tests
 * @returns {Promise<Object>} Generated story with metadata
 */
export async function generateStory(gameData, { fetchImpl = globalThis.fetch } = {}) {
	try {
		logger.info('[storyGeneration] Starting story generation');

		// Load AI settings
		const settings = await loadAISettings();

		if (!settings || !settings.apiKey) {
			throw new Error('Add your API key in the AI settings first.');
		}

		// Build the prompt
		const prompt = buildStoryPrompt(gameData);
		logger.debug('[storyGeneration] Prompt built, length:', prompt.length);

		// Generate story based on provider
		let storyText;
		switch (settings.provider) {
			case 'openai':
				logger.info('[storyGeneration] Using OpenAI');
				storyText = await generateWithOpenAI(prompt, settings, fetchImpl);
				break;

			case 'anthropic':
				logger.info('[storyGeneration] Using Anthropic Claude');
				storyText = await generateWithAnthropic(prompt, settings, fetchImpl);
				break;

			case 'custom':
				logger.info('[storyGeneration] Using custom endpoint');
				storyText = await generateWithCustom(prompt, settings, fetchImpl);
				break;

			default:
				throw new Error(`Unknown AI provider: ${settings.provider}`);
		}

		logger.info('[storyGeneration] Story generated successfully, length:', storyText.length);

		return {
			text: storyText,
			generatedAt: new Date().toISOString(),
			provider: settings.provider,
			model: resolveModel(settings.provider, settings.model)
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
