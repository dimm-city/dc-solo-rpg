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
 * Press the round's step button. The button ignores presses for 400ms after it changes
 * meaning (it is highlighted meanwhile, with the class `changed`), so wait for that first.
 */
export async function pressStep(page: Page, testid: string) {
	const button = page.getByTestId(testid);
	await expect(button).toBeEnabled();
	await expect(page.locator('#step-action')).not.toHaveClass(/changed/);
	await button.click();
}

/**
 * From the intro screen of a freshly opened game, click through the intro and the opening
 * instability roll until round 1 is ready to roll. The game autosaves on the way, so this
 * leaves an in-progress save behind.
 */
export async function playToFirstRound(page: Page) {
	await page.getByTestId('story-continue-button').click();

	// Accessible names: the visible label crossfades, so old and new text overlap briefly
	const initial = page.getByTestId('initial-damage-button');
	await expect(initial).toHaveAccessibleName('Roll for instability');
	await pressStep(page, 'initial-damage-button');
	await expect(initial).toHaveAccessibleName('Continue', { timeout: 30000 });
	await pressStep(page, 'initial-damage-button');

	// There is no Begin Round step: round 1 opens on Roll for Tasks, titled "Round 1".
	// A natural 20 or 1 on the opening roll puts its modifier on this roll button.
	await expect(page.getByTestId('roll-tasks-button')).toHaveAccessibleName(
		/^Roll for tasks( · (Lucid: 2 dice, keep high|Surreal: 2 dice, keep low))?$/
	);
	await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
}
