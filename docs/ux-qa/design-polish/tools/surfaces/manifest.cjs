// Design review, surfaces: write round-N/manifest-surfaces.md from the state registry, the capture
// results and the metrics summary. Run after capture.cjs and post.py:  ROUND=1 node manifest.cjs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const L = require('./lib.cjs');
const STATES = require('./states.cjs');

const results = JSON.parse(fs.readFileSync(path.join(L.OUT, 'capture-results-surfaces.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(L.OUT, 'metrics-surfaces-summary.json'), 'utf8'));
const CORE = L.CORE_ORDER;
const EXT = Object.keys(L.EXTENDED);
const rel = (p) => p; // absolute paths throughout
const git = (() => {
	try {
		return execSync('git -C /home/user/dc-solo-rpg log --oneline -1', { encoding: 'utf8' }).trim();
	} catch {
		return '(unknown)';
	}
})();
const branch = (() => {
	try {
		return execSync('git -C /home/user/dc-solo-rpg rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
	} catch {
		return '(unknown)';
	}
})();

const byState = {};
for (const r of results) (byState[r.state] ||= {})[r.vp] = r;
const shotsDir = (st) => path.join(L.SHOTS, st);
const sheet = (st) => path.join(L.OUT, 'sheets', 'surfaces', `${st}.png`);
const extSheet = (st) => path.join(L.OUT, 'sheets', 'surfaces', `${st}--extended.png`);

let nShots = 0;
let nExt = 0;
const notApplicable = [];
const failures = [];
const lines = [];
const groups = {};
for (const [st, def] of Object.entries(STATES)) (groups[def.group] ||= []).push(st);

const flagsFor = (st) => {
	const s = summary.states[st];
	if (!s) return '';
	const parts = [];
	const lc = Object.entries(s).filter(([, m]) => m.lowContrast.length).map(([vp, m]) => `${vp} ${m.lowContrast.length}`);
	const ov = Object.entries(s).filter(([, m]) => m.pageOverflowX).map(([vp]) => vp);
	const cl = Object.entries(s).filter(([, m]) => m.clipped.length).map(([vp, m]) => `${vp} ${m.clipped.length}`);
	const out = Object.entries(s).filter(([, m]) => m.outside.length).map(([vp, m]) => `${vp} ${m.outside.length}`);
	const tt = Object.entries(s).filter(([, m]) => m.smallTargets.length).map(([vp, m]) => `${vp} ${m.smallTargets.length}`);
	if (ov.length) parts.push(`page overflow-x: ${ov.join(', ')}`);
	if (lc.length) parts.push(`low contrast: ${lc.join(', ')}`);
	if (cl.length) parts.push(`clipped: ${cl.join(', ')}`);
	if (out.length) parts.push(`off-screen: ${out.join(', ')}`);
	if (tt.length) parts.push(`tap <44: ${tt.join(', ')}`);
	return parts.join('; ');
};

const GROUP_ORDER = ['Home', 'Pages', 'Modals', 'In-game modals', 'Cards', 'Journal', 'Endings', 'Final log', 'Stories'];
for (const g of GROUP_ORDER) {
	if (!groups[g]) continue;
	lines.push(`### ${g}`, '');
	for (const st of groups[g]) {
		const def = STATES[st];
		const got = byState[st] || {};
		const core = CORE.filter((vp) => got[vp] && got[vp].ok);
		const ext = EXT.filter((vp) => got[vp] && got[vp].ok);
		nShots += core.length + ext.length;
		nExt += ext.length;
		for (const vp of [...CORE, ...EXT]) {
			const r = got[vp];
			if (r && !r.ok) (r.skipped ? notApplicable : failures).push({ st, vp, why: r.error });
		}
		const missingCore = CORE.filter((vp) => !got[vp]);
		const notes = Object.entries(got)
			.filter(([, r]) => r.ok && r.note)
			.map(([vp, r]) => `${vp}: ${r.note}`);
		lines.push(`#### \`${st}\``, '');
		lines.push(`- **Shows:** ${def.shows}`);
		lines.push(`- **Reached:** ${def.how}`);
		lines.push(`- **Captured:** ${core.length}/6 core${core.length && core.length < 6 ? ` (${core.join(', ')})` : ''}${ext.length ? `; extended ${ext.join(', ')}` : ''}${missingCore.length && missingCore.length < 6 ? `; not run at ${missingCore.join(', ')}` : ''}`);
		if (core.length) lines.push(`- **Sheet:** ${rel(sheet(st))}${ext.length ? `; extended: ${rel(extSheet(st))}` : ''}`);
		if (core.length || ext.length) lines.push(`- **Shots:** ${rel(shotsDir(st))}/<viewport>.png`);
		const f = flagsFor(st);
		if (f) lines.push(`- **Metric flags:** ${f}`);
		if (notes.length) lines.push(`- **Notes:** ${[...new Set(notes)].join(' · ')}`);
		lines.push('');
	}
}

const head = [];
head.push(`# Surfaces capture, round ${L.ROUND}`, '');
head.push(
	`Everything that is not the board, at six core viewports (and four extended ones for the home page, a drawn card, the journal and two endings). Code under test: \`${git}\` on \`${branch}\` in /home/user/dc-solo-rpg, served by \`vite dev\` on port 5192. Captured ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC with Chromium (swiftshader), no reduced motion.`,
	''
);
head.push('## How to read the metrics', '');
head.push(
	`- **Files.** ${path.join(L.OUT, 'metrics-surfaces.json')} has everything: \`states.<state>.<viewport>\` with \`elements\` (every visible text element and control), \`clipped\`, \`outside\`, \`smallTargets\`, \`lowContrast\` and page-level fields. ${path.join(L.OUT, 'metrics-surfaces-summary.json')} holds only the flags per state and viewport (start there). ${path.join(L.OUT, 'metrics', 'surfaces')}/<state>.json is one state at every viewport, the same shape as the big file.`,
	'- **Coordinates** are CSS pixels from the top left of the viewport as shot (`box` = the element\'s border box; `textBox` = the union of its own text runs; `visibleBox` = the part left after clipping ancestors and the viewport). Shots at android-small, iphone-13, iphone-13-landscape and the extended phones are at device scale 2, so multiply by 2 to find a box in the PNG.',
	'- **What counts as an element.** Any element with its own text, plus every control (button, link, field, summary, tab, switch, focusable). A button and the text span inside it appear as two rows: `role: "button"` (the control, its full text and tap size) and `role: "button text"` (the span, with its own font). `text` is what renders (text-transform applied for controls, source case for spans); `name` is the accessible name when it differs (icon buttons). Elements behind a modal (`inert`), screen-reader-only text, fully transparent elements and anything scrolled out of view are left out and counted in `counts`; `offscreenTexts` lists up to 60 of the scrolled-away texts.',
	'- **Role** is a heuristic: title (h1), heading (h2-h6), label, value (digits), caption (small/help/meta/hint classes), body text (p), list item, quote, button, button text, link, field, tab, menu item, disclosure, result line, caption (rule caption), text (anything else). `sel` is a short path (tag.class) and `testid` the nearest data-testid, to find it in the code.',
	'- **Font.** `font.family` is the CSS stack; `font.rendered` is the face Chrome actually used for that node\'s text (CDP `CSS.getPlatformFontsForNode`; "(system)" marks a non-web font). size, weight, lineHeight (px, or "normal"), letterSpacing, transform, align and variantNumeric (when set) are computed values.',
	'- **Colour and contrast.** `color` is the CSS colour (`aN` = alpha), `colorEffective` the colour after opacity is composited over the background. `bg` is the effective background, sampled from the screenshot pixels inside the text box (the most common colour once text-coloured pixels are set aside; `bgShare` is the share of the box it covers, so a low share means a busy background such as art, a gradient or a glow). For glowing text (a text-shadow) that is not a button label, the box is mostly glow, so `bg` is read from a ring clear of it instead (12px plus 0.6 of the font size out, 10px wide); the glow is not counted as background, `bgInBox` keeps the inside sample and `bgSource` says which was used. Colours are binned at 4 bits per channel, so a gradient or scanlines still read as one background. `bgDom` is the background-colour chain from the DOM, for comparison. Elements painted over by an overlay (a card, the journal, a dialog over the HUD) are marked `covered: true` (`partlyCovered` when some sample points are hidden, `coveredBy` names what is on top) and left out of `lowContrast`. `contrast` is the WCAG 2 ratio of `colorEffective` on `bg`; `contrastGlyph` uses the brightest-differing rendered glyph pixel instead (counts glows and gradient text). `large` follows WCAG (24px, or 18.66px at 700+). `wcag` is AAA / AA / fail against 7/4.5 (3/4.5 when large). `lowContrast` lists the fails.',
	'- **Fit.** `pageOverflowX`: the document is wider than the viewport. `clipped`: text with more content than its box where overflow is hidden or an ellipsis applies, or text cut by a clipping ancestor. `outside`: elements crossing a viewport edge; `reachable: true` means a scroller can bring them in (the summary lists only the unreachable ones). `smallTargets`: controls under 44x44 CSS px on touch viewports (`under24` marks those below the WCAG 2.2 AA minimum of 24px; `inline` marks links in running text, which WCAG exempts).',
	'- **Sheets.** One PNG per state: android-small, iphone-13, ipad-portrait and iphone-13-landscape on the first row, laptop and desktop on the second, every shot scaled to 600px tall and labelled with its viewport; "not captured" boxes mark viewports where the state does not apply (see below). `<state>--extended.png` does the same for iphone-se, pixel-7, ipad-landscape and fhd where they were shot.',
	'- **Rerun:** start the dev server (`cd /home/user/dc-solo-rpg && npx vite dev --port 5192 --strictPort`), then `cd ' + L.TOOLS + ' && ROUND=2 node capture.cjs && ROUND=2 python3 post.py && ROUND=2 node manifest.cjs`. `GROUP=`, `VPS=`, `STATES=<regex>`, `EXT=0` and `SKIP_SEED=1` narrow a run.',
	''
);
head.push('## Viewports', '');
head.push('| Viewport | Size | Scale | Touch |', '| --- | --- | --- | --- |');
for (const [k, v] of Object.entries(L.ALL_VIEWPORTS)) {
	head.push(`| ${k}${L.EXTENDED[k] ? ' (extended)' : ''} | ${v.viewport.width}x${v.viewport.height} | ${v.deviceScaleFactor} | ${v.touch ? 'yes' : 'no'} |`);
}
head.push('');
const statesWithShots = Object.keys(STATES).filter((st) => Object.values(byState[st] || {}).some((r) => r.ok));
head.push('## Counts', '');
head.push(`- States defined: ${Object.keys(STATES).length}; states with shots: ${statesWithShots.length}.`);
head.push(`- Shots: ${nShots} (${nShots - nExt} at core viewports, ${nExt} at extended viewports).`);
head.push(`- Sheets: ${fs.readdirSync(path.join(L.OUT, 'sheets', 'surfaces')).filter((f) => f.endsWith('.png')).length} in ${path.join(L.OUT, 'sheets', 'surfaces')}.`);
head.push(`- Not applicable at some viewports: ${notApplicable.length}; capture failures: ${failures.length}.`);
head.push('');
head.push('## Seed data', '');
head.push(
	'The return-visit and library states start from one storage state (localStorage and IndexedDB, ' +
		path.join(L.TOOLS, 'seed-state.json') +
		'), written by playing four games through the real game actions in the page with the dice mocked per roll: a Kings loss (Future Lost, 4 rounds), a Stability loss (Ghost in the Machine, shown as "Locked In the Tech District", 4 rounds), a tokens win (Future Lost, Normal, 10 rounds) and an Easy win by the fourth Ace (Future Lost, 3 rounds), each with journal entries and a final log; then an in-progress Ghost in the Machine save at the start of round 3, and an AI summary saved on the tokens win with `saveAIStory()`. The home page clock is held 5 minutes after the seed so the save label reads the same everywhere. Card, journal and ending states play fresh games the same way in their own contexts.',
	''
);
head.push('## Capture notes', '');
head.push(
	'- Determinism: every card, journal and ending state plays the same cards and rolls at every viewport (deck order set, each die roll mocked), so the copy is identical across viewports; each forced card is shown as "Round 1 · Card 1 of 3".',
	'- Shots are taken once the page is still (fonts loaded, no finite animation running, dice settled). Three states are deliberately mid-motion and say so in their notes: `splash`, `journal-saved-beat`, `journal-voice-playing` (and the toasts in `home-toast-save-deleted` and `home-custom-game`).',
	'- The board team captured concurrently on the same 4 CPUs, so a few steps were rerun with longer waits (tools/surfaces/fill.cjs); every shot listed here exists on disk and is backed by a metrics record.',
	'- The iPhone 13 sizes are the full screen the brief names (390x844 and 844x390), not Playwright\'s descriptor viewport (390x664, 750x342), matching the board capture.',
	''
);
head.push('## States', '');

const tail = ['## Not captured', ''];
tail.push('### Not applicable at a viewport (by design)', '');
if (notApplicable.length) for (const n of notApplicable) tail.push(`- \`${n.st}\` at ${n.vp}: ${n.why}.`);
else tail.push('- None.');
tail.push('', '### Capture failures', '');
if (failures.length) for (const n of failures) tail.push(`- \`${n.st}\` at ${n.vp}: ${n.why}`);
else tail.push('- None.');
tail.push('', '### Unreachable states, and why', '');
tail.push(
	'- **The sign-in page (SignIn.svelte) and Sign Out.** Sign-in is off (`REQUIRE_SIGN_IN = false` in src/hooks.server.js), so /signin redirects (307) to the home page and the home menu has no Sign Out. Showing them needs a code change and Google OAuth credentials. `page-signin` records where /signin lands.',
	'- **An exit confirmation on home, and the About modal in game.** Neither exists: home has no exit, and the in-game header has no About.',
	'- **The loading screen (LoadScreen).** It shows for a moment while the game file loads on a local dev server, too briefly to shoot reliably; it is part of the game page, not a surface in this list.',
	'- **AI summary while writing, its errors, and a summary with narration.** Writing a summary calls the provider (an API key and a network the capture environment blocks). The dialog is captured unconfigured, configured with a placeholder key, with a saved summary, and with its settings form.',
	'- **Read-aloud and narration controls in use.** Headless Chromium has no speech voices and the on-device model downloads from Hugging Face (blocked); the settings for them are captured (`settings-home-advanced`, `story-ai-settings-end`).',
	'- **Voice-note error (microphone blocked) and story-mode audio.** The capture grants a fake microphone, so the error never shows; no saved run holds a recording, so story mode shows no audio players.',
	'- **Card in-between stages:** the fourth King\'s "doom" beat (about 400ms after it is dismissed) and the auto-play hold bar on a card (auto-play on). Both are motion on the card overlay and belong to the animation review; the settled final King is `card-final-king`.',
	'- **Upload and library error toasts** ("Please choose a .game.md file", a library that fails to load). They need a bad file or a failing IndexedDB; the toast itself is shown by `home-toast-save-deleted` and `home-custom-game`.',
	''
);

fs.writeFileSync(path.join(L.OUT, 'manifest-surfaces.md'), [...head, ...lines, ...tail].join('\n'));
console.log(`manifest: ${Object.keys(STATES).length} states, ${statesWithShots.length} with shots, ${nShots} shots, ${notApplicable.length} n/a, ${failures.length} failures`);
