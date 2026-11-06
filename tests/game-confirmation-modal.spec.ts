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
	const modal = page.getByRole('dialog', { name: 'Delete Saved Game' });
	await expect(modal).toBeVisible();
	return modal;
}

/** The confirmation is built on the shared dialog: its scrim is the content-modal backdrop */
const scrim = (page: Page) => page.locator('.content-modal-backdrop');

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
		await expect(page.getByRole('dialog')).toHaveCount(0);
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

		// Proper dialog semantics: a modal dialog named by its title, holding focus
		await expect(modal).toHaveAttribute('aria-modal', 'true');
		await expect(modal.getByRole('heading', { name: 'Delete Saved Game' })).toBeVisible();
		await expect(modal).toBeFocused();

		const body = modal.getByTestId('confirm-message');
		await expect(body).toContainText(GAME_TITLE);
		await expect(body).toContainText('cannot be undone');
	});

	test('should have DELETE and CANCEL buttons, and a 44px close target', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await expect(modal.getByRole('button', { name: 'DELETE', exact: true })).toBeVisible();
		await expect(modal.getByRole('button', { name: 'CANCEL' })).toBeVisible();
		const close = await modal.getByRole('button', { name: /^Close/ }).boundingBox();
		expect(close?.width).toBeGreaterThanOrEqual(44);
		expect(close?.height).toBeGreaterThanOrEqual(44);
	});

	test('should style DELETE as an outlined destructive action, not a filled CTA', async ({
		page
	}) => {
		const modal = await openDeleteConfirmation(page);

		const style = await modal
			.getByRole('button', { name: 'DELETE', exact: true })
			.evaluate((el) => {
				const cs = window.getComputedStyle(el);
				return { bg: cs.backgroundImage + cs.backgroundColor, border: cs.borderTopColor };
			});
		// Transparent fill with a red border
		expect(style.bg).toContain('rgba(0, 0, 0, 0)');
		expect(style.bg).not.toContain('gradient');
		expect(style.border).toBe('rgb(255, 77, 109)');
	});

	test('should keep the save when clicking CANCEL', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'CANCEL' }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(
			page.getByTestId(`game-card-${SLUG}`).getByRole('button', { name: 'Resume saved game' })
		).toBeVisible();
	});

	test('should close modal when clicking backdrop', async ({ page }) => {
		await openDeleteConfirmation(page);

		// Click backdrop (not the modal content)
		await scrim(page).click({ position: { x: 5, y: 5 } });

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(
			page.getByTestId(`game-card-${SLUG}`).getByRole('button', { name: 'Resume saved game' })
		).toBeVisible();
	});

	test('should close modal when pressing Escape key', async ({ page }) => {
		await openDeleteConfirmation(page);

		await page.keyboard.press('Escape');

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(
			page.getByTestId(`game-card-${SLUG}`).getByRole('button', { name: 'Resume saved game' })
		).toBeVisible();
	});

	test('should sit on top of everything', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		// The topmost element at the dialog's centre belongs to the dialog
		const box = await modal.boundingBox();
		const onTop = await page.evaluate(
			({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[role="dialog"]'),
			{ x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }
		);
		expect(onTop).toBe(true);
	});

	test('should cover the page with its scrim', async ({ page }) => {
		await openDeleteConfirmation(page);

		// A corner of the viewport hits the scrim, not the page beneath
		const hit = await page.evaluate(
			() => !!document.elementFromPoint(5, 5)?.closest('.content-modal-backdrop')
		);
		expect(hit).toBe(true);
	});

	test('should delete the save and offer Start again when confirming', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'DELETE', exact: true }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(page.locator('.upload-status')).toHaveText('Saved game deleted');
		const card = page.getByTestId(`game-card-${SLUG}`);
		await expect(card.getByRole('button', { name: 'Start new game' })).toBeVisible();
		await expect(card.getByRole('button', { name: 'Resume saved game' })).toHaveCount(0);
	});
});
