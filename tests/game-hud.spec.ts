import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY } from './helpers';

/**
 * The in-game HUD: one row at every width (HD-02), the 2d20 badge (HD-03), the landscape
 * layout (VP-01) and the step button's keyboard focus (AC-03).
 */

/** Open a game and get past the intro to the opening roll, where the HUD and table show */
async function openTable(page: Page) {
	await page.goto('/');
	await page.evaluate((key) => {
		sessionStorage.setItem('splashShown', 'true');
		localStorage.setItem(key, 'true');
	}, INSTRUCTIONS_SEEN_KEY);
	await page.goto('/game/future-lost');
	await page.getByTestId('story-continue-button').click();
	await expect(page.getByTestId('screen-initialDamageRoll')).toBeVisible();
	await expect(page.getByTestId('hud')).toBeVisible();
}

/** Change the live game state (dev server only) */
async function setState(page: Page, src: string) {
	await page.evaluate(async (src) => {
		const { gameState } = await import('/src/lib/stores/gameStore.svelte.js');
		new Function('g', src)(gameState);
	}, src);
}

const CELLS = ['hud-stability', 'hud-kings', 'hud-aces', 'hud-tokens', 'hud-cards', 'hud-roll'];

test.describe('Game HUD', () => {
	test('is one row of six cells, at most 960px wide and about 64px tall', async ({ page }) => {
		await openTable(page);
		const hud = await page.getByTestId('hud').boundingBox();
		expect(hud!.width).toBeLessThanOrEqual(960);
		expect(hud!.height).toBeGreaterThanOrEqual(50);
		expect(hud!.height).toBeLessThanOrEqual(66);

		const tops = [];
		for (const id of CELLS) {
			const box = await page.getByTestId(id).boundingBox();
			expect(box, id).not.toBeNull();
			tops.push(Math.round(box!.y));
			// Every cell sits inside the row
			expect(box!.x).toBeGreaterThanOrEqual(hud!.x - 1);
			expect(box!.x + box!.width).toBeLessThanOrEqual(hud!.x + hud!.width + 1);
		}
		expect(new Set(tops).size).toBe(1);

		// No label is cut off
		const clipped = await page
			.getByTestId('hud')
			.locator('.hud-label')
			.evaluateAll((labels) => labels.filter((l) => l.scrollWidth > l.clientWidth + 1).length);
		expect(clipped).toBe(0);

		// The step button is on screen under it
		const button = await page.getByTestId('initial-damage-button').boundingBox();
		const viewport = page.viewportSize()!;
		expect(button!.y + button!.height).toBeLessThanOrEqual(viewport.height);
		expect(button!.y).toBeGreaterThan(hud!.y + hud!.height);
	});

	test('shows Aces with what Salvation needs, and a lock until the Ace of Hearts', async ({
		page
	}) => {
		await openTable(page);
		const aces = page.getByTestId('hud-aces');
		const tokens = page.getByTestId('hud-tokens');
		await expect(aces).toContainText('0/4');
		await expect(tokens).toContainText('find A♥');

		await setState(page, 'g.acesRevealed = 2; g.aceOfHeartsRevealed = true; g.tokens = 9;');
		await expect(aces.getByTestId('aces-need')).toHaveText('need 14+');
		await expect(tokens).toContainText('9');
		await expect(tokens.locator('.lock')).toHaveCount(0);
	});

	test('tiers, Kings and the 2d20 badge follow the game state', async ({ page }) => {
		await openTable(page);
		await setState(page, 'g.tower = 3; g.kingsRevealed = 3; g.isLucid = true;');

		await expect(page.getByTestId('hud-stability')).toHaveClass(/tier-critical/);
		await expect(page.getByTestId('hud-kings')).toHaveClass(/urgent/);
		await expect(page.getByTestId('hud-kings').locator('.skull.lit')).toHaveCount(3);
		const badge = page.getByRole('img', { name: /Lucid: your next roll uses two d20/ });
		await expect(badge).toHaveText('2d20↑');

		await setState(page, 'g.isLucid = false; g.isSurreal = true;');
		await expect(page.getByTestId('roll-badge')).toHaveText('2d20↓');
	});

	test('a landscape phone gets the short HUD and the step button beside the table', async ({
		page
	}, testInfo) => {
		test.skip(testInfo.project.name !== 'Desktop Chrome', 'sets its own viewport');
		await page.setViewportSize({ width: 844, height: 390 });
		await openTable(page);

		const hud = await page.getByTestId('hud').boundingBox();
		expect(hud!.height).toBeLessThanOrEqual(54);

		const table = await page.locator('.main-screen-area').boundingBox();
		const button = await page.getByTestId('initial-damage-button').boundingBox();
		// In a right-hand column, fully on screen, not under the title
		expect(button!.x).toBeGreaterThan(table!.x + table!.width / 2);
		expect(button!.y + button!.height).toBeLessThanOrEqual(390);
		const title = await page.locator('.context-title').boundingBox();
		expect(title!.x + title!.width).toBeLessThanOrEqual(button!.x);
	});

	test('the step button shows a visible focus ring from the keyboard', async ({
		page
	}, testInfo) => {
		test.skip(testInfo.project.name !== 'Desktop Chrome', 'keyboard focus');
		await openTable(page);
		const button = page.getByTestId('initial-damage-button');

		let focused = false;
		for (let i = 0; i < 20 && !focused; i++) {
			await page.keyboard.press('Tab');
			focused = await button.evaluate((el) => el === document.activeElement);
		}
		expect(focused).toBe(true);

		const ring = await button.evaluate((el) => {
			const cs = getComputedStyle(el);
			return {
				focusVisible: el.matches(':focus-visible'),
				border: cs.getPropertyValue('--aug-border-bg').trim(),
				width: cs.getPropertyValue('--aug-border-all').trim(),
				glow: cs.boxShadow
			};
		});
		expect(ring.focusVisible).toBe(true);
		expect(ring.border).toBe('#ffffff');
		expect(ring.width).toBe('3px');
		expect(ring.glow).toContain('inset');
	});
});
