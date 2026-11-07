import { test, expect } from '@playwright/test';
import { clickMenuItem, openHeaderMenu } from './helpers';

/**
 * Smoke Test for DC Solo RPG Application
 *
 * Purpose: Identify any broken functionality or errors in the game
 * - Tests initial page load and splash screen
 * - Tests instructions choice flow
 * - Tests game selection screen
 * - Tests header menu, About, Help and the Story Library
 * - Tests navigation to a game
 * - Captures console errors
 * - Takes screenshots at each step (written to the git-ignored tests/screenshots/)
 */

/** Choose Play on the first-time panel and wait for the game selection screen */
async function skipToGameSelection(page) {
	await page.goto('/');
	await page.getByRole('button', { name: /^Play/ }).click();
	await expect(page.getByTestId('game-selector')).toBeVisible();
}

test.describe('DC Solo RPG - Smoke Test', () => {
	let consoleErrors = [];
	let consoleWarnings = [];

	test.beforeEach(async ({ page }) => {
		// Capture console errors and warnings
		consoleErrors = [];
		consoleWarnings = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				// Include where it came from, so a failure names the resource
				consoleErrors.push(`${msg.text()} (${msg.location().url})`);
			} else if (msg.type() === 'warning') {
				consoleWarnings.push(msg.text());
			}
		});

		// Capture page errors
		page.on('pageerror', (error) => {
			consoleErrors.push(`Page Error: ${error.message}`);
		});
	});

	test('should load home page and capture initial state', async ({ page }) => {
		await page.goto('/', { waitUntil: 'domcontentloaded' });

		// A first visit starts on the splash screen
		await expect(page).toHaveTitle('Dream Console');
		await expect(page.locator('.splash-overlay')).toBeVisible();

		await page.screenshot({
			path: 'tests/screenshots/01-initial-load.png',
			fullPage: true
		});
	});

	test('should handle splash screen and instructions choice', async ({ page }) => {
		await page.goto('/');

		// Splash plays, then the instructions choice appears
		await expect(page.locator('.instructions-choice-container')).toBeVisible();
		await page.screenshot({
			path: 'tests/screenshots/03-instructions-choice.png',
			fullPage: true
		});

		// All three choices are offered
		await expect(page.getByRole('button', { name: /^Play/ })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Read the rules first' })).toBeVisible();
		await expect(
			page.getByRole('button', { name: "I know how to play: don't show tips." })
		).toBeVisible();

		// "Play" proceeds to game selection
		await page.getByRole('button', { name: /^Play/ }).click();
		await expect(page.getByTestId('game-selector')).toBeVisible();
	});

	test('should display game selection screen with all interactive elements', async ({ page }) => {
		await skipToGameSelection(page);

		await page.screenshot({
			path: 'tests/screenshots/04-game-selection.png',
			fullPage: true
		});

		// Header: logo, title and every action (inline or in the menu)
		await expect(page.locator('.logo-dice')).toBeVisible();
		await expect(page.locator('.version-text')).toHaveText('Dream Console');
		await openHeaderMenu(page);
		for (const name of ['Upload Game', 'Dice Theme', 'About']) {
			await expect(page.locator('.mobile-menu').getByRole('button', { name })).toBeVisible();
		}
		for (const name of [/^(Stories|Story Library)$/, /^Settings$/, /^Help$/]) {
			await expect(page.locator('.page-header').getByRole('button', { name })).toBeVisible();
		}

		// Every game card has a title, a subtitle and a Play button
		const gameCards = page.locator('.game-card');
		const count = await gameCards.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			const card = gameCards.nth(i);
			await expect(card.locator('.game-card-title')).not.toBeEmpty();
			await expect(card.locator('.game-subtitle')).not.toBeEmpty();
			await expect(card.locator('.start-btn')).toBeVisible();
			// A fresh browser has no saves and no custom games
			await expect(card.locator('.resume-btn')).toHaveCount(0);
			await expect(card.locator('.delete-btn')).toHaveCount(0);
			await expect(card.locator('.custom-badge')).toHaveCount(0);
		}
	});

	test('should test About modal', async ({ page }) => {
		await skipToGameSelection(page);

		await clickMenuItem(page, 'About');
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveAccessibleName('About');
		await expect(dialog.locator('.about-lead')).not.toBeEmpty();

		await page.screenshot({
			path: 'tests/screenshots/05-about-modal.png',
			fullPage: true
		});

		// Close modal
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should test Help modal', async ({ page }) => {
		await skipToGameSelection(page);

		await clickMenuItem(page, 'Help');
		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveAccessibleName('Game Guide');
		await expect(dialog.getByRole('heading', { level: 3, name: 'The goal' })).toBeVisible();

		await page.screenshot({
			path: 'tests/screenshots/06-help-modal.png',
			fullPage: true
		});

		// Close by pressing Escape
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should navigate to a game and test game flow', async ({ page }) => {
		await skipToGameSelection(page);

		// Start the first game
		const gameCard = page.locator('.game-card').first();
		const gameTitle = (await gameCard.locator('.game-card-title').textContent()).trim();
		await gameCard.locator('.start-btn').click();

		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);

		// The intro shows the game's title and its button (tap-to-advance is gone)
		const intro = page.getByTestId('screen-showIntro');
		await expect(intro).toBeVisible();
		await expect(intro.locator('h1')).toHaveText(gameTitle);
		const begin = page.getByTestId('story-continue-button');
		await expect(begin).toHaveText('Begin Your Journey');

		await page.screenshot({
			path: 'tests/screenshots/07-game-loaded.png',
			fullPage: true
		});

		// Beginning moves to the opening instability roll, which has its own button
		await begin.click();
		await expect(page.getByTestId('screen-initialDamageRoll')).toBeVisible();
		await expect(page.getByTestId('initial-damage-button')).toHaveText('Roll for instability');
		await expect(page.getByTestId('status-display')).toBeVisible();
	});

	test('should test Browse Story Library', async ({ page }) => {
		await skipToGameSelection(page);

		await clickMenuItem(page, 'Story Library');

		// The library replaces the game selection screen
		await expect(page.getByRole('heading', { level: 1, name: 'Story Library' })).toBeVisible();
		await expect(page.getByTestId('home-page')).toHaveCount(0);
		// A fresh browser has no completed games yet
		await expect(page.getByRole('heading', { name: 'No Completed Games' })).toBeVisible();

		await page.screenshot({
			path: 'tests/screenshots/08-story-library.png',
			fullPage: true
		});

		// Back returns to the game selection screen
		await page.getByRole('button', { name: 'Back to menu' }).click();
		await expect(page.getByTestId('home-page')).toBeVisible();
	});

	test('should report all console errors and warnings', async ({ page }) => {
		// Run through the main flow
		await skipToGameSelection(page);
		await page.locator('.start-btn').first().click();
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();

		// Report findings
		console.log(`Console errors: ${consoleErrors.length}`);
		consoleErrors.forEach((error, index) => console.log(`  ${index + 1}. ${error}`));
		console.log(`Console warnings: ${consoleWarnings.length}`);
		consoleWarnings.forEach((warning, index) => console.log(`  ${index + 1}. ${warning}`));

		await page.screenshot({
			path: 'tests/screenshots/09-final-state.png',
			fullPage: true
		});

		// Fail the test if there are errors, except ERR_TUNNEL_CONNECTION_FAILED: that is the
		// Google Fonts stylesheet on networks that block it, not the app
		const appErrors = consoleErrors.filter(
			(error) => !error.includes('net::ERR_TUNNEL_CONNECTION_FAILED')
		);
		expect(appErrors).toEqual([]);
	});
});
