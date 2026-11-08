/**
 * Result lines (design polish DP-1-07): one grammar, "{head} · {change}", plus the one-word
 * modifier the roll earned. No totals on screen (formatResultTotals adds them to the live
 * announcement only).
 */
import { describe, it, expect } from 'vitest';
import {
	formatModifierNotice,
	formatStabilityResult,
	formatTaskResult,
	formatSalvationResult,
	formatSalvationButton,
	formatModifierHint,
	formatIntroGoal,
	formatResultTotals,
	formatNextStepLabel,
	describeDice,
	FINAL_CHECK_LABEL,
	LUCID_NOTE,
	SURREAL_NOTE,
	LUCID_HINT,
	SURREAL_HINT,
	ROLLING_LABEL
} from './rollResult.js';

describe('formatStabilityResult', () => {
	it('shows the loss and nothing more', () => {
		expect(formatStabilityResult(8, 16, 15)).toBe('Rolled 8 · −1 Stability');
		expect(formatStabilityResult(4, 16, 14)).toBe('Rolled 4 · −2 Stability');
	});

	it('says so when nothing is lost', () => {
		expect(formatStabilityResult(15, 16, 16)).toBe('Rolled 15 · no Stability lost');
	});

	it('names Lucid in one word on a natural 20', () => {
		expect(formatStabilityResult(20, 18, 19)).toBe('Natural 20 · +1 Stability · Lucid');
	});

	it('does not claim a gain when Stability is already full', () => {
		expect(formatStabilityResult(20, 20, 20)).toBe('Natural 20 · Stability already full · Lucid');
	});

	it('names Surreal in one word on a natural 1', () => {
		expect(formatStabilityResult(1, 14, 11)).toBe('Natural 1 · −3 Stability · Surreal');
	});

	it('never shows a total', () => {
		for (const roll of [1, 3, 8, 15, 20]) {
			expect(formatStabilityResult(roll, 16, 14)).not.toMatch(/\/20|left/);
		}
	});
});

describe('formatTaskResult', () => {
	it('shows the cards this round', () => {
		expect(formatTaskResult(16, 5)).toBe('Rolled 16 · 5 cards this round');
	});

	it('uses the singular for one card and names the modifier', () => {
		expect(formatTaskResult(1, 1)).toBe('Natural 1 · 1 card this round · Surreal');
		expect(formatTaskResult(20, 6)).toBe('Natural 20 · 6 cards this round · Lucid');
	});
});

describe('formatSalvationResult', () => {
	it('shows a hit as the Token it removed', () => {
		expect(formatSalvationResult(17, 17, 9)).toBe('Rolled 17 · −1 Token');
	});

	it('names the target a miss missed, which loses no Token on Normal', () => {
		expect(formatSalvationResult(16, 17, 10)).toBe('Rolled 16 · missed 17+');
		expect(formatSalvationResult(9, 14, 10)).toBe('Rolled 9 · missed 14+');
	});

	it('handles natural 20 and natural 1 (a miss whatever the target)', () => {
		expect(formatSalvationResult(20, 17, 8)).toBe('Natural 20 · −2 Tokens · Lucid');
		expect(formatSalvationResult(1, 17, 10)).toBe('Natural 1 · missed · Surreal');
	});

	it('never says "no token lost" and never shows a total', () => {
		for (const roll of [1, 9, 17, 20]) {
			const line = formatSalvationResult(roll, 17, 8);
			expect(line).not.toMatch(/no token lost|left|\/20/i);
		}
	});

	describe('on Hard, where a miss adds Tokens', () => {
		const hard = { hard: true };

		it('shows the target and the Token added', () => {
			expect(formatSalvationResult(9, 17, 11, undefined, hard)).toBe(
				'Rolled 9 · missed 17+ · +1 Token'
			);
			expect(formatSalvationResult(1, 17, 12, undefined, hard)).toBe(
				'Natural 1 · missed · +2 Tokens · Surreal'
			);
		});

		it('leaves a hit as it is', () => {
			expect(formatSalvationResult(18, 14, 9, undefined, hard)).toBe('Rolled 18 · −1 Token');
		});
	});

	describe('the winning roll (the last Token)', () => {
		it('says the Token came off and you escape, with no modifier (GD-1-07)', () => {
			expect(formatSalvationResult(15, 14, 0)).toBe('Rolled 15 · −1 Token · you escape');
			expect(formatSalvationResult(20, 17, 0, undefined, { tokensBefore: 2 })).toBe(
				'Natural 20 · −2 Tokens · you escape'
			);
		});

		it('counts only the Token that was left when a natural 20 takes the last one', () => {
			expect(formatSalvationResult(20, 17, 0, undefined, { tokensBefore: 1 })).toBe(
				'Natural 20 · −1 Token · you escape'
			);
		});

		it('reads like the Easy final check with four Aces: the Stability clause, then the escape', () => {
			expect(formatSalvationResult(15, 0, 0, undefined, { stabilityBefore: 16 })).toBe(
				'Rolled 15 · no Stability lost · you escape'
			);
			expect(formatSalvationResult(8, 0, 0, undefined, { stabilityBefore: 16 })).toBe(
				'Rolled 8 · −1 Stability · you escape'
			);
			expect(formatSalvationResult(20, 0, 0, undefined, { stabilityBefore: 16 })).toBe(
				'Natural 20 · +1 Stability · you escape'
			);
		});
	});

	describe('with four Aces (Normal and Hard): a Stability check, then the Token', () => {
		const at = (stabilityBefore) => ({ stabilityBefore });

		it('names what the roll did to Stability, then the Token', () => {
			expect(formatSalvationResult(14, 0, 3, undefined, at(16))).toBe(
				'Rolled 14 · no Stability lost · −1 Token'
			);
			expect(formatSalvationResult(7, 0, 3, undefined, at(16))).toBe(
				'Rolled 7 · −1 Stability · −1 Token'
			);
		});

		it('handles natural 20 and natural 1', () => {
			expect(formatSalvationResult(20, 0, 3, undefined, at(16))).toBe(
				'Natural 20 · +1 Stability · −1 Token · Lucid'
			);
			expect(formatSalvationResult(20, 0, 3, undefined, at(20))).toBe(
				'Natural 20 · Stability already full · −1 Token · Lucid'
			);
			expect(formatSalvationResult(1, 0, 3, undefined, at(16))).toBe(
				'Natural 1 · −3 Stability · −1 Token · Surreal'
			);
		});

		it('names both dice of a two-dice roll', () => {
			expect(formatSalvationResult(9, 0, 3, { dice: [9, 4], wasLucid: true }, at(16))).toBe(
				'Rolled 9 (high of 9, 4) · −1 Stability · −1 Token'
			);
		});

		it('the fatal roll keeps the Token and says so', () => {
			expect(formatSalvationResult(3, 0, 4, undefined, at(2))).toBe(
				'Rolled 3 · −2 Stability · you fall'
			);
		});
	});
});

describe("the fourth Ace's Stability check (Easy: the final roll)", () => {
	const final = { final: true };

	it('ends in "you escape" when Stability holds, with no modifier', () => {
		expect(formatStabilityResult(15, 16, 16, 20, undefined, final)).toBe(
			'Rolled 15 · no Stability lost · you escape'
		);
		expect(formatStabilityResult(4, 16, 14, 20, undefined, final)).toBe(
			'Rolled 4 · −2 Stability · you escape'
		);
		expect(formatStabilityResult(20, 16, 17, 20, undefined, final)).toBe(
			'Natural 20 · +1 Stability · you escape'
		);
		expect(formatStabilityResult(1, 16, 13, 20, undefined, final)).toBe(
			'Natural 1 · −3 Stability · you escape'
		);
		expect(formatStabilityResult(9, 16, 15, 20, { dice: [9, 14], wasSurreal: true }, final)).toBe(
			'Rolled 9 (low of 9, 14) · −1 Stability · you escape'
		);
	});

	it('is the fatal roll when it takes the last Stability', () => {
		expect(formatStabilityResult(3, 2, 0, 20, undefined, final)).toBe(
			'Rolled 3 · −2 Stability · you fall'
		);
	});

	it('is rolled with the same verb as every Stability check', () => {
		expect(FINAL_CHECK_LABEL).toBe('Roll for Stability');
	});
});

describe('formatSalvationButton', () => {
	it('is one verb at every threshold and with four Aces', () => {
		expect(formatSalvationButton(17)).toBe('Roll for Salvation');
		expect(formatSalvationButton(14)).toBe('Roll for Salvation');
		expect(formatSalvationButton(0)).toBe('Roll for Salvation');
	});
});

describe('two-dice rolls (Lucid and Surreal) name both dice and the one that counted', () => {
	const lucid = { dice: [19, 5], wasLucid: true };
	const surreal = { dice: [6, 15], wasSurreal: true };

	it('describes the dice', () => {
		expect(describeDice(lucid)).toBe('(high of 19, 5)');
		expect(describeDice(surreal)).toBe('(low of 6, 15)');
		expect(describeDice({ dice: [12] })).toBe('');
		expect(describeDice()).toBe('');
	});

	it('does not name two equal dice: either one counted (GD-1-07)', () => {
		expect(describeDice({ dice: [20, 20], wasSurreal: true })).toBe('');
		expect(formatTaskResult(20, 6, { dice: [20, 20], wasSurreal: true })).toBe(
			'Natural 20 · 6 cards this round · Lucid'
		);
		expect(formatStabilityResult(8, 16, 15, 20, { dice: [8, 8], wasLucid: true })).toBe(
			'Rolled 8 · −1 Stability'
		);
	});

	it('adds them to every result line', () => {
		expect(formatTaskResult(19, 5, lucid)).toBe('Rolled 19 (high of 19, 5) · 5 cards this round');
		expect(formatStabilityResult(6, 16, 15, 20, surreal)).toBe(
			'Rolled 6 (low of 6, 15) · −1 Stability'
		);
		expect(formatSalvationResult(19, 14, 9, lucid)).toBe('Rolled 19 (high of 19, 5) · −1 Token');
	});

	it('names a natural 20 kept from two dice', () => {
		expect(formatTaskResult(20, 6, { dice: [7, 20], wasLucid: true })).toBe(
			'Natural 20 (high of 7, 20) · 6 cards this round · Lucid'
		);
	});
});

describe('the fatal roll', () => {
	it('says you fall, with no modifier (GD-1-07)', () => {
		expect(formatStabilityResult(3, 2, 0)).toBe('Rolled 3 · −2 Stability · you fall');
		expect(formatStabilityResult(1, 3, 0)).toBe('Natural 1 · −3 Stability · you fall');
	});
});

describe('the modifier words and hints', () => {
	it('names the modifier a roll earned in one word', () => {
		expect(LUCID_NOTE).toBe('Lucid');
		expect(SURREAL_NOTE).toBe('Surreal');
	});

	it('gives the hint line for the next roll, in the long form', () => {
		expect(LUCID_HINT).toBe('Lucid · two dice, keep the higher');
		expect(SURREAL_HINT).toBe('Surreal · two dice, keep the lower');
		expect(formatModifierHint({ isLucid: true })).toBe(LUCID_HINT);
		expect(formatModifierHint({ isSurreal: true })).toBe(SURREAL_HINT);
		expect(formatModifierHint({})).toBeNull();
	});

	it('uses no shorthand and no "..."', () => {
		for (const text of [LUCID_HINT, SURREAL_HINT, ROLLING_LABEL, FINAL_CHECK_LABEL]) {
			expect(text).not.toMatch(/keep high|keep low|2 dice|\.\.\./);
		}
	});
});

describe('formatResultTotals (the live announcement only)', () => {
	it('adds Stability after a Stability roll', () => {
		expect(formatResultTotals('stability', { stability: 14 })).toBe('. Stability 14 of 20.');
	});

	it('adds the Tokens left after Salvation', () => {
		expect(formatResultTotals('salvation', { tokens: 6, start: 10 })).toBe(
			'. 6 of 10 Tokens left.'
		);
	});

	it('adds both after a four-Ace Salvation, and nothing after the task roll', () => {
		expect(formatResultTotals('salvation-four', { stability: 15, tokens: 3, start: 10 })).toBe(
			'. Stability 15 of 20. 3 of 10 Tokens left.'
		);
		expect(formatResultTotals('tasks')).toBe('');
	});
});

describe('formatIntroGoal', () => {
	it('ends the intro on what winning takes (Normal and Hard)', () => {
		expect(formatIntroGoal({ stability: 20, tokens: 10, aceRevealed: false })).toBe(
			'Hold on to your 20 Stability. Find the Ace of Hearts, then remove all 10 Tokens to escape.'
		);
	});

	it('on Easy, says the Ace of Hearts is out and the fourth Ace is the other way out', () => {
		expect(
			formatIntroGoal({ stability: 20, tokens: 10, aceRevealed: true, fourthAceWins: true })
		).toBe(
			'Hold on to your 20 Stability. The Ace of Hearts is already revealed: remove all 10 Tokens, or survive the fourth Ace, to escape.'
		);
	});

	it('says "the one Token" for a single Token', () => {
		expect(formatIntroGoal({ stability: 20, tokens: 1, aceRevealed: false })).toBe(
			'Hold on to your 20 Stability. Find the Ace of Hearts, then remove the one Token to escape.'
		);
	});
});

describe('formatNextStepLabel (the step button after a result)', () => {
	it('names the screen that follows', () => {
		expect(formatNextStepLabel({ next: 'round', round: 0 })).toBe('Begin round 1');
		expect(formatNextStepLabel({ next: 'cards', cards: 5 })).toBe('Draw the cards');
		expect(formatNextStepLabel({ next: 'cards', cards: 1 })).toBe('Draw the card');
		expect(formatNextStepLabel({ next: 'draw' })).toBe('Draw the next card');
		expect(formatNextStepLabel({ next: 'salvation' })).toBe('Go to Salvation');
		expect(formatNextStepLabel({ next: 'journal', round: 2 })).toBe('Open your journal');
		expect(formatNextStepLabel({ next: 'journal', round: 2, skipJournal: true })).toBe(
			'Begin round 3'
		);
	});

	it('names an ending for itself', () => {
		expect(formatNextStepLabel({ gameOver: true, win: true, next: 'journal' })).toBe('Escape');
		expect(formatNextStepLabel({ gameOver: true, win: false, next: 'draw' })).toBe('Face the end');
	});
});

describe('formatModifierNotice (OWN-4): the board states what a modifier did, never a non-event', () => {
	it('keeps a modifier that did something, without the running total (game-copy-s-03)', () => {
		expect(formatModifierNotice('K♥ went back into the deck · 0 of 4 Kings out')).toBe(
			'K♥ went back into the deck'
		);
		expect(formatModifierNotice('K♠ went back into the deck · 1 of 4 Kings out')).toBe(
			'K♠ went back into the deck'
		);
		expect(formatModifierNotice('A♣ skipped its Stability check')).toBe(
			'A♣ skipped its Stability check'
		);
	});

	it('keeps the Kings count for the screen reader (withTotals)', () => {
		expect(
			formatModifierNotice('K♥ went back into the deck · 0 of 4 Kings out', { withTotals: true })
		).toBe('K♥ went back into the deck · 0 of 4 Kings out');
		expect(formatModifierNotice('No King was out to return', { withTotals: true })).toBeNull();
	});

	it('drops a modifier that did nothing, and an empty result', () => {
		// The exact sentence gameActions logs for a return-king Ace with no King out
		expect(formatModifierNotice('No King was out to return')).toBeNull();
		expect(formatModifierNotice('')).toBeNull();
		expect(formatModifierNotice(undefined)).toBeNull();
		expect(formatModifierNotice(null)).toBeNull();
	});

	it('only a leading "No" word marks a non-event', () => {
		expect(formatModifierNotice('Nothing ventured')).toBe('Nothing ventured');
	});
});
