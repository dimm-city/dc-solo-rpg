/**
 * Tests for game/[slug]/+page.server.js
 * Tests server-side game configuration loading using fetch
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server.js';

describe('game/[slug]/+page.server.js', () => {
	let mockFetch;
	let params;

	beforeEach(() => {
		mockFetch = vi.fn();
		params = { slug: 'future-lost' };
	});

	describe('Successful Loading', () => {
		it('should load complete game configuration', async () => {
			// Mock responses
			const mockConfig = `
title: Test Game
deck: deck.csv
introduction: intro.md
stylesheet: game.css
`;

			const mockDeck = `card,suit,description
A,hearts,Test card 1
2,diamonds,Test card 2
3,clubs,Test card 3`;

			const mockIntro = '# Welcome to Test Game\n\nThis is a test.';

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				if (url.includes('intro.md')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockIntro)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			// Verify fetch was called with correct URLs
			expect(mockFetch).toHaveBeenCalledWith('/games/future-lost/config.yml');
			expect(mockFetch).toHaveBeenCalledWith('/games/future-lost/deck.csv');
			expect(mockFetch).toHaveBeenCalledWith('/games/future-lost/intro.md');

			// Verify returned structure
			expect(result.slug).toBe('future-lost');
			expect(result.player).toEqual({ name: 'Guest' });

			// Verify game config
			expect(result.gameConfig.title).toBe('Test Game');
			expect(result.gameConfig.loaded).toBe(true);
			expect(result.gameConfig.stylesheet).toBe('/games/future-lost/game.css');

			// Verify deck was parsed
			expect(result.gameConfig.deck).toHaveLength(3);
			expect(result.gameConfig.deck[0]).toEqual({
				card: 'A',
				suit: 'hearts',
				description: 'Test card 1'
			});

			// Verify introduction was loaded
			expect(result.gameConfig.introduction).toContain('Welcome to Test Game');
		});

		it('should use default deck filename if not specified', async () => {
			const mockConfig = `
title: Test Game
stylesheet: game.css
`;

			const mockDeck = `card,suit,description
K,spades,King of Spades`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			// Should use default deck.csv
			expect(mockFetch).toHaveBeenCalledWith('/games/future-lost/deck.csv');
			expect(result.gameConfig.deck).toHaveLength(1);
		});

		it('should handle missing introduction gracefully', async () => {
			const mockConfig = `
title: Test Game
deck: deck.csv
introduction: intro.md
`;

			const mockDeck = `card,suit,description
A,hearts,Ace`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				if (url.includes('intro.md')) {
					return Promise.resolve({ ok: false, status: 404 });
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			// Should have empty introduction
			expect(result.gameConfig.introduction).toBe('');
			// But still load everything else
			expect(result.gameConfig.deck).toHaveLength(1);
		});

		it('should use default stylesheet if not specified', async () => {
			const mockConfig = `
title: Test Game
deck: deck.csv
`;

			const mockDeck = `card,suit,description
A,hearts,Ace`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			// Should use default game.css
			expect(result.gameConfig.stylesheet).toBe('/games/future-lost/game.css');
		});
	});

	describe('Error Handling', () => {
		it('should throw 404 error if config.yml not found', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404
			});

			await expect(load({ params, fetch: mockFetch })).rejects.toThrow();
		});

		it('should throw 404 error if deck.csv not found', async () => {
			const mockConfig = `
title: Test Game
deck: deck.csv
`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			await expect(load({ params, fetch: mockFetch })).rejects.toThrow();
		});

		it('should throw error if YAML parsing fails', async () => {
			const invalidYaml = `
title: Test Game
  invalid: [ yaml syntax
deck: deck.csv
`;

			mockFetch.mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(invalidYaml)
			});

			await expect(load({ params, fetch: mockFetch })).rejects.toThrow();
		});

		it('should throw error if CSV parsing fails', async () => {
			const mockConfig = `
title: Test Game
deck: deck.csv
`;

			const invalidCsv = `card,suit,description
"unclosed quote,no suit,description`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(invalidCsv)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			await expect(load({ params, fetch: mockFetch })).rejects.toThrow();
		});
	});

	describe('Different Game Slugs', () => {
		it('should load game with different slug', async () => {
			params = { slug: 'simple-example' };

			const mockConfig = `
title: Simple Example
deck: deck.csv
`;

			const mockDeck = `card,suit,description
K,hearts,King`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			expect(mockFetch).toHaveBeenCalledWith('/games/simple-example/config.yml');
			expect(result.slug).toBe('simple-example');
			expect(result.gameConfig.stylesheet).toBe('/games/simple-example/game.css');
		});
	});

	describe('Deck Parsing', () => {
		it('should parse deck with all columns', async () => {
			const mockConfig = `
title: Test Game
deck: deck.csv
`;

			const mockDeck = `card,suit,description,type,special
A,hearts,Ace of Hearts,ace,true
2,diamonds,Two of Diamonds,number,false`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			expect(result.gameConfig.deck).toHaveLength(2);
			expect(result.gameConfig.deck[0]).toEqual({
				card: 'A',
				suit: 'hearts',
				description: 'Ace of Hearts',
				type: 'ace',
				special: 'true'
			});
		});

		it('should skip empty lines in CSV', async () => {
			const mockConfig = `
title: Test Game
deck: deck.csv
`;

			const mockDeck = `card,suit,description
A,hearts,Ace

2,diamonds,Two

`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			// Should only have 2 cards (empty lines skipped)
			expect(result.gameConfig.deck).toHaveLength(2);
		});
	});

	describe('Game Configuration Properties', () => {
		it('should preserve all config properties', async () => {
			const mockConfig = `
title: Complex Game
deck: deck.csv
stylesheet: custom.css
introduction: intro.md
options:
  difficulty: 1
  startingTokens: 15
labels:
  successCounters: Victory Points
  failureCounters: Doom Tokens
rules:
  maxRounds: 10
  winCondition: tokens_depleted
`;

			const mockDeck = `card,suit,description
K,spades,King`;

			mockFetch.mockImplementation((url) => {
				if (url.includes('config.yml')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockConfig)
					});
				}
				if (url.includes('deck.csv')) {
					return Promise.resolve({
						ok: true,
						text: () => Promise.resolve(mockDeck)
					});
				}
				return Promise.resolve({ ok: false, status: 404 });
			});

			const result = await load({ params, fetch: mockFetch });

			// Verify complex config properties are preserved
			expect(result.gameConfig.title).toBe('Complex Game');
			expect(result.gameConfig.options.difficulty).toBe(1);
			expect(result.gameConfig.options.startingTokens).toBe(15);
			expect(result.gameConfig.labels.successCounters).toBe('Victory Points');
			expect(result.gameConfig.rules.maxRounds).toBe(10);
		});
	});
});
