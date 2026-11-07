// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY, RULE_TIPS_KEY, SPLASH_SEEN_KEY, openContentModal } from './helpers';

test.describe('Splash and first-time choice', () => {
	test.beforeEach(async ({ page, context }) => {
		// Start every test as a brand-new install
		await context.clearCookies();
		await page.goto('/');
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
		});
	});

	test('shows a short splash once per install', async ({ page }) => {
		await page.goto('/');

		const splash = page.locator('.splash-overlay');
		await expect(splash).toBeVisible();
		await expect(splash.getByRole('heading', { name: 'Dream Console' })).toBeVisible();
		await expect(splash).toContainText('Dimm City');

		// 1.2s in all, then it is gone and remembered
		const shownAt = Date.now();
		await expect(splash).toHaveCount(0, { timeout: 3000 });
		expect(Date.now() - shownAt).toBeLessThan(2500);
		expect(await page.evaluate((key) => localStorage.getItem(key), SPLASH_SEEN_KEY)).toBe('true');

		// A new session on the same install skips it
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
		await expect(page.locator('.instructions-choice-container')).toBeVisible();
		await expect(splash).toHaveCount(0);
	});

	test('a key press skips the splash', async ({ page }) => {
		await page.goto('/');
		const splash = page.locator('.splash-overlay');
		await expect(splash).toBeVisible();

		await page.keyboard.press('Space');
		await expect(splash).toHaveCount(0, { timeout: 800 });
		await expect(page.locator('.instructions-choice-container')).toBeVisible();
	});

	test('never shows the splash and the next screen at once', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.splash-overlay')).toBeVisible();

		// Poll every animation frame until the panel appears: the splash must already be gone
		const overlap = await page.evaluate(
			() =>
				new Promise((resolve) => {
					const check = () => {
						const panel = document.querySelector('.instructions-choice-container');
						if (panel) return resolve(!!document.querySelector('.splash-overlay'));
						requestAnimationFrame(check);
					};
					check();
				})
		);
		expect(overlap).toBe(false);
	});

	test('offers one compact panel with all three choices in view', async ({ page }) => {
		await page.goto('/');

		const panel = page.locator('.instructions-choice-container');
		await expect(panel).toBeVisible();
		const choices = [
			panel.getByRole('button', { name: /^Play/ }),
			panel.getByRole('button', { name: 'Read the rules first' }),
			panel.getByRole('button', { name: "I know how to play: don't show tips." })
		];
		const viewport = page.viewportSize()!;
		for (const choice of choices) {
			await expect(choice).toBeVisible();
			const box = await choice.boundingBox();
			expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
		}
		await expect(panel.getByRole('button', { name: /^Play/ })).toContainText(
			'The game teaches you as you go.'
		);
	});

	test('Play goes to the games with rule tips on, and is remembered', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /^Play/ }).click();

		await expect(page.getByTestId('home-page')).toBeVisible();
		await expect(page.getByTestId('game-selector')).toBeVisible();
		const stored = await page.evaluate(
			([seen, tips]) => [localStorage.getItem(seen), localStorage.getItem(tips)],
			[INSTRUCTIONS_SEEN_KEY, RULE_TIPS_KEY]
		);
		expect(stored).toEqual(['true', 'true']);

		// Next visit goes straight to the games
		await page.reload();
		await expect(page.getByTestId('home-page')).toBeVisible();
		await expect(page.locator('.instructions-choice-container')).toHaveCount(0);
	});

	test('Read the rules first opens the Game Guide, then goes on to the games', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Read the rules first' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toHaveAccessibleName('Game Guide');
		await expect(dialog.getByRole('heading', { name: 'Lucid and Surreal' })).toBeAttached();

		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByTestId('home-page')).toBeVisible();
		expect(await page.evaluate((key) => localStorage.getItem(key), RULE_TIPS_KEY)).toBe('true');
	});

	test('"don\'t show tips" turns rule tips off, and Settings can turn them back on', async ({
		page
	}) => {
		await page.goto('/');
		await page.getByRole('button', { name: "I know how to play: don't show tips." }).click();
		await expect(page.getByTestId('home-page')).toBeVisible();
		expect(await page.evaluate((key) => localStorage.getItem(key), RULE_TIPS_KEY)).toBe('false');

		const dialog = await openContentModal(page, 'Settings');
		const tips = dialog.getByRole('switch', { name: 'Rule tips' });
		await expect(tips).not.toBeChecked();
		await tips.check();
		expect(await page.evaluate((key) => localStorage.getItem(key), RULE_TIPS_KEY)).toBe('true');
	});

	test('the panel is gone for good once a choice is made', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /^Play/ }).click();
		await expect(page.getByTestId('home-page')).toBeVisible();

		// A new session on the same install: no splash, no panel
		await page.evaluate(() => sessionStorage.clear());
		await page.goto('/');
		await expect(page.getByTestId('home-page')).toBeVisible();
		await expect(page.locator('.splash-overlay')).toHaveCount(0);
		await expect(page.locator('.instructions-choice-container')).toHaveCount(0);
	});
});
