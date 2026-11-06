// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { openHomePage } from './helpers';

const SLUG = 'future-lost';
const GAME_TITLE = 'Future Lost';

/**
 * Leave Future Lost in progress and return to the home page, where its card now offers
 * Resume and Delete instead of Start.
 *
 * A real save only happens after a full round of cards, so the save is written through the
 * app's own storage module (the same code path and record format) rather than by playing
 * a round.
 */
async function leaveGameInProgress(page: Page) {
	await openHomePage(page);
	await page.evaluate(
		async ({ slug, title }) => {
			const storageModule = '/src/lib/stores/indexedDBStorage.js';
			const { saveGame } = await import(/* @vite-ignore */ storageModule);
			await saveGame({
				state: 'rollForTasks',
				config: { slug, title },
				journalEntries: [],
				round: 1,
				tower: 20,
				tokens: 10,
				playerName: 'Test Player',
				deck: [],
				discard: []
			});
		},
		{ slug: SLUG, title: GAME_TITLE }
	);

	await page.goto('/');
	await expect(page.getByTestId('home-page')).toBeVisible();
}

/** Open the "Delete Saved Game" confirmation for the in-progress game */
async function openDeleteConfirmation(page: Page) {
	await leaveGameInProgress(page);
	await page
		.getByTestId(`game-card-${SLUG}`)
		.getByRole('button', { name: 'Delete saved game' })
		.click();
	const modal = page.locator('.modal-backdrop');
	await expect(modal).toBeVisible();
	return modal;
}

test.describe('Game start and confirmation modal', () => {
	test('should start a game straight from the Start button, with no confirmation', async ({
		page
	}) => {
		await openHomePage(page);

		await page
			.getByTestId(`game-card-${SLUG}`)
			.getByRole('button', { name: 'Start new game' })
			.click();

		// Goes directly to the game; the old "Load Game / START GAME / CANCEL" step is gone
		await expect(page).toHaveURL(`/game/${SLUG}`);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'START GAME' })).toHaveCount(0);
	});

	test('should offer Resume and Delete instead of Start once a game is in progress', async ({
		page
	}) => {
		await leaveGameInProgress(page);

		const card = page.getByTestId(`game-card-${SLUG}`);
		await expect(card.getByRole('button', { name: 'Resume saved game' })).toBeVisible();
		await expect(card.getByRole('button', { name: 'Delete saved game' })).toBeVisible();
		await expect(card.getByRole('button', { name: 'Start new game' })).toHaveCount(0);
	});

	test('should open a delete confirmation naming the game', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		// Proper dialog semantics
		await expect(modal).toHaveAttribute('role', 'dialog');
		await expect(modal).toHaveAttribute('aria-modal', 'true');
		await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

		await expect(page.locator('#modal-title')).toHaveText('Delete Saved Game');
		const body = modal.locator('.modal-body p');
		await expect(body).toContainText(GAME_TITLE);
		await expect(body).toContainText('cannot be undone');
	});

	test('should have DELETE and CANCEL buttons', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await expect(modal.getByRole('button', { name: 'DELETE' })).toBeVisible();
		await expect(modal.getByRole('button', { name: 'CANCEL' })).toBeVisible();
	});

	test('should keep the save when clicking CANCEL', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'CANCEL' }).click();

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(
			page.getByTestId(`game-card-${SLUG}`).getByRole('button', { name: 'Resume saved game' })
		).toBeVisible();
	});

	test('should close modal when clicking backdrop', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		// Click backdrop (not the modal content)
		await modal.click({ position: { x: 5, y: 5 } });

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(
			page.getByTestId(`game-card-${SLUG}`).getByRole('button', { name: 'Resume saved game' })
		).toBeVisible();
	});

	test('should close modal when pressing Escape key', async ({ page }) => {
		await openDeleteConfirmation(page);

		await page.keyboard.press('Escape');

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(
			page.getByTestId(`game-card-${SLUG}`).getByRole('button', { name: 'Resume saved game' })
		).toBeVisible();
	});

	test('should have highest z-index', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		const zIndex = await modal.evaluate((el) => window.getComputedStyle(el).zIndex);

		expect(parseInt(zIndex)).toBeGreaterThan(100000);
	});

	test('should have backdrop blur effect', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		const backdropFilter = await modal.evaluate(
			(el) =>
				window.getComputedStyle(el).backdropFilter ||
				window.getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter')
		);

		expect(backdropFilter).toContain('blur');
	});

	test('should delete the save and offer Start again when confirming', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'DELETE' }).click();

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(page.locator('.upload-status')).toHaveText('Saved game deleted');
		const card = page.getByTestId(`game-card-${SLUG}`);
		await expect(card.getByRole('button', { name: 'Start new game' })).toBeVisible();
		await expect(card.getByRole('button', { name: 'Resume saved game' })).toHaveCount(0);
	});
});
