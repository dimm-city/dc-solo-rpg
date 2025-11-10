import { test } from '@playwright/test';

test('Debug page errors', async ({ page }) => {
	const errors = [];
	const logs = [];

	// Capture console messages
	page.on('console', (msg) => {
		const text = msg.text();
		logs.push(`[${msg.type()}] ${text}`);
		console.log(`[CONSOLE ${msg.type()}] ${text}`);
	});

	// Capture page errors
	page.on('pageerror', (error) => {
		errors.push(error.message);
		console.error(`[PAGE ERROR] ${error.message}`);
		console.error(error.stack);
	});

	// Capture request failures
	page.on('requestfailed', (request) => {
		console.error(`[REQUEST FAILED] ${request.url()}: ${request.failure().errorText}`);
	});

	console.log('\n=== Testing Home Page ===');
	try {
		await page.goto('/');
		await page.waitForTimeout(2000);
		console.log('✓ Home page loaded successfully');
	} catch (e) {
		console.error(`✗ Home page failed: ${e.message}`);
	}

	console.log('\n=== Testing Game Page ===');
	try {
		await page.goto('/game/future-lost');
		await page.waitForTimeout(3000);
		console.log('✓ Game page loaded successfully');
	} catch (e) {
		console.error(`✗ Game page failed: ${e.message}`);
	}

	console.log('\n=== All Errors ===');
	errors.forEach((err) => console.error(err));

	console.log('\n=== All Logs ===');
	logs.forEach((log) => console.log(log));
});
