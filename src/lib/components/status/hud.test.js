/**
 * HUD tests: one row at every width with Stability n/20 and its tiers, Kings n/4 with the
 * ignite and the fourth-King finale, "Aces n/4 · need 14+", tokens locked until the Ace of
 * Hearts, cards left, and the last roll with its 2d20 badge.
 */
import { flushSync } from 'svelte';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import { gameState } from '../../stores/gameStore.svelte.js';
import { diceState } from '../../stores/diceStore.svelte.js';
import { ANIMATION_DURATION } from '../../constants/animations.js';
import { stabilityTier, describeTwoDiceRoll, acesSummary, rollBadge } from './hudTiers.js';
import StatusHUD from './StatusHUD.svelte';
import StabilityCell from './StabilityCell.svelte';
import KingsCell from './KingsCell.svelte';
import AcesCell from './AcesCell.svelte';
import TokensCell from './TokensCell.svelte';
import RollCell from './RollCell.svelte';

const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
const visible = (el) =>
	[...el.querySelectorAll('[aria-hidden="true"]')]
		.map((n) => n.textContent.replace(/\s/g, ''))
		.join('');

beforeEach(() => {
	gameState.tower = 20;
	gameState.tokens = 10;
	gameState.kingsRevealed = 0;
	gameState.acesRevealed = 0;
	gameState.aceOfHeartsRevealed = false;
	gameState.diceRoll = 0;
	gameState.isLucid = false;
	gameState.isSurreal = false;
	gameState.pendingUpdates.kingsChange = null;
	gameState.pendingUpdates.aceChange = null;
	gameState.deck = new Array(52).fill({});
	diceState.lastRoll = null;
});

afterEach(() => {
	vi.useRealTimers();
});

describe('hudTiers', () => {
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

	it('names the die that counted on a 2d20 roll, and nothing for a stale roll', () => {
		const lucid = { rolls: [15, 6], finalValue: 15, isLucid: true, isSurreal: false };
		expect(describeTwoDiceRoll(lucid, 15)).toBe('high of 15, 6');
		expect(
			describeTwoDiceRoll({ ...lucid, isLucid: false, isSurreal: true, finalValue: 6 }, 6)
		).toBe('low of 15, 6');
		expect(describeTwoDiceRoll(null, 4)).toBeNull();
		expect(describeTwoDiceRoll(lucid, 9)).toBeNull();
	});

	it('says what Salvation needs for each Ace count', () => {
		expect(acesSummary(0)).toEqual({ count: 0, need: null });
		expect(acesSummary(1)).toEqual({ count: 1, need: '17+' });
		expect(acesSummary(2)).toEqual({ count: 2, need: '14+' });
		expect(acesSummary(3)).toEqual({ count: 3, need: '11+' });
		expect(acesSummary(4)).toEqual({ count: 4, need: 'auto' });
		expect(acesSummary(7).count).toBe(4);
	});

	it('gives a 2d20 badge only while Lucid or Surreal', () => {
		expect(rollBadge({ isLucid: false, isSurreal: false })).toBeNull();
		expect(rollBadge({ isLucid: true }).text).toBe('2d20↑');
		expect(rollBadge({ isSurreal: true }).text).toBe('2d20↓');
		expect(rollBadge({ isLucid: true }).label).toMatch(/next roll .*higher/);
		expect(rollBadge({ isSurreal: true }).label).toMatch(/next roll .*lower/);
	});
});

describe('StatusHUD', () => {
	it('is one labelled row of six cells', () => {
		const { getByTestId, getByRole } = render(StatusHUD);
		expect(getByRole('group', { name: 'Game status' })).toBe(getByTestId('hud'));
		const cells = getByTestId('hud').querySelectorAll(':scope > .hud-cell');
		expect([...cells].map((c) => c.dataset.testid)).toEqual([
			'hud-stability',
			'hud-kings',
			'hud-aces',
			'hud-tokens',
			'hud-cards',
			'hud-roll'
		]);
	});

	it('shows the key numbers', () => {
		gameState.tower = 12;
		gameState.kingsRevealed = 1;
		gameState.acesRevealed = 2;
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 9;
		gameState.diceRoll = 8;
		gameState.deck = new Array(38).fill({});
		const { getByTestId } = render(StatusHUD);
		expect(visible(getByTestId('hud-stability'))).toContain('12/20');
		expect(visible(getByTestId('hud-kings'))).toContain('1/4');
		expect(visible(getByTestId('hud-aces'))).toContain('2/4need14+');
		expect(visible(getByTestId('hud-tokens'))).toContain('9left');
		expect(visible(getByTestId('hud-cards'))).toContain('38');
		expect(getByTestId('hud-roll').textContent).toContain('8');
	});

	it('speaks each cell as a sentence', () => {
		gameState.tower = 14;
		gameState.kingsRevealed = 2;
		gameState.acesRevealed = 2;
		const { getByTestId } = render(StatusHUD);
		expect(text(getByTestId('hud-stability').querySelector('.sr-only'))).toBe('Stability 14 of 20');
		expect(text(getByTestId('hud-kings').querySelector('.sr-only'))).toBe('Kings: 2 of 4 revealed');
		expect(text(getByTestId('hud-aces').querySelector('.sr-only'))).toBe(
			'Aces 2 of 4, Salvation needs 14 or more'
		);
		expect(text(getByTestId('hud-tokens').querySelector('.sr-only'))).toBe(
			'Tokens locked: find the Ace of Hearts'
		);
	});
});

describe('StabilityCell', () => {
	it('shows n/20, a scaled bar and the tier', () => {
		gameState.tower = 14;
		const { getByTestId } = render(StabilityCell);
		const cell = getByTestId('hud-stability');
		expect(visible(cell)).toContain('14/20');
		expect(cell.querySelector('.fill').getAttribute('style')).toContain('scaleX(0.7)');
		expect(cell.classList.contains('tier-caution')).toBe(true);
	});

	it('goes critical at 4 or less', () => {
		gameState.tower = 3;
		const { getByTestId } = render(StabilityCell);
		expect(getByTestId('hud-stability').classList.contains('tier-critical')).toBe(true);
	});

	it('flashes for one beat when stability drops, and not when it rises', () => {
		vi.useFakeTimers();
		const { getByTestId } = render(StabilityCell);
		const cell = getByTestId('hud-stability');
		flushSync();
		gameState.tower = 17;
		flushSync();
		expect(cell.classList.contains('hit')).toBe(true);
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT);
		flushSync();
		expect(cell.classList.contains('hit')).toBe(false);
		gameState.tower = 18;
		flushSync();
		expect(cell.classList.contains('hit')).toBe(false);
	});

	it('still clears the flash when stability rises again during it', () => {
		vi.useFakeTimers();
		const { getByTestId } = render(StabilityCell);
		const cell = getByTestId('hud-stability');
		flushSync();
		gameState.tower = 15;
		flushSync();
		gameState.tower = 16;
		flushSync();
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT);
		flushSync();
		expect(cell.classList.contains('hit')).toBe(false);
	});
});

describe('KingsCell', () => {
	it('shows n/4 and lights that many skulls', () => {
		gameState.kingsRevealed = 3;
		const { getByTestId } = render(KingsCell);
		const cell = getByTestId('hud-kings');
		expect(visible(cell)).toContain('3/4');
		expect(cell.querySelectorAll('.skull.lit').length).toBe(3);
		expect(cell.classList.contains('urgent')).toBe(true);
		expect(cell.dataset.level).toBe('3');
	});

	it('is not urgent below 3 Kings', () => {
		gameState.kingsRevealed = 2;
		const { getByTestId } = render(KingsCell);
		expect(getByTestId('hud-kings').classList.contains('urgent')).toBe(false);
	});

	it('counts a King that is on screen but not yet confirmed', () => {
		gameState.kingsRevealed = 1;
		gameState.pendingUpdates.kingsChange = 1;
		const { getByTestId } = render(KingsCell);
		expect(getByTestId('hud-kings').querySelectorAll('.skull.lit').length).toBe(2);
	});

	it('ignites the new skull for one beat when a King is drawn', () => {
		vi.useFakeTimers();
		gameState.kingsRevealed = 1;
		const { getByTestId } = render(KingsCell);
		const cell = getByTestId('hud-kings');
		flushSync();
		gameState.pendingUpdates.kingsChange = 1;
		flushSync();
		const skulls = cell.querySelectorAll('.skull');
		expect(skulls[1].classList.contains('igniting')).toBe(true);
		expect(skulls[0].classList.contains('igniting')).toBe(false);
		expect(cell.classList.contains('finale')).toBe(false);
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT);
		flushSync();
		expect(cell.querySelector('.skull.igniting')).toBeNull();
	});

	it('plays the finale at the fourth King and fits it in the 1.5s maximum', () => {
		vi.useFakeTimers();
		gameState.kingsRevealed = 3;
		const { getByTestId } = render(KingsCell);
		const cell = getByTestId('hud-kings');
		flushSync();
		gameState.pendingUpdates.kingsChange = 1;
		flushSync();
		expect(cell.classList.contains('finale')).toBe(true);
		expect(cell.querySelectorAll('.skull.lit').length).toBe(4);
		// hold + 3 staggers + one beat = the sequence maximum
		const style = cell.getAttribute('style');
		const delay = Number(style.match(/--finale-delay: (\d+)ms/)[1]);
		const stagger = Number(style.match(/--finale-stagger: (\d+)ms/)[1]);
		expect(stagger).toBe(250);
		expect(delay + 3 * stagger + ANIMATION_DURATION.BEAT).toBe(ANIMATION_DURATION.SEQUENCE_MAX);
		vi.advanceTimersByTime(ANIMATION_DURATION.SEQUENCE_MAX);
		flushSync();
		expect(cell.classList.contains('finale')).toBe(false);
	});

	it('does not flare when a King goes back into the deck', () => {
		gameState.kingsRevealed = 2;
		const { getByTestId } = render(KingsCell);
		const cell = getByTestId('hud-kings');
		flushSync();
		gameState.kingsRevealed = 1;
		flushSync();
		expect(cell.querySelector('.skull.igniting')).toBeNull();
		expect(cell.querySelectorAll('.skull.lit').length).toBe(1);
	});
});

describe('AcesCell', () => {
	it('shows no Salvation need before the first Ace', () => {
		const { getByTestId, queryByTestId } = render(AcesCell);
		expect(visible(getByTestId('hud-aces'))).toContain('0/4');
		expect(queryByTestId('aces-need')).toBeNull();
	});

	it('shows "need 14+" at two Aces and "auto" at four', () => {
		gameState.acesRevealed = 2;
		const first = render(AcesCell);
		expect(first.getByTestId('aces-need').textContent).toBe('need 14+');
		first.unmount();
		gameState.acesRevealed = 4;
		const second = render(AcesCell);
		expect(second.getByTestId('aces-need').textContent).toBe('auto');
	});

	it('counts an Ace that is on screen but not yet confirmed, and pops', () => {
		const { getByTestId } = render(AcesCell);
		flushSync();
		gameState.pendingUpdates.aceChange = 1;
		flushSync();
		const cell = getByTestId('hud-aces');
		expect(visible(cell)).toContain('1/4need17+');
		expect(cell.classList.contains('gained')).toBe(true);
	});
});

describe('TokensCell', () => {
	it('is locked before the Ace of Hearts and says how to unlock it', () => {
		const { getByTestId } = render(TokensCell);
		const cell = getByTestId('hud-tokens');
		expect(cell.classList.contains('locked')).toBe(true);
		expect(cell.querySelector('.lock')).toBeTruthy();
		expect(cell.textContent).toContain('find A♥');
	});

	it('shows tokens left once the Ace of Hearts is revealed, past 10 too', () => {
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 12;
		const { getByTestId } = render(TokensCell);
		expect(visible(getByTestId('hud-tokens'))).toContain('12left');
	});

	it('plays the Salvation moment once when it unlocks', () => {
		vi.useFakeTimers();
		const { getByTestId } = render(TokensCell);
		const cell = getByTestId('hud-tokens');
		flushSync();
		gameState.aceOfHeartsRevealed = true;
		flushSync();
		expect(cell.classList.contains('unlocking')).toBe(true);
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT + ANIMATION_DURATION.ENTER);
		flushSync();
		expect(cell.classList.contains('unlocking')).toBe(false);
	});
});

describe('RollCell', () => {
	it('shows the number, or -- before the first roll', () => {
		const first = render(RollCell);
		expect(first.getByTestId('hud-roll').querySelector('.hud-value').textContent).toBe('--');
		first.unmount();
		gameState.diceRoll = 13;
		const second = render(RollCell);
		expect(second.getByTestId('hud-roll').querySelector('.hud-value').textContent).toBe('13');
	});

	it('shows a 2d20 badge with an accessible name while Lucid or Surreal', () => {
		gameState.isSurreal = true;
		const { getByRole } = render(RollCell);
		const badge = getByRole('img', { name: /Surreal: your next roll uses two d20/ });
		expect(badge.textContent).toBe('2d20↓');
		expect(badge.getAttribute('title')).toBe(badge.getAttribute('aria-label'));
	});

	it('has no badge on a plain roll', () => {
		gameState.diceRoll = 9;
		const { queryByTestId } = render(RollCell);
		expect(queryByTestId('roll-badge')).toBeNull();
	});

	it('says which die counted when the last roll was 2d20', () => {
		gameState.diceRoll = 15;
		diceState.lastRoll = { rolls: [15, 6], finalValue: 15, isLucid: true, isSurreal: false };
		const { getByTestId } = render(RollCell);
		const cell = getByTestId('hud-roll');
		expect(cell.querySelector('.hud-value').getAttribute('title')).toBe('Two dice: high of 15, 6');
		expect(text(cell.querySelector('.sr-only'))).toBe('Last roll 15 (high of 15, 6)');
	});
});
