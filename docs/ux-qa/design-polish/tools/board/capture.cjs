// Board and HUD captures for the design review.
// Usage: ROUND=1 node capture.cjs [--vp=a,b] [--groups=home,normal,easy,hard,captions,hud,reduced,extended]
//   ONLY=<regex> limits which states are written (the flow still runs).
// Output: round-N/shots/board/<state>/<vp>.png, round-N/raw/board/<state>/<vp>.{json,notext.png}
// Then run build.py to make metrics-board.json, the sheets, the drift report and the manifest.
const fs = require('fs');
const path = require('path');
const { OUT, RAW, BASE, CORE, EXTENDED, VIEWPORTS, launchBrowser, newContext, store, snap, setHidden, sleep, until } = require('./lib.cjs');
const { saveJournal, settle, makeCapture, pressStep, roll, enter, waitCard, tapCard, stackDeck, cardExpr, openGame, toRoundOne, CLEAN } = require('./steps.cjs');

const argv = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const VPS = argv.vp ? argv.vp.split(',') : Object.keys(CORE);
const GROUPS = argv.groups ? argv.groups.split(',') : ['home', 'normal', 'easy', 'hard', 'captions', 'captionsEasy', 'captionsHard', 'hud', 'autoplay'];

fs.mkdirSync(RAW, { recursive: true });

// ---------------------------------------------------------------------------------------------
// Groups. Each gets (browser, vp, ctxLog) and opens its own context(s).
// ---------------------------------------------------------------------------------------------

async function withPage(browser, vp, opts, fn, log) {
	const ctx = await newContext(browser, vp, opts);
	const page = await ctx.newPage();
	page.on('pageerror', (e) => log({ pageerror: e.message.slice(0, 200) }));
	page.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && log({ consoleError: m.text().slice(0, 200) }));
	try {
		await fn(page, makeCapture(page, vp, log));
	} finally {
		await ctx.close();
	}
}

const unreachable = [];
const miss = (vp, state, why) => unreachable.push({ vp, state, why });

/** The step screen hop + roll + capture for one forced result */
async function forcedResult(page, cap, state, target, setup, value, how, extra = {}) {
	await enter(page, target, setup);
	await roll(page, value);
	if (extra.group === 'skip') return; // a repeat that only leads somewhere: not captured
	await cap(state, { board: true, how, ...extra });
}

const G = {};

G.home = async (browser, vp, log) =>
	withPage(browser, vp, {}, async (page, cap) => {
		await page.goto(BASE + '/');
		await page.locator('[data-testid="home-page"], main').first().waitFor({ timeout: 30000 });
		await sleep(1500);
		await cap('home', { how: 'Home page (/), splash and first-run panel already seen' });
	}, log);

G.normal = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 1 }, async (page, cap) => {
		const wide = VIEWPORTS[vp].viewport.width > 720;
		await openGame(page);
		await cap('intro', { how: 'Normal. /game/future-lost as loaded: the intro, scrolled to the top' });
		const scrolled = await page.evaluate(() => {
			const el = document.querySelector('.intro-scroll-area .content');
			if (!el || el.scrollHeight <= el.clientHeight + 1) return false;
			el.scrollTop = el.scrollHeight;
			return true;
		});
		await sleep(400);
		await cap('intro-end', { how: scrolled ? 'The intro scrolled to the bottom (intro goal line and Begin button)' : 'The intro fits: same view as intro (nothing to scroll)' });
		await page.locator('[data-testid="story-continue-button"]').click();
		await until(page, () => !!document.querySelector('#step-action .aug-button'), { label: 'instability step' });
		await cap('instability-roll', { board: true, how: 'Real flow: Begin Your Journey on the intro' });
		await roll(page, 8);
		await cap('instability-result', { board: true, how: 'Real flow: Roll for instability, die mocked to 8 (-1 Stability)' });
		await pressStep(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'rollForTasks');
		await cap('round-start', { board: true, how: 'Real flow: Continue after the opening roll (Round 1, Roll for Tasks)' });

		// Round 1 through the real flow: Event, Challenge, King, Ace of Hearts, a Narrative Ace
		const deck = await stackDeck(page, ['2c', '7s', 'Kh', 'Ah', 'Ad']);
		log({ round1: deck });
		await roll(page, 16);
		await cap('task-result', { board: true, how: 'Real flow: Roll for Tasks mocked to 16 (5 cards); the result hold is paused at its start' });
		await pressStep(page);
		await waitCard(page);
		await cap('card-event', { how: 'Real flow: first card of the deal (2 of Clubs, Event)' });
		await tapCard(page);
		await waitCard(page);
		await cap('card-challenge', { how: 'Real flow: second card (7 of Spades, Challenge)' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await cap('stability-check', { board: true, how: 'Real flow: tapping the 7 of Spades (odd) opens the Stability check; rule tips off' });
		// Mid-throw: the dice up, the label Rolling...
		await store(page, 'rnd.mockDieRoll(15)');
		await page.locator('#step-action .aug-button').click();
		await store(page, 'rnd.resetRNG()');
		await sleep(250);
		await cap('stability-rolling', { board: true, noSettle: true, how: 'Real flow: the Stability check roll ~250ms after the press, dice in the air (swiftshader: the 3D dice may lag)' });
		await until(page, async () => {
			const d = await import('/src/lib/stores/diceStore.svelte.js');
			if (d.diceState.isRolling) { d.skipRoll(); return false; }
			return !!document.querySelector('[data-testid="result-line"]');
		});
		await cap('stability-11-19', { board: true, how: 'Real flow: Stability check die mocked to 15 (no loss)' });
		await pressStep(page);
		await waitCard(page);
		await cap('card-king', { how: 'Real flow: King of Hearts (first King)' });
		await tapCard(page);
		await waitCard(page);
		await cap('card-ace-hearts', { how: 'Real flow: Ace of Hearts (Primary Success) after one King' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await cap('stability-check-ace', { board: true, how: 'Real flow: the Ace of Hearts is odd: its Stability check' });
		await roll(page, 8);
		await cap('stability-6-10', { board: true, how: 'Real flow: Ace of Hearts check, die mocked to 8 (-1)' });
		await pressStep(page);
		await waitCard(page);
		await cap('card-ace-narrative', { how: 'Real flow: Ace of Diamonds (Narrative, no modifier), the second Ace' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await roll(page, 3);
		await cap('stability-2-5', { board: true, how: 'Real flow: Ace of Diamonds check, die mocked to 3 (-2)' });
		await pressStep(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'successCheck');
		await cap('salvation-n2-step', { board: true, how: 'Real flow: the round ends with the Ace of Hearts out: Salvation with 2 Aces (need 14+)' });
		await roll(page, 9);
		await cap('salvation-n2-miss', { board: true, how: 'Real flow: Salvation die mocked to 9 (miss, Normal: no token change)' });
		await pressStep(page);
		await page.locator('[data-testid="journal-save-button"]').waitFor({ timeout: 15000 });
		await cap('journal-entry', { how: 'Real flow: the journal after round 1 (empty entry)' });
		await saveJournal(page, 'The hideout held, for now. I kept the radio off.');
		await cap('round-start-r2', { board: true, how: 'Real flow: Round 2 after saving the journal' });

		// ---- Forced from here: Roll for Tasks copy variants and modifier hints ----
		const base = `${CLEAN} g.tower = 14; g.tokens = 10;`;
		await forcedResult(page, cap, 'task-result-nat1', 'rollForTasks', base, 1, 'Forced: Roll for Tasks die mocked to 1 (one card, Surreal)');
		await enter(page, 'rollForTasks', '');
		await cap('round-start-surreal', { board: true, how: 'Forced: Roll for Tasks with Surreal pending (after the natural 1)' });
		await roll(page, 20);
		await cap('task-result-nat20', { board: true, how: 'Forced: Surreal roll for tasks, both dice mocked to 20 (6 cards, Lucid)' });
		await enter(page, 'rollForTasks', '');
		await cap('round-start-lucid', { board: true, how: 'Forced: Roll for Tasks with Lucid pending (after the natural 20)' });

		// ---- Stability: natural 1 and 20, Lucid and Surreal hints, 2d20 results, the result hold ----
		const check = `${base} g.lastCard = ${cardExpr('9s')};`;
		await forcedResult(page, cap, 'stability-nat1', 'failureCheck', check, 1, 'Forced: Stability check on the 9 of Spades at 14 Stability, die mocked to 1 (-3, Surreal)');
		await enter(page, 'failureCheck', `g.lastCard = ${cardExpr('9s')};`);
		await cap('stability-check-surreal', { board: true, how: 'Forced: Stability check with Surreal pending (button hint)' });
		await roll(page, [6, 15]);
		await cap('stability-2d20-surreal', { board: true, how: 'Forced: Surreal Stability check, dice mocked to 6 and 15 (keeps 6: -1)' });
		await forcedResult(page, cap, 'stability-nat20', 'failureCheck', check, 20, 'Forced: Stability check at 14 Stability, die mocked to 20 (+1, Lucid)');
		await enter(page, 'failureCheck', `g.lastCard = ${cardExpr('9s')};`);
		await cap('stability-check-lucid', { board: true, how: 'Forced: Stability check with Lucid pending (button hint)' });
		await roll(page, [6, 15]);
		await cap('stability-2d20-lucid', { board: true, how: 'Forced: Lucid Stability check, dice mocked to 6 and 15 (keeps 15: no loss)' });
		// The result hold, with its run-out line part way
		await enter(page, 'failureCheck', check);
		await setHidden(page, false);
		await roll(page, 8);
		await sleep(1000);
		await setHidden(page, true);
		await cap('result-hold', { board: true, how: 'Forced: Stability check (8, -1); the 2s result hold is let run ~1s, then paused, so the run-out line is part way' });

		// ---- Salvation on Normal: 1-4 Aces, natural 20 / hit / miss / natural 1 ----
		const NEED = { 1: 17, 2: 14, 3: 11 };
		for (const k of [1, 2, 3, 4]) {
			const setup = `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = ${k}; g.tokens = 6; g.tower = 14; g.lastCard = null;`;
			if (k !== 2) {
				await enter(page, 'successCheck', setup);
				await cap(`salvation-n${k}-step`, { board: true, how: `Forced: Salvation on Normal with ${k} Ace${k > 1 ? 's' : ''}, 6 tokens, 14 Stability` });
			}
			const rolls = k < 4 ? [['nat20', 20], ['hit', NEED[k]], ...(k === 2 ? [] : [['miss', NEED[k] - 1]]), ['nat1', 1]] : [['nat20', 20], ['hold', 15], ['loss', 8], ['nat1', 1]];
			for (const [name, v] of rolls) {
				await forcedResult(page, cap, `salvation-n${k}-${name}`, 'successCheck', setup, v, `Forced: Salvation on Normal with ${k} Aces, die mocked to ${v}`);
			}
		}
		await enter(page, 'successCheck', `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 2; g.tokens = 6; g.tower = 14; g.lastCard = null; g.isLucid = true;`);
		await cap('salvation-step-lucid', { board: true, how: 'Forced: Salvation (2 Aces) with Lucid pending (button hint)' });

		// ---- Endings that wait on the button (then un-ended to carry on) ----
		await forcedResult(page, cap, 'salvation-last-token', 'successCheck', `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 2; g.tokens = 1; g.tower = 14; g.lastCard = null;`, 15, 'Forced: Salvation (2 Aces) with 1 token left, die mocked to 15: the last token, the button waits (Escape)');
		await forcedResult(page, cap, 'salvation-n4-fatal', 'successCheck', `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 4; g.tokens = 6; g.tower = 2; g.lastCard = null;`, 3, 'Forced: Salvation with 4 Aces at 2 Stability, die mocked to 3 (-2): Stability lost, the button waits (Face the end)');
		await forcedResult(page, cap, 'stability-fatal', 'failureCheck', `${CLEAN} g.tower = 2; g.tokens = 6; g.lastCard = ${cardExpr('9s')};`, 3, 'Forced: Stability check at 2 Stability, die mocked to 3 (-2): the button waits (Face the end)');

		// ---- Modifier cards: return-king (a King is out) then skip-damage as the round's last card ----
		await enter(page, 'rollForTasks', `${CLEAN} g.tower = 14; g.tokens = 6; g.acesRevealed = 2; g.aceOfHeartsRevealed = true; g.kingsRevealed = 1; g.kingOfHearts = true; g.lastCard = null;`);
		log({ modDeck: await stackDeck(page, ['As', 'Ac']) });
		await store(page, `const g = gs.gameState; g.cardsToDraw = 2; g.taskRoll = { roll: 4, dice: [4], cards: 2 }; g.state = 'drawCard';`);
		await waitCard(page);
		await cap('card-return-king', { how: 'Forced deal of 2 cards (taskRoll 4): Ace of Spades (Narrative, return-king) with the King of Hearts out' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await cap('notice-return-king', { board: true, how: 'Flow from the forced deal: the return-king Ace is odd, so its Stability check, with the modifier notice' });
		await roll(page, 15);
		await cap('notice-return-king-result', { board: true, how: 'Same check, die mocked to 15: the notice and the result line together' });
		await pressStep(page);
		await waitCard(page);
		await cap('card-skip-damage', { how: 'Flow: second card of the forced deal, Ace of Clubs (Narrative, skip-damage)' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'successCheck');
		await cap('notice-skip-damage', { board: true, how: 'Flow: skip-damage as the last card: no Stability check, Salvation (4 Aces) opens with the notice' });

		// ---- Keyboard: the skip link and the focused step button ----
		await enter(page, 'rollForTasks', `${CLEAN} g.tower = 14; g.tokens = 6; g.lastCard = null;`);
		await page.evaluate(() => document.activeElement?.blur());
		await page.keyboard.press('Tab');
		await sleep(300);
		await cap('keyboard-skip-link', { board: true, how: 'Forced Round start, then Tab once: the skip link ("Skip to action") is focused' });
		await page.keyboard.press('Enter');
		await sleep(300);
		await cap('keyboard-step-focus', { board: true, how: 'Enter on the skip link: focus moves to the step button (focus ring; Space key-cap on pointer devices)' });
		await page.evaluate(() => document.activeElement?.blur());

		// ---- Header: the phone menu, the dice theme picker, auto-play ----
		if (!wide) {
			await page.locator('.more-button').click();
			await sleep(400);
			await cap('header-menu', { board: true, how: 'The header ⋯ menu open (phones, 720px and narrower)' });
			await page.keyboard.press('Escape');
			await sleep(300);
			await page.locator('.more-button').click();
			await sleep(300);
			await page.locator('.game-menu-item', { hasText: 'Dice theme' }).click();
		} else {
			miss(vp, 'header-menu', 'No ⋯ menu above 720px wide: every header control is shown in the bar (see any board state)');
			await page.locator('.dice-theme-button').click();
		}
		await sleep(700);
		await cap('dice-theme-picker', { how: 'The Dice theme picker opened from the header' });
		await page.keyboard.press('Escape');
		await sleep(500);
		await settle(page);
		if (await page.locator('[role="dialog"]:visible').count()) {
			log({ note: 'dice picker still open after Escape: clicking its close button' });
			await page.locator('[role="dialog"] button[aria-label*="lose"], [role="dialog"] button:has-text("Close"), [role="dialog"] button:has-text("Done")').first().click().catch(() => {});
			await sleep(500);
		}
		// ---- The Stability ending, all the way to the game-over screen ----
		await forcedResult(page, cap, 'stability-fatal-2', 'failureCheck', `${CLEAN} g.tower = 2; g.tokens = 6; g.lastCard = ${cardExpr('9s')};`, 3, 'Forced (repeat of stability-fatal, used to reach the ending)', { group: 'skip' });
		await pressStep(page);
		await page.locator('[data-testid="screen-gameOver"]').waitFor({ timeout: 15000 });
		await sleep(1500);
		await cap('game-over-stability', { how: 'Face the end after the fatal Stability check: the game-over screen (Stability ending)' });
	}, log);

/** Auto-play: the header toggle state, then a real auto-rolled round up to a card's reading hold */
G.autoplay = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 1 }, async (page, cap) => {
		const wide = VIEWPORTS[vp].viewport.width > 720;
		await openGame(page);
		await toRoundOne(page, 12);
		const AUTO = (delay) => `const a = await import('/src/lib/stores/audioStore.svelte.js'); a.updateGameplaySettings({ autoRollDice: true, autoContinueAfterReading: true, autoAdvanceDelay: ${delay}, autoHandleJournaling: 'timed', journalPauseTime: 10000 });`;
		const OFF = `const a = await import('/src/lib/stores/audioStore.svelte.js'); const p = await import('/src/lib/utils/playMode.js'); a.updateGameplaySettings(p.AUTO_PLAY_OFF);`;
		// The toggle state, with a 10 min delay so nothing rolls while it is captured
		await store(page, AUTO(600000));
		await sleep(400);
		await cap('autoplay-on', { board: true, how: 'Auto-play switched on at Round 1 (the header toggle state); its delay set to 10 min so the auto-roll waits during the capture' });
		if (!wide) {
			await page.locator('.more-button').click();
			await sleep(400);
			await cap('header-menu-autoplay-on', { board: true, how: 'The ⋯ menu with Auto-play on' });
			await page.keyboard.press('Escape');
			await sleep(300);
		} else {
			miss(vp, 'header-menu-autoplay-on', 'No ⋯ menu above 720px wide: the AUTO toggle in the bar shows the state (autoplay-on)');
		}
		// A real auto-played deal: off and on again with a 1s delay, task die mocked to 1 (one card)
		log({ autoDeck: await stackDeck(page, ['4h']) });
		await store(page, OFF);
		await sleep(300);
		await setHidden(page, false);
		await store(page, 'rnd.mockDieRoll(1)');
		await store(page, AUTO(1000));
		await page.locator('.byte-container.revealed').waitFor({ timeout: 40000 });
		await store(page, 'rnd.resetRNG()');
		await sleep(1500);
		await cap('autoplay-card', { min: 0, noSettle: true, how: 'Auto-play on (delay 1s): the round auto-rolled (die mocked to 1: one card) and dealt; the Event card ~1.5s into its reading hold (hold line on the card)' });
		await store(page, OFF);
	}, log);

G.easy = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 0 }, async (page, cap) => {
		await openGame(page);
		await cap('easy-intro', { how: 'Easy (player setting). The intro: its goal line reflects the Ace of Hearts already out' });
		await toRoundOne(page, 12);
		await cap('easy-round-start', { board: true, how: 'Easy: Round 1 (Ace of Hearts revealed from the start)' });
		const NEED = { 1: 17, 2: 14, 3: 11 };
		for (const k of [1, 2, 3]) {
			const setup = `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = ${k}; g.tokens = 6; g.tower = 14; g.lastCard = null;`;
			await enter(page, 'successCheck', setup);
			await cap(`salvation-e${k}-step`, { board: true, how: `Forced: Salvation on Easy with ${k} Ace${k > 1 ? 's' : ''}, 6 tokens` });
			for (const [name, v] of [['nat20', 20], ['hit', NEED[k]], ['miss', NEED[k] - 1], ['nat1', 1]]) {
				await forcedResult(page, cap, `salvation-e${k}-${name}`, 'successCheck', setup, v, `Forced: Salvation on Easy with ${k} Aces, die mocked to ${v}`);
			}
		}
		miss(vp, 'salvation-e4-*', 'Unreachable by the rules: on Easy the fourth Ace ends the game, so there is no Salvation with 4 Aces (see easy-final-*)');
		// The fourth Ace
		await enter(page, 'rollForTasks', `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 3; g.tokens = 6; g.tower = 14; g.lastCard = null;`);
		log({ fourthDeck: await stackDeck(page, ['Ad']) });
		await store(page, `const g = gs.gameState; g.cardsToDraw = 1; g.taskRoll = { roll: 1, dice: [1], cards: 1 }; g.state = 'drawCard';`);
		await waitCard(page);
		await cap('card-ace-fourth-easy', { how: 'Easy, forced 3 Aces then a 1-card deal: the Ace of Diamonds as the fourth Ace' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await cap('easy-final-check', { board: true, how: 'Flow: the fourth Ace on Easy: the Final Stability Check' });
		await roll(page, 15);
		await cap('easy-final-escape', { board: true, how: 'Final check die mocked to 15: Stability holds, you escape (the button waits: Escape)' });
		const fin = `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 4; g.tokens = 6; g.lastCard = ${cardExpr('Ad')};`;
		await forcedResult(page, cap, 'easy-final-fatal', 'failureCheck', `${fin} g.tower = 2;`, 3, 'Forced: the final check at 2 Stability, die mocked to 3: Stability lost (Face the end)');
		await forcedResult(page, cap, 'easy-final-escape-2', 'failureCheck', `${fin} g.tower = 14;`, 15, 'Forced repeat of easy-final-escape, to reach the ending', { group: 'skip' });
		await pressStep(page);
		await page.locator('[data-testid="screen-gameOver"]').waitFor({ timeout: 15000 });
		await sleep(1500);
		await cap('game-over-win', { how: 'Escape after the fourth Ace on Easy: the game-over screen (win)' });
	}, log);

G.hard = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 2 }, async (page, cap) => {
		await openGame(page);
		await toRoundOne(page, 12);
		const setup = `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 1; g.tokens = 6; g.tower = 14; g.lastCard = null;`;
		await enter(page, 'successCheck', setup);
		await cap('salvation-h1-step', { board: true, how: 'Hard: forced Salvation with 1 Ace, 6 tokens' });
		await forcedResult(page, cap, 'salvation-hard-miss', 'successCheck', setup, 9, 'Hard: Salvation die mocked to 9 (miss: +1 token)');
		await forcedResult(page, cap, 'salvation-hard-nat1', 'successCheck', setup, 1, 'Hard: Salvation die mocked to 1 (+2 tokens, Surreal)');
		await forcedResult(page, cap, 'salvation-hard-over', 'successCheck', `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 1; g.tokens = 10; g.tower = 14; g.lastCard = null;`, 9, 'Hard: a miss at 10 tokens takes tokens above the start (11/10)');
		// The fourth King
		await enter(page, 'rollForTasks', `${CLEAN} g.tower = 14; g.tokens = 6; g.kingsRevealed = 3; g.kingOfHearts = g.kingOfDiamonds = g.kingOfClubs = true; g.lastCard = null;`);
		await store(page, `const g = gs.gameState; for (const s of ['hearts','diamonds','clubs']) { const i = g.deck.findIndex((c) => c.card === 'K' && c.suit === s); if (i >= 0) g.deck.splice(i, 1); }`);
		log({ kingDeck: await stackDeck(page, ['Ks']) });
		await store(page, `const g = gs.gameState; g.cardsToDraw = 1; g.taskRoll = { roll: 1, dice: [1], cards: 1 }; g.state = 'drawCard';`);
		await waitCard(page);
		await cap('card-king-final', { how: 'Hard, forced 3 Kings out then a 1-card deal: the King of Spades, the fourth King' });
		await tapCard(page);
		await page.locator('[data-testid="screen-gameOver"]').waitFor({ timeout: 15000 });
		await sleep(1500);
		await cap('game-over-kings', { how: 'Tapping the fourth King: the game-over screen (Kings ending)' });
	}, log);

/** Rule captions, tips on: every caption as it first shows on the table, in a real game */
const CAPTION_IDS = [
	[/^Odd cards/, 'odd'],
	[/of 4\. When all four Kings/, 'king'],
	[/^Salvation unlocked/, 'salvation'],
	[/^Each Ace makes salvation easier\. With all four/, 'ace-four'],
	[/One more Ace and you escape/, 'ace-third'],
	[/^Each Ace makes salvation easier/, 'ace'],
	[/^Lucid\./, 'lucid'],
	[/^Surreal\./, 'surreal'],
	[/^The fourth Ace/, 'fourth-ace'],
	[/^A failed salvation roll/, 'token']
];
function captionHelper(page, cap, log, prefix = '') {
	const got = new Set();
	return {
		got,
		async check(where) {
			await settle(page, { min: 300 });
			const s = await snap(page);
			if (!s.caption) return null;
			const text = s.caption.replace(/^RULE\s*/i, '');
			const id = (CAPTION_IDS.find(([re]) => re.test(text)) || [null, 'other'])[1];
			if (got.has(id)) return id;
			got.add(id);
			await cap(`caption-${prefix}${id}`, { board: true, how: `Rule tips on (${prefix ? prefix.replace(/-$/, '') : 'Normal'}): the "${id}" caption as it first shows, on ${where}` });
			// Dismiss it, so the next one can show on the next screen
			await page.locator('[data-testid="rule-caption"]').click().catch(() => {});
			await sleep(300);
			return id;
		}
	};
}

G.captions = async (browser, vp, log) => {
	// Normal: real rounds, each caption checked on every table screen. A caption starts only when
	// the screen type changes, so the queue drains over three rounds.
	await withPage(browser, vp, { difficulty: 1, tips: true }, async (page, cap) => {
		const c = captionHelper(page, cap, log);
		await openGame(page);
		await toRoundOne(page, 12);
		const rounds = [
			{ deck: ['7s', 'Kh', 'Ah', '3c', 'Ad'], tasks: 16, checks: [15, 20, [1, 1], 8] },
			{ deck: ['5d', '2h'], tasks: 3, checks: [15] },
			{ deck: ['9c', '4d'], tasks: 3, checks: [15] },
			{ deck: ['3s', '6h'], tasks: 3, checks: [15] }
		];
		const want = ['odd', 'king', 'salvation', 'ace', 'lucid', 'surreal'];
		const state = async () => (await snap(page)).state;
		for (let r = 0; r < rounds.length && !want.every((id) => c.got.has(id)); r++) {
			const plan = rounds[r];
			await c.check(`Round ${r + 1} (Roll for Tasks)`);
			log({ capDeck: await stackDeck(page, plan.deck) });
			await roll(page, plan.tasks);
			await c.check(`the Round ${r + 1} task result`);
			await pressStep(page);
			let checks = 0;
			for (let guard = 0; guard < 20; guard++) {
				const st = await state();
				if (st === 'drawCard') {
					await waitCard(page);
					await tapCard(page);
				} else if (st === 'failureCheck') {
					await c.check(`a Stability check (round ${r + 1}, check ${checks + 1})`);
					await roll(page, plan.checks[checks++] ?? 15);
					await c.check(`a Stability check result (round ${r + 1})`);
					await pressStep(page);
				} else if (st === 'successCheck') {
					await c.check(`Salvation (round ${r + 1})`);
					await roll(page, 9);
					await c.check(`the Salvation result (round ${r + 1})`);
					await pressStep(page);
				} else if (st === 'log') {
					await saveJournal(page);
					break;
				} else {
					await sleep(500);
				}
			}
		}
		for (const id of want) if (!c.got.has(id)) miss(vp, `caption-${id}`, 'Did not show on a table screen in four scripted Normal rounds');
	}, log);
}; // end of G.captions (Normal)

/** Easy, tips on: odd and Salvation in a real round, then the third Ace's caption and the fourth Ace's */
G.captionsEasy = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 0, tips: true }, async (page, cap) => {
		const c = captionHelper(page, cap, log, 'easy-');
		await openGame(page);
		await toRoundOne(page, 12);
		await c.check('Easy Round 1');
		log({ capDeck: await stackDeck(page, ['7s', '2c']) });
		await roll(page, 3); // 2 cards
		await pressStep(page);
		await waitCard(page);
		await tapCard(page);
		await c.check('the Easy Stability check (7 of Spades)');
		await roll(page, 15);
		await pressStep(page);
		await waitCard(page);
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'successCheck', { label: 'Easy Salvation' });
		await c.check('Easy Salvation (round 1)');
		await roll(page, 9);
		await pressStep(page);
		await saveJournal(page);
		await c.check('Easy Round 2');
		await store(page, `const g = gs.gameState; g.acesRevealed = 3;`);
		await c.check('Easy Round 2, after forcing a third Ace');
		log({ capDeck: await stackDeck(page, ['Ad']) });
		await store(page, `const g = gs.gameState; g.cardsToDraw = 1; g.taskRoll = { roll: 1, dice: [1], cards: 1 }; g.state = 'drawCard';`);
		await waitCard(page);
		await tapCard(page);
		await c.check('the Final Stability Check after the fourth Ace (Easy)');
		for (const id of ['ace-third', 'fourth-ace']) if (!c.got.has(id)) miss(vp, `caption-easy-${id}`, 'Did not show in the scripted Easy game');
	}, log);

/** Hard, tips on: the token caption on a missed Salvation */
G.captionsHard = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 2, tips: true }, async (page, cap) => {
		const c = captionHelper(page, cap, log, 'hard-');
		await openGame(page);
		await toRoundOne(page, 12);
		await store(page, `const g = gs.gameState; g.aceOfHeartsRevealed = true; g.acesRevealed = 1;`);
		await sleep(300);
		await page.locator('[data-testid="rule-caption"]').click().catch(() => {});
		await enter(page, 'successCheck', `g.tokens = 6; g.tower = 14; g.lastCard = null;`);
		await c.check('Salvation (Hard)');
		await roll(page, 9);
		await c.check('the missed Salvation (Hard)');
		if (!c.got.has('token')) miss(vp, 'caption-hard-token', 'Did not show on the missed Salvation');
	}, log);

/** The HUD row at every tier: one value moved at a time, the rest at their start */
G.hud = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 1 }, async (page, cap) => {
		await openGame(page);
		await toRoundOne(page, 12);
		await store(page, `window.__deck = gs.gameState.deck.slice();`);
		const BASE_SET = `const g = gs.gameState; ${CLEAN} g.tower = 20; g.tokens = 10; g.kingsRevealed = 0; g.kingOfHearts = g.kingOfDiamonds = g.kingOfClubs = g.kingOfSpades = false;
			g.acesRevealed = 0; g.aceOfHeartsRevealed = false; g.config.options.difficulty = 1; g.deck = window.__deck.slice(); g.diceRoll = 0; dice.diceState.lastRoll = null; g.log = g.log.filter((c) => c.card !== 'A');`;
		const tiers = [
			...[20, 15, 10, 4, 1].map((v) => [`hud-stability-${v}`, `g.tower = ${v};`, `Stability ${v}/20`]),
			...[0, 1, 2, 3, 4].map((v) => [`hud-kings-${v}`, `g.kingsRevealed = ${v}; ${['kingOfHearts', 'kingOfDiamonds', 'kingOfClubs', 'kingOfSpades'].slice(0, v).map((k) => `g.${k} = true;`).join(' ')}`, `Kings ${v}/4`]),
			...[0, 1, 2, 3, 4].map((v) => [`hud-aces-normal-${v}`, `g.acesRevealed = ${v}; g.aceOfHeartsRevealed = ${v > 0};`, `Aces ${v}/4 on Normal`]),
			...[1, 2, 3, 4].map((v) => [`hud-aces-easy-${v}`, `g.config.options.difficulty = 0; g.acesRevealed = ${v}; g.aceOfHeartsRevealed = true;`, `Aces ${v}/4 on Easy (difficulty forced to 0 in the config)`]),
			['hud-tokens-10', `g.tokens = 10;`, 'Tokens full (10/10), Salvation still locked (the start of a game)'],
			['hud-tokens-10-unlocked', `g.tokens = 10; g.acesRevealed = 1; g.aceOfHeartsRevealed = true;`, 'Tokens full (10/10) with Salvation unlocked (1 Ace)'],
			['hud-tokens-5', `g.tokens = 5; g.acesRevealed = 1; g.aceOfHeartsRevealed = true;`, 'Tokens half (5/10), Salvation unlocked (1 Ace)'],
			['hud-tokens-1', `g.tokens = 1; g.acesRevealed = 1; g.aceOfHeartsRevealed = true;`, 'Tokens 1/10, Salvation unlocked (1 Ace)'],
			['hud-tokens-0', `g.tokens = 0; g.acesRevealed = 1; g.aceOfHeartsRevealed = true;`, 'Tokens 0/10 (forced; in play this is the win), Salvation unlocked'],
			['hud-tokens-over', `g.config.options.difficulty = 2; g.tokens = 12; g.acesRevealed = 1; g.aceOfHeartsRevealed = true;`, 'Tokens 12/10 (Hard: a missed Salvation took them above the start)'],
			...[52, 40, 20, 5, 0].map((v) => [`hud-cards-${v}`, `g.deck = window.__deck.slice(0, ${v});`, `Cards ${v} left`]),
			['hud-roll-none', `g.diceRoll = 0;`, 'Roll: no roll yet (--)'],
			['hud-roll-plain', `g.diceRoll = 12; dice.diceState.lastRoll = { rolls: [12], finalValue: 12, isLucid: false, isSurreal: false };`, 'Roll: a plain 12'],
			['hud-roll-single-digit', `g.diceRoll = 7; dice.diceState.lastRoll = { rolls: [7], finalValue: 7, isLucid: false, isSurreal: false };`, 'Roll: a plain 7 (one digit over the unlit 88)'],
			['hud-roll-nat20', `g.diceRoll = 20; g.isLucid = true; dice.diceState.lastRoll = { rolls: [20], finalValue: 20, isLucid: false, isSurreal: false };`, 'Roll: natural 20 as seen in play (Lucid now on)'],
			['hud-roll-nat1', `g.diceRoll = 1; g.isSurreal = true; dice.diceState.lastRoll = { rolls: [1], finalValue: 1, isLucid: false, isSurreal: false };`, 'Roll: natural 1 as seen in play (Surreal now on)'],
			['hud-roll-lucid-pending', `g.diceRoll = 12; g.isLucid = true; dice.diceState.lastRoll = { rolls: [12], finalValue: 12, isLucid: false, isSurreal: false };`, 'Roll: Lucid pending over a non-20 last roll (forced split of the two signals)'],
			['hud-roll-surreal-pending', `g.diceRoll = 12; g.isSurreal = true; dice.diceState.lastRoll = { rolls: [12], finalValue: 12, isLucid: false, isSurreal: false };`, 'Roll: Surreal pending over a non-1 last roll (forced split)'],
			['hud-roll-2d20-lucid', `g.diceRoll = 15; dice.diceState.lastRoll = { rolls: [6, 15], finalValue: 15, isLucid: true, isSurreal: false };`, 'Roll: a 2d20 Lucid result (6, 15 keep 15; Lucid used up)'],
			['hud-roll-2d20-surreal', `g.diceRoll = 6; dice.diceState.lastRoll = { rolls: [6, 15], finalValue: 6, isLucid: false, isSurreal: true };`, 'Roll: a 2d20 Surreal result (6, 15 keep 6)'],
			['hud-all-worst', `g.tower = 1; g.kingsRevealed = 3; g.kingOfHearts = g.kingOfDiamonds = g.kingOfClubs = true; g.acesRevealed = 1; g.aceOfHeartsRevealed = true; g.tokens = 9; g.deck = window.__deck.slice(0, 5); g.diceRoll = 1; g.isSurreal = true;`, 'Combined: every tile at its most urgent at once (1 Stability, 3 Kings, 5 cards, natural 1)'],
			['hud-all-best', `g.tower = 20; g.acesRevealed = 3; g.aceOfHeartsRevealed = true; g.tokens = 1; g.deck = window.__deck.slice(0, 30); g.diceRoll = 20; g.isLucid = true;`, 'Combined: a hopeful late game (3 Aces, 1 token, natural 20)']
		];
		for (const [state, set, how] of tiers) {
			await store(page, BASE_SET);
			await sleep(150);
			await store(page, `const g = gs.gameState; ${set}`);
			await sleep(700);
			await cap(state, { hud: true, how: `HUD forced on Round 1 (Roll for Tasks), all else at start: ${how}` });
		}
		await store(page, BASE_SET);
	}, log);

/** Reduced motion: the main board states (iPhone 13 and desktop) */
G.reduced = async (browser, vp, log) =>
	withPage(browser, vp, { difficulty: 1, reducedMotion: 'reduce' }, async (page, cap) => {
		await openGame(page);
		await cap('rm-intro', { how: 'Reduced motion: the intro' });
		await page.locator('[data-testid="story-continue-button"]').click();
		await until(page, () => !!document.querySelector('#step-action .aug-button'));
		await cap('rm-instability-roll', { board: true, how: 'Reduced motion: Roll for instability' });
		// The static roll shows for 600ms: stretch that one timer so the shot is steady, then skip it
		await page.evaluate(() => {
			const original = window.setTimeout;
			window.__dr_setTimeout = original;
			window.setTimeout = (fn, ms, ...rest) => original(fn, ms === 600 ? 600000 : ms, ...rest);
		});
		await store(page, 'rnd.mockDieRoll(8)');
		await page.locator('#step-action .aug-button').click();
		await store(page, 'rnd.resetRNG()');
		await page.evaluate(() => (window.setTimeout = window.__dr_setTimeout));
		await sleep(900);
		await cap('rm-static-roll', { board: true, noSettle: true, how: 'Reduced motion: the opening roll ~0.9s after the press, its 600ms static-roll timer stretched for the shot. The d20 number is NOT on screen: .static-roll is placed from --hud-bottom, which reads 980px (stale, published before layout settled; the HUD ends at ~128px), so it sits below the viewport. See rm-static-roll-after-resize' });
		await store(page, 'dice.skipRoll()');
		await until(page, () => !!document.querySelector('[data-testid="result-line"]'));
		await cap('rm-instability-result', { board: true, how: 'Reduced motion: the opening roll result (8)' });
		await pressStep(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'rollForTasks');
		await cap('rm-round-start', { board: true, how: 'Reduced motion: Round 1' });
		await stackDeck(page, ['2c', '7s']);
		await roll(page, 3);
		await cap('rm-task-result', { board: true, how: 'Reduced motion: Roll for Tasks mocked to 3 (2 cards)' });
		await pressStep(page);
		await waitCard(page);
		await cap('rm-card-event', { how: 'Reduced motion: the first card (Event)' });
		await tapCard(page);
		await waitCard(page);
		await cap('rm-card-challenge', { how: 'Reduced motion: the second card (Challenge)' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await cap('rm-stability-check', { board: true, how: 'Reduced motion: the Stability check' });
		// --hud-bottom is published on mount and only refreshed on a resize; nudge the window so the
		// static roll sits where it is meant to, and show it again on this check
		const hb = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--hud-bottom'));
		const size = page.viewportSize();
		await page.setViewportSize({ width: size.width + 1, height: size.height });
		await sleep(300);
		await page.setViewportSize(size);
		await sleep(500);
		const hbAfter = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--hud-bottom'));
		log({ hudBottomBefore: hb, hudBottomAfterResize: hbAfter });
		await settle(page);
		await page.evaluate(() => {
			const original = window.setTimeout;
			window.__dr_setTimeout = original;
			window.setTimeout = (fn, ms, ...rest) => original(fn, ms === 600 ? 600000 : ms, ...rest);
		});
		await store(page, 'rnd.mockDieRoll(8)');
		await page.locator('#step-action .aug-button').click();
		await store(page, 'rnd.resetRNG()');
		await page.evaluate(() => (window.setTimeout = window.__dr_setTimeout));
		await sleep(900);
		await cap('rm-static-roll-after-resize', { board: true, noSettle: true, how: `Reduced motion: the Stability check's static roll after a 1px window resize re-published --hud-bottom (${hb.trim()} before, ${hbAfter.trim()} after), so the d20 number shows where it is meant to (timer stretched for the shot)` });
		await store(page, 'dice.skipRoll()');
		await until(page, () => !!document.querySelector('[data-testid="result-line"]'));
		await cap('rm-stability-result', { board: true, how: 'Reduced motion: Stability check mocked to 8 (-1)' });
		await enter(page, 'successCheck', `${CLEAN} g.aceOfHeartsRevealed = true; g.acesRevealed = 2; g.tokens = 6; g.tower = 14; g.lastCard = null;`);
		await cap('rm-salvation-step', { board: true, how: 'Reduced motion: forced Salvation with 2 Aces' });
		await roll(page, 14);
		await cap('rm-salvation-hit', { board: true, how: 'Reduced motion: Salvation mocked to 14 (hit)' });
		await enter(page, 'rollForTasks', `${CLEAN}`);
		await setHidden(page, false);
		await roll(page, 12);
		await sleep(1000);
		await setHidden(page, true);
		await cap('rm-result-hold', { board: true, how: 'Reduced motion: a task result ~1s into its hold (the run-out line steps in quarters)' });
	}, log);

/** Extended viewports: home, round start, a card, a Stability result, the journal, game over */
G.extended = async (browser, vp, log) => {
	await G.home(browser, vp, log);
	await withPage(browser, vp, { difficulty: 1 }, async (page, cap) => {
		await openGame(page);
		await toRoundOne(page, 12);
		await cap('round-start', { board: true, how: 'Real flow: Round 1 (extended viewport)' });
		await stackDeck(page, ['7s', '2c']);
		await roll(page, 3);
		await pressStep(page);
		await waitCard(page);
		await cap('card-challenge', { how: 'Real flow: 7 of Spades (Challenge) (extended viewport)' });
		await tapCard(page);
		await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'failureCheck');
		await roll(page, 8);
		await cap('stability-6-10', { board: true, how: 'Real flow: Stability check on the 7 of Spades mocked to 8 (-1) (extended viewport)' });
		await pressStep(page);
		await waitCard(page);
		await tapCard(page);
		await page.locator('[data-testid="journal-save-button"]').waitFor({ timeout: 15000 });
		await cap('journal-entry', { how: 'Real flow: the journal after round 1 (extended viewport)' });
		await saveJournal(page);
		await forcedResult(page, cap, 'stability-fatal-x', 'failureCheck', `${CLEAN} g.tower = 2; g.tokens = 6; g.lastCard = ${cardExpr('9s')};`, 3, 'Forced fatal check to reach the ending', { group: 'skip' });
		await pressStep(page);
		await page.locator('[data-testid="screen-gameOver"]').waitFor({ timeout: 15000 });
		await sleep(1500);
		await cap('game-over-stability', { how: 'The game-over screen (Stability ending) (extended viewport)' });
	}, log);
};

(async () => {
	const browser = await launchBrowser();
	const t0 = Date.now();
	for (const vp of VPS) {
		const logFile = path.join(RAW, `_log-${vp}-${GROUPS.join('+')}.jsonl`);
		const out = fs.createWriteStream(logFile);
		const log = (o) => {
			const line = JSON.stringify({ t: +((Date.now() - t0) / 1000).toFixed(1), vp, ...o });
			console.log(line.slice(0, 300));
			out.write(line + '\n');
		};
		for (const g of GROUPS) {
			const tg = Date.now();
			log({ group: g, start: true });
			process.env.CUR_GROUP = g;
			try {
				await G[g](browser, vp, log);
			} catch (e) {
				log({ groupFailed: g, error: e.message.split('\n')[0], stack: (e.stack || '').split('\n').slice(1, 4).join(' | ') });
				miss(vp, `group:${g}`, 'Script failed part way: ' + e.message.split('\n')[0]);
			}
			log({ group: g, done: true, s: ((Date.now() - tg) / 1000).toFixed(0) });
		}
		out.end();
	}
	const missFile = path.join(RAW, `_unreachable-${VPS.join('+')}-${GROUPS.join('+')}.json`);
	fs.writeFileSync(missFile, JSON.stringify(unreachable, null, 1));
	await browser.close();
	console.log('DONE', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})().catch((e) => {
	console.error('FATAL', e);
	process.exit(1);
});
