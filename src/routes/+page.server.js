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

		// Track unique game slugs
		const gameMap = new Map();

		// 1. Find V2 format games (.game.md files)
		entries
			.filter(entry => entry.isFile() && entry.name.endsWith('.game.md'))
			.forEach(entry => {
				const slug = entry.name.replace('.game.md', '');
				if (!gameMap.has(slug)) {
					gameMap.set(slug, {
						slug,
						title: slug
							.split('-')
							.map(word => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' '),
						format: 'v2'
					});
				}
			});

		// 2. Find V1 format games (directories)
		entries
			.filter(entry => entry.isDirectory())
			.forEach(entry => {
				// Only add if not already added by V2 format
				if (!gameMap.has(entry.name)) {
					gameMap.set(entry.name, {
						slug: entry.name,
						title: entry.name
							.split('-')
							.map(word => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' '),
						format: 'v1'
					});
				}
			});

		// Convert to array and sort by title
		const games = Array.from(gameMap.values()).sort((a, b) =>
			a.title.localeCompare(b.title)
		);

		logger.info(`Found ${games.length} games:`, games.map(g => `${g.slug} (${g.format})`));

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
