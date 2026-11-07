import { describe, it, expect, vi, afterEach } from 'vitest';
import {
	getMechanicNote,
	getModifierNote,
	getKingNumber,
	isFinalKing,
	endsGameOnConfirm,
	triggersStabilityCheck,
	getCardName,
	getRoundProgress,
	countWords,
	getCardHoldMs
} from './cardInfo.js';
import { createHoldTimer } from './holdTimer.js';

/** A card as drawCard() leaves it: with a snapshot of the state it was drawn into */
const card = (rank, suit = 'spades', extra = {}, snap = {}) => ({
	card: rank,
	suit,
	description: 'A headline',
	story: 'A story',
	gameState: { kingsRevealed: 0, acesRevealed: 0, aceOfHeartsRevealed: false, ...snap },
	...extra
});

describe('getMechanicNote', () => {
	it('says a Stability check follows an odd card', () => {
		for (const rank of ['3', '5', '7', '9']) {
			expect(getMechanicNote(card(rank))).toBe('Odd · a Stability check follows');
		}
	});

	it('says nothing for even cards', () => {
		for (const rank of ['2', '4', '6', '8', '10', 'J', 'Q']) {
			expect(getMechanicNote(card(rank))).toBe('');
		}
	});

	it('counts Kings, including the one on the card', () => {
		expect(getMechanicNote(card('K', 'hearts', {}, { kingsRevealed: 0 }))).toBe('King · 1 of 4');
		expect(getMechanicNote(card('K', 'clubs', {}, { kingsRevealed: 2 }))).toBe('King · 3 of 4');
		expect(getMechanicNote(card('K', 'spades', {}, { kingsRevealed: 3 }))).toBe('King · 4 of 4');
	});

	it('gives the Ace of Hearts the threshold it unlocks, and its Stability check', () => {
		expect(getMechanicNote(card('A', 'hearts'))).toBe(
			'Salvation unlocked · needs 17+ · a Stability check follows'
		);
		// Two Aces already out: this is the third, so 11+
		expect(getMechanicNote(card('A', 'hearts', {}, { acesRevealed: 2 }))).toBe(
			'Salvation unlocked · needs 11+ · a Stability check follows'
		);
	});

	it('tells another Ace what Salvation needs now, or will need once unlocked', () => {
		expect(
			getMechanicNote(card('A', 'clubs', {}, { acesRevealed: 1, aceOfHeartsRevealed: true }))
		).toBe('Ace · Salvation now needs 14+ · a Stability check follows');
		expect(getMechanicNote(card('A', 'clubs', {}, { acesRevealed: 0 }))).toBe(
			'Ace · Salvation will need 17+ · a Stability check follows'
		);
	});

	it('the fourth Ace makes Salvation assured on Normal and Hard; on Easy it ends the game', () => {
		const fourth = card('A', 'spades', {}, { acesRevealed: 3, aceOfHeartsRevealed: true });
		const freed = card(
			'A',
			'spades',
			{ modifier: 'skip-damage' },
			{ acesRevealed: 3, aceOfHeartsRevealed: true }
		);
		// The live state carries the difficulty (the card's snapshot has the counts); none is Normal
		const assured = 'Ace · Salvation is now assured · a Stability check follows';
		expect(getMechanicNote(fourth)).toBe(assured);
		expect(getMechanicNote(freed)).toBe('Ace · Salvation is now assured');
		const hard = { config: { options: { difficulty: 2 } } };
		expect(getMechanicNote(fourth, hard)).toBe(assured);
		expect(getMechanicNote(freed, hard)).toBe('Ace · Salvation is now assured');

		const easy = { config: { options: { difficulty: 0 } } };
		expect(getMechanicNote(fourth, easy)).toBe(
			'The fourth Ace · survive its Stability check and you escape'
		);
		expect(getMechanicNote(freed, easy)).toBe('The fourth Ace · you escape');
	});

	it('drops the Stability check for a skip-damage card', () => {
		const ace = card(
			'A',
			'diamonds',
			{ modifier: 'skip-damage' },
			{ acesRevealed: 1, aceOfHeartsRevealed: true }
		);
		expect(getMechanicNote(ace)).toBe('Ace · Salvation now needs 14+');
		expect(triggersStabilityCheck(ace)).toBe(false);
	});

	it('falls back to the live state when the card has no snapshot', () => {
		const king = { card: 'K', suit: 'hearts' };
		expect(getMechanicNote(king, { kingsRevealed: 1 })).toBe('King · 2 of 4');
		expect(getMechanicNote(null)).toBe('');
	});
});

describe('getModifierNote', () => {
	it('says what skip-damage does', () => {
		expect(getModifierNote(card('A', 'clubs', { modifier: 'skip-damage' }))).toBe(
			'No Stability check this time'
		);
	});

	it('says a King returns, or that none is out to return', () => {
		expect(
			getModifierNote(card('A', 'spades', { modifier: 'return-king' }, { kingsRevealed: 2 }))
		).toBe('A King returns to the deck');
		expect(getModifierNote(card('A', 'spades', { modifier: 'return-king' }))).toBe(
			'No King is out to return'
		);
	});

	it('is empty for a card without a modifier', () => {
		expect(getModifierNote(card('7'))).toBe('');
	});
});

describe('Kings', () => {
	it('knows which King this is and whether it ends the game', () => {
		expect(getKingNumber(card('7'))).toBe(0);
		expect(getKingNumber(card('K', 'hearts', {}, { kingsRevealed: 1 }))).toBe(2);
		expect(isFinalKing(card('K', 'hearts', {}, { kingsRevealed: 2 }))).toBe(false);
		expect(isFinalKing(card('K', 'hearts', {}, { kingsRevealed: 3 }))).toBe(true);
	});
});

describe('endsGameOnConfirm', () => {
	it('is the fourth King, and on Easy a fourth Ace that skips its Stability check', () => {
		const easy = { config: { options: { difficulty: 0 } } };
		const normal = { config: { options: { difficulty: 1 } } };
		expect(endsGameOnConfirm(card('K', 'spades', {}, { kingsRevealed: 3 }), normal)).toBe(true);
		expect(endsGameOnConfirm(card('K', 'spades', {}, { kingsRevealed: 2 }), normal)).toBe(false);

		const freed = card('A', 'spades', { modifier: 'skip-damage' }, { acesRevealed: 3 });
		expect(endsGameOnConfirm(freed, easy)).toBe(true);
		expect(endsGameOnConfirm(freed, normal)).toBe(false);
		// With a check to survive, that check decides, not the card
		expect(endsGameOnConfirm(card('A', 'spades', {}, { acesRevealed: 3 }), easy)).toBe(false);
		expect(endsGameOnConfirm(card('7'), normal)).toBe(false);
		expect(endsGameOnConfirm(null, normal)).toBe(false);
	});
});

describe('getCardName', () => {
	it('names the card for a screen reader', () => {
		expect(getCardName({ card: '8', suit: 'spades', type: 'event' })).toBe('8 of Spades, Event');
		expect(getCardName({ card: 'K', suit: 'hearts', type: 'failure-counter' })).toBe(
			'King of Hearts, Doom'
		);
		expect(getCardName({ card: 'A', suit: 'clubs', type: 'narrative' })).toBe(
			'Ace of Clubs, Bonus'
		);
	});
});

describe('getRoundProgress', () => {
	const log = [
		{ card: '3', round: 1 },
		{ card: '5', round: 2 },
		{ card: 'K', round: 2 }
	];

	it('counts this round’s cards drawn and still to draw', () => {
		expect(getRoundProgress({ round: 2, log, cardsToDraw: 3 })).toEqual({ index: 2, total: 5 });
		expect(getRoundProgress({ round: 2, log, cardsToDraw: 0 })).toEqual({ index: 2, total: 2 });
	});

	it('is null before the first card of the round', () => {
		expect(getRoundProgress({ round: 3, log, cardsToDraw: 4 })).toBeNull();
	});
});

describe('auto-play hold', () => {
	it('is 1.5s plus 60ms per word, capped at 15s', () => {
		expect(countWords({ description: 'Two words', story: 'and three more' })).toBe(5);
		expect(getCardHoldMs({ description: 'Two words', story: 'and three more' })).toBe(1800);
		expect(getCardHoldMs({ description: '', story: '' })).toBe(1500);
		const long = { description: 'word '.repeat(150), story: 'word '.repeat(150) };
		expect(getCardHoldMs(long)).toBe(15000);
	});
});

describe('createHoldTimer', () => {
	afterEach(() => vi.useRealTimers());

	function setup(duration = 1000) {
		vi.useFakeTimers();
		const clock = { now: () => Date.now() };
		const onDone = vi.fn();
		return { timer: createHoldTimer(duration, onDone, clock), onDone };
	}

	it('fires once when the hold runs out', () => {
		const { timer, onDone } = setup();
		vi.advanceTimersByTime(999);
		expect(onDone).not.toHaveBeenCalled();
		expect(timer.progress()).toBeCloseTo(0.999);
		vi.advanceTimersByTime(1);
		expect(onDone).toHaveBeenCalledTimes(1);
		expect(timer.progress()).toBe(1);
	});

	it('stands still while paused and picks up where it left off', () => {
		const { timer, onDone } = setup();
		vi.advanceTimersByTime(400);
		timer.pause();
		expect(timer.paused).toBe(true);
		vi.advanceTimersByTime(5000);
		expect(onDone).not.toHaveBeenCalled();
		expect(timer.progress()).toBeCloseTo(0.4);
		timer.resume();
		vi.advanceTimersByTime(599);
		expect(onDone).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(onDone).toHaveBeenCalledTimes(1);
	});

	it('never fires after cancel', () => {
		const { timer, onDone } = setup();
		timer.cancel();
		timer.resume();
		vi.advanceTimersByTime(2000);
		expect(onDone).not.toHaveBeenCalled();
	});
});
