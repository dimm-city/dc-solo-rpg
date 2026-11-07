const L = require('./lib.cjs');
(async () => {
	const browser = await L.launchBrowser();
	const ctx = await L.newContext(browser, 'desktop');
	const errors = [];
	const page = await L.newPage(ctx, errors);
	for (const slug of ['future-lost', 'ghost-in-the-machine']) {
		await page.goto(L.BASE + '/game/' + slug);
		await page.locator('[data-testid="screen-showIntro"]').waitFor({ timeout: 30000 });
		const r = await L.store(page, `const g = gs.gameState; const by = {};
			for (const c of g.deck) { (by[c.type] ||= []).push({ id: c.card + c.suit[0], mod: c.modifier, d: (c.description||'').length, s: (c.story||'').length }); }
			const out = {}; for (const [t, cs] of Object.entries(by)) { cs.sort((a,b)=>a.s-b.s); out[t] = { n: cs.length, min: cs[0], max: cs[cs.length-1], mods: cs.filter(c=>c.mod).map(c=>c.id+':'+c.mod) }; }
			return { out, labels: g.config.labels, intro: (g.config.introduction||'').length, desc: g.deck.map(c=>(c.description||'').length).sort((a,b)=>b-a).slice(0,3) };`);
		console.log(slug, JSON.stringify(r, null, 1));
	}
	await browser.close();
})();
