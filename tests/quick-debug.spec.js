import { test } from '@playwright/test';

test('Quick debug test', async ({ page }) => {
	// Listen for all console messages and errors
	const logs = [];
	page.on('console', msg => {
		const text = 'BROWSER [' + msg.type() + ']: ' + msg.text();
		logs.push(text);
		console.log(text);
	});
	page.on('pageerror', err => {
		const text = 'PAGE ERROR: ' + err.message;
		logs.push(text);
		console.log(text);
	});
	
	await page.goto('http://localhost:5173/');
	await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });
	
	console.log('Home page loaded');
	
	await page.selectOption('select#gameSelect', { index: 0 });
	console.log('Game selected');
	
	console.log('Clicking Load Game button...');
	await page.click('button:has-text("Load Game")');
	
	console.log('Waiting 5 seconds for async operations...');
	await page.waitForTimeout(5000);
	
	// Get all button texts
	const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent));
	console.log('Available buttons:', buttons);
	
	// Get visible elements
	const visibleSelectors = [];
	for (const selector of ['.dc-start-screen-container', '.dc-game-container', '.dc-intro-container', 'select#difficulty']) {
		const isVisible = await page.isVisible(selector).catch(() => false);
		if (isVisible) visibleSelectors.push(selector);
	}
	console.log('Visible selectors:', visibleSelectors);
	
	// If we have options screen, continue
	if (buttons.includes('Start Game')) {
		console.log('\n✓ Options screen loaded! Continuing...');
		await page.click('button:has-text("Start Game")');
		await page.waitForTimeout(1000);
		
		const afterStartButtons = await page.$$eval('button', btns => btns.map(b => b.textContent));
		console.log('Buttons after Start Game:', afterStartButtons);
	}
});
