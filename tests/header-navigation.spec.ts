// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage, openHeaderMenu, openContentModal } from './helpers';

test.describe('Header and Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should display header with all elements', async ({ page }) => {
		const header = page.locator('.page-header');

		// Verify header is visible
		await expect(header).toBeVisible();

		// Verify logo is visible
		await expect(header.locator('.logo-dice')).toBeVisible();

		// Verify version text (now shows "Dream Console")
		await expect(header.locator('.version-text')).toContainText('Dream Console');

		// The header actions are collected in one menu button at every viewport size
		await expect(header.getByRole('button', { name: 'Toggle menu' })).toBeVisible();

		// ...and the menu lists every action
		await openHeaderMenu(page);
		const menu = page.locator('.mobile-menu');
		for (const name of [
			'Upload Game',
			'Story Library',
			'Settings',
			'Dice Theme',
			'About',
			'Help'
		]) {
			await expect(menu.getByRole('button', { name })).toBeVisible();
		}
	});

	test('should keep the inline icon row hidden', async ({ page }) => {
		// The inline icon buttons are hidden at every size in favour of the menu
		await expect(page.locator('.header-buttons')).toBeHidden();
		await expect(page.locator('button[aria-label="About"]')).toBeHidden();
	});

	test('should toggle the menu and reflect it in aria-expanded', async ({ page }) => {
		const toggle = page.getByRole('button', { name: 'Toggle menu' });
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('.mobile-menu')).toBeVisible();

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(page.locator('.mobile-menu')).toHaveCount(0);
	});

	test('should have sticky header', async ({ page }) => {
		const header = page.locator('.page-header');

		// Get position
		const position = await header.evaluate((el) => window.getComputedStyle(el).position);

		expect(position).toBe('sticky');
	});

	test('should display logo with correct styling', async ({ page }) => {
		const logo = page.locator('.logo-dice');

		// Verify logo has drop-shadow filter
		const filter = await logo.evaluate((el) => window.getComputedStyle(el).filter);
		expect(filter).toContain('drop-shadow');
	});

	test('should display version text with correct styling', async ({ page }) => {
		const versionText = page.locator('.version-text');

		// Verify version text is uppercase
		const textTransform = await versionText.evaluate(
			(el) => window.getComputedStyle(el).textTransform
		);
		expect(textTransform).toBe('uppercase');
	});

	test('should have hover effect on the menu button', async ({ page }) => {
		const toggle = page.getByRole('button', { name: 'Toggle menu' });

		const before = await toggle.evaluate((el) => window.getComputedStyle(el).transform);
		expect(before).toBe('none');

		// Hover over button
		await toggle.hover();

		// Button scales up on hover (computed transform is a matrix, so read the x scale)
		await expect
			.poll(() =>
				toggle.evaluate((el) => {
					const transform = window.getComputedStyle(el).transform;
					return transform === 'none' ? 1 : new DOMMatrix(transform).a;
				})
			)
			.toBeGreaterThan(1);
	});

	test('should open About modal when choosing About in the menu', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		await expect(dialog).toHaveAccessibleName('About');
	});

	test('should open Help modal when choosing Help in the menu', async ({ page }) => {
		const dialog = await openContentModal(page, 'Help');

		await expect(dialog).toHaveAccessibleName('Game Guide');
	});

	test('should open the Story Library when choosing Story Library in the menu', async ({
		page
	}) => {
		await openHeaderMenu(page);
		await page.locator('.mobile-menu').getByRole('button', { name: 'Story Library' }).click();

		// The library replaces the game selection screen
		await expect(page.getByTestId('home-page')).toHaveCount(0);
	});

	test('should have proper z-index layering', async ({ page }) => {
		const header = page.locator('.page-header');

		// Get z-index
		const zIndex = await header.evaluate((el) => window.getComputedStyle(el).zIndex);

		expect(parseInt(zIndex)).toBeGreaterThan(50);
	});

	test('should have backdrop blur on header', async ({ page }) => {
		const header = page.locator('.page-header');

		// Verify backdrop filter
		const backdropFilter = await header.evaluate(
			(el) =>
				window.getComputedStyle(el).backdropFilter ||
				window.getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter')
		);

		expect(backdropFilter).toContain('blur');
	});
});
