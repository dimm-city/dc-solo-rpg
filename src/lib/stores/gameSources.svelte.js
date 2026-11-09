/**
 * Game sources: the public GitHub repositories a player has added in Settings, and the games
 * fetched from them. Everything lives in localStorage, so a game from a source stays playable
 * offline and the list survives a reload. Each source is checked on the home screen at most once
 * an hour (sooner after a failed check), or when the player asks for a refresh.
 */
import { logger } from '../utils/logger.js';
import { emptySourceCache, fetchSourceGames, parseGameSource } from '../services/githubGames.js';

const SOURCES_KEY = 'dc-solo-rpg-game-sources';
const STORAGE_VERSION = 1;

/**
 * Sources every player starts with. Each is added once, the first time this browser sees it;
 * a player who removes one keeps it removed (the id stays in `seeded`).
 */
export const DEFAULT_SOURCES = ['dimm-city/solo-rpg-games'];

/** How long a source's games are trusted before GitHub is asked again */
export const CACHE_TTL_MS = 60 * 60 * 1000;
/** How soon a source is tried again after a failed check */
export const RETRY_AFTER_ERROR_MS = 5 * 60 * 1000;

/**
 * @typedef {object} GameSource
 * @property {string} id - `owner/repo[/path][@branch]`, the key of the source
 * @property {string} owner
 * @property {string} repo
 * @property {string} path - Folder in the repository ('' for its root)
 * @property {string|null} branch - null for the default branch
 * @property {string|null} etag - The folder listing's ETag, for a free 304 next time
 * @property {string|null} fetchedAt - Last successful check (ISO)
 * @property {string|null} checkedAt - Last attempt (ISO)
 * @property {{kind: string, message: string}|null} error - What the last check ran into
 * @property {{name: string, reason: string}[]} skipped - Files that are not valid games
 * @property {object[]} games - Game configs, in the uploaded-game shape plus `source`
 * @property {boolean} refreshing - A check is under way (not stored)
 */

/** @returns {{sources: GameSource[], seeded: string[]}} seeded: default ids already added once */
function readStorage() {
	const empty = { sources: [], seeded: [] };
	try {
		if (typeof localStorage === 'undefined') return empty;
		const stored = JSON.parse(localStorage.getItem(SOURCES_KEY) ?? 'null');
		if (!stored) return empty;
		if (stored.version !== STORAGE_VERSION) {
			logger.warn('[gameSources] Version mismatch, clearing game sources');
			localStorage.removeItem(SOURCES_KEY);
			return empty;
		}
		return {
			sources: (stored.sources ?? []).map((source) => ({
				...emptySourceCache(),
				...source,
				refreshing: false
			})),
			seeded: Array.isArray(stored.seeded) ? stored.seeded : []
		};
	} catch (error) {
		logger.error('[gameSources] Failed to load game sources:', error);
		return empty;
	}
}

const store = $state({ ...readStorage(), refreshing: false });

/** @returns {boolean} false when the browser refused (storage full, private mode) */
function save() {
	try {
		const sources = $state.snapshot(store.sources).map(({ refreshing: _, ...source }) => source);
		const seeded = $state.snapshot(store.seeded);
		localStorage.setItem(
			SOURCES_KEY,
			JSON.stringify({ version: STORAGE_VERSION, sources, seeded })
		);
		return true;
	} catch (error) {
		logger.error('[gameSources] Failed to save game sources:', error);
		return false;
	}
}

/**
 * Add each default source this browser has not seen yet (see DEFAULT_SOURCES). Runs once at
 * load; one the player removed is not added again. Its games arrive with the next refresh.
 * @param {string[]} [defaults]
 * @returns {string[]} the ids added this time
 */
export function seedDefaultSources(defaults = DEFAULT_SOURCES) {
	const added = [];
	for (const text of defaults) {
		const parsed = parseGameSource(text);
		if (!parsed.ok || store.seeded.includes(parsed.source.id)) continue;
		store.seeded.push(parsed.source.id);
		if (!store.sources.some((source) => source.id === parsed.source.id)) {
			store.sources.push({ ...parsed.source, ...emptySourceCache(), refreshing: false });
			added.push(parsed.source.id);
		}
	}
	if (added.length || store.seeded.length) save();
	if (added.length) logger.info(`[gameSources] Added the default sources: ${added.join(', ')}`);
	return added;
}

if (typeof localStorage !== 'undefined') seedDefaultSources();

/** @returns {GameSource[]} The sources, in the order they were added (reactive) */
export function getGameSources() {
	return store.sources;
}

/** @returns {object[]} Every game from every source (reactive) */
export function getSourceGames() {
	return store.sources.flatMap((source) => source.games);
}

/** @returns {object|null} The game with this slug, from any source */
export function getSourceGame(slug) {
	return getSourceGames().find((game) => game.slug === slug) ?? null;
}

/** True while any source is being checked */
export function isRefreshingSources() {
	return store.refreshing;
}

/**
 * Add a source and fetch its games in the background.
 * @param {string} text - As typed: `owner/repo`, `owner/repo/folder@branch` or a github.com URL
 * @returns {{ok: true, source: GameSource} | {ok: false, error: string}} error is the plain
 *   reason to show under the field
 */
export function addGameSource(text) {
	const parsed = parseGameSource(text);
	if (!parsed.ok) return parsed;
	if (store.sources.some((source) => source.id === parsed.source.id)) {
		return { ok: false, error: 'That repository is already in your list.' };
	}

	const source = { ...parsed.source, ...emptySourceCache(), refreshing: false };
	store.sources.push(source);
	if (!save()) {
		store.sources.pop();
		return {
			ok: false,
			error: "Couldn't save the list in this browser. Free up some space and try again."
		};
	}
	logger.info(`[gameSources] Added ${source.id}`);
	refreshGameSources().catch((error) => logger.error('[gameSources] Refresh failed:', error));
	return { ok: true, source };
}

/**
 * Remove a source and its games from the list. Saved runs of those games are left alone.
 * @param {string} id
 * @returns {boolean} false when no source has this id
 */
export function removeGameSource(id) {
	const index = store.sources.findIndex((source) => source.id === id);
	if (index < 0) return false;
	store.sources.splice(index, 1);
	save();
	logger.info(`[gameSources] Removed ${id}`);
	return true;
}

/**
 * Whether a source is due a check: never checked, its games are older than an hour, or its
 * last check failed more than five minutes ago. A forced refresh checks everything.
 * @param {Pick<GameSource, 'fetchedAt'|'checkedAt'|'error'>} source
 * @param {number} [now]
 * @param {{force?: boolean}} [options]
 */
export function shouldRefresh(source, now = Date.now(), { force = false } = {}) {
	if (force) return true;
	const age = (iso) => (iso ? now - Date.parse(iso) : Infinity);
	if (source.error) return age(source.checkedAt) >= RETRY_AFTER_ERROR_MS;
	return age(source.fetchedAt) >= CACHE_TTL_MS;
}

let inFlight = null;
let forceNext = false;

/**
 * Check every source that is due (see shouldRefresh), one after another, and save the result.
 * A call while a check runs joins it; that check then makes another pass, so a source added
 * (or a "Refresh now" pressed) meanwhile is not missed. Once GitHub's request limit is hit, the
 * remaining sources are marked with that instead of being asked.
 * @param {{force?: boolean, now?: number, fetch?: typeof fetch}} [options] - force: check every
 *   source now ("Refresh now")
 * @returns {Promise<boolean>} true when at least one source was checked
 */
export function refreshGameSources({ force = false, ...rest } = {}) {
	if (inFlight) {
		forceNext ||= force;
		return inFlight;
	}
	inFlight = runRefresh({ force, ...rest }).finally(() => {
		inFlight = null;
	});
	return inFlight;
}

async function runRefresh({ force = false, now = Date.now(), fetch = globalThis.fetch }) {
	const done = [];
	let checked = false;
	let rateLimit = null;
	store.refreshing = true;
	try {
		// Another pass picks up a source added, or a forced refresh asked for, during this one
		for (;;) {
			force ||= forceNext;
			forceNext = false;
			const due = store.sources.filter(
				(source) => !done.includes(source.id) && shouldRefresh(source, now, { force })
			);
			if (!due.length) break;
			checked = true;
			for (const source of due) source.refreshing = true;
			for (const { id } of due) {
				done.push(id);
				// The player may have removed it while an earlier source was being checked
				const source = store.sources.find((s) => s.id === id);
				if (!source) continue;
				const { refreshing: _, ...cached } = $state.snapshot(source);
				const result = rateLimit
					? { ...cached, checkedAt: new Date(now).toISOString(), error: rateLimit }
					: await fetchSourceGames(cached, cached, { fetch, now });
				if (result.error?.kind === 'rate-limit') rateLimit = result.error;
				Object.assign(source, result, { refreshing: false });
				if (result.error) logger.warn(`[gameSources] ${id}: ${result.error.message}`);
			}
		}
	} finally {
		for (const source of store.sources) source.refreshing = false;
		store.refreshing = false;
		if (checked) save();
	}
	return checked;
}

/** Forget every source and its games (tests, and a future "clear" action) */
export function resetGameSources() {
	store.sources.splice(0, store.sources.length);
	store.seeded.splice(0, store.seeded.length);
	store.refreshing = false;
	try {
		localStorage.removeItem(SOURCES_KEY);
	} catch {
		// Nothing to clear
	}
}
