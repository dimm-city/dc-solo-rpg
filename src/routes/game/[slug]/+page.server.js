import { error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import { parse } from 'csv-parse/sync';
import { logger } from '$lib/utils/logger.js';
import { parseV2GameFile, ValidationError } from '$lib/parsers/v2MarkdownParser.js';

/**
 * Try to load V2 format (.game.md file)
 * @param {string} slug - Game slug
 * @param {Function} fetch - Fetch function
 * @returns {Promise<object|null>} Game config or null if not found
 */
async function loadV2Game(slug, fetch) {
	try {
		const v2Url = `/games/${slug}.game.md`;
		const v2Response = await fetch(v2Url);

		if (!v2Response.ok) {
			return null; // V2 file doesn't exist
		}

		const markdown = await v2Response.text();
		const parsed = parseV2GameFile(markdown);

		// Convert V2 format to internal game config format
		return {
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
	} catch (err) {
		if (err instanceof ValidationError) {
			logger.error(`V2 validation error for "${slug}":`, err.errors);
			throw error(400, `Invalid V2 game file: ${err.message}`);
		}
		logger.error(`Error loading V2 game "${slug}":`, err);
		return null; // V2 loading failed, try V1
	}
}

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

/**
 * Load V1 format (config.yml + deck.csv + intro.md)
 * @param {string} slug - Game slug
 * @param {Function} fetch - Fetch function
 * @returns {Promise<object>} Game config
 */
async function loadV1Game(slug, fetch) {
	// Load config.yml using fetch (SvelteKit serves static files directly)
	const configUrl = `/games/${slug}/config.yml`;
	const configResponse = await fetch(configUrl);

	if (!configResponse.ok) {
		throw new Error(`Failed to load config: ${configResponse.status}`);
	}

	const configYaml = await configResponse.text();
	const config = yaml.load(configYaml);

	// Load deck.csv using fetch
	const deckUrl = `/games/${slug}/${config.deck || 'deck.csv'}`;
	const deckResponse = await fetch(deckUrl);

	if (!deckResponse.ok) {
		throw new Error(`Failed to load deck: ${deckResponse.status}`);
	}

	const deckCsv = await deckResponse.text();
	const deck = parse(deckCsv, {
		columns: true,
		skip_empty_lines: true
	});

	// Load introduction using fetch
	let introduction = '';
	if (config.introduction) {
		// Check if introduction is inline content (contains newlines) or a filename
		if (config.introduction.includes('\n') || !config.introduction.includes('.')) {
			// Inline content (has newlines or no file extension) - use as-is
			introduction = config.introduction;
		} else {
			// File reference (has file extension like .md) - load from file using fetch
			const introUrl = `/games/${slug}/${config.introduction}`;
			const introResponse = await fetch(introUrl);

			if (introResponse.ok) {
				introduction = await introResponse.text();
			} else {
				// If file doesn't exist, treat as inline content
				logger.warn(
					`Could not load introduction file "${config.introduction}", using as inline content`
				);
				introduction = config.introduction;
			}
		}
	}

	// Return the complete game configuration
	return {
		...config,
		slug,
		deck,
		introduction,
		loaded: true,
		stylesheet: `/games/${slug}/${config.stylesheet || 'game.css'}`,
		metadata: {
			format: 'v1-legacy',
			loaded: new Date().toISOString()
		}
	};
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {
	const { slug } = params;

	try {
		// Try V2 format first
		logger.debug(`Loading game "${slug}", trying V2 format first...`);
		const v2Config = await loadV2Game(slug, fetch);

		if (v2Config) {
			logger.info(`Successfully loaded "${slug}" as V2 format`);
			return {
				slug,
				gameConfig: v2Config,
				player: {
					name: 'Guest'
				}
			};
		}

		// Fall back to V1 format
		logger.debug(`V2 not found for "${slug}", trying V1 format...`);
		const v1Config = await loadV1Game(slug, fetch);

		logger.warn(
			`Loaded "${slug}" using deprecated V1 format. Consider migrating to V2 format (.game.md)`
		);

		return {
			slug,
			gameConfig: v1Config,
			player: {
				name: 'Guest'
			}
		};
	} catch (err) {
		logger.error(`Error loading game "${slug}":`, err);
		throw error(404, `Game "${slug}" not found`);
	}
}
