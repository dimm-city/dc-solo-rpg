import { describe, it, expect } from 'vitest';
import {
	formatStabilityResult,
	formatTaskResult,
	formatSalvationResult,
	formatSalvationButton
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

	it('shows the target on a failure', () => {
		expect(formatSalvationResult(2, 14, 11)).toBe('Rolled 2 · needed 14+ · +1 token · 11 left');
	});

	it('handles natural 20 and natural 1', () => {
		expect(formatSalvationResult(20, 17, 8)).toBe(
			'Natural 20 · −2 tokens · 8 left · Lucid: your next roll keeps the higher of two dice'
		);
		expect(formatSalvationResult(1, 17, 12)).toBe(
			'Natural 1 · +2 tokens · 12 left · Surreal: your next roll keeps the lower of two dice'
		);
	});

	it('is automatic with four Aces', () => {
		expect(formatSalvationResult(7, 0, 9)).toBe('Automatic · −1 token · 9 left');
	});
});

describe('formatSalvationButton', () => {
	it('shows the target before rolling', () => {
		expect(formatSalvationButton(14)).toBe('Roll to remove a token · need 14+');
		expect(formatSalvationButton(0)).toBe('Remove a token · automatic');
	});
});
