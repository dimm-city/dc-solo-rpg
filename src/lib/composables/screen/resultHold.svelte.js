/**
 * createResultHold - a roll's result stays up for one beat, then the game moves on by itself
 *
 * The step composables start a hold once a result is on screen (the deal after Roll for Tasks,
 * a Stability check, Salvation). A press moves on at once instead (the composable cancels the
 * hold). Results that end the game never start one: they wait for the player.
 *
 * A result that is read aloud holds for the voice instead: the hold waits (`waiting`, its line
 * full) until the narration ends, then runs out over a short beat (NARRATION_BEAT_MS).
 *
 * GameScreen pauses the hold while a dialog covers the table, and StepAction draws it as a
 * thin line that runs out on the step button (`active`, `paused`, `waiting`, `progress()`).
 */
import { ANIMATION_DURATION } from '../../constants/animations.js';
import { createHoldTimer } from '../../components/card/holdTimer.js';

/** How long a result stays up before the game moves on (ms) */
export const RESULT_HOLD_MS = ANIMATION_DURATION.RESULT_HOLD;
/** Once the voice has read the result out, the game moves on after this beat (ms) */
export const NARRATION_BEAT_MS = ANIMATION_DURATION.BEAT;

export function createResultHold() {
	let timer = null;
	/** @type {{ promise: Promise<boolean>, cancel: () => void } | null} The narration waited for */
	let wait = null;
	let active = $state(false);
	let paused = $state(false);
	let waiting = $state(false);
	let duration = $state(RESULT_HOLD_MS);
	/** Set while a dialog is open: a hold that starts meanwhile starts paused */
	let held = false;

	function cancel() {
		timer?.cancel();
		timer = null;
		wait?.cancel();
		wait = null;
		active = false;
		paused = false;
		waiting = false;
	}

	function arm(onDone, ms) {
		duration = ms;
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

	/**
	 * @param {() => void} onDone - Called once when the hold runs out (never after cancel)
	 * @param {number} [ms]
	 * @param {Object} [options]
	 * @param {{ promise: Promise<boolean>, cancel: () => void } | null} [options.narration] - The
	 *   voice reading the result (see awaitNarration): the hold then waits for it to end and runs
	 *   out over NARRATION_BEAT_MS after that, instead of over `ms`
	 */
	function start(onDone, ms = RESULT_HOLD_MS, { narration = null } = {}) {
		cancel();
		active = true;
		if (!narration) {
			arm(onDone, ms);
			return;
		}
		wait = narration;
		waiting = true;
		duration = NARRATION_BEAT_MS;
		narration.promise.then(() => {
			// Cancelled meanwhile (a press, leaving the screen), or a new hold took over
			if (wait !== narration) return;
			wait = null;
			waiting = false;
			arm(onDone, NARRATION_BEAT_MS);
		});
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

	/** @returns {number} 0 when the hold starts (and while it waits for the voice), 1 when it runs out (or when none is running) */
	function progress() {
		if (timer) return timer.progress();
		return waiting ? 0 : 1;
	}

	return {
		/** True from the result until the game moves on (or the hold is cancelled) */
		get active() {
			return active;
		},
		get paused() {
			return paused;
		},
		/** True while the hold waits for the voice to finish reading the result */
		get waiting() {
			return waiting;
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
