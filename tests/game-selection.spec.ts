// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage } from './helpers';

test.describe('Game Selection Screen', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should display game selection screen with all elements', async ({ page }) => {
		// Verify page container
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();

		// Verify game selector
		await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();

		// Verify header is visible
		await expect(page.locator('.page-header')).toBeVisible();
	});

	test('should display games in a grid', async ({ page }) => {
		// Verify game cards grid exists
		const grid = page.locator('.game-cards-grid');
		await expect(grid).toBeVisible();

		// Verify grid has games
		await expect(page.locator('.game-card').first()).toBeVisible();
		expect(await page.locator('.game-card').count()).toBeGreaterThan(0);
	});

	test('should display game cards with correct information', async ({ page }) => {
		// Check first game card
		const firstCard = page.locator('.game-card').first();

		// Verify title exists
		await expect(firstCard.locator('.game-card-title')).toBeVisible();
		await expect(firstCard.locator('.game-card-title')).not.toBeEmpty();

		// Verify subtitle exists
		await expect(firstCard.locator('.game-subtitle')).toBeVisible();
		await expect(firstCard.locator('.game-subtitle')).not.toBeEmpty();
	});

	test('should display each game with data-testid', async ({ page }) => {
		// Every card carries game-card-{slug}
		const gameCards = page.locator('[data-testid^="game-card-"]');
		const count = await gameCards.count();
		expect(count).toBeGreaterThan(0);
		expect(count).toBe(await page.locator('.game-card').count());

		for (let i = 0; i < count; i++) {
			const testId = await gameCards.nth(i).getAttribute('data-testid');
			expect(testId).toMatch(/^game-card-[a-z0-9-]+$/);
		}

		await expect(page.getByTestId('game-card-future-lost')).toBeVisible();
	});

	test('should have augmented-ui styling on game cards', async ({ page }) => {
		// Check first game card has augmented-ui attribute
		const firstCard = page.locator('.game-card').first();
		const augmentedAttr = await firstCard.getAttribute('data-augmented-ui');

		expect(augmentedAttr).toBeTruthy();
		expect(augmentedAttr).toContain('border');
	});

	test('should show hover effect on the start button', async ({ page }) => {
		// The card itself is no longer interactive; the Start button is the control that reacts
		const startButton = page.locator('.game-card').first().getByRole('button', {
			name: 'Start new game'
		});

		const initialTransform = await startButton.evaluate(
			(el) => window.getComputedStyle(el).transform
		);

		await startButton.hover();

		// The button lifts and scales on hover
		await expect
			.poll(() => startButton.evaluate((el) => window.getComputedStyle(el).transform))
			.not.toBe(initialTransform);
	});

	test('should not select a card or open a confirmation when a card is clicked', async ({
		page
	}) => {
		const firstCard = page.locator('.game-card').first();

		// Click the card body (away from the action buttons)
		await firstCard.locator('.game-card-title').click();

		await expect(firstCard).not.toHaveClass(/selected/);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(page).toHaveURL(/\/$/);
	});

	test('should display game cards in 3 columns on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		const grid = page.locator('.game-cards-grid');

		// Get computed grid-template-columns
		const gridColumns = await grid.evaluate(
			(el) => window.getComputedStyle(el).gridTemplateColumns
		);

		// Should have 3 columns (will have 3 values in the string)
		const columnCount = gridColumns.split(' ').length;
		expect(columnCount).toBe(3);
	});

	test('should have glassmorphism background on game cards', async ({ page }) => {
		const firstCard = page.locator('.game-card').first();

		// Verify backdrop-filter exists
		const backdropFilter = await firstCard.evaluate(
			(el) =>
				window.getComputedStyle(el).backdropFilter ||
				window.getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter')
		);

		expect(backdropFilter).toContain('blur');
	});

	test('should have a different card variant for each game card', async ({ page }) => {
		const cards = page.locator('.game-card');
		const count = await cards.count();
		expect(count).toBeGreaterThan(1);

		// Cards cycle through variants game-card-1..5 in order
		const variants: string[] = [];
		for (let i = 0; i < Math.min(count, 5); i++) {
			const cls = (await cards.nth(i).getAttribute('class')) ?? '';
			expect(cls).toContain(`game-card-${i + 1}`);
			variants.push(cls.match(/game-card-\d/)![0]);
		}
		expect(new Set(variants).size).toBe(variants.length);
	});

	test('should be keyboard navigable', async ({ page }) => {
		// The Start button is the card's focusable control. Tab from the menu button reaches it.
		await page.getByRole('button', { name: 'Toggle menu' }).focus();
		await page.keyboard.press('Tab');

		const focused = page.locator(':focus');
		await expect(focused).toHaveClass(/start-btn/);

		// Enter starts the game
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('game-page')).toBeVisible();
	});
});
