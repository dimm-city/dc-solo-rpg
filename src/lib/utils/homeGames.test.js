import { describe, it, expect } from 'vitest';
import {
	gameSlug,
	gameSubtitle,
	homeGameList,
	formatTimeAgo,
	saveSummaryParts,
	saveRoundLabel
} from './homeGames.js';

const NOW = Date.parse('2026-11-06T20:00:00Z');
const ago = (ms) => new Date(NOW - ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('gameSubtitle', () => {
	it("uses the game's own subtitle from the games index (frontmatter)", () => {
		expect(
			gameSubtitle({
				slug: 'ghost-in-the-machine',
				title: 'Locked In the Tech District',
				subtitle: 'Grab and go turned mad dash for the gate'
			})
		).toBe('Grab and go turned mad dash for the gate');
	});

	it('never falls back to a placeholder for a built-in game', () => {
		expect(gameSubtitle({ slug: 'future-lost', subtitle: '' })).toBe('');
		expect(gameSubtitle({ slug: 'future-lost' })).toBe('');
		expect(gameSubtitle({ slug: 'future-lost', subtitle: '   ' })).toBe('');
	});

	it("uses an uploaded game's subtitle, or names it as an upload", () => {
		expect(gameSubtitle({ isCustom: true, subtitle: 'A night shift' })).toBe('A night shift');
		expect(gameSubtitle({ isCustom: true })).toBe('Your uploaded game');
	});

	it("uses a GitHub game's subtitle, or says where it is from", () => {
		const source = { id: 'o/r', owner: 'o', repo: 'r' };
		expect(gameSubtitle({ isCustom: true, source, subtitle: 'Far away' })).toBe('Far away');
		expect(gameSubtitle({ isCustom: true, source })).toBe('From GitHub');
	});
});

describe('homeGameList', () => {
	it('puts uploaded, GitHub and built-in games in one list, by title', () => {
		const uploads = [{ slug: 'night-shift', title: 'Night Shift', isCustom: true }];
		const fromGitHub = [
			{ slug: 'o-r--future-lost', title: 'Future Lost', isCustom: true, source: { id: 'o/r' } },
			{ slug: 'o-r--abyss', title: 'Abyss', isCustom: true, source: { id: 'o/r' } }
		];
		const builtIn = [{ slug: 'future-lost', title: 'Future Lost' }];
		const list = homeGameList(uploads, fromGitHub, builtIn);
		expect(list.map((g) => g.title)).toEqual([
			'Abyss',
			'Future Lost',
			'Future Lost',
			'Night Shift'
		]);
		// The same file from a repository and the built-in copy are two games with two slugs
		expect(new Set(list.map(gameSlug)).size).toBe(4);
		expect(homeGameList([], [], [])).toEqual([]);
	});
});

describe('gameSlug', () => {
	it('prefers the slug and otherwise slugifies the title', () => {
		expect(gameSlug({ slug: 'future-lost', title: 'Whatever' })).toBe('future-lost');
		expect(gameSlug({ title: 'Locked In the Tech District' })).toBe('locked-in-the-tech-district');
		expect(gameSlug({})).toBe('unknown');
	});
});

describe('formatTimeAgo', () => {
	it('reads as a short relative time', () => {
		expect(formatTimeAgo(ago(20 * 1000), NOW)).toBe('just now');
		expect(formatTimeAgo(ago(5 * MIN), NOW)).toBe('5 min ago');
		expect(formatTimeAgo(ago(2 * HOUR + 10 * MIN), NOW)).toBe('2 h ago');
		expect(formatTimeAgo(ago(30 * HOUR), NOW)).toBe('yesterday');
		expect(formatTimeAgo(ago(3 * DAY), NOW)).toBe('3 days ago');
	});

	it('falls back to a short date after a week', () => {
		const text = formatTimeAgo(ago(20 * DAY), NOW);
		expect(text).not.toMatch(/ago|yesterday/);
		expect(text).toMatch(/17/);
	});

	it('treats a clock that runs ahead as just now, and bad input as nothing', () => {
		expect(formatTimeAgo(new Date(NOW + 5 * MIN).toISOString(), NOW)).toBe('just now');
		expect(formatTimeAgo(undefined, NOW)).toBe('');
		expect(formatTimeAgo('not a date', NOW)).toBe('');
	});
});

describe('saveSummaryParts', () => {
	it('gives the round and the time since the save, from getSaveMetadata()', () => {
		expect(saveSummaryParts({ round: 3, timestamp: ago(2 * HOUR) }, NOW)).toEqual([
			'Round 3',
			'2 h ago'
		]);
	});

	it('leaves out the round for a save made before round 1', () => {
		expect(saveSummaryParts({ round: 0, timestamp: ago(5 * MIN) }, NOW)).toEqual(['5 min ago']);
	});

	it('copes with missing metadata', () => {
		expect(saveSummaryParts(null, NOW)).toEqual([]);
		expect(saveSummaryParts({ round: 2 }, NOW)).toEqual(['Round 2']);
	});
});

describe('saveRoundLabel', () => {
	it('names the round for confirmation copy', () => {
		expect(saveRoundLabel({ round: 3 })).toBe('Round 3');
		expect(saveRoundLabel({ round: 0 })).toBe('');
		expect(saveRoundLabel(null)).toBe('');
	});
});
