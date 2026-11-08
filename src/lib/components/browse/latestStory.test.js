import { describe, it, expect } from 'vitest';
import { isCompletedStory, latestCompletedStory } from './latestStory.js';

describe('latestCompletedStory', () => {
	it('picks the newest finished run, won or lost', () => {
		const saves = [
			{ id: 'a', isWon: true, lastPlayed: '2026-01-02T10:00:00Z' },
			{ id: 'b', isWon: false, lastPlayed: '2026-03-01T10:00:00Z' },
			{ id: 'c', isWon: false, savedAt: '2026-02-01T10:00:00Z' }
		];
		expect(latestCompletedStory(saves).id).toBe('b');
	});

	it('skips a game still in progress, even a newer one', () => {
		const saves = [
			{ id: 'done', isWon: true, lastPlayed: '2026-01-02T10:00:00Z' },
			{ id: 'playing', lastPlayed: '2026-05-01T10:00:00Z' }
		];
		expect(latestCompletedStory(saves).id).toBe('done');
		expect(isCompletedStory({ isWon: undefined })).toBe(false);
	});

	it('falls back to savedAt, and is null with no finished run', () => {
		expect(
			latestCompletedStory([
				{ id: 'x', isWon: true, savedAt: '2026-04-01T00:00:00Z' },
				{ id: 'y', isWon: true, lastPlayed: '2026-03-01T00:00:00Z' }
			]).id
		).toBe('x');
		expect(latestCompletedStory([{ id: 'z' }])).toBeNull();
		expect(latestCompletedStory()).toBeNull();
	});
});
