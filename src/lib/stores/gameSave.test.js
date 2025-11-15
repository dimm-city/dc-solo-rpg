/**
 * Tests for game save/load utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	saveGame,
	loadGame,
	hasSavedGame,
	getSaveMetadata,
	clearSave,
	restoreGameState
} from './gameSave.js';

// Mock localStorage
const localStorageMock = (() => {
	let store = {};
	return {
		getItem: vi.fn((key) => store[key] || null),
		setItem: vi.fn((key, value) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		})
	};
})();

global.localStorage = localStorageMock;

describe('gameSave', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorageMock.clear();
	});

	describe('saveGame', () => {
		it('should save game state to localStorage', () => {
			const mockGameState = {
				state: 'drawCard',
				playerName: 'Test Player',
				tower: 50,
				tokens: 8,
				round: 3,
				cardsToDraw: 2,
				cardsDrawn: 1,
				deck: [{ card: 'A', suit: 'hearts' }],
				discard: [],
				log: [],
				currentCard: null,
				diceRoll: 4,
				kingsRevealed: 1,
				kingOfHearts: true,
				kingOfDiamonds: false,
				kingOfClubs: false,
				kingOfSpades: false,
				aceOfHeartsRevealed: false,
				gameOver: false,
				win: false,
				bonus: 2,
				journalEntries: [{ text: 'Test entry', round: 1 }],
				config: {
					title: 'Test Game',
					options: { difficulty: 1, dice: 'default' }
				},
				originalConfig: {
					title: 'Test Game',
					options: { difficulty: 1, dice: 'default' }
				},
				systemConfig: { gameConfigUrl: '/games/test/' },
				stylesheet: '',
				status: '',
				player: { name: 'Test Player' }
			};

			const result = saveGame(mockGameState);

			expect(result).toBe(true);
			expect(localStorageMock.setItem).toHaveBeenCalled();
		});

		it('should not save if not in a valid game state', () => {
			const mockGameState = {
				state: 'loadGame', // Invalid state for saving
				playerName: 'Test Player',
				tower: 54,
				config: {}
			};

			const result = saveGame(mockGameState);

			expect(result).toBe(false);
			expect(localStorageMock.setItem).not.toHaveBeenCalled();
		});

		it('should handle errors gracefully', () => {
			const mockGameState = {
				state: 'drawCard',
				config: {}
			};

			// Make setItem throw an error
			localStorageMock.setItem.mockImplementationOnce(() => {
				throw new Error('Storage full');
			});

			const result = saveGame(mockGameState);

			expect(result).toBe(false);
		});
	});

	describe('loadGame', () => {
		it('should load game state from localStorage', () => {
			const mockSaveData = {
				version: '1.0',
				timestamp: new Date().toISOString(),
				state: 'drawCard',
				playerName: 'Test Player',
				tower: 50,
				tokens: 8,
				config: { title: 'Test Game', options: {} }
			};

			localStorageMock.setItem('dc-solo-rpg-save', JSON.stringify(mockSaveData));

			const result = loadGame();

			expect(result).toEqual(mockSaveData);
		});

		it('should return null if no save exists', () => {
			const result = loadGame();

			expect(result).toBeNull();
		});

		it('should clear corrupted save data', () => {
			localStorageMock.setItem('dc-solo-rpg-save', 'invalid json');

			const result = loadGame();

			expect(result).toBeNull();
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('dc-solo-rpg-save');
		});

		it('should reject old save versions', () => {
			const mockSaveData = {
				version: '0.9',
				timestamp: new Date().toISOString(),
				state: 'drawCard'
			};

			localStorageMock.setItem('dc-solo-rpg-save', JSON.stringify(mockSaveData));

			const result = loadGame();

			expect(result).toBeNull();
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('dc-solo-rpg-save');
		});
	});

	describe('hasSavedGame', () => {
		it('should return true if save exists', () => {
			localStorageMock.setItem('dc-solo-rpg-save', JSON.stringify({ version: '1.0' }));

			const result = hasSavedGame();

			expect(result).toBe(true);
		});

		it('should return false if no save exists', () => {
			const result = hasSavedGame();

			expect(result).toBe(false);
		});
	});

	describe('getSaveMetadata', () => {
		it('should return save metadata', () => {
			const mockSaveData = {
				version: '1.0',
				timestamp: '2024-01-01T00:00:00.000Z',
				playerName: 'Test Player',
				round: 5,
				tower: 45,
				tokens: 7,
				config: { title: 'Test Game' }
			};

			localStorageMock.setItem('dc-solo-rpg-save', JSON.stringify(mockSaveData));

			const result = getSaveMetadata();

			expect(result).toEqual({
				timestamp: '2024-01-01T00:00:00.000Z',
				playerName: 'Test Player',
				round: 5,
				tower: 45,
				tokens: 7,
				version: '1.0',
				gameTitle: 'Test Game'
			});
		});

		it('should return null if no save exists', () => {
			const result = getSaveMetadata();

			expect(result).toBeNull();
		});

		it('should handle missing game title', () => {
			const mockSaveData = {
				version: '1.0',
				timestamp: '2024-01-01T00:00:00.000Z',
				playerName: 'Test Player',
				round: 1,
				tower: 50,
				tokens: 10,
				config: {}
			};

			localStorageMock.setItem('dc-solo-rpg-save', JSON.stringify(mockSaveData));

			const result = getSaveMetadata();

			expect(result.gameTitle).toBe('Unknown Game');
		});
	});

	describe('clearSave', () => {
		it('should remove save from localStorage', () => {
			localStorageMock.setItem('dc-solo-rpg-save', JSON.stringify({ version: '1.0' }));

			const result = clearSave();

			expect(result).toBe(true);
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('dc-solo-rpg-save');
		});

		it('should handle errors gracefully', () => {
			localStorageMock.removeItem.mockImplementationOnce(() => {
				throw new Error('Remove failed');
			});

			const result = clearSave();

			expect(result).toBe(false);
		});
	});

	describe('restoreGameState', () => {
		it('should restore all game state properties', () => {
			const gameState = {
				state: 'loadGame',
				playerName: '',
				tower: 54
			};

			const saveData = {
				state: 'drawCard',
				playerName: 'Restored Player',
				tower: 45,
				tokens: 8,
				round: 3,
				cardsToDraw: 1,
				cardsDrawn: 0,
				deck: [{ card: 'K', suit: 'spades' }],
				discard: [],
				log: [{ card: 'A', suit: 'hearts', round: 1 }],
				currentCard: { card: '7', suit: 'clubs' },
				diceRoll: 5,
				kingsRevealed: 2,
				kingOfHearts: true,
				kingOfDiamonds: false,
				kingOfClubs: true,
				kingOfSpades: false,
				aceOfHeartsRevealed: true,
				gameOver: false,
				win: false,
				bonus: 1,
				journalEntries: [{ text: 'Entry 1', round: 1 }],
				config: { title: 'Restored Game', options: { difficulty: 2 } },
				originalConfig: { title: 'Restored Game', options: { difficulty: 2 } },
				systemConfig: { gameConfigUrl: '/games/restored/' },
				stylesheet: 'body { color: red; }',
				status: 'In progress',
				player: { name: 'Restored Player' }
			};

			const result = restoreGameState(gameState, saveData);

			expect(result).toBe(true);
			expect(gameState.state).toBe('drawCard');
			expect(gameState.playerName).toBe('Restored Player');
			expect(gameState.tower).toBe(45);
			expect(gameState.tokens).toBe(8);
			expect(gameState.round).toBe(3);
			expect(gameState.kingsRevealed).toBe(2);
			expect(gameState.aceOfHeartsRevealed).toBe(true);
			expect(gameState.config.title).toBe('Restored Game');
		});

		it('should handle errors gracefully', () => {
			const gameState = {};
			const saveData = null; // Invalid save data

			const result = restoreGameState(gameState, saveData);

			expect(result).toBe(false);
		});
	});

	describe('Integration tests', () => {
		it('should save and load game state successfully', () => {
			const originalGameState = {
				state: 'drawCard',
				playerName: 'Integration Test',
				tower: 42,
				tokens: 6,
				round: 5,
				cardsToDraw: 3,
				cardsDrawn: 0,
				deck: [{ card: 'Q', suit: 'diamonds' }],
				discard: [],
				log: [],
				currentCard: null,
				diceRoll: 3,
				kingsRevealed: 1,
				kingOfHearts: false,
				kingOfDiamonds: false,
				kingOfClubs: true,
				kingOfSpades: false,
				aceOfHeartsRevealed: false,
				gameOver: false,
				win: false,
				bonus: 2,
				journalEntries: [],
				config: {
					title: 'Integration Test Game',
					options: { difficulty: 1, dice: 'neon' }
				},
				originalConfig: {
					title: 'Integration Test Game',
					options: { difficulty: 1, dice: 'neon' }
				},
				systemConfig: { gameConfigUrl: '/games/integration/' },
				stylesheet: '',
				status: '',
				player: { name: 'Integration Test' }
			};

			// Save game
			const saveResult = saveGame(originalGameState);
			expect(saveResult).toBe(true);

			// Check if save exists
			expect(hasSavedGame()).toBe(true);

			// Get metadata
			const metadata = getSaveMetadata();
			expect(metadata.playerName).toBe('Integration Test');
			expect(metadata.gameTitle).toBe('Integration Test Game');

			// Load game
			const loadedData = loadGame();
			expect(loadedData.playerName).toBe('Integration Test');
			expect(loadedData.tower).toBe(42);
			expect(loadedData.config.options.difficulty).toBe(1);

			// Restore to new game state
			const newGameState = { state: 'loadGame', playerName: '', tower: 54 };
			restoreGameState(newGameState, loadedData);
			expect(newGameState.state).toBe('drawCard');
			expect(newGameState.playerName).toBe('Integration Test');
			expect(newGameState.tower).toBe(42);

			// Clear save
			const clearResult = clearSave();
			expect(clearResult).toBe(true);
			expect(hasSavedGame()).toBe(false);
		});
	});
});
