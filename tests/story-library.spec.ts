import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY } from './helpers';

/**
 * Story Library and story mode (SM-01 to SM-05).
 *
 * Completed games are written straight into IndexedDB through the live store modules (the dev
 * server serves /src), the same way the UX review seeded them: one loss by Kings with written,
 * empty and voice-note rounds, and one escape.
 */

type Plan = {
	slug: string;
	outcome: 'kings' | 'win';
	rounds: { cards: string[]; journal?: string; audio?: boolean }[];
};

const KINGS: Plan = {
	slug: 'future-lost',
	outcome: 'kings',
	rounds: [
		{ cards: ['7', 'Q'], journal: 'The rain came through the roof again.' },
		{ cards: ['K:spades', '4'] },
		{ cards: ['K:hearts', 'K:clubs'], journal: 'Three crowns now.' },
		{ cards: ['K:diamonds'], journal: 'They are all here.' }
	]
};

const WIN: Plan = {
	slug: 'ghost-in-the-machine',
	outcome: 'win',
	rounds: [
		{ cards: ['A:hearts', '2'], journal: 'The code remembered me.' },
		{ cards: ['A:spades', '6'] }
	]
};

async function seed(page: Page, plan: Plan) {
	await page.goto(`/game/${plan.slug}`);
	await page.waitForLoadState('networkidle');
	// The first visit can reload once while Vite optimises dependencies; retry if it does
	for (let attempt = 1; ; attempt++) {
		try {
			await writeSave(page, plan);
			return;
		} catch (error) {
			if (attempt === 3 || !/context was destroyed/.test(String(error))) throw error;
			await page.waitForLoadState('networkidle');
		}
	}
}

async function writeSave(page: Page, plan: Plan) {
	await page.evaluate(async (plan) => {
		const gs = await import('/src/lib/stores/gameStore.svelte.js');
		const st = await import('/src/lib/stores/indexedDBStorage.js');
		for (let i = 0; i < 100 && (gs.gameState.deck?.length ?? 0) < 40; i++) {
			await new Promise((r) => setTimeout(r, 100));
		}
		const g = gs.gameState;
		const deck = [...g.deck];
		const take = (pred: string) => {
			const [rank, suit] = pred.split(':');
			const i = deck.findIndex((c) => c.card === rank && (!suit || c.suit === suit));
			return JSON.parse(JSON.stringify(deck.splice(i, 1)[0]));
		};
		let kings = 0;
		let aces = 0;
		const log = [];
		const journal = [];
		plan.rounds.forEach((r, ri) => {
			const round = ri + 1;
			for (const pred of r.cards) {
				const c = take(pred);
				c.round = round;
				c.gameState = {
					tower: 20,
					tokens: 10,
					kingsRevealed: kings,
					aceOfHeartsRevealed: aces > 0,
					acesRevealed: aces
				};
				if (c.card === 'K') kings++;
				if (c.card === 'A') aces++;
				if (c.card === '7') Object.assign(c, { diceRoll: 4, damageDealt: 2 });
				log.push(c);
			}
			if (r.journal) {
				journal.push({ round, text: r.journal, dateRecorded: new Date().toISOString() });
			}
		});
		Object.assign(g, {
			log,
			journalEntries: journal,
			round: plan.rounds.length,
			kingsRevealed: kings,
			acesRevealed: aces,
			aceOfHeartsRevealed: aces > 0,
			tokens: plan.outcome === 'win' ? 0 : 10,
			tower: 18,
			gameOver: true,
			win: plan.outcome === 'win',
			state: 'gameOver'
		});
		await st.saveGame(g);
	}, plan);
}

async function openLibrary(page: Page) {
	await page.goto('/');
	await page.evaluate((key) => {
		sessionStorage.setItem('splashShown', 'true');
		localStorage.setItem(key, 'true');
	}, INSTRUCTIONS_SEEN_KEY);
	await seed(page, WIN);
	await seed(page, KINGS);
	await page.goto('/?story=1');
	await expect(page.getByRole('heading', { level: 1, name: 'Story Library' })).toBeVisible();
	await expect(page.getByTestId('story-card')).toHaveCount(2);
}

/** The round on screen. While rounds swap, Svelte marks the outgoing one inert. */
const currentRound = (page: Page) => page.locator('[data-testid="story-round"]:not([inert])');

async function openKingsStory(page: Page) {
	await openLibrary(page);
	await page
		.getByTestId('story-card')
		.filter({ hasText: 'fourth King' })
		.locator('.card-open')
		.click();
	await expect(page.getByTestId('story-mode')).toBeVisible();
}

test.describe('Story Library', () => {
	test('cards say how each run ended, with rounds and date', async ({ page }) => {
		await openLibrary(page);

		const kings = page.getByTestId('story-card').filter({ hasText: 'Future Lost' });
		await expect(kings).toContainText('Taken by the fourth King');
		await expect(kings).toContainText('4 rounds');
		const win = page.getByTestId('story-card').filter({ hasText: 'Locked In the Tech District' });
		await expect(win).toContainText('Escaped');
		await expect(win).toContainText('2 rounds');

		await expect(page.getByTestId('story-card').first()).not.toContainText('Tower');
		// The back button shows its chevron (it collapsed to an empty circle on iPhone)
		const chevron = await page
			.getByRole('button', { name: 'Back to menu' })
			.locator('svg')
			.boundingBox();
		expect(chevron?.width).toBeGreaterThanOrEqual(20);
	});

	test('the sort control is sized to its content', async ({ page }) => {
		await openLibrary(page);
		const box = await page.getByLabel('Show').boundingBox();
		expect(box?.width).toBeLessThan(260);
		await page.getByLabel('Show').selectOption('won');
		await expect(page.getByTestId('story-card')).toHaveCount(1);
		await expect(page.getByTestId('story-card')).toContainText('Escaped');
	});

	test('Delete is in an overflow menu and asks first', async ({ page }) => {
		await openLibrary(page);
		const card = page.getByTestId('story-card').filter({ hasText: 'Future Lost' });

		await card.getByRole('button', { name: 'More options for Future Lost' }).click();
		await page.getByRole('menuitem', { name: /Delete story/ }).click();
		const dialog = page.getByRole('dialog');
		await expect(dialog).toContainText('Delete this story?');
		await dialog.getByRole('button', { name: 'Keep it' }).click();
		await expect(page.getByTestId('story-card')).toHaveCount(2);

		await card.getByRole('button', { name: 'More options for Future Lost' }).click();
		await page.getByRole('menuitem', { name: /Delete story/ }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
		await expect(page.getByTestId('story-card')).toHaveCount(1);
		await expect(page.getByRole('status').filter({ hasText: 'Deleted Future Lost' })).toBeVisible();

		// Gone for good: still gone after a reload
		await page.reload();
		await expect(page.getByTestId('story-card')).toHaveCount(1);
	});

	test('Escape closes the overflow menu and gives focus back', async ({ page }) => {
		await openLibrary(page);
		const more = page.getByRole('button', { name: 'More options for Future Lost' });
		await more.focus();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: /Delete story/ })).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('menu')).toHaveCount(0);
		await expect(more).toBeFocused();
	});
});

test.describe('Story mode', () => {
	test('each round leads with the journal entry, cards as chips', async ({ page }) => {
		await openKingsStory(page);
		const round = currentRound(page);

		await expect(round.getByRole('heading', { name: /Round 1/ })).toBeVisible();
		await expect(round).toContainText('The rain came through the roof again.');
		await expect(round.getByRole('button', { name: /7 of .*, Challenge/ })).toHaveAttribute(
			'aria-expanded',
			'false'
		);

		// A chip opens the card's text and its Stability check
		await round.getByRole('button', { name: /7 of .*, Challenge/ }).click();
		await expect(round.getByRole('button', { name: /7 of .*, Challenge/ })).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		await expect(round).toContainText('Stability check: rolled 4 · −2 Stability');

		// The header names the outcome; the stats use the game's words
		await expect(page.getByTestId('story-mode')).toContainText('Taken by the fourth King');
		await expect(round).toContainText('Stability');
		await expect(round).toContainText('Kings');
		await expect(page.getByTestId('story-mode')).not.toContainText(/Tower|Failures/);
	});

	test('a round with no entry shows the card prompts instead', async ({ page }) => {
		await openKingsStory(page);
		await page.getByRole('button', { name: 'Next round' }).click();
		const round = currentRound(page);
		await expect(round.getByRole('heading', { name: /Round 2/ })).toBeVisible();
		await expect(round).toContainText("You didn't write this round. The cards said:");
	});

	test('the last round ends on the outcome with all four Kings counted', async ({ page }) => {
		await openKingsStory(page);
		// Round markers are hidden on phones; Next works everywhere
		for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next round' }).click();
		await expect(page.getByRole('button', { name: 'Next round' })).toBeDisabled();
		const round = currentRound(page);
		await expect(round).toContainText('The end');
		await expect(round).toContainText('4 of 4');
	});

	test('arrow keys turn the page; reduced motion swaps rounds at once', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await openKingsStory(page);
		await page.keyboard.press('ArrowRight');
		// No outgoing copy lingers: the swap is instant
		await expect(page.getByTestId('story-round')).toHaveCount(1);
		await expect(currentRound(page).getByRole('heading')).toContainText('Round 2');
		await page.keyboard.press('ArrowLeft');
		await expect(currentRound(page).getByRole('heading')).toContainText('Round 1');
	});

	test('Escape in the AI settings closes only the dialog (SM-03)', async ({ page }) => {
		await openKingsStory(page);
		await page.getByTestId('ai-summary-button').click();
		await page
			.getByRole('dialog', { name: 'AI summary' })
			.getByRole('button', { name: 'Set up AI' })
			.click();
		const settings = page.getByRole('dialog', { name: 'AI settings' });
		await expect(settings).toBeVisible();

		// Arrow keys in the key field must not change rounds
		await settings.getByLabel('API key').fill('not-a-real-key');
		await settings.getByLabel('API key').press('ArrowRight');
		await page.keyboard.press('Escape');

		await expect(settings).toBeHidden();
		await expect(page.getByTestId('story-mode')).toBeVisible();
		await page.keyboard.press('Escape'); // closes the summary dialog it returned to
		await expect(page.getByRole('dialog')).toHaveCount(0);
		await expect(currentRound(page).getByRole('heading')).toContainText('Round 1');
	});

	test('Test key reports in plain words (SM-02)', async ({ page }) => {
		let status = 401;
		// A mocked Anthropic models endpoint: no real key, no real call
		const cors = {
			'access-control-allow-origin': '*',
			'access-control-allow-headers': '*',
			'access-control-allow-methods': 'GET, POST, OPTIONS'
		};
		await page.route('https://api.anthropic.com/v1/models/**', (route) => {
			if (route.request().method() === 'OPTIONS') {
				return route.fulfill({ status: 204, headers: cors });
			}
			return route.fulfill({
				status,
				contentType: 'application/json',
				headers: cors,
				body: JSON.stringify(
					status === 200
						? { id: 'claude-sonnet-5-5', type: 'model' }
						: { type: 'error', error: { type: 'authentication_error', message: 'invalid key' } }
				)
			});
		});
		await openKingsStory(page);
		await page.getByTestId('ai-summary-button').click();
		await page.getByRole('button', { name: 'Set up AI' }).click();
		const settings = page.getByRole('dialog', { name: 'AI settings' });

		await expect(settings.getByLabel('Model', { exact: true })).toHaveValue('claude-sonnet-5-5');
		const result = settings.locator('#ai-test-result');
		await settings.getByRole('button', { name: 'Test key' }).click();
		await expect(result).toHaveText(/Paste your API key first/);

		await settings.getByLabel('API key').fill('not-a-real-key');
		await settings.getByRole('button', { name: 'Test key' }).click();
		await expect(result).toHaveText(/didn't accept this API key/);

		status = 200;
		await settings.getByRole('button', { name: 'Test key' }).click();
		await expect(result).toHaveText(
			/Key works\. Claude Sonnet 5\.5 is ready to write your story\./
		);
	});
});
