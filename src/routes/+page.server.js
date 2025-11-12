import { readdir } from 'fs/promises';
import { join } from 'path';
import { logger } from '$lib/utils/logger.js';

// Get the project root directory reliably
const projectRoot = process.env.GAMES_BASE_DIR || process.cwd();

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	// Read the games directory from static folder
	const gamesDir = join(projectRoot, 'static', 'games');

	try {
		const entries = await readdir(gamesDir, { withFileTypes: true });

		// Find V2 format games (.game.md files)
		const games = entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.game.md'))
			.map((entry) => {
				const slug = entry.name.replace('.game.md', '');
				return {
					slug,
					title: slug
						.split('-')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ')
				};
			})
			.sort((a, b) => a.title.localeCompare(b.title));

		logger.info(
			`Found ${games.length} V2 games:`,
			games.map((g) => g.slug)
		);

		return {
			games
		};
	} catch (err) {
		logger.error('Error loading games:', err);
		return {
			games: []
		};
	}
}
