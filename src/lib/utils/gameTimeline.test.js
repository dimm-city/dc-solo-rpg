import { describe, it, expect } from 'vitest';
import { buildTimeline } from './gameTimeline.js';

const snap = (tower, { kings = 0, aces = 0, hearts = false, tokens = 10 } = {}) => ({
	tower,
	tokens,
	kingsRevealed: kings,
	acesRevealed: aces,
	aceOfHeartsRevealed: hearts
});

const card = (rank, suit, round, extra = {}) => ({ card: rank, suit, round, ...extra });

/** A lost run: opening roll, a check, the Ace of Hearts, Salvation rolls, Kings, a quiet round */
const lost = {
	round: 4,
	gameOver: true,
	win: false,
	kingsRevealed: 4,
	tower: 15,
	tokens: 9,
	acesRevealed: 1,
	aceOfHeartsRevealed: true,
	config: { options: { difficulty: 1 } },
	log: [
		{ type: 'initial-damage', roll: 6, damage: 1, tower: 19, round: 0, id: '0.0' },
		card('7', 'hearts', 1, { diceRoll: 4, damageDealt: 2, gameState: snap(19) }),
		card('A', 'hearts', 1, { diceRoll: 14, damageDealt: 0, gameState: snap(17) }),
		{ type: 'salvation', round: 1, roll: 15, threshold: 17, tokenChange: 0, tokens: 10, tower: 17 },
		card('4', 'clubs', 2, { gameState: snap(17, { aces: 1, hearts: true }) }),
		{ type: 'salvation', round: 2, roll: 18, threshold: 17, tokenChange: -1, tokens: 9, tower: 17 },
		card('K', 'spades', 3, { gameState: snap(17, { aces: 1, hearts: true, tokens: 9 }) }),
		card('K', 'hearts', 3, { gameState: snap(17, { kings: 1, aces: 1, hearts: true, tokens: 9 }) }),
		card('9', 'clubs', 3, {
			diceRoll: 20,
			damageDealt: 0,
			gameState: snap(17, { kings: 2, aces: 1, hearts: true, tokens: 9 })
		}),
		card('K', 'clubs', 4, { gameState: snap(18, { kings: 2, aces: 1, hearts: true, tokens: 9 }) }),
		card('K', 'diamonds', 4, {
			gameState: snap(18, { kings: 3, aces: 1, hearts: true, tokens: 9 })
		})
	]
};

/** The lines as read (a held total's no-break spaces read as spaces) */
const lines = (block) =>
	block.events.map((event) => `${event.label} · ${event.text}`.replace(/\u00a0/g, ' '));

describe('buildTimeline', () => {
	const timeline = buildTimeline(lost);

	it('has one block per round, in order, after the opening roll', () => {
		expect(timeline.map((block) => block.title)).toEqual([
			'Opening',
			'Round 1',
			'Round 2',
			'Round 3',
			'Round 4'
		]);
	});

	it('reads the opening roll', () => {
		expect(lines(timeline[0])).toEqual(['Instability · Rolled 6 · −1 Stability · 19 of 20']);
	});

	it('lists a Stability check with its roll, loss and Stability after', () => {
		expect(lines(timeline[1])[0]).toBe('7♥︎ · Rolled 4 · −2 Stability · 17 of 20');
	});

	it('names the Ace of Hearts as Salvation unlocked with its target, then its check', () => {
		expect(lines(timeline[1]).slice(1)).toEqual([
			'A♥︎ · Salvation unlocked · needs 17+',
			'A♥︎ · Rolled 14 · no Stability lost · 17 of 20',
			'Salvation · Rolled 15 · missed 17+ · Tokens 10 left'
		]);
	});

	it('leaves an even card out: a round of one is quiet apart from its Salvation roll', () => {
		expect(lines(timeline[2])).toEqual(['Salvation · Rolled 18 · −1 Token · Tokens 9 left']);
	});

	it('counts the Kings out and marks a natural 20 as Lucid with its Stability back', () => {
		expect(lines(timeline[3])).toEqual([
			'K♠︎ · Kings 1 of 4',
			'K♥︎ · Kings 2 of 4',
			'9♣︎ · Natural 20 · +1 Stability · 18 of 20 · Lucid'
		]);
		expect(timeline[3].events[0].kind).toBe('king');
	});

	it('ends the last round with the ending', () => {
		expect(lines(timeline[4])).toEqual([
			'K♣︎ · Kings 3 of 4',
			'K♦︎ · Kings 4 of 4',
			'The end · The fourth King was revealed.'
		]);
		expect(timeline[4].events.at(-1).kind).toBe('end');
	});

	it('shows a quiet round with no events, and no ending while the game is on', () => {
		const quiet = buildTimeline({ round: 2, log: [card('4', 'clubs', 1), card('6', 'hearts', 2)] });
		expect(quiet.map((block) => [block.title, block.events.length])).toEqual([
			['Round 1', 0],
			['Round 2', 0]
		]);
	});

	it('marks a natural 1 as Surreal, at 0 Stability the game is lost', () => {
		const state = {
			round: 1,
			gameOver: true,
			win: false,
			kingsRevealed: 0,
			tower: 0,
			log: [card('5', 'spades', 1, { diceRoll: 1, damageDealt: 3, gameState: snap(2) })]
		};
		expect(lines(buildTimeline(state)[0])).toEqual([
			'5♠︎ · Natural 1 · −3 Stability · 0 of 20 · Surreal',
			'The end · Your Stability reached 0.'
		]);
	});

	it('reads the Salvation table in the board’s words: a natural 20 takes two Tokens, a miss names its target', () => {
		const state = {
			round: 1,
			log: [
				{ type: 'salvation', round: 1, roll: 20, threshold: 14, tokenChange: -2, tokens: 6 },
				{ type: 'salvation', round: 1, roll: 17, threshold: 14, tokenChange: -1, tokens: 5 },
				{ type: 'salvation', round: 1, roll: 9, threshold: 14, tokenChange: 0, tokens: 5 },
				{ type: 'salvation', round: 1, roll: 1, threshold: 14, tokenChange: 0, tokens: 5 },
				{ type: 'salvation', round: 1, roll: 13, threshold: 14, tokenChange: 0, tokens: 1 }
			]
		};
		expect(lines(buildTimeline(state)[0])).toEqual([
			'Salvation · Natural 20 · −2 Tokens · Tokens 6 left · Lucid',
			'Salvation · Rolled 17 · −1 Token · Tokens 5 left',
			'Salvation · Rolled 9 · missed 14+ · Tokens 5 left',
			'Salvation · Natural 1 · missed · Tokens 5 left · Surreal',
			'Salvation · Rolled 13 · missed 14+ · Tokens 1 left'
		]);
	});

	it('adds the Tokens a missed roll costs on Hard', () => {
		const state = {
			round: 1,
			log: [
				{ type: 'salvation', round: 1, roll: 9, threshold: 17, tokenChange: 1, tokens: 7 },
				{ type: 'salvation', round: 1, roll: 1, threshold: 17, tokenChange: 2, tokens: 9 }
			]
		};
		expect(lines(buildTimeline(state)[0])).toEqual([
			'Salvation · Rolled 9 · missed 17+ · +1 Token · Tokens 7 left',
			'Salvation · Natural 1 · missed · +2 Tokens · Tokens 9 left · Surreal'
		]);
	});

	it('never says "no loss" or a lower-case token, and every roll starts Rolled or Natural', () => {
		const all = [
			lost,
			{
				round: 1,
				log: [card('3', 'clubs', 1, { diceRoll: 20, damageDealt: 0, gameState: snap(20) })]
			}
		]
			.flatMap((state) => buildTimeline(state))
			.flatMap((block) => block.events);
		for (const event of all) {
			expect(event.text).not.toMatch(/no loss|\btokens?\b|rolled|roll \d/);
		}
		const rolls = all.filter((event) => ['check', 'salvation', 'opening'].includes(event.kind));
		for (const event of rolls) expect(event.text).toMatch(/^(Rolled|Natural) \d+/);
		// A natural 20 at full Stability restores nothing
		expect(all.at(-1).text.replace(/\u00a0/g, ' ')).toBe(
			'Natural 20 · Stability already full · 20 of 20 · Lucid'
		);
	});

	it('reads a four-Aces Salvation as a Stability check that frees a token', () => {
		const state = {
			round: 5,
			config: { options: { difficulty: 1 } },
			log: [
				card('A', 'diamonds', 5, { gameState: snap(12, { aces: 3, hearts: true }) }),
				{
					type: 'salvation',
					round: 5,
					roll: 7,
					threshold: 0,
					stabilityChange: -1,
					tower: 11,
					tokenChange: -1,
					tokens: 4
				}
			]
		};
		expect(lines(buildTimeline(state).at(-1))).toEqual([
			'A♦︎ · Aces 4 of 4 · no target',
			'Salvation · Rolled 7 · −1 Stability · 11 of 20 · −1 Token · Tokens 4 left'
		]);
	});

	it('names the fourth Ace as the ending on Easy, where it needs no target', () => {
		const state = {
			round: 2,
			gameOver: true,
			win: true,
			tokens: 5,
			acesRevealed: 4,
			tower: 9,
			config: { options: { difficulty: 0 } },
			log: [
				card('A', 'spades', 2, {
					modifier: 'skip-damage',
					gameState: snap(9, { aces: 3, hearts: true, tokens: 5 })
				})
			]
		};
		expect(lines(buildTimeline(state)[1])).toEqual([
			'A♠︎ · Aces 4 of 4',
			'A♠︎ · skipped its Stability check',
			'Escaped · The fourth Ace was revealed.'
		]);
	});

	it('names the last Token as the ending of a win', () => {
		const state = {
			round: 3,
			gameOver: true,
			win: true,
			tokens: 0,
			acesRevealed: 2,
			log: [{ type: 'salvation', round: 3, roll: 19, threshold: 14, tokenChange: -1, tokens: 0 }]
		};
		expect(lines(buildTimeline(state).at(-1))).toEqual([
			'Salvation · Rolled 19 · −1 Token · Tokens 0 left',
			'Escaped · The last Token was removed.'
		]);
	});

	it('shows skip-damage and return-king cards', () => {
		const state = {
			round: 1,
			log: [
				card('9', 'hearts', 1, { modifier: 'skip-damage', gameState: snap(15) }),
				card('6', 'spades', 1, {
					modifier: 'return-king',
					modifierResult: 'K♠ went back into the deck\u00a0·\u00a0Kings 1 of 4',
					gameState: snap(15, { kings: 2 })
				}),
				card('8', 'spades', 1, { modifier: 'return-king', gameState: snap(15) })
			]
		};
		expect(lines(buildTimeline(state)[0])).toEqual([
			'9♥︎ · skipped its Stability check',
			// The count in the header's form (game-copy-s-02)
			'6♠︎ · K♠ went back into the deck · Kings 1 of 4',
			'8♠︎ · A King went back into the deck'
		]);
		// …held to its clause by no-break spaces, so it never sits alone on a line
		expect(buildTimeline(state)[0].events[1].text).toBe(
			'K♠ went back into the deck\u00a0·\u00a0Kings 1 of 4'
		);
	});

	it('states no non-event: a King return with no King out has no line', () => {
		const state = {
			round: 1,
			log: [
				card('A', 'spades', 1, {
					modifier: 'return-king',
					modifierResult: 'No King was out to return',
					gameState: snap(15, { kings: 0 })
				})
			]
		};
		expect(lines(buildTimeline(state)[0])).toEqual(['A♠︎ · Aces 1 of 4']);
	});

	it('holds each running total to the clause before it, so it never sits alone on a line', () => {
		const [opening] = buildTimeline(lost)[0].events;
		const clauses = opening.text.split(' · ');
		expect(clauses).toEqual(['Rolled 6', '−1 Stability\u00a0·\u00a019 of 20']);
		const salvation = buildTimeline(lost)[2].events[0];
		expect(salvation.text.split(' · ').at(-1)).toBe('−1 Token\u00a0·\u00a0Tokens 9 left');
		const all = buildTimeline(lost).flatMap((block) => block.events);
		for (const event of all) {
			for (const clause of event.text.split(' · ')) {
				expect(clause).not.toMatch(/^(\d+ of 20|Tokens \d+ left)$/);
			}
			expect(event.text).not.toMatch(/\d+\/20/);
		}
	});

	it('counts Kings and Aces itself for a log without snapshots, and leaves Stability out', () => {
		const state = {
			round: 2,
			log: [
				card('K', 'clubs', 1),
				card('A', 'clubs', 1),
				card('A', 'hearts', 2, { diceRoll: 9, damageDealt: 1 }),
				card('K', 'hearts', 2)
			]
		};
		const [one, two] = buildTimeline(state);
		expect(lines(one)).toEqual(['K♣︎ · Kings 1 of 4', 'A♣︎ · Aces 1 of 4']);
		expect(lines(two)).toEqual([
			'A♥︎ · Salvation unlocked · Aces 2 of 4 · needs 14+',
			'A♥︎ · Rolled 9 · −1 Stability',
			'K♥︎ · Kings 2 of 4'
		]);
	});

	it('is empty for no state', () => {
		expect(buildTimeline()).toEqual([]);
		expect(buildTimeline({ round: 0, log: [] })).toEqual([]);
	});
});
