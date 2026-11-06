import { describe, it, expect, beforeEach } from 'vitest';
import { createRuleCaptions } from './useRuleCaptions.svelte.js';
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
		...over
	};
}

function drain(c) {
	const out = [];
	let n;
	while ((n = c.next())) out.push(n.id);
	return out;
}

describe('createRuleCaptions', () => {
	let disabled;
	let c;
	beforeEach(() => {
		disabled = false;
		c = createRuleCaptions({ isDisabled: () => disabled });
		c.observe(base()); // baseline
	});

	it('fires the odd-card caption once, on the first odd card sent to a check', () => {
		c.observe(base({ state: 'failureCheck', log: [{ card: '7' }] }));
		c.observe(base({ state: 'drawCard', log: [{ card: '7' }] }));
		c.observe(base({ state: 'failureCheck', log: [{ card: '7' }, { card: '3' }] }));
		expect(drain(c)).toEqual(['odd']);
	});

	it('ignores even cards', () => {
		c.observe(base({ state: 'drawCard', log: [{ card: '8' }] }));
		expect(drain(c)).toEqual([]);
	});

	it('counts Kings and fires once', () => {
		c.observe(base({ kingsRevealed: 1 }));
		c.observe(base({ kingsRevealed: 2 }));
		expect(drain(c)).toEqual(['king']);
	});

	it('Ace of Hearts unlocks salvation, later Aces show the threshold', () => {
		c.observe(base({ acesRevealed: 1, aceOfHeartsRevealed: true }));
		c.observe(base({ acesRevealed: 2, aceOfHeartsRevealed: true }));
		c.observe(base({ acesRevealed: 3, aceOfHeartsRevealed: true }));
		const items = [];
		let n;
		while ((n = c.next())) items.push(n);
		expect(items.map((i) => i.id)).toEqual(['salvation', 'ace']);
		expect(items[1].text).toContain('14+');
	});

	it('a non-heart Ace before the Ace of Hearts says nothing', () => {
		c.observe(base({ acesRevealed: 1 }));
		expect(drain(c)).toEqual([]);
	});

	it('fires Lucid and Surreal once each', () => {
		c.observe(base({ isLucid: true }));
		c.observe(base());
		c.observe(base({ isLucid: true }));
		c.observe(base({ isSurreal: true }));
		expect(drain(c)).toEqual(['lucid', 'surreal']);
	});

	it('fires the failed-salvation caption only when a token is added after the Ace of Hearts', () => {
		c.observe(base({ tokens: 11 }));
		expect(drain(c)).toEqual([]);
		c.observe(base({ tokens: 10, aceOfHeartsRevealed: true, acesRevealed: 1 }));
		drain(c);
		c.observe(base({ tokens: 11, aceOfHeartsRevealed: true, acesRevealed: 1 }));
		expect(drain(c)).toEqual(['token']);
	});

	it('keeps queue order when several fire at once', () => {
		c.observe(
			base({
				state: 'failureCheck',
				log: [{ card: 'A' }],
				acesRevealed: 1,
				aceOfHeartsRevealed: true
			})
		);
		expect(drain(c)).toEqual(['odd', 'salvation']);
	});

	it('shows nothing when instructions are permanently skipped', () => {
		disabled = true;
		c.observe(base({ kingsRevealed: 1, isLucid: true }));
		expect(c.pending).toBe(0);
	});

	it('does not replay on a resumed game (first observation is a baseline)', () => {
		const resumed = createRuleCaptions();
		resumed.observe(base({ kingsRevealed: 2, acesRevealed: 1, aceOfHeartsRevealed: true }));
		expect(resumed.pending).toBe(0);
	});

	it('resets the seen set for a new game', () => {
		c.observe(base({ kingsRevealed: 1 }));
		drain(c);
		c.observe(base({ state: 'showIntro' }));
		c.observe(base());
		c.observe(base({ kingsRevealed: 1 }));
		expect(drain(c)).toEqual(['king']);
	});

	it('clears the queue at game over', () => {
		c.observe(base({ kingsRevealed: 1 }));
		c.observe(base({ kingsRevealed: 1, gameOver: true }));
		expect(c.pending).toBe(0);
	});

	it('records each caption it shows for "Rules you\'ve met", once per id', () => {
		const shown = [];
		const t = createRuleCaptions({ onSeen: (id) => shown.push(id) });
		t.observe(base());
		t.observe(base({ kingsRevealed: 1 }));
		t.observe(base({ kingsRevealed: 2, isLucid: true }));
		expect(shown).toEqual(['king', 'lucid']);
	});

	it('persists shown captions to storage by default', () => {
		localStorage.clear();
		const t = createRuleCaptions();
		t.observe(base());
		t.observe(base({ isSurreal: true }));
		expect(getSeenRuleTips()).toEqual(['surreal']);
	});
});

describe('createRuleCaptions: Salvation on Easy', () => {
	it('teaches Salvation on the first Salvation screen when the Ace of Hearts starts revealed', () => {
		const c = createRuleCaptions();
		c.observe(base({ state: 'rollForTasks', aceOfHeartsRevealed: true, acesRevealed: 1 }));
		c.observe(base({ state: 'successCheck', aceOfHeartsRevealed: true, acesRevealed: 1 }));
		c.observe(base({ state: 'log', aceOfHeartsRevealed: true, acesRevealed: 1 }));
		c.observe(base({ state: 'successCheck', aceOfHeartsRevealed: true, acesRevealed: 1 }));
		expect(drain(c)).toEqual(['salvation']);
	});

	it('does not repeat it in a normal game, where the Ace of Hearts already taught it', () => {
		const c = createRuleCaptions();
		c.observe(base());
		c.observe(base({ state: 'drawCard', acesRevealed: 1, aceOfHeartsRevealed: true }));
		c.observe(base({ state: 'successCheck', acesRevealed: 1, aceOfHeartsRevealed: true }));
		expect(drain(c)).toEqual(['salvation']);
	});
});
