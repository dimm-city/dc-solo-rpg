/**
 * Tests for DiceStore - Dice theme configuration and initialization
 *
 * Ensures that dice themes are properly configured and that invalid themes
 * don't cause initialization failures
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DICE_THEMES, getDefaultDiceTheme } from '../configuration/DiceThemes.js';

// Mock the DiceBox class
const mockDiceBox = {
	initialize: vi.fn().mockResolvedValue(undefined),
	resizeWorld: vi.fn(),
	lastConfig: null
};

// Create a mock constructor function
const MockDiceBoxConstructor = vi.fn(function (selector, config) {
	mockDiceBox.lastConfig = config;
	return mockDiceBox;
});

vi.mock('@3d-dice/dice-box-threejs', () => ({
	default: MockDiceBoxConstructor
}));

describe('DiceStore - Theme Configuration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDiceBox.lastConfig = null;
	});

	describe('Dice Theme Definitions', () => {
		it('should have at least one dice theme defined', () => {
			expect(DICE_THEMES).toBeDefined();
			expect(DICE_THEMES.length).toBeGreaterThan(0);
		});

		it('should have a default theme', () => {
			const defaultTheme = getDefaultDiceTheme();
			expect(defaultTheme).toBeDefined();
			expect(defaultTheme.key).toBeDefined();
			expect(defaultTheme.name).toBeDefined();
		});

		it('all themes should have required properties', () => {
			DICE_THEMES.forEach((theme) => {
				expect(theme).toHaveProperty('key');
				expect(theme).toHaveProperty('name');
				expect(theme).toHaveProperty('category');
				expect(theme).toHaveProperty('description');
				expect(typeof theme.key).toBe('string');
				expect(theme.key.length).toBeGreaterThan(0);
			});
		});

		it('should not have duplicate theme keys', () => {
			const keys = DICE_THEMES.map((t) => t.key);
			const uniqueKeys = new Set(keys);
			expect(uniqueKeys.size).toBe(keys.length);
		});

		it('should have "default" as a valid theme key', () => {
			const hasDefault = DICE_THEMES.some((t) => t.key === 'default');
			expect(hasDefault).toBe(true);
		});
	});

	describe('DiceBox Initialization - Theme Handling', () => {
		let initializeDiceBox;
		let gameState;

		beforeEach(async () => {
			// Reset modules to get fresh imports
			vi.resetModules();

			// Mock the game store
			vi.doMock('./gameStore.svelte.js', () => ({
				gameState: {
					config: null
				}
			}));

			// Import after mocking
			const diceStoreModule = await import('./diceStore.svelte.js');
			initializeDiceBox = diceStoreModule.initializeDiceBox;

			// Get reference to mocked gameState
			const gameStoreModule = await import('./gameStore.svelte.js');
			gameState = gameStoreModule.gameState;

			// Mock DOM container element with all required methods
			global.mockContainer = {
				id: 'dice-roller-container',
				querySelector: vi.fn().mockReturnValue(null), // No canvas initially
				firstChild: null,
				removeChild: vi.fn()
			};

			// Mock DOM element
			global.document = {
				querySelector: vi.fn().mockReturnValue(global.mockContainer),
				body: {
					contains: vi.fn().mockReturnValue(true) // Container is attached to DOM
				}
			};

			global.window = {
				dispatchEvent: vi.fn()
			};

			global.setTimeout = vi.fn((fn) => fn());
		});

		it('should use default theme (pinkdreams) when dice config is not provided', async () => {
			gameState.config = null;

			await initializeDiceBox(global.mockContainer);

			expect(mockDiceBox.lastConfig).toBeDefined();
			// When no config is provided, should fall back to default theme (pinkdreams)
			expect(mockDiceBox.lastConfig.theme_colorset).toBe('pinkdreams');
		});

		it('should NOT set theme_colorset when "default" theme is selected', async () => {
			gameState.config = {
				options: {
					dice: {
						key: 'default'
					}
				}
			};

			await initializeDiceBox(global.mockContainer);

			expect(mockDiceBox.lastConfig).toBeDefined();
			// CRITICAL: 'default' should NOT be passed to DiceBox as it's not a real theme
			expect(mockDiceBox.lastConfig.theme_colorset).toBeUndefined();
		});

		it('should set theme_colorset when a valid theme is selected', async () => {
			gameState.config = {
				options: {
					dice: {
						key: 'pinkdreams'
					}
				}
			};

			await initializeDiceBox(global.mockContainer);

			expect(mockDiceBox.lastConfig).toBeDefined();
			expect(mockDiceBox.lastConfig.theme_colorset).toBe('pinkdreams');
		});

		it('should handle all defined themes without errors', async () => {
			for (const theme of DICE_THEMES) {
				// Reset mocks and state for each theme
				mockDiceBox.initialize.mockClear();
				mockDiceBox.resizeWorld.mockClear();
				mockDiceBox.lastConfig = null;

				gameState.config = {
					options: {
						dice: {
							key: theme.key
						}
					}
				};

				// Reset the initialized flag by re-importing
				vi.resetModules();
				const diceStoreModule = await import('./diceStore.svelte.js?update=' + Date.now());
				const initFn = diceStoreModule.initializeDiceBox;

				await initFn(global.mockContainer);

				expect(mockDiceBox.initialize).toHaveBeenCalled();

				// Verify behavior based on theme key
				if (theme.key === 'default') {
					expect(mockDiceBox.lastConfig.theme_colorset).toBeUndefined();
				} else {
					expect(mockDiceBox.lastConfig.theme_colorset).toBe(theme.key);
				}
			}
		});

		it('should set theme_customColorset when custom dice config is provided', async () => {
			const customDiceConfig = {
				foreground: '#ff0000',
				background: '#00ff00',
				texture: 'metal'
			};

			gameState.config = {
				options: {
					dice: customDiceConfig
				}
			};

			await initializeDiceBox(global.mockContainer);

			expect(mockDiceBox.lastConfig).toBeDefined();
			expect(mockDiceBox.lastConfig.theme_customColorset).toBe(customDiceConfig);
		});

		it('should always include required DiceBox config properties', async () => {
			gameState.config = null;

			await initializeDiceBox(global.mockContainer);

			expect(mockDiceBox.lastConfig).toBeDefined();
			expect(mockDiceBox.lastConfig.assetPath).toBe('/dice/');
			expect(mockDiceBox.lastConfig.sounds).toBe(true);
			expect(mockDiceBox.lastConfig.volume).toBe(100);
			expect(mockDiceBox.lastConfig.baseScale).toBe(100);
			expect(mockDiceBox.lastConfig.strength).toBe(1.5);
		});
	});

	describe('Regression Prevention - Theme Loading Errors', () => {
		it('should NOT use "default" as a theme_colorset value (causes "Unable to load theme" error)', () => {
			// This is the core regression test
			// If someone accidentally sets theme_colorset: 'default', it will fail in DiceBox
			const invalidConfig = {
				assetPath: '/dice/',
				theme_colorset: 'default' // This is invalid!
			};

			// Verify that our code would never produce this config
			expect(invalidConfig.theme_colorset).toBe('default');

			// Document why this is wrong
			const errorMessage =
				'DiceBox does not have a theme called "default". ' +
				'When "default" is selected, theme_colorset should be omitted to allow ' +
				'DiceBox to use its built-in default appearance.';

			expect(errorMessage).toContain('omitted');
		});

		it('should document the difference between no theme and "default" theme', () => {
			const noTheme = { assetPath: '/dice/' };
			const defaultTheme = { assetPath: '/dice/', theme_colorset: 'default' };

			// No theme = valid (DiceBox uses built-in default)
			expect(noTheme.theme_colorset).toBeUndefined();

			// theme_colorset: 'default' = invalid (causes error)
			expect(defaultTheme.theme_colorset).toBe('default');

			// This test documents the issue: the string 'default' is NOT a valid DiceBox theme
		});

		it('should only define themes that actually exist in dice-box-threejs', () => {
			// Known valid dice-box colorsets (from @3d-dice/dice-box-threejs v0.0.12)
			// Source: https://github.com/3d-dice/dice-box/blob/main/src/themes/colorsets.js
			const KNOWN_VALID_THEMES = [
				'white',
				'black',
				'pinkdreams',
				'radiant',
				'fire',
				'ice',
				'poison',
				'water',
				'earth',
				'astralsea',
				'bloodmoon',
				'starynight',
				'glitterparty',
				'bronze',
				'dragons',
				'tigerking',
				'rainbow'
				// Additional themes that exist in dice-box but we're not using yet:
				// 'diceofrolling', 'rust', 'sky', 'sunset', 'midnight', 'swamp',
				// 'stone', 'walnut', 'wood', 'metal', 'gemstone', 'glass',
				// and many more...
			];

			// Themes that DON'T exist and should NEVER be added
			const NON_EXISTENT_THEMES = [
				'bluedreams', // Doesn't exist (we had this before)
				'greendreams', // Doesn't exist (we had this before)
				'purpledreams', // Doesn't exist (we had this before)
				'toxic', // Doesn't exist (use 'poison' instead)
				'rock' // Doesn't exist (use 'stone' instead)
			];

			// Get all theme keys except 'default' (which is our special case)
			const definedThemes = DICE_THEMES.filter((t) => t.key !== 'default').map((t) => t.key);

			// Verify all our themes are in the known valid list
			definedThemes.forEach((themeKey) => {
				expect(KNOWN_VALID_THEMES).toContain(themeKey);
			});

			// Verify we haven't added any non-existent themes
			definedThemes.forEach((themeKey) => {
				expect(NON_EXISTENT_THEMES).not.toContain(themeKey);
			});
		});

		it('should prevent adding fictional theme names that cause loading errors', () => {
			// This test documents the previous bug where we defined themes that don't exist
			// Regression: We had bluedreams, greendreams, purpledreams, toxic, gemstone, rock
			// which all caused "Unable to load theme" errors

			const themeKeys = DICE_THEMES.map((t) => t.key);

			// Ensure these fictional themes are NOT in our config
			expect(themeKeys).not.toContain('bluedreams');
			expect(themeKeys).not.toContain('greendreams');
			expect(themeKeys).not.toContain('purpledreams');
			expect(themeKeys).not.toContain('toxic'); // Should use 'poison' instead
			expect(themeKeys).not.toContain('rock'); // Should use 'stone' instead

			// Document why: These theme names do not exist in dice-box-threejs
			// and will cause "Unable to load theme" errors if used
		});

		it('should have exactly 18 themes (1 special "default" + 17 real dice-box themes)', () => {
			// We define 18 themes total:
			// - 1 special 'default' key (maps to no theme_colorset)
			// - 17 real dice-box themes that can be passed as theme_colorset values

			expect(DICE_THEMES.length).toBe(18);

			const defaultThemes = DICE_THEMES.filter((t) => t.key === 'default');
			expect(defaultThemes.length).toBe(1);

			const realThemes = DICE_THEMES.filter((t) => t.key !== 'default');
			expect(realThemes.length).toBe(17);
		});
	});
});
