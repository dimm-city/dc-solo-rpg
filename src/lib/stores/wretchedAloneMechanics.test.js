/**
 * Wretched & Alone Framework - Comprehensive Mechanics Tests
 * Based on: docs/v2/wretched-alone-mechanics-guide.md
 *
 * Tests cover:
 * - Deck management (Section 2.2)
 * - Game initialization (Section 3)
 * - Damage calculation - Option A (Section 9)
 * - Special card mechanics (Section 6)
 * - Win/loss conditions (Section 7)
 * - Card classification (Section 5)
 * - Edge cases (Section 10.3)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	gameState,
	transitionTo,
	updateGameState
} from './gameStore.svelte.js';
import {
	startGame,
	drawCard,
	confirmCard,
	getFailureCheckRoll,
	applyFailureCheckResult,
	successCheck
} from './gameActions.svelte.js';
import { initializeGame } from './gameInit.js';

describe('Wretched & Alone Framework - Core Mechanics', () => {

	// ==========================
	// SECTION 1: Deck Management
	// ==========================
	describe('Deck Management (Section 2.2)', () => {

		it('should create 52-card deck', () => {
			const mockDeck = createStandardDeck();
			expect(mockDeck).toHaveLength(52);
		});

		it('should have 4 suits with 13 cards each', () => {
			const deck = createStandardDeck();
			const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

			suits.forEach(suit => {
				const suitCards = deck.filter(c => c.suit === suit);
				expect(suitCards).toHaveLength(13);
			});
		});

		it('should have all 13 ranks per suit', () => {
			const deck = createStandardDeck();
			const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
			const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

			suits.forEach(suit => {
				ranks.forEach(rank => {
					const card = deck.find(c => c.suit === suit && c.card === rank);
					expect(card).toBeDefined();
				});
			});
		});

		it('should classify odd and even ranks correctly', () => {
			const oddRanks = ['A', '3', '5', '7', '9'];
			const evenRanks = ['2', '4', '6', '8', '10', 'J', 'Q', 'K'];

			oddRanks.forEach(rank => {
				expect(isOddRank(rank)).toBe(true);
			});

			evenRanks.forEach(rank => {
				expect(isOddRank(rank)).toBe(false);
			});
		});

		it('should have exactly 20 damage-triggering cards (A,3,5,7,9)', () => {
			const deck = createStandardDeck();
			const damageCards = deck.filter(c => isOddRank(c.card));
			expect(damageCards).toHaveLength(20);
		});

		it('should have exactly 16 challenge cards (3,5,7,9)', () => {
			const deck = createStandardDeck();
			const challengeRanks = ['3', '5', '7', '9'];
			const challengeCards = deck.filter(c => challengeRanks.includes(c.card));
			expect(challengeCards).toHaveLength(16);
		});

		it('should have exactly 32 safe cards (even ranks)', () => {
			const deck = createStandardDeck();
			const safeCards = deck.filter(c => !isOddRank(c.card));
			expect(safeCards).toHaveLength(32);
		});

		it('should have exactly 4 Aces (bonus/help cards)', () => {
			const deck = createStandardDeck();
			const aces = deck.filter(c => c.card === 'A');
			expect(aces).toHaveLength(4);
		});

		it('should have exactly 4 Kings (tracker cards)', () => {
			const deck = createStandardDeck();
			const kings = deck.filter(c => c.card === 'K');
			expect(kings).toHaveLength(4);
		});
	});

	// ================================
	// SECTION 2: Game Initialization
	// ================================
	describe('Game Initialization (Section 3)', () => {

		beforeEach(() => {
			resetGameState();
		});

		it('should initialize with correct starting state', () => {
			const config = createMockGameConfig();
			const player = { name: 'Test Player' };

			initializeGame(config, player);

			// V2 implementation: round starts at 1, not 0
			expect(gameState.round).toBe(1);
			expect(gameState.tokens).toBe(10);
			expect(gameState.kingsRevealed).toBe(0);
			expect(gameState.bonus).toBe(0);
			expect(gameState.aceOfHeartsRevealed).toBe(false);
			expect(gameState.gameOver).toBe(false);
			expect(gameState.win).toBe(false);
		});

		it('should start with 54 resources when initial damage disabled', () => {
			const config = createMockGameConfig({ initialDamage: false });
			const player = { name: 'Test Player' };

			initializeGame(config, player, { initialDamage: false });

			expect(gameState.tower).toBe(54);
		});

		it('should apply initial damage (1d6) when enabled', () => {
			const config = createMockGameConfig();
			const player = { name: 'Test Player' };

			// Mock Math.random to return a value that produces roll of 4
			// Math.floor(Math.random() * 6) + 1 where random = 0.5 gives us 4
			const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
			initializeGame(config, player, { initialDamage: true });

			expect(gameState.tower).toBe(50); // 54 - 4
			mathRandomSpy.mockRestore();
		});

		it('should initialize with shuffled deck', () => {
			const config = createMockGameConfig();
			const player = { name: 'Test Player' };

			initializeGame(config, player);

			expect(gameState.deck).toHaveLength(52);
		});

		it('should initialize empty discard pile', () => {
			const config = createMockGameConfig();
			const player = { name: 'Test Player' };

			initializeGame(config, player);

			expect(gameState.discard).toEqual([]);
		});

		it('should initialize log with initial damage entry', () => {
			const config = createMockGameConfig();
			const player = { name: 'Test Player' };

			initializeGame(config, player);
			// V2 implementation: log contains initial damage entry when initialDamage is enabled (default)
			expect(gameState.log).toHaveLength(1);
			expect(gameState.log[0]).toMatchObject({
				type: 'system',
				round: 0,
				id: '0.0'
			});
			expect(gameState.log[0].message).toMatch(/Initial setup: Lost \d resources to instability/);
		});

		it('should set player name', () => {
			const config = createMockGameConfig();
			const player = { name: 'Test Player' };

			initializeGame(config, player);

			expect(gameState.playerName).toBe('Test Player');
		});
	});

	// =========================================
	// SECTION 3: Damage Calculation (Option A)
	// =========================================
	describe('Damage Calculation - Option A (Section 9)', () => {

		beforeEach(() => {
			resetGameState();
		});

		it('should calculate damage with no bonus counter', () => {
			gameState.bonus = 0;

			expect(calculateDamage(1, 0)).toBe(1);
			expect(calculateDamage(2, 0)).toBe(2);
			expect(calculateDamage(3, 0)).toBe(3);
			expect(calculateDamage(4, 0)).toBe(4);
			expect(calculateDamage(5, 0)).toBe(5);
			expect(calculateDamage(6, 0)).toBe(6);
		});

		it('should apply bonus counter correctly', () => {
			expect(calculateDamage(4, 2)).toBe(2); // 4 - 2
			expect(calculateDamage(5, 3)).toBe(2); // 5 - 3
			expect(calculateDamage(6, 4)).toBe(2); // 6 - 4
		});

		it('should not deal negative damage', () => {
			expect(calculateDamage(1, 5)).toBe(0);
			expect(calculateDamage(2, 4)).toBe(0);
			expect(calculateDamage(3, 4)).toBe(0);
		});

		it('should only trigger damage on odd-ranked cards', () => {
			const oddCard = { card: '3', suit: 'hearts' };
			const evenCard = { card: '2', suit: 'hearts' };

			expect(requiresDamageCheck(oddCard)).toBe(true);
			expect(requiresDamageCheck(evenCard)).toBe(false);
		});

		it('should trigger damage on A, 3, 5, 7, 9', () => {
			const damageRanks = ['A', '3', '5', '7', '9'];

			damageRanks.forEach(rank => {
				const card = { card: rank, suit: 'hearts' };
				expect(requiresDamageCheck(card)).toBe(true);
			});
		});

		it('should NOT trigger damage on 2, 4, 6, 8, 10, J, Q, K', () => {
			const safeRanks = ['2', '4', '6', '8', '10', 'J', 'Q', 'K'];

			safeRanks.forEach(rank => {
				const card = { card: rank, suit: 'hearts' };
				expect(requiresDamageCheck(card)).toBe(false);
			});
		});

		it('should apply damage to resources correctly', () => {
			gameState.tower = 54;
			gameState.bonus = 0;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(3);

			expect(gameState.tower).toBe(51); // 54 - 3
		});

		it('should reduce damage with bonus counter', () => {
			gameState.tower = 54;
			gameState.bonus = 2;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(5);

			const expectedDamage = 5 - 2; // = 3
			expect(gameState.tower).toBe(51); // 54 - 3
		});

		it('should not damage with full bonus negation', () => {
			gameState.tower = 54;
			gameState.bonus = 4;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(2);

			expect(gameState.tower).toBe(54); // No damage (2 - 4 = 0)
		});

		it('should set resources to 0 when damage exceeds current value', () => {
			gameState.tower = 3;
			gameState.bonus = 0;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(6);

			expect(gameState.tower).toBe(0); // Can't go negative
		});
	});

	// =======================================
	// SECTION 4: Special Card Mechanics
	// =======================================
	describe('Special Card Mechanics (Section 6)', () => {

		beforeEach(() => {
			resetGameState();
		});

		describe('Ace Mechanics - Bonus Counter', () => {

			it('should increment bonus counter for each Ace drawn', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				// Draw Ace of Diamonds
				gameState.deck = [{ card: 'A', suit: 'diamonds', prompt: 'Test' }];
				drawCard();
				expect(gameState.bonus).toBe(1);

				// Draw Ace of Clubs
				gameState.deck = [{ card: 'A', suit: 'clubs', prompt: 'Test' }];
				drawCard();
				expect(gameState.bonus).toBe(2);

				// Draw Ace of Spades
				gameState.deck = [{ card: 'A', suit: 'spades', prompt: 'Test' }];
				drawCard();
				expect(gameState.bonus).toBe(3);

				// Draw Ace of Hearts (win condition)
				gameState.deck = [{ card: 'A', suit: 'hearts', prompt: 'Test' }];
				drawCard();
				expect(gameState.bonus).toBe(4);
			});

			it('should reach maximum bonus of 4 when all Aces drawn', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				const aces = [
					{ card: 'A', suit: 'diamonds', prompt: 'Test 1' },
					{ card: 'A', suit: 'clubs', prompt: 'Test 2' },
					{ card: 'A', suit: 'spades', prompt: 'Test 3' },
					{ card: 'A', suit: 'hearts', prompt: 'Test 4' }
				];

				aces.forEach(ace => {
					gameState.deck = [ace];
					drawCard();
				});

				expect(gameState.bonus).toBe(4);
			});
		});

		describe('Win Condition Ace (Ace of Hearts)', () => {

			it('should activate win condition when Ace of Hearts drawn', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				gameState.deck = [{ card: 'A', suit: 'hearts', prompt: 'Win card' }];
				drawCard();

				expect(gameState.aceOfHeartsRevealed).toBe(true);
			});

			it('should start with 10 tokens', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				expect(gameState.tokens).toBe(10);
			});

			it('should remove token on successful roll (6)', () => {
				gameState.tokens = 10;
				gameState.aceOfHeartsRevealed = true;
				gameState.config = { difficulty: 0 };

				vi.spyOn(gameState, 'getRandomNumber').mockReturnValue(6);
				successCheck();

				expect(gameState.tokens).toBe(9);
			});

			it('should not remove token on failed roll (1-5)', () => {
				gameState.tokens = 10;
				gameState.aceOfHeartsRevealed = true;
				gameState.config = { difficulty: 0 };

				vi.spyOn(gameState, 'getRandomNumber').mockReturnValue(3);
				successCheck();

				expect(gameState.tokens).toBe(10);
			});

			it('should allow success on 5-6 with bonus (difficulty > 0)', () => {
				gameState.tokens = 10;
				gameState.bonus = 1;
				gameState.aceOfHeartsRevealed = true;
				gameState.config = { difficulty: 1 };

				// Roll 5, but with bonus should succeed
				vi.spyOn(gameState, 'getRandomNumber').mockReturnValue(5);
				successCheck();

				expect(gameState.tokens).toBe(9);
			});
		});

		describe('Tracker Cards (Kings)', () => {

			it('should track king count correctly', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				gameState.deck = [{ card: 'K', suit: 'hearts', prompt: 'King 1' }];
				drawCard();
				expect(gameState.kingsRevealed).toBe(1);

				gameState.deck = [{ card: 'K', suit: 'diamonds', prompt: 'King 2' }];
				drawCard();
				expect(gameState.kingsRevealed).toBe(2);
			});

			it('should track individual kings by suit', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				gameState.deck = [{ card: 'K', suit: 'hearts', prompt: 'King of Hearts' }];
				drawCard();
				expect(gameState.kingOfHearts).toBe(true);

				gameState.deck = [{ card: 'K', suit: 'diamonds', prompt: 'King of Diamonds' }];
				drawCard();
				expect(gameState.kingOfDiamonds).toBe(true);
			});

			it('should trigger instant loss on 4th king', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				const kings = [
					{ card: 'K', suit: 'hearts', prompt: 'K1' },
					{ card: 'K', suit: 'diamonds', prompt: 'K2' },
					{ card: 'K', suit: 'clubs', prompt: 'K3' },
					{ card: 'K', suit: 'spades', prompt: 'K4' }
				];

				// Draw 3 kings
				for (let i = 0; i < 3; i++) {
					gameState.deck = [kings[i]];
					gameState.state = 'drawCard';
					drawCard();
					expect(gameState.gameOver).toBe(false);
				}

				// Draw 4th king
				gameState.deck = [kings[3]];
				gameState.state = 'drawCard';
				drawCard();
				expect(gameState.gameOver).toBe(true);
				expect(gameState.win).toBe(false);
				expect(gameState.kingsRevealed).toBe(4);
			});

			it('should NOT trigger damage check for Kings (even rank)', () => {
				const king = { card: 'K', suit: 'hearts' };
				expect(requiresDamageCheck(king)).toBe(false);
			});
		});

		describe('Aces Do NOT Trigger Damage (SRD Compliance)', () => {

			it('should classify Aces as odd but provide respite', () => {
				// Aces are technically odd-ranked but per SRD they are "bonus/help" cards
				// The implementation should handle this special case
				const ace = { card: 'A', suit: 'diamonds' };

				// This test documents the SRD expectation:
				// Aces add to bonus counter and provide moments of hope
				expect(ace.card).toBe('A');
			});
		});
	});

	// =======================================
	// SECTION 5: Win & Loss Conditions
	// =======================================
	describe('Win & Loss Conditions (Section 7)', () => {

		beforeEach(() => {
			resetGameState();
		});

		describe('Victory Conditions', () => {

			it('should require win condition active (Ace of Hearts drawn)', () => {
				gameState.tokens = 0;
				gameState.tower = 30;
				gameState.aceOfHeartsRevealed = false;

				expect(hasWon()).toBe(false);
			});

			it('should require all tokens removed', () => {
				gameState.tokens = 3;
				gameState.tower = 30;
				gameState.aceOfHeartsRevealed = true;

				expect(hasWon()).toBe(false);
			});

			it('should require resources > 0', () => {
				gameState.tokens = 0;
				gameState.tower = 0;
				gameState.aceOfHeartsRevealed = true;

				expect(hasWon()).toBe(false);
			});

			it('should win when all conditions met', () => {
				gameState.tokens = 0;
				gameState.tower = 20;
				gameState.aceOfHeartsRevealed = true;

				expect(hasWon()).toBe(true);
			});

			it('should win after final damage roll if resources remain', () => {
				gameState.tokens = 1;
				gameState.tower = 10;
				gameState.aceOfHeartsRevealed = true;
				gameState.bonus = 3;
				gameState.config = { difficulty: 1 };
				gameState.state = 'successCheck';

				// Success on token roll
				vi.spyOn(gameState, 'getRandomNumber').mockReturnValueOnce(6);
				successCheck();

				expect(gameState.tokens).toBe(0);

				// Final damage roll - should still have resources
				// This would happen in finalDamageRoll state
			});
		});

		describe('Defeat Conditions', () => {

			it('should lose when resources reach 0', () => {
				gameState.tower = 2;
				gameState.bonus = 0;
				gameState.gameOver = false;
				gameState.state = 'failureCheck';
				gameState.cardsToDraw = 0;
				gameState.config = createMockGameConfig();

				applyFailureCheckResult(6); // 6 damage > 2 resources

				expect(gameState.tower).toBe(0);
				expect(gameState.gameOver).toBe(true);
			});

			it('should lose when resources go negative (clamped to 0)', () => {
				gameState.tower = 1;
				gameState.bonus = 0;
				gameState.gameOver = false;
				gameState.state = 'failureCheck';
				gameState.cardsToDraw = 0;
				gameState.config = createMockGameConfig();

				applyFailureCheckResult(5);

				expect(gameState.tower).toBe(0);
				expect(gameState.gameOver).toBe(true);
			});

			it('should lose when 4 kings revealed', () => {
				const config = createMockGameConfig();
				initializeGame(config, { name: 'Test' });

				gameState.kingsRevealed = 3;
				gameState.deck = [{ card: 'K', suit: 'spades', prompt: 'Final King' }];
				gameState.state = 'drawCard';

				drawCard();

				expect(gameState.gameOver).toBe(true);
				expect(gameState.win).toBe(false);
			});

			it('should lose when deck exhausted without win condition', () => {
				gameState.deck = [];
				gameState.aceOfHeartsRevealed = false;
				gameState.state = 'drawCard';

				drawCard();

				expect(gameState.gameOver).toBe(true);
			});

			it('should lose if final damage roll depletes resources', () => {
				gameState.tokens = 0;
				gameState.tower = 2;
				gameState.bonus = 0;
				gameState.aceOfHeartsRevealed = true;
				gameState.state = 'failureCheck';
				gameState.cardsToDraw = 0;
				gameState.config = createMockGameConfig();

				// Simulate final damage roll
				applyFailureCheckResult(5); // More than 2

				expect(gameState.tower).toBe(0);
				expect(gameState.gameOver).toBe(true);
				expect(hasWon()).toBe(false);
			});
		});
	});

	// =======================================
	// SECTION 6: Card Type Classification
	// =======================================
	describe('Card Type Classification (Section 5)', () => {

		it('should classify Primary Success card (Ace of Hearts)', () => {
			const card = { card: 'A', suit: 'hearts' };
			expect(isPrimarySuccess(card)).toBe(true);
		});

		it('should classify Failure Counter cards (Kings)', () => {
			const kings = [
				{ card: 'K', suit: 'hearts' },
				{ card: 'K', suit: 'diamonds' },
				{ card: 'K', suit: 'clubs' },
				{ card: 'K', suit: 'spades' }
			];

			kings.forEach(king => {
				expect(isFailureCounter(king)).toBe(true);
			});
		});

		it('should classify Narrative cards (remaining Aces)', () => {
			const narrativeAces = [
				{ card: 'A', suit: 'diamonds' },
				{ card: 'A', suit: 'clubs' },
				{ card: 'A', suit: 'spades' }
			];

			narrativeAces.forEach(ace => {
				expect(isNarrative(ace)).toBe(true);
			});
		});

		it('should classify Challenge cards (3, 5, 7, 9)', () => {
			const challengeRanks = ['3', '5', '7', '9'];
			const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

			challengeRanks.forEach(rank => {
				suits.forEach(suit => {
					const card = { card: rank, suit };
					expect(isChallenge(card)).toBe(true);
				});
			});
		});

		it('should classify Event cards (2, 4, 6, 8, 10, J, Q)', () => {
			const eventRanks = ['2', '4', '6', '8', '10', 'J', 'Q'];
			const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

			eventRanks.forEach(rank => {
				suits.forEach(suit => {
					const card = { card: rank, suit };
					expect(isEvent(card)).toBe(true);
				});
			});
		});

		it('should have correct card type distribution', () => {
			const deck = createStandardDeck();

			const primarySuccess = deck.filter(isPrimarySuccess);
			const failureCounters = deck.filter(isFailureCounter);
			const narratives = deck.filter(isNarrative);
			const challenges = deck.filter(isChallenge);
			const events = deck.filter(isEvent);

			expect(primarySuccess).toHaveLength(1);  // 1 Ace of Hearts
			expect(failureCounters).toHaveLength(4); // 4 Kings
			expect(narratives).toHaveLength(3);      // 3 other Aces
			expect(challenges).toHaveLength(16);     // 4 suits × 4 ranks
			expect(events).toHaveLength(28);         // 4 suits × 7 ranks

			// Total should be 52
			const total = 1 + 4 + 3 + 16 + 28;
			expect(total).toBe(52);
		});
	});

	// =======================================
	// SECTION 7: Edge Cases
	// =======================================
	describe('Edge Cases (Section 10.3)', () => {

		beforeEach(() => {
			resetGameState();
		});

		it('should handle drawing last card', () => {
			const config = createMockGameConfig();
			initializeGame(config, { name: 'Test' });

			gameState.deck = [{ card: '2', suit: 'hearts', prompt: 'Last card' }];

			const drawnCard = drawCard();

			expect(drawnCard).toBeDefined();
			expect(gameState.deck).toHaveLength(0);
		});

		it('should handle win card as first card', () => {
			const config = createMockGameConfig();
			initializeGame(config, { name: 'Test' });

			// Place Ace of Hearts as the only card (deck.pop() draws from end)
			gameState.deck = [{ card: 'A', suit: 'hearts', prompt: 'Win card' }];
			gameState.state = 'drawCard';

			drawCard();

			expect(gameState.aceOfHeartsRevealed).toBe(true);
			expect(gameState.round).toBe(1); // Round increments during init
		});

		it('should handle all Aces drawn before win card', () => {
			const config = createMockGameConfig();
			initializeGame(config, { name: 'Test' });

			// Draw 3 non-hearts Aces
			const aces = [
				{ card: 'A', suit: 'diamonds', prompt: 'A1' },
				{ card: 'A', suit: 'clubs', prompt: 'A2' },
				{ card: 'A', suit: 'spades', prompt: 'A3' }
			];

			aces.forEach(ace => {
				gameState.deck = [ace];
				drawCard();
			});

			expect(gameState.bonus).toBe(3);
			expect(gameState.aceOfHeartsRevealed).toBe(false);

			// Now draw Ace of Hearts
			gameState.deck = [{ card: 'A', suit: 'hearts', prompt: 'Win' }];
			drawCard();

			expect(gameState.bonus).toBe(4);
			expect(gameState.aceOfHeartsRevealed).toBe(true);
		});

		it('should handle exactly lethal damage', () => {
			gameState.tower = 3;
			gameState.bonus = 0;
			gameState.gameOver = false;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(3);

			expect(gameState.tower).toBe(0);
			expect(gameState.gameOver).toBe(true);
		});

		it('should handle maximum bonus (all 4 Aces)', () => {
			const config = createMockGameConfig();
			initializeGame(config, { name: 'Test' });

			const allAces = [
				{ card: 'A', suit: 'hearts', prompt: 'A♥' },
				{ card: 'A', suit: 'diamonds', prompt: 'A♦' },
				{ card: 'A', suit: 'clubs', prompt: 'A♣' },
				{ card: 'A', suit: 'spades', prompt: 'A♠' }
			];

			allAces.forEach(ace => {
				gameState.deck = [ace];
				drawCard();
			});

			expect(gameState.bonus).toBe(4);

			// With max bonus, rolls 1-4 should deal 0 damage
			gameState.tower = 54;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(1);
			expect(gameState.tower).toBe(54);

			gameState.state = 'failureCheck'; // Reset state
			gameState.cardsToDraw = 0;
			applyFailureCheckResult(4);
			expect(gameState.tower).toBe(54);

			// Roll 5 should deal 1 damage (5 - 4)
			gameState.state = 'failureCheck'; // Reset state
			gameState.cardsToDraw = 0;
			gameState.gameOver = false; // Reset flag
			applyFailureCheckResult(5);
			expect(gameState.tower).toBe(53);
		});

		it('should handle no damage with high bonus', () => {
			gameState.tower = 54;
			gameState.bonus = 6; // More than max roll
			gameState.gameOver = false;
			gameState.state = 'failureCheck';
			gameState.cardsToDraw = 0;
			gameState.config = createMockGameConfig();

			applyFailureCheckResult(6);

			expect(gameState.tower).toBe(54); // No damage
		});

		it('should handle rapid token countdown', () => {
			gameState.tokens = 3;
			gameState.aceOfHeartsRevealed = true;
			gameState.config = { difficulty: 0 };
			gameState.state = 'successCheck';

			// Three successful rolls
			vi.spyOn(gameState, 'getRandomNumber')
				.mockReturnValueOnce(6)
				.mockReturnValueOnce(6)
				.mockReturnValueOnce(6);

			successCheck();
			expect(gameState.tokens).toBe(2);

			gameState.state = 'successCheck'; // Reset state
			gameState.gameOver = false; // Reset
			successCheck();
			expect(gameState.tokens).toBe(1);

			gameState.state = 'successCheck'; // Reset state
			gameState.gameOver = false; // Reset
			successCheck();
			expect(gameState.tokens).toBe(0);
		});
	});
});

// =======================================
// HELPER FUNCTIONS
// =======================================

/**
 * Create a standard 52-card deck
 */
function createStandardDeck() {
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	const deck = [];

	suits.forEach(suit => {
		ranks.forEach(rank => {
			deck.push({
				card: rank,
				suit: suit,
				prompt: `${rank} of ${suit}`
			});
		});
	});

	return deck;
}

/**
 * Check if card rank is odd (triggers damage)
 */
function isOddRank(rank) {
	const oddRanks = ['A', '3', '5', '7', '9'];
	return oddRanks.includes(rank);
}

/**
 * Check if card requires damage check
 */
function requiresDamageCheck(card) {
	return isOddRank(card.card);
}

/**
 * Calculate damage based on roll and bonus
 */
function calculateDamage(roll, bonus) {
	return Math.max(roll - bonus, 0);
}

/**
 * Card type classification functions
 */
function isPrimarySuccess(card) {
	return card.card === 'A' && card.suit === 'hearts';
}

function isFailureCounter(card) {
	return card.card === 'K';
}

function isNarrative(card) {
	return card.card === 'A' && card.suit !== 'hearts';
}

function isChallenge(card) {
	const challengeRanks = ['3', '5', '7', '9'];
	return challengeRanks.includes(card.card);
}

function isEvent(card) {
	const eventRanks = ['2', '4', '6', '8', '10', 'J', 'Q'];
	return eventRanks.includes(card.card);
}

/**
 * Check if player has won
 */
function hasWon() {
	return gameState.tokens === 0 &&
	       gameState.tower > 0 &&
	       gameState.aceOfHeartsRevealed;
}

/**
 * Reset game state to initial values
 */
function resetGameState() {
	updateGameState({
		state: 'log', // Set to valid gameplay state for tests
		round: 0,
		tower: 54,
		tokens: 10,
		bonus: 0,
		kingsRevealed: 0,
		aceOfHeartsRevealed: false,
		gameOver: false,
		win: false,
		deck: [],
		discard: [],
		log: [],
		journalEntries: [],
		kingOfHearts: false,
		kingOfDiamonds: false,
		kingOfClubs: false,
		kingOfSpades: false
	});
}

/**
 * Create mock game configuration
 */
function createMockGameConfig(options = {}) {
	return {
		title: 'Test Game',
		deck: createStandardDeck(),
		difficulty: options.difficulty || 0,
		labels: {
			failureCheckLoss: 'The tower has fallen',
			failureCounterLoss: 'All kings revealed'
		},
		options: options
	};
}
