/**
 * Games hosted in a public GitHub repository: the source a player types in Settings
 * (`owner/repo`, an optional folder, an optional `@branch`), and one check of such a source
 * through GitHub's Contents API. Anonymous requests are limited to 60 an hour per network, so a
 * check sends the listing's ETag (an unchanged listing is a free 304) and downloads only the
 * files whose sha changed. The list and cache live in stores/gameSources.svelte.js.
 */
import { parseGameFile } from '../parsers/markdownParser.js';
import { convertToGameConfig, friendlyUploadError } from '../stores/customGames.js';
import { formatTimeAgo } from '../utils/homeGames.js';

const API_URL = 'https://api.github.com';

// GitHub's own rules: an owner is letters, digits and single hyphens; a repo adds . and _
const OWNER = '[A-Za-z0-9](?:-?[A-Za-z0-9])*';
const REPO = '[A-Za-z0-9._-]+';
// owner/repo, then an optional /folder (no @ in it) and an optional @branch (may hold /)
const SOURCE_RE = new RegExp(`^(${OWNER})/(${REPO})((?:/[^@\\s]*)?)(?:@(\\S+))?$`);
// https://github.com/owner/repo, optionally .git or /tree/branch/folder (or /blob/branch/file)
// (the repo is matched lazily so a trailing .git is dropped; a branch holding / is read as its
// first segment, which the short form handles properly)
const URL_RE = new RegExp(
	`^(?:https?://)?(?:www\\.)?github\\.com/(${OWNER})/([A-Za-z0-9._-]+?)(?:\\.git)?(?:/(?:tree|blob)/([^/\\s]+)((?:/[^\\s]*)?))?/?$`
);

/** The one-line format reminder shown when a source can't be read */
export const SOURCE_FORMAT_HINT =
	'Use owner/repo, with an optional folder and @branch, like dimm-city/dc-solo-rpg/static/games.';

/**
 * Read a source as the player typed it.
 * @param {string} text - `owner/repo`, `owner/repo/folder`, `owner/repo@branch`,
 *   `owner/repo/folder@branch`, or a github.com URL of a repository, folder or file
 * @returns {{ok: true, source: {id: string, owner: string, repo: string, path: string,
 *   branch: string|null}} | {ok: false, error: string}} id is the normalised form, used as the
 *   key of the source and the namespace of its games' slugs
 */
export function parseGameSource(text) {
	const trimmed = String(text ?? '').trim();
	if (!trimmed) return { ok: false, error: 'Type a repository first.' };

	let match = trimmed.match(URL_RE);
	let [owner, repo, path, branch] = match
		? [match[1], match[2], match[4], match[3]]
		: (trimmed.match(SOURCE_RE) ?? []).slice(1);
	if (!owner || !repo || /^\.+$/.test(repo)) return { ok: false, error: SOURCE_FORMAT_HINT };

	owner = owner.toLowerCase();
	repo = repo.toLowerCase();
	path = (path ?? '').split('/').filter(Boolean).join('/');
	branch = branch || null;
	const id = `${owner}/${repo}${path ? `/${path}` : ''}${branch ? `@${branch}` : ''}`;
	return { ok: true, source: { id, owner, repo, path, branch } };
}

/** "owner/repo/folder" with the branch after it, for a list row */
export function sourceLabel(source) {
	return `${source.owner}/${source.repo}${source.path ? `/${source.path}` : ''}`;
}

/** Lower case, letters and digits, hyphens between */
function slugify(text) {
	return String(text)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * The slug of a game file in a source, namespaced by the source so two repositories holding a
 * `future-lost.game.md` give two games (and neither clashes with a built-in or uploaded one).
 * @param {{id: string}} source
 * @param {string} fileName - `my-game.game.md`
 * @returns {string} `dimm-city-dc-solo-rpg-static-games--my-game`
 */
export function sourceGameSlug(source, fileName) {
	return `${slugify(source.id)}--${slugify(fileName.replace(/\.game\.md$/i, ''))}`;
}

/** The Contents API URL of the source's folder (or file), on its branch when one is set */
export function contentsUrl(source) {
	const path = source.path ? `/${source.path.split('/').map(encodeURIComponent).join('/')}` : '';
	const ref = source.branch ? `?ref=${encodeURIComponent(source.branch)}` : '';
	return `${API_URL}/repos/${source.owner}/${source.repo}/contents${path}${ref}`;
}

/** A cache entry with nothing in it yet */
export function emptySourceCache() {
	return { etag: null, fetchedAt: null, checkedAt: null, error: null, skipped: [], games: [] };
}

/**
 * Why a listing request failed, in words for the Settings row
 * @param {Response} response
 */
function responseError(response) {
	const limited = response.headers.get('x-ratelimit-remaining') === '0';
	if ((response.status === 403 || response.status === 429) && limited) {
		const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
		const at = Number.isFinite(reset) && reset > 0 ? new Date(reset) : null;
		const when = at
			? ` after ${at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
			: ' in an hour';
		return {
			kind: 'rate-limit',
			message: `GitHub's hourly request limit for this network is used up; it checks again${when}.`,
			retryAt: at ? at.toISOString() : null
		};
	}
	if (response.status === 404) {
		return {
			kind: 'not-found',
			message:
				"Not found on GitHub. Check the owner, repository, folder and branch; a private repository can't be read."
		};
	}
	return { kind: 'github', message: `GitHub refused the request (HTTP ${response.status}).` };
}

/**
 * The .game.md entries of a Contents API answer: a folder's array, or a single file
 * @param {unknown} listing
 * @returns {Array<{name: string, path: string, sha: string, download_url: string}> | null}
 *   null when the path is a file that is not a game
 */
function gameFiles(listing) {
	const entries = Array.isArray(listing) ? listing : listing?.type === 'file' ? [listing] : [];
	const games = entries.filter(
		(entry) => entry?.type === 'file' && /\.game\.md$/i.test(entry.name ?? '') && entry.download_url
	);
	return !Array.isArray(listing) && listing?.type === 'file' && !games.length ? null : games;
}

/**
 * A game config from a fetched file, in the uploaded-game shape plus where it came from
 */
function toSourceGame(parsed, slug, source, file, fetchedAt) {
	return {
		...convertToGameConfig(parsed, slug),
		metadata: { ...parsed.metadata, fetchedAt },
		source: {
			id: source.id,
			owner: source.owner,
			repo: source.repo,
			branch: source.branch,
			path: file.path,
			sha: file.sha,
			url: file.download_url
		}
	};
}

/**
 * One check of a source: list its folder, then download and parse each .game.md whose sha is
 * new (an unchanged file keeps its cached game). Returns the source's new cache entry; on any
 * failure the cached games are kept and `error` says what happened. Never throws.
 * @param {{id, owner, repo, path, branch}} source
 * @param {ReturnType<typeof emptySourceCache>|null} cached - The entry from the last check
 * @param {{fetch?: typeof fetch, now?: number}} [options] - For tests
 * @returns {Promise<ReturnType<typeof emptySourceCache>>}
 */
export async function fetchSourceGames(
	source,
	cached = null,
	{ fetch = globalThis.fetch, now = Date.now() } = {}
) {
	const previous = { ...emptySourceCache(), ...cached };
	const checkedAt = new Date(now).toISOString();
	const failed = (error) => ({ ...previous, checkedAt, error });

	let response;
	try {
		const headers = { Accept: 'application/vnd.github+json' };
		if (previous.etag && previous.fetchedAt) headers['If-None-Match'] = previous.etag;
		response = await fetch(contentsUrl(source), { headers });
	} catch {
		return failed({ kind: 'network', message: "Couldn't reach GitHub." });
	}

	// Nothing changed since the last check: free, and the cached games stand
	if (response.status === 304 && previous.fetchedAt) {
		return { ...previous, checkedAt, fetchedAt: checkedAt, error: null };
	}
	if (!response.ok) return failed(responseError(response));

	let listing;
	try {
		listing = await response.json();
	} catch {
		return failed({ kind: 'github', message: "GitHub's answer wasn't a folder listing." });
	}
	const files = gameFiles(listing);
	if (files === null) {
		return failed({
			kind: 'not-found',
			message: 'That path is a file, but not a .game.md file. Point at a game or a folder.'
		});
	}

	const results = await Promise.all(
		files.map(async (file) => {
			const slug = sourceGameSlug(source, file.name);
			const known = previous.games.find((game) => game.slug === slug);
			if (known?.source?.sha === file.sha) return { game: known };
			let markdown;
			try {
				const download = await fetch(file.download_url);
				if (!download.ok) throw new Error(`HTTP ${download.status}`);
				markdown = await download.text();
			} catch {
				// Keep the copy we have rather than drop a game over one failed download
				return known
					? { game: known }
					: { skipped: { name: file.name, reason: "it couldn't be downloaded" } };
			}
			try {
				const parsed = parseGameFile(markdown, { baseUrl: file.download_url });
				return { game: toSourceGame(parsed, slug, source, file, checkedAt) };
			} catch (error) {
				return { skipped: { name: file.name, reason: friendlyUploadError(error) } };
			}
		})
	);

	return {
		etag: response.headers.get('etag') ?? null,
		fetchedAt: checkedAt,
		checkedAt,
		error: null,
		skipped: results.filter((r) => r.skipped).map((r) => r.skipped),
		games: results.filter((r) => r.game).map((r) => r.game)
	};
}

/** "3 games", "1 game" */
const gameCount = (n) => `${n} game${n === 1 ? '' : 's'}`;

/**
 * The status line under a source in Settings: what it holds, when it was checked, and what
 * went wrong on the last check (the cached games stay playable meanwhile).
 * @param {ReturnType<typeof emptySourceCache> & {refreshing?: boolean}} entry
 * @param {number} [now]
 * @returns {string}
 */
export function sourceStatusLine(entry, now = Date.now()) {
	const games = entry.games?.length ?? 0;
	const skipped = entry.skipped?.length
		? ` Skipped ${entry.skipped.map((s) => `${s.name} (${s.reason})`).join(', ')}.`
		: '';
	if (entry.refreshing) return 'Checking GitHub…';

	if (entry.error) {
		const held = entry.fetchedAt
			? ` Showing the ${gameCount(games)} from ${formatTimeAgo(entry.fetchedAt, now)}.`
			: ' No games yet.';
		return `${entry.error.message}${held}`;
	}
	if (!entry.fetchedAt) return 'Not checked yet.';
	const checked = `checked ${formatTimeAgo(entry.fetchedAt, now)}`;
	if (!games) return `No .game.md files here, ${checked}.${skipped}`;
	return `${gameCount(games)}, ${checked}.${skipped}`;
}
