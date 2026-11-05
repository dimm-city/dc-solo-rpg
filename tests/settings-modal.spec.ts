// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage, openContentModal } from './helpers';

test.describe('Settings Modal', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should open Settings modal from the header menu', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');

		await expect(dialog).toHaveAccessibleName('Game Settings');
		await expect(dialog.getByRole('heading', { level: 2, name: 'Game Settings' })).toBeVisible();
	});

	test('should display Settings modal content', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');

		// The settings now live in the modal itself rather than on a separate settings page
		await expect(dialog.getByRole('heading', { level: 3, name: 'Gameplay' })).toBeVisible();
		await expect(dialog.getByText('Changes apply the next time a game begins.')).toBeVisible();

		const difficulty = dialog.getByLabel('Difficulty');
		await expect(difficulty).toBeVisible();
		await expect(difficulty.locator('option')).toHaveText(['Game default', 'Normal', 'Easy']);

		// Audio and auto-play sections follow the gameplay section
		await expect(dialog.getByRole('heading', { level: 3, name: 'Read aloud' })).toBeAttached();
		await expect(dialog.getByRole('heading', { level: 3, name: 'Auto-play' })).toBeAttached();
		await expect(dialog.getByRole('heading', { level: 3, name: 'Quick presets' })).toBeAttached();

		await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'Close Game Settings' })).toBeVisible();
	});

	test('should stay on the home page and not offer a separate settings page', async ({ page }) => {
		await openContentModal(page, 'Settings');

		await expect(page.getByRole('button', { name: 'Open Settings Page' })).toHaveCount(0);
		await expect(page).toHaveURL(/\/$/);
	});

	test('should close Settings modal when clicking Done', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');

		await dialog.getByRole('button', { name: 'Done' }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should close Settings modal with the X button and with Escape', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');
		await dialog.getByRole('button', { name: 'Close Game Settings' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);

		await openContentModal(page, 'Settings');
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should remember the difficulty choice', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');
		const difficulty = dialog.getByLabel('Difficulty');
		await expect(difficulty).toHaveValue('default');

		await difficulty.selectOption('easy');
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);

		// Persists across a reload
		await page.reload();
		await expect(page.getByTestId('home-page')).toBeVisible();
		const reopened = await openContentModal(page, 'Settings');
		await expect(reopened.getByLabel('Difficulty')).toHaveValue('easy');
	});

	test('should have the same modal styling as the About modal', async ({ page }) => {
		await openContentModal(page, 'Settings');

		// Same shared ContentModal shell: scrim above the header, framed with augmented-ui
		const zIndex = await page
			.locator('.content-modal-backdrop')
			.evaluate((el) => window.getComputedStyle(el).zIndex);
		const headerZ = await page
			.locator('.page-header')
			.evaluate((el) => window.getComputedStyle(el).zIndex);
		expect(parseInt(zIndex)).toBeGreaterThan(parseInt(headerZ));

		const augmentedAttr = await page
			.locator('.content-modal-wrapper')
			.getAttribute('data-augmented-ui');
		expect(augmentedAttr).toContain('border');

		const viewport = page.viewportSize()!;
		const wrapper = await page.locator('.content-modal-wrapper').boundingBox();
		if (viewport.width <= 640) {
			expect(wrapper!.height).toBeCloseTo(viewport.height, 0);
		} else {
			expect(wrapper!.height).toBeLessThanOrEqual(viewport.height * 0.88 + 1);
		}

		// Long content scrolls inside the body, not the page
		const overflowY = await page
			.locator('.content-body-wrapper')
			.evaluate((el) => window.getComputedStyle(el).overflowY);
		expect(overflowY).toBe('auto');
	});
});
