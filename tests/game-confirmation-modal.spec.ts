// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { openHomePage } from './helpers';

const SLUG = 'ghost-in-the-machine';
const GAME_TITLE = 'Locked in the Tech District';

/**
 * Leave the built-in game in progress (round 3) and return to the home page, where its card now
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
				state: 'rollForTasks',
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

/** Confirmations are built on the shared dialog: its scrim is the content-modal backdrop */
const scrim = (page: Page) => page.locator('.content-modal-backdrop');

/** Find a confirmation by its title and wait for its entrance, so a click lands where it rests */
async function confirmation(page: Page, title: string) {
	const modal = page.getByRole('dialog', { name: title });
	await expect(modal).toBeVisible();
	await page.waitForFunction(() =>
		document.getAnimations().every((animation) => {
			const target = (animation.effect as KeyframeEffect | null)?.target;
			const endless = animation.effect?.getComputedTiming().endTime === Infinity;
			return (
				!(target instanceof Element && target.closest('.content-modal-backdrop')) ||
				endless ||
				animation.playState !== 'running'
			);
		})
	);
	return modal;
}

/** Open the "Delete save" confirmation for the in-progress game */
async function openDeleteConfirmation(page: Page) {
	await leaveGameInProgress(page);
	await card(page).getByRole('button', { name: 'Delete save' }).click();
	return confirmation(page, 'Delete save');
}

test.describe('Game start, saves and confirmations', () => {
	test('should start a game straight from Play, with no confirmation', async ({ page }) => {
		await openHomePage(page);

		await card(page).getByRole('button', { name: 'Play' }).click();

		await expect(page).toHaveURL(`/game/${SLUG}`);
		await expect(page.getByTestId('screen-showIntro')).toBeVisible();
		await expect(page.getByRole('dialog')).toHaveCount(0);
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
		const modal = await confirmation(page, 'New game');
		await expect(modal.getByTestId('confirm-message')).toHaveText(
			"Start Locked in the Tech District from the beginning? Your Round 3 save will be replaced. This can't be undone."
		);

		await modal.getByRole('button', { name: 'Keep my save' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
	});

	test('should start fresh once New game is confirmed', async ({ page }) => {
		await leaveGameInProgress(page);

		await card(page).getByRole('button', { name: 'New game' }).click();
		const modal = await confirmation(page, 'New game');
		await modal.getByRole('button', { name: 'Start new game' }).click();

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

		// Proper dialog semantics: a modal dialog named by its title, holding focus
		await expect(modal).toHaveAttribute('aria-modal', 'true');
		await expect(modal.getByRole('heading', { name: 'Delete save' })).toBeVisible();
		await expect(modal).toBeFocused();

		await expect(modal.getByTestId('confirm-message')).toHaveText(
			"Delete your Locked in the Tech District save (Round 3)? This can't be undone."
		);
		// exact: the close button is named "Close Delete save"
		await expect(modal.getByRole('button', { name: 'Delete save', exact: true })).toBeVisible();
		await expect(modal.getByRole('button', { name: 'Keep save' })).toBeVisible();
	});

	test('should have a 44px close target', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		const close = await modal.getByRole('button', { name: /^Close/ }).boundingBox();
		expect(close?.width).toBeGreaterThanOrEqual(44);
		expect(close?.height).toBeGreaterThanOrEqual(44);
	});

	test('should style Delete save as an outlined destructive action, not a filled CTA', async ({
		page
	}) => {
		const modal = await openDeleteConfirmation(page);

		const style = await modal
			.getByRole('button', { name: 'Delete save', exact: true })
			.evaluate((el) => {
				const cs = window.getComputedStyle(el);
				return { bg: cs.backgroundImage + cs.backgroundColor, border: cs.borderTopColor };
			});
		// Transparent fill with a red border
		expect(style.bg).toContain('rgba(0, 0, 0, 0)');
		expect(style.bg).not.toContain('gradient');
		expect(style.border).toBe('rgb(255, 77, 109)');
	});

	test('should keep the save when choosing Keep save', async ({ page }) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'Keep save' }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
	});

	test('should close modal when clicking backdrop', async ({ page }) => {
		await openDeleteConfirmation(page);

		// Click the scrim, not the dialog
		await scrim(page).click({ position: { x: 5, y: 5 } });

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
	});

	test('should close modal when pressing Escape key', async ({ page }) => {
		await openDeleteConfirmation(page);

		await page.keyboard.press('Escape');

		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(card(page).getByRole('button', { name: /^Continue/ })).toBeVisible();
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

	test('should delete the save, say so in a toast over the page, and offer Play again', async ({
		page
	}) => {
		const modal = await openDeleteConfirmation(page);

		await modal.getByRole('button', { name: 'Delete save', exact: true }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
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
