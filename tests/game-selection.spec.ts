// spec: tests/home-page-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { openHomePage } from './helpers';

test.describe('Game Selection Screen', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	test('should display game selection screen with all elements', async ({ page }) => {
		await expect(page.locator('[data-testid="home-page"]')).toBeVisible();
		await expect(page.locator('[data-testid="game-selector"]')).toBeVisible();
		await expect(page.locator('.page-header')).toBeVisible();

		// A one-line pitch heads the page
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'A solo journaling game. Draw, roll, write.'
		);
		await expect(page).toHaveTitle('Dream Console');
	});

	test('should centre the content in a column no wider than 960px', async ({ page }) => {
		const viewport = page.viewportSize()!;
		const grid = await page.locator('.game-cards-grid').boundingBox();
		expect(grid!.width).toBeLessThanOrEqual(960);
		// Centred: equal space on both sides (within a pixel or two)
		const left = grid!.x;
		const right = viewport.width - (grid!.x + grid!.width);
		expect(Math.abs(left - right)).toBeLessThanOrEqual(2);
	});

	test('should display game cards with key art, title, subtitle and a time estimate', async ({
		page
	}) => {
		const cards = page.locator('.game-card');
		expect(await cards.count()).toBeGreaterThan(0);

		for (let i = 0; i < (await cards.count()); i++) {
			const card = cards.nth(i);
			await expect(card.locator('.key-art svg')).toBeVisible();
			await expect(card.locator('.game-card-title')).not.toBeEmpty();
			await expect(card.locator('.game-subtitle')).not.toBeEmpty();
			await expect(card.locator('.game-meta')).toContainText('About 30 min');
		}
	});

	test("should take each subtitle from the game's own frontmatter", async ({ page }) => {
		await expect(page.getByTestId('game-card-future-lost').locator('.game-subtitle')).toHaveText(
			'A Dimm City Campaign'
		);
		await expect(
			page.getByTestId('game-card-ghost-in-the-machine').locator('.game-subtitle')
		).toHaveText('Grab and go turned mad dash for the gate');
		await expect(page.getByText('Begin your adventure')).toHaveCount(0);
	});

	test('should draw different key art for each game', async ({ page }) => {
		const art = page.locator('.game-card .key-art svg');
		expect(await art.count()).toBeGreaterThan(1);
		const first = await art.nth(0).innerHTML();
		const second = await art.nth(1).innerHTML();
		expect(first).not.toBe(second);
	});

	test('should display each game with data-testid', async ({ page }) => {
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
		const augmentedAttr = await page
			.locator('.game-card')
			.first()
			.getAttribute('data-augmented-ui');

		expect(augmentedAttr).toBeTruthy();
		expect(augmentedAttr).toContain('border');
	});

	test('should label the play button', async ({ page }) => {
		for (const card of await page.locator('.game-card').all()) {
			const play = card.getByRole('button', { name: 'Play' });
			await expect(play).toBeVisible();
			await expect(play).toHaveText('Play');
		}
	});

	test('should show hover feedback on the play button', async ({ page }) => {
		const play = page.locator('.game-card').first().getByRole('button', { name: 'Play' });
		const before = await play.evaluate((el) => window.getComputedStyle(el).transform);

		await play.hover();

		await expect
			.poll(() => play.evaluate((el) => window.getComputedStyle(el).transform))
			.not.toBe(before);
	});

	test('should line cards up: equal heights and actions pinned to the bottom', async ({ page }) => {
		const viewport = page.viewportSize()!;
		test.skip(viewport.width <= 640, 'one card per row on phones');

		const cards = page.locator('.game-card');
		const a = await cards.nth(0).boundingBox();
		const b = await cards.nth(1).boundingBox();
		expect(Math.abs(a!.height - b!.height)).toBeLessThanOrEqual(1);

		const playA = await cards.nth(0).getByRole('button', { name: 'Play' }).boundingBox();
		const playB = await cards.nth(1).getByRole('button', { name: 'Play' }).boundingBox();
		expect(Math.abs(playA!.y - playB!.y)).toBeLessThanOrEqual(1);

		// Subtitles start on the same line, whatever the title length
		const subA = await cards.nth(0).locator('.game-subtitle').boundingBox();
		const subB = await cards.nth(1).locator('.game-subtitle').boundingBox();
		expect(Math.abs(subA!.y - subB!.y)).toBeLessThanOrEqual(1);
	});

	test('should not select a card or open a confirmation when a card is clicked', async ({
		page
	}) => {
		const firstCard = page.locator('.game-card').first();

		await firstCard.locator('.game-card-title').click();

		await expect(firstCard).not.toHaveClass(/selected/);
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(page).toHaveURL(/\/$/);
	});

	test('should display game cards in 2 columns on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		const gridColumns = await page
			.locator('.game-cards-grid')
			.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);

		expect(gridColumns.split(' ').length).toBe(2);
	});

	test('should have glassmorphism background on game cards', async ({ page }) => {
		const backdropFilter = await page
			.locator('.game-card')
			.first()
			.evaluate(
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

		const variants: string[] = [];
		for (let i = 0; i < Math.min(count, 5); i++) {
			const cls = (await cards.nth(i).getAttribute('class')) ?? '';
			expect(cls).toContain(`game-card-${i + 1}`);
			variants.push(cls.match(/game-card-\d/)![0]);
		}
		expect(new Set(variants).size).toBe(variants.length);
	});

	test('should be keyboard navigable', async ({ page }) => {
		// The last header control (More on desktop, the menu button on phones), then Tab
		const header = page.locator('.page-header');
		const toggle = header.getByRole('button', { name: 'Toggle menu' });
		const last = (await toggle.isVisible())
			? toggle
			: header.getByRole('button', { name: 'More', exact: true });
		await last.focus();
		await page.keyboard.press('Tab');

		const focused = page.locator(':focus');
		await expect(focused).toHaveClass(/start-btn/);
		await expect(focused).toHaveAccessibleName('Play');

		// Enter starts the game
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(/\/game\/[a-z0-9-]+$/);
		await expect(page.getByTestId('game-page')).toBeVisible();
	});
});
