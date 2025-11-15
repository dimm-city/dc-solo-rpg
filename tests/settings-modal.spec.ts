// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Settings Modal', () => {
	test.beforeEach(async ({ page }) => {
		// Skip splash and instructions
		await page.goto('/');
		await page.evaluate(() => {
			sessionStorage.setItem('splashShown', 'true');
			localStorage.setItem('instructionsSeen', 'true');
		});
		await page.goto('/');
		await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });
	});

	test('should open Settings modal when clicking Settings button', async ({ page }) => {
		// Click Settings button in header
		await page.click('button[aria-label="Settings"]');

		// Verify modal appears
		await expect(page.locator('.overlay-modal-container')).toBeVisible();
		await expect(page.locator('h2:has-text("Game Settings")')).toBeVisible();
	});

	test('should display Settings modal content', async ({ page }) => {
		// Open Settings modal
		await page.click('button[aria-label="Settings"]');

		// Verify title
		const title = page.locator('.info-modal-title');
		await expect(title).toContainText('Game Settings');

		// Verify description paragraph
		const body = page.locator('.info-modal-body');
		await expect(body).toBeVisible();
		await expect(body.locator('p').first()).toContainText('Configure your global game preferences');

		// Verify "Open Settings Page" button exists
		const settingsButton = page.locator('button:has-text("Open Settings Page")');
		await expect(settingsButton).toBeVisible();

		// Verify Close button
		const closeButton = page.locator('.info-modal-button:has-text("Close")');
		await expect(closeButton).toBeVisible();
	});

	test('should navigate to Settings page when clicking Open Settings Page button', async ({
		page
	}) => {
		// Open Settings modal
		await page.click('button[aria-label="Settings"]');

		// Click "Open Settings Page" button
		await page.click('button:has-text("Open Settings Page")');

		// Verify navigation to /settings
		await expect(page).toHaveURL('/settings');
	});

	test('should close Settings modal when clicking Close button', async ({ page }) => {
		// Open Settings modal
		await page.click('button[aria-label="Settings"]');
		await expect(page.locator('.overlay-modal-container')).toBeVisible();

		// Click Close button
		await page.click('.info-modal-button:has-text("Close")');

		// Verify modal closes
		await expect(page.locator('.overlay-modal-container')).not.toBeVisible();
	});

	test('should display settings button with icon', async ({ page }) => {
		// Open Settings modal
		await page.click('button[aria-label="Settings"]');

		// Verify button has icon
		const settingsButton = page.locator('button.settings-link-button');
		const svg = settingsButton.locator('svg');
		await expect(svg).toBeVisible();
	});

	test('should have same styling as About modal', async ({ page }) => {
		// Open Settings modal
		await page.click('button[aria-label="Settings"]');

		// Verify z-index
		const modal = page.locator('.overlay-modal-container');
		const zIndex = await modal.evaluate((el) => window.getComputedStyle(el).zIndex);
		expect(zIndex).toBe('1000');

		// Verify fixed height
		const content = page.locator('.overlay-modal-content');
		const height = await content.evaluate((el) => window.getComputedStyle(el).height);

		const viewportHeight = await page.viewportSize().then((size) => size!.height);
		const expectedHeight = viewportHeight * 0.7;
		const actualHeight = parseFloat(height);

		expect(Math.abs(actualHeight - expectedHeight)).toBeLessThan(50);
	});
});
