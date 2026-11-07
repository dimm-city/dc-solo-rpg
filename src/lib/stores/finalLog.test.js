/**
 * The final log, written after the ending, is recorded into the completed game's record (the
 * one the Game Over save created, not a second story in the library) and marked as the final
 * entry, apart from the last round's own entry. Before this, saveGame skipped the 'finalLog'
 * state, so the final log never reached the Story Library.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// An in-memory stand-in for IndexedDB, behind the same `idb` API the storage module uses.
// Saves are copied like IndexedDB would; audio records hold Blobs, which structuredClone cannot
// copy here, so they come back as stored.
const stores = new Map();
const store = (name) => {
	if (!stores.has(name)) stores.set(name, new Map());
	return stores.get(name);
};
vi.mock('idb', () => ({
	openDB: async () => ({
		objectStoreNames: { contains: () => true },
		get: async (name, key) => {
			const value = store(name).get(key);
			return value === undefined || name === 'audio' ? value : structuredClone(value);
		},
		put: async (name, value, key) => void store(name).set(key, value),
		delete: async (name, key) => void store(name).delete(key),
		getAllKeys: async (name) => [...store(name).keys()]
	})
}));

const { gameState, createRunState } = await import('./gameStore.svelte.js');
const { saveGame, loadAllSaves } = await import('./indexedDBStorage.js');
const { recordRound } = await import('./gameActions.svelte.js');

const SLUG = 'test-game';
const config = { slug: SLUG, title: 'Test Game', labels: {}, options: {} };
const king = (suit) => ({
	card: 'K',
	suit,
	type: 'failure-counter',
	round: 3,
	id: '3.1',
	gameState: {
		tower: 12,
		tokens: 10,
		kingsRevealed: 3,
		aceOfHeartsRevealed: false,
		acesRevealed: 0
	}
});

/** A run that has just ended on its fourth King, saved by the Game Over screen */
function finished(lastCard = king('spades')) {
	Object.assign(gameState, createRunState(), {
		state: 'gameOver',
		config,
		originalConfig: config,
		player: { name: 'Tester' },
		playerName: 'Tester',
		round: 3,
		gameOver: true,
		win: false,
		kingsRevealed: 4,
		tower: 12,
		log: [{ type: 'initial-damage', roll: 9, damage: 1, tower: 19, round: 0, id: '0.0' }, lastCard],
		journalEntries: [{ round: 2, text: 'Second night.', dateRecorded: '2026-11-07T10:00:00Z' }]
	});
}

const completedKeys = () => [...store('saves').keys()].filter((key) => key.includes(':completed:'));

describe('the final log', () => {
	beforeEach(() => {
		stores.clear();
		globalThis.indexedDB = {};
		finished();
	});

	it('is saved into the record the ending created, marked final, apart from the round entry', async () => {
		expect(await saveGame(gameState)).toBe(true); // Game Over
		expect(completedKeys()).toHaveLength(1);

		gameState.state = 'finalLog';
		await recordRound({ text: 'They are all here. I am not.' });

		expect(gameState.journalEntries.at(-1)).toMatchObject({
			round: 3,
			final: true,
			text: 'They are all here. I am not.'
		});
		// Still one story, now with the final log
		expect(completedKeys()).toHaveLength(1);
		const [save] = await loadAllSaves();
		expect(save.journalEntries).toEqual([
			expect.objectContaining({ round: 2, text: 'Second night.' }),
			expect.objectContaining({ round: 3, final: true, text: 'They are all here. I am not.' })
		]);
		expect(gameState.state).toBe('finalLog');
	});

	it('is recorded even when the last round already has its own entry', async () => {
		gameState.journalEntries.push({ round: 3, text: 'Third night.' });
		gameState.state = 'finalLog';
		await recordRound({ text: 'Last words.' });
		expect(gameState.journalEntries.filter((entry) => entry.round === 3)).toEqual([
			expect.objectContaining({ text: 'Third night.' }),
			expect.objectContaining({ text: 'Last words.', final: true })
		]);
		// But only once
		await recordRound({ text: 'Again.' });
		expect(gameState.journalEntries).toHaveLength(3);
	});

	it("keeps the final log's voice note under its own key, beside the rounds' notes", async () => {
		gameState.journalEntries.push({
			round: 3,
			text: '',
			audioData: 'data:audio/webm;base64,QUFB',
			dateRecorded: '2026-11-07T10:05:00Z'
		});
		await saveGame(gameState);
		gameState.state = 'finalLog';
		await recordRound({ text: 'Last words.', audioData: 'data:audio/webm;base64,QkJC' });

		const audio = store('audio').get(completedKeys()[0]);
		expect(Object.keys(audio).sort()).toEqual(['3', 'final']);

		const [save] = await loadAllSaves();
		const notes = save.journalEntries.filter((entry) => entry.hasAudio);
		expect(notes.map((entry) => !!entry.final)).toEqual([false, true]);
		for (const entry of notes) expect(entry.audioData).toMatch(/^data:audio\/webm;base64,/);
	});

	it('gives a new run of the same game its own record', async () => {
		await saveGame(gameState);
		finished(king('hearts'));
		await saveGame(gameState);
		gameState.state = 'finalLog';
		await recordRound({ text: 'A different ending.' });

		const saves = await loadAllSaves();
		expect(saves).toHaveLength(2);
		expect(saves.map((save) => save.journalEntries.some((entry) => entry.final))).toEqual([
			false,
			true
		]);
	});

	it('still records the round entry as before, with no final mark', async () => {
		Object.assign(gameState, { state: 'log', gameOver: false, win: false, kingsRevealed: 1 });
		await recordRound({ text: 'Round three.' });
		const entry = gameState.journalEntries.at(-1);
		expect(entry).toMatchObject({ round: 3, text: 'Round three.' });
		expect('final' in entry).toBe(false);
		expect(gameState.state).toBe('rollForTasks');
	});
});
