import { test } from '@playwright/test';

test('Debug console output', async ({ page }) => {
	// Capture all console logs
	page.on('console', msg => {
		const text = msg.text();
		if (text.includes('[drawCard]') || text.includes('[confirmCard]') || text.includes('[rollForTasks]')) {
			console.log('BROWSER:', text);
		}
	});

	await page.goto('/');
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	await page.click('button:has-text("Load Game")');
	await page.waitForURL('**/game/future-lost');

	await page.click('button:has-text("continue")');
	await page.waitForTimeout(500);
	await page.click('button:has-text("start")');
	await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });

	// Roll for tasks
	console.log('\n=== ROLLING FOR TASKS ===');
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2500);
	await page.click('.dc-dice-roller-container');
	await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 5000 });

	// Draw 1 card
	console.log('\n=== DRAWING CARD ===');
	await page.click('.neural-cta:has-text("INTERCEPT")');
	await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 5000 });
	
	console.log('\n=== CONFIRMING CARD ===');
	await page.click('.neural-cta:has-text("CONTINUE")');
	await page.waitForTimeout(2000);

	// Check what's visible
	const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
	const journalVisible = await page.locator('.dc-journal-container').isVisible().catch(() => false);
	const failureVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);

	console.log('\n=== SCREEN STATE ===');
	console.log('INTERCEPT visible:', interceptVisible);
	console.log('Journal visible:', journalVisible);
	console.log('Failure check visible:', failureVisible);

	await page.screenshot({ path: 'screenshots/debug-after-first-card.png', fullPage: true });
});
