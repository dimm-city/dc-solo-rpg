import { test, expect } from '@playwright/test';

test('debug page crash', async ({ page, browser }) => {
	const errors = [];
	const consoleMessages = [];

	// Capture ALL console messages
	page.on('console', async (msg) => {
		const type = msg.type();
		const text = msg.text();
		const location = msg.location();

		consoleMessages.push({
			type,
			text,
			location: `${location.url}:${location.lineNumber}:${location.columnNumber}`
		});

		console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
		console.log(`  Location: ${location.url}:${location.lineNumber}:${location.columnNumber}`);

		if (type === 'error') {
			errors.push({ text, location });
		}
	});

	// Capture page errors
	page.on('pageerror', (error) => {
		console.log(`\n[PAGE ERROR] ${error.message}`);
		console.log(`Stack trace:\n${error.stack}`);
		errors.push({ text: error.message, stack: error.stack });
	});

	// Capture requests that fail
	page.on('requestfailed', (request) => {
		console.log(`\n[REQUEST FAILED] ${request.url()}`);
		console.log(`  Failure: ${request.failure()?.errorText}`);
	});

	// Capture response errors
	page.on('response', (response) => {
		if (response.status() >= 400) {
			console.log(`\n[HTTP ${response.status()}] ${response.url()}`);
		}
	});

	try {
		console.log('\n=== Attempting to navigate to http://localhost:5173/ ===\n');

		// Use a more forgiving wait condition
		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		});

		console.log('\n✓ Page loaded (DOM content loaded)');

		// Wait a bit more for any async operations
		await page.waitForTimeout(2000);

		console.log('\n✓ Waited 2 seconds for async operations');

		// Try to get page content
		const title = await page.title().catch((e) => `Error: ${e.message}`);
		console.log(`\n✓ Page title: ${title}`);

		const url = page.url();
		console.log(`✓ Current URL: ${url}`);

		// Try to get HTML
		const html = await page.content().catch((e) => `Error getting HTML: ${e.message}`);
		if (html.startsWith('Error')) {
			console.log(`\n✗ ${html}`);
		} else {
			console.log(`\n✓ HTML content length: ${html.length} characters`);

			// Look for specific elements that should exist
			const body = await page.$('body');
			if (body) {
				const bodyHTML = await body.innerHTML().catch(() => 'Could not get body innerHTML');
				console.log(`✓ Body HTML length: ${bodyHTML.length} characters`);
			} else {
				console.log(`✗ No <body> element found`);
			}
		}

		// Take screenshot if possible
		try {
			await page.screenshot({
				path: 'tests/screenshots/debug-screenshot.png',
				fullPage: true
			});
			console.log('\n✓ Screenshot saved: tests/screenshots/debug-screenshot.png');
		} catch (e) {
			console.log(`\n✗ Could not take screenshot: ${e.message}`);
		}
	} catch (error) {
		console.log(`\n✗ Navigation failed: ${error.message}`);
		console.log(`\nError details:`);
		console.log(error);
	}

	// Summary
	console.log(`\n\n========================================`);
	console.log(`SUMMARY`);
	console.log(`========================================`);
	console.log(`Console messages captured: ${consoleMessages.length}`);
	console.log(`Errors captured: ${errors.length}`);

	if (errors.length > 0) {
		console.log(`\n========================================`);
		console.log(`ERRORS FOUND:`);
		console.log(`========================================`);
		errors.forEach((error, index) => {
			console.log(`\n${index + 1}. ${error.text}`);
			if (error.location) {
				console.log(`   Location: ${error.location}`);
			}
			if (error.stack) {
				console.log(`   Stack:\n${error.stack}`);
			}
		});
	}

	if (consoleMessages.length > 0) {
		console.log(`\n========================================`);
		console.log(`ALL CONSOLE MESSAGES:`);
		console.log(`========================================`);
		const grouped = consoleMessages.reduce((acc, msg) => {
			acc[msg.type] = acc[msg.type] || [];
			acc[msg.type].push(msg);
			return acc;
		}, {});

		Object.entries(grouped).forEach(([type, messages]) => {
			console.log(`\n${type.toUpperCase()} (${messages.length}):`);
			messages.forEach((msg, i) => {
				console.log(`  ${i + 1}. ${msg.text}`);
				console.log(`     ${msg.location}`);
			});
		});
	}

	console.log(`\n========================================\n`);

	// Don't fail the test, we just want the debug info
	// expect(errors.length).toBe(0);
});
