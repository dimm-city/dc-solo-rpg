/**
 * Rule captions (DP-1-09): a rule is noted when it first comes up, then shown on arrival at a
 * table screen where it applies, most important first, while it is still true.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createRuleCaptions, CAPTION_PRIORITY } from './useRuleCaptions.svelte.js';
import { getSeenRuleTips } from '../utils/instructionsStorage.js';

function base(over = {}) {
	return {
		state: 'drawCard',
		round: 1,
		kingsRevealed: 0,
		acesRevealed: 0,
		aceOfHeartsRevealed: false,
		tokens: 10,
		isLucid: false,
		isSurreal: false,
		gameOver: false,
		log: [],
		lastCard: null,
		...over
	};
}

const AH = { card: 'A', suit: 'hearts' };
const AD = { card: 'A', suit: 'diamonds' };
const easy = (over = {}) => base({ config: { options: { difficulty: 0 } }, ...over });
const hard = (over = {}) => base({ config: { options: { difficulty: 2 } }, ...over });

/** Arrive at a screen: observe it, then take what starts there */
function arrive(c, g) {
	c.observe(g);
	return c.take(g);
}

describe('createRuleCaptions: what is noted', () => {
	let disabled;
	let c;
	beforeEach(() => {
		disabled = false;
		c = createRuleCaptions({ isDisabled: () => disabled, onSeen: () => {} });
		c.observe(base()); // baseline
	});

	it('notes the odd-card rule on the first odd card sent to a check', () => {
		c.observe(base({ state: 'failureCheck', log: [{ card: '7' }] }));
		expect(c.waiting).toEqual(['odd']);
	});

	it('ignores even cards', () => {
		c.observe(base({ state: 'drawCard', log: [{ card: '8' }] }));
		expect(c.waiting).toEqual([]);
	});

	it('(a) the Ace of Hearts drawn, then confirmed: Salvation unlocked', () => {
		// Drawing it sets the flag at once; the count rises when it is confirmed
		c.observe(base({ aceOfHeartsRevealed: true, log: [AH] }));
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 1, log: [AH] }));
		expect(c.waiting).toEqual(['salvation']);
	});

	it('(b) the Ace of Diamonds, then the Ace of Hearts: Salvation unlocked', () => {
		c.observe(base({ acesRevealed: 1, log: [AD] }));
		expect(c.waiting).toEqual([]); // an Ace before the Ace of Hearts says nothing
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 1, log: [AD, AH] }));
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 2, log: [AD, AH] }));
		expect(c.waiting).toEqual(['salvation']);
	});

	it('(c) the Ace of Hearts, then the Ace of Diamonds: the Ace rule', () => {
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 1, log: [AH] }));
		c.take(base({ state: 'successCheck', aceOfHeartsRevealed: true, acesRevealed: 1 }));
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 2, log: [AH, AD] }));
		expect(c.waiting).toEqual(['ace']);
	});

	it('notes the fourth Ace on Easy only', () => {
		const e = createRuleCaptions({ onSeen: () => {} });
		e.observe(easy({ aceOfHeartsRevealed: true, acesRevealed: 3 }));
		e.observe(easy({ aceOfHeartsRevealed: true, acesRevealed: 4, log: [AD] }));
		expect(e.waiting).toEqual(['fourth-ace']);
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 3 }));
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 4, log: [AD] }));
		expect(c.waiting).toEqual(['ace']);
	});

	it('notes Lucid, Surreal, a King and a Token added on Hard', () => {
		c.observe(base({ isLucid: true }));
		c.observe(base({ isSurreal: true, kingsRevealed: 1 }));
		c.observe(base({ isSurreal: true, kingsRevealed: 1, tokens: 11 }));
		expect(c.waiting).toEqual(['lucid', 'surreal', 'king']); // no Token rule before Salvation
		c.observe(base({ aceOfHeartsRevealed: true, tokens: 11, log: [AH] }));
		c.observe(base({ aceOfHeartsRevealed: true, tokens: 12, log: [AH] }));
		expect(c.waiting).toContain('token');
	});

	it('notes nothing while rule tips are off, nor on a resumed game, and clears at game over', () => {
		disabled = true;
		c.observe(base({ kingsRevealed: 1, isLucid: true }));
		expect(c.pending).toBe(0);
		const resumed = createRuleCaptions();
		resumed.observe(base({ kingsRevealed: 2, acesRevealed: 1, aceOfHeartsRevealed: true }));
		expect(resumed.pending).toBe(0);
		disabled = false;
		c.observe(base({ kingsRevealed: 2 }));
		c.observe(base({ kingsRevealed: 2, gameOver: true }));
		expect(c.pending).toBe(0);
	});
});

describe('createRuleCaptions: what shows, where', () => {
	let c;
	let shown;
	beforeEach(() => {
		shown = [];
		c = createRuleCaptions({ onSeen: (id) => shown.push(id) });
		c.observe(base());
	});

	it('starts nothing off the table screens', () => {
		c.observe(base({ kingsRevealed: 1 }));
		expect(c.take(base({ state: 'drawCard', kingsRevealed: 1 }))).toBeNull();
		expect(c.take(base({ state: 'log', kingsRevealed: 1 }))).toBeNull();
		expect(c.take(base({ state: 'rollForTasks', kingsRevealed: 1 }))?.id).toBe('king');
	});

	it('shows the most important first, one per arrival', () => {
		expect(CAPTION_PRIORITY).toEqual([
			'salvation',
			'fourth-ace',
			'lucid',
			'surreal',
			'king',
			'ace',
			'token',
			'odd'
		]);
		c.observe(base({ kingsRevealed: 1, isLucid: true }));
		const check = base({
			state: 'failureCheck',
			kingsRevealed: 1,
			isLucid: true,
			log: [{ card: '7' }]
		});
		expect(arrive(c, check).id).toBe('lucid');
		c.observe(base({ kingsRevealed: 1, isLucid: true }));
		expect(arrive(c, { ...check, log: [{ card: '9' }] }).id).toBe('king');
		c.observe(base({ kingsRevealed: 1 }));
		expect(arrive(c, { ...check, isLucid: false, log: [{ card: '3' }] }).id).toBe('odd');
		expect(shown).toEqual(['lucid', 'king', 'odd']);
	});

	it('shows a rule only where it applies: Salvation on Salvation, odd on a check', () => {
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 1, log: [AH] }));
		// Roll for Tasks: Salvation waits
		expect(
			arrive(c, base({ state: 'rollForTasks', aceOfHeartsRevealed: true, acesRevealed: 1 }))
		).toBeNull();
		expect(
			arrive(c, base({ state: 'successCheck', aceOfHeartsRevealed: true, acesRevealed: 1 }))?.id
		).toBe('salvation');
	});

	it('drops a Lucid or Surreal caption that is no longer true', () => {
		c.observe(base({ isLucid: true }));
		c.observe(base({ isLucid: false }));
		expect(arrive(c, base({ state: 'rollForTasks' }))).toBeNull();
		expect(c.pending).toBe(0);
		// A later natural 20 notes it again, since it was never shown
		c.observe(base({ isLucid: true }));
		expect(arrive(c, base({ state: 'failureCheck', isLucid: true, log: [{ card: '8' }] })).id).toBe(
			'lucid'
		);
	});

	it('holds every caption on the Ace of Hearts’ own Stability check', () => {
		c.observe(base({ aceOfHeartsRevealed: true, log: [AH] }));
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 1, log: [AH] }));
		const ownCheck = base({
			state: 'failureCheck',
			aceOfHeartsRevealed: true,
			acesRevealed: 1,
			log: [AH],
			lastCard: AH
		});
		expect(arrive(c, ownCheck)).toBeNull();
		expect(c.waiting).toEqual(['salvation', 'odd']);
		// Salvation unlocked is the first caption after that card, on the first Salvation screen
		const salvation = base({
			state: 'successCheck',
			aceOfHeartsRevealed: true,
			acesRevealed: 1,
			log: [AH]
		});
		expect(arrive(c, salvation).id).toBe('salvation');
		// The odd caption it held shows on the next Stability check
		c.observe(base({ aceOfHeartsRevealed: true, acesRevealed: 1, log: [AH, { card: '5' }] }));
		const next = base({
			state: 'failureCheck',
			aceOfHeartsRevealed: true,
			acesRevealed: 1,
			log: [AH, { card: '5' }],
			lastCard: { card: '5' }
		});
		expect(arrive(c, next).id).toBe('odd');
	});

	it('shows the fourth Ace only on the final check (Easy)', () => {
		const e = createRuleCaptions({ onSeen: () => {} });
		e.observe(easy({ aceOfHeartsRevealed: true, acesRevealed: 3 }));
		e.observe(easy({ aceOfHeartsRevealed: true, acesRevealed: 4, log: [AD] }));
		const final = easy({
			state: 'failureCheck',
			aceOfHeartsRevealed: true,
			acesRevealed: 4,
			log: [AD]
		});
		expect(arrive(e, final)).toEqual({
			id: 'fourth-ace',
			text: 'On Easy, the fourth Ace ends the game.'
		});
	});

	it('teaches Salvation on the first Salvation screen on Easy, where the Ace of Hearts starts out', () => {
		const e = createRuleCaptions({ onSeen: () => {} });
		e.observe(easy({ state: 'rollForTasks', aceOfHeartsRevealed: true }));
		const first = arrive(e, easy({ state: 'successCheck', aceOfHeartsRevealed: true }));
		expect(first.id).toBe('salvation');
		e.observe(easy({ state: 'log', aceOfHeartsRevealed: true }));
		expect(arrive(e, easy({ state: 'successCheck', aceOfHeartsRevealed: true }))).toBeNull();
	});

	it('shows each caption once per game, and again in a new game', () => {
		c.observe(base({ kingsRevealed: 1 }));
		expect(arrive(c, base({ state: 'rollForTasks', kingsRevealed: 1 })).id).toBe('king');
		c.observe(base({ kingsRevealed: 2 }));
		expect(
			arrive(c, base({ state: 'failureCheck', kingsRevealed: 2, log: [{ card: '8' }] }))
		).toBeNull();
		c.observe(base({ state: 'showIntro' }));
		c.observe(base());
		c.observe(base({ kingsRevealed: 1 }));
		expect(arrive(c, base({ state: 'rollForTasks', kingsRevealed: 1 })).id).toBe('king');
	});

	it('persists shown captions to storage by default, when they show', () => {
		localStorage.clear();
		const t = createRuleCaptions();
		t.observe(base());
		t.observe(base({ isSurreal: true }));
		expect(getSeenRuleTips()).toEqual([]);
		t.take(base({ state: 'rollForTasks', isSurreal: true }));
		expect(getSeenRuleTips()).toEqual(['surreal']);
	});
});

describe('createRuleCaptions: the text, from the live game', () => {
	const take = (id, g) => {
		const c = createRuleCaptions({ onSeen: () => {} });
		c.observe(base());
		if (id === 'ace') {
			c.observe({ ...g, state: 'drawCard', acesRevealed: g.acesRevealed - 1, log: [AH] });
			c.take({ ...g, state: 'successCheck' }); // Salvation shown first
			c.observe({ ...g, state: 'drawCard', log: [AH, AD] });
		} else if (id === 'king') {
			c.observe({ ...g, state: 'drawCard' });
		}
		return c.take({ ...g, state: 'rollForTasks' });
	};

	it('names the King count', () => {
		expect(take('king', base({ kingsRevealed: 2 })).text).toBe(
			'King 2 of 4. When all four are revealed, your journey ends.'
		);
	});

	it('gives every Salvation target, and the fourth Ace by difficulty', () => {
		const rule = 'Each Ace makes Salvation easier: 17+ with one, 14+ with two, 11+ with three.';
		const at = (aces, make = base) => make({ aceOfHeartsRevealed: true, acesRevealed: aces });
		expect(take('ace', at(2)).text).toBe(rule);
		expect(take('ace', at(3)).text).toBe(rule);
		expect(take('ace', at(3, hard)).text).toBe(rule);
		expect(take('ace', at(3, easy)).text).toBe(
			`${rule} One more Ace and you escape, if you survive its check.`
		);
		expect(take('ace', at(4)).text).toBe(
			'With all four Aces, Salvation has no target: each roll is a Stability check.'
		);
	});

	it('capitalises Salvation and Token, and gives the long form of Lucid and Surreal', () => {
		const c = createRuleCaptions({ onSeen: () => {} });
		c.observe(base());
		c.observe(base({ isLucid: true, isSurreal: false }));
		expect(c.take(base({ state: 'rollForTasks', isLucid: true })).text).toBe(
			'A natural 20 makes you Lucid: your next roll uses two dice and keeps the higher.'
		);
		c.observe(base({ isSurreal: true }));
		expect(
			c.take(base({ state: 'failureCheck', isSurreal: true, log: [{ card: '8' }] })).text
		).toBe('A natural 1 makes you Surreal: your next roll uses two dice and keeps the lower.');
		const h = createRuleCaptions({ onSeen: () => {} });
		h.observe(hard({ aceOfHeartsRevealed: true, log: [AH], acesRevealed: 1 }));
		h.observe(hard({ aceOfHeartsRevealed: true, log: [AH], acesRevealed: 1, tokens: 11 }));
		expect(
			h.take(hard({ state: 'rollForTasks', aceOfHeartsRevealed: true, tokens: 11 })).text
		).toBe('On Hard, a missed Salvation roll adds a Token. Hope costs.');
		const s = createRuleCaptions({ onSeen: () => {} });
		s.observe(base({ state: 'rollForTasks' }));
		expect(arrive(s, base({ state: 'successCheck', aceOfHeartsRevealed: true })).text).toBe(
			'Salvation unlocked. Each round ends with a roll to clear a Token. Clear them all to escape.'
		);
		const o = createRuleCaptions({ onSeen: () => {} });
		o.observe(base());
		expect(arrive(o, base({ state: 'failureCheck', log: [{ card: '7' }] })).text).toBe(
			'Odd cards call for a Stability check.'
		);
	});
});
