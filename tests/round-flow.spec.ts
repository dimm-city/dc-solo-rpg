// Round flow: Round N opens on Roll for Tasks, the cards are dealt on their own, every roll
// button reads "Rolling…" while the dice roll, and Lucid/Surreal shows on the roll button only.
// The dice are forced through the app's own random service (dev server modules).
//
// These run under reduced motion: each roll is the 600ms number instead of a 3D throw, which
// takes many seconds in headless software WebGL. The throw itself is covered by unit tests.

import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY, playToFirstRound, pressStep } from './helpers';

test.describe.configure({ timeout: 60000 });

const SLUG = 'future-lost';
// Vite serves the app's modules at these URLs on the dev server (held in variables so the
// type checker does not try to resolve them)
const GAME_STORE = '/src/lib/stores/gameStore.svelte.js';
const RANDOM = '/src/lib/services/random.js';

/** Run code against the live stores (dev server only) */
async function store(page: Page, src: string) {
	await page.evaluate(
		async ({ src, modules }) => {
			const gs = await import(/* @vite-ignore */ modules[0]);
			const rnd = await import(/* @vite-ignore */ modules[1]);
			new Function('gs', 'rnd', src)(gs, rnd);
		},
		{ src, modules: [GAME_STORE, RANDOM] }
	);
}

const gameStateOf = (page: Page) =>
	page.evaluate(async (gameStore) => {
		const { gameState } = await import(/* @vite-ignore */ gameStore);
		return {
			state: gameState.state,
			round: gameState.round,
			isLucid: gameState.isLucid,
			taskRoll: gameState.taskRoll
		};
	}, GAME_STORE);

async function openGame(page: Page) {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript((key) => {
		sessionStorage.setItem('splashShown', 'true');
		localStorage.setItem(key, 'true');
	}, INSTRUCTIONS_SEEN_KEY);
	await page.goto(`/game/${SLUG}`);
	await expect(page.getByTestId('screen-showIntro')).toBeVisible({ timeout: 30000 });
}

test.describe('Round flow', () => {
	test.afterEach(async ({ page }) => {
		await store(page, 'rnd.resetRNG()').catch(() => {});
	});

	test('the intro ends on what winning takes', async ({ page }) => {
		await openGame(page);
		await expect(page.getByTestId('intro-goal')).toHaveText(
			/^Hold on to your 20 Stability\. (Find the Ace of Hearts, then|The Ace of Hearts is already revealed:) clear all 10 tokens to escape\.$/
		);
	});

	test('Round 1 opens on Roll for Tasks and deals the cards on its own', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await expect(page.getByRole('button', { name: /Begin Round/i })).toHaveCount(0);

		await store(page, 'rnd.mockDieRoll(8)'); // 3 cards
		const roll = page.getByTestId('roll-tasks-button');
		await pressStep(page, 'roll-tasks-button');
		// The accessible name: the visible label crossfades, so old and new text overlap briefly
		await expect(roll).toHaveAccessibleName('Rolling…');

		// The result, under the same title, then the deal with no further press
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 8 · Draw 3 cards', {
			timeout: 30000
		});
		await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toBeVisible();
		expect((await gameStateOf(page)).taskRoll).toEqual({ roll: 8, dice: [8], cards: 3 });
	});

	test('a Lucid roll shows the modifier on the roll button only, and names both dice', async ({
		page
	}) => {
		await openGame(page);
		await playToFirstRound(page);

		await store(page, 'gs.gameState.isLucid = true; rnd.mockDieRollSequence([4, 15])');
		const roll = page.getByTestId('roll-tasks-button');
		await expect(roll.getByTestId('roll-modifier')).toHaveText('Lucid: 2 dice, keep high');
		await expect(roll).toHaveAttribute('aria-label', 'Roll for tasks · Lucid: 2 dice, keep high');
		await expect(page.getByTestId('state-chip')).toHaveCount(0);

		await pressStep(page, 'roll-tasks-button');
		await expect(page.getByTestId('result-line')).toHaveText(
			'Rolled 15 (high of 4, 15) · Draw 4 cards',
			{ timeout: 30000 }
		);
		await store(page, 'rnd.resetRNG()');
		await expect(page.getByTestId('roll-modifier')).toHaveCount(0);
		expect((await gameStateOf(page)).isLucid).toBe(false);
	});

	test('the Exit dialog says the game is saved', async ({ page }) => {
		await openGame(page);
		await playToFirstRound(page);
		await page.getByRole('button', { name: 'Exit game' }).click();
		await expect(page.getByText('Leave the game?')).toBeVisible();
		await expect(
			page.getByText('Your progress is saved. Continue it from the home screen.')
		).toBeVisible();
		await page.getByRole('button', { name: 'Keep playing' }).click();
		await expect(page.getByText('Leave the game?')).toHaveCount(0);
	});
});

test.describe('Reduced motion', () => {
	test('shows the roll as a number, with no 3D throw', async ({ page }) => {
		await openGame(page);
		await page.getByTestId('story-continue-button').click();
		await store(page, 'rnd.mockDieRoll(13)');
		// The number is up for 600ms: record it as it appears rather than racing to see it
		await page.evaluate(() => {
			const seen: string[] = [];
			(window as unknown as { staticRollSeen: string[] }).staticRollSeen = seen;
			new MutationObserver(() => {
				const el = document.querySelector('[data-testid="static-roll"]');
				if (el) seen.push(el.textContent?.trim() ?? '');
			}).observe(document.body, { childList: true, subtree: true });
		});
		await pressStep(page, 'initial-damage-button');
		await expect(page.getByTestId('result-line')).toHaveText(
			'Rolled 13 · no Stability lost · 20/20'
		);
		const seen = await page.evaluate(
			() => (window as unknown as { staticRollSeen: string[] }).staticRollSeen
		);
		expect(seen).toContain('13');
		await expect(page.getByTestId('static-roll')).toHaveCount(0);
	});
});
