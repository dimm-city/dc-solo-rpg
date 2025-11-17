import { error } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger.js';
import { parseGameFile, ValidationError } from '$lib/parsers/markdownParser.js';

/**
 * Format introduction sections into markdown
 * @param {Array} sections - Introduction sections
 * @returns {string} Formatted markdown
 */
function formatIntroduction(sections) {
	return sections.map((section) => `## ${section.heading}\n\n${section.content}`).join('\n\n');
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {
	const { slug } = params;

	try {
		const gameUrl = `/games/${slug}.game.md`;
		const gameResponse = await fetch(gameUrl);

		if (!gameResponse.ok) {
			throw error(404, `Game "${slug}" not found`);
		}

		const markdown = await gameResponse.text();
		const parsed = parseGameFile(markdown);

		// Convert to internal game config format
		const gameConfig = {
			slug,
			title: parsed.title,
			subtitle: parsed.subtitle,
			labels: {
				successCheckWin: parsed['win-message'],
				failureCheckLoss: parsed['lose-message'],
				failureCounterLoss: parsed['lose-message']
			},
			deck: parsed.deck,
			introduction: formatIntroduction(parsed.introduction),
			loaded: true,
			stylesheet: '', // `/games/${slug}/game.css`, // Optional stylesheet
			metadata: parsed.metadata
		};

		logger.info(`Successfully loaded "${slug}"`);

		return {
			slug,
			gameConfig,
			player: {
				name: 'Guest'
			}
		};
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`Validation error for "${slug}":`, err.errors);
			throw error(400, `Invalid game file: ${err.message}`);
		}
		logger.error(`Error loading game "${slug}":`, err);
		throw error(404, `Game "${slug}" not found`);
	}
}
