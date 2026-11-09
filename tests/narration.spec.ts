// Read-aloud timing: with the roll announced, the first card of the round waits until the voice
// has finished the result ("You rolled a 17. Draw 5 cards."); a press deals at once. The card
// that ends the game (the fourth King) shows the ending only once its reading has ended, or once
// the player continues, in which case the voice stops first.
//
// speechSynthesis is stubbed: utterances start at once and end only on command
// (`window.__tts.end()`), so the test decides when the voice falls silent.

import { test, expect, type Page } from '@playwright/test';
import { INSTRUCTIONS_SEEN_KEY, RULE_TIPS_KEY, pressStep } from './helpers';

test.describe.configure({ timeout: 60000 });

const SLUG = 'ghost-in-the-machine';
const GAME_STORE = '/src/lib/stores/gameStore.svelte.js';
const RANDOM = '/src/lib/services/random.js';

type Settings = { autoContinue?: boolean };

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

/** What the stubbed voice has been asked to read, and what cut it off */
const ttsLog = (page: Page) =>
	page.evaluate(() => (window as unknown as { __tts: { log: string[] } }).__tts.log);
/** The voice reaches the end of what it is reading (false when it was silent) */
const endUtterance = (page: Page) =>
	page.evaluate(() => (window as unknown as { __tts: { end: () => boolean } }).__tts.end());
const isSpeaking = (page: Page) => page.evaluate(() => window.speechSynthesis.speaking);

/**
 * Open the game with read-aloud on (cards and rolls), a stubbed speechSynthesis, and
 * auto-continue as asked (auto-roll stays off: the tests press the roll buttons themselves).
 */
async function openGame(page: Page, { autoContinue = false }: Settings = {}) {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.addInitScript(
		({ seenKey, tipsKey, autoContinue }) => {
			sessionStorage.setItem('splashShown', 'true');
			localStorage.setItem(seenKey, 'true');
			localStorage.setItem(tipsKey, 'false');
			localStorage.setItem(
				'dc-solo-rpg-audio-settings',
				JSON.stringify({
					audio: {
						autoReadCards: true,
						autoReadPrompts: false,
						autoAnnounceRolls: true,
						readingSpeed: 'normal',
						ttsProvider: 'browser',
						providerSettings: { browser: { voice: null } }
					},
					gameplay: {
						autoRollDice: false,
						autoContinueAfterReading: autoContinue,
						autoAdvanceDelay: 500,
						autoHandleJournaling: 'manual',
						journalPauseTime: 10000
					}
				})
			);

			// A speechSynthesis whose utterances end on command
			type Utterance = {
				text: string;
				onend: ((e: object) => void) | null;
				onerror: ((e: object) => void) | null;
			};
			const tts = { log: [] as string[], current: null as Utterance | null, end: () => false };
			(window as unknown as { __tts: typeof tts }).__tts = tts;
			class StubUtterance {
				text: string;
				onend: ((e: object) => void) | null = null;
				onerror: ((e: object) => void) | null = null;
				onstart: ((e: object) => void) | null = null;
				constructor(text: string) {
					this.text = text;
				}
			}
			(window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
				StubUtterance;
			const synth = {
				speaking: false,
				paused: false,
				pending: false,
				getVoices: () => [{ name: 'Stub', voiceURI: 'stub', lang: 'en-US', default: true }],
				addEventListener() {},
				removeEventListener() {},
				speak(utterance: Utterance) {
					tts.log.push(`speak: ${utterance.text}`);
					tts.current = utterance;
					synth.speaking = true;
				},
				cancel() {
					const utterance = tts.current;
					if (!utterance) return;
					tts.log.push(`cancel: ${utterance.text}`);
					tts.current = null;
					synth.speaking = false;
					setTimeout(() => utterance.onerror?.({ error: 'interrupted' }), 0);
				},
				pause() {},
				resume() {}
			};
			tts.end = () => {
				const utterance = tts.current;
				if (!utterance) return false;
				tts.log.push(`end: ${utterance.text}`);
				tts.current = null;
				synth.speaking = false;
				utterance.onend?.({});
				return true;
			};
			Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
		},
		{ seenKey: INSTRUCTIONS_SEEN_KEY, tipsKey: RULE_TIPS_KEY, autoContinue }
	);
	await page.goto(`/game/${SLUG}`);
	await expect(page.getByTestId('screen-showIntro')).toBeVisible({ timeout: 30000 });
	await store(page, 'rnd.mockDieRoll(13)');
	// With auto-continue on the intro moves on by itself; otherwise click through it
	await page
		.getByTestId('story-continue-button')
		.click({ timeout: 3000 })
		.catch(() => {});
	await pressStep(page, 'initial-damage-button');
	await expect(page.getByTestId('roll-tasks-button')).toBeVisible({ timeout: 30000 });
	await expect(page.getByRole('heading', { name: 'Round 1' })).toBeVisible();
}

/** Three Kings out, the fourth on top of the deck; a roll of 3 deals two cards */
async function stackFourthKing(page: Page) {
	await store(
		page,
		`const deck = gs.gameState.deck;
		deck.push(deck.splice(deck.findIndex((c) => c.card === 'K'), 1)[0]);
		Object.assign(gs.gameState, { kingsRevealed: 3, kingOfHearts: true, kingOfSpades: true, kingOfClubs: true });
		rnd.mockDieRoll(3)`
	);
}

/** Roll for tasks, let the voice finish the roll, and wait for the first card */
async function dealToFirstCard(page: Page) {
	await pressStep(page, 'roll-tasks-button');
	await expect(page.getByTestId('result-line')).toHaveText('Rolled 3 · 2 cards this round', {
		timeout: 30000
	});
	await expect.poll(() => isSpeaking(page)).toBe(true);
	await endUtterance(page);
	const card = page.getByTestId('card');
	await expect(card).toHaveClass(/revealed/, { timeout: 10000 });
	await expect(page.getByTestId('card-mechanic')).toHaveText('4 of 4');
	await expect.poll(() => isSpeaking(page)).toBe(true); // the card is being read
	return card;
}

test.describe('Read-aloud: the deal waits for the voice', () => {
	test.afterEach(async ({ page }) => {
		await store(page, 'rnd.resetRNG()').catch(() => {});
	});

	test('the first card is drawn only once the roll has been read out, then after a beat', async ({
		page
	}) => {
		await openGame(page);
		await store(page, 'rnd.mockDieRoll(17)');
		await pressStep(page, 'roll-tasks-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 17 · 5 cards this round', {
			timeout: 30000
		});
		await expect.poll(() => ttsLog(page)).toContain('speak: You rolled a 17. Draw 5 cards.');

		// Well past the 3s deal hold: the voice is still reading, so no card yet, and the
		// button's line waits in full rather than counting down
		const line = page.getByTestId('step-advance');
		await expect(line).toHaveClass(/waiting/);
		await page.waitForTimeout(4000);
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toHaveCount(0);
		await expect(line).toHaveClass(/waiting/);
		await expect(line).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');

		// Timed in the page, frame by frame: a toBeVisible poll's back-off (…, 850ms, 1850ms) would
		// round a card that came 1.1s after the voice up to about 1.9s
		const dealt = await page.evaluate(
			() =>
				new Promise<{ ended: boolean; ms: number }>((resolve) => {
					const ended = (window as unknown as { __tts: { end: () => boolean } }).__tts.end();
					const t0 = performance.now();
					const frame = () => {
						if (document.querySelector('[role="dialog"][aria-label="Card drawn"]')) {
							resolve({ ended, ms: performance.now() - t0 });
						} else if (performance.now() - t0 > 5000) {
							resolve({ ended, ms: Infinity });
						} else requestAnimationFrame(frame);
					};
					requestAnimationFrame(frame);
				})
		);
		expect(dealt.ended).toBe(true);
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toBeVisible();
		// The 1s deal beat (DEAL_BEAT) after the voice, not another 3s hold, and never sooner
		expect(dealt.ms).toBeGreaterThanOrEqual(950);
		expect(dealt.ms).toBeLessThan(2000);
	});

	test('a press during the reading deals at once', async ({ page }) => {
		await openGame(page);
		await store(page, 'rnd.mockDieRoll(17)');
		await pressStep(page, 'roll-tasks-button');
		await expect(page.getByTestId('result-line')).toHaveText('Rolled 17 · 5 cards this round', {
			timeout: 30000
		});
		await expect(page.getByTestId('step-advance')).toHaveClass(/waiting/);

		await pressStep(page, 'roll-tasks-button');
		await expect(page.getByRole('dialog', { name: 'Card drawn' })).toBeVisible();
		// The first card's reading replaces the roll's
		await expect
			.poll(() => ttsLog(page))
			.toContainEqual(expect.stringMatching(/^cancel: You rolled a 17/));
	});
});

test.describe('Read-aloud: the ending waits for the card', () => {
	test.afterEach(async ({ page }) => {
		await store(page, 'rnd.resetRNG()').catch(() => {});
	});

	test('with auto-continue, Game Over comes only once the fourth King has been read', async ({
		page
	}) => {
		await openGame(page, { autoContinue: true });
		await stackFourthKing(page);
		await dealToFirstCard(page);

		await page.waitForTimeout(3000); // the voice is still reading: nothing moves on
		await expect(page.getByTestId('screen-gameOver')).toHaveCount(0);
		await expect(page.getByTestId('card')).toHaveClass(/revealed/);

		expect(await endUtterance(page)).toBe(true);
		await expect(page.getByTestId('screen-gameOver')).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('heading', { name: 'Game Over' })).toBeVisible();
	});

	test('without auto-continue, the fourth King waits for the player after its reading', async ({
		page
	}) => {
		await openGame(page);
		await stackFourthKing(page);
		const card = await dealToFirstCard(page);
		expect(await endUtterance(page)).toBe(true);
		await page.waitForTimeout(1500);
		await expect(page.getByTestId('screen-gameOver')).toHaveCount(0);
		await expect(card).toHaveClass(/revealed/);

		await card.click();
		await expect(page.getByTestId('screen-gameOver')).toBeVisible({ timeout: 5000 });
	});

	test('a tap mid-reading continues: the voice stops, then the ending', async ({ page }) => {
		await openGame(page);
		await stackFourthKing(page);
		const card = await dealToFirstCard(page);

		await card.click();
		await expect(page.getByTestId('screen-gameOver')).toBeVisible({ timeout: 5000 });
		expect(await isSpeaking(page)).toBe(false);
		const log = await ttsLog(page);
		expect(log.at(-1)).toMatch(/^cancel: /);
	});
});
