// Shared helpers for the board/HUD design-review captures (dev server only: state forcing goes
// through Vite module URLs). Copied in spirit from scratchpad/ux-qa/lib.cjs; never edit that one.
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const SP = '/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review';
const ROUND = process.env.ROUND || '1';
const OUT = path.join(SP, `round-${ROUND}`);
const SHOTS = path.join(OUT, 'shots', 'board');
const RAW = path.join(OUT, 'raw', 'board');
const BASE = process.env.BASE_URL || 'http://localhost:5191';

// Sizes are the CSS viewport the brief names (iPhone sizes are the full screen, no Safari chrome)
const CORE = {
	'android-small': { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
	'iphone-13': { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
	'iphone-13-landscape': { ...devices['iPhone 13 landscape'], viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 },
	'ipad-portrait': { viewport: { width: 768, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 },
	laptop: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
	desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
};
const EXTENDED = {
	'iphone-se': { ...devices['iPhone SE'], viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 },
	'pixel-7': { ...devices['Pixel 7'], viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 },
	'ipad-landscape': { viewport: { width: 1024, height: 768 }, hasTouch: true, deviceScaleFactor: 1 },
	fhd: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }
};
const VIEWPORTS = { ...CORE, ...EXTENDED };
const TOUCH = (vp) => !!VIEWPORTS[vp].hasTouch;

async function launchBrowser() {
	return chromium.launch({
		executablePath: '/opt/pw-browsers/chromium',
		args: ['--no-sandbox', '--headless=new', '--use-angle=swiftshader']
	});
}

/**
 * One context per viewport. localStorage is seeded once per context (a marker key), so a page can
 * change difficulty or rule tips and reload without the init script putting them back.
 */
async function newContext(browser, vp, { reducedMotion = 'no-preference', tips = false, difficulty = 1 } = {}) {
	const { ...opts } = VIEWPORTS[vp];
	const ctx = await browser.newContext({ ...opts, reducedMotion });
	await ctx.route(/fonts\.googleapis|fonts\.gstatic|unpkg\.com/, (r) => r.abort());
	await ctx.addInitScript(
		({ tips, difficulty }) => {
			try {
				if (localStorage.getItem('dr:seeded')) return;
				localStorage.setItem('dr:seeded', '1');
				localStorage.setItem('dc-solo-rpg:instructions-seen', 'true');
				localStorage.setItem('dc-solo-rpg:splash-seen', 'true');
				localStorage.setItem('dc-solo-rpg:rule-tips', tips ? 'true' : 'false');
				localStorage.setItem('gameSettings', JSON.stringify({ diceTheme: 'default', difficulty }));
			} catch {}
		},
		{ tips, difficulty }
	);
	return ctx;
}

/** Run code in the page with the game modules in scope: gs (store), rnd (random), acts (actions), dice */
const store = (page, src, arg) =>
	page.evaluate(
		async ({ src, arg }) => {
			const gs = await import('/src/lib/stores/gameStore.svelte.js');
			const rnd = await import('/src/lib/services/random.js');
			const acts = await import('/src/lib/stores/gameActions.svelte.js');
			const dice = await import('/src/lib/stores/diceStore.svelte.js');
			// eslint-disable-next-line no-new-func
			return new Function('gs', 'rnd', 'acts', 'dice', 'arg', `return (async () => { ${src} })()`)(gs, rnd, acts, dice, arg);
		},
		{ src, arg }
	);

/** What the player sees, in one line */
const snap = (page) =>
	page.evaluate(async () => {
		const { gameState: g } = await import('/src/lib/stores/gameStore.svelte.js');
		const { diceState } = await import('/src/lib/stores/diceStore.svelte.js');
		const q = (s) => document.querySelector(s);
		const t = (s) => q(s)?.innerText.replace(/\s+/g, ' ').trim() ?? null;
		return {
			state: g.state,
			round: g.round,
			tower: g.tower,
			tokens: g.tokens,
			aces: g.acesRevealed,
			kings: g.kingsRevealed,
			lucid: g.isLucid,
			surreal: g.isSurreal,
			deck: g.deck.length,
			toDraw: g.cardsToDraw,
			rolling: diceState.isRolling,
			title: t('[data-testid="context-title"]'),
			result: t('[data-testid="result-line"]'),
			caption: t('[data-testid="rule-caption"]'),
			notice: t('[data-testid="context-notice"]'),
			step: t('#step-action .aug-button'),
			card: q('[data-testid="card"]') ? t('[data-testid="card"] .byte-data') : null,
			cardStage: q('.byte-container')?.className.replace(/\s+/g, ' ') ?? null
		};
	});

/** Make page.hidden true (or false) and tell the app: GameScreen pauses (resumes) every result hold */
const setHidden = (page, hidden) =>
	page.evaluate((hidden) => {
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
		Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
		document.dispatchEvent(new Event('visibilitychange'));
	}, hidden);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wait until fn(page) is truthy (polling), or throw after ms */
async function until(page, src, { timeout = 30000, poll = 100, label = src } = {}) {
	const t0 = Date.now();
	for (;;) {
		const ok = await page.evaluate(src).catch(() => false);
		if (ok) return ok;
		if (Date.now() - t0 > timeout) throw new Error(`timeout waiting for ${label}`);
		await sleep(poll);
	}
}

module.exports = { SP, ROUND, OUT, SHOTS, RAW, BASE, CORE, EXTENDED, VIEWPORTS, TOUCH, launchBrowser, newContext, store, snap, setHidden, sleep, until };
