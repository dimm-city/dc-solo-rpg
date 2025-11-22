import { test, chromium } from '@playwright/test';

test('simple page load with full browser logs', async () => {
	// Launch browser with extra logging
	const browser = await chromium.launch({
		args: [
			'--disable-gpu', // Disable GPU to avoid WebGL crashes
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-web-security'
		]
	});

	const context = await browser.newContext();
	const page = await context.newPage();

	const logs = [];
	const errors = [];

	// Capture all console messages
	page.on('console', (msg) => {
		const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
		console.log(text);
		logs.push(text);
	});

	// Capture page errors
	page.on('pageerror', (error) => {
		const text = `[PAGE ERROR] ${error.message}\n${error.stack}`;
		console.log(text);
		errors.push(text);
	});

	// Capture request failures
	page.on('requestfailed', (request) => {
		const text = `[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`;
		console.log(text);
		logs.push(text);
	});

	try {
		console.log('\n=== Attempting to load http://localhost:5173/ ===\n');

		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 15000
		});

		console.log('\n✓ Page loaded (DOM content)');

		// Wait a bit
		await page.waitForTimeout(3000);

		console.log('\n✓ Waited 3 seconds');

		// Try to get title
		const title = await page.title();
		console.log(`\n✓✓✓ SUCCESS! Page title: "${title}"`);

		// Try to take screenshot
		await page.screenshot({ path: 'tests/screenshots/success.png' });
		console.log(`✓ Screenshot saved`);
	} catch (error) {
		console.log(`\n✗✗✗ FAILED: ${error.message}`);
	} finally {
		console.log(`\n\n========================================`);
		console.log(`Total logs: ${logs.length}`);
		console.log(`Total errors: ${errors.length}`);
		console.log(`========================================\n`);

		await browser.close();
	}
});
