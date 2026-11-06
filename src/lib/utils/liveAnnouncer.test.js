import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAnnouncer } from './liveAnnouncer.js';

describe('createAnnouncer', () => {
	let delivered;
	let announcer;
	beforeEach(() => {
		vi.useFakeTimers();
		delivered = [];
		announcer = createAnnouncer((message) => delivered.push(message), { gapMs: 1000 });
	});
	afterEach(() => vi.useRealTimers());

	it('delivers a message on the next tick', async () => {
		announcer.announce('Rolled 17 · Draw 5 cards');
		expect(delivered).toEqual([]);
		await vi.advanceTimersByTimeAsync(0);
		expect(delivered).toEqual(['Rolled 17 · Draw 5 cards']);
	});

	it('puts the result line first and the caption a second after it', async () => {
		// Fired in the same tick, caption first
		announcer.announce('Lucid. Your next roll uses two dice and keeps the higher.');
		announcer.announce('Natural 20 · Draw 6 cards', { first: true });
		await vi.advanceTimersByTimeAsync(0);
		expect(delivered).toEqual(['Natural 20 · Draw 6 cards']);
		await vi.advanceTimersByTimeAsync(999);
		expect(delivered).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(delivered.at(-1)).toBe('Lucid. Your next roll uses two dice and keeps the higher.');
	});

	it('ignores empty messages and drops undelivered ones on clear', async () => {
		announcer.announce('');
		announcer.announce('A');
		announcer.announce('B');
		await vi.advanceTimersByTimeAsync(0);
		announcer.clear();
		await vi.advanceTimersByTimeAsync(5000);
		expect(delivered).toEqual(['A']);
	});
});
