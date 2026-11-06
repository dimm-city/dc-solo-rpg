// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage, openContentModal, openHeaderMenu } from './helpers';

test.describe('Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should have proper ARIA labels on header buttons', async ({ page }) => {
		// The phone menu button is icon-only, so it needs an explicit label and state
		const toggle = page.getByRole('button', { name: 'Toggle menu', includeHidden: true });
		await expect(toggle).toHaveAttribute('aria-label', 'Toggle menu');
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');

		// Every header action has a visible text label that names it
		await openHeaderMenu(page);
		const items = page.locator('.mobile-menu button:visible');
		const count = await items.count();
		expect(count).toBeGreaterThanOrEqual(3);
		for (let i = 0; i < count; i++) {
			await expect(items.nth(i)).toHaveAccessibleName(/\S/);
		}
		await expect(page.getByRole('button', { name: 'About', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Help', exact: true })).toBeVisible();
	});

	test('should have accessible names on game card buttons', async ({ page }) => {
		const playButtons = page.locator('.game-card').getByRole('button', { name: 'Play' });
		expect(await playButtons.count()).toBe(await page.locator('.game-card').count());

		// Each Play button is described by its game's title
		for (const button of await playButtons.all()) {
			await expect(button).toHaveAccessibleDescription(/\S/);
		}
	});

	test('should have proper modal ARIA attributes', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		// Check role and aria-modal
		await expect(dialog).toHaveAttribute('role', 'dialog');
		await expect(dialog).toHaveAttribute('aria-modal', 'true');

		// aria-labelledby points at the visible title
		const labelledBy = await dialog.getAttribute('aria-labelledby');
		expect(labelledBy).toBeTruthy();
		await expect(page.locator(`[id="${labelledBy}"]`)).toHaveText('About');
	});

	test('should have visible focus indicators', async ({ page }) => {
		// Reach the first Play button by keyboard so :focus-visible applies
		const header = page.locator('.page-header');
		const toggle = header.getByRole('button', { name: 'Toggle menu' });
		const last = (await toggle.isVisible())
			? toggle
			: header.getByRole('button', { name: 'More', exact: true });
		await last.focus();
		await page.keyboard.press('Tab');

		const playButton = page.locator('.game-card').first().getByRole('button', { name: 'Play' });
		await expect(playButton).toBeFocused();

		// Should have a visible focus indicator (3px neon outline)
		const outline = await playButton.evaluate((el) => {
			const style = window.getComputedStyle(el);
			return { style: style.outlineStyle, width: style.outlineWidth };
		});
		expect(outline.style).not.toBe('none');
		expect(outline.width).toBe('3px');
	});

	test('should support keyboard navigation through all interactive elements', async ({ page }) => {
		const cardCount = await page.locator('.game-card').count();
		const visited: string[] = [];
		const headerStops =
			page.viewportSize()!.width >= 900 ? ['Stories', 'Settings', 'Help', 'More'] : ['Toggle menu'];

		// Tab from the top of the page: the header actions, then each Play button
		await page.locator('body').click({ position: { x: 1, y: 1 } });
		for (let i = 0; i < headerStops.length + cardCount; i++) {
			await page.keyboard.press('Tab');
			visited.push(
				await page.evaluate(
					() =>
						document.activeElement?.getAttribute('aria-label') ||
						document.activeElement?.textContent?.trim() ||
						''
				)
			);
		}

		expect(visited.slice(0, headerStops.length)).toEqual(headerStops);
		expect(visited.slice(headerStops.length)).toEqual(Array(cardCount).fill('Play'));
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		// Game titles are headings, one per card
		const headings = page.locator('h1, h2, h3, h4, h5, h6');
		expect(await headings.count()).toBeGreaterThan(0);

		const titles = page.locator('.game-card h3.game-card-title');
		expect(await titles.count()).toBe(await page.locator('.game-card').count());
	});

	test('should have alt text on logo image', async ({ page }) => {
		const logo = page.locator('.logo-dice');
		await expect(logo).toHaveAttribute('alt');

		const altText = await logo.getAttribute('alt');
		expect(altText!.length).toBeGreaterThan(0);
	});

	test('should respect reduced motion preference', async ({ page }) => {
		// Without the preference the cards fade in with an animation
		const firstCard = page.locator('.game-card').first();
		await expect
			.poll(() => firstCard.evaluate((el) => window.getComputedStyle(el).animationName))
			.not.toBe('none');

		// Emulate prefers-reduced-motion
		await page.emulateMedia({ reducedMotion: 'reduce' });

		// Reload to apply media query
		await page.reload();
		await expect(page.getByTestId('home-page')).toBeVisible();

		// In reduced motion mode, animations should be 'none'
		await expect(page.locator('.game-card').first()).toBeVisible();
		const animationName = await page
			.locator('.game-card')
			.first()
			.evaluate((el) => window.getComputedStyle(el).animationName);
		expect(animationName).toBe('none');
	});

	test('should have semantic HTML structure', async ({ page }) => {
		// Main content is a section
		expect(await page.locator('section').count()).toBeGreaterThan(0);

		// Verify buttons are actual button elements
		expect(await page.locator('button').count()).toBeGreaterThan(0);

		// Nothing pretends to be a button: clickable controls are real <button> elements
		expect(await page.locator('[role="button"]:not(button)').count()).toBe(0);
	});
});
