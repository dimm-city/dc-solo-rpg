// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

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

    // After a few seconds, splash should have completed
    await page.waitForTimeout(4000);

    // Verify splash was marked as shown
    expect(await page.evaluate(() => sessionStorage.getItem('splashShown'))).toBe('true');
  });

  test('should show instructions choice after splash on first visit', async ({ page }) => {
    await page.goto('/');

    // Wait for splash to complete
    await page.waitForTimeout(4000);

    // Instructions choice should be visible
    const instructionsChoice = page.locator('.instructions-choice-container');
    await expect(instructionsChoice).toBeVisible({ timeout: 2000 });

    // Verify title (exact text is "How To Play" with capital T)
    await expect(page.locator('h1').filter({ hasText: 'How To Play' })).toBeVisible();
  });

  test('should display all three instruction choice cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash

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
    await page.waitForTimeout(4000); // Wait for splash

    // Click Learn How to Play card
    const learnCard = page.locator('.choice-card').filter({ hasText: 'Learn How to Play' });
    await learnCard.click();

    // Verify navigation
    await expect(page).toHaveURL('/how-to');
  });

  test('should show game selection when clicking Skip Once', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash

    // Click Skip Once card
    const skipOnceCard = page.locator('.choice-card').filter({ hasText: 'Skip Once' });
    await skipOnceCard.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Verify game selection screen is visible
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();
  });

  test('should show game selection and remember preference when clicking Skip Always', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash

    // Click Skip Always card
    const skipAlwaysCard = page.locator('.choice-card').filter({ hasText: 'Skip Always' });
    await skipAlwaysCard.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // Verify game selection screen is visible
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

    // Verify localStorage was set
    const instructionsSeen = await page.evaluate(() => localStorage.getItem('instructionsSeen'));
    expect(instructionsSeen).toBe('true');
  });

  test('should skip splash on returning visit in same session', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash
    const skipOnceCard = page.locator('.choice-card').filter({ hasText: 'Skip Once' });
    await skipOnceCard.click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Should go directly to game selection (no splash)
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 2000 });
  });

  test('should skip instructions after Skip Always is chosen', async ({ page, context }) => {
    // First visit
    await page.goto('/');
    await page.waitForTimeout(4000);
    const skipAlwaysCard = page.locator('.choice-card').filter({ hasText: 'Skip Always' });
    await skipAlwaysCard.click();
    await page.waitForTimeout(500);

    // Close and reopen (new session, same context to preserve localStorage)
    await page.evaluate(() => sessionStorage.clear());
    await page.goto('/');

    // Wait for splash
    await page.waitForTimeout(4000);

    // Should skip instructions and go to game selection
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 2000 });

    // Instructions choice should NOT be visible
    await expect(page.locator('.instructions-choice-container')).not.toBeVisible();
  });

  test('should have proper styling on instruction choice cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000);

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
    await page.waitForTimeout(4000);

    const learnCard = page.locator('.choice-card').filter({ hasText: 'Learn How to Play' });

    // Hover over card
    await learnCard.hover();
    await page.waitForTimeout(300);

    // Card should have transform
    const transform = await learnCard.evaluate((el) => window.getComputedStyle(el).transform);
    expect(transform).not.toBe('none');
  });
});
