import { test, expect } from '@playwright/test';

test('detailed crash analysis with JavaScript error capture', async ({ page, browser }) => {
	const errors = [];
	const crashes = [];
	const jsErrors = [];

	// Capture ALL errors
	page.on('console', async (msg) => {
		if (msg.type() === 'error') {
			console.log(`[CONSOLE ERROR] ${msg.text()}`);
			errors.push(msg.text());
		}
	});

	page.on('pageerror', (error) => {
		console.log(`\n[PAGE ERROR] ${error.message}`);
		console.log(`Stack: ${error.stack}`);
		jsErrors.push({ message: error.message, stack: error.stack });
	});

	page.on('crash', () => {
		console.log('\n[PAGE CRASH EVENT] Browser page crashed!');
		crashes.push(new Date());
	});

	// Block external resources to isolate the issue
	await page.route('https://**', (route) => {
		console.log(`[BLOCKED] ${route.request().url()}`);
		route.abort();
	});

	try {
		console.log('\n=== Loading page with ALL external resources blocked ===\n');

		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 15000
		});

		console.log('\n✓ DOM Content Loaded');

		// Wait and see what happens
		await page.waitForTimeout(3000);

		console.log('\n✓ Waited 3 seconds after DOM load');

		// Try to get page info
		try {
			const title = await page.title();
			console.log(`\n✓ Page title: "${title}"`);
		} catch (e) {
			console.log(`\n✗ Cannot get page title: ${e.message}`);
		}

		try {
			const url = page.url();
			console.log(`✓ Current URL: ${url}`);
		} catch (e) {
			console.log(`✗ Cannot get URL: ${e.message}`);
		}

		try {
			const html = await page.content();
			console.log(`✓ HTML length: ${html.length} chars`);
		} catch (e) {
			console.log(`✗ Cannot get HTML: ${e.message}`);
		}

		// Try to take screenshot
		try {
			await page.screenshot({ path: 'tests/screenshots/blocked-resources.png' });
			console.log(`✓ Screenshot saved`);
		} catch (e) {
			console.log(`✗ Cannot take screenshot: ${e.message}`);
		}
	} catch (error) {
		console.log(`\n✗ Test failed: ${error.message}`);
	}

	// Report
	console.log(`\n\n========================================`);
	console.log(`CRASH ANALYSIS SUMMARY`);
	console.log(`========================================`);
	console.log(`Console errors: ${errors.length}`);
	console.log(`JavaScript errors: ${jsErrors.length}`);
	console.log(`Page crashes: ${crashes.length}`);

	if (jsErrors.length > 0) {
		console.log(`\n========================================`);
		console.log(`JAVASCRIPT ERRORS:`);
		console.log(`========================================`);
		jsErrors.forEach((err, i) => {
			console.log(`\n${i + 1}. ${err.message}`);
			if (err.stack) {
				console.log(`Stack trace:\n${err.stack}`);
			}
		});
	}

	console.log(`\n========================================\n`);
});
