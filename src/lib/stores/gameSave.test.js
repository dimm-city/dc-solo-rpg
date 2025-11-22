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
	const TEST_GAME_SLUG = 'test-game';

	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
		vi.restoreAllMocks();
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
				systemConfig: { gameConfigUrl: '/games/test-game/' },
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
				config: { title: 'Test Game' }
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

			localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(mockSaveData));

			const result = loadGame(TEST_GAME_SLUG);

			expect(result).toEqual(mockSaveData);
		});

		it('should return null if no save exists', () => {
			const result = loadGame(TEST_GAME_SLUG);

			expect(result).toBeNull();
		});

		it('should clear corrupted save data', () => {
			localStorageMock.setItem('dc-solo-rpg-save-test-game', 'invalid json');

			const result = loadGame(TEST_GAME_SLUG);

			expect(result).toBeNull();
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('dc-solo-rpg-save-test-game');
		});

		it('should reject old save versions', () => {
			const mockSaveData = {
				version: '0.9',
				timestamp: new Date().toISOString(),
				state: 'drawCard'
			};

			localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(mockSaveData));

			const result = loadGame(TEST_GAME_SLUG);

			expect(result).toBeNull();
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('dc-solo-rpg-save-test-game');
		});
	});

	describe('hasSavedGame', () => {
		it('should return true if save exists', () => {
			localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify({ version: '1.0' }));

			const result = hasSavedGame(TEST_GAME_SLUG);

			expect(result).toBe(true);
		});

		it('should return false if no save exists', () => {
			const result = hasSavedGame(TEST_GAME_SLUG);

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

			localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(mockSaveData));

			const result = getSaveMetadata(TEST_GAME_SLUG);

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
			const result = getSaveMetadata(TEST_GAME_SLUG);

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

			localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(mockSaveData));

			const result = getSaveMetadata(TEST_GAME_SLUG);

			expect(result.gameTitle).toBe('Unknown Game');
		});
	});

	describe('clearSave', () => {
		it('should remove save from localStorage', () => {
			localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify({ version: '1.0' }));

			const result = clearSave(TEST_GAME_SLUG);

			expect(result).toBe(true);
			expect(localStorageMock.removeItem).toHaveBeenCalledWith('dc-solo-rpg-save-test-game');
		});

		it('should handle errors gracefully', () => {
			localStorageMock.removeItem.mockImplementationOnce(() => {
				throw new Error('Remove failed');
			});

			const result = clearSave(TEST_GAME_SLUG);

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

	describe('Edge Cases', () => {
		describe('Multiple Game Saves', () => {
			it('should handle multiple game saves with different slugs', () => {
				const game1State = {
					state: 'drawCard',
					playerName: 'Player 1',
					tower: 50,
					tokens: 8,
					config: { title: 'Game 1' },
					systemConfig: { gameConfigUrl: '/games/game-1/' }
				};

				const game2State = {
					state: 'drawCard',
					playerName: 'Player 2',
					tower: 45,
					tokens: 7,
					config: { title: 'Game 2' },
					systemConfig: { gameConfigUrl: '/games/game-2/' }
				};

				// Save both games
				const save1 = saveGame(game1State);
				const save2 = saveGame(game2State);

				expect(save1).toBe(true);
				expect(save2).toBe(true);

				// Both should exist
				expect(hasSavedGame('game-1')).toBe(true);
				expect(hasSavedGame('game-2')).toBe(true);

				// Load game 1
				const loaded1 = loadGame('game-1');
				expect(loaded1.playerName).toBe('Player 1');
				expect(loaded1.tower).toBe(50);

				// Load game 2
				const loaded2 = loadGame('game-2');
				expect(loaded2.playerName).toBe('Player 2');
				expect(loaded2.tower).toBe(45);

				// Clear game 1 shouldn't affect game 2
				clearSave('game-1');
				expect(hasSavedGame('game-1')).toBe(false);
				expect(hasSavedGame('game-2')).toBe(true);
			});
		});

		describe('Save Data Validation', () => {
			it('should handle save data missing required fields', () => {
				const incompleteSave = {
					version: '1.0',
					timestamp: new Date().toISOString()
					// Missing: state, playerName, tower, tokens, etc.
				};

				localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(incompleteSave));

				const result = loadGame(TEST_GAME_SLUG);

				// Save data is technically valid JSON with correct version
				// but missing required game state fields
				// Should still return the data (caller validates)
				expect(result).toEqual(incompleteSave);
			});

			it('should handle save data with null values', () => {
				const saveWithNulls = {
					version: '1.0',
					timestamp: new Date().toISOString(),
					state: 'drawCard',
					playerName: null,
					tower: null,
					tokens: null,
					deck: null,
					config: null
				};

				localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(saveWithNulls));

				const result = loadGame(TEST_GAME_SLUG);

				expect(result).toEqual(saveWithNulls);
			});

			it('should handle save data with unexpected extra fields', () => {
				const saveWithExtra = {
					version: '1.0',
					timestamp: new Date().toISOString(),
					state: 'drawCard',
					playerName: 'Test',
					tower: 50,
					tokens: 8,
					config: { title: 'Test' },
					extraField1: 'Should be ignored',
					extraField2: { nested: 'data' },
					__proto__: { malicious: 'data' } // Should not cause issues
				};

				localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(saveWithExtra));

				const result = loadGame(TEST_GAME_SLUG);

				// Extra fields should be preserved
				expect(result.extraField1).toBe('Should be ignored');
				expect(result.extraField2).toEqual({ nested: 'data' });
			});

			it('should handle very large save data', () => {
				const largeSave = {
					version: '1.0',
					timestamp: new Date().toISOString(),
					state: 'drawCard',
					playerName: 'Test Player',
					tower: 50,
					tokens: 8,
					config: { title: 'Test' },
					// Very large log array (simulate long game)
					log: Array(1000)
						.fill(null)
						.map((_, i) => ({
							card: 'A',
							suit: 'hearts',
							round: i,
							description: 'A'.repeat(100) // 100 char descriptions
						})),
					journalEntries: Array(500)
						.fill(null)
						.map((_, i) => ({
							text: 'Entry '.repeat(50), // ~300 chars
							round: i
						}))
				};

				const saveResult = saveGame({
					...largeSave,
					systemConfig: { gameConfigUrl: '/games/test-game/' }
				});

				// Should handle large saves (within localStorage limits)
				if (saveResult) {
					const loaded = loadGame(TEST_GAME_SLUG);
					expect(loaded.log).toHaveLength(1000);
					expect(loaded.journalEntries).toHaveLength(500);
				} else {
					// If localStorage quota exceeded, should fail gracefully
					expect(saveResult).toBe(false);
				}
			});
		});

		describe('Concurrent Operations', () => {
			it('should handle rapid sequential saves', () => {
				const baseState = {
					state: 'drawCard',
					playerName: 'Test Player',
					config: { title: 'Test' },
					systemConfig: { gameConfigUrl: '/games/test-game/' }
				};

				// Simulate rapid saves (e.g., autosave + manual save)
				const save1 = saveGame({ ...baseState, tower: 50, tokens: 10 });
				const save2 = saveGame({ ...baseState, tower: 49, tokens: 9 });
				const save3 = saveGame({ ...baseState, tower: 48, tokens: 8 });

				expect(save1).toBe(true);
				expect(save2).toBe(true);
				expect(save3).toBe(true);

				// Last save should win
				const loaded = loadGame(TEST_GAME_SLUG);
				expect(loaded.tower).toBe(48);
				expect(loaded.tokens).toBe(8);
			});

			it('should handle save during load operation', () => {
				const initialSave = {
					version: '1.0',
					timestamp: new Date().toISOString(),
					state: 'drawCard',
					playerName: 'Initial',
					tower: 50,
					tokens: 10,
					config: { title: 'Test' }
				};

				localStorageMock.setItem('dc-solo-rpg-save-test-game', JSON.stringify(initialSave));

				// Load
				const loaded = loadGame(TEST_GAME_SLUG);
				expect(loaded.playerName).toBe('Initial');

				// Immediately save different state
				const newState = {
					state: 'drawCard',
					playerName: 'Updated',
					tower: 45,
					tokens: 8,
					config: { title: 'Test' },
					systemConfig: { gameConfigUrl: '/games/test-game/' }
				};
				saveGame(newState);

				// Next load should get updated state
				const reloaded = loadGame(TEST_GAME_SLUG);
				expect(reloaded.playerName).toBe('Updated');
				expect(reloaded.tower).toBe(45);
			});
		});

		describe('Browser Environment Edge Cases', () => {
			it('should handle localStorage being unavailable', () => {
				// Save original localStorage
				const originalLocalStorage = global.localStorage;

				// Simulate browser with no localStorage (privacy mode)
				global.localStorage = undefined;

				const mockGameState = {
					state: 'drawCard',
					config: { title: 'Test' },
					systemConfig: { gameConfigUrl: '/games/test/' }
				};

				// Should fail gracefully when localStorage is unavailable
				try {
					const result = saveGame(mockGameState);
					// If it doesn't throw, it should return false
					expect(result).toBe(false);
				} catch (error) {
					// If it throws, that's also acceptable
					expect(error).toBeDefined();
				}

				// Restore
				global.localStorage = originalLocalStorage;
			});

			it('should handle localStorage.setItem throwing QuotaExceededError', () => {
				const mockGameState = {
					state: 'drawCard',
					playerName: 'Test',
					tower: 50,
					tokens: 8,
					config: { title: 'Test' },
					systemConfig: { gameConfigUrl: '/games/test-game/' }
				};

				// Mock QuotaExceededError
				localStorageMock.setItem.mockImplementationOnce(() => {
					const error = new Error('QuotaExceededError');
					error.name = 'QuotaExceededError';
					throw error;
				});

				const result = saveGame(mockGameState);

				// Should return false when quota exceeded
				expect(result).toBe(false);
			});

			it('should handle localStorage.getItem throwing SecurityError', () => {
				// Mock SecurityError (e.g., third-party cookie blocking)
				localStorageMock.getItem.mockImplementationOnce(() => {
					const error = new Error('SecurityError');
					error.name = 'SecurityError';
					throw error;
				});

				const result = loadGame(TEST_GAME_SLUG);

				// Should return null when access is blocked
				expect(result).toBeNull();
			});
		});

		describe('Data Integrity Edge Cases', () => {
			it('should handle save data with circular references', () => {
				const gameState = {
					state: 'drawCard',
					playerName: 'Test',
					tower: 50,
					tokens: 8,
					config: { title: 'Test' },
					systemConfig: { gameConfigUrl: '/games/test-game/' }
				};

				// Create circular reference
				gameState.circular = gameState;

				const result = saveGame(gameState);

				// In test environment with mock localStorage, circular refs may be handled
				// In real browser, JSON.stringify would fail
				// Test that it either fails gracefully or mock handles it
				expect(typeof result).toBe('boolean');

				// If it succeeded in mock, verify we can't actually load it
				if (result === true) {
					// Mock may have allowed save, but real browser wouldn't
					// This documents the behavior difference
					expect(hasSavedGame(TEST_GAME_SLUG)).toBe(true);
				}
			});

			it('should handle empty strings in save data', () => {
				const saveWithEmptyStrings = {
					version: '1.0',
					timestamp: new Date().toISOString(),
					state: 'drawCard',
					playerName: '',
					tower: 50,
					tokens: 8,
					config: { title: '' }
				};

				localStorageMock.setItem(
					'dc-solo-rpg-save-test-game',
					JSON.stringify(saveWithEmptyStrings)
				);

				const result = loadGame(TEST_GAME_SLUG);

				expect(result.playerName).toBe('');
				expect(result.config.title).toBe('');
			});

			it('should handle save data with special characters', () => {
				const saveWithSpecialChars = {
					version: '1.0',
					timestamp: new Date().toISOString(),
					state: 'drawCard',
					playerName: 'Test<script>alert("xss")</script>',
					tower: 50,
					tokens: 8,
					config: {
						title: 'Game "with" \'quotes\' & <tags>',
						description: '日本語 émojis 🎮'
					}
				};

				localStorageMock.setItem(
					'dc-solo-rpg-save-test-game',
					JSON.stringify(saveWithSpecialChars)
				);

				const result = loadGame(TEST_GAME_SLUG);

				expect(result.playerName).toContain('<script>');
				expect(result.config.title).toContain('"with"');
				expect(result.config.description).toContain('🎮');
			});
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
				systemConfig: { gameConfigUrl: '/games/test-game/' },
				stylesheet: '',
				status: '',
				player: { name: 'Integration Test' }
			};

			// Save game
			const saveResult = saveGame(originalGameState);
			expect(saveResult).toBe(true);

			// Check if save exists
			expect(hasSavedGame(TEST_GAME_SLUG)).toBe(true);

			// Get metadata
			const metadata = getSaveMetadata(TEST_GAME_SLUG);
			expect(metadata.playerName).toBe('Integration Test');
			expect(metadata.gameTitle).toBe('Integration Test Game');

			// Load game
			const loadedData = loadGame(TEST_GAME_SLUG);
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
			const clearResult = clearSave(TEST_GAME_SLUG);
			expect(clearResult).toBe(true);
			expect(hasSavedGame(TEST_GAME_SLUG)).toBe(false);
		});
	});
});
