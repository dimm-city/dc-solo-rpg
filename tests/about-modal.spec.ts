// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage, openContentModal, openHeaderMenu } from './helpers';

test.describe('About Modal', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should open About modal from the header menu', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		await expect(dialog).toHaveAccessibleName('About');
		await expect(dialog.getByRole('heading', { level: 2, name: 'About' })).toBeVisible();
	});

	test('should display About modal content', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		// Lead paragraph names the app; Dimm City is the maker
		await expect(dialog.locator('.about-lead')).toContainText('Dream Console');
		await expect(dialog).toContainText('Dream Console is made by Dimm City.');
		await expect(dialog).not.toContainText('Dimm City Solo RPG');

		// Both sections are present
		await expect(dialog.getByRole('heading', { level: 3, name: 'How it plays' })).toBeVisible();
		await expect(dialog.getByRole('heading', { level: 3, name: 'Credits' })).toBeVisible();

		// Attribution to the source game is required by the licence
		const attribution = dialog.locator('.about-credit');
		await expect(attribution).toBeVisible();
		await expect(attribution).toContainText('The Wretched');
		await expect(attribution).toContainText('Chris Bissette');
		await expect(attribution.getByRole('link', { name: 'The Wretched' })).toHaveAttribute(
			'href',
			'https://loottheroom.itch.io/wretched'
		);

		await expect(dialog.locator('.version-info')).toContainText('Version');
	});

	test('should close About modal when clicking the Done button', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		await dialog.getByRole('button', { name: 'Done' }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should close About modal when clicking the X button', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		await dialog.getByRole('button', { name: 'Close About' }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should close About modal with Escape and by clicking the scrim', async ({ page }) => {
		await openContentModal(page, 'About');
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);

		// Clicking the scrim only dismisses where there is a scrim around the panel,
		// which is the case everywhere except the full-screen phone sheet.
		const viewport = page.viewportSize()!;
		if (viewport.width > 640) {
			await openContentModal(page, 'About');
			await page.locator('.content-modal-backdrop').click({ position: { x: 5, y: 5 } });
			await expect(page.getByRole('dialog')).toHaveCount(0);
		}
	});

	test('should stack above the page header', async ({ page }) => {
		await openContentModal(page, 'About');

		const backdrop = page.locator('.content-modal-backdrop');
		const zIndex = await backdrop.evaluate((el) => window.getComputedStyle(el).zIndex);
		const headerZ = await page
			.locator('.page-header')
			.evaluate((el) => window.getComputedStyle(el).zIndex);
		expect(parseInt(zIndex)).toBeGreaterThan(parseInt(headerZ));

		// The scrim, not the sticky header, receives clicks at the top-left corner
		const topLeftIsScrim = await page.evaluate(() => {
			const el = document.elementFromPoint(2, 2);
			return !!el?.closest('.content-modal-backdrop');
		});
		expect(topLeftIsScrim).toBe(true);
	});

	test('should dim the whole viewport behind the modal', async ({ page }) => {
		await openContentModal(page, 'About');

		const backdrop = page.locator('.content-modal-backdrop');
		const box = await backdrop.boundingBox();
		const viewport = page.viewportSize()!;
		expect(box!.width).toBeCloseTo(viewport.width, 0);
		expect(box!.height).toBeCloseTo(viewport.height, 0);

		// The scrim is a near-opaque dark layer (rgba(3, 7, 14, 0.88)); the blur was dropped
		// when the modals moved to ContentModal.
		const alpha = await backdrop.evaluate((el) => {
			const match = window
				.getComputedStyle(el)
				.backgroundColor.match(/rgba?\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+(?:,\s*([\d.]+))?\)/);
			return match?.[1] === undefined ? 1 : parseFloat(match[1]);
		});
		expect(alpha).toBeGreaterThanOrEqual(0.8);
	});

	test('should have a scrollable body between a fixed header and footer', async ({ page }) => {
		const dialog = await openContentModal(page, 'About');

		const overflowY = await dialog
			.locator('.content-body-wrapper')
			.evaluate((el) => window.getComputedStyle(el).overflowY);
		expect(overflowY).toBe('auto');

		await expect(dialog.locator('.content-header')).toBeVisible();
		await expect(dialog.locator('.content-footer')).toBeVisible();
	});

	test('should fit the viewport', async ({ page }) => {
		await openContentModal(page, 'About');

		const viewport = page.viewportSize()!;
		const wrapper = await page.locator('.content-modal-wrapper').boundingBox();

		if (viewport.width <= 640) {
			// Phones get a full-screen sheet
			expect(wrapper!.width).toBeCloseTo(viewport.width, 0);
			expect(wrapper!.height).toBeCloseTo(viewport.height, 0);
		} else {
			// Larger screens get a centred panel: min(720px, 92vw) wide, at most 88dvh tall
			expect(wrapper!.width).toBeLessThanOrEqual(Math.min(720, viewport.width * 0.92) + 1);
			expect(wrapper!.height).toBeLessThanOrEqual(viewport.height * 0.88 + 1);
		}
	});

	test('should have augmented-ui corner clips', async ({ page }) => {
		await openContentModal(page, 'About');

		const augmentedAttr = await page
			.locator('.content-modal-wrapper')
			.getAttribute('data-augmented-ui');

		expect(augmentedAttr).toContain('tl-clip');
		expect(augmentedAttr).toContain('tr-clip');
		expect(augmentedAttr).toContain('br-clip');
		expect(augmentedAttr).toContain('bl-clip');
	});

	test('should be keyboard accessible', async ({ page }) => {
		// Open with the keyboard from the header menu (More on desktop, the menu button on phones)
		const header = page.locator('.page-header');
		const toggle = header.getByRole('button', { name: 'Menu', exact: true });
		const menuButton = (await toggle.isVisible())
			? toggle
			: header.getByRole('button', { name: 'More', exact: true });
		await menuButton.focus();
		await page.keyboard.press('Enter');
		await expect(page.locator('.mobile-menu')).toBeVisible();
		await page.locator('.mobile-menu').getByRole('button', { name: 'About' }).focus();
		await page.keyboard.press('Enter');

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();

		// Focus moves into the dialog on open
		await expect(dialog).toBeFocused();

		// Tab reaches the close controls and the focus trap keeps focus inside the dialog
		const reached = new Set<string>();
		for (let i = 0; i < 6; i++) {
			await page.keyboard.press('Tab');
			const inside = await page.evaluate(() => {
				const active = document.activeElement;
				return {
					inside: !!active?.closest('[role="dialog"]'),
					label: active?.getAttribute('aria-label') || active?.textContent?.trim() || ''
				};
			});
			expect(inside.inside).toBe(true);
			reached.add(inside.label);
		}
		expect(reached).toContain('Close About');
		expect(reached).toContain('Done');

		// Escape closes it
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should close the header menu when About opens', async ({ page }) => {
		await openHeaderMenu(page);
		await page.locator('.mobile-menu').getByRole('button', { name: 'About' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.locator('.mobile-menu')).toHaveCount(0);
	});
});

test.describe('About page', () => {
	test('should render the About modal content under one name, in a 720px column', async ({
		page
	}) => {
		await page.goto('/about');

		await expect(page).toHaveTitle('About · Dream Console');
		await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
		await expect(page.locator('.about-lead')).toContainText('Dream Console');
		await expect(page.getByRole('heading', { level: 2, name: 'How it plays' })).toBeVisible();
		await expect(page.getByRole('heading', { level: 2, name: 'Credits' })).toBeVisible();
		await expect(page.locator('.about-credit')).toContainText('Chris Bissette');
		await expect(page.locator('body')).not.toContainText('Dimm City Solo RPG');

		const column = await page.locator('.static-column').boundingBox();
		expect(column!.width).toBeLessThanOrEqual(720);
	});

	test('should link back to the console', async ({ page }) => {
		await page.goto('/about');
		await page.getByRole('link', { name: 'Back to the console' }).click();
		await expect(page).toHaveURL(/\/$/);
	});
});
