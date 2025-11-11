/**
 * Tests for Final Damage Roll mechanic (V2 SRD compliance)
 * Tests the new "salvation with risk" final test
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { performFinalDamageRoll } from './gameActions.svelte.js';
import { gameState } from './gameStore.svelte.js';

describe('Final Damage Roll Mechanic', () => {
	beforeEach(() => {
		// Reset game state
		gameState.state = 'finalDamageRoll';
		gameState.tower = 10;
		gameState.bonus = 0;
		gameState.round = 5;
		gameState.log = [];
		gameState.win = false;
		gameState.gameOver = false;
		gameState.config = {
			labels: {
				successCheckWin: 'Victory achieved!',
				finalDamageRollLoss: 'So close to victory...'
			}
		};
	});

	describe('Victory Conditions', () => {
		it('should WIN if tower survives final damage', () => {
			gameState.tower = 10;
			gameState.bonus = 3;

			// Roll 4, damage = 4-3 = 1, tower = 10-1 = 9 > 0 → WIN
			performFinalDamageRoll(4);

			expect(gameState.tower).toBe(9);
			expect(gameState.win).toBe(true);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
			expect(gameState.status).toBe('Victory achieved!');
		});

		it('should WIN if final damage is exactly absorbed by tower', () => {
			gameState.tower = 5;
			gameState.bonus = 2;

			// Roll 6, damage = 6-2 = 4, tower = 5-4 = 1 > 0 → WIN
			performFinalDamageRoll(6);

			expect(gameState.tower).toBe(1);
			expect(gameState.win).toBe(true);
		});

		it('should WIN if bonus completely negates damage', () => {
			gameState.tower = 3;
			gameState.bonus = 5;

			// Roll 4, damage = max(4-5, 0) = 0, tower = 3-0 = 3 → WIN
			performFinalDamageRoll(4);

			expect(gameState.tower).toBe(3);
			expect(gameState.win).toBe(true);
		});
	});

	describe('Loss Conditions', () => {
		it('should LOSE if final damage depletes tower exactly', () => {
			gameState.tower = 3;
			gameState.bonus = 0;

			// Roll 3, damage = 3, tower = 3-3 = 0 → LOSE
			performFinalDamageRoll(3);

			expect(gameState.tower).toBe(0);
			expect(gameState.win).toBe(false);
			expect(gameState.gameOver).toBe(true);
			expect(gameState.state).toBe('gameOver');
			expect(gameState.status).toBe('So close to victory...');
		});

		it('should LOSE if final damage exceeds tower', () => {
			gameState.tower = 2;
			gameState.bonus = 0;

			// Roll 6, damage = 6, tower = 2-6 = -4 → 0 → LOSE
			performFinalDamageRoll(6);

			expect(gameState.tower).toBe(0);
			expect(gameState.win).toBe(false);
		});

		it('should LOSE even with bonus if damage still depletes tower', () => {
			gameState.tower = 1;
			gameState.bonus = 3;

			// Roll 5, damage = 5-3 = 2, tower = 1-2 = -1 → 0 → LOSE
			performFinalDamageRoll(5);

			expect(gameState.tower).toBe(0);
			expect(gameState.win).toBe(false);
		});
	});

	describe('Damage Calculation', () => {
		it('should apply damage as roll minus bonus', () => {
			gameState.tower = 20;
			gameState.bonus = 2;

			performFinalDamageRoll(5);

			// damage = 5-2 = 3, tower = 20-3 = 17
			expect(gameState.tower).toBe(17);
		});

		it('should not allow negative damage', () => {
			gameState.tower = 20;
			gameState.bonus = 10;

			performFinalDamageRoll(3);

			// damage = max(3-10, 0) = 0, tower = 20-0 = 20
			expect(gameState.tower).toBe(20);
			expect(gameState.win).toBe(true);
		});
	});

	describe('Logging', () => {
		it('should log the final damage roll', () => {
			gameState.tower = 10;
			gameState.bonus = 1;
			gameState.round = 5;

			performFinalDamageRoll(4);

			expect(gameState.log.length).toBe(1);
			expect(gameState.log[0].type).toBe('final-damage');
			expect(gameState.log[0].roll).toBe(4);
			expect(gameState.log[0].damage).toBe(3); // 4-1
			expect(gameState.log[0].tower).toBe(7); // 10-3
			expect(gameState.log[0].round).toBe(5);
			expect(gameState.log[0].id).toBe('5.final');
		});
	});

	describe('SRD Compliance - Salvation with Risk', () => {
		it('victory is not guaranteed even after completing countdown', () => {
			// Scenario: Player completes all tokens but has low tower and no bonus
			gameState.tower = 1;
			gameState.bonus = 0;

			// Bad luck on final roll
			performFinalDamageRoll(2);

			// Should lose despite completing the countdown
			expect(gameState.win).toBe(false);
			expect(gameState.tower).toBe(0);
		});

		it('lucky roll can save player with critical tower', () => {
			// Scenario: Tower is critical but player rolls low
			gameState.tower = 2;
			gameState.bonus = 0;

			// Lucky roll
			performFinalDamageRoll(1);

			// Minimal damage, survives!
			expect(gameState.win).toBe(true);
			expect(gameState.tower).toBe(1); // Survives with 1 resource
		});

		it('bonus counter provides crucial protection', () => {
			// Scenario: High bonus saves player from bad roll
			gameState.tower = 3;
			gameState.bonus = 4;

			// Bad roll but saved by bonus
			performFinalDamageRoll(6);

			// damage = max(6-4, 0) = 2, tower = 3-2 = 1 → WIN
			expect(gameState.win).toBe(true);
			expect(gameState.tower).toBe(1);
		});
	});
});
