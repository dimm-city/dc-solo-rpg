import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '$lib/utils/logger.js';

// Get the project root directory reliably
const projectRoot = process.env.GAMES_BASE_DIR || process.cwd();

/**
 * Extract frontmatter from a markdown file
 * @param {string} content - The markdown file content
 * @returns {Object} - The parsed frontmatter object
 */
function extractFrontmatter(content) {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return {};
	}

	const frontmatterText = match[1];
	const frontmatter = {};

	// Parse YAML-style frontmatter
	frontmatterText.split('\n').forEach((line) => {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.substring(0, colonIndex).trim();
			const value = line.substring(colonIndex + 1).trim();
			frontmatter[key] = value;
		}
	});

	return frontmatter;
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	// Read the games directory from static folder
	const gamesDir = join(projectRoot, 'static', 'games');

	try {
		const entries = await readdir(gamesDir, { withFileTypes: true });

		// Find V2 format games (.game.md files)
		const gameFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.game.md'));

		// Read each game file and extract frontmatter
		const games = await Promise.all(
			gameFiles.map(async (entry) => {
				const slug = entry.name.replace('.game.md', '');
				const filePath = join(gamesDir, entry.name);

				try {
					const content = await readFile(filePath, 'utf-8');
					const frontmatter = extractFrontmatter(content);

					return {
						slug,
						title:
							frontmatter.title ||
							slug
								.split('-')
								.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' '),
						subtitle: frontmatter.subtitle || ''
					};
				} catch (err) {
					logger.error(`Error reading game file ${entry.name}:`, err);
					// Fallback to slug-based title if file read fails
					return {
						slug,
						title: slug
							.split('-')
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' '),
						subtitle: ''
					};
				}
			})
		);

		// Sort by title
		games.sort((a, b) => a.title.localeCompare(b.title));

		logger.info(
			`Found ${games.length} V2 games:`,
			games.map((g) => `${g.title} (${g.slug})`)
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
