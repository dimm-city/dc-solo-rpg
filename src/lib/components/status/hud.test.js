/**
 * HUD component tests: Stability n/20 and tiers, Kings n/4, locked tokens before the
 * Ace of Hearts, the shroom lighting at 3 Aces, the last-roll number, and the compact HUD.
 */
import { flushSync } from 'svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
// svelte/reactivity/window needs real window events that jsdom's test window lacks
vi.mock('svelte/reactivity/window', () => ({ innerWidth: { current: 1024 } }));

import { gameState } from '../../stores/gameStore.svelte.js';
import { diceState } from '../../stores/diceStore.svelte.js';
import { stabilityTier, describeTwoDiceRoll } from './hudTiers.js';
import StabilityPanel from './StabilityPanel.svelte';
import FailureCounterPanel from './FailureCounterPanel.svelte';
import SuccessTokensPanel from './SuccessTokensPanel.svelte';
import AbilitiesPanel from './AbilitiesPanel.svelte';
import DiceReadout from './DiceReadout.svelte';
import CompactHUD from './CompactHUD.svelte';

beforeEach(() => {
	gameState.tower = 20;
	gameState.tokens = 10;
	gameState.kingsRevealed = 0;
	gameState.acesRevealed = 0;
	gameState.aceOfHeartsRevealed = false;
	gameState.diceRoll = 0;
	gameState.isLucid = false;
	gameState.isSurreal = false;
	diceState.lastRoll = null;
});

describe('stabilityTier', () => {
	it('maps stability to four tiers', () => {
		expect(stabilityTier(20)).toBe('steady');
		expect(stabilityTier(16)).toBe('steady');
		expect(stabilityTier(15)).toBe('caution');
		expect(stabilityTier(11)).toBe('caution');
		expect(stabilityTier(10)).toBe('danger');
		expect(stabilityTier(5)).toBe('danger');
		expect(stabilityTier(4)).toBe('critical');
		expect(stabilityTier(0)).toBe('critical');
	});
});

describe('describeTwoDiceRoll', () => {
	it('names the die that counted', () => {
		const lucid = { rolls: [15, 6], finalValue: 15, isLucid: true, isSurreal: false };
		const surreal = { rolls: [15, 6], finalValue: 6, isLucid: false, isSurreal: true };
		expect(describeTwoDiceRoll(lucid, 15)).toBe('high of 15, 6');
		expect(describeTwoDiceRoll(surreal, 6)).toBe('low of 15, 6');
	});

	it('returns null for single dice or a stale roll', () => {
		expect(describeTwoDiceRoll(null, 4)).toBeNull();
		expect(
			describeTwoDiceRoll({ rolls: [4], finalValue: 4, isLucid: false, isSurreal: false }, 4)
		).toBeNull();
		expect(
			describeTwoDiceRoll({ rolls: [15, 6], finalValue: 15, isLucid: true, isSurreal: false }, 9)
		).toBeNull();
	});
});

describe('StabilityPanel', () => {
	it('shows n/20 and a scaled bar', () => {
		gameState.tower = 14;
		const { container } = render(StabilityPanel);
		expect(container.querySelector('.stability-value').textContent.replace(/\s/g, '')).toBe(
			'14/20'
		);
		expect(container.querySelector('.stability-fill').getAttribute('style')).toContain(
			'scaleX(0.7)'
		);
		expect(container.querySelector('.tier-caution')).toBeTruthy();
	});

	it('goes critical at 4 or less', () => {
		gameState.tower = 3;
		const { container } = render(StabilityPanel);
		expect(container.querySelector('.tier-critical')).toBeTruthy();
	});

	it('flags damage briefly when stability drops', () => {
		const { container } = render(StabilityPanel);
		flushSync();
		gameState.tower = 17;
		flushSync();
		expect(container.querySelector('.health-stat').classList.contains('hit')).toBe(true);
	});
});

describe('FailureCounterPanel', () => {
	it('shows n/4 and lights that many skulls', () => {
		gameState.kingsRevealed = 3;
		const { container } = render(FailureCounterPanel);
		expect(container.querySelector('.king-count').textContent.replace(/\s/g, '')).toBe('3/4');
		expect(container.querySelectorAll('.king-icon.revealed').length).toBe(3);
		expect(container.querySelector('.failure-stat').classList.contains('urgent')).toBe(true);
	});

	it('is not urgent below 3 Kings', () => {
		gameState.kingsRevealed = 2;
		const { container } = render(FailureCounterPanel);
		expect(container.querySelector('.failure-stat').classList.contains('urgent')).toBe(false);
	});
});

describe('SuccessTokensPanel', () => {
	it('is locked before the Ace of Hearts', () => {
		const { container } = render(SuccessTokensPanel);
		expect(container.textContent).toContain('Find the Ace of Hearts');
		expect(container.querySelectorAll('.token-shape').length).toBe(0);
	});

	it('shows tokens left once the Ace of Hearts is revealed', () => {
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 7;
		const { container } = render(SuccessTokensPanel);
		expect(container.querySelector('.token-count').textContent).toContain('7left');
		expect(container.querySelectorAll('.token-shape.active').length).toBe(7);
	});

	it('grows past 10 stars when failed Salvation rolls add tokens', () => {
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 12;
		const { container } = render(SuccessTokensPanel);
		expect(container.querySelectorAll('.token-shape').length).toBe(12);
	});

	it('plays the unlock moment when the Ace of Hearts appears', () => {
		const { container } = render(SuccessTokensPanel);
		flushSync();
		gameState.aceOfHeartsRevealed = true;
		flushSync();
		expect(container.querySelector('.success-stat').classList.contains('unlocking')).toBe(true);
	});
});

describe('AbilitiesPanel', () => {
	it('lights the shroom at 3 Aces', () => {
		gameState.acesRevealed = 3;
		const { container } = render(AbilitiesPanel);
		const shroom = container.querySelector('img.ability-icon');
		expect(shroom.classList.contains('active')).toBe(true);
		expect(container.querySelectorAll('.ability-icon.active').length).toBe(3);
	});

	it('leaves the shroom dark below 3 Aces and names every icon', () => {
		gameState.acesRevealed = 2;
		const { container } = render(AbilitiesPanel);
		expect(container.querySelector('img.ability-icon').classList.contains('active')).toBe(false);
		container.querySelectorAll('.ability-icon').forEach((icon) => {
			expect(icon.getAttribute('aria-label') || icon.getAttribute('alt')).toBeTruthy();
		});
	});
});

describe('DiceReadout', () => {
	it('shows the number, not pips', () => {
		gameState.diceRoll = 13;
		const { container } = render(DiceReadout);
		expect(container.querySelector('.dice-value').textContent.trim()).toBe('13');
		expect(container.querySelector('.dice-pips')).toBeNull();
	});

	it('says which die counted for a 2d20 roll', () => {
		gameState.diceRoll = 15;
		diceState.lastRoll = { rolls: [15, 6], finalValue: 15, isLucid: true, isSurreal: false };
		const { container } = render(DiceReadout);
		expect(container.querySelector('.dice-detail').textContent).toContain('high of 15, 6');
	});

	it('labels LUCID and SURREAL', () => {
		gameState.isSurreal = true;
		const { container } = render(DiceReadout);
		expect(container.querySelector('.modifier-state').textContent).toContain('SURREAL');
	});
});

describe('CompactHUD', () => {
	it('puts the key numbers in one row', () => {
		gameState.tower = 12;
		gameState.kingsRevealed = 1;
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 9;
		gameState.diceRoll = 8;
		const { getByTestId } = render(CompactHUD);
		expect(getByTestId('compact-stability').textContent.replace(/\s/g, '')).toContain('12/20');
		expect(getByTestId('compact-kings').textContent.replace(/\s/g, '')).toContain('1/4');
		expect(getByTestId('compact-tokens').textContent).toContain('9');
		expect(getByTestId('compact-roll').textContent).toContain('8');
	});

	it('shows a lock instead of tokens before the Ace of Hearts', () => {
		const { getByTestId } = render(CompactHUD);
		expect(getByTestId('compact-tokens').querySelector('.lock')).toBeTruthy();
	});
});
