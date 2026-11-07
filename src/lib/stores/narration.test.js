/**
 * The narration helpers: the game waits for the voice through awaitNarration() (the deal after
 * Roll for Tasks, a card read aloud), and stopNarration() cuts it off and releases the wait.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
	speak,
	awaitNarration,
	stopNarration,
	isNarrating,
	updateAudioSettings,
	resetSettings
} from './audioStore.svelte.js';
import { READ_ALOUD_ON, READ_ALOUD_OFF } from '../utils/playMode.js';
import { installFakeTTS } from '../services/tts/providers/FakeTTSProvider.test.helper.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Track a wait: `value` is undefined until its promise settles */
function track(wait) {
	const seen = { value: undefined };
	wait.promise.then((value) => (seen.value = value));
	return seen;
}

let fake;

beforeEach(async () => {
	localStorage.clear();
	resetSettings();
	fake = await installFakeTTS();
});

afterEach(() => stopNarration());

describe('awaitNarration', () => {
	it('resolves at once when nothing is being read', async () => {
		expect(isNarrating()).toBe(false);
		await expect(awaitNarration().promise).resolves.toBe(true);
	});

	it('waits for the voice to finish, then resolves true', async () => {
		speak('Rolled 17. Draw 5 cards.');
		expect(isNarrating()).toBe(true);
		const wait = track(awaitNarration());
		await flush();
		expect(wait.value).toBeUndefined();

		expect(fake.end()).toBe(true);
		await flush();
		expect(wait.value).toBe(true);
		expect(isNarrating()).toBe(false);
	});

	it('a narration that another takes over from waits for that one too', async () => {
		speak('First');
		const wait = track(awaitNarration());
		speak('Second'); // cuts the first off
		await flush();
		expect(wait.value).toBeUndefined();
		expect(fake.spoken).toEqual(['First', 'Second']);

		fake.end();
		await flush();
		expect(wait.value).toBe(true);
	});

	it('cancel ends only the wait: the voice reads on', async () => {
		speak('A card');
		const narration = awaitNarration();
		const wait = track(narration);
		narration.cancel();
		await flush();
		expect(wait.value).toBe(false);
		expect(fake.isSpeaking()).toBe(true);
		expect(isNarrating()).toBe(true);
	});

	it('does not speak, or wait, on empty text', async () => {
		await speak('');
		expect(fake.spoken).toEqual([]);
		await expect(awaitNarration().promise).resolves.toBe(true);
	});
});

describe('stopNarration', () => {
	it('cuts the voice off and releases every wait at once', async () => {
		speak('A long story');
		const first = track(awaitNarration());
		const second = track(awaitNarration());
		stopNarration();
		expect(fake.stops).toBe(1);
		expect(fake.isSpeaking()).toBe(false);
		expect(isNarrating()).toBe(false);
		await flush();
		expect(first.value).toBe(true);
		expect(second.value).toBe(true);
	});

	it('is harmless when nothing is being read', async () => {
		stopNarration();
		expect(fake.stops).toBe(1);
		await expect(awaitNarration().promise).resolves.toBe(true);
	});
});

describe('switching read-aloud off', () => {
	it('stops a voice mid-sentence', async () => {
		await updateAudioSettings(READ_ALOUD_ON);
		speak('Halfway through');
		const wait = track(awaitNarration());
		await updateAudioSettings(READ_ALOUD_OFF);
		expect(fake.isSpeaking()).toBe(false);
		await flush();
		expect(wait.value).toBe(true);
	});

	it('leaves the voice alone when read-aloud stays on', async () => {
		await updateAudioSettings(READ_ALOUD_ON);
		speak('Still reading');
		await updateAudioSettings({ readingSpeed: 'fast' });
		await updateAudioSettings({ autoReadPrompts: false }); // cards and rolls are still read
		expect(fake.isSpeaking()).toBe(true);
	});
});
