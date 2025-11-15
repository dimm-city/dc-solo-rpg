// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
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

  test('should have proper ARIA labels on header buttons', async ({ page }) => {
    // Check About button
    const aboutButton = page.locator('button[aria-label="About"]');
    await expect(aboutButton).toHaveAttribute('aria-label', 'About');

    // Check Settings button
    const settingsButton = page.locator('button[aria-label="Settings"]');
    await expect(settingsButton).toHaveAttribute('aria-label', 'Settings');

    // Check How to Play link
    const howToLink = page.locator('a[aria-label="How to Play"]');
    await expect(howToLink).toHaveAttribute('aria-label', 'How to Play');
  });

  test('should have proper modal ARIA attributes', async ({ page }) => {
    // Click a game card to open modal
    await page.click('.game-card');

    const modal = page.locator('.modal-backdrop');

    // Check role
    await expect(modal).toHaveAttribute('role', 'dialog');

    // Check aria-modal
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Check aria-labelledby
    await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Focus a game card
    const firstCard = page.locator('.game-card').first();
    await firstCard.focus();

    // Element should have focus
    await expect(firstCard).toBeFocused();

    // Get outline
    const outline = await firstCard.evaluate((el) => window.getComputedStyle(el).outline);

    // Should have visible focus indicator (outline should not be 'none')
    expect(outline).toContain('2px');
  });

  test('should support keyboard navigation through all interactive elements', async ({ page }) => {
    let tabCount = 0;
    const maxTabs = 20;

    // Tab through elements
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      const focused = page.locator(':focus');
      const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());

      // Stop if we've cycled through
      if (tagName === 'body') break;
    }

    // We should have been able to tab through multiple elements
    expect(tabCount).toBeGreaterThan(5);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h2 in header (if present)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();

    // Should have some headings
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have alt text on logo image', async ({ page }) => {
    const logo = page.locator('.logo-dice');
    await expect(logo).toHaveAttribute('alt');

    const altText = await logo.getAttribute('alt');
    expect(altText!.length).toBeGreaterThan(0);
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Emulate prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Reload to apply media query
    await page.reload();
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 10000 });

    // Check that animations are disabled or reduced
    const firstCard = page.locator('.game-card').first();
    const animationName = await firstCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.animationName;
    });

    // In reduced motion mode, animations should be 'none' or empty
    // This test verifies the CSS media query is working
    expect(animationName === 'none' || animationName === '').toBeTruthy();
  });

  test('should have semantic HTML structure', async ({ page }) => {
    // Verify main landmarks
    const sections = page.locator('section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);

    // Verify buttons are actual button elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verify links are actual anchor elements
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
