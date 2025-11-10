import { readFile } from 'fs/promises';
import { join } from 'path';
import { error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import { parse } from 'csv-parse/sync';

// Get the project root directory reliably
// This works in both dev and production
const projectRoot = process.env.GAMES_BASE_DIR || process.cwd();

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;
	
	// Path to game directory in static folder
	const gameDir = join(projectRoot, 'static', 'games', slug);
	
	try {
		// Load config.yml
		const configPath = join(gameDir, 'config.yml');
		const configYaml = await readFile(configPath, 'utf-8');
		const config = yaml.load(configYaml);
		
		// Load deck.csv
		const deckPath = join(gameDir, config.deck || 'deck.csv');
		const deckCsv = await readFile(deckPath, 'utf-8');
		const deck = parse(deckCsv, {
			columns: true,
			skip_empty_lines: true
		});
		
		// Load introduction
		let introduction = '';
		if (config.introduction) {
			// Check if introduction is inline content (contains newlines) or a filename
			if (config.introduction.includes('\n') || !config.introduction.includes('.')) {
				// Inline content (has newlines or no file extension) - use as-is
				introduction = config.introduction;
			} else {
				// File reference (has file extension like .md) - load from file
				try {
					const introPath = join(gameDir, config.introduction);
					introduction = await readFile(introPath, 'utf-8');
				} catch (err) {
					// If file doesn't exist, treat as inline content
					console.warn(`Could not load introduction file "${config.introduction}", using as inline content`);
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
		console.error(`Error loading game "${slug}":`, err);
		throw error(404, `Game "${slug}" not found`);
	}
}
