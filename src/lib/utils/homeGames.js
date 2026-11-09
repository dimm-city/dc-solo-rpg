/**
 * Small helpers for the home screen's game cards: slugs, subtitles and the saved-game line
 */

/** Rough length of one sitting, shown on every card */
export const SESSION_ESTIMATE = 'About 30 min';

/**
 * The game's slug, or one made from its title (custom games always carry a slug)
 * @param {{ slug?: string, title?: string }} game
 * @returns {string}
 */
export function gameSlug(game) {
	return game?.slug || game?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown';
}

/**
 * The card subtitle: the game's own `subtitle` frontmatter (read from the file by the home
 * loader for the built-in games, from the parsed file for uploads and games from GitHub
 * sources). Empty when the game has none.
 * @param {{ subtitle?: string, isCustom?: boolean, source?: object }} game
 * @returns {string}
 */
export function gameSubtitle(game) {
	const subtitle = typeof game?.subtitle === 'string' ? game.subtitle.trim() : '';
	if (subtitle) return subtitle;
	if (game?.source) return 'From GitHub';
	return game?.isCustom ? 'Your uploaded game' : '';
}

/**
 * The home screen's list: uploaded games, games from GitHub sources and the built-in games
 * together, by title. Every slug is distinct: uploads are named by file, source games by
 * repository and file, built-ins by file.
 * @param {...Array<{ title: string }>} groups
 * @returns {Array<object>}
 */
export function homeGameList(...groups) {
	return groups.flat().sort((a, b) => a.title.localeCompare(b.title));
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "just now", "5 min ago", "2 h ago", "yesterday", "3 days ago", then a short date
 * @param {string|number|Date} timestamp
 * @param {number} [now]
 * @returns {string} Empty for a missing or unreadable timestamp
 */
export function formatTimeAgo(timestamp, now = Date.now()) {
	const then = new Date(timestamp).getTime();
	if (!timestamp || Number.isNaN(then)) return '';
	const elapsed = Math.max(0, now - then);

	if (elapsed < MINUTE) return 'just now';
	if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
	if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} h ago`;
	if (elapsed < 2 * DAY) return 'yesterday';
	if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)} days ago`;
	return new Date(then).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/**
 * The parts of the Continue button's detail line, from getSaveMetadata():
 * ["Round 3", "2 h ago"]. A save from before round 1 (intro, opening roll) has no round.
 * @param {{ round?: number, timestamp?: string } | null} meta
 * @param {number} [now]
 * @returns {string[]}
 */
export function saveSummaryParts(meta, now = Date.now()) {
	if (!meta) return [];
	const parts = [];
	if (Number.isFinite(meta.round) && meta.round >= 1) parts.push(`Round ${meta.round}`);
	const ago = formatTimeAgo(meta.timestamp, now);
	if (ago) parts.push(ago);
	return parts;
}

/**
 * "Round 3" or "" for confirmation copy ("your Future Lost save (Round 3)")
 * @param {{ round?: number } | null} meta
 * @returns {string}
 */
export function saveRoundLabel(meta) {
	return Number.isFinite(meta?.round) && meta.round >= 1 ? `Round ${meta.round}` : '';
}
