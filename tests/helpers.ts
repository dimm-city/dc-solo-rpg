import { expect, type Page } from '@playwright/test';

/** localStorage key the app uses to remember "Skip Always" (see src/lib/utils/instructionsStorage.js) */
export const INSTRUCTIONS_SEEN_KEY = 'dc-solo-rpg:instructions-seen';

/**
 * Land on the home page with the splash and the "How To Play" choice screen skipped.
 */
export async function openHomePage(page: Page) {
	await page.goto('/');
	await page.evaluate((key) => {
		sessionStorage.setItem('splashShown', 'true');
		localStorage.setItem(key, 'true');
	}, INSTRUCTIONS_SEEN_KEY);
	await page.goto('/');
	await expect(page.getByTestId('home-page')).toBeVisible();
}

/**
 * Open the header menu. Every header action (Settings, Help, About, ...) lives in this
 * menu at every viewport size; the inline icon row is permanently hidden.
 */
export async function openHeaderMenu(page: Page) {
	const toggle = page.getByRole('button', { name: 'Toggle menu' });
	if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
		await toggle.click();
	}
	await expect(page.locator('.mobile-menu')).toBeVisible();
}

/** Open the header menu and click one of its items, e.g. "About" or "Settings". */
export async function clickMenuItem(page: Page, name: string) {
	await openHeaderMenu(page);
	await page.locator('.mobile-menu').getByRole('button', { name }).click();
}

/**
 * Open a ContentModal (About, Settings, Help) from the header menu and return its dialog.
 */
export async function openContentModal(page: Page, menuItem: string) {
	await clickMenuItem(page, menuItem);
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	return dialog;
}

/**
 * From the intro screen of a freshly opened game, click through the intro and the opening
 * instability roll until round 1 is ready to begin. The game autosaves on the way, so this
 * leaves an in-progress save behind.
 */
export async function playToFirstRound(page: Page) {
	await page.getByTestId('story-continue-button').click();

	const initial = page.getByTestId('initial-damage-button');
	await expect(initial).toHaveText('Roll for instability');
	await initial.click();
	await expect(initial).toHaveText('Continue');
	await initial.click();

	await expect(page.getByTestId('start-round-button')).toHaveText('Begin Round 1');
}
