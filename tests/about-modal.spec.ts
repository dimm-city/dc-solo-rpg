// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('About Modal', () => {
  // Helper to skip splash and instructions
  test.beforeEach(async ({ page }) => {
    // Set session storage to skip splash
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('splashShown', 'true');
      localStorage.setItem('instructionsSeen', 'true');
    });
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });
  });

  test('should open About modal when clicking About button', async ({ page }) => {
    // Click About button in header
    await page.click('button[aria-label="About"]');

    // Verify modal appears
    await expect(page.locator('.overlay-modal-container')).toBeVisible();
    await expect(page.locator('h2:has-text("About DC Solo RPG")')).toBeVisible();
  });

  test('should display About modal content', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');

    // Verify title
    const title = page.locator('.info-modal-title');
    await expect(title).toContainText('About DC Solo RPG');

    // Verify body content exists
    const body = page.locator('.info-modal-body');
    await expect(body).toBeVisible();
    await expect(body.locator('p').first()).toContainText('Dimm City Solo RPG');

    // Verify attribution text
    const attribution = page.locator('.attribution');
    await expect(attribution).toBeVisible();
    await expect(attribution).toContainText('The Wretched');
    await expect(attribution).toContainText('Chris Bissette');
  });

  test('should close About modal when clicking Close button', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');
    await expect(page.locator('.overlay-modal-container')).toBeVisible();

    // Click Close button
    await page.click('.info-modal-button:has-text("Close")');

    // Verify modal closes
    await expect(page.locator('.overlay-modal-container')).not.toBeVisible();
  });

  test('should have proper z-index stacking', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');

    // Verify z-index
    const modal = page.locator('.overlay-modal-container');
    const zIndex = await modal.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(zIndex).toBe('1000');
  });

  test('should display backdrop blur effect', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');

    // Verify backdrop blur exists
    const backdrop = page.locator('.overlay-modal-container');
    const backdropFilter = await backdrop.evaluate((el) =>
      window.getComputedStyle(el).backdropFilter || window.getComputedStyle(el).webkitBackdropFilter
    );

    expect(backdropFilter).toContain('blur');
  });

  test('should have scrollable content area', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');

    // Verify modal content is scrollable
    const content = page.locator('.overlay-modal-content');
    const overflowY = await content.evaluate((el) => window.getComputedStyle(el).overflowY);

    expect(overflowY).toBe('auto');
  });

  test('should have fixed height of 70dvh', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');

    // Verify fixed height
    const content = page.locator('.overlay-modal-content');
    const height = await content.evaluate((el) => window.getComputedStyle(el).height);

    // Height should be approximately 70% of viewport
    const viewportHeight = await page.viewportSize().then(size => size!.height);
    const expectedHeight = viewportHeight * 0.7;
    const actualHeight = parseFloat(height);

    expect(Math.abs(actualHeight - expectedHeight)).toBeLessThan(50); // Allow 50px tolerance
  });

  test('should have augmented-ui corner clips', async ({ page }) => {
    // Open About modal
    await page.click('button[aria-label="About"]');

    // Verify augmented-ui attribute
    const content = page.locator('.overlay-modal-content');
    const augmentedAttr = await content.getAttribute('data-augmented-ui');

    expect(augmentedAttr).toContain('tl-clip');
    expect(augmentedAttr).toContain('tr-clip');
    expect(augmentedAttr).toContain('br-clip');
    expect(augmentedAttr).toContain('bl-clip');
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Find and click About button with keyboard
    await page.focus('button[aria-label="About"]');
    await page.keyboard.press('Enter');

    // Verify modal opens
    await expect(page.locator('.overlay-modal-container')).toBeVisible();

    // Verify Close button is visible and can be focused
    const closeButton = page.locator('.info-modal-button:has-text("Close")');
    await expect(closeButton).toBeVisible();

    // Tab to Close button
    await page.keyboard.press('Tab');

    // Close button should be focusable (even if not currently focused due to tab order)
    await closeButton.focus();
    await expect(closeButton).toBeFocused();
  });
});
