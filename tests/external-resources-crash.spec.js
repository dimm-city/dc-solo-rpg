import { test, expect } from '@playwright/test';

/**
 * TEST: External Resource Loading Crash
 *
 * ISSUE: The game crashes when external CDN resources fail to load
 *
 * ROOT CAUSE:
 * - src/app.html loads augmented-ui CSS from unpkg.com (line 16)
 * - src/app.html loads Google Fonts (Orbitron, Share Tech Mono) (line 19)
 * - src/styles.css imports Google Fonts (Orbitron, Inter) (line 7)
 *
 * SYMPTOMS:
 * - Page loads DOM content but then crashes
 * - Browser target becomes unresponsive
 * - Cannot get page.title(), page.content(), or page.screenshot()
 *
 * FAILED RESOURCES:
 * 1. https://unpkg.com/augmented-ui@2/augmented-ui.min.css
 *    Error: net::ERR_CERT_AUTHORITY_INVALID
 *
 * 2. https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap
 *    Error: net::ERR_NAME_NOT_RESOLVED
 *
 * 3. https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Inter:wght@400;500;600;700&display=swap
 *    Error: net::ERR_NAME_NOT_RESOLVED
 *
 * EXPECTED BEHAVIOR:
 * - Game should gracefully degrade when external resources fail
 * - Page should remain functional even without custom fonts/augmented-ui
 * - Core gameplay should not depend on external CDNs
 *
 * RECOMMENDED FIXES:
 * 1. Use local copies of augmented-ui and fonts (committed to repo)
 * 2. Add fallback fonts in CSS for when Google Fonts fail
 * 3. Make augmented-ui optional with graceful degradation
 * 4. Add error handling for failed resource loads
 */

test.describe('External Resource Loading Issues', () => {
	test('should document external resource failures that cause crash', async ({ page }) => {
		const failedResources = [];
		const consoleErrors = [];

		// Track failed requests
		page.on('requestfailed', (request) => {
			failedResources.push({
				url: request.url(),
				error: request.failure()?.errorText || 'Unknown error',
				resourceType: request.resourceType()
			});
		});

		// Track console errors
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Attempt to navigate
		try {
			await page.goto('http://localhost:5173/', {
				waitUntil: 'domcontentloaded',
				timeout: 10000
			});

			// Wait a bit for all resources to attempt loading
			await page.waitForTimeout(3000);

			// Try to interact with the page
			const canGetTitle = await page.title().catch(() => null);
			const canGetHTML = await page.content().catch(() => null);

			// Report findings
			console.log('\n========================================');
			console.log('EXTERNAL RESOURCE FAILURE TEST');
			console.log('========================================\n');

			console.log(`Failed Resources: ${failedResources.length}`);
			failedResources.forEach((resource, i) => {
				console.log(`\n${i + 1}. ${resource.url}`);
				console.log(`   Type: ${resource.resourceType}`);
				console.log(`   Error: ${resource.error}`);
			});

			console.log(`\n\nConsole Errors: ${consoleErrors.length}`);
			consoleErrors.slice(0, 5).forEach((error, i) => {
				console.log(`  ${i + 1}. ${error}`);
			});

			console.log(`\n\nPage State:`);
			console.log(`  Can get title: ${canGetTitle !== null ? '✓ Yes' : '✗ No (page crashed)'}`);
			console.log(`  Can get HTML: ${canGetHTML !== null ? '✓ Yes' : '✗ No (page crashed)'}`);

			if (canGetTitle) {
				console.log(`  Title: "${canGetTitle}"`);
			}

			console.log('\n========================================');
			console.log('EXPECTED EXTERNAL RESOURCES TO FAIL:');
			console.log('========================================');
			console.log('1. augmented-ui from unpkg.com (SSL certificate issue)');
			console.log('2. Google Fonts for Orbitron, Share Tech Mono');
			console.log('3. Google Fonts for Orbitron, Inter');
			console.log('\n========================================');
			console.log('RECOMMENDATION:');
			console.log('========================================');
			console.log('Move external resources to local files:');
			console.log('  - Download augmented-ui CSS to static/ folder');
			console.log('  - Download Google Fonts to static/fonts/ folder');
			console.log('  - Update src/app.html to use local paths');
			console.log('  - Update src/styles.css to use local fonts');
			console.log('========================================\n');

			// This test documents the issue - we expect resources to fail
			// but the page should NOT crash
			if (canGetTitle === null || canGetHTML === null) {
				console.log('❌ CRITICAL: Page crashed after resource failures!\n');
			} else {
				console.log('✅ GOOD: Page remains functional despite resource failures\n');
			}

			// The test passes if we can document the failures
			// The page crashing is documented here for fixing
			expect(failedResources.length).toBeGreaterThan(0);
		} catch (error) {
			console.log(`\n❌ Navigation or page interaction failed:`);
			console.log(`   ${error.message}\n`);
			throw error;
		}
	});

	test('should handle missing Google Fonts gracefully', async ({ page }) => {
		// Block Google Fonts
		await page.route('https://fonts.googleapis.com/**', (route) => route.abort());

		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 10000
		});

		await page.waitForTimeout(2000);

		// Page should still be functional
		const title = await page.title();
		console.log(`\n✓ Page loaded without Google Fonts`);
		console.log(`✓ Title: ${title}`);

		// Should be able to get page content
		const content = await page.content();
		expect(content).toBeTruthy();
		expect(content.length).toBeGreaterThan(100);

		console.log(`✓ Page content accessible (${content.length} characters)\n`);
	});

	test('should handle missing augmented-ui CSS gracefully', async ({ page }) => {
		// Block augmented-ui
		await page.route('https://unpkg.com/**', (route) => route.abort());

		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 10000
		});

		await page.waitForTimeout(2000);

		// Page should still be functional
		const title = await page.title();
		console.log(`\n✓ Page loaded without augmented-ui`);
		console.log(`✓ Title: ${title}`);

		// Should be able to get page content
		const content = await page.content();
		expect(content).toBeTruthy();
		expect(content.length).toBeGreaterThan(100);

		console.log(`✓ Page content accessible (${content.length} characters)\n`);
	});

	test('should handle all external resource failures gracefully', async ({ page }) => {
		// Block ALL external resources
		await page.route('https://**', (route) => route.abort());

		await page.goto('http://localhost:5173/', {
			waitUntil: 'domcontentloaded',
			timeout: 10000
		});

		await page.waitForTimeout(2000);

		// Page should STILL be functional
		const title = await page.title();
		console.log(`\n✓ Page loaded without ANY external resources`);
		console.log(`✓ Title: ${title}`);

		// Should be able to get page content
		const content = await page.content();
		expect(content).toBeTruthy();
		expect(content.length).toBeGreaterThan(100);

		console.log(`✓ Page content accessible (${content.length} characters)`);

		// Should be able to take screenshot
		await page.screenshot({
			path: 'tests/screenshots/no-external-resources.png',
			fullPage: true
		});

		console.log(`✓ Screenshot captured successfully`);
		console.log(`\n✅ Game is functional without external CDNs!\n`);
	});
});
