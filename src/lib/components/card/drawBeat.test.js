/**
 * The beat before the next card (OWN-7): the card is drawn once, after the beat, or at once on
 * a tap or Space during it; never twice, and not at all once the round has moved on.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createDrawBeat } from './drawBeat.js';
import { ANIMATION_DURATION } from '../../constants/animations.js';

const MS = ANIMATION_DURATION.DRAW_PAUSE;

describe('createDrawBeat', () => {
	let draw;
	let open;
	let beat;

	beforeEach(() => {
		vi.useFakeTimers();
		draw = vi.fn();
		open = true;
		beat = createDrawBeat({ draw, canDraw: () => open, ms: MS });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('is a deliberate pause, longer than the old 100ms', () => {
		expect(MS).toBeGreaterThanOrEqual(400);
		expect(MS).toBeLessThanOrEqual(ANIMATION_DURATION.SEQUENCE_MAX);
	});

	it('draws nothing before the beat runs out, then draws once', () => {
		beat.schedule();
		expect(beat.pending).toBe(true);
		vi.advanceTimersByTime(MS - 1);
		expect(draw).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(draw).toHaveBeenCalledTimes(1);
		expect(beat.pending).toBe(false);
		vi.advanceTimersByTime(MS * 3);
		expect(draw).toHaveBeenCalledTimes(1);
	});

	it('an input during the beat draws at once, and the beat does not draw again', () => {
		beat.schedule();
		vi.advanceTimersByTime(MS / 2);
		beat.now();
		expect(draw).toHaveBeenCalledTimes(1);
		expect(beat.pending).toBe(false);
		vi.advanceTimersByTime(MS * 3);
		expect(draw).toHaveBeenCalledTimes(1);
	});

	it('scheduling again restarts the beat rather than adding a second draw', () => {
		beat.schedule();
		vi.advanceTimersByTime(MS / 2);
		beat.schedule();
		vi.advanceTimersByTime(MS - 1);
		expect(draw).not.toHaveBeenCalled();
		vi.advanceTimersByTime(1);
		expect(draw).toHaveBeenCalledTimes(1);
	});

	it('drops the draw if the round moved on during the beat, or the beat was cancelled', () => {
		beat.schedule();
		open = false;
		vi.advanceTimersByTime(MS);
		expect(draw).not.toHaveBeenCalled();

		open = true;
		beat.schedule();
		beat.cancel();
		vi.advanceTimersByTime(MS);
		expect(draw).not.toHaveBeenCalled();
	});
});
