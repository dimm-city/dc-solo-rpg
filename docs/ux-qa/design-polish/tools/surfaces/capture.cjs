// Design review, surfaces: capture every non-board state at every viewport, with metrics.
//
//   ROUND=1 node capture.cjs                       everything (seed, then every group, every viewport)
//   ROUND=1 GROUP=cards,journal VPS=desktop node capture.cjs
//   ROUND=1 STATES='^card-' node capture.cjs       only states matching the regex
//   SKIP_SEED=1 reuses tools/surfaces/seed-state.json
//   EXT=0 skips the extended viewports
//
// Needs a dev server on BASE_URL (default http://localhost:5192):
//   cd /home/user/dc-solo-rpg && npx vite dev --port 5192 --strictPort
// Then: python3 post.py (metrics + contact sheets) and node manifest.cjs.
const fs = require('fs');
const path = require('path');
const L = require('./lib.cjs');
const STATES = require('./states.cjs');

// (not GROUPS: bash ignores assignments to its own GROUPS variable)
const GROUP_FILTER = process.env.GROUP ? process.env.GROUP.split(',') : null;
const VP_FILTER = process.env.VPS ? process.env.VPS.split(',') : null;
const STATE_RE = process.env.STATES ? new RegExp(process.env.STATES) : null;
const WITH_EXT = process.env.EXT !== '0';
const SEED_FILE = path.join(L.TOOLS, 'seed-state.json');
const RUNLOG = path.join(L.OUT, 'runlog-surfaces.jsonl');
fs.mkdirSync(L.OUT, { recursive: true });

const log = (o) => {
	const line = JSON.stringify({ t: new Date().toISOString().slice(11, 19), ...o });
	console.log(line.slice(0, 400));
	fs.appendFileSync(RUNLOG, line + '\n');
};

/** In-page game driver, prepended to store() code: real actions, dice mocked per roll */
const DRIVER = `
const g = gs.gameState;
const cid = (c) => c.card + c.suit[0];
function stack(ids) {
	for (const id of [...ids].reverse()) {
		const i = g.deck.findIndex((c) => cid(c) === id);
		if (i < 0) throw new Error('card not in deck: ' + id);
		const [c] = g.deck.splice(i, 1);
		g.deck.push(c);
	}
}
async function opening(roll = 14) {
	if (g.state === 'showIntro') gs.transitionTo('initialDamageRoll');
	acts.performInitialDamageRoll(roll);
	acts.applyPendingInitialDamageRoll();
}
const TASK = { 1: 1, 2: 3, 3: 7, 4: 12, 5: 17, 6: 20 };
async function playRound({ cards, checks = [], salv = 12, text = null }) {
	stack(cards);
	rnd.mockDieRoll(TASK[cards.length]);
	await acts.rollForTasks();
	acts.applyPendingTaskRoll();
	acts.confirmTaskRoll();
	let ci = 0;
	for (let i = 0; i < 40; i++) {
		if (g.state === 'drawCard') { acts.drawCard(); acts.confirmCard(); }
		else if (g.state === 'failureCheck') { rnd.mockDieRoll(checks[ci++] ?? 12); await acts.failureCheck(); acts.applyPendingDiceRoll(); }
		else if (g.state === 'successCheck') { rnd.mockDieRoll(salv); acts.successCheck(); acts.applyPendingSuccessCheck(); }
		else break;
	}
	rnd.resetRNG();
	if (text != null && g.state === 'log') await acts.recordRound({ text });
	return { state: g.state, round: g.round, tower: g.tower, tokens: g.tokens, aces: g.acesRevealed, kings: g.kingsRevealed, lucid: g.isLucid, surreal: g.isSurreal };
}
async function finalLog(text) {
	if (g.state === 'gameOver') gs.transitionTo('finalLog');
	await acts.recordRound({ text });
}
`;
const drive = (page, src, arg) => L.store(page, DRIVER + src, arg);

/** When the seed was written (its in-progress save is "N min ago" from this) */
function seededAt() {
	try {
		const s = JSON.parse(fs.readFileSync(path.join(L.TOOLS, 'seed-summary.json'), 'utf8'));
		if (s.seededAt) return s.seededAt;
	} catch {}
	return fs.statSync(SEED_FILE).mtimeMs;
}

const ENTRY = (r) =>
	[
		'The workshop smells of solder and rain. I count what is left: two capacitors, a cracked lens, the coil that still hums when I touch it.',
		'Another night of noise in the walls. I wrote the date on my arm so I would not lose it again.',
		'The machine flickered for almost a second. Long enough to see the street outside as it was. Long enough to want it.',
		'I traded the last of the batteries for a map that turned out to be wrong. I am keeping it anyway.',
		'Quiet today. I fixed the door hinge and listened to the city breathe through it.'
	][r % 5];

/** The finished runs used for the endings and the story library */
const RUNS = {
	kings: {
		slug: 'future-lost',
		rounds: [
			{ cards: ['Kh', '3d', '2h'], checks: [11], text: ENTRY(0) },
			{ cards: ['5d', 'Kd', '4h'], checks: [8], text: ENTRY(1) },
			{ cards: ['Ks', '6h', '7d'], checks: [3], text: ENTRY(2) },
			{ cards: ['8h', 'Kc'] }
		],
		final: 'The last King turned over and the lights went with it. I kept writing until the page went dark.'
	},
	tokens: {
		slug: 'future-lost',
		rounds: [
			{ cards: ['Ah', '2h', '4h'], checks: [14], salv: 19 },
			{ cards: ['3h', '6h', '8h'], checks: [9], salv: 19 },
			{ cards: ['10h', 'Jh', 'Qh'], salv: 19 },
			{ cards: ['5h', '2d', '4d'], checks: [4], salv: 19 },
			{ cards: ['6d', '8d', '10d'], salv: 19 },
			{ cards: ['7h', 'Jd', 'Qd'], checks: [16], salv: 19 },
			{ cards: ['2c', '4c', '6c'], salv: 19 },
			{ cards: ['9h', '8c', '10c'], checks: [20], salv: 19 },
			{ cards: ['Jc', 'Qc', '2s'], salv: 19 },
			{ cards: ['4s', '6s', '8s'], salv: 19 }
		].map((r, i) => ({ ...r, text: i < 9 ? ENTRY(i) : null })),
		final: 'The coil caught. The room folded in on itself and then there was sunlight, and a street I knew.'
	},
	stability: {
		slug: 'ghost-in-the-machine',
		rounds: [
			{ cards: ['3h', '2h', '4h'], checks: [4], text: ENTRY(3) },
			{ cards: ['5h', '7h', '6h'], checks: [1, 3], text: ENTRY(1) },
			{ cards: ['9h', '3d', '8h'], checks: [5, 2], text: ENTRY(2) },
			{ cards: ['5d', '7d', '9d', '10h'], checks: [1, 1, 1] }
		],
		final: 'Static all the way down. If anyone finds this, the gate code was never the problem.'
	},
	easyAce: {
		slug: 'future-lost',
		easy: true,
		rounds: [
			{ cards: ['Ac', '2h', '3h'], checks: [12], salv: 12, text: ENTRY(4) },
			{ cards: ['As', '4h', '5h'], checks: [15, 9], salv: 15, text: ENTRY(0) },
			{ cards: ['Ad', '6h'], checks: [14] }
		],
		final: 'Four Aces on the bench, and the way home lit up between them.'
	}
};

// ---------------------------------------------------------------------------------------------
// Page helpers

const vis = (page, sel) => page.locator(sel).first().isVisible().catch(() => false);

async function clickFirstVisible(page, sels) {
	for (const sel of sels) {
		const loc = page.locator(sel);
		const n = await loc.count();
		for (let i = 0; i < n; i++) {
			const el = loc.nth(i);
			if (await el.isVisible().catch(() => false)) {
				await el.click({ timeout: 15000 });
				return sel;
			}
		}
	}
	return null;
}

async function waitModal(page) {
	await page.locator('.content-modal-container').last().waitFor({ state: 'visible', timeout: 10000 });
	await L.settle(page);
}

async function closeModal(page) {
	// A dialog with an inner view (the AI settings) takes one Escape per level
	for (let i = 0; i < 3; i++) {
		if (!(await page.locator('.content-modal-container').count())) break;
		await page.keyboard.press('Escape');
		await page.waitForFunction(() => !document.querySelector('.content-modal-container'), null, { timeout: 1500 }).catch(() => {});
	}
	await L.settle(page, { extra: 50 });
}

/** Scroll the open modal's body (or any given scroller) to a fraction; returns whether it scrolls */
async function scrollModal(page, frac, sel = '.content-modal-container .content-body-wrapper') {
	const r = await page.evaluate(
		({ frac, sel }) => {
			const els = [...document.querySelectorAll(sel)];
			const el = els[els.length - 1];
			if (!el) return { scrolls: false, missing: true };
			const max = el.scrollHeight - el.clientHeight;
			el.scrollTop = typeof frac === 'number' ? Math.round(max * frac) : frac;
			return { scrolls: max > 2, max };
		},
		{ frac, sel }
	);
	await page.waitForTimeout(250);
	return r;
}


/** The page's main scroller (document, body, main or a full-screen container): scroll to a fraction */
async function scrollMain(page, frac) {
	const r = await page.evaluate((frac) => {
		const vw = innerWidth, vh = innerHeight;
		const cands = [document.scrollingElement, ...document.querySelectorAll('body, main, body *')].filter((e, i, a) => e && a.indexOf(e) === i);
		let best = null, bestArea = 0;
		for (const e of cands) {
			if (e.scrollHeight <= e.clientHeight + 2) continue;
			const isDoc = e === document.scrollingElement;
			const cs = getComputedStyle(e);
			if (!isDoc && !/auto|scroll/.test(cs.overflowY)) continue;
			if (e.closest('[inert]')) continue;
			const rc = isDoc ? { left: 0, top: 0, right: vw, bottom: vh } : e.getBoundingClientRect();
			const area = Math.max(0, Math.min(rc.right, vw) - Math.max(rc.left, 0)) * Math.max(0, Math.min(rc.bottom, vh) - Math.max(rc.top, 0));
			if (area > bestArea + 1) { best = e; bestArea = area; }
		}
		if (!best || bestArea < 0.4 * vw * vh) return { scrolls: false };
		const max = best.scrollHeight - best.clientHeight;
		best.scrollTop = Math.round(max * frac);
		return { scrolls: true, max, client: best.clientHeight, sel: best.tagName.toLowerCase() + (best.className && typeof best.className === 'string' ? '.' + best.className.split(' ')[0] : '') };
	}, frac);
	await page.waitForTimeout(300);
	return r;
}

/** Shots down a page that scrolls: <state>-mid (when over 1.5 screens) and <state>-end */
async function scrolledShots(page, shot, vp, state) {
	const r = await scrollMain(page, 0);
	if (!r.scrolls) {
		for (const suf of ['-mid', '-end']) skip(state + suf, vp, 'the page fits: nothing to scroll');
		return;
	}
	if (r.max > 0.5 * r.client) {
		await scrollMain(page, 0.5);
		await shot(state + '-mid', { note: `scroller ${r.sel}, 50% of ${r.max}px` });
	} else skip(state + '-mid', vp, 'scrolls less than 1.5 screens: no mid view');
	await scrollMain(page, 1);
	await shot(state + '-end', { note: `scroller ${r.sel}, scrolled ${r.max}px to the end` });
	await scrollMain(page, 0);
}

async function gotoGame(page, slug) {
	await page.goto(L.BASE + '/game/' + slug);
	await page.locator('[data-testid="screen-showIntro"]').waitFor({ timeout: 30000 });
	await L.settle(page, { timeout: 4000 });
}

/** Play a whole run through the actions; ends on gameOver (or on the last round's state) */
async function playRun(page, run) {
	const res = await drive(
		page,
		`await opening(14); const out = []; for (const r of arg.rounds) out.push(await playRound(r)); return out;`,
		{ rounds: run.rounds }
	);
	return res;
}

async function setDifficulty(page, level) {
	if (!page.url().startsWith(L.BASE)) await page.goto(L.BASE + '/');
	await page.evaluate((level) => {
		if (level === null) localStorage.removeItem('gameSettings');
		else localStorage.setItem('gameSettings', JSON.stringify({ difficulty: level }));
	}, level);
}

// ---------------------------------------------------------------------------------------------
// Capture bookkeeping

const results = []; // { state, vp, ok, note|error }
/** Record a state that was not captured at this viewport (only when it was asked for) */
function skip(state, vp, why, { skipped = true } = {}) {
	if (STATE_RE && !STATE_RE.test(state)) return;
	if (!L.VIEWPORTS[vp] && !(STATES[state] && STATES[state].ext)) return;
	results.push({ state, vp, ok: false, skipped, error: why });
}
function wanted(state) {
	if (!STATES[state]) throw new Error('unknown state ' + state);
	return !STATE_RE || STATE_RE.test(state);
}
function makeShooter(page, cdp, vp) {
	return async (state, opts = {}) => {
		if (!wanted(state)) return false;
		if (opts.ext === false && !L.VIEWPORTS[vp]) return false;
		if (!L.VIEWPORTS[vp] && !STATES[state].ext) return false;
		try {
			if (!opts.noSettle) await L.settle(page, opts.settle || {});
			const m = await L.capture(page, cdp, state, vp, opts);
			results.push({ state, vp, ok: true, note: opts.note || '', elements: m.elements.length });
			log({ shot: state, vp, n: m.elements.length, overflowX: m.pageOverflowX });
			return true;
		} catch (e) {
			results.push({ state, vp, ok: false, error: e.message.split('\n')[0] });
			log({ fail: state, vp, error: e.message.split('\n')[0] });
			return false;
		}
	};
}
async function guarded(name, vp, fn) {
	try {
		await fn();
	} catch (e) {
		log({ groupError: name, vp, error: e.message.split('\n')[0] });
		results.push({ state: `(${name})`, vp, ok: false, error: e.message.split('\n')[0] });
	}
}
async function open(browser, vp, opts = {}) {
	const ctx = await L.newContext(browser, vp, opts);
	const errors = [];
	const page = await L.newPage(ctx, errors);
	const cdp = await ctx.newCDPSession(page);
	await cdp.send('DOM.enable');
	await cdp.send('CSS.enable');
	return { ctx, page, cdp, errors, shot: makeShooter(page, cdp, vp) };
}
async function done(name, vp, s) {
	const errs = s.errors.filter((e) => !/favicon|ERR_ABORTED/.test(e));
	if (errs.length) log({ consoleErrors: name, vp, errors: errs.slice(0, 8) });
	await s.ctx.close();
}

// ---------------------------------------------------------------------------------------------
// Seed: finished runs and an in-progress save, played through the real actions once, then saved
// as a Playwright storage state (localStorage + IndexedDB) for every viewport.

async function seed(browser) {
	const s = await open(browser, 'desktop');
	const { page } = s;
	const out = {};
	for (const key of ['kings', 'stability', 'tokens', 'easyAce']) {
		const run = RUNS[key];
		if (run.easy) await page.goto(L.BASE + '/'), await setDifficulty(page, 0);
		await gotoGame(page, run.slug);
		out[key] = await playRun(page, run);
		await drive(page, 'await finalLog(arg); return g.state;', run.final);
		await page.waitForTimeout(600);
		if (run.easy) await setDifficulty(page, null);
		log({ seeded: key, last: out[key][out[key].length - 1] });
		await page.waitForTimeout(300); // completed saves land in different milliseconds
	}
	// In progress: Ghost in the Machine, two rounds written, saved at the start of round 3
	await gotoGame(page, 'ghost-in-the-machine');
	out.active = await drive(
		page,
		`await opening(9); const a = await playRound({ cards: ['2d', '5c', 'Jh'], checks: [8], text: arg[0] });
		 const b = await playRound({ cards: ['4d', '6d'], text: arg[1] }); await idb.saveGame(g); return [a, b];`,
		[ENTRY(2), ENTRY(3)]
	);
	// An AI summary on the 10-round win, saved the way the app saves one
	out.ai = await L.store(
		page,
		`const all = await idb.loadAllSaves();
		 const won = all.filter((s) => s.win && s.round >= 10).sort((a, b) => b.completedAt - a.completedAt)[0];
		 if (!won) return 'no tokens win found';
		 const sg = await import('/src/lib/services/storyGeneration.js');
		 const model = sg.CLAUDE_MODELS?.[0]?.id ?? 'claude';
		 await idb.saveAIStory(won.id, { text: arg, generatedAt: new Date('2026-11-06T21:14:00Z').toISOString(), provider: 'anthropic', model });
		 return all.map((s) => s.id + ' r' + s.round + ' win=' + s.win);`,
		'Ten rounds in a workshop that kept trying to forget you. You counted parts, wrote dates on your arm and traded batteries for a wrong map, and every night the machine flickered a little longer. The Ace of Hearts came first, then the slow work: one token at a time, nine nights of nineteen on the die, until the coil caught and the room folded into sunlight.\n\nWhat stays with you is not the escape. It is the hinge you fixed on a quiet day, and the city breathing through it.'
	);
	log({ seededActive: out.active, ai: out.ai });
	out.seededAt = Date.now();
	await s.ctx.storageState({ path: SEED_FILE, indexedDB: true });
	await done('seed', 'desktop', s);
	fs.writeFileSync(path.join(L.TOOLS, 'seed-summary.json'), JSON.stringify(out, null, 1));
}

// ---------------------------------------------------------------------------------------------
// Groups (each runs in its own context)

const GROUPS = {
	async firstVisit(browser, vp) {
		const s = await open(browser, vp, { seen: false });
		const { page, shot } = s;
		await page.goto(L.BASE + '/', { waitUntil: 'commit' });
		await page.locator('.splash-overlay').waitFor({ state: 'attached', timeout: 30000 });
		await page.waitForTimeout(380);
		await shot('splash', { noSettle: true, note: 'about 400ms into the 1.2s splash' });
		await page.locator('.first-run-play').waitFor({ timeout: 15000 });
		await shot('first-run');
		await page.locator('.first-run-play').click();
		await page.locator('[data-testid="home-page"]').waitFor({ timeout: 10000 });
		await shot('home-first-visit');
		await scrolledShots(page, shot, vp, 'home-first-visit');
		await done('firstVisit', vp, s);
	},

	async home(browser, vp) {
		const s = await open(browser, vp, { storageState: SEED_FILE });
		const { page, shot } = s;
		// The save's "N min ago" reads the same at every viewport: the clock is held 5 minutes after the seed
		await s.ctx.clock.setFixedTime(new Date(seededAt() + 5 * 60 * 1000));
		const wide = (await page.viewportSize()).width >= 900;
		await page.goto(L.BASE + '/');
		await page.locator('[data-testid="home-page"]').waitFor({ timeout: 30000 });
		await page.locator('button[aria-label^="Continue"]').first().waitFor({ timeout: 10000 });
		await shot('home-return');
		await scrolledShots(page, shot, vp, 'home-return');
		const openMenu = () => clickFirstVisible(page, ['.more-button', '.hamburger-button']);
		const menuItem = async (text) => {
			await openMenu();
			await page.locator('.mobile-menu').waitFor({ timeout: 5000 });
			await page.locator('.mobile-menu-item', { hasText: text }).first().click();
		};
		if (wanted('home-menu')) {
			await openMenu();
			await page.locator('.mobile-menu').waitFor({ timeout: 5000 });
			await shot('home-menu');
			await page.keyboard.press('Escape');
			await L.settle(page);
		}
		if (wanted('about-modal-home') || wanted('about-modal-home-end')) {
			await menuItem('About');
			await waitModal(page);
			await shot('about-modal-home');
			const r = await scrollModal(page, 1);
			await shot('about-modal-home-end', { note: r.scrolls ? '' : 'the modal does not scroll here: same view as the top' });
			await closeModal(page);
		}
		if (['settings-home', 'settings-home-end', 'settings-home-advanced', 'settings-home-advanced-end'].some(wanted)) {
			if (wide) await page.locator('.header-buttons .settings-button').click();
			else await menuItem('Settings');
			await waitModal(page);
			await shot('settings-home');
			const r = await scrollModal(page, 1);
			await shot('settings-home-end', { note: r.scrolls ? '' : 'does not scroll here: same view as the top' });
			await page.locator('.settings-advanced > summary').click();
			await page.waitForTimeout(300);
			await page.evaluate(() => {
				const sum = document.querySelector('.settings-advanced > summary');
				const sc = document.querySelector('.content-modal-container .content-body-wrapper');
				if (sum && sc) sc.scrollTop += sum.getBoundingClientRect().top - sc.getBoundingClientRect().top - 8;
			});
			await page.waitForTimeout(250);
			await shot('settings-home-advanced');
			await scrollModal(page, 1);
			await shot('settings-home-advanced-end');
			await closeModal(page);
		}
		if (wanted('help-home') || wanted('help-home-mid') || wanted('help-home-end')) {
			if (wide) await page.locator('.header-buttons .help-button').click();
			else await menuItem('Game Guide');
			await waitModal(page);
			await shot('help-home');
			await scrollModal(page, 0.5);
			await shot('help-home-mid');
			await scrollModal(page, 1);
			await shot('help-home-end');
			await closeModal(page);
		}
		if (wanted('dice-theme-home') || wanted('dice-theme-home-end')) {
			await menuItem('Dice theme');
			await waitModal(page);
			await shot('dice-theme-home');
			const r = await scrollModal(page, 1);
			await shot('dice-theme-home-end', { note: r.scrolls ? '' : 'does not scroll here: same view as the top' });
			await closeModal(page);
		}
		const card = page.locator('[data-testid="game-card-ghost-in-the-machine"]');
		if (wanted('confirm-new-game')) {
			await card.locator('button', { hasText: /new game/i }).first().click();
			await page.locator('[role="alertdialog"], [role="dialog"]').last().waitFor({ timeout: 5000 });
			await shot('confirm-new-game');
			await page.keyboard.press('Escape');
			await L.settle(page);
		}
		if (wanted('confirm-delete-save') || wanted('home-toast-save-deleted')) {
			await card.locator('button', { hasText: /delete/i }).first().click();
			await page.locator('[data-testid="confirm-message"]').waitFor({ timeout: 5000 });
			await shot('confirm-delete-save');
			await page.locator('button', { hasText: /^\s*delete save\s*$/i }).last().click();
			await page.waitForTimeout(450);
			await shot('home-toast-save-deleted', { noSettle: true, note: 'about 450ms after the delete; the toast lasts 3s' });
		}
		if (wanted('home-custom-game') || wanted('confirm-remove-game')) {
			// Upload a .game.md through the hidden file input, as "Upload Game" does
			await page.setInputFiles('input[type=file]', path.join(L.TOOLS, 'fixtures', 'night-archive.game.md'));
			const custom = page.locator('[data-testid="game-card-night-archive"]');
			await custom.waitFor({ timeout: 10000 });
			// Bring the new card into view (on phones it is the third card down)
			await custom.evaluate((e) => {
				const r = e.getBoundingClientRect();
				if (r.top < 0 || r.bottom > innerHeight) e.scrollIntoView({ block: 'center' });
			});
			await page.waitForTimeout(500);
			await shot('home-custom-game', { note: 'the "Added" toast is up (it lasts 5s)' });
			// The toast can sit over the remove button on phones: press it directly
			// (the remove button sits beside the card, in its wrapper; there is one custom game)
			await page.locator('button[aria-label="Remove custom game"]').first().evaluate((b) => b.click());
			await page.locator('[data-testid="confirm-message"]').waitFor({ timeout: 5000 });
			await shot('confirm-remove-game');
			await page.keyboard.press('Escape');
		}
		await done('home', vp, s);
	},

	async pages(browser, vp) {
		const s = await open(browser, vp);
		const { page, shot } = s;
		const go = async (url) => {
			const resp = await page.goto(L.BASE + url);
			await page.waitForTimeout(1200);
			return { status: resp ? resp.status() : null, url: page.url().replace(L.BASE, '') };
		};
		let r;
		if (wanted('page-about')) {
			r = await go('/about');
			await shot('page-about', { note: `HTTP ${r.status}` });
			await scrolledShots(page, shot, vp, 'page-about');
		}
		if (wanted('page-how-to')) {
			r = await go('/how-to');
			await shot('page-how-to', { note: `HTTP ${r.status}` });
			await scrolledShots(page, shot, vp, 'page-how-to');
		}
		if (wanted('page-signin')) {
			r = await go('/signin');
			await page.locator('[data-testid="home-page"]').waitFor({ timeout: 10000 }).catch(() => {});
			await shot('page-signin', { note: `/signin landed on ${r.url} (sign-in is off: the page redirects home)` });
		}
		if (wanted('page-404')) {
			r = await go('/no-such-page');
			await shot('page-404', { note: `HTTP ${r.status}` });
		}
		if (wanted('page-game-not-found')) {
			r = await go('/game/no-such-game');
			await shot('page-game-not-found', { note: `HTTP ${r.status}` });
		}
		if (wanted('page-custom-game-not-found')) {
			r = await go('/game/custom/no-such-game');
			await shot('page-custom-game-not-found', { note: `HTTP ${r.status}` });
		}
		await done('pages', vp, s);
	},

	async gameModals(browser, vp) {
		const s = await open(browser, vp);
		const { page, shot } = s;
		await gotoGame(page, 'future-lost');
		await drive(page, 'await opening(14); return g.state;');
		await page.locator('[data-testid="screen-rollForTasks"]').waitFor({ timeout: 10000 });
		await L.settle(page);
		const viaMenu = async (label, menuText) => {
			const b = page.locator(`button[aria-label="${label}"]`);
			if (await b.isVisible().catch(() => false)) return b.click();
			await page.locator('button[aria-label="More game options"]').click();
			await page.locator('.game-menu').waitFor({ timeout: 5000 });
			await page.locator('.game-menu-item', { hasText: menuText }).first().click();
		};
		if (wanted('game-menu')) {
			const more = page.locator('button[aria-label="More game options"]');
			if (await more.isVisible().catch(() => false)) {
				await more.click();
				await page.locator('.game-menu').waitFor({ timeout: 5000 });
				await shot('game-menu');
				await page.keyboard.press('Escape');
				await L.settle(page);
			} else {
				await shot('game-menu', { note: 'no ⋯ menu at this width: the header shows every button inline (board at Round 1)' });
			}
		}
		if (wanted('settings-game')) {
			await viaMenu('Game settings', 'Settings');
			await waitModal(page);
			await shot('settings-game');
			await closeModal(page);
		}
		if (wanted('help-game') || wanted('help-game-end')) {
			await page.locator('button[aria-label="Game Guide"]').click();
			await waitModal(page);
			await shot('help-game');
			await scrollModal(page, 1);
			await shot('help-game-end');
			await closeModal(page);
		}
		if (wanted('dice-theme-game')) {
			await viaMenu('Dice theme', 'Dice theme');
			await waitModal(page);
			await shot('dice-theme-game');
			await closeModal(page);
		}
		if (wanted('exit-confirm-game')) {
			await page.locator('button[aria-label="Exit game"]').click();
			await page.locator('[data-testid="confirm-message"]').waitFor({ timeout: 5000 });
			await shot('exit-confirm-game');
			await page.keyboard.press('Escape');
		}
		await done('gameModals', vp, s);
	},

	async cards(browser, vp) {
		const s = await open(browser, vp);
		const { page, shot } = s;
		const kingFlags = (suits) => Object.fromEntries(['Hearts', 'Diamonds', 'Clubs', 'Spades'].map((x) => ['kingOf' + x, suits.includes(x[0].toLowerCase())]));
		const SETS = {
			'future-lost': [
				['card-event-short', '6s', {}],
				['card-challenge-short', '9d', {}],
				['card-primary-success', 'Ah', { acesRevealed: 0, aceOfHeartsRevealed: false }],
				['card-failure-counter', 'Ks', { kingsRevealed: 0, ...kingFlags('') }],
				['card-narrative', 'Ad', { aceOfHeartsRevealed: true, acesRevealed: 1, kingsRevealed: 0, ...kingFlags('') }],
				['card-narrative-skip-damage', 'Ac', { aceOfHeartsRevealed: true, acesRevealed: 2 }],
				['card-final-king', 'Kh', { kingsRevealed: 3, ...kingFlags('dcs') }]
			],
			'ghost-in-the-machine': [
				['card-event-long', '8h', {}],
				['card-challenge-long', '5c', {}],
				['card-primary-success-long', 'Ah', { acesRevealed: 0, aceOfHeartsRevealed: false }],
				['card-failure-counter-long', 'Kd', { kingsRevealed: 2, ...kingFlags('hc') }],
				['card-narrative-return-king', 'As', { kingsRevealed: 1, ...kingFlags('h'), aceOfHeartsRevealed: true, acesRevealed: 1 }],
				['card-fourth-ace-easy', 'Ad', { kingsRevealed: 0, ...kingFlags(''), aceOfHeartsRevealed: true, acesRevealed: 3, easy: true }]
			]
		};
		for (const [slug, list] of Object.entries(SETS)) {
			if (!list.some(([st]) => wanted(st) && (L.VIEWPORTS[vp] || STATES[st].ext))) continue;
			await gotoGame(page, slug);
			await drive(page, 'await opening(14); return g.state;');
			await page.locator('[data-testid="screen-rollForTasks"]').waitFor({ timeout: 10000 });
			await L.settle(page);
			for (const [state, id, preset] of list) {
				if (!wanted(state) || (!L.VIEWPORTS[vp] && !STATES[state].ext)) continue;
				await drive(
					page,
					`const { easy, ...p } = arg.preset;
					 Object.assign(g.pendingUpdates, { gameOverCondition: null, kingsChange: null, kingsSuit: null, aceChange: null });
					 Object.assign(g, p);
					 g.config.options.difficulty = easy ? 0 : 1;
					 stack([arg.id]);
					 // Each card is the first of three this round (earlier forced cards leave the log)
					 g.log = g.log.filter((e) => !(e.card && e.round === g.round));
					 g.taskRoll = { roll: 7, dice: [7], cards: 3 }; g.diceRoll = 7; g.cardsToDraw = 3;
					 gs.transitionTo('drawCard');
					 return g.state;`,
					{ id, preset }
				);
				await page.locator('[data-testid="card"].revealed, .byte-container.revealed').first().waitFor({ timeout: 15000 });
				await shot(state, { note: `card ${id}` });
				// Back to the table without confirming the card
				await drive(page, `Object.assign(g.pendingUpdates, { gameOverCondition: null, kingsChange: null, kingsSuit: null, aceChange: null }); g.currentCard = null; g.config.options.difficulty = 1; g.state = 'rollForTasks'; return g.state;`);
				await page.waitForFunction(() => !document.querySelector('[data-testid="card"]'), null, { timeout: 5000 }).catch(() => {});
				await L.settle(page);
			}
		}
		await done('cards', vp, s);
	},

	async journal(browser, vp) {
		const s = await open(browser, vp);
		const { page, shot } = s;
		const anyWanted = ['journal-entry', 'journal-entry-long-text', 'journal-voice-recording', 'journal-voice-recorded', 'journal-voice-playing', 'journal-saved-beat', 'journal-auto-timer'].some((st) => wanted(st) && (L.VIEWPORTS[vp] || STATES[st].ext));
		if (!anyWanted) return done('journal', vp, s);
		await gotoGame(page, 'future-lost');
		const r = await drive(
			page,
			`await opening(14);
			 const a = await playRound({ cards: ['2h', '5h', '8d'], checks: [9], text: arg });
			 const b = await playRound({ cards: ['3c', 'Kh', '7s', '4c', 'Ad', '9s'], checks: [12, 6, 15, 3] });
			 return [a, b];`,
			ENTRY(0)
		);
		log({ journalRounds: r });
		await page.locator('textarea').first().waitFor({ timeout: 10000 });
		await page.waitForTimeout(500);
		await shot('journal-entry');
		if (!L.VIEWPORTS[vp]) return done('journal', vp, s);
		if (wanted('journal-entry-long-text')) {
			const long = Array.from({ length: 9 }, (_, i) => ENTRY(i)).join('\n\n');
			await page.locator('textarea').first().fill(long);
			await page.waitForTimeout(300);
			await shot('journal-entry-long-text', { note: `${long.length} characters typed` });
			await page.locator('textarea').first().fill('');
		}
		if (wanted('journal-voice-recording') || wanted('journal-voice-recorded') || wanted('journal-voice-playing')) {
			await page.locator('[data-testid="journal-voice-toggle"]').click();
			await page.locator('[data-testid="voice-stop"]').waitFor({ timeout: 8000 }).catch(() => {});
			await page.waitForTimeout(2000);
			await shot('journal-voice-recording', { settle: { timeout: 1500 } });
			if (await vis(page, '[data-testid="voice-stop"]')) {
				await page.locator('[data-testid="voice-stop"]').click();
				await page.locator('[data-testid="voice-play"]').waitFor({ timeout: 8000 }).catch(() => {});
			}
			await shot('journal-voice-recorded');
			if (wanted('journal-voice-playing') && (await vis(page, '[data-testid="voice-play"]'))) {
				await page.locator('[data-testid="voice-play"]').click();
				await page.waitForTimeout(400);
				await shot('journal-voice-playing', { noSettle: true, note: 'about 400ms into the 2s playback' });
				await page.waitForTimeout(2200);
			}
			if (await vis(page, '[data-testid="voice-delete"]')) await page.locator('[data-testid="voice-delete"]').click();
			await L.settle(page);
		}
		if (wanted('journal-saved-beat') || wanted('journal-auto-timer')) {
			await page.locator('textarea').first().fill('The robot went down hard. My hands are still shaking.');
			await page.waitForTimeout(500);
			await page.locator('[data-testid="journal-save-button"]').click();
			await page.waitForTimeout(260);
			await shot('journal-saved-beat', { noSettle: true, note: 'about 300ms into the 800ms beat' });
			await page.waitForFunction(() => !document.querySelector('textarea'), null, { timeout: 8000 }).catch(() => {});
			await L.settle(page);
		}
		if (wanted('journal-auto-timer')) {
			const prev = await L.store(page, `const a = await import('/src/lib/stores/audioStore.svelte.js'); const p = { ...a.getGameplaySettings() }; a.updateGameplaySettings({ autoHandleJournaling: 'timed', journalPauseTime: 30000 }); return p;`);
			await drive(page, `if (g.state !== 'rollForTasks') g.state = 'rollForTasks'; return await playRound({ cards: ['6c', '10s'] });`);
			await page.locator('[data-testid="auto-journal-timer"]').waitFor({ timeout: 8000 }).catch(() => {});
			await page.waitForTimeout(1500);
			await shot('journal-auto-timer', { settle: { timeout: 1500 } });
			await L.store(page, `const a = await import('/src/lib/stores/audioStore.svelte.js'); a.updateGameplaySettings(arg); return true;`, { autoHandleJournaling: prev.autoHandleJournaling, journalPauseTime: prev.journalPauseTime });
		}
		await done('journal', vp, s);
	},

	async endings(browser, vp) {
		const s = await open(browser, vp);
		const { page, shot } = s;
		const ENDINGS = [
			['gameover-win-easy-ace', 'easyAce'],
			['gameover-win-tokens', 'tokens'],
			['gameover-loss-kings', 'kings'],
			['gameover-loss-stability', 'stability']
		];
		for (const [state, key] of ENDINGS) {
			const finalStates = key === 'kings' ? ['final-log', 'final-log-timeline', 'final-log-writing', 'final-log-epitaph'] : key === 'tokens' ? ['final-log-victory', 'final-log-victory-epitaph'] : [];
			const need = [state, state + '-end', ...finalStates].filter((st) => wanted(st) && (L.VIEWPORTS[vp] || STATES[st].ext));
			if (!need.length) continue;
			const run = RUNS[key];
			if (run.easy) await setDifficulty(page, 0);
			await gotoGame(page, run.slug);
			const res = await playRun(page, run);
			if (run.easy) await setDifficulty(page, null);
			log({ ending: key, last: res[res.length - 1] });
			await page.locator('[data-testid="game-over-message"]').waitFor({ timeout: 15000 });
			await page.waitForTimeout(400);
			await shot(state);
			const sc = await scrollModal(page, 1, '.game-over');
			if (sc.scrolls) await shot(state + '-end');
			else skip(state + '-end', vp, 'the ending fits: nothing to scroll');
			await scrollModal(page, 0, '.game-over');
			if (!finalStates.length || !finalStates.some((st) => wanted(st))) continue;
			if (!L.VIEWPORTS[vp]) continue;
			await page.locator('[data-testid="game-over-final-log-button"]').click();
			await page.locator('.journal-sheet').waitFor({ timeout: 10000 });
			await page.waitForTimeout(500);
			if (key === 'kings') {
				await shot('final-log');
				if (wanted('final-log-timeline')) {
					if (await vis(page, '[data-testid="journal-view-timeline"]')) {
						await page.locator('[data-testid="journal-view-timeline"]').click();
						await page.waitForTimeout(300);
						await shot('final-log-timeline', { note: 'phone: Timeline tab' });
						await page.locator('[data-testid="journal-view-entry"]').click();
						await page.waitForTimeout(300);
					} else {
						const t = await scrollModal(page, 1, '.timeline-scroll');
						await shot('final-log-timeline', { note: t.scrolls ? 'side by side (no switch at this width): timeline scrolled to its end' : 'side by side (no switch at this width); the timeline fits, so this is the same view as final-log' });
						await scrollModal(page, 0, '.timeline-scroll');
					}
				}
				await page.locator('textarea').first().fill(run.final);
				await page.waitForTimeout(300);
				await shot('final-log-writing');
				await page.locator('[data-testid="journal-save-button"]').click();
				await page.locator('[data-testid="journal-epitaph"]').waitFor({ timeout: 8000 });
				await shot('final-log-epitaph');
			} else {
				await shot('final-log-victory');
				await page.locator('textarea').first().fill(run.final);
				await page.waitForTimeout(500);
				await page.locator('[data-testid="journal-save-button"]').click();
				await page.locator('[data-testid="journal-epitaph"]').waitFor({ timeout: 8000 });
				await shot('final-log-victory-epitaph');
			}
		}
		await done('endings', vp, s);
	},

	async library(browser, vp) {
		// Empty library: storage with nothing saved
		if (wanted('library-empty')) {
			const e = await open(browser, vp);
			await e.page.goto(L.BASE + '/?story');
			await e.page.locator('.back-button').first().waitFor({ timeout: 30000 });
			await e.page.waitForTimeout(800);
			await e.shot('library-empty');
			await done('library-empty', vp, e);
		}
		const s = await open(browser, vp, { storageState: SEED_FILE });
		const { page, shot } = s;
		await page.goto(L.BASE + '/?story');
		await page.locator('[data-testid="story-card"]').first().waitFor({ timeout: 30000 });
		await page.waitForTimeout(500);
		await shot('library-stories');
		await scrolledShots(page, shot, vp, 'library-stories');
		if (wanted('library-card-menu') || wanted('library-delete-confirm')) {
			await page.locator('[data-testid="story-card"] button[aria-label^="More options"]').first().click();
			await page.locator('[role="menu"]').first().waitFor({ timeout: 5000 });
			await shot('library-card-menu');
			await page.locator('[role="menu"] .menu-item.danger').first().click();
			await page.locator('[data-testid="confirm-message"]').waitFor({ timeout: 5000 });
			await shot('library-delete-confirm');
			await page.keyboard.press('Escape');
			await L.settle(page);
		}
		// Story mode: the 10-round win
		const openStory = async (re) => {
			const cards = page.locator('[data-testid="story-card"]');
			const n = await cards.count();
			for (let i = 0; i < n; i++) {
				const t = await cards.nth(i).innerText();
				if (re.test(t)) {
					await cards.nth(i).locator('.card-open').click();
					await page.locator('[data-testid="story-mode"]').waitFor({ timeout: 10000 });
					await page.waitForTimeout(600);
					return t.replace(/\s+/g, ' ');
				}
			}
			throw new Error('no story card matching ' + re);
		};
		const storyScroll = (sel) =>
			page.evaluate((sel) => {
				const sc = document.querySelector('[data-testid="story-mode"]');
				if (!sc) return false;
				if (sel === 'bottom') sc.scrollTop = sc.scrollHeight;
				else if (sel === 'top') sc.scrollTop = 0;
				else {
					const el = document.querySelector(sel);
					if (!el) return false;
					sc.scrollTop += el.getBoundingClientRect().top - 16;
				}
				return true;
			}, sel);
		const lastStep = async () => {
			// The round markers are hidden on phones: use the last one where shown, else the arrow key
			const steps = page.locator('[data-testid="story-mode"] .progress-marker:visible');
			const n = await steps.count();
			if (n) await steps.nth(n - 1).click();
			else {
				for (let i = 0; i < 12; i++) {
					await page.keyboard.press('ArrowRight');
					await page.waitForTimeout(260);
				}
			}
			await page.waitForTimeout(500);
		};
		const storyWanted = Object.keys(STATES).filter((k) => k.startsWith('story-') && wanted(k));
		if (storyWanted.length) {
			const which = await openStory(/10 rounds/i);
			log({ story: which.slice(0, 120) });
			await shot('story-round-1');
			if (wanted('story-round-2')) {
				await page.locator('[data-testid="story-mode"] button', { hasText: /next/i }).last().click();
				await page.waitForTimeout(500);
				await storyScroll('top');
				await shot('story-round-2');
			}
			await lastStep();
			await storyScroll('top');
			await shot('story-last-round');
			if (await storyScroll('[data-testid="story-final-log"]')) await shot('story-final-log');
			else skip('story-final-log', vp, 'no final log section in story mode', { skipped: false });
			await storyScroll('bottom');
			await shot('story-end');
			if (wanted('story-ai-summary')) {
				await storyScroll('top');
				await page.locator('[data-testid="ai-summary-button"]').click();
				await page.locator('.content-modal-container').last().waitFor({ timeout: 5000 });
				await shot('story-ai-summary');
				await closeModal(page);
			}
			// The Kings loss: its end, then the AI dialog with no AI configured
			await page.locator('[data-testid="story-mode"] .back-button').click();
			await page.locator('[data-testid="story-card"]').first().waitFor({ timeout: 10000 });
			await page.waitForTimeout(500);
			await openStory(/king/i);
			await lastStep();
			await storyScroll('bottom');
			await shot('story-end-loss');
			await storyScroll('top');
			if (wanted('story-ai-panel') || wanted('story-ai-settings') || wanted('story-ai-settings-end')) {
				await page.locator('[data-testid="ai-summary-button"]').click();
				await page.locator('.content-modal-container').last().waitFor({ timeout: 5000 });
				await shot('story-ai-panel');
				const b = page.locator('.content-modal-container button', { hasText: /set up|settings|configure/i }).first();
				if (await b.isVisible().catch(() => false)) {
					await b.click();
					await page.waitForTimeout(500);
					await shot('story-ai-settings');
					const r = await scrollModal(page, 1);
					await shot('story-ai-settings-end', { note: r.scrolls ? '' : 'does not scroll here: same view as the top' });
				} else {
					skip('story-ai-settings', vp, 'no settings button in the AI dialog', { skipped: false });
				}
				await closeModal(page);
			}
			if (wanted('story-ai-panel-ready')) {
				// An AI provider configured (a placeholder key, saved the way the settings form saves it):
				// the dialog offers to write a summary. Nothing is sent.
				await L.store(page, `const a = await import('/src/lib/services/aiSettings.js'); return a.saveAISettings({ provider: 'anthropic', apiKey: 'sk-ant-placeholder-for-capture', model: '' });`);
				await page.locator('[data-testid="story-mode"] .back-button').click();
				await page.locator('[data-testid="story-card"]').first().waitFor({ timeout: 10000 });
				await page.waitForTimeout(400);
				await openStory(/king/i);
				await page.locator('[data-testid="ai-summary-button"]').click();
				await page.locator('.content-modal-container').last().waitFor({ timeout: 5000 });
				await shot('story-ai-panel-ready', { note: 'placeholder API key saved; nothing generated' });
				await closeModal(page);
			}
		}
		await done('library', vp, s);
	}
};

const GROUP_ORDER = ['firstVisit', 'home', 'pages', 'gameModals', 'cards', 'journal', 'endings', 'library'];

(async () => {
	const t0 = Date.now();
	const browser = await L.launchBrowser();
	if (!process.env.SKIP_SEED || !fs.existsSync(SEED_FILE)) {
		await seed(browser);
	}
	const vps = [...L.CORE_ORDER, ...(WITH_EXT ? Object.keys(L.EXTENDED) : [])].filter((v) => !VP_FILTER || VP_FILTER.includes(v));
	for (const vp of vps) {
		for (const g of GROUP_ORDER) {
			if (GROUP_FILTER && !GROUP_FILTER.includes(g)) continue;
			// Extended viewports: only the groups holding their states
			if (!L.VIEWPORTS[vp] && !['home', 'cards', 'journal', 'endings'].includes(g)) continue;
			const g0 = Date.now();
			await guarded(g, vp, () => GROUPS[g](browser, vp));
			log({ group: g, vp, secs: Math.round((Date.now() - g0) / 1000) });
		}
	}
	await browser.close();
	const file = path.join(L.OUT, 'capture-results-surfaces.json');
	let prev = [];
	try {
		prev = JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {}
	const key = (r) => r.state + '|' + r.vp;
	const merged = new Map(prev.map((r) => [key(r), r]));
	for (const r of results) merged.set(key(r), r);
	fs.writeFileSync(file, JSON.stringify([...merged.values()], null, 1));
	log({ finished: true, secs: Math.round((Date.now() - t0) / 1000), shots: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok && !r.skipped).length });
})().catch((e) => {
	console.error('FATAL', e);
	process.exit(1);
});
