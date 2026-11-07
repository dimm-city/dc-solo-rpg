/**
 * AI story settings (SM-02): one current default per provider, retired IDs mapped to it,
 * a "Test key" call that reports in plain words, and requests current models accept.
 * No real keys and no network: fetch is mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	CLAUDE_MODELS,
	DEFAULT_MODELS,
	resolveModel,
	describeFailure,
	testAIConnection,
	generateStory,
	buildStoryPrompt
} from './storyGeneration.js';
import { loadAISettings } from './aiSettings.js';

vi.mock('./aiSettings.js', () => ({ loadAISettings: vi.fn() }));

/** A fetch mock answering with one status and JSON body */
function reply(status, body = {}) {
	return vi.fn(async () => ({
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	}));
}

const FAKE_KEY = 'test-key-not-real';

describe('model defaults', () => {
	it('defaults Claude to the current Sonnet and offers only current models', () => {
		expect(DEFAULT_MODELS.anthropic).toBe('claude-sonnet-5-5');
		expect(CLAUDE_MODELS.map((m) => m.id)).toEqual([
			'claude-sonnet-5-5',
			'claude-opus-5-5',
			'claude-haiku-5-5'
		]);
		expect(CLAUDE_MODELS.filter((m) => /recommended/i.test(m.label))).toHaveLength(1);
	});

	it('has a single default per provider', () => {
		expect(DEFAULT_MODELS.openai).toBe('gpt-5-mini');
		expect(resolveModel('anthropic', '')).toBe('claude-sonnet-5-5');
		expect(resolveModel('openai', '')).toBe('gpt-5-mini');
	});

	it('maps retired Claude 3 IDs from old settings to the default', () => {
		expect(resolveModel('anthropic', 'claude-3-5-sonnet-20241022')).toBe('claude-sonnet-5-5');
		expect(resolveModel('anthropic', 'claude-3-opus-20240229')).toBe('claude-sonnet-5-5');
		expect(resolveModel('anthropic', 'claude-opus-5-5')).toBe('claude-opus-5-5');
	});

	it('keeps a typed OpenAI model but not a Claude ID carried over from another provider', () => {
		expect(resolveModel('openai', ' gpt-5 ')).toBe('gpt-5');
		expect(resolveModel('openai', 'claude-3-5-sonnet-20241022')).toBe('gpt-5-mini');
	});
});

describe('describeFailure', () => {
	it('explains each failure in plain words', () => {
		expect(describeFailure('anthropic', 401, 'm')).toMatch(/didn't accept this API key/);
		expect(describeFailure('openai', 404, 'gpt-x')).toBe(
			`OpenAI doesn't offer the model "gpt-x" to this key. Pick another model.`
		);
		expect(describeFailure('anthropic', 429, 'm')).toMatch(/busy/);
		expect(describeFailure('anthropic', 529, 'm')).toMatch(/having trouble/);
		expect(describeFailure('openai', 400, 'm', 'bad thing')).toBe(
			"OpenAI couldn't use these settings: bad thing"
		);
	});
});

describe('testAIConnection', () => {
	it('asks for a key before calling anything', async () => {
		const fetchImpl = reply(200);
		const result = await testAIConnection({ provider: 'anthropic', apiKey: '  ' }, fetchImpl);
		expect(result).toEqual({ ok: false, message: 'Paste your API key first.' });
		expect(fetchImpl).not.toHaveBeenCalled();
	});

	it('checks a Claude key with one free model lookup', async () => {
		const fetchImpl = reply(200, { id: 'claude-sonnet-5-5' });
		const result = await testAIConnection(
			{ provider: 'anthropic', apiKey: FAKE_KEY, model: 'claude-sonnet-5-5' },
			fetchImpl
		);
		expect(result.ok).toBe(true);
		expect(result.message).toBe('Key works. Claude Sonnet 5.5 is ready to write your story.');
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		const [url, init] = fetchImpl.mock.calls[0];
		expect(url).toBe('https://api.anthropic.com/v1/models/claude-sonnet-5-5');
		expect(init.method).toBeUndefined(); // GET
		expect(init.headers['x-api-key']).toBe(FAKE_KEY);
		expect(init.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
	});

	it('reports a rejected key', async () => {
		const result = await testAIConnection(
			{ provider: 'anthropic', apiKey: FAKE_KEY },
			reply(401, { error: { message: 'invalid x-api-key' } })
		);
		expect(result).toEqual({
			ok: false,
			message: "Anthropic didn't accept this API key. Check that you copied all of it."
		});
	});

	it('reports a model the key cannot use', async () => {
		const fetchImpl = reply(404, { error: { message: 'model not found' } });
		const result = await testAIConnection(
			{ provider: 'openai', apiKey: FAKE_KEY, model: 'gpt-imaginary' },
			fetchImpl
		);
		expect(result.ok).toBe(false);
		expect(result.message).toMatch(/doesn't offer the model "gpt-imaginary"/);
		expect(fetchImpl.mock.calls[0][0]).toBe('https://api.openai.com/v1/models/gpt-imaginary');
		expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${FAKE_KEY}`);
	});

	it('reports when the provider cannot be reached', async () => {
		const fetchImpl = vi.fn(async () => {
			throw new TypeError('Failed to fetch');
		});
		const result = await testAIConnection({ provider: 'openai', apiKey: FAKE_KEY }, fetchImpl);
		expect(result).toEqual({
			ok: false,
			message: "Couldn't reach OpenAI. Check your internet connection and try again."
		});
	});

	it('asks a custom endpoint for a five-token reply', async () => {
		const fetchImpl = reply(200, { text: 'OK' });
		const result = await testAIConnection(
			{ provider: 'custom', apiKey: FAKE_KEY, customEndpoint: 'https://example.test/gen' },
			fetchImpl
		);
		expect(result.ok).toBe(true);
		const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
		expect(body.max_tokens).toBe(5);
	});

	it('needs an endpoint URL for a custom provider', async () => {
		const result = await testAIConnection({ provider: 'custom', apiKey: FAKE_KEY }, reply(200));
		expect(result).toEqual({ ok: false, message: 'Enter your endpoint URL first.' });
	});
});

describe('generateStory', () => {
	const gameData = {
		playerName: 'Ash',
		gameTitle: 'Future Lost',
		cardLog: [
			{ round: 1, card: '7', description: 'A crack in the hull', diceRoll: 4, damageDealt: 2 }
		],
		journalEntries: [{ round: 1, text: 'I patched it with tape.' }],
		isWon: false,
		finalTower: 0,
		roundsSurvived: 1
	};

	beforeEach(() => vi.mocked(loadAISettings).mockReset());

	it('sends a request current Claude models accept and reads the text block', async () => {
		vi.mocked(loadAISettings).mockResolvedValue({
			provider: 'anthropic',
			apiKey: FAKE_KEY,
			model: 'claude-3-5-sonnet-20241022' // saved before SM-02
		});
		const fetchImpl = reply(200, {
			stop_reason: 'end_turn',
			content: [
				{ type: 'thinking', thinking: '' },
				{ type: 'text', text: 'Ash patched the hull. ' }
			]
		});

		const story = await generateStory(gameData, { fetchImpl });

		expect(story.text).toBe('Ash patched the hull.');
		expect(story.model).toBe('claude-sonnet-5-5');
		const [url, init] = fetchImpl.mock.calls[0];
		expect(url).toBe('https://api.anthropic.com/v1/messages');
		const body = JSON.parse(init.body);
		expect(body.model).toBe('claude-sonnet-5-5');
		expect(body.temperature).toBeUndefined();
		expect(body.max_tokens).toBeGreaterThanOrEqual(1500);
		expect(init.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
	});

	it('explains a refusal instead of showing an empty story', async () => {
		vi.mocked(loadAISettings).mockResolvedValue({ provider: 'anthropic', apiKey: FAKE_KEY });
		const fetchImpl = reply(200, { stop_reason: 'refusal', content: [] });
		await expect(generateStory(gameData, { fetchImpl })).rejects.toThrow(/declined/);
	});

	it('uses max_completion_tokens and no temperature for OpenAI', async () => {
		vi.mocked(loadAISettings).mockResolvedValue({
			provider: 'openai',
			apiKey: FAKE_KEY,
			model: 'gpt-5-mini'
		});
		const fetchImpl = reply(200, { choices: [{ message: { content: 'A story.' } }] });

		const story = await generateStory(gameData, { fetchImpl });

		expect(story.text).toBe('A story.');
		const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
		expect(body.max_completion_tokens).toBeGreaterThan(0);
		expect(body.max_tokens).toBeUndefined();
		expect(body.temperature).toBeUndefined();
	});

	it('passes the plain-words error through when the key is rejected', async () => {
		vi.mocked(loadAISettings).mockResolvedValue({ provider: 'openai', apiKey: FAKE_KEY });
		await expect(generateStory(gameData, { fetchImpl: reply(401) })).rejects.toThrow(
			"OpenAI didn't accept this API key. Check that you copied all of it."
		);
	});

	it('puts the Stability check rolls into the prompt', () => {
		expect(buildStoryPrompt(gameData)).toContain('rolled 4, lost 2 Stability');
	});
});
