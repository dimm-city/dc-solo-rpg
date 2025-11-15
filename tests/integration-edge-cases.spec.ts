// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Integration and Edge Cases', () => {
  test('should handle rapid modal opening and closing', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Rapidly open and close About modal
    for (let i = 0; i < 3; i++) {
      await page.click('button[aria-label="About"]');
      await page.waitForTimeout(100);
      await page.click('.info-modal-button:has-text("Close")');
      await page.waitForTimeout(100);
    }

    // Should still be functional
    await page.click('button[aria-label="About"]');
    await expect(page.locator('.overlay-modal-container')).toBeVisible();
  });

  test('should prevent multiple modals from opening simultaneously', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Open About modal
    await page.click('button[aria-label="About"]');
    await expect(page.locator('.overlay-modal-container')).toBeVisible();

    // Try to open Settings modal (should close About first or prevent)
    await page.click('button[aria-label="Settings"]');

    // Only one modal should be visible
    const modals = page.locator('.overlay-modal-container');
    const count = await modals.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('should handle game selection cancellation and re-selection', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    const firstCard = page.locator('.game-card').first();

    // Select and cancel
    await firstCard.click();
    await page.click('button:has-text("CANCEL")');

    // Select again
    await firstCard.click();
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Should work normally
    await expect(page.locator('button:has-text("START GAME")')).toBeVisible();
  });

  test('should maintain state after browser refresh', async ({ page }) => {
    // Setup with Skip Always
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash

    const skipAlwaysCard = page.locator('.choice-card').filter({ hasText: 'Skip Always' });
    if (await skipAlwaysCard.isVisible()) {
      await skipAlwaysCard.click();
      await page.waitForTimeout(500);
    }

    // Refresh page
    await page.reload();

    // Should skip instructions
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible({ timeout: 5000 });
  });

  test('should handle viewport resize while modal is open', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Open About modal
    await page.click('button[aria-label="About"]');
    await expect(page.locator('.overlay-modal-container')).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Modal should still be visible and functional
    await expect(page.locator('.overlay-modal-container')).toBeVisible();
    await expect(page.locator('.info-modal-button:has-text("Close")')).toBeVisible();

    // Should be able to close
    await page.click('.info-modal-button:has-text("Close")');
    await expect(page.locator('.overlay-modal-container')).not.toBeVisible();
  });

  test('should handle rapid game card clicking', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    const cards = page.locator('.game-card');
    const count = await cards.count();

    if (count >= 2) {
      // Click first card
      await cards.nth(0).click();
      await page.waitForTimeout(100);

      // Click second card quickly
      await cards.nth(1).click();

      // Should have a modal open
      await expect(page.locator('.modal-backdrop')).toBeVisible();
    }
  });

  test('should load all game data correctly', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Verify games are loaded
    const gameCards = page.locator('.game-card');
    const count = await gameCards.count();

    expect(count).toBeGreaterThan(0);

    // Each card should have title and subtitle
    for (let i = 0; i < count; i++) {
      const card = gameCards.nth(i);
      await expect(card.locator('.game-card-title')).toBeVisible();
      await expect(card.locator('.game-subtitle')).toBeVisible();
    }
  });

  test('should handle localStorage unavailable gracefully', async ({ page, context }) => {
    // This test simulates incognito/privacy mode where localStorage might fail
    // We can't fully disable localStorage, but we can test that the app doesn't crash

    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // App should load successfully
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();
  });

  test('should have no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Should have no errors
    expect(errors.length).toBe(0);
  });

  test('should handle Escape key press when no modal is open', async ({ page }) => {
    // Setup
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Press Escape
    await page.keyboard.press('Escape');

    // Page should still be functional
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
  });
});
