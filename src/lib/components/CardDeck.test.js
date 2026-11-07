/**
 * CardDeck with read-aloud on: the card is read, and nothing moves on under the voice. A card
 * that ends the game (the fourth King) shows the ending only once the voice has finished it, or
 * once the player continues, in which case the voice stops before the staging.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import CardDeck from './CardDeck.svelte';
import { gameState, createRunState } from '../stores/gameStore.svelte.js';
import {
	updateAudioSettings,
	updateGameplaySettings,
	resetSettings,
	stopNarration
} from '../stores/audioStore.svelte.js';
import { installFakeTTS } from '../../test-utils/fakeTTS.js';

// Reduced motion makes the dismiss and the fourth King's staging instant; one test turns it off
const motion = vi.hoisted(() => ({ reduced: true }));
vi.hoisted(() => {
	window.matchMedia = (query) => ({
		matches: query.includes('reduce') && motion.reduced,
		media: query,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {}
	});
});

vi.mock('../stores/indexedDBStorage.js', () => ({
	saveGame: vi.fn(async () => true),
	loadGame: vi.fn(),
	clearSave: vi.fn(),
	restoreGameState: vi.fn()
}));

/** The fourth King, as drawCard() leaves it (a snapshot of the state it was drawn into) */
const fourthKing = () => ({
	card: 'K',
	suit: 'spades',
	type: 'failure-counter',
	description: 'The end',
	story: 'Nothing is left.',
	gameState: { kingsRevealed: 3, acesRevealed: 0, aceOfHeartsRevealed: false }
});
const seven = () => ({
	card: '7',
	suit: 'clubs',
	type: 'challenge',
	description: 'A setback',
	story: 'It costs you.',
	gameState: { kingsRevealed: 3, acesRevealed: 0, aceOfHeartsRevealed: false }
});

async function settle(ms = 0) {
	await new Promise((resolve) => setTimeout(resolve, ms));
	await tick();
}

function show(card, onconfirmcard = vi.fn()) {
	const utils = render(CardDeck, {
		props: { card, animationStage: 'revealed', onconfirmcard, onrequestcard: vi.fn() }
	});
	return { ...utils, onconfirmcard };
}

let fake;

beforeEach(async () => {
	motion.reduced = true;
	localStorage.clear();
	resetSettings();
	fake = await installFakeTTS();
	Object.assign(gameState, createRunState(), {
		state: 'drawCard',
		round: 1,
		kingsRevealed: 3,
		cardsToDraw: 0,
		config: { title: 'Test', labels: {}, options: {}, introduction: '' }
	});
	await updateAudioSettings({ autoReadCards: true });
});

afterEach(() => {
	stopNarration();
	resetSettings();
});

describe('CardDeck, a card read aloud', () => {
	it('with auto-continue, the ending waits for the voice to finish the card, then follows', async () => {
		updateGameplaySettings({ autoContinueAfterReading: true, autoAdvanceDelay: 50 });
		const { onconfirmcard } = show(fourthKing());
		await settle(250);
		expect(fake.spoken).toEqual(['The end. Nothing is left.']);
		expect(onconfirmcard).not.toHaveBeenCalled(); // the voice is still reading

		fake.end();
		await settle(200);
		expect(onconfirmcard).toHaveBeenCalledTimes(1);
	});

	it('without auto-continue, the card waits for the player once the voice is done', async () => {
		const { onconfirmcard } = show(fourthKing());
		await settle(50);
		fake.end();
		await settle(250);
		expect(onconfirmcard).not.toHaveBeenCalled();
	});

	it('a tap mid-reading continues: the voice stops first, then the staging, then the ending', async () => {
		motion.reduced = false;
		const { getByTestId, onconfirmcard } = show(fourthKing());
		await settle(50);
		expect(fake.isSpeaking()).toBe(true);

		await fireEvent.click(getByTestId('card'));
		expect(fake.stops).toBe(1);
		expect(fake.isSpeaking()).toBe(false);
		// The staging (700ms, skulls flaring) plays with the voice already silent
		expect(getByTestId('card').classList.contains('doom')).toBe(true);
		expect(onconfirmcard).not.toHaveBeenCalled();
		await settle(800);
		expect(onconfirmcard).toHaveBeenCalledTimes(1);
	});

	it('a tap past an ordinary card leaves the voice to the next step', async () => {
		const { getByTestId, onconfirmcard } = show(seven());
		await settle(50);
		await fireEvent.click(getByTestId('card'));
		await settle(50);
		expect(onconfirmcard).toHaveBeenCalledTimes(1);
		expect(fake.stops).toBe(0);
		expect(fake.isSpeaking()).toBe(true); // the next card's reading replaces it
	});

	it('leaving the card mid-reading cancels the wait', async () => {
		updateGameplaySettings({ autoContinueAfterReading: true, autoAdvanceDelay: 50 });
		const { unmount, onconfirmcard } = show(fourthKing());
		await settle(50);
		unmount();
		fake.end();
		await settle(200);
		expect(onconfirmcard).not.toHaveBeenCalled();
	});

	it('with read-aloud off nothing changes: auto-continue holds the card for its reading time', async () => {
		await updateAudioSettings({ autoReadCards: false });
		updateGameplaySettings({ autoContinueAfterReading: true });
		const card = { ...fourthKing(), description: 'End', story: '' }; // one word: a 1.56s hold
		const { getByTestId, onconfirmcard } = show(card);
		await settle(50);
		expect(fake.spoken).toEqual([]);
		expect(getByTestId('card-hold')).toBeTruthy();
		expect(onconfirmcard).not.toHaveBeenCalled();
		await settle(1700);
		expect(onconfirmcard).toHaveBeenCalledTimes(1);
	}, 5000);
});
