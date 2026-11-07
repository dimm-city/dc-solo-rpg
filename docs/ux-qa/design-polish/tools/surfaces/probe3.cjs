const L = require('./lib.cjs');
(async () => {
	const browser = await L.launchBrowser();
	const ctx = await L.newContext(browser, 'ipad-portrait');
	const page = await L.newPage(ctx, []);
	await page.goto(L.BASE + '/');
	await page.locator('[data-testid="home-page"]').waitFor();
	await page.waitForTimeout(1500);
	for (const sel of ['.more-button', '.hamburger-button']) {
		const loc = page.locator(sel);
		console.log(sel, await loc.count(), await loc.first().isVisible(), await loc.first().evaluate((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return [r.x, r.y, r.width, r.height, cs.display, cs.visibility, cs.pointerEvents, document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.className]; }));
	}
	await browser.close();
})();
