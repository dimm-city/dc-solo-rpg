// Round flow: Round N opens on Roll for Tasks, the cards are dealt on their own, every roll
// button reads "Rolling…" while the dice roll, and Lucid/Surreal shows on the roll button only.
// Stability and Salvation results move on by themselves after a beat, except an ending.
// A missed Salvation roll loses no token, and four Aces make Salvation a Stability check per
// token; on Hard a miss adds a token; on Easy the fourth Ace ends the game (its Stability
// check is the last roll). Rule tips follow the Settings switch.
// The dice are forced through the app's own random service (dev server modules).
//
// These run under reduced motion: each roll is the 600ms number instead of a 3D throw, which
// takes many seconds in headless software WebGL. The throw itself is covered by unit tests.

import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY, RULE_TIPS_KEY, playToFirstRound, pressStep } from './helpers';

test.describe.configure({ timeout: 60000 });

const SLUG = 'future-lost';
// Vite serves the app's modules at these URLs on the dev server (held in variables so the
// type checker does not try to resolve them)
const GAME_STORE = '/src/lib/stores/gameStore.svelte.js';
const RANDOM = '/src/lib/services/random.js';

/** Run code against the live stores (dev server only) */
async function store(page: Page, src: string) {
	await page.evaluate(
		async ({ src, modules }) => {
			const gs = await import(/* @vite-ignore */ modules[0]);
			const rnd = await import(/* @vite-ignore */ modules[1]);
			new Function('gs', 'rnd', src)(gs, rnd);
		},
		{ src, modules: [GAME_STORE, RANDOM] }
	);
}

const gameStateOf = (page: Page) =>
	page.evaluate(async (gameStore) => {
		const { gameState } = await import(/* @vite-ignore */ gameStore);
		return {
			state: gameState.state,
			round: gameState.round,
			isLucid: gameState.isLucid,
			taskRoll: gameState.taskRoll
		};
	}, GAME_STORE);

async function openGame(page: Page, { ruleTips = false } = {}) {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(
		({ seenKey, tipsKey, tips }) => {
			sessionStorage.setItem('splashShown', 'true');
			localStorage.setItem(seenKey, 'true');
			localStorage.setItem(tipsKey, tips ? 'true' : 'false');
		},
		{ seenKey: INSTRUCTIONS_SEEN_KEY, tipsKey: RULE_TIPS_KEY, tips: ruleTips }
	);
	await page.goto(`/game/${SLUG}`);
	await expect(page.getByTestId('screen-showIntro')).toBeVisible({ timeout: 30000 });
	// An ordinary opening roll, so no Lucid or Surreal carries into the test
	await store(page, 'rnd.mockDieRoll(13)');
}

/**
 * Put cards of these ranks on top of the deck, drawn in this order. "A:plain" is an Ace with
 * no modifier and "A:skip-damage" one that skips its Stability check (the game data has both);
 * "A:plain:diamonds" pins the suit too (the plain Aces here are hearts and diamonds).
 */
async function stackDeck(page: Page, ranks: string[]) {
	await store(
		page,
		`const deck = gs.gameState.deck;
		const ranks = ${JSON.stringify(ranks)};
		for (const [moved, spec] of [...ranks].reverse().entries()) {
			const [rank, modifier, suit] = spec.split(':');
			const wanted = modifier === 'plain' ? null : modifier;
			const i = deck.findIndex(
				(c, index) =>
					c.card === rank &&
					(modifier === undefined || (c.modifier ?? null) === wanted) &&
					(suit === undefined || c.suit === suit) &&
					index < deck.length - moved
			);
			if (i === -1) throw new Error('no such card in the deck: ' + spec);
			deck.push(deck.splice(i, 1)[0]);
		}`
	);
}

/** Wait for the drawn card to come up, then dismiss it */
async function dismissCard(page: Page) {
	const card = page.getByTestId('card');
	await expect(card).toHaveClass(/revealed/, { timeout: 30000 });
	await card.click();
}

/** Round 1 with these cards on top; rolls 3, so two cards are dealt */
async function playRound(page: Page, ranks: [string, string], setup = '') {
	await stackDeck(page, ranks);
	await store(page, `${setup}; rnd.mockDieRoll(3)`);
	await pressStep(page, 'roll-tasks-button');
}

/** Turn rule tips on or off from the in-game Settings (in the header menu on phones) */
async function setRuleTips(page: Page, on: boolean) {
	const inline = page.getByRole('button', { name: 'Settings', exact: true });
	if (await inline.isVisible()) {
		await inline.click();
	} else {
		await page.getByRole('button', { name: 'More game options' }).click();
		await page.locator('.game-menu').getByRole('button', { name: 'Settings' }).click();
	}
	const dialog = page.getByRole('dialog', { name: 'Settings' });
	await dialog.getByRole('switch', { name: 'Rule tips' }).setChecked(on);
	await dialog.getByRole('button', { name: 'Done' }).click();
	await expect(dialog).toHaveCount(0);
}

test.describe('Round flow', () => {
	test.afterEach(async ({ page }) => {
		await store(page, 'rnd.resetRNG()').catch(() => {});
	});

	test('the intro ends on what winning takes', async ({ page }) => {
		await openGame(page);
		await expect(page.getByTestId('intro-goal')).toHaveText(
			/^Hold on to your 20 Stability\. (Find the Ace of Hearts, then remove all 10 Tokens to escape|The Ace of Hearts is already revealed: remove all 10 Tokens, or survive the fourth Ace, to escape)\.$/
		);
	});

	test('Round 1 opens on Roll for Tasks and deals the cards on its own', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await expect(page.getByRole('button', { name: /Begin Round/i })).toHaveCount(0);

		await store(page, 'rnd.mockDieRoll(8)'); // 3 cards
		const roll = page.getByTestId('roll-tasks-button');
		await pressStep(page, 'roll-tasks-button');
		// The accessible name: the visible label crossfades, so old and new text overlap briefly
		await expect(roll).toHaveAccessibleName('Rolling…');

		// The result, under the same title, then the deal with no further press
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 8 · 3 cards this round', {
			timeout: 30000
		});
		await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toBeVisible();
		expect((await gameStateOf(page)).taskRoll).toEqual({ roll: 8, dice: [8], cards: 3 });
	});

	test('a Lucid roll shows the modifier on the hint line above the roll button, and names both dice', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);

		await store(page, 'gs.gameState.isLucid = true; rnd.mockDieRollSequence([4, 15])');
		const roll = page.getByTestId('roll-tasks-button');
		const hint = page.getByTestId('roll-modifier');
		await expect(hint).toHaveText('Lucid · two dice, keep the higher');
		// The button's name is its visible label; the hint describes it
		await expect(roll).toHaveAccessibleName('Roll for tasks');
		await expect(roll).toHaveAccessibleDescription('Lucid · two dice, keep the higher');
		await expect(page.getByTestId('state-chip')).toHaveCount(0);

		await pressStep(page, 'roll-tasks-button');
		await expect(page.getByTestId('result-line')).toHaveText(
			'Rolled 15 (high of 4, 15) · 4 cards this round',
			{ timeout: 30000 }
		);
		await store(page, 'rnd.resetRNG()');
		// The line stays, empty, so nothing moves
		await expect(hint).toHaveClass(/empty/);
		expect((await gameStateOf(page)).isLucid).toBe(false);
	});

	test('NV-03: after leaving a game, the home page still scrolls to every game', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await page.getByRole('button', { name: 'Exit game' }).click();
		await page
			.getByRole('dialog', { name: 'Exit the game?' })
			.getByRole('button', { name: 'Exit game', exact: true })
			.click();
		await expect(page.getByTestId('home-page')).toBeVisible();

		// The game's page rules are gone: the home's scroller scrolls again
		const main = page.locator('body > main');
		await expect(main).toHaveCSS('overflow-y', 'auto');
		const cards = page.locator('[data-testid="game-selector"] .card-actions');
		const last = cards.last().getByRole('button').first();
		await last.scrollIntoViewIfNeeded();
		const box = await last.boundingBox();
		const viewport = page.viewportSize()!;
		expect(box!.y).toBeGreaterThanOrEqual(0);
		expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
	});

	test('the Exit dialog says the game is saved', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await page.getByRole('button', { name: 'Exit game' }).click();
		await expect(page.getByText('Exit the game?')).toBeVisible();
		await expect(page.getByText('Your progress is saved. Pick it up from home.')).toBeVisible();
		await page.getByRole('button', { name: 'Keep playing' }).click();
		await expect(page.getByText('Exit the game?')).toHaveCount(0);
	});
});

test.describe('Results move on by themselves', () => {
	test.afterEach(async ({ page }) => {
		await store(page, 'rnd.resetRNG()').catch(() => {});
	});

	test('a Stability result is announced, shows a run-out line, then the next card comes', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(page, ['7', '4']);
		await store(page, 'rnd.mockDieRoll(13)');
		await dismissCard(page);

		const check = page.getByTestId('failure-check-button');
		await expect(check).toHaveAccessibleName('Roll for Stability');
		await pressStep(page, 'failure-check-button');
		const line = 'Rolled 13 · no Stability lost';
		await expect(page.getByTestId('result-line')).toHaveText(line, { timeout: 30000 });
		// The totals are in the announcement, not on the line
		await expect(page.getByTestId('live-region')).toHaveText(`${line}. Stability 20 of 20.`);
		await expect(check).toHaveAccessibleName('Draw the next card');
		// The run-out line runs under reduced motion too (in quarters)
		await expect(page.getByTestId('step-advance')).toBeVisible();

		// No press: the second card is drawn on its own
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toBeVisible({ timeout: 5000 });
		await expect(page.getByTestId('card-progress')).toContainText('Card 2 of 2');
	});

	test('a press moves on at once', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(page, ['7', '4']);
		await store(page, 'rnd.mockDieRoll(13)');
		await dismissCard(page);
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('failure-check-button')).toHaveAccessibleName(
			'Draw the next card',
			{ timeout: 30000 }
		);

		const pressed = Date.now();
		await pressStep(page, 'failure-check-button');
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toBeVisible();
		// Well inside the 2s hold (the 400ms changed-meaning guard comes first)
		expect(Date.now() - pressed).toBeLessThan(1500);
	});

	test('the fatal roll waits for the player on "Face the end"', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(page, ['7', '4'], 'gs.gameState.tower = 2');
		await store(page, 'rnd.mockDieRoll(3)');
		await dismissCard(page);
		await pressStep(page, 'failure-check-button');

		const check = page.getByTestId('failure-check-button');
		await expect(check).toHaveAccessibleName('Face the end', { timeout: 30000 });
		await expect(page.getByTestId('step-advance')).toHaveCount(0);
		await page.waitForTimeout(3000);
		await expect(check).toHaveAccessibleName('Face the end');

		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('screen-gameOver')).toBeVisible();
	});

	test('a missed Salvation roll loses no Token, and the journal opens on its own', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['4', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 2, aceOfHeartsRevealed: true, tokens: 5 })'
		);
		await dismissCard(page);
		await dismissCard(page);

		const salvation = page.getByTestId('success-check-button');
		await expect(salvation).toHaveAccessibleName('Roll for Salvation');
		await expect(page.locator('.context-description')).toHaveText(
			'You need 14+ to remove a Token.'
		);
		await store(page, 'rnd.mockDieRoll(9)');
		await pressStep(page, 'success-check-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 9 · missed 14+', {
			timeout: 30000
		});
		await expect(salvation).toHaveAccessibleName('Open your journal');
		await expect(page.getByTestId('hud-tokens')).toContainText('5');
		await expect(page.getByRole('dialog', { name: 'Journal entry' })).toBeVisible({
			timeout: 5000
		});
	});

	test('on Hard, a missed Salvation roll adds a Token', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['4', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 2, aceOfHeartsRevealed: true, tokens: 5 }); gs.gameState.config.options.difficulty = 2'
		);
		await dismissCard(page);
		await dismissCard(page);
		await expect(page.locator('.context-description')).toHaveText(
			'You need 14+ to remove a Token. A miss adds one.'
		);
		await store(page, 'rnd.mockDieRoll(9)');
		await pressStep(page, 'success-check-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 9 · missed 14+ · +1 Token', {
			timeout: 30000
		});
		await expect(page.getByTestId('hud-tokens')).toContainText('6');
	});

	test("on Easy, the fourth Ace's Stability check is the last roll: survive it and you escape", async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['A:plain', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 3, aceOfHeartsRevealed: true, tokens: 6, tower: 9 }); gs.gameState.config.options.difficulty = 0'
		);
		// The card says what it means
		await expect(page.getByTestId('card')).toHaveClass(/revealed/, { timeout: 30000 });
		await expect(page.getByTestId('card-mechanic')).toHaveText(
			'The fourth Ace · survive its Stability check and you escape'
		);
		await page.getByTestId('card').click();

		await expect(page.getByRole('heading', { name: 'Final Check' })).toBeVisible();
		await expect(page.locator('.context-description')).toHaveText(
			'Come through this roll with any Stability left and you escape.'
		);
		const check = page.getByTestId('failure-check-button');
		await expect(check).toHaveAccessibleName('Roll for Stability');
		await store(page, 'rnd.mockDieRoll(13)');
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('result-line')).toHaveText(
			'Rolled 13 · no Stability lost · you escape',
			{ timeout: 30000 }
		);

		// The ending waits for the player: no run-out line, nothing moves on
		await expect(check).toHaveAccessibleName('Escape');
		await expect(page.getByTestId('step-advance')).toHaveCount(0);
		await page.waitForTimeout(3000);
		await expect(check).toHaveAccessibleName('Escape');

		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('screen-gameOver')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Victory' })).toBeVisible();
		await expect(page.getByTestId('game-over-cause')).toHaveText('The fourth Ace was revealed.');
	});

	test("on Easy, the fourth Ace's check that takes the last Stability loses the game", async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['A:plain', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 3, aceOfHeartsRevealed: true, tokens: 6, tower: 2 }); gs.gameState.config.options.difficulty = 0'
		);
		await dismissCard(page);
		await store(page, 'rnd.mockDieRoll(4)');
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 4 · −2 Stability · you fall', {
			timeout: 30000
		});
		await expect(page.getByTestId('failure-check-button')).toHaveAccessibleName('Face the end');
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('screen-gameOver')).toBeVisible();
		await expect(page.getByText('Your Stability reached 0.')).toBeVisible();
	});

	test('on Easy, a fourth Ace that skips its Stability check frees you outright', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['A:skip-damage', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 3, aceOfHeartsRevealed: true, tokens: 6, tower: 9 }); gs.gameState.config.options.difficulty = 0'
		);
		await expect(page.getByTestId('card')).toHaveClass(/revealed/, { timeout: 30000 });
		await expect(page.getByTestId('card-mechanic')).toHaveText('The fourth Ace · you escape');
		await page.getByTestId('card').click();

		await expect(page.getByTestId('screen-gameOver')).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('heading', { name: 'Victory' })).toBeVisible();
		await expect(page.getByTestId('game-over-cause')).toHaveText('The fourth Ace was revealed.');
	});

	test('on Normal, the fourth Ace ends nothing: an ordinary check, then Salvation with no target', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['A:plain:diamonds', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 3, aceOfHeartsRevealed: true, tokens: 3, tower: 16 })'
		);
		// The card says what it means: the target goes, the check stays
		await expect(page.getByTestId('card')).toHaveClass(/revealed/, { timeout: 30000 });
		await expect(page.getByTestId('card-mechanic')).toHaveText(
			'Salvation now has no target · a Stability check follows'
		);
		await page.getByTestId('card').click();

		await expect(page.getByRole('heading', { name: 'Stability Check', exact: true })).toBeVisible();
		await expect(page.getByTestId('hud-aces')).toHaveAttribute(
			'title',
			'All four Aces: each Salvation is a Stability check; hold on and a Token comes off'
		);
		const check = page.getByTestId('failure-check-button');
		await expect(check).toHaveAccessibleName('Roll for Stability');
		await store(page, 'rnd.mockDieRoll(13)');
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 13 · no Stability lost', {
			timeout: 30000
		});

		// The round goes on: the second card, then Salvation, which is now a Stability check
		await dismissCard(page);
		const salvation = page.getByTestId('success-check-button');
		await expect(salvation).toHaveAccessibleName('Roll for Salvation');
		await expect(page.locator('.context-description')).toHaveText(
			'No target now. Survive this Stability check and a Token comes off.'
		);
		await store(page, 'rnd.mockDieRoll(4)');
		await pressStep(page, 'success-check-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 4 · −2 Stability · −1 Token', {
			timeout: 30000
		});
		await expect(page.getByTestId('hud-stability')).toContainText('14');
		await expect(page.getByTestId('hud-tokens')).toContainText('2');
		await expect(page.getByRole('dialog', { name: 'Journal entry' })).toBeVisible({
			timeout: 5000
		});
	});

	test('on Normal, a skip-damage fourth Ace only skips its check', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['A:skip-damage', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 3, aceOfHeartsRevealed: true, tokens: 6, tower: 9 })'
		);
		await expect(page.getByTestId('card')).toHaveClass(/revealed/, { timeout: 30000 });
		await expect(page.getByTestId('card-mechanic')).toHaveText('Salvation now has no target');
		await page.getByTestId('card').click();

		// No check and no ending: the second card comes
		await dismissCard(page);
		await expect(page.getByTestId('success-check-button')).toHaveAccessibleName(
			'Roll for Salvation'
		);
	});

	test('on Hard, with four Aces, Salvation takes a Stability check, then the token comes off', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['4', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 4, aceOfHeartsRevealed: true, tokens: 3, tower: 16 }); gs.gameState.config.options.difficulty = 2'
		);
		await dismissCard(page);
		await dismissCard(page);

		const salvation = page.getByTestId('success-check-button');
		await expect(salvation).toHaveAccessibleName('Roll for Salvation');
		await expect(page.locator('.context-description')).toHaveText(
			'No target now. Survive this Stability check and a Token comes off.'
		);
		await store(page, 'rnd.mockDieRoll(4)');
		await pressStep(page, 'success-check-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 4 · −2 Stability · −1 Token', {
			timeout: 30000
		});
		await expect(page.getByTestId('hud-stability')).toContainText('14');

		// The journal opens on its own
		await expect(page.getByRole('dialog', { name: 'Journal entry' })).toBeVisible({
			timeout: 5000
		});
	});

	test('on Hard, with four Aces, a Stability check that takes the last Stability ends the game', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);
		await playRound(
			page,
			['4', '6'],
			'Object.assign(gs.gameState, { acesRevealed: 4, aceOfHeartsRevealed: true, tokens: 1, tower: 1 }); gs.gameState.config.options.difficulty = 2'
		);
		await dismissCard(page);
		await dismissCard(page);
		await store(page, 'rnd.mockDieRoll(8)');
		await pressStep(page, 'success-check-button');

		await expect(page.getByTestId('result-line')).toHaveText('Rolled 8 · −1 Stability · you fall', {
			timeout: 30000
		});
		await expect(page.getByTestId('success-check-button')).toHaveAccessibleName('Face the end');
		await pressStep(page, 'success-check-button');
		await expect(page.getByTestId('screen-gameOver')).toBeVisible();
		await expect(page.getByText('Your Stability reached 0.')).toBeVisible();
	});
});

test.describe('Rule tips', () => {
	test.afterEach(async ({ page }) => {
		await store(page, 'rnd.resetRNG()').catch(() => {});
	});

	test('a RULE caption shows in play, none once tips are off, and they return when on', async ({
		page
	}) => {
		await openGame(page, { ruleTips: true });
		await playToFirstRound(page);
		await playRound(page, ['7', '9']);
		await dismissCard(page);

		// The caption starts as the Stability check opens, docked above the step button
		const caption = page.getByTestId('rule-caption');
		await expect(caption).toContainText('Odd cards call for a Stability check.');

		await setRuleTips(page, false);
		await expect(caption).toHaveCount(0);
		await store(page, 'rnd.mockDieRoll(20)');
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('result-line')).toContainText('Natural 20', { timeout: 30000 });
		await expect(caption).toHaveCount(0); // no "Lucid" tip

		// The next card comes on its own; its Stability check shows no tip either
		await dismissCard(page);
		await expect(page.getByTestId('failure-check-button')).toBeVisible();
		await expect(caption).toHaveCount(0);

		await setRuleTips(page, true);
		await store(page, 'rnd.mockDieRoll(1)'); // Lucid: two dice, both 1
		await pressStep(page, 'failure-check-button');
		await expect(page.getByTestId('result-line')).toContainText('Natural 1', { timeout: 30000 });
		// A caption starts only on arriving at a table screen: the next one is Round 2's roll,
		// after the journal, where the Surreal hint shows too
		const journal = page.getByRole('dialog', { name: 'Journal entry' });
		await expect(journal).toBeVisible({ timeout: 10000 });
		// The sheet takes presses once it has settled: press until it records and moves on
		await expect(async () => {
			await journal.getByTestId('journal-save-button').click({ timeout: 2000 });
			await expect(page.getByTestId('roll-tasks-button')).toBeVisible({ timeout: 3000 });
		}).toPass({ timeout: 20000 });
		await expect(caption).toHaveText(/A natural 1 makes you Surreal, for one roll: this one\./);
		await expect(page.getByTestId('roll-modifier')).toHaveText(
			'Surreal · two dice, keep the lower'
		);
	});
});

test.describe('Reduced motion', () => {
	test('shows the roll as a number, with no 3D throw', async ({ page }) => {
		await openGame(page);
		await page.getByTestId('story-continue-button').click();
		await store(page, 'rnd.mockDieRoll(13)');
		// The number is up for 600ms: record it as it appears rather than racing to see it
		await page.evaluate(() => {
			const seen: string[] = [];
			(window as unknown as { staticRollSeen: string[] }).staticRollSeen = seen;
			new MutationObserver(() => {
				const el = document.querySelector('[data-testid="static-roll"]');
				if (el) seen.push(el.textContent?.trim() ?? '');
			}).observe(document.body, { childList: true, subtree: true });
		});
		await pressStep(page, 'initial-damage-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 13 · no Stability lost');
		const seen = await page.evaluate(
			() => (window as unknown as { staticRollSeen: string[] }).staticRollSeen
		);
		expect(seen).toContain('13');
		await expect(page.getByTestId('static-roll')).toHaveCount(0);
	});
});
