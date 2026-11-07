/**
 * HUD tests: one row, mirrored around the middle (Stability, Kings, Roll, Cards, Aces,
 * Tokens), every cell the same three rows (label, value, foot). Stability n/20 and its tiers,
 * Kings n/4 with the ignite and the fourth-King finale, the last roll on a seven-segment
 * display with the Lucid and Surreal icons under it, cards left over a meter, Aces n/4 with a
 * pip per suit, and Tokens n/N over a bar, locked until the Ace of Hearts.
 */
import { flushSync } from 'svelte';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';

import { gameState } from '../../stores/gameStore.svelte.js';
import { diceState } from '../../stores/diceStore.svelte.js';
import { ANIMATION_DURATION } from '../../constants/animations.js';
import {
	stabilityTier,
	describeTwoDiceRoll,
	acesSummary,
	aceSuits,
	fourAcesRule,
	tokenMeter,
	rollModifiers
} from './hudTiers.js';
import StatusHUD from './StatusHUD.svelte';
import StabilityCell from './StabilityCell.svelte';
import KingsCell from './KingsCell.svelte';
import AcesCell from './AcesCell.svelte';
import TokensCell from './TokensCell.svelte';
import RollCell from './RollCell.svelte';
import CardsCell from './CardsCell.svelte';

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
	gameState.log = [];
	gameState.config = null;
	diceState.lastRoll = null;
});

const ace = (suit) => ({ card: 'A', suit });
const lit = (cell) => [...cell.querySelectorAll('.pip.lit')].map((pip) => pip.dataset.suit);

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
		expect(acesSummary(4)).toEqual({ count: 4, need: 'all' });
		expect(acesSummary(7).count).toBe(4);
	});

	it('says what all four Aces mean by difficulty: the final check, or automatic Salvation on Hard', () => {
		const final = 'survive the final Stability check and you escape';
		expect(fourAcesRule(0)).toBe(final);
		expect(fourAcesRule(1)).toBe(final);
		expect(fourAcesRule(2)).toBe('Salvation is automatic after a Stability check');
		// Anything else reads as Normal
		expect(fourAcesRule(undefined)).toBe(final);
		expect(fourAcesRule(7)).toBe(final);
	});

	it('lights the Aces by suit, the Ace of Hearts first, and always agrees with the count', () => {
		expect(aceSuits({ count: 0 }).map((pip) => pip.suit)).toEqual([
			'hearts',
			'spades',
			'diamonds',
			'clubs'
		]);
		expect(aceSuits({ count: 0 }).some((pip) => pip.lit)).toBe(false);
		// From the cards drawn (the log includes a card still on screen)
		const drawn = aceSuits({
			count: 2,
			log: [ace('clubs'), { card: '7', suit: 'hearts' }, ace('spades')]
		});
		expect(drawn.filter((pip) => pip.lit).map((pip) => pip.suit)).toEqual(['spades', 'clubs']);
		// Easy mode takes the Ace of Hearts out of the deck and counts it as found
		const easy = aceSuits({ count: 1, aceOfHeartsRevealed: true, log: [] });
		expect(easy.filter((pip) => pip.lit).map((pip) => pip.suit)).toEqual(['hearts']);
		// A state that knows only the count lights the other suits in order
		const forced = aceSuits({ count: 3, aceOfHeartsRevealed: true });
		expect(forced.filter((pip) => pip.lit).map((pip) => pip.suit)).toEqual([
			'hearts',
			'spades',
			'diamonds'
		]);
	});

	it('reads the token bar as tokens left out of the start, full and over past it (Hard)', () => {
		expect(tokenMeter(10, 10)).toEqual({ fraction: 1, over: 0 });
		expect(tokenMeter(7, 10)).toEqual({ fraction: 0.7, over: 0 });
		expect(tokenMeter(0, 10)).toEqual({ fraction: 0, over: 0 });
		expect(tokenMeter(12, 10)).toEqual({ fraction: 1, over: 2 });
		expect(tokenMeter(-1, 10).fraction).toBe(0);
		expect(tokenMeter(5, 0).fraction).toBe(0.5); // no start: the default 10
	});

	it('always gives both roll modifiers, each on or off, with the state in its label', () => {
		const off = rollModifiers({ isLucid: false, isSurreal: false });
		expect(off.map((m) => [m.kind, m.on])).toEqual([
			['lucid', false],
			['surreal', false]
		]);
		expect(off[0].label).toBe(
			'Lucid (off): a natural 20 makes the next roll keep the higher of two dice'
		);
		expect(off[1].label).toBe(
			'Surreal (off): a natural 1 makes the next roll keep the lower of two dice'
		);
		const lucid = rollModifiers({ isLucid: true });
		expect(lucid[0]).toEqual({
			kind: 'lucid',
			on: true,
			label: 'Lucid: next roll keeps the higher of two dice'
		});
		expect(lucid[1].on).toBe(false);
		const surreal = rollModifiers({ isSurreal: true });
		expect(surreal[1]).toEqual({
			kind: 'surreal',
			on: true,
			label: 'Surreal: next roll keeps the lower of two dice'
		});
		expect(surreal[0].on).toBe(false);
		// The two never stack: Lucid wins if a state somehow has both
		const both = rollModifiers({ isLucid: true, isSurreal: true });
		expect(both.map((m) => m.on)).toEqual([true, false]);
	});
});

describe('StatusHUD', () => {
	it('is one labelled row of six cells, mirrored around the roll and the deck', () => {
		const { getByTestId, getByRole } = render(StatusHUD);
		expect(getByRole('group', { name: 'Game status' })).toBe(getByTestId('hud'));
		const cells = getByTestId('hud').querySelectorAll(':scope > .hud-cell');
		expect([...cells].map((c) => c.dataset.testid)).toEqual([
			'hud-stability',
			'hud-kings',
			'hud-roll',
			'hud-cards',
			'hud-aces',
			'hud-tokens'
		]);
		// The outer pair are meters, the next pair count four icons
		const [stability, kings, , , aces, tokens] = cells;
		for (const meter of [stability, tokens]) expect(meter.querySelector('.bar .fill')).toBeTruthy();
		for (const counter of [kings, aces])
			expect(counter.querySelectorAll('.hud-icons > *, .skulls > *').length).toBe(4);
		// Every cell is the same three rows: the label, then a readout of the value over the
		// foot (the bar, the icons, the modifiers), so the foot is pinned to one bottom line
		for (const cell of cells) {
			const readout = cell.querySelector(':scope > .hud-readout');
			expect(readout, cell.dataset.testid).toBeTruthy();
			const rows = [...readout.children];
			expect(rows.length, cell.dataset.testid).toBe(2);
			expect(rows[0].matches('.hud-value, .led'), cell.dataset.testid).toBe(true);
			expect(rows[1].classList.contains('hud-foot'), cell.dataset.testid).toBe(true);
		}
	});

	it('shows the key numbers', () => {
		gameState.tower = 12;
		gameState.kingsRevealed = 1;
		gameState.acesRevealed = 2;
		gameState.aceOfHeartsRevealed = true;
		gameState.log = [ace('hearts'), ace('diamonds')];
		gameState.tokens = 9;
		gameState.diceRoll = 8;
		gameState.deck = new Array(38).fill({});
		const { getByTestId } = render(StatusHUD);
		expect(visible(getByTestId('hud-stability'))).toContain('12/20');
		expect(visible(getByTestId('hud-kings'))).toContain('1/4');
		expect(visible(getByTestId('hud-aces'))).toContain('2/4');
		expect(lit(getByTestId('hud-aces'))).toEqual(['hearts', 'diamonds']);
		expect(visible(getByTestId('hud-tokens'))).toContain('9/10');
		expect(visible(getByTestId('hud-cards'))).toContain('38');
		expect(getByTestId('hud-roll').querySelector('.led-on').textContent).toBe('8');
	});

	it('speaks each cell as a sentence', () => {
		gameState.tower = 14;
		gameState.kingsRevealed = 2;
		gameState.acesRevealed = 2;
		gameState.log = [ace('spades'), ace('clubs')];
		gameState.deck = new Array(30).fill({});
		const { getByTestId } = render(StatusHUD);
		expect(text(getByTestId('hud-stability').querySelector('.sr-only'))).toBe('Stability 14 of 20');
		expect(text(getByTestId('hud-kings').querySelector('.sr-only'))).toBe('Kings: 2 of 4 revealed');
		expect(text(getByTestId('hud-cards').querySelector('.sr-only'))).toBe('30 of 52 cards left');
		expect(text(getByTestId('hud-aces').querySelector('.sr-only'))).toBe(
			'Aces 2 of 4 (spades, clubs), Salvation needs 14 or more'
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

	it('un-ignites the skull of a King sent back into the deck, for one beat', () => {
		vi.useFakeTimers();
		gameState.kingsRevealed = 2;
		const { getByTestId } = render(KingsCell);
		const cell = getByTestId('hud-kings');
		flushSync();
		gameState.kingsRevealed = 1;
		flushSync();
		// The count drops at once, and the skull that went dark runs the ignite in reverse
		expect(visible(cell)).toContain('1/4');
		const skulls = cell.querySelectorAll('.skull');
		expect(cell.querySelectorAll('.skull.lit').length).toBe(1);
		expect(cell.querySelector('.skull.igniting')).toBeNull();
		expect([...skulls].map((skull) => skull.classList.contains('dimming'))).toEqual([
			false,
			true,
			false,
			false
		]);
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT);
		flushSync();
		expect(cell.querySelector('.skull.dimming')).toBeNull();
		expect(cell.querySelectorAll('.skull.lit').length).toBe(1);
	});

	it('stops an un-ignite when a King is drawn again during it', () => {
		vi.useFakeTimers();
		gameState.kingsRevealed = 2;
		const { getByTestId } = render(KingsCell);
		const cell = getByTestId('hud-kings');
		flushSync();
		gameState.kingsRevealed = 1;
		flushSync();
		gameState.pendingUpdates.kingsChange = 1;
		flushSync();
		expect(cell.querySelector('.skull.dimming')).toBeNull();
		expect(cell.querySelectorAll('.skull')[1].classList.contains('igniting')).toBe(true);
	});
});

describe('AcesCell', () => {
	it('shows 0/4, four dark suits and no Salvation need before the first Ace', () => {
		const { getByTestId } = render(AcesCell);
		const cell = getByTestId('hud-aces');
		expect(visible(cell)).toBe('0/4');
		expect([...cell.querySelectorAll('.pip')].map((pip) => pip.dataset.suit)).toEqual([
			'hearts',
			'spades',
			'diamonds',
			'clubs'
		]);
		expect(lit(cell)).toEqual([]);
		expect(cell.dataset.need).toBe('');
		expect(text(cell.querySelector('.sr-only'))).toBe('Aces 0 of 4, no Salvation roll yet');
	});

	it('keeps what Salvation needs in the tooltip and the spoken text: 14+ at two, the final check at four', () => {
		gameState.acesRevealed = 2;
		gameState.aceOfHeartsRevealed = true;
		gameState.log = [ace('hearts'), ace('spades')];
		const first = render(AcesCell);
		let cell = first.getByTestId('hud-aces');
		expect(cell.getAttribute('title')).toBe('Salvation needs 14+');
		expect(text(cell.querySelector('.sr-only'))).toContain('Salvation needs 14 or more');
		expect(lit(cell)).toEqual(['hearts', 'spades']);
		first.unmount();
		gameState.acesRevealed = 4;
		gameState.log = ['hearts', 'spades', 'diamonds', 'clubs'].map(ace);
		const second = render(AcesCell);
		cell = second.getByTestId('hud-aces');
		expect(cell.getAttribute('title')).toBe(
			'All four Aces: survive the final Stability check and you escape'
		);
		expect(text(cell.querySelector('.sr-only'))).toBe(
			'Aces 4 of 4 (hearts, spades, diamonds, clubs), survive the final Stability check and you escape'
		);
		expect(lit(cell)).toEqual(['hearts', 'spades', 'diamonds', 'clubs']);
	});

	it('on Hard, four Aces mean automatic Salvation after a Stability check, not the end', () => {
		gameState.acesRevealed = 4;
		gameState.aceOfHeartsRevealed = true;
		gameState.log = ['hearts', 'spades', 'diamonds', 'clubs'].map(ace);
		gameState.config = { options: { difficulty: 2 } };
		const { getByTestId } = render(AcesCell);
		const cell = getByTestId('hud-aces');
		expect(cell.getAttribute('title')).toBe(
			'All four Aces: Salvation is automatic after a Stability check'
		);
		expect(text(cell.querySelector('.sr-only'))).toContain(
			'Salvation is automatic after a Stability check'
		);
		// The difficulty is live: the text follows it
		gameState.config = { options: { difficulty: 1 } };
		flushSync();
		expect(cell.getAttribute('title')).toBe(
			'All four Aces: survive the final Stability check and you escape'
		);
	});

	it('counts an Ace that is on screen but not yet confirmed: pops and ignites its suit', () => {
		vi.useFakeTimers();
		const { getByTestId } = render(AcesCell);
		flushSync();
		gameState.log = [ace('diamonds')];
		gameState.pendingUpdates.aceChange = 1;
		flushSync();
		const cell = getByTestId('hud-aces');
		expect(visible(cell)).toBe('1/4');
		expect(lit(cell)).toEqual(['diamonds']);
		expect(cell.getAttribute('title')).toBe('Salvation needs 17+');
		expect(cell.classList.contains('gained')).toBe(true);
		expect(cell.querySelector('.pip.igniting').dataset.suit).toBe('diamonds');
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT);
		flushSync();
		expect(cell.classList.contains('gained')).toBe(false);
		expect(cell.querySelector('.pip.igniting')).toBeNull();
	});

	it('shows the Ace of Hearts as the key, gold even before it is found', () => {
		const { getByTestId } = render(AcesCell);
		const heart = getByTestId('hud-aces').querySelector('.pip[data-suit="hearts"]');
		expect(heart.classList.contains('hearts')).toBe(true);
		expect(heart.classList.contains('lit')).toBe(false);
	});
});

describe('CardsCell', () => {
	it('shows the cards left over a meter of the 52-card deck', () => {
		const { getByTestId } = render(CardsCell, { count: 39 });
		const cell = getByTestId('hud-cards');
		expect(visible(cell)).toBe('39');
		expect(cell.querySelector('.fill').getAttribute('style')).toContain('scaleX(0.75)');
		expect(text(cell.querySelector('.sr-only'))).toBe('39 of 52 cards left');
	});
});

describe('TokensCell', () => {
	it('is locked before the Ace of Hearts: the same n/N and bar, dimmed, with a lock', () => {
		const { getByTestId } = render(TokensCell);
		const cell = getByTestId('hud-tokens');
		expect(cell.classList.contains('locked')).toBe(true);
		expect(cell.querySelector('.hud-label .lock')).toBeTruthy();
		expect(visible(cell)).toContain('10/10');
		expect(cell.querySelector('.fill').getAttribute('style')).toContain('scaleX(1)');
		expect(cell.getAttribute('title')).toBe('Find the Ace of Hearts to unlock Salvation');
		expect(text(cell.querySelector('.sr-only'))).toBe('Tokens locked: find the Ace of Hearts');
	});

	it('shows tokens left out of the start over a bar once the Ace of Hearts is revealed', () => {
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 6;
		gameState.config = { options: { startingTokens: 8 } };
		const { getByTestId } = render(TokensCell);
		const cell = getByTestId('hud-tokens');
		expect(cell.classList.contains('locked')).toBe(false);
		expect(cell.querySelector('.lock')).toBeNull();
		expect(visible(cell)).toContain('6/8');
		expect(cell.querySelector('.fill').getAttribute('style')).toContain('scaleX(0.75)');
		expect(text(cell.querySelector('.sr-only'))).toBe('6 of 8 Tokens left');
	});

	it('keeps the bar full and marks it when tokens pass the start (a failed Salvation on Hard)', () => {
		gameState.aceOfHeartsRevealed = true;
		gameState.tokens = 12;
		const { getByTestId } = render(TokensCell);
		const cell = getByTestId('hud-tokens');
		expect(visible(cell)).toContain('12/10');
		expect(cell.classList.contains('over')).toBe(true);
		expect(cell.querySelector('.fill').getAttribute('style')).toContain('scaleX(1)');
		expect(text(cell.querySelector('.sr-only'))).toBe(
			'12 of 10 Tokens left, 2 more than at the start'
		);
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
	it('shows the number on two seven-segment digits, or -- before the first roll', () => {
		const first = render(RollCell);
		const idle = first.getByTestId('hud-roll');
		expect(idle.querySelector('.led-on').textContent).toBe('--');
		expect(idle.classList.contains('idle')).toBe(true);
		// The unlit segments of both digits sit behind the number
		expect(idle.querySelector('.led-off').textContent).toBe('88');
		first.unmount();
		gameState.diceRoll = 13;
		const second = render(RollCell);
		expect(second.getByTestId('hud-roll').querySelector('.led-on').textContent).toBe('13');
		second.unmount();
		gameState.diceRoll = 4;
		const third = render(RollCell);
		expect(third.getByTestId('hud-roll').querySelector('.led-on').textContent).toBe('4');
	});

	it('always shows both modifier icons under the number, off (dim, and said so) on a plain roll', () => {
		gameState.diceRoll = 9;
		const { getByTestId, getByRole } = render(RollCell);
		const cell = getByTestId('hud-roll');
		const icons = [...cell.querySelectorAll('.hud-foot .mod')];
		expect(icons.map((icon) => icon.dataset.testid)).toEqual(['roll-lucid', 'roll-surreal']);
		expect(icons.some((icon) => icon.classList.contains('on'))).toBe(false);
		const lucid = getByRole('img', {
			name: 'Lucid (off): a natural 20 makes the next roll keep the higher of two dice'
		});
		expect(lucid).toBe(getByTestId('roll-lucid'));
		expect(lucid.getAttribute('title')).toBe(lucid.getAttribute('aria-label'));
		expect(
			getByRole('img', {
				name: 'Surreal (off): a natural 1 makes the next roll keep the lower of two dice'
			})
		).toBe(getByTestId('roll-surreal'));
		// The icons are drawn, not spoken: the names carry everything
		for (const icon of icons)
			expect(icon.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
	});

	it('lights the modifier that is on, with its name and the same tooltip', () => {
		gameState.isSurreal = true;
		const { getByRole, getByTestId } = render(RollCell);
		const surreal = getByRole('img', { name: 'Surreal: next roll keeps the lower of two dice' });
		expect(surreal).toBe(getByTestId('roll-surreal'));
		expect(surreal.classList.contains('on')).toBe(true);
		expect(surreal.getAttribute('title')).toBe(surreal.getAttribute('aria-label'));
		expect(getByTestId('roll-lucid').classList.contains('on')).toBe(false);
		expect(getByTestId('roll-lucid').getAttribute('aria-label')).toContain('(off)');
	});

	it('ignites a modifier for one beat when it comes on, and only dims it when it is used up', () => {
		vi.useFakeTimers();
		const { getByTestId } = render(RollCell);
		const lucid = getByTestId('roll-lucid');
		flushSync();
		expect(lucid.classList.contains('igniting')).toBe(false);
		gameState.isLucid = true;
		flushSync();
		expect(lucid.classList.contains('on')).toBe(true);
		expect(lucid.classList.contains('igniting')).toBe(true);
		expect(getByTestId('roll-surreal').classList.contains('igniting')).toBe(false);
		vi.advanceTimersByTime(ANIMATION_DURATION.BEAT);
		flushSync();
		expect(lucid.classList.contains('on')).toBe(true);
		expect(lucid.classList.contains('igniting')).toBe(false);
		// Used up by the next roll: off again, no flare
		gameState.isLucid = false;
		flushSync();
		expect(lucid.classList.contains('on')).toBe(false);
		expect(lucid.classList.contains('igniting')).toBe(false);
		// A natural 1 on that roll: Surreal ignites in its turn
		gameState.isSurreal = true;
		flushSync();
		expect(getByTestId('roll-surreal').classList.contains('igniting')).toBe(true);
	});

	it('does not ignite a modifier that is already on when the HUD mounts (a resumed game)', () => {
		gameState.isLucid = true;
		const { getByTestId } = render(RollCell);
		flushSync();
		const lucid = getByTestId('roll-lucid');
		expect(lucid.classList.contains('on')).toBe(true);
		expect(lucid.classList.contains('igniting')).toBe(false);
	});

	it('says which die counted when the last roll was 2d20', () => {
		gameState.diceRoll = 15;
		diceState.lastRoll = { rolls: [15, 6], finalValue: 15, isLucid: true, isSurreal: false };
		const { getByTestId } = render(RollCell);
		const cell = getByTestId('hud-roll');
		expect(cell.querySelector('.led').getAttribute('title')).toBe('Two dice: high of 15, 6');
		expect(text(cell.querySelector('.sr-only'))).toBe('Last roll 15 (high of 15, 6)');
	});
});
