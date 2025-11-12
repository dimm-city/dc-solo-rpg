import { error } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger.js';
import { parseV2GameFile, ValidationError } from '$lib/parsers/v2MarkdownParser.js';

/**
 * Format V2 introduction sections into markdown
 * @param {Array} sections - Introduction sections
 * @returns {string} Formatted markdown
 */
function formatV2Introduction(sections) {
	return sections
		.map(section => `## ${section.heading}\n\n${section.content}`)
		.join('\n\n');
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {
	const { slug } = params;

	try {
		const v2Url = `/games/${slug}.game.md`;
		const v2Response = await fetch(v2Url);

		if (!v2Response.ok) {
			throw error(404, `Game "${slug}" not found`);
		}

		const markdown = await v2Response.text();
		const parsed = parseV2GameFile(markdown);

		// Convert V2 format to internal game config format
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
			introduction: formatV2Introduction(parsed.introduction),
			loaded: true,
			stylesheet: `/games/${slug}/game.css`, // Optional stylesheet
			metadata: parsed.metadata
		};

		logger.info(`Successfully loaded "${slug}" (V2 format)`);

		return {
			slug,
			gameConfig,
			player: {
				name: 'Guest'
			}
		};
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`V2 validation error for "${slug}":`, err.errors);
			throw error(400, `Invalid V2 game file: ${err.message}`);
		}
		logger.error(`Error loading game "${slug}":`, err);
		throw error(404, `Game "${slug}" not found`);
	}
}
