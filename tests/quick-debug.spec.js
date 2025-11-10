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
	
	// Select a game by label
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	console.log('Game selected: Future Lost');
	
	console.log('Clicking Load Game button...');
	await page.click('button:has-text("Load Game")');
	
	console.log('Waiting for game page...');
	await page.waitForTimeout(3000);
	
	// Check what's visible
	const url = page.url();
	console.log('Current URL:', url);
	
	// Get all button texts
	const buttons = await page.$$eval('button', btns => btns.map(b => b.textContent)).catch(() => []);
	console.log('Available buttons:', buttons);
	
	// Check if we're on the game page
	if (url.includes('/game/')) {
		console.log('\n✅ Successfully navigated to game page!');
		
		// Wait for game to initialize
		await page.waitForTimeout(2000);
		
		// Check for intro screen
		const hasIntro = await page.locator('.dc-intro-container').isVisible().catch(() => false);
		console.log('Intro screen visible:', hasIntro);
		
		if (hasIntro) {
			console.log('Clicking continue to view intro...');
			await page.click('button:has-text("continue")');
			await page.waitForTimeout(500);
			
			console.log('Clicking start to begin game...');
			await page.click('button:has-text("start")');
			await page.waitForTimeout(1500);
			
			// Check for dice roller
			const hasDice = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
			console.log('Dice roller visible:', hasDice);
			
			if (hasDice) {
				console.log('\n🎉 SUCCESS! Game is playable!');
			}
		}
	}
});
