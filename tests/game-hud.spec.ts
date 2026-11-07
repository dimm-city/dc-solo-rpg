import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY } from './helpers';

/**
 * The in-game HUD: one row at every width (HD-02), mirrored around the middle (Stability,
 * Kings, Roll, Cards, Aces, Tokens), every cell the same three rows so the labels, the values
 * and the foot (the bars, skulls, pips and roll modifiers) each sit on one line, the Lucid and
 * Surreal icons (HD-03), the landscape layout (VP-01) and the step button's keyboard focus
 * (AC-03).
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
	// The store's dev-server URL, passed in so TypeScript does not try to resolve it
	const store = '/src/lib/stores/gameStore.svelte.js';
	await page.evaluate(
		async ({ src, store }) => {
			const { gameState } = await import(store);
			new Function('g', src)(gameState);
		},
		{ src, store }
	);
}

const CELLS = ['hud-stability', 'hud-kings', 'hud-roll', 'hud-cards', 'hud-aces', 'hud-tokens'];

/** The four Aces, so the HUD shows 4/4 */
const FOUR_ACES = "['hearts','spades','diamonds','clubs'].map((suit) => ({ card: 'A', suit }))";

/**
 * The three lines of the HUD, measured in one frame once the fonts are in and every one-off
 * animation in the row (the unlock strike, a flash, a bar's transition) has ended: each cell's
 * label top, value centre (the LED for the roll) and foot bottom (its bar, skulls, pips or
 * modifier icons), relative to the row's top, plus the row's height.
 */
async function lines(page: Page) {
	const hud = page.getByTestId('hud');
	await hud.evaluate(() => document.fonts.ready);
	await expect
		.poll(() =>
			hud.evaluate(
				(el) =>
					el.getAnimations({ subtree: true }).filter((a) => {
						const timing = a.effect?.getComputedTiming();
						return timing && Number.isFinite(timing.iterations) && a.playState !== 'finished';
					}).length
			)
		)
		.toBe(0);
	return hud.evaluate((hud, ids) => {
		const top = hud.getBoundingClientRect().top;
		const cells = ids.map((id) => {
			const cell = hud.querySelector(`[data-testid="${id}"]`)!;
			const label = cell.querySelector('.hud-label')!.getBoundingClientRect();
			const value = (cell.querySelector('.led') ?? cell.querySelector('.hud-value'))!;
			const v = value.getBoundingClientRect();
			const foot = cell.querySelector('.hud-foot')!.getBoundingClientRect();
			return {
				labelTop: label.top - top,
				valueMid: (v.top + v.bottom) / 2 - top,
				footBottom: foot.bottom - top
			};
		});
		return { height: hud.getBoundingClientRect().height, cells };
	}, CELLS);
}

/** Every cell's labels, values and feet sit on one line each, the feet at the row's bottom */
function expectOneLineEach(
	{ height, cells }: Awaited<ReturnType<typeof lines>>,
	previous?: Awaited<ReturnType<typeof lines>>
) {
	const spread = (key: 'labelTop' | 'valueMid' | 'footBottom') => {
		const values = cells.map((c) => c[key]);
		return Math.max(...values) - Math.min(...values);
	};
	expect(spread('labelTop'), 'label tops').toBeLessThanOrEqual(1);
	expect(spread('valueMid'), 'value centres').toBeLessThanOrEqual(1);
	expect(spread('footBottom'), 'foot bottoms').toBeLessThanOrEqual(1);
	// The foot is at the bottom of the tile: within 8px of the row's bottom edge, under its
	// 2px frame, and under the value
	for (const [i, cell] of cells.entries()) {
		expect(cell.footBottom, `${CELLS[i]} foot`).toBeGreaterThanOrEqual(height - 8);
		expect(cell.footBottom, `${CELLS[i]} foot`).toBeLessThanOrEqual(height - 3);
		expect(cell.footBottom, `${CELLS[i]} foot under the value`).toBeGreaterThan(cell.valueMid + 8);
	}
	// A shorter value (a "7" beside a "2/20") never moves the lines
	if (previous) {
		for (const [i, cell] of cells.entries()) {
			expect(cell.footBottom, `${CELLS[i]} foot`).toBeCloseTo(previous.cells[i].footBottom, 0);
			expect(cell.valueMid, `${CELLS[i]} value`).toBeCloseTo(previous.cells[i].valueMid, 0);
			expect(cell.labelTop, `${CELLS[i]} label`).toBeCloseTo(previous.cells[i].labelTop, 0);
		}
	}
}

test.describe('Game HUD', () => {
	test('is one row of six cells, at most 960px wide and about 64px tall', async ({ page }) => {
		await openTable(page);
		const hud = await page.getByTestId('hud').boundingBox();
		expect(hud!.width).toBeLessThanOrEqual(960);
		expect(hud!.height).toBeGreaterThanOrEqual(50);
		expect(hud!.height).toBeLessThanOrEqual(66);

		// Measured in one frame: the table (and the HUD with it) may still be fading in
		const { row, boxes } = await page.getByTestId('hud').evaluate((el, ids) => {
			const rect = (node: Element) => {
				const { x, y, width } = node.getBoundingClientRect();
				return { x, y, width };
			};
			return {
				row: rect(el),
				boxes: ids.map((id) => {
					const cell = el.querySelector(`[data-testid="${id}"]`);
					return cell ? rect(cell) : null;
				})
			};
		}, CELLS);
		const tops = [];
		let right = -Infinity;
		for (const [i, box] of boxes.entries()) {
			const id = CELLS[i];
			expect(box, id).not.toBeNull();
			tops.push(Math.round(box!.y));
			// Every cell sits inside the row, in order from left to right
			expect(box!.x).toBeGreaterThanOrEqual(row.x - 1);
			expect(box!.x + box!.width).toBeLessThanOrEqual(row.x + row.width + 1);
			expect(box!.x, id).toBeGreaterThanOrEqual(right - 1);
			right = box!.x + box!.width;
		}
		expect(new Set(tops).size).toBe(1);

		// The labels, the values and the foot each sit on one line, before the first roll and
		// mid-game with the owner's numbers (2/20, 2/4, a 2 on the LED, 7, 4/4, 3/10)
		const first = await lines(page);
		expectOneLineEach(first);
		await setState(
			page,
			`g.tower = 2; g.kingsRevealed = 2; g.diceRoll = 2; g.deck = g.deck.slice(0, 7); g.acesRevealed = 4; g.aceOfHeartsRevealed = true; g.log = ${FOUR_ACES}; g.tokens = 3;`
		);
		await expect(page.getByTestId('hud-cards')).toContainText('7');
		await expect(page.getByTestId('hud-roll').locator('.led-on')).toHaveText('2');
		expectOneLineEach(await lines(page), first);
		await setState(
			page,
			'g.tower = 20; g.kingsRevealed = 0; g.diceRoll = 0; g.acesRevealed = 0; g.aceOfHeartsRevealed = false; g.log = []; g.tokens = 10;'
		);

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

	test('shows Aces by suit with what Salvation needs, and tokens locked until the Ace of Hearts', async ({
		page
	}) => {
		await openTable(page);
		const aces = page.getByTestId('hud-aces');
		const tokens = page.getByTestId('hud-tokens');
		await expect(aces).toContainText('0/4');
		await expect(aces.locator('.pip')).toHaveCount(4);
		await expect(aces.locator('.pip.lit')).toHaveCount(0);
		// Locked: the same n/N and bar as later, dimmed, with a lock and a way to unlock it
		await expect(tokens).toHaveClass(/locked/);
		await expect(tokens).toContainText('10/10');
		await expect(tokens.locator('.lock')).toBeVisible();
		await expect(tokens).toHaveAttribute('title', /Ace of Hearts/);
		await expect(tokens.locator('.sr-only')).toHaveText('Tokens locked: find the Ace of Hearts');

		await setState(
			page,
			"g.log = [{ card: 'A', suit: 'hearts' }, { card: 'A', suit: 'clubs' }]; g.acesRevealed = 2; g.aceOfHeartsRevealed = true; g.tokens = 9;"
		);
		await expect(aces).toHaveAttribute('title', 'Salvation needs 14+');
		await expect(aces.locator('.sr-only')).toHaveText(
			'Aces 2 of 4 (hearts, clubs), Salvation needs 14 or more'
		);
		await expect(aces.locator('.pip.lit')).toHaveCount(2);
		await expect(aces.locator('.pip.lit.hearts')).toHaveCount(1);
		await expect(tokens).toContainText('9/10');
		await expect(tokens.locator('.lock')).toHaveCount(0);
		await expect(tokens.locator('.fill')).toHaveAttribute('style', /scaleX\(0\.9\)/);

		// On Hard, failed Salvations push tokens past the start: the bar stays full, striped
		await setState(page, 'g.tokens = 12;');
		await expect(tokens).toContainText('12/10');
		await expect(tokens).toHaveClass(/over/);
		await expect(tokens.locator('.fill')).toHaveAttribute('style', /scaleX\(1\)/);

		// All four Aces: automatic Salvation on Normal and Hard, the final Stability check on Easy
		await setState(
			page,
			`g.acesRevealed = 4; g.log = ${FOUR_ACES}; g.config.options.difficulty = 1;`
		);
		await expect(aces).toContainText('4/4');
		await expect(aces).toHaveAttribute(
			'title',
			'All four Aces: Salvation is automatic after a Stability check'
		);
		await expect(aces.locator('.sr-only')).toHaveText(
			'Aces 4 of 4 (hearts, spades, diamonds, clubs), Salvation is automatic after a Stability check'
		);
		await setState(page, 'g.config.options.difficulty = 2;');
		await expect(aces).toHaveAttribute(
			'title',
			'All four Aces: Salvation is automatic after a Stability check'
		);
		await setState(page, 'g.config.options.difficulty = 0;');
		await expect(aces).toHaveAttribute(
			'title',
			'All four Aces: survive the final Stability check and you escape'
		);
	});

	test('shows the cards left over a meter and the roll on a seven-segment display', async ({
		page
	}) => {
		await openTable(page);
		const cards = page.getByTestId('hud-cards');
		await expect(cards.locator('.bar .fill')).toHaveAttribute('style', /scaleX\(1\)/);
		await setState(page, 'g.deck = g.deck.slice(0, 26);');
		await expect(cards).toContainText('26');
		await expect(cards.locator('.fill')).toHaveAttribute('style', /scaleX\(0\.5\)/);

		const roll = page.getByTestId('hud-roll');
		await expect(roll.locator('.led-on')).toHaveText('--');
		await setState(page, 'g.diceRoll = 7;');
		await expect(roll.locator('.led-on')).toHaveText('7');
		// The digits are the self-hosted DSEG7 face, larger than the other numbers
		const led = await roll.locator('.led-on').evaluate(async (el) => {
			await document.fonts.ready;
			const other = document.querySelector('[data-testid="hud-cards"] .hud-value')!;
			return {
				family: getComputedStyle(el).fontFamily,
				loaded: document.fonts.check(`700 20px "DSEG7 Classic"`),
				size: parseFloat(getComputedStyle(el).fontSize),
				otherSize: parseFloat(getComputedStyle(other).fontSize)
			};
		});
		expect(led.family).toContain('DSEG7 Classic');
		expect(led.loaded).toBe(true);
		expect(led.size).toBeGreaterThan(led.otherSize);
	});

	test('tiers, Kings and the Lucid and Surreal icons follow the game state', async ({ page }) => {
		await openTable(page);
		const lucid = page.getByTestId('roll-lucid');
		const surreal = page.getByTestId('roll-surreal');
		// Both icons are there before any modifier, dim and said to be off
		await expect(lucid).toBeVisible();
		await expect(surreal).toBeVisible();
		await expect(lucid).toHaveAttribute('aria-label', /^Lucid \(off\): a natural 20/);
		await expect(surreal).toHaveAttribute('aria-label', /^Surreal \(off\): a natural 1/);
		const dim = await lucid.evaluate((el) => parseFloat(getComputedStyle(el).opacity));
		expect(dim).toBeGreaterThan(0.2);
		expect(dim).toBeLessThan(0.4);

		await setState(page, 'g.tower = 3; g.kingsRevealed = 3; g.isLucid = true;');
		await expect(page.getByTestId('hud-stability')).toHaveClass(/tier-critical/);
		await expect(page.getByTestId('hud-kings')).toHaveClass(/urgent/);
		await expect(page.getByTestId('hud-kings').locator('.skull.lit')).toHaveCount(3);
		await expect(
			page.getByRole('img', { name: 'Lucid: next roll keeps the higher of two dice' })
		).toHaveClass(/\bon\b/);
		await expect(lucid).toHaveAttribute('title', 'Lucid: next roll keeps the higher of two dice');
		await expect(surreal).not.toHaveClass(/\bon\b/);
		// Lit: its own colour, fully opaque
		await expect
			.poll(() => lucid.evaluate((el) => parseFloat(getComputedStyle(el).opacity)))
			.toBe(1);
		const lit = await lucid.evaluate((el) => getComputedStyle(el).color);
		expect(lit).toBe('rgb(0, 255, 170)');

		await setState(page, 'g.isLucid = false; g.isSurreal = true;');
		await expect(
			page.getByRole('img', { name: 'Surreal: next roll keeps the lower of two dice' })
		).toHaveClass(/\bon\b/);
		await expect(lucid).not.toHaveClass(/\bon\b/);
		await expect(lucid).toHaveAttribute('aria-label', /\(off\)/);
		// Both icons stay on the HUD's bottom line
		expectOneLineEach(await lines(page));
	});

	test('a landscape phone gets the short HUD and the step button beside the table', async ({
		page
	}, testInfo) => {
		test.skip(testInfo.project.name !== 'Desktop Chrome', 'sets its own viewport');
		await page.setViewportSize({ width: 844, height: 390 });
		await openTable(page);

		const hud = await page.getByTestId('hud').boundingBox();
		expect(hud!.height).toBeLessThanOrEqual(54);
		// The same three lines in the short row
		expectOneLineEach(await lines(page));

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
