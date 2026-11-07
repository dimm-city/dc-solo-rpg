/**
 * Supertonic synthesizes the whole text first, then plays it. A stop() while it is still
 * synthesizing (the player moved on, or read-aloud went off) must leave nothing to play later.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('onnxruntime-web', () => ({
	Tensor: class {},
	InferenceSession: { create: vi.fn() },
	env: { wasm: {} }
}));

import { SupertonicTTSProvider } from './SupertonicTTSProvider.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A provider that is "initialized", with the model and the audio output stubbed */
function ready() {
	const provider = new SupertonicTTSProvider();
	provider.isInitialized = true;
	provider.sampleRate = 44100;
	provider.styles = { F1: {} };
	const pending = [];
	provider.ttsInstance = {
		call: vi.fn(() => new Promise((resolve) => pending.push(resolve)))
	};
	provider._playAudio = vi.fn(async () => {});
	/** The synthesis of the n-th speak() finishes */
	const synthesized = (n = 0) => pending[n]({ wav: [0, 0, 0], duration: [0.1] });
	return { provider, synthesized };
}

describe('SupertonicTTSProvider.speak', () => {
	it('plays what it synthesized', async () => {
		const { provider, synthesized } = ready();
		const speaking = provider.speak('Hello');
		await flush();
		expect(provider.isSpeaking()).toBe(true);
		synthesized();
		await speaking;
		expect(provider._playAudio).toHaveBeenCalledTimes(1);
		expect(provider.isPlaying).toBe(false);
	});

	it('plays nothing when stopped during synthesis', async () => {
		const { provider, synthesized } = ready();
		const speaking = provider.speak('Hello');
		await flush();
		provider.stop();
		synthesized();
		await speaking;
		expect(provider._playAudio).not.toHaveBeenCalled();
		expect(provider.isSpeaking()).toBe(false);
	});

	it('a newer speak() during synthesis supersedes the older one', async () => {
		const { provider, synthesized } = ready();
		const first = provider.speak('First');
		await flush();
		const second = provider.speak('Second');
		await flush();
		synthesized(0);
		await first;
		expect(provider._playAudio).not.toHaveBeenCalled();
		synthesized(1);
		await second;
		expect(provider._playAudio).toHaveBeenCalledTimes(1);
	});
});
