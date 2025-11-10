import { readdir } from 'fs/promises';
import { join } from 'path';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	// Read the games directory
	const gamesDir = join(process.cwd(), 'static', 'games');
	
	try {
		const entries = await readdir(gamesDir, { withFileTypes: true });
		
		// Filter for directories only and map to game objects
		const games = entries
			.filter(entry => entry.isDirectory())
			.map(entry => ({
				slug: entry.name,
				// Convert slug to title (e.g., 'future-lost' -> 'Future Lost')
				title: entry.name
					.split('-')
					.map(word => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')
			}));
		
		return {
			games
		};
	} catch (error) {
		console.error('Error loading games:', error);
		return {
			games: []
		};
	}
}
