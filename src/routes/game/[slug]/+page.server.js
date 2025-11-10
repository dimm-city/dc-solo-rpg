import { readFile } from 'fs/promises';
import { join } from 'path';
import { error } from '@sveltejs/kit';
import yaml from 'js-yaml';
import { parse } from 'csv-parse/sync';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;
	
	// Path to game directory
	const gameDir = join(process.cwd(), 'static', 'games', slug);
	
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
			const introPath = join(gameDir, config.introduction);
			introduction = await readFile(introPath, 'utf-8');
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
