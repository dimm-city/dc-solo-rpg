// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Header and Navigation', () => {
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

	test('should display header with all elements', async ({ page }) => {
		const header = page.locator('.page-header');

		// Verify header is visible
		await expect(header).toBeVisible();

		// Verify logo is visible
		await expect(header.locator('.logo-dice')).toBeVisible();

		// Verify version text
		await expect(header.locator('.version-text')).toContainText('DC-S-0.1.0');

		// Verify header buttons
		await expect(header.locator('button[aria-label="About"]')).toBeVisible();
		await expect(header.locator('a[aria-label="How to Play"]')).toBeVisible();
		await expect(header.locator('button[aria-label="Settings"]')).toBeVisible();
	});

	test('should have sticky header', async ({ page }) => {
		const header = page.locator('.page-header');

		// Get position
		const position = await header.evaluate((el) => window.getComputedStyle(el).position);

		expect(position).toBe('sticky');
	});

	test('should display logo with correct styling', async ({ page }) => {
		const logo = page.locator('.logo-dice');

		// Verify logo has drop-shadow filter
		const filter = await logo.evaluate((el) => window.getComputedStyle(el).filter);
		expect(filter).toContain('drop-shadow');
	});

	test('should display version text with correct styling', async ({ page }) => {
		const versionText = page.locator('.version-text');

		// Verify version text is uppercase
		const textTransform = await versionText.evaluate(
			(el) => window.getComputedStyle(el).textTransform
		);
		expect(textTransform).toBe('uppercase');
	});

	test('should have hover effect on header buttons', async ({ page }) => {
		const aboutButton = page.locator('button[aria-label="About"]');

		// Hover over button
		await aboutButton.hover();

		// Small delay for transition
		await page.waitForTimeout(300);

		// Button should have transform scale on hover
		const transform = await aboutButton.evaluate((el) => window.getComputedStyle(el).transform);
		expect(transform).toContain('scale');
	});

	test('should navigate to How to Play page when clicking link', async ({ page }) => {
		// Click How to Play link
		await page.click('a[aria-label="How to Play"]');

		// Verify navigation
		await expect(page).toHaveURL('/how-to');
	});

	test('should open About modal when clicking About button', async ({ page }) => {
		// Click About button
		await page.click('button[aria-label="About"]');

		// Verify modal opens
		await expect(page.locator('.overlay-modal-container')).toBeVisible();
	});

	test('should open Settings modal when clicking Settings button', async ({ page }) => {
		// Click Settings button
		await page.click('button[aria-label="Settings"]');

		// Verify modal opens
		await expect(page.locator('.overlay-modal-container')).toBeVisible();
	});

	test('should have proper z-index layering', async ({ page }) => {
		const header = page.locator('.page-header');

		// Get z-index
		const zIndex = await header.evaluate((el) => window.getComputedStyle(el).zIndex);

		expect(parseInt(zIndex)).toBeGreaterThan(50);
	});

	test('should have backdrop blur on header', async ({ page }) => {
		const header = page.locator('.page-header');

		// Verify backdrop filter
		const backdropFilter = await header.evaluate(
			(el) =>
				window.getComputedStyle(el).backdropFilter ||
				window.getComputedStyle(el).webkitBackdropFilter
		);

		expect(backdropFilter).toContain('blur');
	});
});
