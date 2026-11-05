// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY } from './helpers';

test.describe('Splash Screen and Instructions Flow', () => {
	test.beforeEach(async ({ page, context }) => {
		// Clear all storage before each test
		await context.clearCookies();
		await page.goto('/');
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
		});
	});

	test('should show splash screen on first visit', async ({ page }) => {
		await page.goto('/');

		// The splash overlay is up on arrival
		await expect(page.locator('.splash-overlay')).toBeVisible();

		// ...and when it completes, it marks itself as shown for this session
		await expect
			.poll(() => page.evaluate(() => sessionStorage.getItem('splashShown')))
			.toBe('true');
		await expect(page.locator('.splash-overlay')).toHaveCount(0);
	});

	test('should show instructions choice after splash on first visit', async ({ page }) => {
		await page.goto('/');

		// Instructions choice should appear once the splash completes
		const instructionsChoice = page.locator('.instructions-choice-container');
		await expect(instructionsChoice).toBeVisible();

		// Verify title (exact text is "How To Play" with capital T)
		await expect(page.locator('h1').filter({ hasText: 'How To Play' })).toBeVisible();
	});

	test('should display all three instruction choice cards', async ({ page }) => {
		await page.goto('/');

		// Verify all three choice cards are visible
		const learnCard = page.locator('.choice-card').filter({ hasText: 'Learn How to Play' });
		await expect(learnCard).toBeVisible();

		const skipOnceCard = page.locator('.choice-card').filter({ hasText: 'Skip Once' });
		await expect(skipOnceCard).toBeVisible();

		const skipAlwaysCard = page.locator('.choice-card').filter({ hasText: 'Skip Always' });
		await expect(skipAlwaysCard).toBeVisible();
	});

	test('should navigate to how-to page when clicking Learn How to Play', async ({ page }) => {
		await page.goto('/');

		// Click Learn How to Play card
		const learnCard = page.locator('.choice-card').filter({ hasText: 'Learn How to Play' });
		await learnCard.click();

		// Verify navigation
		await expect(page).toHaveURL('/how-to');
	});

	test('should show game selection when clicking Skip Once', async ({ page }) => {
		await page.goto('/');

		// Click Skip Once card
		const skipOnceCard = page.locator('.choice-card').filter({ hasText: 'Skip Once' });
		await skipOnceCard.click();

		// Verify game selection screen is visible
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
		await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();

		// Skip Once does not remember the choice
		expect(
			await page.evaluate((key) => localStorage.getItem(key), INSTRUCTIONS_SEEN_KEY)
		).toBeNull();
	});

	test('should show game selection and remember preference when clicking Skip Always', async ({
		page
	}) => {
		await page.goto('/');

		// Click Skip Always card
		const skipAlwaysCard = page.locator('.choice-card').filter({ hasText: 'Skip Always' });
		await skipAlwaysCard.click();

		// Verify game selection screen is visible
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

		// Verify localStorage was set
		const instructionsSeen = await page.evaluate(
			(key) => localStorage.getItem(key),
			INSTRUCTIONS_SEEN_KEY
		);
		expect(instructionsSeen).toBe('true');
	});

	test('should skip splash on returning visit in same session', async ({ page }) => {
		// First visit
		await page.goto('/');
		const skipOnceCard = page.locator('.choice-card').filter({ hasText: 'Skip Once' });
		await skipOnceCard.click();
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

		// Reload page
		await page.reload();

		// Should go directly to game selection (no splash)
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 2000 });
	});

	test('should skip instructions after Skip Always is chosen', async ({ page, context }) => {
		// First visit
		await page.goto('/');
		const skipAlwaysCard = page.locator('.choice-card').filter({ hasText: 'Skip Always' });
		await skipAlwaysCard.click();
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

		// Close and reopen (new session, same context to preserve localStorage)
		await page.evaluate(() => sessionStorage.clear());
		await page.goto('/');

		// After the splash, should skip instructions and go to game selection
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

		// Instructions choice should NOT be visible
		await expect(page.locator('.instructions-choice-container')).not.toBeVisible();
	});

	test('should have proper styling on instruction choice cards', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.instructions-choice-container')).toBeVisible();

		// Check first card (Learn How to Play)
		const learnCard = page.locator('.choice-card').filter({ hasText: 'Learn How to Play' });
		await expect(learnCard).toBeVisible();

		// Verify icon is visible
		await expect(learnCard.locator('svg')).toBeVisible();

		// Verify recommendation badge
		await expect(learnCard.locator('.recommendation')).toBeVisible();
	});

	test('should have hover effect on instruction choice cards', async ({ page }) => {
		await page.goto('/');

		const learnCard = page.locator('.choice-card').filter({ hasText: 'Learn How to Play' });
		await expect(learnCard).toBeVisible();

		// Hover over card
		await learnCard.hover();

		// Card should lift (translateY) once the hover transition runs
		await expect
			.poll(() => learnCard.evaluate((el) => window.getComputedStyle(el).transform))
			.not.toBe('none');
	});
});
