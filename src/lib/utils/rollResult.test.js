import { describe, it, expect } from 'vitest';
import {
	formatStabilityResult,
	formatTaskResult,
	formatSalvationResult,
	formatSalvationButton,
	formatModifierHint,
	formatIntroGoal,
	describeDice,
	FINAL_CHECK_LABEL
} from './rollResult.js';

describe('formatStabilityResult', () => {
	it('shows the loss and the Stability left', () => {
		expect(formatStabilityResult(4, 16, 14)).toBe('Rolled 4 · −2 Stability · 14/20');
	});

	it('says so when nothing is lost', () => {
		expect(formatStabilityResult(13, 16, 16)).toBe('Rolled 13 · no Stability lost · 16/20');
	});

	it('explains a natural 20 and Lucid', () => {
		expect(formatStabilityResult(20, 18, 19)).toBe(
			'Natural 20 · +1 Stability · Lucid: your next roll keeps the higher of two dice'
		);
	});

	it('does not claim a gain when Stability is already full', () => {
		expect(formatStabilityResult(20, 20, 20)).toContain('Stability already full');
	});

	it('explains a natural 1 and Surreal', () => {
		expect(formatStabilityResult(1, 14, 11)).toBe(
			'Natural 1 · −3 Stability · Surreal: your next roll keeps the lower of two dice'
		);
	});
});

describe('formatTaskResult', () => {
	it('shows the cards to draw', () => {
		expect(formatTaskResult(17, 5)).toBe('Rolled 17 · Draw 5 cards');
	});

	it('uses the singular for one card and flags natural rolls', () => {
		expect(formatTaskResult(1, 1)).toContain('Draw 1 card · Surreal');
		expect(formatTaskResult(20, 6)).toContain('Natural 20 · Draw 6 cards · Lucid');
	});
});

describe('formatSalvationResult', () => {
	it('shows a success', () => {
		expect(formatSalvationResult(18, 14, 9)).toBe('Rolled 18 · −1 token · 9 left');
	});

	it('shows the target on a miss, which loses no token on Normal', () => {
		expect(formatSalvationResult(2, 14, 10)).toBe('Rolled 2 · needed 14+ · no token lost');
	});

	it('handles natural 20 and natural 1 (a miss, so no token lost)', () => {
		expect(formatSalvationResult(20, 17, 8)).toBe(
			'Natural 20 · −2 tokens · 8 left · Lucid: your next roll keeps the higher of two dice'
		);
		expect(formatSalvationResult(1, 17, 10)).toBe(
			'Natural 1 · no token lost · Surreal: your next roll keeps the lower of two dice'
		);
	});

	describe('on Hard, where a miss adds tokens', () => {
		const hard = { hard: true };

		it('shows the target and the token added', () => {
			expect(formatSalvationResult(2, 14, 11, undefined, hard)).toBe(
				'Rolled 2 · needed 14+ · +1 token · 11 left'
			);
			expect(formatSalvationResult(1, 17, 12, undefined, hard)).toBe(
				'Natural 1 · +2 tokens · 12 left · Surreal: your next roll keeps the lower of two dice'
			);
		});

		it('leaves a success as it is', () => {
			expect(formatSalvationResult(18, 14, 9, undefined, hard)).toBe(
				'Rolled 18 · −1 token · 9 left'
			);
		});
	});

	describe('with four Aces (Hard): a Stability check, then the token', () => {
		const at = (stabilityBefore) => ({ hard: true, stabilityBefore });

		it('names what the roll did to Stability, then the token', () => {
			expect(formatSalvationResult(14, 0, 3, undefined, at(16))).toBe(
				'Rolled 14 · no Stability lost · −1 token · 3 left'
			);
			expect(formatSalvationResult(7, 0, 3, undefined, at(16))).toBe(
				'Rolled 7 · −1 Stability · −1 token · 3 left'
			);
		});

		it('handles natural 20 and natural 1', () => {
			expect(formatSalvationResult(20, 0, 3, undefined, at(16))).toBe(
				'Natural 20 · +1 Stability · −1 token · 3 left · Lucid: your next roll keeps the higher of two dice'
			);
			expect(formatSalvationResult(20, 0, 3, undefined, at(20))).toBe(
				'Natural 20 · Stability already full · −1 token · 3 left · Lucid: your next roll keeps the higher of two dice'
			);
			expect(formatSalvationResult(1, 0, 3, undefined, at(16))).toBe(
				'Natural 1 · −3 Stability · −1 token · 3 left · Surreal: your next roll keeps the lower of two dice'
			);
		});

		it('names both dice of a two-dice roll', () => {
			expect(formatSalvationResult(9, 0, 3, { dice: [9, 4], wasLucid: true }, at(16))).toBe(
				'Rolled 9 (high of 9, 4) · −1 Stability · −1 token · 3 left'
			);
		});

		it('the fatal roll keeps the token and says so', () => {
			expect(formatSalvationResult(3, 0, 4, undefined, at(2))).toBe(
				'Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to'
			);
		});
	});
});

describe("the fourth Ace's Stability check (the final roll)", () => {
	const final = { final: true };

	it('ends in "you escape" when Stability holds, with no modifier note', () => {
		expect(formatStabilityResult(13, 16, 16, 20, undefined, final)).toBe(
			'Rolled 13 · no Stability lost · 16/20 · you escape'
		);
		expect(formatStabilityResult(4, 16, 14, 20, undefined, final)).toBe(
			'Rolled 4 · −2 Stability · 14/20 · you escape'
		);
		expect(formatStabilityResult(20, 16, 17, 20, undefined, final)).toBe(
			'Natural 20 · +1 Stability · 17/20 · you escape'
		);
		expect(formatStabilityResult(1, 16, 13, 20, undefined, final)).toBe(
			'Natural 1 · −3 Stability · 13/20 · you escape'
		);
		expect(formatStabilityResult(9, 16, 15, 20, { dice: [9, 14], wasSurreal: true }, final)).toBe(
			'Rolled 9 (low of 9, 14) · −1 Stability · 15/20 · you escape'
		);
	});

	it('is the fatal roll when it takes the last Stability', () => {
		expect(formatStabilityResult(3, 2, 0, 20, undefined, final)).toBe(
			'Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to'
		);
	});

	it('is the roll button that says what is at stake', () => {
		expect(FINAL_CHECK_LABEL).toBe('Roll for Stability · survive this and you escape');
	});
});

describe('formatSalvationButton', () => {
	it('shows the target before rolling', () => {
		expect(formatSalvationButton(14)).toBe('Roll to remove a token · need 14+');
		expect(formatSalvationButton(0)).toBe('Roll for Stability · Salvation is assured');
	});
});

describe('two-dice rolls (Lucid and Surreal) name both dice and the one that counted', () => {
	const lucid = { dice: [19, 5], wasLucid: true };
	const surreal = { dice: [3, 15], wasSurreal: true };

	it('describes the dice', () => {
		expect(describeDice(lucid)).toBe('(high of 19, 5)');
		expect(describeDice(surreal)).toBe('(low of 3, 15)');
		expect(describeDice({ dice: [12] })).toBe('');
		expect(describeDice()).toBe('');
	});

	it('adds them to every result line', () => {
		expect(formatTaskResult(19, 5, lucid)).toBe('Rolled 19 (high of 19, 5) · Draw 5 cards');
		expect(formatStabilityResult(3, 16, 14, 20, surreal)).toBe(
			'Rolled 3 (low of 3, 15) · −2 Stability · 14/20'
		);
		expect(formatSalvationResult(19, 14, 9, lucid)).toBe(
			'Rolled 19 (high of 19, 5) · −1 token · 9 left'
		);
	});

	it('names a natural 20 kept from two dice', () => {
		expect(formatTaskResult(20, 6, { dice: [7, 20], wasLucid: true })).toContain(
			'Natural 20 (high of 7, 20) · Draw 6 cards'
		);
	});
});

describe('the fatal roll', () => {
	it('says there is nothing left, with no modifier note', () => {
		expect(formatStabilityResult(3, 2, 0)).toBe(
			'Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to'
		);
		expect(formatStabilityResult(1, 3, 0)).toBe(
			'Natural 1 · −3 Stability · 0/20 · nothing left to hold on to'
		);
	});
});

describe('formatModifierHint', () => {
	it('names the modifier the next roll uses', () => {
		expect(formatModifierHint({ isLucid: true })).toBe('Lucid: 2 dice, keep high');
		expect(formatModifierHint({ isSurreal: true })).toBe('Surreal: 2 dice, keep low');
		expect(formatModifierHint({})).toBeNull();
	});
});

describe('formatIntroGoal', () => {
	it('ends the intro on what winning takes', () => {
		expect(formatIntroGoal({ stability: 20, tokens: 10, aceRevealed: false })).toBe(
			'Hold on to your 20 Stability. Find the Ace of Hearts, then clear all 10 tokens to escape.'
		);
	});

	it('says the Ace of Hearts is already revealed on Easy', () => {
		expect(formatIntroGoal({ stability: 20, tokens: 1, aceRevealed: true })).toBe(
			'Hold on to your 20 Stability. The Ace of Hearts is already revealed: clear the one token to escape.'
		);
	});
});
