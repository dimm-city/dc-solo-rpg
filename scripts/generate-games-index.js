import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root directory (one level up from scripts/)
const projectRoot = join(__dirname, '..');

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

/**
 * Generate the games index JSON file
 */
async function generateGamesIndex() {
	console.log('[generate-games-index] Starting...');

	const gamesDir = join(projectRoot, 'static', 'games');
	const outputPath = join(gamesDir, 'index.json');

	try {
		const entries = await readdir(gamesDir, { withFileTypes: true });

		// Find V2 format games (.game.md files)
		const gameFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.game.md'));

		console.log(`[generate-games-index] Found ${gameFiles.length} .game.md files`);

		// Read each game file and extract frontmatter
		const games = await Promise.all(
			gameFiles.map(async (entry) => {
				const slug = entry.name.replace('.game.md', '');
				const filePath = join(gamesDir, entry.name);

				try {
					const content = await readFile(filePath, 'utf-8');
					const frontmatter = extractFrontmatter(content);

					const game = {
						slug,
						title:
							frontmatter.title ||
							slug
								.split('-')
								.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
								.join(' '),
						subtitle: frontmatter.subtitle || ''
					};

					console.log(`[generate-games-index]   - ${game.title} (${slug})`);
					return game;
				} catch (err) {
					console.error(`[generate-games-index] Error reading game file ${entry.name}:`, err);
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

		// Write the index JSON file
		const indexData = {
			games,
			generatedAt: new Date().toISOString()
		};

		await writeFile(outputPath, JSON.stringify(indexData, null, 2), 'utf-8');

		console.log(
			`[generate-games-index] Successfully generated ${outputPath} with ${games.length} games`
		);
	} catch (err) {
		console.error('[generate-games-index] Error generating games index:', err);
		process.exit(1);
	}
}

// Run the script
generateGamesIndex();
