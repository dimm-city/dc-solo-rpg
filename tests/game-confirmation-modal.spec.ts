// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { openHomePage } from './helpers';

const SLUG = 'future-lost';
const GAME_TITLE = 'Future Lost';

/**
 * Leave Future Lost in progress (round 3) and return to the home page, where its card now
 * offers Continue, New game and Delete save instead of Play.
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
				state: 'startRound',
				config: { slug, title },
				journalEntries: [],
				round: 3,
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

const card = (page: Page) => page.getByTestId(`game-card-${SLUG}`);

/** Wait for the confirmation's entrance to finish, so a click lands where the button rests */
async function confirmationSettled(page: Page) {
	await expect(page.locator('.modal-backdrop')).toBeVisible();
	await page.waitForFunction(() =>
		document.getAnimations().every((animation) => {
			const target = (animation.effect as KeyframeEffect | null)?.target;
			const endless = animation.effect?.getComputedTiming().endTime === Infinity;
			return (
				!(target instanceof Element && target.closest('.modal-backdrop')) ||
				endless ||
				animation.playState !== 'running'
			);
		})
	);
}

/** Open the "Delete save" confirmation for the in-progress game */
async function openDeleteConfirmation(page: Page) {
	await leaveGameInProgress(page);
	await card(page).getByRole('button', { name: 'Delete save' }).click();
	await confirmationSettled(page);
	return page.locator('.modal-backdrop');
}

test.describe('Game start, saves and confirmations', () => {
	test('should start a game straight from Play, with no confirmation', async ({ page }) => {
		await openHomePage(page);

		await card(page).getByRole('button', { name: 'Play' }).click();

		await expect(page).toHaveURL(`/game/${SLUG}`);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(page).toHaveTitle(`${GAME_TITLE} · Dream Console`);
	});

	test('should offer Continue with the round and time, New game and Delete save', async ({
		page
	}) => {
		await leaveGameInProgress(page);

		const cont = card(page).getByRole('button', { name: /^Continue/ });
		await expect(cont).toBeVisible();
		await expect(cont).toContainText('Continue');
		await expect(cont).toContainText('Round 3');
		await expect(cont).toContainText('just now');
		await expect(card(page).getByRole('button', { name: 'New game' })).toBeVisible();
		await expect(card(page).getByRole('button', { name: 'Delete save' })).toBeVisible();
		await expect(card(page).getByRole('button', { name: 'Play' })).toHaveCount(0);
	});

	test('should continue the saved game', async ({ page }) => {
		await leaveGameInProgress(page);

		await card(page)
			.getByRole('button', { name: /^Continue/ })
			.click();
		await expect(page).toHaveURL(`/game/${SLUG}`);
		await expect(page.getByTestId('game-page')).toBeVisible();
	});

	test('should confirm before New game replaces the save, and keep it on cancel', async ({
		page
	}) => {
		await leaveGameInProgress(page);

		await card(page).getByRole('button', { name: 'New game' }).click();
		await confirmationSettled(page);
		const modal = page.locator('.modal-backdrop');
		await expect(page.locator('#modal-title')).toHaveText('New game');
		await expect(modal.locator('.modal-body p')).toContainText(
			'This replaces your Future Lost save (Round 3)'
		);

		await modal.getByRole('button', { name: 'Keep my save' }).click();
		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
	});

	test('should start fresh once New game is confirmed', async ({ page }) => {
		await leaveGameInProgress(page);

		await card(page).getByRole('button', { name: 'New game' }).click();
		await confirmationSettled(page);
		await page.locator('.modal-backdrop').getByRole('button', { name: 'Start new game' }).click();

		await expect(page).toHaveURL(`/game/${SLUG}`);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();

		// The old save is gone
		const hasSave = await page.evaluate(async (slug) => {
			const storageModule = '/src/lib/stores/indexedDBStorage.js';
			const { getSaveMetadata } = await import(/* @vite-ignore */ storageModule);
			const meta = await getSaveMetadata(slug);
			return meta?.round === 3;
		}, SLUG);
		expect(hasSave).toBe(false);
	});

	test('should name what is lost in the delete confirmation', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await expect(modal).toHaveAttribute('role', 'dialog');
		await expect(modal).toHaveAttribute('aria-modal', 'true');
		await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

		await expect(page.locator('#modal-title')).toHaveText('Delete save');
		await expect(modal.locator('.modal-body p')).toHaveText(
			"Delete your Future Lost save (Round 3)? This can't be undone."
		);
		await expect(modal.getByRole('button', { name: 'Delete save' })).toBeVisible();
		await expect(modal.getByRole('button', { name: 'Keep it' })).toBeVisible();
	});

	test('should keep the save when choosing Keep it', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'Keep it' }).click();

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
	});

	test('should close modal when clicking backdrop', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.click({ position: { x: 5, y: 5 } });

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
	});

	test('should close modal when pressing Escape key', async ({ page }) => {
		await openDeleteConfirmation(page);

		await page.keyboard.press('Escape');

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
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

	test('should delete the save, say so in a toast over the page, and offer Play again', async ({
		page
	}) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'Delete save' }).click();

		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		const toast = page.locator('.home-toast');
		await expect(toast).toHaveText('Save deleted');
		await expect(page.getByRole('status')).toContainText('Save deleted');

		// An overlay, fixed over the page, not a banner in the page's flow
		expect(await toast.evaluate((el) => getComputedStyle(el.parentElement!).position)).toBe(
			'fixed'
		);
		await expect(page.getByTestId('home-page').locator('.home-toast')).toHaveCount(0);

		await expect(card(page).getByRole('button', { name: 'Play' })).toBeVisible();
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toHaveCount(0);

		// ...and it goes away by itself
		await expect(toast).toHaveCount(0, { timeout: 5000 });
	});
});
