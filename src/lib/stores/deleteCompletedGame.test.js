/**
 * Deleting a story from the Story Library removes the save and both kinds of audio (SM-04),
 * and never touches an in-progress save.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openDB } from 'idb';
import { deleteCompletedGame } from './indexedDBStorage.js';

vi.mock('idb', () => ({ openDB: vi.fn() }));

describe('deleteCompletedGame', () => {
	const db = { delete: vi.fn(async () => {}) };

	beforeEach(() => {
		db.delete.mockClear();
		vi.mocked(openDB).mockResolvedValue(db);
		globalThis.indexedDB ??= {};
	});

	it('deletes the save, its journal audio and its AI story audio', async () => {
		const key = 'future-lost:completed:1762400000000';
		await expect(deleteCompletedGame(key)).resolves.toBe(true);
		expect(db.delete.mock.calls).toEqual([
			['saves', key],
			['audio', key],
			['audio', `${key}:story-audio`]
		]);
	});

	it('refuses anything that is not a completed game', async () => {
		await expect(deleteCompletedGame('future-lost:active')).resolves.toBe(false);
		await expect(deleteCompletedGame(undefined)).resolves.toBe(false);
		expect(db.delete).not.toHaveBeenCalled();
	});

	it('reports a failure instead of throwing', async () => {
		db.delete.mockRejectedValueOnce(new Error('blocked'));
		await expect(deleteCompletedGame('a:completed:1')).resolves.toBe(false);
	});
});
