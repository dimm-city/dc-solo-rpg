// Find every state x viewport with no shot on disk (and no "not applicable" record), then rerun
// capture.cjs for just those, one viewport at a time.   ROUND=1 node fill.cjs [--dry]
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const L = require('./lib.cjs');
const STATES = require('./states.cjs');

const GROUP_OF = (st) =>
	/^(splash|first-run|home-first-visit)/.test(st)
		? 'firstVisit'
		: /^(home-|about-modal-home|settings-home|help-home|dice-theme-home|confirm-new-game|confirm-delete-save|confirm-remove-game)/.test(st)
			? 'home'
			: /^page-/.test(st)
				? 'pages'
				: /^(game-menu|settings-game|help-game|dice-theme-game|exit-confirm-game)/.test(st)
					? 'gameModals'
					: /^card-/.test(st)
						? 'cards'
						: /^journal-/.test(st)
							? 'journal'
							: /^(gameover-|final-log)/.test(st)
								? 'endings'
								: 'library';

let results = [];
try {
	results = JSON.parse(fs.readFileSync(path.join(L.OUT, 'capture-results-surfaces.json'), 'utf8'));
} catch {}
const na = new Set(results.filter((r) => r.skipped).map((r) => r.state + '|' + r.vp));
const missing = {};
for (const st of Object.keys(STATES)) {
	for (const vp of Object.keys(L.ALL_VIEWPORTS)) {
		if (!L.VIEWPORTS[vp] && !STATES[st].ext) continue;
		if (fs.existsSync(path.join(L.SHOTS, st, `${vp}.png`))) continue;
		if (na.has(st + '|' + vp)) continue;
		(missing[vp] ||= []).push(st);
	}
}
console.log(JSON.stringify(missing, null, 1));
if (process.argv.includes('--dry')) process.exit(0);
for (const [vp, states] of Object.entries(missing)) {
	const groups = [...new Set(states.map(GROUP_OF))];
	const env = { ...process.env, ROUND: L.ROUND, SKIP_SEED: '1', VPS: vp, GROUP: groups.join(','), STATES: `^(${states.join('|')})$` };
	console.log(`fill ${vp}: ${states.length} states in ${groups.join(', ')}`);
	const r = spawnSync('node', ['capture.cjs'], { cwd: __dirname, env, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', timeout: 20 * 60 * 1000 });
	const lines = (r.stdout || '').split('\n').filter((l) => /fail|groupError|finished/.test(l));
	for (const l of lines) console.log('  ' + l.slice(0, 200));
}
