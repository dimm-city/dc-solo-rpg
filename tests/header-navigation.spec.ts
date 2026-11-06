// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { openHomePage, openHeaderMenu, openContentModal, clickMenuItem } from './helpers';

const isDesktop = (page: Page) => page.viewportSize()!.width >= 900;

test.describe('Header and Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should display the brand: one product name and the maker line', async ({ page }) => {
		const header = page.locator('.page-header');
		await expect(header).toBeVisible();
		await expect(header.locator('.logo-dice')).toBeVisible();
		await expect(header.locator('.version-text')).toHaveText('Dream Console');
		await expect(header.locator('.maker')).toHaveText('Dimm City');
	});

	test('should show labelled actions inline at 900px and up, and a menu button below', async ({
		page
	}) => {
		const header = page.locator('.page-header');
		const toggle = header.getByRole('button', { name: 'Toggle menu' });

		if (isDesktop(page)) {
			for (const name of ['Stories', 'Settings', 'Help', 'More']) {
				const button = header.getByRole('button', { name, exact: true });
				await expect(button).toBeVisible();
				await expect(button).toHaveText(name);
			}
			await expect(toggle).toBeHidden();
		} else {
			await expect(toggle).toBeVisible();
			await expect(header.locator('.header-buttons')).toBeHidden();
		}
	});

	test('should list the remaining actions in the menu, each with a label', async ({ page }) => {
		await openHeaderMenu(page);
		const menu = page.locator('.mobile-menu');

		// Desktop shows Stories, Settings and Help inline, so the More menu holds the rest
		const names = isDesktop(page)
			? ['Upload Game', 'Dice Theme', 'About']
			: ['Upload Game', 'Story Library', 'Settings', 'Dice Theme', 'About', 'Help'];
		for (const name of names) {
			await expect(menu.getByRole('button', { name, exact: true })).toBeVisible();
		}
		await expect(menu.getByRole('button')).toHaveCount(names.length);
	});

	test('should toggle the menu and reflect it in aria-expanded', async ({ page }) => {
		const header = page.locator('.page-header');
		const button = isDesktop(page)
			? header.getByRole('button', { name: 'More', exact: true })
			: header.getByRole('button', { name: 'Toggle menu' });
		await expect(button).toHaveAttribute('aria-expanded', 'false');

		await button.click();
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('.mobile-menu')).toBeVisible();

		await button.click();
		await expect(button).toHaveAttribute('aria-expanded', 'false');
		await expect(page.locator('.mobile-menu')).toHaveCount(0);
	});

	test('should close the menu with Escape and return focus to its button', async ({ page }) => {
		await openHeaderMenu(page);
		await page.keyboard.press('Escape');
		await expect(page.locator('.mobile-menu')).toHaveCount(0);
		await expect(page.locator(':focus')).toHaveAttribute('aria-expanded', 'false');
	});

	test('should close the menu when clicking elsewhere', async ({ page }) => {
		await openHeaderMenu(page);
		await page.getByRole('heading', { level: 1 }).click();
		await expect(page.locator('.mobile-menu')).toHaveCount(0);
	});

	test('should have sticky header', async ({ page }) => {
		const position = await page
			.locator('.page-header')
			.evaluate((el) => window.getComputedStyle(el).position);
		expect(position).toBe('sticky');
	});

	test('should display logo with correct styling', async ({ page }) => {
		const filter = await page
			.locator('.logo-dice')
			.evaluate((el) => window.getComputedStyle(el).filter);
		expect(filter).toContain('drop-shadow');
	});

	test('should set header labels in Inter, uppercase (not the display face)', async ({ page }) => {
		const style = await page.locator('.version-text').evaluate((el) => {
			const cs = window.getComputedStyle(el);
			return { transform: cs.textTransform, family: cs.fontFamily };
		});
		expect(style.transform).toBe('uppercase');
		expect(style.family).toContain('Inter');
		expect(style.family).not.toContain('lixdu');
	});

	test('should open About modal from the header', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');
		await expect(dialog).toHaveAccessibleName('About');
	});

	test('should open Help modal from the header', async ({ page }) => {
		const dialog = await openContentModal(page, 'Help');
		await expect(dialog).toHaveAccessibleName('Game Guide');
	});

	test('should open the Story Library from the header', async ({ page }) => {
		await clickMenuItem(page, 'Story Library');

		// The library replaces the game selection screen, and the tab says so
		await expect(page.getByTestId('home-page')).toHaveCount(0);
		await expect(page).toHaveTitle('Story Library · Dream Console');
	});

	test('should have proper z-index layering', async ({ page }) => {
		const zIndex = await page
			.locator('.page-header')
			.evaluate((el) => window.getComputedStyle(el).zIndex);
		expect(parseInt(zIndex)).toBeGreaterThan(50);
	});

	test('should have backdrop blur on header', async ({ page }) => {
		const backdropFilter = await page
			.locator('.page-header')
			.evaluate(
				(el) =>
					window.getComputedStyle(el).backdropFilter ||
					window.getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter')
			);
		expect(backdropFilter).toContain('blur');
	});
});
