// The card overlay: a drawn card fills most of the viewport, says what it does, can be read
// by a screen reader and continued from the keyboard; the journal lists the round's cards with
// no prompts, keeps its voice note on the footer row and tabs voice note, entry, Record Entry.
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

/**
 * Open Future Lost and go straight to the final log of a run lost to the fourth King: an
 * opening roll, Stability checks, the Ace of Hearts and its Salvation rolls, a quiet round and
 * the four Kings, written into the log the way the game writes them.
 */
async function openFinalLog(page: Page) {
	await page.goto('/game/future-lost');
	await page.evaluate((key) => localStorage.setItem(key, 'true'), INSTRUCTIONS_SEEN_KEY);
	await page.getByTestId('story-continue-button').click();
	await page.evaluate(async () => {
		const storeModule = '/src/lib/stores/gameStore.svelte.js';
		const { gameState: g } = await import(/* @vite-ignore */ storeModule);
		type Card = { card: string; suit: string };
		const snapshot = () => ({
			tower: g.tower,
			tokens: g.tokens,
			kingsRevealed: g.kingsRevealed,
			aceOfHeartsRevealed: g.aceOfHeartsRevealed,
			acesRevealed: g.acesRevealed
		});
		const draw = (rank: string, suit: string, round: number, extra = {}) => {
			const i = g.deck.findIndex((c: Card) => c.card === rank && c.suit === suit);
			const card = g.deck.splice(i, 1)[0];
			const n = g.log.filter((l: { round: number }) => l.round === round).length + 1;
			g.log.push({ ...card, round, id: `${round}.${n}`, gameState: snapshot(), ...extra });
		};
		const salvation = (round: number, roll: number, tokenChange: number) => {
			g.tokens += tokenChange;
			g.log.push({
				type: 'salvation',
				id: `${round}.salvation`,
				round,
				roll,
				threshold: 17,
				tokenChange,
				tokens: g.tokens,
				stabilityChange: 0,
				tower: g.tower
			});
		};
		g.log.push({ type: 'initial-damage', roll: 6, damage: 1, tower: 19, round: 0, id: '0.0' });
		g.tower = 19;
		draw('7', 'hearts', 1, { diceRoll: 4, damageDealt: 2 });
		g.tower = 17;
		draw('A', 'hearts', 1, { diceRoll: 14, damageDealt: 0 });
		g.aceOfHeartsRevealed = true;
		g.acesRevealed = 1;
		salvation(1, 15, 0);
		draw('4', 'clubs', 2);
		salvation(2, 18, -1);
		draw('K', 'spades', 3);
		g.kingsRevealed = 1;
		draw('K', 'hearts', 3);
		g.kingsRevealed = 2;
		draw('9', 'clubs', 3, { diceRoll: 20, damageDealt: 0 });
		g.tower = 18;
		salvation(3, 9, 0);
		draw('K', 'clubs', 4);
		g.kingsRevealed = 3;
		draw('K', 'diamonds', 4);
		g.kingsRevealed = 4;
		Object.assign(g, { round: 4, gameOver: true, win: false, state: 'gameOver' });
	});
	await page.getByTestId('game-over-final-log-button').click();
	const sheet = page.locator('.journal-sheet.final');
	await expect(sheet.getByTestId('journal-save-button')).toBeVisible();
	// The sheet rises 8px over 200ms as it opens: let it settle before anything is measured
	await page.waitForTimeout(300);
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

		await expect(card.getByTestId('card-mechanic')).toHaveText('3 of 4');
	});

	test('a skip-damage card says so on its face, and no Stability check follows', async ({
		page
	}) => {
		const card = await dealCards(
			page,
			['A:skip-damage'],
			'g.aceOfHeartsRevealed = false; g.acesRevealed = 0;'
		);

		await expect(card.getByTestId('card-modifier')).toHaveText('No Stability check for this Ace');
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

	test('the journal focuses the entry on desktop only, and tabs voice note, entry, Record Entry', async ({
		page,
		hasTouch
	}) => {
		const card = await dealCards(page, ['4:hearts'], 'g.aceOfHeartsRevealed = false;');
		await card.press('Enter');
		const sheet = page.locator('.journal-sheet');
		const entry = sheet.locator('textarea');
		await expect(entry).toBeVisible();

		// Desktop: the page is ready to write on. Touch devices: no focus, so the on-screen
		// keyboard does not open by itself over the sheet (owner decision).
		if (hasTouch) {
			await expect(entry).not.toBeFocused();
			await expect(page.getByRole('dialog', { name: 'Journal entry' })).toBeFocused();
		} else {
			await expect(entry).toBeFocused();
		}

		// Tab order on every device: Voice note, the entry, Record Entry (DOM order, no tabindex)
		await entry.focus();
		await page.keyboard.press('Tab');
		await expect(sheet.getByTestId('journal-save-button')).toBeFocused();
		await entry.focus();
		await page.keyboard.press('Shift+Tab');
		await expect(sheet.getByTestId('journal-voice-toggle')).toBeFocused();
		await expect(sheet.locator('[tabindex]:not([tabindex="-1"])')).toHaveCount(0);
	});

	test('the journal keeps the voice note on its footer row, beside Record Entry', async ({
		page
	}) => {
		const card = await dealCards(page, ['4:hearts'], 'g.aceOfHeartsRevealed = false;');
		await card.press('Enter');

		const sheet = page.locator('.journal-sheet');
		const voice = sheet.getByTestId('journal-voice-toggle');
		const save = sheet.getByTestId('journal-save-button');
		await expect(voice).toBeVisible();
		await expect(save).toBeVisible();

		// One row under the entry: the voice note on the left, Record Entry on the right
		const [voiceBox, saveBox, entryBox] = await Promise.all(
			[voice, save, sheet.locator('textarea')].map((l) => l.boundingBox())
		);
		expect(voiceBox!.y).toBeGreaterThanOrEqual(entryBox!.y + entryBox!.height);
		expect(
			Math.abs(voiceBox!.y + voiceBox!.height / 2 - (saveBox!.y + saveBox!.height / 2))
		).toBeLessThan(8);
		expect(voiceBox!.x + voiceBox!.width).toBeLessThanOrEqual(saveBox!.x);
		await expect(sheet.locator('.voice-slot')).toHaveCount(1);
	});

	test('the journal lists every card of the round, with no prompts; on phones a long list scrolls inside itself', async ({
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

		// All six cards. On small screens (phones, and windows up to 760px tall) the list is capped
		// and scrolls inside itself, so the writing keeps its room; on larger screens it is as tall
		// as its cards and every one is on screen.
		const items = sheet.locator('.round-list li');
		await expect(items).toHaveCount(6);
		const list = await sheet.locator('.round-list').evaluate((el) => ({
			scroll: el.scrollHeight,
			client: el.clientHeight,
			overflowY: getComputedStyle(el).overflowY
		}));
		if (list.overflowY === 'auto') {
			expect(list.overflowY).toBe('auto');
			expect(list.scroll).toBeGreaterThan(list.client + 1);
			await items.last().scrollIntoViewIfNeeded();
			await expect(items.last()).toBeInViewport();
		} else {
			expect(list.scroll).toBeLessThanOrEqual(list.client + 1);
			for (const item of await items.all()) await expect(item).toBeInViewport();
		}
		// The sheet itself never scrolls: every part of it sits inside its box
		const overflow = await sheet.evaluate((el) => {
			const box = el.getBoundingClientRect();
			const pad = parseFloat(getComputedStyle(el).paddingBottom);
			return Math.max(
				...[...el.children].map(
					(child) => child.getBoundingClientRect().bottom - (box.bottom - pad)
				)
			);
		});
		expect(overflow).toBeLessThanOrEqual(1);

		// The writing keeps at least four lines, and Record Entry stays on screen
		const lines = await sheet.locator('textarea').evaluate((el) => {
			const cs = getComputedStyle(el);
			const inner = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
			return inner / parseFloat(cs.lineHeight);
		});
		expect(lines).toBeGreaterThanOrEqual(4);
		await expect(sheet.getByTestId('journal-save-button')).toBeInViewport();
	});

	test('the final log shows the run as a timeline: one block per round, the events in order', async ({
		page
	}) => {
		const sheet = await openFinalLog(page);
		const narrow = page.viewportSize()!.width < 768;
		if (narrow) await sheet.getByTestId('journal-view-timeline').click();

		const timeline = sheet.getByTestId('game-timeline');
		await expect(timeline).toBeVisible();
		const rounds = timeline.locator('.tl-round');
		await expect(rounds).toHaveCount(5);
		await expect(rounds.locator('.tl-title')).toHaveText([
			'Opening',
			'Round 1',
			'Round 2',
			'Round 3',
			'Round 4'
		]);

		// The opening roll, a check with its loss and Stability after, the Ace and its target
		await expect(rounds.nth(0)).toContainText('Instability · rolled 6 · −1 Stability · 19/20');
		await expect(rounds.nth(1)).toContainText(/7♥.? · rolled 4 · −2 Stability · 17\/20/);
		await expect(rounds.nth(1)).toContainText(/A♥.? · Salvation unlocked · roll 17\+/);
		await expect(rounds.nth(1)).toContainText('Salvation · rolled 15 · missed 17+ · 10 left');
		// An even card is no event; the round's Salvation roll is
		await expect(rounds.nth(2)).not.toContainText(/4♣/);
		await expect(rounds.nth(2)).toContainText('Salvation · rolled 18 · −1 token · 9 left');
		// Kings count out; a natural 20 is Lucid; the ending closes the last round
		await expect(rounds.nth(3)).toContainText(/K♠.? · 1 of 4 Kings/);
		await expect(rounds.nth(3)).toContainText(/9♣.? · rolled 20 · \+1 Stability · 18\/20 · Lucid/);
		await expect(rounds.nth(4)).toContainText(/K♦.? · 4 of 4 Kings/);
		await expect(rounds.nth(4)).toContainText('The end · The fourth King was revealed.');
		// No recap badges any more
		await expect(sheet.getByTestId('run-recap')).toHaveCount(0);

		// The timeline scrolls inside itself, never the sheet
		const scroll = sheet.locator('.timeline-scroll');
		expect(await scroll.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
		expect(await sheet.evaluate((el) => getComputedStyle(el).overflowY)).toBe('hidden');
	});

	test('a quiet round in the timeline says so', async ({ page }) => {
		await page.goto('/game/future-lost');
		await page.evaluate((key) => localStorage.setItem(key, 'true'), INSTRUCTIONS_SEEN_KEY);
		await page.getByTestId('story-continue-button').click();
		await page.evaluate(async () => {
			const storeModule = '/src/lib/stores/gameStore.svelte.js';
			const { gameState: g } = await import(/* @vite-ignore */ storeModule);
			const i = g.deck.findIndex((c: { card: string }) => c.card === '4');
			g.log.push({ ...g.deck.splice(i, 1)[0], round: 1, id: '1.1', gameState: { tower: 20 } });
			Object.assign(g, { round: 2, gameOver: true, win: false, tower: 0, state: 'gameOver' });
		});
		await page.getByTestId('game-over-final-log-button').click();
		const sheet = page.locator('.journal-sheet.final');
		if (page.viewportSize()!.width < 768) await sheet.getByTestId('journal-view-timeline').click();
		const rounds = sheet.locator('.tl-round');
		await expect(rounds.nth(0)).toContainText('Nothing of note');
		await expect(rounds.nth(1)).toContainText('The end · Your Stability reached 0.');
	});

	test('from 768px the timeline sits beside the writing; on phones a switch shows one at a time', async ({
		page
	}) => {
		const sheet = await openFinalLog(page);
		const timeline = sheet.locator('.timeline-pane');
		const writing = sheet.locator('.writing');
		const entry = sheet.locator('textarea');
		const save = sheet.getByTestId('journal-save-button');
		const toggle = sheet.getByTestId('journal-view-timeline');
		await expect(save).toHaveText('Record final log');

		if (page.viewportSize()!.width >= 768) {
			// Desktop and tablet: both panes on screen, the timeline on the left
			await expect(sheet.locator('.view-switch')).toBeHidden();
			await expect(timeline).toBeVisible();
			await expect(entry).toBeVisible();
			const [t, w] = await Promise.all([timeline.boundingBox(), writing.boundingBox()]);
			expect(t!.x + t!.width).toBeLessThanOrEqual(w!.x);
			expect(Math.abs(t!.y - w!.y)).toBeLessThan(4);
			await expect(save).toBeInViewport();
			return;
		}

		// Phones: the writing by default, the whole sheet to each view, the footer pinned
		await expect(sheet.getByTestId('journal-view-entry')).toHaveAttribute('aria-pressed', 'true');
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');
		await expect(entry).toBeVisible();
		await expect(timeline).toBeHidden();
		const entryBox = (await entry.boundingBox())!;

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect(timeline).toBeVisible();
		await expect(entry).toBeHidden();
		const timelineBox = (await timeline.boundingBox())!;
		expect(Math.abs(timelineBox.y - entryBox.y)).toBeLessThan(4);
		expect(Math.abs(timelineBox.height - entryBox.height)).toBeLessThan(4);
		await expect(save).toBeInViewport();
		await expect(sheet.getByTestId('journal-voice-toggle')).toBeInViewport();

		await sheet.getByTestId('journal-view-entry').click();
		await expect(entry).toBeVisible();
		await expect(timeline).toBeHidden();
	});

	test('the final log tabs voice note, entry, Record final log, with the timeline before them', async ({
		page
	}) => {
		const sheet = await openFinalLog(page);
		const entry = sheet.locator('textarea');
		await entry.focus();
		await page.keyboard.press('Tab');
		await expect(sheet.getByTestId('journal-save-button')).toBeFocused();
		await entry.focus();
		await page.keyboard.press('Shift+Tab');
		await expect(sheet.getByTestId('journal-voice-toggle')).toBeFocused();
		const before = await sheet.evaluate((el) => {
			const timeline = el.querySelector('.timeline-pane')!;
			const voice = el.querySelector('[data-testid="journal-voice-toggle"]')!;
			return !!(timeline.compareDocumentPosition(voice) & Node.DOCUMENT_POSITION_FOLLOWING);
		});
		expect(before).toBe(true);
	});
});
