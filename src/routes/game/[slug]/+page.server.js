import { error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import { parse } from 'csv-parse/sync';
import { logger } from '$lib/utils/logger.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {
	const { slug } = params;

	try {
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
			slug,
			gameConfig: {
				...config,
				deck,
				introduction,
				loaded: true,
				stylesheet: `/games/${slug}/${config.stylesheet || 'game.css'}`
			},
			player: {
				name: 'Guest'
			}
		};
	} catch (err) {
		logger.error(`Error loading game "${slug}":`, err);
		throw error(404, `Game "${slug}" not found`);
	}
}
