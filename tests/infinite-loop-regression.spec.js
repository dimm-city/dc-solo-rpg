import { test, expect } from '@playwright/test';
import { openHomePage, playToFirstRound } from './helpers';

/**
 * Test for infinite loop regression in $effect
 *
 * ISSUE: $effect in +layout.svelte was causing infinite reactive loops
 * ERROR: "effect_update_depth_exceeded"
 *
 * These tests walk the home page and the first steps of a game and check for the specific error.
 */

/** Collect console and page errors, and the subset that are runaway-effect errors */
function trackErrors(page) {
	const tracker = { consoleErrors: [], effectErrors: [] };

	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			const text = msg.text();
			tracker.consoleErrors.push(text);

			// Check for the specific effect_update_depth_exceeded error
			if (text.includes('effect_update_depth_exceeded')) {
				tracker.effectErrors.push(text);
			}
		}
	});

	page.on('pageerror', (error) => {
		const message = error.message;
		tracker.consoleErrors.push(message);

		if (message.includes('effect_update_depth_exceeded')) {
			tracker.effectErrors.push(message);
		}
	});

	return tracker;
}

test.describe('Infinite Loop Regression Tests', () => {
	test('should not have infinite $effect loops when navigating to home page', async ({ page }) => {
		const tracker = trackErrors(page);

		await page.goto('/', { waitUntil: 'domcontentloaded' });

		// Let the splash finish and the next screen mount, where reactive state is busiest
		await expect(page.locator('.instructions-choice-container')).toBeVisible();

		expect(tracker.effectErrors).toEqual([]);
	});

	test('should not have infinite $effect loops when navigating to game page', async ({ page }) => {
		const tracker = trackErrors(page);

		await openHomePage(page);
		const startButton = page.locator('.start-btn').first();
		await expect(startButton).toBeVisible();
		await startButton.click();

		// Navigate to the game and walk through the intro, the opening roll and the first round start
		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
		await playToFirstRound(page);

		expect(tracker.effectErrors).toEqual([]);
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

		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await expect(page.locator('.instructions-choice-container')).toBeVisible();

		// If we have a huge number of warnings/logs, it might indicate a loop
		// Normal page load should have < 50 console messages
		const totalMessages =
			consoleMessages.error.length + consoleMessages.warning.length + consoleMessages.log.length;

		if (totalMessages >= 100) {
			const allMessages = [
				...consoleMessages.error.map((m) => `[ERROR] ${m}`),
				...consoleMessages.warning.map((m) => `[WARN] ${m}`),
				...consoleMessages.log.map((m) => `[LOG] ${m}`)
			];
			console.log('First 10 messages:\n' + allMessages.slice(0, 10).join('\n'));
		}

		// Allow up to 100 messages (generous limit)
		expect(totalMessages).toBeLessThan(100);
	});
});
