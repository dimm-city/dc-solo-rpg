// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage, openContentModal } from './helpers';

test.describe('Settings Modal', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should open Settings modal from the header menu', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');

		await expect(dialog).toHaveAccessibleName('Game Settings');
		await expect(dialog.getByRole('heading', { level: 2, name: 'Game Settings' })).toBeVisible();
	});

	test('should open with difficulty, play mode and rule tips, and the rest under Advanced', async ({
		page
	}) => {
		const dialog = await openContentModal(page, 'Settings');

		await expect(dialog.getByRole('heading', { level: 3, name: 'Gameplay' })).toBeVisible();
		await expect(dialog.getByText('Changes apply the next time a game begins.')).toBeVisible();

		const difficulty = dialog.getByLabel('Difficulty');
		await expect(difficulty).toBeVisible();
		await expect(difficulty.locator('option')).toHaveText(['Game default', 'Normal', 'Easy']);

		const playMode = dialog.getByRole('radiogroup', { name: 'Play mode' });
		await expect(playMode).toBeVisible();
		await expect(playMode.getByRole('radio')).toHaveCount(3);
		for (const name of ['Manual', 'Read aloud', 'Hands-free']) {
			await expect(playMode.getByRole('radio', { name })).toBeAttached();
		}
		await expect(dialog.getByRole('switch', { name: 'Rule tips' })).toBeVisible();

		// Everything else is folded under Advanced, closed at first
		const advanced = dialog.locator('details.settings-advanced');
		await expect(advanced).not.toHaveAttribute('open');
		await expect(dialog.getByLabel('Voice provider')).toBeHidden();
		await advanced.locator('summary').click();
		for (const label of ['Voice provider', 'Read cards', 'Auto-roll dice', 'Journaling']) {
			await expect(dialog.getByLabel(label)).toBeAttached();
		}
		await expect(dialog.getByRole('heading', { level: 3, name: 'Read aloud' })).toBeAttached();
		await expect(dialog.getByRole('heading', { level: 3, name: 'Auto-play' })).toBeAttached();

		await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'Close Game Settings' })).toBeVisible();
	});

	test('should show every Gameplay control without scrolling', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');

		const body = await dialog.locator('.content-body-wrapper').boundingBox();
		const tips = await dialog.getByRole('switch', { name: 'Rule tips' }).boundingBox();
		expect(tips!.y + tips!.height).toBeLessThanOrEqual(body!.y + body!.height);
	});

	test('should remember the play mode, and map it onto the settings under Advanced', async ({
		page
	}) => {
		let dialog = await openContentModal(page, 'Settings');
		await expect(dialog.getByRole('radio', { name: 'Manual' })).toBeChecked();

		await dialog.getByRole('radio', { name: 'Hands-free' }).check();
		await dialog.locator('details.settings-advanced summary').click();
		await expect(dialog.getByLabel('Read cards')).toBeChecked();
		await expect(dialog.getByLabel('Auto-roll dice')).toBeChecked();
		await expect(dialog.getByLabel('Journaling')).toHaveValue('timed');

		// Changing a single setting makes it a custom mix: no mode selected
		await dialog.getByLabel('Auto-roll dice').uncheck();
		for (const name of ['Manual', 'Read aloud', 'Hands-free']) {
			await expect(dialog.getByRole('radio', { name })).not.toBeChecked();
		}
		await expect(dialog.getByText('Custom: your own mix')).toBeVisible();

		await dialog.getByRole('radio', { name: 'Read aloud' }).check();
		await dialog.getByRole('button', { name: 'Done' }).click();

		await page.reload();
		await expect(page.getByTestId('home-page')).toBeVisible();
		dialog = await openContentModal(page, 'Settings');
		await expect(dialog.getByRole('radio', { name: 'Read aloud' })).toBeChecked();
	});

	test('should offer only the free voices until a key is added', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');
		await dialog.locator('details.settings-advanced summary').click();

		const provider = dialog.getByLabel('Voice provider');
		await expect(provider.locator('option')).toHaveText([
			'Browser voice (free)',
			'On-device voice (free, 265 MB)'
		]);

		await dialog.getByRole('button', { name: 'Add a voice service' }).click();
		const service = dialog.getByLabel('Service', { exact: true });
		await expect(service.locator('option')).toHaveText(['DimmCityAI', 'OpenAI', 'ElevenLabs']);
		await expect(dialog.getByRole('button', { name: 'Save and use' })).toBeDisabled();

		await service.selectOption('openai');
		await dialog.getByLabel('API key', { exact: true }).fill('sk-test-key');
		await dialog.getByRole('button', { name: 'Save and use' }).click();

		// The service is now listed, chosen, and no longer offered for adding
		await expect(provider).toHaveValue('openai');
		await expect(provider.locator('option')).toHaveText([
			'Browser voice (free)',
			'On-device voice (free, 265 MB)',
			'OpenAI'
		]);
		await dialog.getByRole('button', { name: 'Add a voice service' }).click();
		await expect(dialog.getByLabel('Service', { exact: true }).locator('option')).toHaveText([
			'DimmCityAI',
			'ElevenLabs'
		]);
	});

	test('should stay on the home page and not offer a separate settings page', async ({ page }) => {
		await openContentModal(page, 'Settings');

		await expect(page.getByRole('button', { name: 'Open Settings Page' })).toHaveCount(0);
		await expect(page).toHaveURL(/\/$/);
	});

	test('should close Settings modal when clicking Done', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');

		await dialog.getByRole('button', { name: 'Done' }).click();

		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should close Settings modal with the X button and with Escape', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');
		await dialog.getByRole('button', { name: 'Close Game Settings' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);

		await openContentModal(page, 'Settings');
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
	});

	test('should remember the difficulty choice', async ({ page }) => {
		const dialog = await openContentModal(page, 'Settings');
		const difficulty = dialog.getByLabel('Difficulty');
		await expect(difficulty).toHaveValue('default');

		await difficulty.selectOption('easy');
		await dialog.getByRole('button', { name: 'Done' }).click();
		await expect(page.getByRole('dialog')).toHaveCount(0);

		// Persists across a reload
		await page.reload();
		await expect(page.getByTestId('home-page')).toBeVisible();
		const reopened = await openContentModal(page, 'Settings');
		await expect(reopened.getByLabel('Difficulty')).toHaveValue('easy');
	});

	test('should have the same modal styling as the About modal', async ({ page }) => {
		await openContentModal(page, 'Settings');

		// Same shared ContentModal shell: scrim above the header, framed with augmented-ui
		const zIndex = await page
			.locator('.content-modal-backdrop')
			.evaluate((el) => window.getComputedStyle(el).zIndex);
		const headerZ = await page
			.locator('.page-header')
			.evaluate((el) => window.getComputedStyle(el).zIndex);
		expect(parseInt(zIndex)).toBeGreaterThan(parseInt(headerZ));

		const augmentedAttr = await page
			.locator('.content-modal-wrapper')
			.getAttribute('data-augmented-ui');
		expect(augmentedAttr).toContain('border');

		const viewport = page.viewportSize()!;
		const wrapper = await page.locator('.content-modal-wrapper').boundingBox();
		if (viewport.width <= 640) {
			expect(wrapper!.height).toBeCloseTo(viewport.height, 0);
		} else {
			expect(wrapper!.height).toBeLessThanOrEqual(viewport.height * 0.88 + 1);
		}

		// Long content scrolls inside the body, not the page
		const overflowY = await page
			.locator('.content-body-wrapper')
			.evaluate((el) => window.getComputedStyle(el).overflowY);
		expect(overflowY).toBe('auto');
	});
});
