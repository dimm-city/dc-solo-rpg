/**
 * createResultHold - a roll's result stays up for one beat, then the game moves on by itself
 *
 * The step composables start a hold once a result is on screen (the deal after Roll for Tasks,
 * a Stability check, Salvation). A press moves on at once instead (the composable cancels the
 * hold). Results that end the game never start one: they wait for the player.
 *
 * GameScreen pauses the hold while a dialog covers the table, and StepAction draws it as a
 * thin line that runs out on the step button (`active`, `paused`, `progress()`).
 */
import { ANIMATION_DURATION } from '../../constants/animations.js';
import { createHoldTimer } from '../../components/card/holdTimer.js';

/** How long a result stays up before the game moves on (ms) */
export const RESULT_HOLD_MS = ANIMATION_DURATION.RESULT_HOLD;

export function createResultHold() {
	let timer = null;
	let active = $state(false);
	let paused = $state(false);
	let duration = $state(RESULT_HOLD_MS);
	/** Set while a dialog is open: a hold that starts meanwhile starts paused */
	let held = false;

	function cancel() {
		timer?.cancel();
		timer = null;
		active = false;
		paused = false;
	}

	/**
	 * @param {() => void} onDone - Called once when the hold runs out (never after cancel)
	 * @param {number} [ms]
	 */
	function start(onDone, ms = RESULT_HOLD_MS) {
		cancel();
		duration = ms;
		active = true;
		timer = createHoldTimer(ms, () => {
			timer = null;
			active = false;
			paused = false;
			onDone();
		});
		if (held) {
			timer.pause();
			paused = true;
		}
	}

	function pause() {
		held = true;
		if (!timer) return;
		timer.pause();
		paused = true;
	}

	function resume() {
		held = false;
		if (!timer) return;
		timer.resume();
		paused = false;
	}

	/** @returns {number} 0 when the hold starts, 1 when it runs out (or when none is running) */
	function progress() {
		return timer ? timer.progress() : 1;
	}

	return {
		/** True from the result until the game moves on (or the hold is cancelled) */
		get active() {
			return active;
		},
		get paused() {
			return paused;
		},
		get duration() {
			return duration;
		},
		progress,
		start,
		cancel,
		pause,
		resume
	};
}
