// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage, openContentModal, openHeaderMenu } from './helpers';

const columnCount = async (page) =>
	(
		await page
			.locator('.game-cards-grid')
			.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns)
	).split(' ').length;

test.describe('Responsive Design', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should display 2 columns on desktop (1280px)', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });

		await expect.poll(() => columnCount(page)).toBe(2);
	});

	test('should display 2 columns on tablet (768px)', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });

		await expect.poll(() => columnCount(page)).toBe(2);
	});

	test('should display 1 column on mobile (375px)', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });

		await expect.poll(() => columnCount(page)).toBe(1);
	});

	test('should adjust header on mobile', async ({ page }) => {
		// Resize to mobile
		await page.setViewportSize({ width: 375, height: 667 });

		const header = page.locator('.page-header');

		// Header should still be visible, fit the screen, and not cause sideways scrolling
		await expect(header).toBeVisible();
		const headerBox = await header.boundingBox();
		expect(headerBox!.width).toBeLessThanOrEqual(375);
		const overflowsHorizontally = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(overflowsHorizontally).toBe(false);

		// The visible header icon (the menu button) should be 28px or smaller
		const svg = header.locator('svg:visible').first();
		const width = await svg.evaluate((el) => el.getBoundingClientRect().width);
		expect(width).toBeGreaterThan(0);
		expect(width).toBeLessThan(30);
	});

	test('should maintain game card functionality on mobile', async ({ page }) => {
		// Resize to mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Starting a game works from the card's Play button
		const firstCard = page.locator('.game-card').first();
		await firstCard.getByRole('button', { name: 'Play' }).click();

		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
	});

	test('should maintain modal functionality on mobile', async ({ page }) => {
		// Resize to mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Open About modal
		const dialog = await openContentModal(page, 'About');

		// It is a full-screen sheet with a readable title, body and a Done button
		const wrapper = await page.locator('.content-modal-wrapper').boundingBox();
		expect(wrapper!.width).toBeCloseTo(375, 0);
		expect(wrapper!.height).toBeCloseTo(667, 0);
		await expect(dialog.getByRole('heading', { level: 2, name: 'About' })).toBeVisible();
		await expect(dialog.locator('.about-lead')).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();

		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should have appropriate touch targets on mobile', async ({ page }) => {
		// Resize to mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Check game card size
		const firstCard = page.locator('.game-card').first();
		const height = await firstCard.evaluate((el) => el.getBoundingClientRect().height);

		// Should be at least 44px (accessibility guideline for touch targets)
		expect(height).toBeGreaterThan(44);

		// The controls themselves must also be at least 44x44
		const controls = [
			page.getByRole('button', { name: 'Toggle menu' }),
			firstCard.getByRole('button', { name: 'Play' })
		];
		for (const control of controls) {
			const box = await control.boundingBox();
			expect(box!.width).toBeGreaterThanOrEqual(44);
			expect(box!.height).toBeGreaterThanOrEqual(44);
		}

		await openHeaderMenu(page);
		const items = page.locator('.mobile-menu button');
		for (let i = 0; i < (await items.count()); i++) {
			const box = await items.nth(i).boundingBox();
			expect(box!.height).toBeGreaterThanOrEqual(44);
		}
	});

	test('should maintain layout integrity on small tablet (700px)', async ({ page }) => {
		// Resize to small tablet
		await page.setViewportSize({ width: 700, height: 1000 });

		// Game grid should still be visible
		await expect(page.locator('.game-cards-grid')).toBeVisible();
		await expect.poll(() => columnCount(page)).toBe(2);

		// Cards should be visible and inside the viewport
		const cards = page.locator('.game-card');
		expect(await cards.count()).toBeGreaterThan(0);
		for (let i = 0; i < (await cards.count()); i++) {
			const box = await cards.nth(i).boundingBox();
			expect(box!.x).toBeGreaterThanOrEqual(0);
			expect(box!.x + box!.width).toBeLessThanOrEqual(700);
		}
	});

	test('should fit the first-time panel on mobile', async ({ page, context }) => {
		// Clear storage and resize
		await context.clearCookies();
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
		});

		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// The panel appears after the splash; its two buttons span the panel and fit the screen
		const panel = page.locator('.instructions-choice-container');
		await expect(panel).toBeVisible();
		for (const name of [/^Play/, 'Read the rules first']) {
			const box = await panel.getByRole('button', { name }).boundingBox();
			expect(box!.width).toBeGreaterThan(260);
			expect(box!.x + box!.width).toBeLessThanOrEqual(375);
			expect(box!.height).toBeGreaterThanOrEqual(44);
		}
		const overflowsHorizontally = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth
		);
		expect(overflowsHorizontally).toBe(false);
	});
});
