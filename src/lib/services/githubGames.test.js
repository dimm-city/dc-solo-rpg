/**
 * Game sources on GitHub: the source string, the slug namespace, one check of a source through
 * a mocked Contents API (ETag, unchanged sha, rate limit, failures) and the Settings status line.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
	parseGameSource,
	sourceLabel,
	sourceGameSlug,
	contentsUrl,
	emptySourceCache,
	fetchSourceGames,
	sourceStatusLine,
	SOURCE_FORMAT_HINT
} from './githubGames.js';
import { logger } from '../utils/logger.js';

const gameMarkdown = readFileSync(
	join(process.cwd(), 'static', 'games', 'ghost-in-the-machine.game.md'),
	'utf-8'
);

const SOURCE = parseGameSource('dimm-city/dc-solo-rpg/static/games').source;
const API = 'https://api.github.com/repos/dimm-city/dc-solo-rpg/contents/static/games';
const RAW = 'https://raw.githubusercontent.com/dimm-city/dc-solo-rpg/main/static/games';
const NOW = Date.parse('2026-11-08T12:00:00Z');

const file = (name, sha = 'sha-1') => ({
	name,
	path: `static/games/${name}`,
	sha,
	type: 'file',
	download_url: `${RAW}/${name}`
});

const json = (body, { status = 200, headers = {} } = {}) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json', ...headers }
	});

/** A fetch that answers the listing and each download from a map of URL to Response (or thrower) */
function fakeFetch(answers) {
	return vi.fn(async (url) => {
		const answer = answers[url];
		if (!answer) return new Response('not here', { status: 404 });
		return typeof answer === 'function' ? answer() : answer;
	});
}

describe('parseGameSource', () => {
	it('reads owner/repo, an optional folder and an optional @branch', () => {
		expect(parseGameSource('dimm-city/dc-solo-rpg')).toEqual({
			ok: true,
			source: {
				id: 'dimm-city/dc-solo-rpg',
				owner: 'dimm-city',
				repo: 'dc-solo-rpg',
				path: '',
				branch: null
			}
		});
		expect(parseGameSource('dimm-city/dc-solo-rpg/static/games').source).toMatchObject({
			id: 'dimm-city/dc-solo-rpg/static/games',
			path: 'static/games',
			branch: null
		});
		expect(parseGameSource('dimm-city/dc-solo-rpg@dev').source).toMatchObject({
			id: 'dimm-city/dc-solo-rpg@dev',
			path: '',
			branch: 'dev'
		});
		expect(parseGameSource('o/r/games@release/1.0').source).toMatchObject({
			id: 'o/r/games@release/1.0',
			path: 'games',
			branch: 'release/1.0'
		});
	});

	it('normalises case and slashes so the same repository has one id', () => {
		expect(parseGameSource('  Dimm-City/DC-Solo-RPG/static/games/@Main ').source).toMatchObject({
			id: 'dimm-city/dc-solo-rpg/static/games@Main',
			owner: 'dimm-city',
			repo: 'dc-solo-rpg',
			path: 'static/games',
			branch: 'Main'
		});
		expect(parseGameSource('o/r/').source.id).toBe('o/r');
	});

	it('accepts a github.com link to a repository, folder or file', () => {
		expect(parseGameSource('https://github.com/dimm-city/dc-solo-rpg').source.id).toBe(
			'dimm-city/dc-solo-rpg'
		);
		expect(parseGameSource('https://github.com/dimm-city/dc-solo-rpg.git').source.id).toBe(
			'dimm-city/dc-solo-rpg'
		);
		expect(
			parseGameSource('https://github.com/dimm-city/dc-solo-rpg/tree/main/static/games').source
		).toMatchObject({ id: 'dimm-city/dc-solo-rpg/static/games@main', branch: 'main' });
		expect(parseGameSource('github.com/o/r/blob/dev/games/x.game.md').source).toMatchObject({
			id: 'o/r/games/x.game.md@dev',
			path: 'games/x.game.md',
			branch: 'dev'
		});
	});

	it('refuses anything else with the format hint', () => {
		expect(parseGameSource('')).toEqual({ ok: false, error: 'Type a repository first.' });
		expect(parseGameSource('   ')).toEqual({ ok: false, error: 'Type a repository first.' });
		for (const text of [
			'just-a-name',
			'owner/',
			'owner/repo@',
			'owner/repo/x y',
			'-bad/repo',
			'owner/..',
			'https://gitlab.com/o/r',
			'https://github.com/only-owner'
		]) {
			expect(parseGameSource(text), text).toEqual({ ok: false, error: SOURCE_FORMAT_HINT });
		}
	});
});

describe('sourceLabel, sourceGameSlug and contentsUrl', () => {
	it('labels a source by owner, repo and folder', () => {
		expect(sourceLabel(SOURCE)).toBe('dimm-city/dc-solo-rpg/static/games');
		expect(sourceLabel(parseGameSource('o/r@dev').source)).toBe('o/r');
	});

	it('namespaces a game slug by its source, so two repositories never clash', () => {
		expect(sourceGameSlug(SOURCE, 'Ghost-In-The-Machine.game.md')).toBe(
			'dimm-city-dc-solo-rpg-static-games--ghost-in-the-machine'
		);
		expect(sourceGameSlug(parseGameSource('o/r@release/1.0').source, 'x.game.md')).toBe(
			'o-r-release-1-0--x'
		);
		expect(
			sourceGameSlug(parseGameSource('other/r').source, 'ghost-in-the-machine.game.md')
		).not.toBe(sourceGameSlug(SOURCE, 'ghost-in-the-machine.game.md'));
	});

	it('builds the Contents API URL, with ref only for a named branch', () => {
		expect(contentsUrl(SOURCE)).toBe(API);
		expect(contentsUrl(parseGameSource('o/r').source)).toBe(
			'https://api.github.com/repos/o/r/contents'
		);
		expect(contentsUrl(parseGameSource('o/r/my#games@release/1.0').source)).toBe(
			'https://api.github.com/repos/o/r/contents/my%23games?ref=release%2F1.0'
		);
	});
});

describe('fetchSourceGames', () => {
	beforeEach(() => {
		vi.spyOn(logger, 'error').mockImplementation(() => {});
	});

	it('lists the folder, downloads and parses each .game.md, and keeps where each came from', async () => {
		const fetch = fakeFetch({
			[API]: json(
				[
					file('ghost-in-the-machine.game.md', 'abc'),
					file('notes.md'),
					{ name: 'art', type: 'dir' }
				],
				{
					headers: { etag: '"e1"' }
				}
			),
			[`${RAW}/ghost-in-the-machine.game.md`]: new Response(gameMarkdown)
		});

		const entry = await fetchSourceGames(SOURCE, null, { fetch, now: NOW });

		expect(fetch).toHaveBeenCalledTimes(2);
		const [, init] = fetch.mock.calls[0];
		expect(init.headers).toEqual({ Accept: 'application/vnd.github+json' });
		expect(entry.error).toBeNull();
		expect(entry.etag).toBe('"e1"');
		expect(entry.fetchedAt).toBe(new Date(NOW).toISOString());
		expect(entry.checkedAt).toBe(entry.fetchedAt);
		expect(entry.skipped).toEqual([]);
		expect(entry.games).toHaveLength(1);

		const game = entry.games[0];
		expect(game.slug).toBe('dimm-city-dc-solo-rpg-static-games--ghost-in-the-machine');
		expect(game.title).toBe('Locked in the Tech District');
		expect(game.isCustom).toBe(true);
		expect(game.loaded).toBe(true);
		expect(game.deck).toHaveLength(52);
		expect(game.source).toEqual({
			id: SOURCE.id,
			owner: 'dimm-city',
			repo: 'dc-solo-rpg',
			branch: null,
			path: 'static/games/ghost-in-the-machine.game.md',
			sha: 'abc',
			url: `${RAW}/ghost-in-the-machine.game.md`
		});
		expect(game.metadata.fetchedAt).toBe(entry.fetchedAt);
		expect(game.metadata.uploadedAt).toBeUndefined();
	});

	it('resolves a relative card image against the raw file URL, so art beside the file loads', async () => {
		const fetch = fakeFetch({
			[API]: json([file('ghost-in-the-machine.game.md')]),
			[`${RAW}/ghost-in-the-machine.game.md`]: new Response(gameMarkdown)
		});
		const { games } = await fetchSourceGames(SOURCE, null, { fetch, now: NOW });
		const withImage = games[0].deck.filter((card) => card.image);
		expect(withImage.length).toBeGreaterThan(0);
		for (const card of withImage) {
			expect(card.image.src).toMatch(new RegExp(`^${RAW}/ghost-in-the-machine/[a-z-]+\\.svg$`));
		}
	});

	it('sends the ETag and, on 304, keeps the cached games for free', async () => {
		const cached = {
			...emptySourceCache(),
			etag: '"e1"',
			fetchedAt: '2026-11-08T10:00:00.000Z',
			checkedAt: '2026-11-08T10:00:00.000Z',
			games: [{ slug: 'x', title: 'X', source: { sha: 'abc' } }]
		};
		const fetch = fakeFetch({ [API]: new Response(null, { status: 304 }) });

		const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });

		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch.mock.calls[0][1].headers['If-None-Match']).toBe('"e1"');
		expect(entry.games).toEqual(cached.games);
		expect(entry.etag).toBe('"e1"');
		expect(entry.fetchedAt).toBe(new Date(NOW).toISOString());
		expect(entry.error).toBeNull();
	});

	it('downloads only the files whose sha changed, and drops the ones that are gone', async () => {
		const kept = {
			slug: sourceGameSlug(SOURCE, 'kept.game.md'),
			title: 'Kept',
			source: { sha: 'same' }
		};
		const gone = {
			slug: sourceGameSlug(SOURCE, 'gone.game.md'),
			title: 'Gone',
			source: { sha: 'g' }
		};
		const stale = {
			slug: sourceGameSlug(SOURCE, 'ghost-in-the-machine.game.md'),
			title: 'Old',
			source: { sha: 'old' }
		};
		const cached = {
			...emptySourceCache(),
			etag: '"e1"',
			fetchedAt: '2026-11-08T10:00:00.000Z',
			games: [kept, gone, stale]
		};
		const fetch = fakeFetch({
			[API]: json([file('kept.game.md', 'same'), file('ghost-in-the-machine.game.md', 'new')], {
				headers: { etag: '"e2"' }
			}),
			[`${RAW}/ghost-in-the-machine.game.md`]: new Response(gameMarkdown)
		});

		const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });

		expect(fetch.mock.calls.map(([url]) => url)).toEqual([
			API,
			`${RAW}/ghost-in-the-machine.game.md`
		]);
		expect(entry.etag).toBe('"e2"');
		expect(entry.games.map((g) => g.title)).toEqual(['Kept', 'Locked in the Tech District']);
		expect(entry.games[0]).toBe(kept);
		expect(entry.games[1].source.sha).toBe('new');
	});

	it('skips a file that is not a valid game, naming it and the reason, and keeps the rest', async () => {
		const fetch = fakeFetch({
			[API]: json([file('broken.game.md', 'b'), file('ghost-in-the-machine.game.md', 'f')]),
			[`${RAW}/broken.game.md`]: new Response('# Not a game'),
			[`${RAW}/ghost-in-the-machine.game.md`]: new Response(gameMarkdown)
		});
		const entry = await fetchSourceGames(SOURCE, null, { fetch, now: NOW });
		expect(entry.games.map((g) => g.title)).toEqual(['Locked in the Tech District']);
		expect(entry.skipped).toEqual([
			{ name: 'broken.game.md', reason: "it doesn't start with a --- block" }
		]);
		expect(entry.error).toBeNull();
	});

	it('keeps the copy it has when a changed file cannot be downloaded, and notes a new one', async () => {
		const old = { slug: sourceGameSlug(SOURCE, 'a.game.md'), title: 'A', source: { sha: 'old' } };
		const cached = { ...emptySourceCache(), fetchedAt: '2026-11-08T10:00:00.000Z', games: [old] };
		const fetch = fakeFetch({
			[API]: json([file('a.game.md', 'new'), file('b.game.md', 'b')]),
			[`${RAW}/a.game.md`]: new Response('gone', { status: 500 }),
			[`${RAW}/b.game.md`]: () => {
				throw new TypeError('Failed to fetch');
			}
		});
		const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });
		expect(entry.games).toEqual([old]);
		expect(entry.skipped).toEqual([{ name: 'b.game.md', reason: "it couldn't be downloaded" }]);
	});

	it('reads a path that is one .game.md file as a source of one game', async () => {
		const source = parseGameSource(
			'dimm-city/dc-solo-rpg/static/games/ghost-in-the-machine.game.md'
		).source;
		const url = `${API}/ghost-in-the-machine.game.md`;
		const fetch = fakeFetch({
			[url]: json(file('ghost-in-the-machine.game.md', 'f')),
			[`${RAW}/ghost-in-the-machine.game.md`]: new Response(gameMarkdown)
		});
		const entry = await fetchSourceGames(source, null, { fetch, now: NOW });
		expect(entry.games.map((g) => g.title)).toEqual(['Locked in the Tech District']);
		expect(entry.games[0].slug).toBe(
			'dimm-city-dc-solo-rpg-static-games-ghost-in-the-machine-game-md--ghost-in-the-machine'
		);
	});

	it('says so when the path is a file that is not a game', async () => {
		const source = parseGameSource('o/r/README.md').source;
		const fetch = fakeFetch({ [contentsUrl(source)]: json(file('README.md')) });
		const entry = await fetchSourceGames(source, null, { fetch, now: NOW });
		expect(entry.error.kind).toBe('not-found');
		expect(entry.error.message).toMatch(/not a \.game\.md file/);
		expect(entry.games).toEqual([]);
	});

	describe('keeps the cached games and says what happened when GitHub cannot be read', () => {
		const cached = {
			...emptySourceCache(),
			etag: '"e1"',
			fetchedAt: '2026-11-08T10:00:00.000Z',
			checkedAt: '2026-11-08T10:00:00.000Z',
			games: [{ slug: 'x', title: 'X', source: { sha: 'abc' } }]
		};
		const expectKept = (entry) => {
			expect(entry.games).toEqual(cached.games);
			expect(entry.etag).toBe('"e1"');
			expect(entry.fetchedAt).toBe(cached.fetchedAt);
			expect(entry.checkedAt).toBe(new Date(NOW).toISOString());
		};

		it("GitHub's hourly limit", async () => {
			const reset = Math.floor(NOW / 1000) + 1800;
			const fetch = fakeFetch({
				[API]: json(
					{ message: 'API rate limit exceeded' },
					{
						status: 403,
						headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) }
					}
				)
			});
			const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });
			expectKept(entry);
			expect(entry.error.kind).toBe('rate-limit');
			expect(entry.error.message).toMatch(/hourly request limit/);
			expect(entry.error.retryAt).toBe(new Date(reset * 1000).toISOString());
		});

		it('a 403 that is not the limit', async () => {
			const fetch = fakeFetch({ [API]: json({ message: 'Forbidden' }, { status: 403 }) });
			const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });
			expectKept(entry);
			expect(entry.error).toEqual({
				kind: 'github',
				message: 'GitHub refused the request (HTTP 403).'
			});
		});

		it('a repository, folder or branch that is not there (or is private)', async () => {
			const fetch = fakeFetch({});
			const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });
			expectKept(entry);
			expect(entry.error.kind).toBe('not-found');
			expect(entry.error.message).toMatch(/private repository/);
		});

		it('no network', async () => {
			const fetch = vi.fn(async () => {
				throw new TypeError('Failed to fetch');
			});
			const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });
			expectKept(entry);
			expect(entry.error).toEqual({ kind: 'network', message: "Couldn't reach GitHub." });
		});

		it('an answer that is not JSON', async () => {
			const fetch = fakeFetch({ [API]: new Response('<html>', { status: 200 }) });
			const entry = await fetchSourceGames(SOURCE, cached, { fetch, now: NOW });
			expectKept(entry);
			expect(entry.error.kind).toBe('github');
		});

		it('with nothing cached yet, there are no games and the error stands', async () => {
			const fetch = fakeFetch({});
			const entry = await fetchSourceGames(SOURCE, null, { fetch, now: NOW });
			expect(entry.games).toEqual([]);
			expect(entry.fetchedAt).toBeNull();
			expect(entry.error.kind).toBe('not-found');
		});
	});
});

describe('sourceStatusLine', () => {
	const HOUR = 60 * 60 * 1000;
	const at = (ms) => new Date(NOW - ms).toISOString();

	it('describes a source at each stage', () => {
		expect(sourceStatusLine({ ...emptySourceCache(), refreshing: true }, NOW)).toBe(
			'Checking GitHub…'
		);
		expect(sourceStatusLine(emptySourceCache(), NOW)).toBe('Not checked yet.');
		expect(
			sourceStatusLine({ ...emptySourceCache(), fetchedAt: at(0), games: [{}, {}] }, NOW)
		).toBe('2 games, checked just now.');
		expect(
			sourceStatusLine({ ...emptySourceCache(), fetchedAt: at(5 * 60 * 1000), games: [{}] }, NOW)
		).toBe('1 game, checked 5 min ago.');
		expect(sourceStatusLine({ ...emptySourceCache(), fetchedAt: at(0) }, NOW)).toBe(
			'No .game.md files here, checked just now.'
		);
	});

	it('names the files that were skipped and why', () => {
		expect(
			sourceStatusLine(
				{
					...emptySourceCache(),
					fetchedAt: at(0),
					games: [{}],
					skipped: [{ name: 'broken.game.md', reason: 'it has no Card Deck section' }]
				},
				NOW
			)
		).toBe('1 game, checked just now. Skipped broken.game.md (it has no Card Deck section).');
	});

	it('after a failed check, says what went wrong and that the cached games stand', () => {
		const error = { kind: 'network', message: "Couldn't reach GitHub." };
		expect(
			sourceStatusLine(
				{ ...emptySourceCache(), fetchedAt: at(2 * HOUR), checkedAt: at(0), error, games: [{}] },
				NOW
			)
		).toBe("Couldn't reach GitHub. Showing the 1 game from 2 h ago.");
		expect(sourceStatusLine({ ...emptySourceCache(), checkedAt: at(0), error }, NOW)).toBe(
			"Couldn't reach GitHub. No games yet."
		);
	});
});
