// The card overlay: a drawn card says what it does, can be read by a screen reader and
// continued from the keyboard, and the journal keeps its voice note on the footer row.
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

test.describe('Card overlay', () => {
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
});
