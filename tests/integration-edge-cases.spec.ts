// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY, openHomePage, openContentModal, clickMenuItem } from './helpers';

test.describe('Integration and Edge Cases', () => {
	test('should handle rapid modal opening and closing', async ({ page }) => {
		await openHomePage(page);

		// Rapidly open and close About modal
		for (let i = 0; i < 3; i++) {
			const dialog = await openContentModal(page, 'About');
			await dialog.getByRole('button', { name: 'Done' }).click();
			await expect(page.getByRole('dialog')).toHaveCount(0);
		}

		// Should still be functional
		await openContentModal(page, 'About');
		await expect(page.getByRole('dialog')).toHaveCount(1);
	});

	test('should prevent multiple modals from opening simultaneously', async ({ page }) => {
		await openHomePage(page);

		// Open About modal
		await openContentModal(page, 'About');

		// The modal scrim covers the header, so the menu behind it cannot be reached
		const hamburger = page.locator('.hamburger-button');
		const toggle = (await hamburger.isVisible()) ? hamburger : page.locator('.more-button');
		await expect(toggle).toBeVisible();
		const toggleIsCovered = await toggle.evaluate((el) => {
			const box = el.getBoundingClientRect();
			const top = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
			return top !== el && !el.contains(top);
		});
		expect(toggleIsCovered).toBe(true);

		// Only one modal is open
		await expect(page.getByRole('dialog')).toHaveCount(1);
		await expect(page.getByRole('dialog')).toHaveAccessibleName('About');
	});

	test('should handle starting a game, going back and starting again', async ({ page }) => {
		await openHomePage(page);

		const firstStart = page.locator('.game-card').first().getByRole('button', { name: 'Play' });

		// Start the game and come back via the browser's back button
		await firstStart.click();
		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
		await page.goBack();
		await expect(page.getByTestId('home-page')).toBeVisible();

		// Start it again and it works normally
		await page.locator('.game-card').first().getByRole('button', { name: 'Play' }).click();
		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
	});

	test('should maintain state after browser refresh', async ({ page }) => {
		// Setup: a first visit that plays without tips
		await page.goto('/');
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
		});
		await page.goto('/');

		// Splash, then the first-time panel
		const skipTips = page.getByRole('button', { name: 'I know how to play: skip the tips' });
		await expect(skipTips).toBeVisible();
		await skipTips.click();
		await expect(page.getByTestId('home-page')).toBeVisible();
		expect(await page.evaluate((key) => localStorage.getItem(key), INSTRUCTIONS_SEEN_KEY)).toBe(
			'true'
		);

		// Refresh page
		await page.reload();

		// Should skip instructions
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
		await expect(page.locator('.instructions-choice-container')).toHaveCount(0);
	});

	test('should handle viewport resize while modal is open', async ({ page }) => {
		await openHomePage(page);
		await page.setViewportSize({ width: 1280, height: 720 });

		// Open About modal
		const dialog = await openContentModal(page, 'About');

		// Resize to mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Modal should still be visible and functional, now as a full-screen sheet
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();
		const wrapper = await page.locator('.content-modal-wrapper').boundingBox();
		expect(wrapper!.width).toBeCloseTo(375, 0);
		expect(wrapper!.height).toBeCloseTo(667, 0);

		// Should be able to close
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should handle rapid game card clicking', async ({ page }) => {
		await openHomePage(page);

		const cards = page.locator('.game-card');
		expect(await cards.count()).toBeGreaterThanOrEqual(2);

		// Clicking around the card bodies in quick succession does nothing (no selection,
		// no confirmation); only the Play button acts.
		await cards.nth(0).locator('.game-card-title').click();
		await cards.nth(1).locator('.game-card-title').click();
		await cards.nth(0).locator('.game-card-title').click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByTestId('home-page')).toBeVisible();
	});

	test('should load all game data correctly', async ({ page }) => {
		await openHomePage(page);

		// Verify games are loaded
		const gameCards = page.locator('.game-card');
		await expect(gameCards.first()).toBeVisible();
		const count = await gameCards.count();

		expect(count).toBeGreaterThan(0);

		// Each card should have title and subtitle
		for (let i = 0; i < count; i++) {
			const card = gameCards.nth(i);
			await expect(card.locator('.game-card-title')).toBeVisible();
			await expect(card.locator('.game-subtitle')).toBeVisible();
		}
	});

	test('should handle localStorage unavailable gracefully', async ({ page }) => {
		// Simulate privacy mode where every localStorage access throws
		await page.addInitScript(() => {
			Object.defineProperty(window, 'localStorage', {
				get() {
					throw new DOMException('The operation is insecure.', 'SecurityError');
				}
			});
		});
		await page.goto('/');

		// Nothing can be remembered, so the splash and the first-time panel show; Play still
		// works without storage, so the player can reach the games.
		const play = page.getByRole('button', { name: /^Play/ });
		await expect(play).toBeVisible();
		await play.click();

		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
		await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();
	});

	test('should have no console errors on page load', async ({ page }) => {
		const errors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(`${msg.text()} (${msg.location().url})`);
			}
		});

		page.on('pageerror', (error) => {
			errors.push(error.message);
		});

		await openHomePage(page);
		await expect(page.locator('.game-card').first()).toBeVisible();

		// ERR_TUNNEL_CONNECTION_FAILED is the Google Fonts stylesheet on networks that block it, not the app
		const appErrors = errors.filter((text) => !text.includes('net::ERR_TUNNEL_CONNECTION_FAILED'));
		expect(appErrors).toEqual([]);
	});

	test('should handle Escape key press when no modal is open', async ({ page }) => {
		await openHomePage(page);

		// Press Escape
		await page.keyboard.press('Escape');

		// Page should still be functional
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
		await clickMenuItem(page, 'About');
		await expect(page.getByRole('dialog')).toBeVisible();
	});
});
