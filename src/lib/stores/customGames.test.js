import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addCustomGame, friendlyUploadError, getCustomGames } from './customGames.js';
import { ValidationError } from '../parsers/markdownParser.js';
import { logger } from '../utils/logger.js';

describe('friendlyUploadError', () => {
	it('maps the parser’s messages to reasons a player can act on', () => {
		const cases = [
			[
				'No frontmatter found. File must start with --- frontmatter ---',
				"it doesn't start with a --- block"
			],
			['Invalid frontmatter format. Missing closing ---', "it doesn't start with a --- block"],
			['Missing required frontmatter fields: title', 'it has no title'],
			['Missing required frontmatter fields: title, win-message', 'it has no title or win-message'],
			[
				'Missing required frontmatter fields: title, subtitle, lose-message',
				'it has no title, subtitle or lose-message'
			],
			['No "## Card Deck" section found', 'it has no Card Deck section'],
			['File too large. Game files should be under 100KB.', "it's larger than 100KB"],
			['Invalid card rank: 11', "it isn't a valid game file"],
			['Parser error: something broke', "it isn't a valid game file"]
		];
		for (const [message, reason] of cases) {
			expect(friendlyUploadError(new ValidationError(message))).toBe(reason);
		}
	});

	it('reads a list of card counts as one reason', () => {
		const counts = new ValidationError([
			'Expected exactly 16 Challenge cards, found 15',
			'Expected exactly 28 Event cards, found 29'
		]);
		expect(friendlyUploadError(counts)).toBe("its deck doesn't have the cards the format needs");
		expect(
			friendlyUploadError(
				new ValidationError(['Only ONE Narrative card can have skip-damage modifier'])
			)
		).toBe("its deck doesn't have the cards the format needs");
	});

	it('falls back to plain words for anything else, never the technical message', () => {
		expect(friendlyUploadError(new Error('Unexpected token'))).toBe("it isn't a valid game file");
		expect(friendlyUploadError(undefined)).toBe("it isn't a valid game file");
	});
});

describe('addCustomGame', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.spyOn(logger, 'error').mockImplementation(() => {});
	});

	it('returns the plain reason for a file that is not a game', () => {
		const result = addCustomGame('# Just notes\n\nNo frontmatter here.', 'notes.game.md');
		expect(result.success).toBe(false);
		expect(result.kind).toBe('invalid');
		expect(result.reason).toBe("it doesn't start with a --- block");
		expect(result.reason).not.toMatch(/Error|Failed|Parser/);
		expect(getCustomGames()).toEqual([]);
	});

	it('names the missing section', () => {
		const md =
			'---\ntitle: A\nsubtitle: B\nwin-message: W\nlose-message: L\n---\n\n# Introduction\n\nHi\n';
		const result = addCustomGame(md, 'a.game.md');
		expect(result.success).toBe(false);
		expect(result.reason).toBe('it has no Card Deck section');
	});
});
