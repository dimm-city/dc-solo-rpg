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
	rollModifiers,
	kingsTier,
	rollTier,
	cardsTier,
	acesTier,
	tokensTier,
	stabilitySpoken,
	kingsSpoken,
	rollSpoken,
	cardsSpoken,
	acesSpoken,
	acesTooltip,
	tokensSpoken
} from './hudTiers.js';
import StatusHUD from './StatusHUD.svelte';
import StabilityCell from './StabilityCell.svelte';
import KingsCell from './KingsCell.svelte';
import AcesCell from './AcesCell.svelte';
import TokensCell from './TokensCell.svelte';
import RollCell from './RollCell.svelte';
import CardsCell from './CardsCell.svelte';

const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
/** The number a tile shows: its lit digits, slash and max, without the unlit "8"s */
const visible = (el) => {
	const value = el.querySelector('.hud-value').cloneNode(true);
	for (const ghost of value.querySelectorAll('.led-off')) ghost.remove();
	return value.textContent.replace(/\s/g, '');
};

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
	diceState.isRolling = false;
	diceState.staticRoll = null;
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

	it('says what all four Aces mean by difficulty: the final check on Easy, else a Stability check per Salvation', () => {
		const at = (difficulty) => ({ config: { options: { difficulty } } });
		const automatic = 'each Salvation is a Stability check; hold on and a Token comes off';
		expect(fourAcesRule(at(0))).toBe('survive the final Stability check and you escape');
		expect(fourAcesRule(at(1))).toBe(automatic);
		expect(fourAcesRule(at(2))).toBe(automatic);
		// Anything else reads as Normal
		expect(fourAcesRule(at(undefined))).toBe(automatic);
		expect(fourAcesRule(at(7))).toBe(automatic);
		expect(fourAcesRule(null)).toBe(automatic);
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
		expect(off[0].label).toBe('Lucid: off');
		expect(off[1].label).toBe('Surreal: off');
		const lucid = rollModifiers({ isLucid: true });
		expect(lucid[0]).toEqual({
			kind: 'lucid',
			on: true,
			label: 'Lucid: your next roll uses two dice and keeps the higher.'
		});
		expect(lucid[1].on).toBe(false);
		const surreal = rollModifiers({ isSurreal: true });
		expect(surreal[1]).toEqual({
			kind: 'surreal',
			on: true,
			label: 'Surreal: your next roll uses two dice and keeps the lower.'
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
		// (Tokens shows its lock in the bar's place until the Ace of Hearts)
		expect(stability.querySelector('.bar .fill')).toBeTruthy();
		expect(tokens.querySelector('.hud-foot.lock')).toBeTruthy();
		for (const counter of [kings, aces])
			expect(counter.querySelectorAll('.hud-icons > *, .skulls > *').length).toBe(4);
		// Every cell is the same three rows: the label, then a readout of the value over the
		// foot (the bar, the icons, the modifiers), so the foot is pinned to one bottom line
		for (const cell of cells) {
			const readout = cell.querySelector(':scope > .hud-readout');
			expect(readout, cell.dataset.testid).toBeTruthy();
			const rows = [...readout.children];
			expect(rows.length, cell.dataset.testid).toBe(2);
			expect(rows[0].matches('.hud-value'), cell.dataset.testid).toBe(true);
			expect(rows[1].classList.contains('hud-foot'), cell.dataset.testid).toBe(true);
		}
	});

	it('draws every number on the LED face over unlit "8"s, with a mono slash and the max (DP-1-01)', () => {
		gameState.aceOfHeartsRevealed = true;
		gameState.diceRoll = 7;
		const { getByTestId } = render(StatusHUD);
		const ghosts = {
			'hud-stability': ['88', '20'],
			'hud-kings': ['8', '4'],
			'hud-roll': ['88', null],
			'hud-cards': ['88', null],
			'hud-aces': ['8', '4'],
			'hud-tokens': ['88', '10']
		};
		for (const [testid, [ghost, max]] of Object.entries(ghosts)) {
			const value = getByTestId(testid).querySelector('.hud-value');
			const field = value.querySelector(':scope > .led-field');
			expect(field.querySelector('.led-off').textContent, testid).toBe(ghost);
			expect(field.querySelector('.led-off').getAttribute('aria-hidden'), testid).toBe('true');
			expect(field.querySelector('.led-on'), testid).toBeTruthy();
			expect(value.querySelector('.hud-max')?.textContent ?? null, testid).toBe(max);
			if (max) expect(value.querySelector('.hud-slash').textContent, testid).toBe('/');
		}
	});

	it('gives every cell one tint layer, first, and its tier (DP-1-02)', () => {
		const { getByTestId } = render(StatusHUD);
		const cells = getByTestId('hud').querySelectorAll(':scope > .hud-cell');
		for (const cell of cells) {
			expect(cell.firstElementChild.classList.contains('tint'), cell.dataset.testid).toBe(true);
			expect(cell.querySelectorAll('.tint').length, cell.dataset.testid).toBe(1);
			expect(cell.dataset.tier, cell.dataset.testid).toBeTruthy();
		}
		expect([...cells].map((cell) => cell.dataset.tier)).toEqual([
			'steady',
			'calm',
			'idle',
			'full',
			'none',
			'locked'
		]);
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
		const spoken = (testid) => text(getByTestId(testid).querySelector('.sr-only'));
		expect(spoken('hud-stability')).toBe('Stability 14 of 20, falling');
		expect(spoken('hud-kings')).toBe('Kings 2 of 4');
		expect(spoken('hud-roll')).toBe('Roll: none yet');
		expect(spoken('hud-cards')).toBe('Cards 30 of 52 left');
		expect(spoken('hud-aces')).toBe('Aces 2 of 4, Salvation locked until the Ace of Hearts');
		expect(spoken('hud-tokens')).toBe('Tokens locked until the Ace of Hearts');
		// Each sentence starts with the tile's visible label, and the label itself is not read twice
		for (const testid of ['hud-stability', 'hud-kings', 'hud-roll', 'hud-cards', 'hud-aces']) {
			const label = getByTestId(testid).querySelector('.hud-label');
			expect(spoken(testid).toLowerCase().startsWith(label.textContent.toLowerCase())).toBe(true);
			expect(label.getAttribute('aria-hidden')).toBe('true');
		}
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
		expect(text(cell.querySelector('.sr-only'))).toBe('Aces 0 of 4');
		expect(cell.getAttribute('title')).toBe('Each Ace makes Salvation easier');
	});

	it('keeps what Salvation needs in the tooltip and the spoken text: 14+ at two, no target at four', () => {
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
			'All four Aces: each Salvation is a Stability check; hold on and a Token comes off'
		);
		expect(text(cell.querySelector('.sr-only'))).toBe(
			'Aces 4 of 4, Salvation has no target: each roll is a Stability check'
		);
		expect(lit(cell)).toEqual(['hearts', 'spades', 'diamonds', 'clubs']);
	});

	it('on Easy, four Aces mean the final Stability check; on Normal and Hard, a Stability check per Salvation', () => {
		gameState.acesRevealed = 4;
		gameState.aceOfHeartsRevealed = true;
		gameState.log = ['hearts', 'spades', 'diamonds', 'clubs'].map(ace);
		gameState.config = { options: { difficulty: 0 } };
		const { getByTestId } = render(AcesCell);
		const cell = getByTestId('hud-aces');
		expect(cell.getAttribute('title')).toBe(
			'All four Aces: survive the final Stability check and you escape'
		);
		expect(text(cell.querySelector('.sr-only'))).toContain(
			'survive the final Stability check and you escape'
		);
		// The difficulty is live: the text follows it
		for (const difficulty of [1, 2]) {
			gameState.config = { options: { difficulty } };
			flushSync();
			expect(cell.getAttribute('title')).toBe(
				'All four Aces: each Salvation is a Stability check; hold on and a Token comes off'
			);
			expect(cell.dataset.tier).toBe('four');
		}
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
		// An Ace before the Ace of Hearts: Salvation is still locked
		expect(cell.getAttribute('title')).toBe('Salvation unlocks with the Ace of Hearts');
		expect(cell.dataset.tier).toBe('locked');
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
		expect(text(cell.querySelector('.sr-only'))).toBe('Cards 39 of 52 left');
	});
});

describe('TokensCell', () => {
	it('is locked before the Ace of Hearts: the same n/N, dimmed, with the lock where the bar goes', () => {
		const { getByTestId } = render(TokensCell);
		const cell = getByTestId('hud-tokens');
		expect(cell.classList.contains('locked')).toBe(true);
		// The lock sits in the foot row, in place of the bar; the label carries no lock
		expect(cell.querySelector('.hud-readout > .hud-foot.lock')).toBeTruthy();
		expect(cell.querySelector('.hud-label .lock')).toBeNull();
		expect(cell.querySelector('.bar')).toBeNull();
		expect(visible(cell)).toBe('10/10');
		expect(cell.getAttribute('title')).toBe('Find the Ace of Hearts to unlock Salvation');
		expect(text(cell.querySelector('.sr-only'))).toBe('Tokens locked until the Ace of Hearts');
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
		expect(text(cell.querySelector('.sr-only'))).toBe('Tokens 6 of 8 left');
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
			'Tokens 12 of 10 left, 2 more than at the start'
		);
		expect(cell.dataset.tier).toBe('over');
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
		const lucid = getByRole('img', { name: 'Lucid: off' });
		expect(lucid).toBe(getByTestId('roll-lucid'));
		expect(lucid.getAttribute('title')).toBe(lucid.getAttribute('aria-label'));
		expect(getByRole('img', { name: 'Surreal: off' })).toBe(getByTestId('roll-surreal'));
		// The icons are drawn, not spoken: the names carry everything
		for (const icon of icons)
			expect(icon.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
	});

	it('lights the modifier that is on, with its name and the same tooltip', () => {
		gameState.isSurreal = true;
		const { getByRole, getByTestId } = render(RollCell);
		const surreal = getByRole('img', {
			name: 'Surreal: your next roll uses two dice and keeps the lower.'
		});
		expect(surreal).toBe(getByTestId('roll-surreal'));
		expect(surreal.classList.contains('on')).toBe(true);
		expect(surreal.getAttribute('title')).toBe(surreal.getAttribute('aria-label'));
		expect(getByTestId('roll-lucid').classList.contains('on')).toBe(false);
		expect(getByTestId('roll-lucid').getAttribute('aria-label')).toBe('Lucid: off');
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
		expect(text(cell.querySelector('.sr-only'))).toBe('Roll 15, high of 15 and 6');
	});

	it('shows "--" while a roll is in flight, and holds its tier until the result lands', () => {
		gameState.diceRoll = 20;
		gameState.isLucid = true;
		const { getByTestId } = render(RollCell);
		const cell = getByTestId('hud-roll');
		expect(cell.dataset.tier).toBe('lucid');
		expect(cell.querySelector('.led-on').textContent).toBe('20');
		// The roll starts: it uses Lucid up, and the dice are in the air
		gameState.isLucid = false;
		diceState.isRolling = true;
		flushSync();
		expect(cell.querySelector('.led-on').textContent).toBe('--');
		expect(cell.classList.contains('idle')).toBe(true);
		expect(cell.dataset.tier).toBe('lucid');
		expect(text(cell.querySelector('.sr-only'))).toBe('Roll: rolling');
		// The reduced-motion static roll counts as in flight too
		diceState.isRolling = false;
		diceState.staticRoll = { rolls: [9, 4], kept: 9 };
		flushSync();
		expect(cell.querySelector('.led-on').textContent).toBe('--');
		expect(cell.dataset.tier).toBe('lucid');
		// The result lands: the digits and the tier are worked out again
		diceState.staticRoll = null;
		gameState.diceRoll = 9;
		flushSync();
		expect(cell.querySelector('.led-on').textContent).toBe('9');
		expect(cell.dataset.tier).toBe('plain');
	});
});

describe('HUD tiers at every boundary (DP-1-02)', () => {
	it('Kings: calm 0-2, urgent 3-4', () => {
		expect([0, 1, 2, 3, 4].map(kingsTier)).toEqual(['calm', 'calm', 'calm', 'urgent', 'urgent']);
	});

	it('Roll: Lucid wins, then Surreal, then plain once rolled, else idle', () => {
		expect(rollTier({})).toBe('idle');
		expect(rollTier({ hasRolled: true })).toBe('plain');
		expect(rollTier({ hasRolled: true, isLucid: true })).toBe('lucid');
		expect(rollTier({ hasRolled: true, isSurreal: true })).toBe('surreal');
		expect(rollTier({ hasRolled: true, isLucid: true, isSurreal: true })).toBe('lucid');
		expect(rollTier({ isSurreal: true })).toBe('surreal');
	});

	it('Cards: full from 13, low 7-12, out at 6 or fewer', () => {
		expect([52, 13, 12, 7, 6, 1, 0].map(cardsTier)).toEqual([
			'full',
			'full',
			'low',
			'low',
			'out',
			'out',
			'out'
		]);
	});

	it('Aces: none, locked without the Ace of Hearts, one to three, four, and final on Easy', () => {
		expect(acesTier({ count: 0 })).toBe('none');
		expect(acesTier({ count: 0, heartsAce: true, fourthWins: true })).toBe('none');
		expect(acesTier({ count: 1 })).toBe('locked');
		expect(acesTier({ count: 3 })).toBe('locked');
		expect(acesTier({ count: 1, heartsAce: true })).toBe('one');
		expect(acesTier({ count: 2, heartsAce: true })).toBe('two');
		expect(acesTier({ count: 3, heartsAce: true })).toBe('three');
		expect(acesTier({ count: 4, heartsAce: true })).toBe('four');
		expect(acesTier({ count: 4, heartsAce: true, fourthWins: true })).toBe('final');
	});

	it('Tokens: locked, over, clear, near at 2 or fewer, half at half the start, else full', () => {
		const at = (tokens, unlocked = true, start = 10) => tokensTier({ unlocked, tokens, start });
		expect(at(10, false)).toBe('locked');
		expect(at(12, false)).toBe('locked');
		expect([12, 11, 10, 6, 5, 3, 2, 1, 0].map((n) => at(n))).toEqual([
			'over',
			'over',
			'full',
			'full',
			'half',
			'half',
			'near',
			'near',
			'clear'
		]);
		// An odd start: half is at or below half of it
		expect(at(4, true, 7)).toBe('full');
		expect(at(3, true, 7)).toBe('half');
	});
});

describe('HUD spoken text at every tier (DP-1-03)', () => {
	it('Stability: the value, then falling, low or critical', () => {
		expect(stabilitySpoken(20)).toBe('Stability 20 of 20');
		expect(stabilitySpoken(16)).toBe('Stability 16 of 20');
		expect(stabilitySpoken(15)).toBe('Stability 15 of 20, falling');
		expect(stabilitySpoken(10)).toBe('Stability 10 of 20, low');
		expect(stabilitySpoken(4)).toBe('Stability 4 of 20, critical');
		expect(stabilitySpoken(0)).toBe('Stability 0 of 20, critical');
	});

	it('Kings: one more ends the game at 3, all four at 4, with the game’s own label', () => {
		expect(kingsSpoken(0)).toBe('Kings 0 of 4');
		expect(kingsSpoken(2)).toBe('Kings 2 of 4');
		expect(kingsSpoken(3)).toBe('Kings 3 of 4, one more ends the game');
		expect(kingsSpoken(4)).toBe('Kings 4 of 4, all four revealed');
		expect(kingsSpoken(3, 'Wardens')).toBe('Wardens 3 of 4, one more ends the game');
	});

	it('Roll: none yet, rolling, the value, two dice and a natural', () => {
		expect(rollSpoken({})).toBe('Roll: none yet');
		expect(rollSpoken({ inFlight: true, value: 9 })).toBe('Roll: rolling');
		expect(rollSpoken({ value: 9 })).toBe('Roll 9');
		expect(rollSpoken({ value: 20 })).toBe('Roll 20, natural 20');
		expect(rollSpoken({ value: 1 })).toBe('Roll 1, natural 1');
		const low = { rolls: [6, 15], finalValue: 6, isLucid: false, isSurreal: true };
		expect(rollSpoken({ value: 6, last: low })).toBe('Roll 6, low of 6 and 15');
		const high = { rolls: [7, 20], finalValue: 20, isLucid: true, isSurreal: false };
		expect(rollSpoken({ value: 20, last: high })).toBe('Roll 20, high of 7 and 20, natural 20');
		// A stale two-dice record is not described
		expect(rollSpoken({ value: 9, last: low })).toBe('Roll 9');
	});

	it('Cards: running low, running out', () => {
		expect(cardsSpoken(52)).toBe('Cards 52 of 52 left');
		expect(cardsSpoken(13)).toBe('Cards 13 of 52 left');
		expect(cardsSpoken(12)).toBe('Cards 12 of 52 left, running low');
		expect(cardsSpoken(6)).toBe('Cards 6 of 52 left, running out');
	});

	it('Aces: every tier, and its tooltip', () => {
		const rule = 'each Salvation is a Stability check; hold on and a Token comes off';
		const cases = [
			[{ count: 0 }, 'Aces 0 of 4', 'Each Ace makes Salvation easier'],
			[
				{ count: 2 },
				'Aces 2 of 4, Salvation locked until the Ace of Hearts',
				'Salvation unlocks with the Ace of Hearts'
			],
			[
				{ count: 1, heartsAce: true },
				'Aces 1 of 4, Salvation needs 17 or more',
				'Salvation needs 17+'
			],
			[
				{ count: 2, heartsAce: true },
				'Aces 2 of 4, Salvation needs 14 or more',
				'Salvation needs 14+'
			],
			[
				{ count: 3, heartsAce: true },
				'Aces 3 of 4, Salvation needs 11 or more',
				'Salvation needs 11+'
			],
			[
				{ count: 4, heartsAce: true },
				'Aces 4 of 4, Salvation has no target: each roll is a Stability check',
				`All four Aces: ${rule}`
			],
			[
				{ count: 4, heartsAce: true, fourthWins: true },
				'Aces 4 of 4, survive the final Stability check and you escape',
				`All four Aces: ${rule}`
			]
		];
		for (const [state, spoken, tooltip] of cases) {
			expect(acesSpoken(state)).toBe(spoken);
			expect(acesTooltip(state, rule)).toBe(tooltip);
		}
	});

	it('Tokens: every tier, with the game’s own label', () => {
		const say = (tokens, unlocked = true) => tokensSpoken({ unlocked, tokens, start: 10 });
		expect(say(10, false)).toBe('Tokens locked until the Ace of Hearts');
		expect(say(10)).toBe('Tokens 10 of 10 left');
		expect(say(5)).toBe('Tokens 5 of 10 left, halfway there');
		expect(say(2)).toBe('Tokens 2 of 10 left, two to go');
		expect(say(1)).toBe('Tokens 1 of 10 left, one to go');
		expect(say(0)).toBe('Tokens 0 of 10 left, all cleared');
		expect(say(12)).toBe('Tokens 12 of 10 left, 2 more than at the start');
		expect(tokensSpoken({ unlocked: true, tokens: 3, start: 10, label: 'Hope' })).toBe(
			'Hope 3 of 10 left, halfway there'
		);
	});
});

describe('HUD tiles carry their tier', () => {
	it('Stability, Cards, Aces and Tokens follow their values', () => {
		gameState.tower = 4;
		gameState.kingsRevealed = 3;
		gameState.acesRevealed = 4;
		gameState.aceOfHeartsRevealed = true;
		gameState.config = { options: { difficulty: 0 } };
		gameState.tokens = 2;
		gameState.deck = new Array(6).fill({});
		const { getByTestId } = render(StatusHUD);
		expect(getByTestId('hud-stability').dataset.tier).toBe('critical');
		expect(getByTestId('hud-kings').dataset.tier).toBe('urgent');
		expect(getByTestId('hud-cards').dataset.tier).toBe('out');
		expect(getByTestId('hud-aces').dataset.tier).toBe('final');
		expect(getByTestId('hud-tokens').dataset.tier).toBe('near');
	});
});
