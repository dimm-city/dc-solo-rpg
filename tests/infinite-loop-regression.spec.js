import { test, expect } from '@playwright/test';

/**
 * Test for infinite loop regression in $effect
 *
 * ISSUE: $effect in +layout.svelte was causing infinite reactive loops
 * ERROR: "effect_update_depth_exceeded"
 *
 * This test navigates to the game page and checks for the specific error.
 */

test.describe('Infinite Loop Regression Tests', () => {
	test('should not have infinite $effect loops when navigating to home page', async ({ page }) => {
		const consoleErrors = [];
		const effectErrors = [];

		// Capture console errors
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				consoleErrors.push(text);

				// Check for the specific effect_update_depth_exceeded error
				if (text.includes('effect_update_depth_exceeded')) {
					effectErrors.push(text);
				}
			}
		});

		// Capture page errors
		page.on('pageerror', (error) => {
			const message = error.message;
			consoleErrors.push(message);

			if (message.includes('effect_update_depth_exceeded')) {
				effectErrors.push(message);
			}
		});

		console.log('\n=== Testing home page for infinite loops ===\n');

		// Navigate to home page
		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 10000
		});

		// Wait to see if any loops occur
		await page.waitForTimeout(2000);

		console.log(`Console errors captured: ${consoleErrors.length}`);
		console.log(`Effect depth errors: ${effectErrors.length}`);

		if (effectErrors.length > 0) {
			console.log('\n❌ INFINITE LOOP DETECTED:');
			effectErrors.forEach((err, i) => {
				console.log(`  ${i + 1}. ${err}`);
			});
		} else {
			console.log('\n✓ No infinite loop errors detected');
		}

		// Fail if we detected effect depth exceeded errors
		expect(effectErrors.length).toBe(0);
	});

	test('should not have infinite $effect loops when navigating to game page', async ({ page }) => {
		const consoleErrors = [];
		const effectErrors = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				consoleErrors.push(text);

				if (text.includes('effect_update_depth_exceeded')) {
					effectErrors.push(text);
				}
			}
		});

		page.on('pageerror', (error) => {
			const message = error.message;
			consoleErrors.push(message);

			if (message.includes('effect_update_depth_exceeded')) {
				effectErrors.push(message);
			}
		});

		console.log('\n=== Testing game navigation for infinite loops ===\n');

		// Navigate to home
		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 10000
		});

		await page.waitForTimeout(2000);

		// Try to navigate to a game page (if games exist)
		const startButton = page.locator('.start-btn').first();
		const hasStartButton = await startButton.isVisible().catch(() => false);

		if (hasStartButton) {
			console.log('✓ Found start button, clicking to navigate to game...');

			await startButton.click();

			// Wait for navigation and potential loop issues
			await page.waitForTimeout(3000);
		} else {
			console.log('⚠ No start button found, skipping game navigation test');
		}

		console.log(`Console errors captured: ${consoleErrors.length}`);
		console.log(`Effect depth errors: ${effectErrors.length}`);

		if (effectErrors.length > 0) {
			console.log('\n❌ INFINITE LOOP DETECTED:');
			effectErrors.forEach((err, i) => {
				console.log(`  ${i + 1}. ${err}`);
			});
		} else {
			console.log('\n✓ No infinite loop errors detected');
		}

		expect(effectErrors.length).toBe(0);
	});

	test('should not have excessive console warnings during navigation', async ({ page }) => {
		const consoleMessages = {
			error: [],
			warning: [],
			log: []
		};

		page.on('console', (msg) => {
			const type = msg.type();
			const text = msg.text();

			if (consoleMessages[type]) {
				consoleMessages[type].push(text);
			}
		});

		console.log('\n=== Checking for excessive console output ===\n');

		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 10000
		});

		await page.waitForTimeout(2000);

		console.log(`Errors: ${consoleMessages.error.length}`);
		console.log(`Warnings: ${consoleMessages.warning.length}`);
		console.log(`Logs: ${consoleMessages.log.length}`);

		// If we have a huge number of warnings/logs, it might indicate a loop
		// Normal page load should have < 50 console messages
		const totalMessages = consoleMessages.error.length +
		                      consoleMessages.warning.length +
		                      consoleMessages.log.length;

		console.log(`\nTotal console messages: ${totalMessages}`);

		if (totalMessages > 100) {
			console.log('⚠ Excessive console output detected (possible loop)');
			console.log('\nFirst 10 messages:');
			const allMessages = [
				...consoleMessages.error.map(m => `[ERROR] ${m}`),
				...consoleMessages.warning.map(m => `[WARN] ${m}`),
				...consoleMessages.log.map(m => `[LOG] ${m}`)
			];
			allMessages.slice(0, 10).forEach((msg, i) => {
				console.log(`  ${i + 1}. ${msg}`);
			});
		} else {
			console.log('✓ Console output within normal range');
		}

		// Allow up to 100 messages (generous limit)
		expect(totalMessages).toBeLessThan(100);
	});
});
