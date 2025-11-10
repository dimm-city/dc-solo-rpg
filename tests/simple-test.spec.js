import { test, expect } from '@playwright/test';

test('Debug - check page content', async ({ page }) => {
	console.log('\n🔍 Loading page...\n');
	
	// Listen for console messages BEFORE navigation
	const consoleMessages = [];
	page.on('console', msg => {
		const text = msg.text();
		consoleMessages.push({ type: msg.type(), text });
		console.log(`[Browser ${msg.type()}]: ${text}`);
	});
	
	// Listen for page errors
	page.on('pageerror', error => {
		console.log(`[Page Error]: ${error.message}`);
	});
	
	await page.goto('/');
	await page.waitForTimeout(5000); // Wait longer for JS to load
	
	// Take screenshot
	await page.screenshot({ path: 'screenshots/debug-page.png', fullPage: true });
	
	// Get all text content
	const bodyText = await page.locator('body').textContent();
	console.log('\nPage body text length:', bodyText.length);
	
	// Check for Svelte app
	const mainContent = await page.locator('main').innerHTML();
	console.log('Main content length:', mainContent.length);
	
	// Look for any selector
	const selectors = [
		'.dc-start-screen-container',
		'.dc-game-selector',
		'.game-container',
		'.welcome-container',
		'select#gameSelect',
		'button:has-text("Load Game")'
	];
	
	console.log('\nChecking selectors:');
	for (const selector of selectors) {
		const visible = await page.locator(selector).isVisible().catch(() => false);
		console.log(`  "${selector}": ${visible ? '✓ VISIBLE' : '✗ not visible'}`);
	}
	
	console.log('\nTotal console messages:', consoleMessages.length);
	const errors = consoleMessages.filter(m => m.type === 'error');
	if (errors.length > 0) {
		console.log('\nErrors found:');
		errors.forEach(e => console.log('  -', e.text));
	}
});
