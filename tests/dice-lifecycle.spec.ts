import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY, SPLASH_SEEN_KEY } from './helpers';

/**
 * The dice renderer's lifecycle in the browser: changing the dice theme and leaving for a new
 * game keep the one DiceBox, so the page never makes a second dice WebGL context (a browser
 * drops the oldest contexts once a page holds 8 to 16, which blanked the dice), leaves no
 * orphaned canvas and no orphaned window resize listener, and the dice still roll.
 */

type Counts = {
	created: number;
	lost: number;
	live: number;
	liveDetached: number;
	canvasesInContainer: number;
	resizeListeners: number;
};

type Meter = {
	created: number;
	lost: number;
	canvases: HTMLCanvasElement[];
	resize: Set<unknown>;
};

/** Runs before any page script: counts WebGL contexts and window resize listeners */
function instrument() {
	const meter: Meter = { created: 0, lost: 0, canvases: [], resize: new Set() };
	const lost = new WeakSet<HTMLCanvasElement>();
	(window as unknown as { __gl: Meter }).__gl = meter;
	const proto = HTMLCanvasElement.prototype as unknown as {
		getContext: (this: HTMLCanvasElement, ...args: unknown[]) => unknown;
	};
	const getContext = proto.getContext;
	proto.getContext = function (type: unknown, ...rest: unknown[]) {
		const context = getContext.call(this, type, ...rest);
		if (
			context &&
			typeof type === 'string' &&
			/webgl/i.test(type) &&
			!meter.canvases.includes(this)
		) {
			meter.created++;
			meter.canvases.push(this);
			this.addEventListener('webglcontextlost', () => {
				if (!lost.has(this)) {
					lost.add(this);
					meter.lost++;
				}
			});
		}
		return context;
	};
	(window as unknown as { __glLost: WeakSet<HTMLCanvasElement> }).__glLost = lost;
	const add = window.addEventListener;
	const remove = window.removeEventListener;
	window.addEventListener = function (type: string, handler: unknown, ...rest: unknown[]) {
		if (type === 'resize' && handler) meter.resize.add(handler);
		return (add as (...args: unknown[]) => void).call(this, type, handler, ...rest);
	} as typeof window.addEventListener;
	window.removeEventListener = function (type: string, handler: unknown, ...rest: unknown[]) {
		if (type === 'resize') meter.resize.delete(handler);
		return (remove as (...args: unknown[]) => void).call(this, type, handler, ...rest);
	} as typeof window.removeEventListener;
}

async function counts(page: Page): Promise<Counts> {
	return page.evaluate(() => {
		const meter = (window as unknown as { __gl: Meter }).__gl;
		const lost = (window as unknown as { __glLost: WeakSet<HTMLCanvasElement> }).__glLost;
		const live = meter.canvases.filter((canvas) => !lost.has(canvas));
		return {
			created: meter.created,
			lost: meter.lost,
			live: live.length,
			liveDetached: live.filter((canvas) => !document.contains(canvas)).length,
			canvasesInContainer: document.querySelectorAll('#dice-roller-container canvas').length,
			resizeListeners: meter.resize.size
		};
	});
}

/** Wait for a shared dialog's entrance to end, so a click lands where it rests */
async function settled(page: Page, name: string) {
	const dialog = page.getByRole('dialog', { name });
	await expect(dialog).toBeVisible();
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
	return dialog;
}

/** From the home page, start Future Lost (Play, or New game over a save) and reach the table */
async function startGame(page: Page) {
	const card = page.getByTestId('game-card-future-lost');
	await expect(card).toBeVisible();
	const play = card.locator('.start-btn');
	if (await play.isVisible()) {
		await play.click();
	} else {
		await card.locator('.new-game-btn').click();
		const dialog = await settled(page, 'New game');
		await dialog.getByRole('button', { name: 'Start new game' }).click();
	}
	await page.waitForURL('**/game/**');
	await page.getByTestId('story-continue-button').click();
	await expect(page.getByTestId('screen-initialDamageRoll')).toBeVisible();
	// The 3D dice are up once their canvas is in the container
	await expect(page.locator('#dice-roller-container canvas')).toHaveCount(1, { timeout: 30000 });
}

/** Leave for the home page through the header's Exit (the game is saved on the way) */
async function exitGame(page: Page) {
	await page.getByRole('button', { name: 'Exit game' }).click();
	const dialog = await settled(page, 'Leave the game?');
	await dialog.getByRole('button', { name: 'Leave', exact: true }).click();
	await expect(page.getByTestId('home-page')).toBeVisible();
}

/** Pick a dice theme: the Dice button at 900px and up, else the "⋯" menu's Dice theme */
async function changeTheme(page: Page, key: string) {
	const wide = page.getByRole('button', { name: 'Change dice theme' });
	if (await wide.isVisible()) {
		await wide.click();
	} else {
		await page.getByRole('button', { name: 'More game options' }).click();
		await page.locator('.game-menu-item', { hasText: 'Dice theme' }).click();
	}
	const dialog = await settled(page, 'Dice');
	await dialog.getByTestId(`dice-theme-${key}`).click();
	await expect(dialog.getByTestId(`dice-theme-${key}`)).toHaveAttribute('aria-checked', 'true');
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
}

/** Press the step button and wait for the 3D dice to be thrown and to land */
async function rollOnce(page: Page) {
	const button = page
		.locator('[data-testid="initial-damage-button"], [data-testid="roll-tasks-button"]')
		.first();
	await expect(button).toBeEnabled();
	await expect(page.locator('#step-action')).not.toHaveClass(/changed/);
	await button.click();
	const table = page.locator('.dice-container.rolling');
	await expect(table).toHaveCount(1, { timeout: 15000 });
	await expect(table).toHaveCount(0, { timeout: 90000 });
}

test.describe('dice renderer lifecycle', () => {
	test('theme changes and new games keep one live WebGL context, and the dice still roll', async ({
		page
	}) => {
		test.setTimeout(300000);
		await page.addInitScript(instrument);
		await page.goto('/');
		await page.evaluate(
			([instructions, splash]) => {
				localStorage.setItem(instructions, 'true');
				localStorage.setItem(splash, 'true');
				sessionStorage.setItem('splashShown', 'true');
			},
			[INSTRUCTIONS_SEEN_KEY, SPLASH_SEEN_KEY]
		);
		await page.goto('/');
		await expect(page.getByTestId('home-page')).toBeVisible();

		await startGame(page);
		const start = await counts(page);
		expect(start).toMatchObject({ created: 1, live: 1, liveDetached: 0, canvasesInContainer: 1 });

		for (const key of ['fire', 'ice', 'black', 'radiant', 'default']) {
			await changeTheme(page, key);
		}
		expect(await counts(page)).toMatchObject({
			created: 1,
			live: 1,
			liveDetached: 0,
			canvasesInContainer: 1,
			resizeListeners: start.resizeListeners
		});

		// The dice roll in the new theme, on the same renderer
		await rollOnce(page);
		await expect(page.getByTestId('roll-tasks-button')).toBeVisible({ timeout: 30000 });

		for (let game = 2; game <= 3; game++) {
			await exitGame(page);
			await startGame(page);
		}
		expect(await counts(page)).toMatchObject({
			created: 1,
			live: 1,
			liveDetached: 0,
			canvasesInContainer: 1,
			resizeListeners: start.resizeListeners
		});

		await rollOnce(page);
		expect(await counts(page)).toMatchObject({ created: 1, live: 1 });
	});
});
