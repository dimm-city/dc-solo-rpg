import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'fs';

/** localStorage key set once the first-time choice is made (see src/lib/utils/instructionsStorage.js) */
export const INSTRUCTIONS_SEEN_KEY = 'dc-solo-rpg:instructions-seen';
/** localStorage keys for the splash (once per install) and the rule tips setting */
export const SPLASH_SEEN_KEY = 'dc-solo-rpg:splash-seen';
export const RULE_TIPS_KEY = 'dc-solo-rpg:rule-tips';

/**
 * Land on the home page with the splash and the first-time choice skipped (a returning player).
 */
export async function openHomePage(page: Page) {
	await page.goto('/');
	// Let the app start (and finish loading its data) before navigating again
	await expect(
		page.locator('.splash-overlay, .instructions-choice-container, [data-testid="home-page"]')
	).not.toHaveCount(0);
	// Having made the first-time choice also means the splash has been seen
	await page.evaluate((key) => localStorage.setItem(key, 'true'), INSTRUCTIONS_SEEN_KEY);
	await page.goto('/');
	await expect(page.getByTestId('home-page')).toBeVisible();
	// The game cards appear once each game's save has been read, with Play or Continue already
	// in place
	await expect(page.locator('.game-card').first()).toBeVisible();
}

/**
 * Open the header menu. At 900px and up it is the "More" button next to the inline
 * Story Library, Settings and Guide actions; below 900px it is the "Menu" button and holds
 * every action.
 */
export async function openHeaderMenu(page: Page) {
	const header = page.locator('.page-header');
	const toggle = header.getByRole('button', { name: 'Menu', exact: true });
	const button = (await toggle.isVisible())
		? toggle
		: header.getByRole('button', { name: 'More', exact: true });
	if ((await button.getAttribute('aria-expanded')) !== 'true') {
		await button.click();
	}
	await expect(page.locator('.mobile-menu')).toBeVisible();
}

/** The inline desktop label of a header action, where it differs from its menu label */
const INLINE_LABELS: Record<string, string> = {
	'Story Library': 'Story Library',
	Settings: 'Settings',
	// Shown as "Guide", named "Game Guide"
	'Game Guide': 'Game Guide'
};

/**
 * Run a header action, e.g. "About" or "Settings": the inline button when it is shown (900px
 * and up), otherwise the item in the header menu.
 */
export async function clickMenuItem(page: Page, name: string) {
	const inlineName = INLINE_LABELS[name];
	if (inlineName) {
		const inline = page
			.locator('.header-buttons')
			.getByRole('button', { name: inlineName, exact: true });
		if (await inline.isVisible()) {
			await inline.click();
			return;
		}
	}
	await openHeaderMenu(page);
	await page.locator('.mobile-menu').getByRole('button', { name, exact: true }).click();
}

/**
 * Open a ContentModal (About, Settings, Help) from the header and return its dialog.
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
	// The result holds for a beat, then round 1 opens by itself (no press: a late one would roll)
	await expect(page.getByTestId('roll-tasks-button')).toBeVisible({ timeout: 30000 });

	// There is no Begin Round step: round 1 opens on Roll for Tasks, titled "Round 1".
	// A natural 20 or 1 on the opening roll puts its modifier on the hint line above the button.
	await expect(page.getByTestId('roll-tasks-button')).toHaveAccessibleName('Roll for tasks');
	await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
}

/** The one built-in game's file (Locked in the Tech District) */
export const BUILT_IN_GAME = readFileSync(
	new URL('../static/games/ghost-in-the-machine.game.md', import.meta.url),
	'utf8'
);

/**
 * Give the home screen a second game card: the built-in game uploaded again as "Another Game".
 * One game ships built in; the Dimm City games come from a GitHub source the suite keeps
 * switched off, so tests that compare cards add one this way.
 */
export async function addSecondGameCard(page: Page) {
	await page.locator('input[type="file"]').setInputFiles({
		name: 'another-game.game.md',
		mimeType: 'text/markdown',
		buffer: Buffer.from(
			BUILT_IN_GAME.replace('title: Locked in the Tech District', 'title: Another Game')
		)
	});
	await expect(page.locator('.game-card')).toHaveCount(2);
}
