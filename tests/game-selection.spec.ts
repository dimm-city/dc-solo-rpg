// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Game Selection Screen', () => {
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

  test('should display game selection screen with all elements', async ({ page }) => {
    // Verify page container
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

    // Verify game selector
    await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();

    // Verify header is visible
    await expect(page.locator('.page-header')).toBeVisible();
  });

  test('should display games in a grid', async ({ page }) => {
    // Verify game cards grid exists
    const grid = page.locator('.game-cards-grid');
    await expect(grid).toBeVisible();

    // Verify grid has games
    const gameCards = page.locator('.game-card');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display game cards with correct information', async ({ page }) => {
    // Check first game card
    const firstCard = page.locator('.game-card').first();

    // Verify title exists
    await expect(firstCard.locator('.game-card-title')).toBeVisible();

    // Verify subtitle exists
    await expect(firstCard.locator('.game-subtitle')).toBeVisible();
  });

  test('should display each game with data-testid', async ({ page }) => {
    // Verify at least one game card has correct testid format
    const gameCards = page.locator('[data-testid^="game-card-"]');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have augmented-ui styling on game cards', async ({ page }) => {
    // Check first game card has augmented-ui attribute
    const firstCard = page.locator('.game-card').first();
    const augmentedAttr = await firstCard.getAttribute('data-augmented-ui');

    expect(augmentedAttr).toBeTruthy();
    expect(augmentedAttr).toContain('border');
  });

  test('should show hover effect on game cards', async ({ page }) => {
    const firstCard = page.locator('.game-card').first();

    // Get initial transform
    const initialTransform = await firstCard.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Hover over card
    await firstCard.hover();

    // Small delay for transition
    await page.waitForTimeout(400);

    // Get transform after hover
    const hoverTransform = await firstCard.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Transform should have changed (card should lift)
    expect(hoverTransform).not.toBe(initialTransform);
  });

  test('should apply selected state when game card is clicked', async ({ page }) => {
    const firstCard = page.locator('.game-card').first();

    // Click card
    await firstCard.click();

    // Verify selected class is applied
    await expect(firstCard).toHaveClass(/selected/);
  });

  test('should display game cards in 3 columns on desktop', async ({ page }) => {
    // Get grid
    const grid = page.locator('.game-cards-grid');

    // Get computed grid-template-columns
    const gridColumns = await grid.evaluate((el) =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // Should have 3 columns (will have 3 values in the string)
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(3);
  });

  test('should have glassmorphism background on game cards', async ({ page }) => {
    const firstCard = page.locator('.game-card').first();

    // Verify backdrop-filter exists
    const backdropFilter = await firstCard.evaluate((el) =>
      window.getComputedStyle(el).backdropFilter || window.getComputedStyle(el).webkitBackdropFilter
    );

    expect(backdropFilter).toContain('blur');
  });

  test('should have different border colors for each game card', async ({ page }) => {
    const cards = page.locator('.game-card');
    const count = await cards.count();

    if (count >= 3) {
      // Check that different cards have different classes
      const class1 = await cards.nth(0).getAttribute('class');
      const class2 = await cards.nth(1).getAttribute('class');
      const class3 = await cards.nth(2).getAttribute('class');

      // Each should have unique card variant class
      expect(class1).toContain('game-card-1');
      expect(class2).toContain('game-card-2');
      expect(class3).toContain('game-card-3');
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Find and focus first game card directly
    const firstCard = page.locator('.game-card').first();
    await firstCard.focus();

    // Focus should be on a game card
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveClass(/game-card/);

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Confirm modal should open
    await expect(page.locator('.modal-backdrop')).toBeVisible();
  });
});
