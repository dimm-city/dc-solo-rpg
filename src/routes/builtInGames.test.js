/**
 * The built-in games are whatever .game.md files static/games holds, read by the home loader at
 * build time with each file's own title and subtitle. This reads the real folder.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { builtInGames, listBuiltInGames } from './builtInGames.js';

const gamesDir = join(process.cwd(), 'static', 'games');

describe('built-in games', () => {
	it("lists every .game.md in static/games, by title, with the file's title and subtitle", () => {
		const files = readdirSync(gamesDir).filter((name) => name.endsWith('.game.md'));
		expect(builtInGames.map((g) => g.slug).sort()).toEqual(
			files.map((name) => name.replace('.game.md', '')).sort()
		);
		const titles = builtInGames.map((g) => g.title);
		expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
		for (const game of builtInGames) {
			const markdown = readFileSync(join(gamesDir, `${game.slug}.game.md`), 'utf-8');
			expect(markdown).toContain(`title: ${game.title}`);
			expect(markdown).toContain(`subtitle: ${game.subtitle}`);
		}
	});

	it('leaves out a file the parser rejects, keeping the rest', () => {
		const good = readFileSync(join(gamesDir, 'ghost-in-the-machine.game.md'), 'utf-8');
		const games = listBuiltInGames({
			'/static/games/ghost-in-the-machine.game.md': good,
			'/static/games/broken.game.md': 'not a game'
		});
		expect(games.map((g) => g.slug)).toEqual(['ghost-in-the-machine']);
	});
});
