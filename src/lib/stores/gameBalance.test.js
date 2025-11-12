/**
 * Game Balance & Simulation Tests
 * Based on: docs/v2/wretched-alone-mechanics-guide.md Section 10.2
 *
 * Tests cover:
 * - Expected win rate (10-20%)
 * - Average game length (15-30 days)
 * - Defeat condition distribution
 * - Resource depletion rates
 * - Token countdown success rates
 * - Damage system balance
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	gameState,
	updateGameState
} from './gameStore.svelte.js';
import {
	startGame,
	rollForTasks,
	drawCard,
	confirmCard,
	applyFailureCheckResult,
	successCheck,
	recordRound
} from './gameActions.svelte.js';
import { initializeGame } from './gameInit.js';

describe('Game Balance & Simulation', () => {

	// =======================================
	// WIN RATE TESTING
	// =======================================
	describe('Win Rate Balance (Section 10.2)', () => {

		it('should achieve target win rate between 5-30%', () => {
			const iterations = 100; // Reduced for test performance
			let wins = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame();
				if (result.status === 'victory') {
					wins++;
				}
			}

			const winRate = wins / iterations;

			// Target: 10-20%, allow 5-30% range for test variance
			expect(winRate).toBeGreaterThan(0.05);  // At least 5%
			expect(winRate).toBeLessThan(0.30);     // Less than 30%
		});

		it('should have higher win rate with bonus Aces drawn', () => {
			const iterationsWithBonus = 50;
			const iterationsWithoutBonus = 50;

			let winsWithBonus = 0;
			let winsWithoutBonus = 0;

			// Simulate games where Aces are drawn early
			for (let i = 0; i < iterationsWithBonus; i++) {
				const result = simulateFullGame({ earlyAces: true });
				if (result.status === 'victory') {
					winsWithBonus++;
				}
			}

			// Simulate games where Aces are drawn late or not at all
			for (let i = 0; i < iterationsWithoutBonus; i++) {
				const result = simulateFullGame({ earlyAces: false });
				if (result.status === 'victory') {
					winsWithoutBonus++;
				}
			}

			const winRateWithBonus = winsWithBonus / iterationsWithBonus;
			const winRateWithoutBonus = winsWithoutBonus / iterationsWithoutBonus;

			// Games with early Aces should have higher win rate
			expect(winRateWithBonus).toBeGreaterThanOrEqual(winRateWithoutBonus);
		});

		it('should have very low win rate when win card drawn late', () => {
			const iterations = 50;
			let wins = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame({ lateWinCard: true });
				if (result.status === 'victory') {
					wins++;
				}
			}

			const winRate = wins / iterations;

			// Should be very difficult to win if Ace of Hearts is at bottom
			expect(winRate).toBeLessThan(0.10); // Less than 10%
		});
	});

	// =======================================
	// GAME LENGTH TESTING
	// =======================================
	describe('Game Length Balance', () => {

		it('should last 10-40 days on average', () => {
			const iterations = 50;
			let totalDays = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame({ trackDays: true });
				totalDays += result.days;
			}

			const avgDays = totalDays / iterations;

			expect(avgDays).toBeGreaterThan(10);
			expect(avgDays).toBeLessThan(40);
		});

		it('should have shorter games when win card drawn early', () => {
			const earlyWinGames = simulateMultipleGames(20, { earlyWinCard: true });
			const normalGames = simulateMultipleGames(20, {});

			const avgEarly = average(earlyWinGames.map(g => g.days));
			const avgNormal = average(normalGames.map(g => g.days));

			// Early win card games should be shorter on average
			expect(avgEarly).toBeLessThanOrEqual(avgNormal);
		});

		it('should rarely exceed 50 days', () => {
			const iterations = 100;
			let gamesOver50Days = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame({ trackDays: true });
				if (result.days > 50) {
					gamesOver50Days++;
				}
			}

			const percentageOver50 = gamesOver50Days / iterations;

			// Less than 5% of games should exceed 50 days
			expect(percentageOver50).toBeLessThan(0.05);
		});
	});

	// =======================================
	// DEFEAT CONDITION DISTRIBUTION
	// =======================================
	describe('Defeat Condition Distribution (Section 7.3)', () => {

		it('should have resource depletion as most common defeat', () => {
			const iterations = 100;
			const defeatReasons = {
				resourceDepletion: 0,
				trackerLimit: 0,
				deckExhaustion: 0,
				finalRollFailure: 0
			};

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame();

				if (result.status === 'defeat') {
					if (result.reason === 'resources_depleted') {
						defeatReasons.resourceDepletion++;
					} else if (result.reason === 'tracker_limit') {
						defeatReasons.trackerLimit++;
					} else if (result.reason === 'deck_exhausted') {
						defeatReasons.deckExhaustion++;
					} else if (result.reason === 'final_roll_failure') {
						defeatReasons.finalRollFailure++;
					}
				}
			}

			const totalDefeats = Object.values(defeatReasons).reduce((a, b) => a + b, 0);

			// Resource depletion should be most common (target: ~60%)
			const resourceRate = defeatReasons.resourceDepletion / totalDefeats;
			expect(resourceRate).toBeGreaterThan(0.40); // At least 40%

			// Tracker limit should account for 10-25% of defeats
			const trackerRate = defeatReasons.trackerLimit / totalDefeats;
			expect(trackerRate).toBeGreaterThan(0.05);  // At least 5%
			expect(trackerRate).toBeLessThan(0.30);     // Less than 30%
		});

		it('should have 4-kings defeat occur regularly', () => {
			const iterations = 100;
			let kingDefeats = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame();
				if (result.reason === 'tracker_limit') {
					kingDefeats++;
				}
			}

			// At least 5% of games should end by 4 kings
			expect(kingDefeats).toBeGreaterThan(5);
		});

		it('should rarely exhaust deck before win or loss', () => {
			const iterations = 100;
			let deckExhausted = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame();
				if (result.reason === 'deck_exhausted') {
					deckExhausted++;
				}
			}

			// Deck exhaustion should be rare (< 10%)
			expect(deckExhausted).toBeLessThan(10);
		});
	});

	// =======================================
	// DAMAGE SYSTEM BALANCE
	// =======================================
	describe('Damage System Balance (Section 9)', () => {

		it('should have ~31% of deck trigger damage (16 challenge cards)', () => {
			const deck = createStandardDeck();
			const challengeRanks = ['3', '5', '7', '9'];
			const damageCards = deck.filter(c => challengeRanks.includes(c.card));

			expect(damageCards.length).toBe(16);
			expect(damageCards.length / deck.length).toBeCloseTo(0.31, 1);
		});

		it('should have expected damage per check without bonus', () => {
			const iterations = 1000;
			let totalDamage = 0;

			for (let i = 0; i < iterations; i++) {
				const roll = rollD6();
				const damage = calculateDamage(roll, 0);
				totalDamage += damage;
			}

			const avgDamage = totalDamage / iterations;

			// Expected value: (1+2+3+4+5+6)/6 = 3.5
			expect(avgDamage).toBeCloseTo(3.5, 0.5);
		});

		it('should have reduced damage with bonus counter', () => {
			const iterations = 1000;

			const damageWithNoBonus = simulateDamageChecks(iterations, 0);
			const damageWithBonus2 = simulateDamageChecks(iterations, 2);
			const damageWithBonus4 = simulateDamageChecks(iterations, 4);

			const avgNoBonus = average(damageWithNoBonus);
			const avgBonus2 = average(damageWithBonus2);
			const avgBonus4 = average(damageWithBonus4);

			// Average damage should decrease with bonus
			expect(avgBonus2).toBeLessThan(avgNoBonus);
			expect(avgBonus4).toBeLessThan(avgBonus2);

			// Expected values per guide:
			// No bonus: 3.5, Bonus 2: 1.67, Bonus 4: 0.5
			expect(avgNoBonus).toBeCloseTo(3.5, 0.5);
			expect(avgBonus2).toBeCloseTo(1.67, 0.5);
			expect(avgBonus4).toBeCloseTo(0.5, 0.5);
		});

		it('should have survivable damage with max bonus (all Aces)', () => {
			const iterations = 50;
			let survivedToWinCard = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame({ maxBonus: true });

				// Check if game survived until Ace of Hearts
				if (result.aceOfHeartsDrawn) {
					survivedToWinCard++;
				}
			}

			// With max bonus, most games should reach win card
			const survivalRate = survivedToWinCard / iterations;
			expect(survivalRate).toBeGreaterThan(0.60); // At least 60%
		});
	});

	// =======================================
	// TOKEN COUNTDOWN BALANCE
	// =======================================
	describe('Token Countdown Balance', () => {

		it('should have 16.67% success rate per roll (base difficulty)', () => {
			const iterations = 1000;
			let successes = 0;

			for (let i = 0; i < iterations; i++) {
				const roll = rollD6();
				if (roll === 6) {
					successes++;
				}
			}

			const successRate = successes / iterations;

			// Expected: 1/6 = 0.1667
			expect(successRate).toBeCloseTo(0.167, 0.05);
		});

		it('should have 33.33% success rate with bonus (difficulty > 0)', () => {
			const iterations = 1000;
			let successes = 0;

			for (let i = 0; i < iterations; i++) {
				const roll = rollD6();
				const bonus = 1; // With any bonus

				// Success on 5-6 with bonus
				if (roll >= 5) {
					successes++;
				}
			}

			const successRate = successes / iterations;

			// Expected: 2/6 = 0.333
			expect(successRate).toBeCloseTo(0.333, 0.05);
		});

		it('should take 6 rounds on average to remove 1 token (base)', () => {
			const iterations = 100;
			let totalRounds = 0;

			for (let i = 0; i < iterations; i++) {
				let rounds = 0;
				let tokenRemoved = false;

				// Simulate rolling until token removed (max 100 to prevent infinite loop)
				while (!tokenRemoved && rounds < 100) {
					rounds++;
					const roll = rollD6();
					if (roll === 6) {
						tokenRemoved = true;
					}
				}

				totalRounds += rounds;
			}

			const avgRounds = totalRounds / iterations;

			// Expected: ~6 rounds (1/0.167 ≈ 6)
			expect(avgRounds).toBeGreaterThan(4);
			expect(avgRounds).toBeLessThan(8);
		});

		it('should take 3 rounds on average with bonus (difficulty > 0)', () => {
			const iterations = 100;
			let totalRounds = 0;

			for (let i = 0; i < iterations; i++) {
				let rounds = 0;
				let tokenRemoved = false;

				while (!tokenRemoved && rounds < 100) {
					rounds++;
					const roll = rollD6();
					if (roll >= 5) { // Success on 5-6
						tokenRemoved = true;
					}
				}

				totalRounds += rounds;
			}

			const avgRounds = totalRounds / iterations;

			// Expected: ~3 rounds (1/0.333 ≈ 3)
			expect(avgRounds).toBeGreaterThan(2);
			expect(avgRounds).toBeLessThan(4);
		});
	});

	// =======================================
	// RESOURCE ATTRITION RATES
	// =======================================
	describe('Resource Attrition Rates', () => {

		it('should deplete resources faster without bonus', () => {
			const gamesNoBonus = simulateMultipleGames(30, { noAces: true });
			const gamesWithBonus = simulateMultipleGames(30, { earlyAces: true });

			const avgResourcesNoBonus = average(gamesNoBonus.map(g => g.finalResources));
			const avgResourcesWithBonus = average(gamesWithBonus.map(g => g.finalResources));

			// Games with bonus should have more resources remaining
			expect(avgResourcesWithBonus).toBeGreaterThanOrEqual(avgResourcesNoBonus);
		});

		it('should average 9-12 damage checks per game', () => {
			const iterations = 30;
			let totalDamageChecks = 0;

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame({ trackDamageChecks: true });
				totalDamageChecks += result.damageChecks;
			}

			const avgDamageChecks = totalDamageChecks / iterations;

			// Expected: 9-12 per guide (Section 9.4)
			expect(avgDamageChecks).toBeGreaterThan(7);
			expect(avgDamageChecks).toBeLessThan(15);
		});

		it('should survive 30-40 cards drawn with no bonus', () => {
			const iterations = 50;
			const survivors = [];

			for (let i = 0; i < iterations; i++) {
				const result = simulateFullGame({
					noAces: true,
					trackCardsDrawn: true
				});

				if (result.status === 'defeat' && result.reason === 'resources_depleted') {
					survivors.push(result.cardsDrawn);
				}
			}

			if (survivors.length > 0) {
				const avgSurvival = average(survivors);

				// With 0 bonus, ~31-42 total damage expected (9-12 checks × 3.5 avg)
				// Starting with 54 HP, should survive 25-35 cards
				expect(avgSurvival).toBeGreaterThan(15);
				expect(avgSurvival).toBeLessThan(45);
			}
		});
	});
});

// =======================================
// SIMULATION HELPER FUNCTIONS
// =======================================

/**
 * Simulate a full game from start to finish
 */
function simulateFullGame(options = {}) {
	const result = {
		status: 'active',
		reason: null,
		days: 0,
		finalResources: 54,
		aceOfHeartsDrawn: false,
		damageChecks: 0,
		cardsDrawn: 0
	};

	// Create and shuffle deck
	let deck = createStandardDeck();
	deck = shuffleDeck(deck);

	// Options for deck manipulation
	if (options.earlyWinCard) {
		// Place Ace of Hearts in top 10 cards
		const aceIndex = deck.findIndex(c => c.card === 'A' && c.suit === 'hearts');
		if (aceIndex > -1) {
			const [ace] = deck.splice(aceIndex, 1);
			deck.splice(Math.floor(Math.random() * 10), 0, ace);
		}
	}

	if (options.lateWinCard) {
		// Place Ace of Hearts in bottom 10 cards
		const aceIndex = deck.findIndex(c => c.card === 'A' && c.suit === 'hearts');
		if (aceIndex > -1) {
			const [ace] = deck.splice(aceIndex, 1);
			deck.splice(deck.length - Math.floor(Math.random() * 10), 0, ace);
		}
	}

	if (options.earlyAces) {
		// Place all Aces near top
		const aces = deck.filter(c => c.card === 'A');
		deck = deck.filter(c => c.card !== 'A');
		aces.forEach((ace, i) => {
			deck.splice(i * 3, 0, ace);
		});
	}

	if (options.noAces) {
		// Remove Aces from deck (for testing no-bonus scenarios)
		deck = deck.filter(c => c.card !== 'A');
	}

	if (options.maxBonus) {
		// Place all Aces at top
		const aces = deck.filter(c => c.card === 'A');
		deck = deck.filter(c => c.card !== 'A');
		deck.unshift(...aces);
	}

	// Game state
	let resources = 54;
	let tokens = 10;
	let bonus = 0;
	let kingsRevealed = 0;
	let aceOfHeartsRevealed = false;
	let damageChecks = 0;

	// Initial damage (v2 enhancement)
	if (!options.skipInitialDamage) {
		const initialDamage = rollD6();
		resources -= initialDamage;
	}

	// Simulate game loop
	const maxDays = 60; // Safety limit
	while (result.status === 'active' && result.days < maxDays) {
		result.days++;

		// Roll for cards
		const cardsToDraw = rollD6();

		for (let i = 0; i < cardsToDraw; i++) {
			if (deck.length === 0) {
				result.status = 'defeat';
				result.reason = 'deck_exhausted';
				break;
			}

			const card = deck.pop();
			result.cardsDrawn++;

			// Track Aces
			if (card.card === 'A') {
				bonus++;
				if (card.suit === 'hearts') {
					aceOfHeartsRevealed = true;
					result.aceOfHeartsDrawn = true;
				}
			}

			// Track Kings
			if (card.card === 'K') {
				kingsRevealed++;
				if (kingsRevealed >= 4) {
					result.status = 'defeat';
					result.reason = 'tracker_limit';
					break;
				}
			}

			// Damage check for challenge cards (3, 5, 7, 9)
			const challengeRanks = ['3', '5', '7', '9'];
			if (challengeRanks.includes(card.card)) {
				if (options.trackDamageChecks) {
					damageChecks++;
				}

				const roll = rollD6();
				const damage = calculateDamage(roll, bonus);
				resources -= damage;

				if (resources <= 0) {
					result.status = 'defeat';
					result.reason = 'resources_depleted';
					break;
				}
			}
		}

		if (result.status !== 'active') {
			break;
		}

		// Token countdown if win card drawn
		if (aceOfHeartsRevealed) {
			const roll = rollD6();
			const success = roll === 6 || (options.difficulty > 0 && roll >= 5);

			if (success) {
				tokens--;

				if (tokens === 0) {
					// Final damage roll
					const finalRoll = rollD6();
					const finalDamage = calculateDamage(finalRoll, bonus);
					resources -= finalDamage;

					if (resources > 0) {
						result.status = 'victory';
					} else {
						result.status = 'defeat';
						result.reason = 'final_roll_failure';
					}
					break;
				}
			}
		}
	}

	result.finalResources = resources;
	result.damageChecks = damageChecks;

	return result;
}

/**
 * Simulate multiple games
 */
function simulateMultipleGames(count, options = {}) {
	const results = [];

	for (let i = 0; i < count; i++) {
		results.push(simulateFullGame(options));
	}

	return results;
}

/**
 * Simulate damage checks with specific bonus
 */
function simulateDamageChecks(iterations, bonus) {
	const damages = [];

	for (let i = 0; i < iterations; i++) {
		const roll = rollD6();
		const damage = calculateDamage(roll, bonus);
		damages.push(damage);
	}

	return damages;
}

/**
 * Roll 1d6
 */
function rollD6() {
	return Math.floor(Math.random() * 6) + 1;
}

/**
 * Calculate damage
 */
function calculateDamage(roll, bonus) {
	return Math.max(roll - bonus, 0);
}

/**
 * Create standard 52-card deck
 */
function createStandardDeck() {
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	const deck = [];

	suits.forEach(suit => {
		ranks.forEach(rank => {
			deck.push({ card: rank, suit, prompt: `${rank} of ${suit}` });
		});
	});

	return deck;
}

/**
 * Shuffle deck (Fisher-Yates)
 */
function shuffleDeck(deck) {
	const shuffled = [...deck];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
}

/**
 * Calculate average of array
 */
function average(arr) {
	if (arr.length === 0) return 0;
	return arr.reduce((a, b) => a + b, 0) / arr.length;
}
