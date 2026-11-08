/**
 * The built-in games: every static/games/*.game.md, found at build time. Vite bundles the files
 * into this module, so adding a game is adding its file; there is no index to generate or keep.
 * (Reading the folder at request time worked in dev but not on the host, whose server function
 * has no static folder, and a generated index used to paper over that.)
 */
import { parseGameFile } from '$lib/parsers/markdownParser.js';
import { logger } from '$lib/utils/logger.js';

const gameFiles = import.meta.glob('/static/games/*.game.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

/**
 * The home screen's list: slug, title and subtitle of each game, by title. A file the parser
 * rejects is left out and logged, so one broken game does not blank the list.
 * @param {Record<string, string>} [files] - path to markdown, as import.meta.glob gives it
 * @returns {{slug: string, title: string, subtitle: string}[]}
 */
export function listBuiltInGames(files = gameFiles) {
	const games = [];
	for (const [path, markdown] of Object.entries(files)) {
		const slug = path
			.split('/')
			.pop()
			.replace(/\.game\.md$/, '');
		try {
			const { title, subtitle } = parseGameFile(markdown);
			games.push({ slug, title, subtitle: subtitle || '' });
		} catch (error) {
			logger.error(`Skipping built-in game "${slug}": ${error.message}`);
		}
	}
	return games.sort((a, b) => a.title.localeCompare(b.title));
}

/** The list, computed once: the files are fixed at build time */
export const builtInGames = listBuiltInGames();
