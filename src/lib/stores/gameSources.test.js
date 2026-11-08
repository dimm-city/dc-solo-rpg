/**
 * The game sources store: the list in localStorage, the refresh decision, and a refresh of
 * every due source through a mocked fetch (GitHub's limit stops the rest, a second call joins
 * the first).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
	addGameSource,
	removeGameSource,
	getGameSources,
	getSourceGames,
	getSourceGame,
	isRefreshingSources,
	refreshGameSources,
	resetGameSources,
	shouldRefresh,
	CACHE_TTL_MS,
	RETRY_AFTER_ERROR_MS
} from './gameSources.svelte.js';
import { SOURCE_FORMAT_HINT } from '../services/githubGames.js';
import { logger } from '../utils/logger.js';

const KEY = 'dc-solo-rpg-game-sources';
const gameMarkdown = readFileSync(
	join(process.cwd(), 'static', 'games', 'future-lost.game.md'),
	'utf-8'
);
const NOW = Date.parse('2026-11-08T12:00:00Z');
const MINUTE = 60 * 1000;

const api = (path) => `https://api.github.com/repos/${path}`;
const raw = (path) => `https://raw.githubusercontent.com/${path}`;
const file = (repo, name, sha = 's1') => ({
	name,
	path: `games/${name}`,
	sha,
	type: 'file',
	download_url: raw(`${repo}/main/games/${name}`)
});
const json = (body, init = {}) =>
	new Response(JSON.stringify(body), {
		status: 200,
		...init,
		headers: { 'content-type': 'application/json', etag: '"e1"', ...(init.headers ?? {}) }
	});

/** One repository with one game, answered from a URL map */
function answersFor(repo, sha = 's1') {
	return {
		[api(`${repo}/contents/games`)]: () => json([file(repo, 'future-lost.game.md', sha)]),
		[raw(`${repo}/main/games/future-lost.game.md`)]: () => new Response(gameMarkdown)
	};
}

function stubFetch(answers) {
	const fetch = vi.fn(async (url) => {
		const answer = answers[url];
		if (!answer) return new Response('not here', { status: 404 });
		return typeof answer === 'function' ? answer() : answer;
	});
	vi.stubGlobal('fetch', fetch);
	return fetch;
}

const stored = () => JSON.parse(localStorage.getItem(KEY));

describe('game sources', () => {
	beforeEach(() => {
		// The refresh an add starts reads Date.now(): fix it to NOW so every check lines up
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(NOW);
		localStorage.clear();
		resetGameSources();
		vi.spyOn(logger, 'error').mockImplementation(() => {});
		vi.spyOn(logger, 'warn').mockImplementation(() => {});
		stubFetch({});
	});
	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	describe('addGameSource and removeGameSource', () => {
		it('refuses a source it cannot read, and stores nothing', () => {
			expect(addGameSource('not a repo')).toEqual({ ok: false, error: SOURCE_FORMAT_HINT });
			expect(getGameSources()).toEqual([]);
			expect(localStorage.getItem(KEY)).toBeNull();
		});

		it('adds a source, saves the list and fetches its games in the background', async () => {
			const fetch = stubFetch(answersFor('a/one'));

			const result = addGameSource('A/One/games');
			expect(result.ok).toBe(true);
			expect(result.source).toMatchObject({ id: 'a/one/games', path: 'games', branch: null });
			expect(getGameSources().map((s) => s.id)).toEqual(['a/one/games']);
			expect(stored().version).toBe(1);
			expect(stored().sources[0]).toMatchObject({ id: 'a/one/games', games: [] });

			await refreshGameSources(); // joins the one the add started
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(getSourceGames().map((g) => g.title)).toEqual(['Future Lost']);
			expect(getSourceGame('a-one-games--future-lost')).toMatchObject({
				title: 'Future Lost',
				isCustom: true,
				source: { id: 'a/one/games', sha: 's1' }
			});
			expect(stored().sources[0].games).toHaveLength(1);
			expect(stored().sources[0].etag).toBe('"e1"');
			expect(stored().sources[0]).not.toHaveProperty('refreshing');
		});

		it('refuses the same repository twice, whatever the case', () => {
			expect(addGameSource('a/one').ok).toBe(true);
			expect(addGameSource('A/ONE')).toEqual({
				ok: false,
				error: 'That repository is already in your list.'
			});
			expect(addGameSource('a/one@dev').ok).toBe(true); // another branch is another source
			expect(getGameSources()).toHaveLength(2);
		});

		it('removes a source and its games, and says when there was none', async () => {
			stubFetch({ ...answersFor('a/one'), ...answersFor('b/two') });
			addGameSource('a/one/games');
			addGameSource('b/two/games');
			await refreshGameSources();
			expect(getSourceGames()).toHaveLength(2);

			expect(removeGameSource('a/one/games')).toBe(true);
			expect(getGameSources().map((s) => s.id)).toEqual(['b/two/games']);
			expect(getSourceGames().map((g) => g.slug)).toEqual(['b-two-games--future-lost']);
			expect(stored().sources.map((s) => s.id)).toEqual(['b/two/games']);
			expect(removeGameSource('a/one/games')).toBe(false);
		});

		it('reports when the browser will not store the list, and leaves it as it was', () => {
			vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new DOMException('quota', 'QuotaExceededError');
			});
			const result = addGameSource('a/one');
			expect(result.ok).toBe(false);
			expect(result.error).toMatch(/Couldn't save the list/);
			expect(getGameSources()).toEqual([]);
		});
	});

	describe('loading the saved list', () => {
		beforeEach(() => {
			// A re-imported module has a fresh logger, so quiet the console itself
			vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.spyOn(console, 'warn').mockImplementation(() => {});
		});

		it('reads the sources and their games back, ready for an offline game', async () => {
			stubFetch(answersFor('a/one'));
			addGameSource('a/one/games');
			await refreshGameSources();

			vi.resetModules();
			const fresh = await import('./gameSources.svelte.js');
			expect(fresh.getGameSources()).toHaveLength(1);
			expect(fresh.getGameSources()[0]).toMatchObject({
				id: 'a/one/games',
				etag: '"e1"',
				refreshing: false
			});
			expect(fresh.getSourceGame('a-one-games--future-lost')?.deck).toHaveLength(52);
			expect(fresh.isRefreshingSources()).toBe(false);
		});

		it('drops a list written by another version', async () => {
			localStorage.setItem(KEY, JSON.stringify({ version: 0, sources: [{ id: 'a/one' }] }));
			vi.resetModules();
			const fresh = await import('./gameSources.svelte.js');
			expect(fresh.getGameSources()).toEqual([]);
			expect(localStorage.getItem(KEY)).toBeNull();
		});

		it('starts empty from unreadable storage', async () => {
			localStorage.setItem(KEY, '{not json');
			vi.resetModules();
			const fresh = await import('./gameSources.svelte.js');
			expect(fresh.getGameSources()).toEqual([]);
		});
	});

	describe('shouldRefresh', () => {
		const iso = (msAgo) => new Date(NOW - msAgo).toISOString();

		it('checks a source that was never fetched, or not for an hour', () => {
			expect(shouldRefresh({ fetchedAt: null, checkedAt: null, error: null }, NOW)).toBe(true);
			expect(shouldRefresh({ fetchedAt: iso(CACHE_TTL_MS - MINUTE), error: null }, NOW)).toBe(
				false
			);
			expect(shouldRefresh({ fetchedAt: iso(CACHE_TTL_MS), error: null }, NOW)).toBe(true);
		});

		it('tries again five minutes after a failed check', () => {
			const error = { kind: 'network', message: 'x' };
			const fresh = { fetchedAt: iso(2 * MINUTE), checkedAt: iso(MINUTE), error };
			expect(shouldRefresh(fresh, NOW)).toBe(false);
			const old = { fetchedAt: iso(2 * MINUTE), checkedAt: iso(RETRY_AFTER_ERROR_MS), error };
			expect(shouldRefresh(old, NOW)).toBe(true);
			expect(shouldRefresh({ fetchedAt: null, checkedAt: null, error }, NOW)).toBe(true);
		});

		it('checks everything when forced', () => {
			expect(shouldRefresh({ fetchedAt: iso(0), error: null }, NOW, { force: true })).toBe(true);
		});
	});

	describe('refreshGameSources', () => {
		it('checks only the sources that are due, unless forced', async () => {
			const fetch = stubFetch({ ...answersFor('a/one'), ...answersFor('b/two') });
			addGameSource('a/one/games');
			addGameSource('b/two/games');
			expect(await refreshGameSources({ now: NOW })).toBe(true);
			expect(fetch).toHaveBeenCalledTimes(4);
			expect(getSourceGames()).toHaveLength(2);

			// Within the hour nothing is asked
			fetch.mockClear();
			expect(await refreshGameSources({ now: NOW + 30 * MINUTE })).toBe(false);
			expect(fetch).not.toHaveBeenCalled();

			// Refresh now: the listings are asked again with their ETags; 304 downloads nothing
			stubFetch({
				[api('a/one/contents/games')]: () => new Response(null, { status: 304 }),
				[api('b/two/contents/games')]: () => new Response(null, { status: 304 })
			});
			expect(await refreshGameSources({ now: NOW + 30 * MINUTE, force: true })).toBe(true);
			expect(globalThis.fetch).toHaveBeenCalledTimes(2);
			for (const [, init] of globalThis.fetch.mock.calls) {
				expect(init.headers['If-None-Match']).toBe('"e1"');
			}
			expect(getSourceGames()).toHaveLength(2);
			for (const source of getGameSources()) {
				expect(source.fetchedAt).toBe(new Date(NOW + 30 * MINUTE).toISOString());
				expect(source.error).toBeNull();
			}

			// An hour on, it is due again
			expect(await refreshGameSources({ now: NOW + 91 * MINUTE })).toBe(true);
		});

		it("stops asking once GitHub's limit is hit, keeping every source's games", async () => {
			stubFetch({ ...answersFor('a/one'), ...answersFor('b/two'), ...answersFor('c/three') });
			addGameSource('a/one/games');
			addGameSource('b/two/games');
			addGameSource('c/three/games');
			await refreshGameSources({ now: NOW });
			expect(getSourceGames()).toHaveLength(3);

			const limited = () =>
				json(
					{ message: 'API rate limit exceeded' },
					{ status: 403, headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '0' } }
				);
			const fetch = stubFetch({
				...answersFor('a/one', 's2'),
				[api('b/two/contents/games')]: limited,
				[api('c/three/contents/games')]: limited
			});
			await refreshGameSources({ now: NOW + 2 * CACHE_TTL_MS });

			// a/one was checked and re-downloaded; b/two hit the limit; c/three was not asked
			expect(fetch.mock.calls.map(([url]) => url)).toEqual([
				api('a/one/contents/games'),
				raw('a/one/main/games/future-lost.game.md'),
				api('b/two/contents/games')
			]);
			const [a, b, c] = getGameSources();
			expect(a.error).toBeNull();
			expect(a.games[0].source.sha).toBe('s2');
			expect(b.error.kind).toBe('rate-limit');
			expect(c.error.kind).toBe('rate-limit');
			expect(c.checkedAt).toBe(new Date(NOW + 2 * CACHE_TTL_MS).toISOString());
			expect(getSourceGames()).toHaveLength(3);
			expect(stored().sources[2].error.kind).toBe('rate-limit');
		});

		it('keeps the cached games and records the failure when a source cannot be reached', async () => {
			stubFetch(answersFor('a/one'));
			addGameSource('a/one/games');
			await refreshGameSources({ now: NOW });

			stubFetch({
				[api('a/one/contents/games')]: () => {
					throw new TypeError('Failed to fetch');
				}
			});
			await refreshGameSources({ now: NOW + 2 * CACHE_TTL_MS });
			const [source] = getGameSources();
			expect(source.error).toEqual({ kind: 'network', message: "Couldn't reach GitHub." });
			expect(source.games).toHaveLength(1);
			expect(source.fetchedAt).toBe(new Date(NOW).toISOString());
			expect(getSourceGame('a-one-games--future-lost')).not.toBeNull();
		});

		it('runs one refresh at a time: a second call joins the first', async () => {
			let release;
			const listing = new Promise((resolve) => (release = resolve));
			stubFetch({
				[api('a/one/contents/games')]: () => listing,
				[raw('a/one/main/games/future-lost.game.md')]: () => new Response(gameMarkdown)
			});
			addGameSource('a/one/games'); // starts a refresh that waits on the listing

			const first = refreshGameSources();
			const second = refreshGameSources({ force: true });
			expect(second).toBe(first);
			expect(isRefreshingSources()).toBe(true);
			expect(getGameSources()[0].refreshing).toBe(true);

			release(json([file('a/one', 'future-lost.game.md')]));
			expect(await first).toBe(true);
			expect(isRefreshingSources()).toBe(false);
			expect(getGameSources()[0].refreshing).toBe(false);
			expect(getSourceGames()).toHaveLength(1);
		});

		it('leaves out a source removed while an earlier one was being checked', async () => {
			let release;
			const listing = new Promise((resolve) => (release = resolve));
			const fetch = stubFetch({
				[api('a/one/contents/games')]: () => listing,
				[raw('a/one/main/games/future-lost.game.md')]: () => new Response(gameMarkdown),
				...answersFor('b/two')
			});
			addGameSource('a/one/games');
			addGameSource('b/two/games');
			const refresh = refreshGameSources();
			removeGameSource('b/two/games');
			release(json([file('a/one', 'future-lost.game.md')]));
			await refresh;
			expect(fetch.mock.calls.map(([url]) => url)).not.toContain(api('b/two/contents/games'));
			expect(getGameSources().map((s) => s.id)).toEqual(['a/one/games']);
		});
	});
});
