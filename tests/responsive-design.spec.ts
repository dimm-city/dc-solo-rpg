// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
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

  test('should display 3 columns on desktop (1280px)', async ({ page }) => {
    // Already at desktop size from beforeEach
    const grid = page.locator('.game-cards-grid');

    const gridColumns = await grid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('should display 2 columns on tablet (768px)', async ({ page }) => {
    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    const grid = page.locator('.game-cards-grid');

    const gridColumns = await grid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(2);
  });

  test('should display 1 column on mobile (375px)', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    const grid = page.locator('.game-cards-grid');

    const gridColumns = await grid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('should adjust header on mobile', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    const header = page.locator('.page-header');

    // Header should still be visible
    await expect(header).toBeVisible();

    // Icons should be smaller
    const svg = header.locator('svg').first();
    const width = await svg.evaluate((el) => {
      const bbox = el.getBoundingClientRect();
      return bbox.width;
    });

    expect(width).toBeLessThan(30); // Should be 24px or less on mobile
  });

  test('should maintain game card functionality on mobile', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Click game card
    const firstCard = page.locator('.game-card').first();
    await firstCard.click();

    // Modal should open
    await expect(page.locator('.modal-backdrop')).toBeVisible();
  });

  test('should maintain modal functionality on mobile', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Open About modal
    await page.click('button[aria-label="About"]');

    // Modal should be visible
    await expect(page.locator('.overlay-modal-container')).toBeVisible();

    // Modal content should be readable
    await expect(page.locator('.info-modal-title')).toBeVisible();
    await expect(page.locator('.info-modal-body')).toBeVisible();
    await expect(page.locator('.info-modal-button:has-text("Close")')).toBeVisible();
  });

  test('should have appropriate touch targets on mobile', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Check game card size
    const firstCard = page.locator('.game-card').first();
    const height = await firstCard.evaluate((el) => {
      const bbox = el.getBoundingClientRect();
      return bbox.height;
    });

    // Should be at least 44px (accessibility guideline for touch targets)
    expect(height).toBeGreaterThan(44);
  });

  test('should maintain layout integrity on small tablet (700px)', async ({ page }) => {
    // Resize to small tablet
    await page.setViewportSize({ width: 700, height: 1000 });

    // Game grid should still be visible
    await expect(page.locator('.game-cards-grid')).toBeVisible();

    // Cards should be visible
    const cards = page.locator('.game-card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should adjust instruction cards on mobile', async ({ page, context }) => {
    // Clear storage and resize
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash

    // Instruction cards should be visible and properly sized
    const cards = page.locator('.choice-card');
    const count = await cards.count();
    expect(count).toBe(3);

    // Each card should be full width on mobile
    const firstCard = cards.first();
    const width = await firstCard.evaluate((el) => {
      const bbox = el.getBoundingClientRect();
      return bbox.width;
    });

    // Should take most of the viewport width
    expect(width).toBeGreaterThan(300);
  });
});
