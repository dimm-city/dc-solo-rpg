// Driving and capture helpers for the board captures.
const fs = require('fs');
const path = require('path');
const { SHOTS, RAW, BASE, VIEWPORTS, TOUCH, store, snap, setHidden, sleep, until } = require('./lib.cjs');
const { collect } = require('./collect.cjs');

const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;

// Every text colour transparent, so a second shot shows only what is behind the text
const TEXTLESS = `*, *::before, *::after, *::placeholder, *::marker {
	color: transparent !important; -webkit-text-fill-color: transparent !important;
	text-shadow: none !important; caret-color: transparent !important;
	text-decoration-color: transparent !important; transition: none !important; }`;

/** Wait for every finite animation and transition to finish (ambient and alert loops excluded) */
async function settle(page, { min = 500, max = 5000 } = {}) {
	await sleep(min);
	const t0 = Date.now();
	while (Date.now() - t0 < max) {
		const busy = await page
			.evaluate(() =>
				document.getAnimations().filter((a) => {
					if (a.playState !== 'running') return false;
					const end = a.effect?.getComputedTiming?.().endTime;
					return Number.isFinite(end);
				}).length
			)
			.catch(() => 0);
		const rolling = await store(page, 'return dice.diceState.isRolling').catch(() => false);
		if (!busy && !rolling) return;
		await sleep(100);
	}
}

/**
 * Capture one state at one viewport: the shot, a text-free shot (for the background behind each
 * text run) and the metrics. The page is "hidden" while it is captured, which pauses result holds
 * and freezes the background motes, so both shots show the same frame.
 * opts.hud: the shot is the HUD row only; opts.noSettle: shoot at once (a state that lasts <1s)
 */
function makeCapture(page, vp, log) {
	return async function cap(state, opts = {}) {
		if (ONLY && !ONLY.test(state)) {
			// Same pacing as a real capture, so a partial run drives the game exactly like a full one
			await setHidden(page, true);
			if (!opts.noSettle) await settle(page, { min: opts.min ?? 500 });
			await sleep(1000);
			return false;
		}
		const t0 = Date.now();
		try {
			await setHidden(page, true);
			if (!opts.noSettle) await settle(page, { min: opts.min ?? 500 });
			const shotDir = path.join(SHOTS, state);
			const rawDir = path.join(RAW, state);
			fs.mkdirSync(shotDir, { recursive: true });
			fs.mkdirSync(rawDir, { recursive: true });
			const shotFile = path.join(shotDir, `${vp}.png`);
			const fullFile = opts.hud ? path.join(rawDir, `${vp}.full.png`) : shotFile;
			await page.screenshot({ path: fullFile });
			const s = await snap(page).catch(() => ({}));
			const metrics = await page.evaluate(collect, { touch: TOUCH(vp), hudOnly: !!opts.hud });
			let hudClip = null;
			if (opts.hud) {
				const b = await page.locator('[data-testid="hud"]').boundingBox();
				const pad = 6;
				hudClip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(metrics.vw - Math.max(0, b.x - pad), b.width + pad * 2), height: b.height + pad * 2 };
				await page.screenshot({ path: shotFile, clip: hudClip });
			}
			const tag = await page.addStyleTag({ content: TEXTLESS });
			await sleep(60);
			await page.screenshot({ path: path.join(rawDir, `${vp}.notext.png`) });
			await tag.evaluate((n) => n.remove());
			const rec = {
				state,
				vp,
				dsf: VIEWPORTS[vp].deviceScaleFactor,
				touch: TOUCH(vp),
				how: opts.how || '',
				note: opts.note || '',
				group: opts.group || process.env.CUR_GROUP || '',
				hud: !!opts.hud,
				hudClip,
				board: !!opts.board,
				url: page.url(),
				snap: s,
				capturedAt: new Date().toISOString(),
				metrics
			};
			fs.writeFileSync(path.join(rawDir, `${vp}.json`), JSON.stringify(rec));
			log({ cap: state, ms: Date.now() - t0, title: s.title, result: s.result, step: s.step, caption: s.caption ? s.caption.slice(0, 40) : undefined });
			// Let colours come back from the text-free style before anything else happens
			await sleep(150);
			return true;
		} catch (e) {
			log({ capFailed: state, error: e.message.split('\n')[0] });
			return false;
		}
	};
}

const STEP = '#step-action .aug-button';

/** Press the step button; checks that the press took (a press just after a label change is ignored) */
async function pressStep(page) {
	// Past the 400ms guard after a label change, and the label crossfade done
	await settle(page, { min: 500 });
	for (let attempt = 0; attempt < 4; attempt++) {
		const before = await snap(page);
		await page.locator(STEP).click({ timeout: 8000 });
		await sleep(200);
		const after = await snap(page);
		if (after.state !== before.state || after.step !== before.step || after.rolling || after.result !== before.result) return;
		if (process.env.DEBUG) console.log('press had no visible effect', JSON.stringify(before), JSON.stringify(after));
		await sleep(400);
	}
	throw new Error('step press had no effect');
}

/** Roll the current step with mocked dice: a number (sticky for every die) or a sequence */
async function roll(page, values) {
	await settle(page, { min: 450 });
	const mock = Array.isArray(values) ? `rnd.mockDieRollSequence(${JSON.stringify(values)})` : `rnd.mockDieRoll(${values})`;
	for (let attempt = 0; ; attempt++) {
		await store(page, mock);
		await page.locator(STEP).click({ timeout: 8000 });
		await store(page, 'rnd.resetRNG()');
		const took = await store(page, `return dice.diceState.isRolling || !!document.querySelector('[data-testid="result-line"]')`);
		if (took) break;
		if (attempt >= 4) throw new Error('roll press had no effect');
		await sleep(400);
	}
	// Skip the throw and the resting beat
	await until(
		page,
		async () => {
			const d = await import('/src/lib/stores/diceStore.svelte.js');
			if (d.diceState.isRolling) {
				d.skipRoll();
				return false;
			}
			return !!document.querySelector('[data-testid="result-line"]');
		},
		{ timeout: 45000, label: 'roll result' }
	);
}

/** Force a step screen: hop through another step so the target's composable starts clean */
async function enter(page, target, setup = '') {
	const hop = target === 'initialDamageRoll' ? 'rollForTasks' : 'initialDamageRoll';
	await store(page, `gs.gameState.state = '${hop}';`);
	await sleep(150);
	await store(page, `const g = gs.gameState; ${setup}; g.state = '${target}';`);
	await settle(page);
}

/** Wait for a drawn card to be face up and still */
async function waitCard(page) {
	await page.locator('.byte-container.revealed').waitFor({ timeout: 30000 });
	await settle(page);
}

/** Tap the face-up card, then wait for whatever comes next */
async function tapCard(page) {
	await page.locator('.byte-container.revealed').click({ timeout: 8000 });
	await sleep(400);
	await settle(page);
}

/** Put cards on top of the deck (first in the list is drawn first). spec: e.g. "7s", "Kh", "Ad" */
async function stackDeck(page, specs) {
	return store(
		page,
		`const g = gs.gameState; const S = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
		const picked = [];
		for (const spec of arg) {
			const rank = spec.slice(0, -1), suit = S[spec.slice(-1)];
			const i = g.deck.findIndex((c) => c.card === rank && c.suit === suit);
			if (i < 0) { picked.push(spec + ':missing'); continue; }
			const [c] = g.deck.splice(i, 1);
			picked.push(c);
		}
		for (const c of [...picked].reverse()) if (typeof c === 'object') g.deck.push(c);
		return picked.map((c) => (typeof c === 'object' ? c.card + c.suit[0] + ':' + c.type + (c.modifier ? ':' + c.modifier : '') + ' ' + c.description : c));`,
		specs
	);
}

/** A copy of a deck card (for lastCard on forced Stability checks) */
const cardExpr = (spec) =>
	`(() => { const S = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' }; const r = '${spec.slice(0, -1)}', s = S['${spec.slice(-1)}'];
	const c = gs.gameState.deck.find((x) => x.card === r && x.suit === s) || gs.gameState.log.find((x) => x.card === r && x.suit === s);
	return c ? { ...JSON.parse(JSON.stringify(c)), round: gs.gameState.round, id: 'forced-' + r + s, modifierResult: undefined } : { card: r, suit: s, type: 'challenge', description: '' }; })()`;

/** Load a game page and wait for the intro; the page is then "hidden" (holds paused, motes still) */
async function openGame(page, slug = 'future-lost') {
	await page.goto(BASE + '/game/' + slug);
	await page.locator('[data-testid="story-continue-button"]').waitFor({ timeout: 40000 });
	await sleep(600);
	await setHidden(page, true);
	await settle(page);
}

/** From the intro to the first Roll for Tasks (opening roll mocked) */
async function toRoundOne(page, instability = 12) {
	await page.locator('[data-testid="story-continue-button"]').click();
	await until(page, () => !!document.querySelector('#step-action .aug-button'), { label: 'instability step' });
	await settle(page);
	await roll(page, instability);
	await settle(page);
	await pressStep(page);
	await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'rollForTasks', { label: 'round 1' });
	await settle(page);
}

/** Clear any modifier and ending a forced state left behind */
const CLEAN = `g.isLucid = false; g.isSurreal = false; g.gameOver = false; g.win = false; g.pendingUpdates.isLucid = null; g.pendingUpdates.isSurreal = null;`;

/** Record the journal entry and wait for the next round (a press right after the sheet opens is ignored) */
async function saveJournal(page, text = null) {
	const save = page.locator('[data-testid="journal-save-button"]');
	await save.waitFor({ timeout: 15000 });
	await settle(page, { min: 900 });
	if (text !== null) await page.locator('textarea').first().fill(text);
	for (let attempt = 0; attempt < 4; attempt++) {
		if (await save.isVisible().catch(() => false)) await save.click().catch(() => {});
		try {
			await until(page, async () => (await import('/src/lib/stores/gameStore.svelte.js')).gameState.state === 'rollForTasks', { timeout: 6000, label: 'next round after the journal' });
			await settle(page);
			return;
		} catch {}
	}
	throw new Error('journal save did not move on');
}

module.exports = { saveJournal, settle, makeCapture, pressStep, roll, enter, waitCard, tapCard, stackDeck, cardExpr, openGame, toRoundOne, CLEAN, STEP };
