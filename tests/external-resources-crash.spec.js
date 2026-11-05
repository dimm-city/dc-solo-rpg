import { test, expect } from '@playwright/test';

/**
 * TEST: External resource failures must not break the app
 *
 * HISTORY: the app used to crash when external CDN resources (augmented-ui from unpkg.com,
 * Google Fonts) failed to load. The app now bundles augmented-ui and its fonts, and the only
 * remaining external resource is the Google Fonts stylesheet in src/app.html, which loads
 * non-blocking and drops itself (with a console warning) if it fails.
 *
 * EXPECTED BEHAVIOUR:
 * - Whether or not the external hosts are reachable, the page loads and stays responsive
 * - The home page content renders without any external CDN
 * - A failed font stylesheet falls back to system fonts instead of breaking the page
 *
 * The tests block the external hosts themselves, so they do not depend on the network the
 * suite happens to run on.
 */

/** Wait for the first screen the app shows (splash) and check the page is still scriptable */
async function expectPageFunctional(page) {
	await expect(page).toHaveTitle('Dream Console');

	const content = await page.content();
	expect(content.length).toBeGreaterThan(100);

	// The splash plays, then the first-visit choice screen appears
	await expect(page.locator('.instructions-choice-container')).toBeVisible();
	await expect(page.locator('.choice-card')).toHaveCount(3);
}

test.describe('External Resource Loading Issues', () => {
	test('should stay functional when external resources fail to load', async ({ page }) => {
		const failedResources = [];

		// Track failed requests
		page.on('requestfailed', (request) => {
			failedResources.push({
				url: request.url(),
				error: request.failure()?.errorText || 'Unknown error',
				resourceType: request.resourceType()
			});
		});

		// Make every external request fail
		await page.route('https://**', (route) => route.abort());

		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await expectPageFunctional(page);

		// The app's own resources never fail (a request cancelled by navigation is not a failure):
		// every failed request is an external one
		const ownFailures = failedResources.filter(
			(r) => new URL(r.url).hostname === 'localhost' && r.error !== 'net::ERR_ABORTED'
		);
		expect(ownFailures).toEqual([]);
	});

	test('should handle missing Google Fonts gracefully', async ({ page }) => {
		const warnings = [];
		page.on('console', (msg) => {
			if (msg.type() === 'warning') warnings.push(msg.text());
		});

		// Block Google Fonts
		await page.route('https://fonts.googleapis.com/**', (route) => route.abort());

		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await expectPageFunctional(page);

		// The font stylesheet removes itself and says so; the page uses fallback fonts
		await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(0);
		expect(warnings.some((w) => w.includes('Failed to load Google Fonts'))).toBe(true);
	});

	test('should handle missing augmented-ui CSS gracefully', async ({ page }) => {
		// Block the CDN augmented-ui used to be loaded from
		await page.route('https://unpkg.com/**', (route) => route.abort());

		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await expectPageFunctional(page);

		// augmented-ui ships with the app, so it is not fetched from a CDN at all
		const augmentedFromCdn = await page.evaluate(() =>
			performance
				.getEntriesByType('resource')
				.some((entry) => entry.name.includes('unpkg.com') || entry.name.includes('augmented-ui@'))
		);
		expect(augmentedFromCdn).toBe(false);
	});

	test('should handle all external resource failures gracefully', async ({ page }) => {
		// Block ALL external resources
		await page.route('https://**', (route) => route.abort());

		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await expectPageFunctional(page);

		// Should be able to take screenshot
		const screenshot = await page.screenshot({
			path: 'tests/screenshots/no-external-resources.png',
			fullPage: true
		});
		expect(screenshot.length).toBeGreaterThan(0);

		// ...and the game can still be reached and started with no CDN at all
		await page.locator('.choice-card').filter({ hasText: 'Skip Once' }).click();
		await expect(page.getByTestId('home-page')).toBeVisible();
		await page.locator('.start-btn').first().click();
		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
	});
});
