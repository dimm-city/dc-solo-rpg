import { builtInGames } from './builtInGames.js';

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return { games: builtInGames };
}
