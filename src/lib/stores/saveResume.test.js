/**
 * LS-04: a save keeps Lucid, Surreal, the Aces count and pending updates, and a resumed
 * game picks up exactly where it was. Older (2.0) saves still load.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// An in-memory stand-in for IndexedDB, behind the same `idb` API the storage module uses
const stores = new Map();
const store = (name) => {
	if (!stores.has(name)) stores.set(name, new Map());
	return stores.get(name);
};
vi.mock('idb', () => ({
	openDB: async () => ({
		objectStoreNames: { contains: () => true },
		get: async (name, key) => structuredClone(store(name).get(key)),
		put: async (name, value, key) => void store(name).set(key, structuredClone(value)),
		delete: async (name, key) => void store(name).delete(key),
		getAllKeys: async (name) => [...store(name).keys()]
	})
}));

const { gameState, createRunState } = await import('./gameStore.svelte.js');
const { saveGame, loadGame, restoreGameState, normalizeSave } = await import(
	'./indexedDBStorage.js'
);
const { isFinalStabilityCheck, applyFailureCheckResult, applyPendingDiceRoll, successCheck } =
	await import('./gameActions.svelte.js');
const { isHardGame, fourthAceWins } = await import('../constants/difficulty.js');

const SLUG = 'test-game';
const config = { slug: SLUG, title: 'Test Game', labels: {}, options: {} };
const card = (rank, suit) => ({
	card: rank,
	suit,
	type: 'event',
	description: `${rank} of ${suit}`
});
const logged = (c, id) => ({ ...c, id, round: 2, gameState: { tower: 18 } });

beforeEach(() => {
	stores.clear();
	globalThis.indexedDB = {};
	Object.assign(gameState, createRunState(), {
		state: 'rollForTasks',
		config,
		originalConfig: config,
		player: { name: 'Tester' },
		playerName: 'Tester',
		round: 2
	});
});

describe('save and resume', () => {
	it('round-trips Lucid, Surreal, the Aces count, pending updates and the deal', async () => {
		Object.assign(gameState, {
			state: 'successCheck',
			tower: 14,
			tokens: 8,
			aceOfHeartsRevealed: true,
			acesRevealed: 2,
			isLucid: true,
			taskRoll: { roll: 17, dice: [17, 4], cards: 5 },
			lastCard: logged(card('7', 'spades'), '2.3'),
			log: [logged(card('A', 'hearts'), '1.2'), logged(card('A', 'clubs'), '2.1')]
		});
		gameState.pendingUpdates.tokenChange = -1;
		gameState.pendingUpdates.diceRoll = 18;
		expect(await saveGame(gameState)).toBe(true);

		// Something else happens in memory before the reload
		Object.assign(gameState, createRunState());

		const save = await loadGame(SLUG);
		expect(save.version).toBe('2.1');
		restoreGameState(gameState, save);

		expect(gameState.state).toBe('successCheck');
		expect(gameState.acesRevealed).toBe(2);
		expect(gameState.isLucid).toBe(true);
		expect(gameState.isSurreal).toBe(false);
		expect(gameState.pendingUpdates.tokenChange).toBe(-1);
		expect(gameState.pendingUpdates.diceRoll).toBe(18);
		expect(gameState.taskRoll).toEqual({ roll: 17, dice: [17, 4], cards: 5 });
		expect(gameState.lastCard.card).toBe('7');
	});

	it("keeps Easy, and a game left on the fourth Ace's check resumes on it", async () => {
		Object.assign(gameState, {
			state: 'failureCheck',
			config: { ...config, options: { difficulty: 0 } },
			tower: 9,
			tokens: 6,
			aceOfHeartsRevealed: true,
			acesRevealed: 4,
			lastCard: logged(card('A', 'spades'), '2.3'),
			log: [logged(card('A', 'spades'), '2.3')]
		});
		expect(isFinalStabilityCheck()).toBe(true);
		expect(await saveGame(gameState)).toBe(true);

		Object.assign(gameState, createRunState(), { config: null });
		restoreGameState(gameState, await loadGame(SLUG));
		expect(gameState.state).toBe('failureCheck');
		expect(fourthAceWins(gameState)).toBe(true);
		expect(isHardGame(gameState)).toBe(false);
		expect(isFinalStabilityCheck()).toBe(true);

		// Its roll decides the game, as before the reload
		applyFailureCheckResult(13);
		applyPendingDiceRoll();
		expect(gameState.win).toBe(true);
		expect(gameState.state).toBe('gameOver');
	});

	it.each([
		['Normal', {}],
		['Hard', { difficulty: 2 }]
	])(
		'keeps %s, where the fourth Ace ends nothing and Salvation has no target',
		async (_, options) => {
			Object.assign(gameState, {
				state: 'failureCheck',
				config: { ...config, options },
				tower: 9,
				tokens: 6,
				aceOfHeartsRevealed: true,
				acesRevealed: 4,
				cardsToDraw: 0
			});
			expect(isFinalStabilityCheck()).toBe(false);
			expect(await saveGame(gameState)).toBe(true);

			Object.assign(gameState, createRunState(), { config: null });
			restoreGameState(gameState, await loadGame(SLUG));
			expect(fourthAceWins(gameState)).toBe(false);
			expect(isHardGame(gameState)).toBe(options.difficulty === 2);
			expect(isFinalStabilityCheck()).toBe(false);

			applyFailureCheckResult(13);
			applyPendingDiceRoll();
			expect(gameState.gameOver).toBe(false);
			expect(gameState.state).toBe('successCheck');
			expect(successCheck().automatic).toBe(true);
		}
	);

	it('NV-08: keeps a game left before the opening roll, and resumes on that roll', async () => {
		Object.assign(gameState, { state: 'initialDamageRoll', round: 1, tower: 20 });
		expect(await saveGame(gameState)).toBe(true);

		Object.assign(gameState, createRunState());
		restoreGameState(gameState, await loadGame(SLUG));
		expect(gameState.state).toBe('initialDamageRoll');
		expect(gameState.tower).toBe(20);
	});

	it('still loads a 2.0 save, deriving the Aces from the log', async () => {
		store('saves').set(`${SLUG}:active`, {
			version: '2.0',
			state: 'successCheck',
			round: 3,
			tower: 12,
			tokens: 9,
			aceOfHeartsRevealed: true,
			log: [
				logged(card('A', 'hearts'), '1.2'),
				logged(card('5', 'clubs'), '2.1'),
				logged(card('A', 'spades'), '2.2')
			],
			deck: [],
			journalEntries: [],
			config
		});
		const save = await loadGame(SLUG);
		expect(save).not.toBeNull();
		restoreGameState(gameState, save);
		expect(gameState.acesRevealed).toBe(2);
		expect(gameState.isLucid).toBe(false);
		expect(gameState.isSurreal).toBe(false);
		expect(gameState.pendingUpdates.tokenChange).toBeNull();
	});
});

describe('normalizeSave', () => {
	it('counts the Ace of Hearts that Easy starts with', () => {
		const save = normalizeSave({
			version: '2.0',
			state: 'rollForTasks',
			aceOfHeartsRevealed: true,
			log: [logged(card('A', 'spades'), '1.1')]
		});
		expect(save.acesRevealed).toBe(2);
	});

	it('resumes a save from the old Begin Round step on Roll for Tasks', () => {
		expect(normalizeSave({ state: 'startRound', log: [] }).state).toBe('rollForTasks');
	});

	it('puts a drawn but unconfirmed card back on the deck, to be drawn again', () => {
		const ace = logged(card('A', 'hearts'), '2.2');
		const save = normalizeSave({
			version: '2.1',
			state: 'drawCard',
			cardsToDraw: 1,
			acesRevealed: 0,
			aceOfHeartsRevealed: true,
			currentCard: ace,
			deck: [card('3', 'clubs')],
			log: [logged(card('8', 'clubs'), '2.1'), ace],
			pendingUpdates: { aceChange: 1 }
		});
		expect(save.currentCard).toBeNull();
		expect(save.cardsToDraw).toBe(2);
		expect(save.deck.at(-1)).toEqual(card('A', 'hearts'));
		expect(save.log.map((entry) => entry.id)).toEqual(['2.1']);
		expect(save.aceOfHeartsRevealed).toBe(false);
		expect(save.acesRevealed).toBe(0);
		expect(save.pendingUpdates.aceChange).toBeNull();
	});
});
