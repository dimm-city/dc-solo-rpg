// The card overlay: a drawn card fills most of the viewport, says what it does, can be read
// by a screen reader and continued from the keyboard; the journal lists the round's cards with
// no prompts and keeps its voice note on the footer row.
//
// The deck is stacked through the app's own store module (dev server), so each test draws a
// known card without playing rounds to reach it.

import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY } from './helpers';

/** Open Future Lost, leave the intro, then deal the given cards (top of the deck first) */
async function dealCards(page: Page, picks: string[], setup = '') {
	await page.goto('/game/future-lost');
	await page.evaluate((key) => localStorage.setItem(key, 'true'), INSTRUCTIONS_SEEN_KEY);
	await page.getByTestId('story-continue-button').click();
	await page.evaluate(
		async ({ picks, setup }) => {
			const storeModule = '/src/lib/stores/gameStore.svelte.js';
			const { gameState: g } = await import(/* @vite-ignore */ storeModule);
			const cards = picks.map((pick) => {
				const [rank, suitOrModifier] = pick.split(':');
				const i = g.deck.findIndex((c: { card: string; suit: string; modifier?: string }) =>
					suitOrModifier.includes('-')
						? c.modifier === suitOrModifier
						: c.card === rank && c.suit === suitOrModifier
				);
				return g.deck.splice(i, 1)[0];
			});
			for (const card of cards.reverse()) g.deck.push(card);
			new Function('g', setup)(g);
			g.round = 1;
			g.cardsToDraw = picks.length;
			g.state = 'drawCard';
		},
		{ picks, setup }
	);
	const card = page.getByTestId('card');
	await expect(card).toHaveClass(/revealed/);
	return card;
}

/** Open Future Lost and go straight to round 3's journal, with these ranks drawn in the round */
async function openJournal(page: Page, ranks: string[]) {
	await page.goto('/game/future-lost');
	await page.evaluate((key) => localStorage.setItem(key, 'true'), INSTRUCTIONS_SEEN_KEY);
	await page.getByTestId('story-continue-button').click();
	await page.evaluate(async (ranks) => {
		const storeModule = '/src/lib/stores/gameStore.svelte.js';
		const { gameState: g } = await import(/* @vite-ignore */ storeModule);
		g.round = 3;
		ranks.forEach((rank, i) => {
			const index = g.deck.findIndex((c: { card: string }) => c.card === rank);
			g.log.push({ ...g.deck.splice(index, 1)[0], round: 3, id: `3.${i + 1}` });
		});
		g.state = 'log';
	}, ranks);
	const sheet = page.locator('.journal-sheet');
	await expect(sheet.getByTestId('journal-save-button')).toBeVisible();
	return sheet;
}

test.describe('Card overlay', () => {
	test('the card fills most of the viewport, under the progress line', async ({ page }) => {
		const card = await dealCards(page, ['7:spades']);
		const viewport = page.viewportSize()!;
		const box = (await card.boundingBox())!;

		// Phones: 92vw wide and 90% tall; desktop and tablet: a tall portrait card of 85%
		const phone = viewport.width <= 600;
		expect(box.height / viewport.height).toBeGreaterThanOrEqual(phone ? 0.88 : 0.84);
		expect(box.height / viewport.height).toBeLessThanOrEqual(0.92);
		if (phone) {
			expect(box.width / viewport.width).toBeGreaterThanOrEqual(0.9);
		} else {
			expect(box.width).toBeLessThanOrEqual(580);
			expect(box.height).toBeGreaterThan(box.width);
		}
		expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);

		// The progress line stays at the top, just above the card
		const progress = (await page.getByTestId('card-progress').boundingBox())!;
		await expect(page.getByTestId('card-progress')).toHaveText(/Round 1\s*·\s*Card 1 of 1/);
		expect(progress.y).toBeGreaterThanOrEqual(0);
		expect(progress.y + progress.height).toBeLessThanOrEqual(box.y);
	});

	test('only the story scrolls: header, headline and footer stay pinned', async ({ page }) => {
		// The longest story in the deck, with a modifier note and a mechanic note
		const card = await dealCards(page, ['A:hearts'], 'g.aceOfHeartsRevealed = false;');
		const layout = await card.evaluate((el) => {
			const rect = (selector: string) => el.querySelector(selector)!.getBoundingClientRect();
			const story = el.querySelector('.story-scroll')!;
			const cardBox = el.getBoundingClientRect();
			return {
				cardScrolls: el.scrollHeight > el.clientHeight + 1,
				storyOverflow: getComputedStyle(story).overflowY,
				storyScrolls: story.scrollHeight > story.clientHeight + 1,
				headInside: rect('.card-head').top >= cardBox.top,
				headlineAboveStory: rect('.byte-data').bottom <= rect('.story-scroll').top,
				footBelowStory: rect('.card-foot').top >= rect('.story-scroll').bottom,
				footInside: rect('.card-foot').bottom <= cardBox.bottom
			};
		});
		expect(layout.cardScrolls).toBe(false);
		expect(layout.storyOverflow).toBe('auto');
		expect(layout.headInside && layout.headlineAboveStory).toBe(true);
		expect(layout.footBelowStory && layout.footInside).toBe(true);
		// On a phone this story is longer than the card's body, so the story itself scrolls
		if (page.viewportSize()!.width <= 600) expect(layout.storyScrolls).toBe(true);
	});

	test('an odd card says a Stability check follows, and where it sits in the round', async ({
		page
	}) => {
		const card = await dealCards(page, ['7:spades', '4:hearts']);

		await expect(page.getByTestId('card-progress')).toHaveText(/Round 1\s*·\s*Card 1 of 2/);
		await expect(card.getByTestId('card-mechanic')).toHaveText('Odd · a Stability check follows');
		// No more BYTE ids in the footer
		await expect(card).not.toContainText('BYTE-');
	});

	test('a King counts the Kings out, including itself', async ({ page }) => {
		const card = await dealCards(page, ['K:clubs'], 'g.kingsRevealed = 2;');

		await expect(card.getByTestId('card-mechanic')).toHaveText('King · 3 of 4');
	});

	test('a skip-damage card says so on its face, and no Stability check follows', async ({
		page
	}) => {
		const card = await dealCards(
			page,
			['A:skip-damage'],
			'g.aceOfHeartsRevealed = false; g.acesRevealed = 0;'
		);

		await expect(card.getByTestId('card-modifier')).toHaveText('No Stability check this time');
		await expect(card.getByTestId('card-mechanic')).not.toContainText('Stability check');

		await card.press('Enter');
		await expect(page.getByTestId('journal-save-button')).toBeVisible();
		await expect(page.getByTestId('screen-failureCheck')).toHaveCount(0);
	});

	test('the card is named by its content, takes focus and continues on Enter', async ({ page }) => {
		const card = await dealCards(page, ['7:spades']);

		await expect(card).toBeFocused();
		await expect(card).toHaveAttribute('role', 'button');
		const name = await card.evaluate((el) =>
			(el.getAttribute('aria-labelledby') ?? '')
				.split(' ')
				.map((id) => document.getElementById(id)?.textContent?.trim())
				.join(' ')
		);
		expect(name).toContain('7 of Spades, Challenge');
		expect(name).not.toBe('Continue');
		await expect(card).toHaveAccessibleDescription(/Press Enter to continue/);

		await page.keyboard.press('Enter');
		await expect(page.getByTestId('screen-failureCheck')).toBeVisible();
	});

	test('the journal keeps the voice note on its footer row, beside Record Entry', async ({
		page
	}) => {
		const card = await dealCards(page, ['4:hearts'], 'g.aceOfHeartsRevealed = false;');
		await card.press('Enter');

		const footer = page.locator('.sheet-actions');
		await expect(footer.getByTestId('journal-voice-toggle')).toBeVisible();
		await expect(footer.getByTestId('journal-save-button')).toBeVisible();
		await expect(page.locator('.sheet-body').getByTestId('voice-note')).toHaveCount(0);
	});

	test('the journal lists every card of the round, with no prompts and no inner scroller', async ({
		page
	}) => {
		const sheet = await openJournal(page, ['7', '4', 'K', 'J', '9', '2']);

		// No prompt chips, and no prompt in the page either
		await expect(sheet.locator('.chip')).toHaveCount(0);
		await expect(sheet.getByRole('group', { name: 'Prompts to reflect on' })).toHaveCount(0);
		await expect(sheet.locator('textarea')).toHaveAttribute(
			'placeholder',
			'Write about this round'
		);

		// All six cards, in a list as tall as its cards, every one of them on screen
		const items = sheet.locator('.round-list li');
		await expect(items).toHaveCount(6);
		const list = await sheet
			.locator('.round-list')
			.evaluate((el) => ({ scroll: el.scrollHeight, client: el.clientHeight }));
		expect(list.scroll).toBeLessThanOrEqual(list.client + 1);
		for (const item of await items.all()) await expect(item).toBeInViewport();

		// The writing keeps at least four lines, and Record Entry stays on screen
		const lines = await sheet.locator('textarea').evaluate((el) => {
			const cs = getComputedStyle(el);
			const inner = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
			return inner / parseFloat(cs.lineHeight);
		});
		expect(lines).toBeGreaterThanOrEqual(4);
		await expect(sheet.getByTestId('journal-save-button')).toBeInViewport();
	});
});
