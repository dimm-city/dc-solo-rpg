// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Game Confirmation Modal', () => {
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

  test('should open game confirmation modal when clicking a game card', async ({ page }) => {
    // Wait for game cards to load
    await page.waitForSelector('.game-card', { timeout: 5000 });

    // Click first game card
    await page.click('.game-card');

    // Verify modal appears
    const modal = page.locator('.modal-backdrop');
    await expect(modal).toBeVisible();

    // Verify modal has title
    await expect(page.locator('#modal-title')).toContainText('Load Game');
  });

  test('should display correct game title in confirmation message', async ({ page }) => {
    // Click specific game card if it exists
    const futureGameCard = page.locator('[data-testid="game-card-future-lost"]');
    const gameCardCount = await futureGameCard.count();

    if (gameCardCount > 0) {
      await futureGameCard.click();

      // Verify game title in message
      const modalBody = page.locator('.modal-body p');
      await expect(modalBody).toContainText('Future Lost');
      await expect(modalBody).toContainText('Start');
    } else {
      // If future-lost doesn't exist, use first game card
      const firstCard = page.locator('.game-card').first();
      await firstCard.click();

      // Verify modal opens with Start message
      const modalBody = page.locator('.modal-body p');
      await expect(modalBody).toContainText('Start');
    }
  });

  test('should have START GAME and CANCEL buttons', async ({ page }) => {
    // Click a game card
    await page.click('.game-card');

    // Verify buttons exist
    await expect(page.locator('button:has-text("START GAME")')).toBeVisible();
    await expect(page.locator('button:has-text("CANCEL")')).toBeVisible();
  });

  test('should navigate to game page when clicking START GAME', async ({ page }) => {
    // Click first game card
    await page.click('.game-card');

    // Wait for modal to appear
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Click START GAME button
    await page.click('button:has-text("START GAME")');

    // Verify navigation (should go to /game/{slug})
    await expect(page).toHaveURL(/\/game\/.+/);
  });

  test('should close modal when clicking CANCEL button', async ({ page }) => {
    // Click a game card
    await page.click('.game-card');
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Click CANCEL button
    await page.click('button:has-text("CANCEL")');

    // Verify modal closes
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    // Click a game card
    await page.click('.game-card');
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Click backdrop (not the modal content)
    await page.locator('.modal-backdrop').click({ position: { x: 10, y: 10 } });

    // Verify modal closes
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
  });

  test('should close modal when pressing Escape key', async ({ page }) => {
    // Click a game card
    await page.click('.game-card');
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify modal closes
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();
  });

  test('should have highest z-index', async ({ page }) => {
    // Click a game card
    await page.click('.game-card');

    // Verify z-index
    const modal = page.locator('.modal-backdrop');
    const zIndex = await modal.evaluate((el) => window.getComputedStyle(el).zIndex);

    expect(parseInt(zIndex)).toBeGreaterThan(100000);
  });

  test('should have backdrop blur effect', async ({ page }) => {
    // Click a game card
    await page.click('.game-card');

    // Verify backdrop blur
    const backdrop = page.locator('.modal-backdrop');
    const backdropFilter = await backdrop.evaluate((el) =>
      window.getComputedStyle(el).backdropFilter || window.getComputedStyle(el).webkitBackdropFilter
    );

    expect(backdropFilter).toContain('blur');
  });

  test('should clear selection when modal is cancelled', async ({ page }) => {
    // Click a game card
    const gameCard = page.locator('.game-card').first();
    await gameCard.click();

    // Wait for modal to appear
    await expect(page.locator('.modal-backdrop')).toBeVisible();

    // Cancel modal
    await page.click('button:has-text("CANCEL")');

    // Wait for modal to close
    await expect(page.locator('.modal-backdrop')).not.toBeVisible();

    // Verify card no longer has selected class
    await expect(gameCard).not.toHaveClass(/selected/);
  });
});
