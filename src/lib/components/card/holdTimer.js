/**
 * A pausable countdown: auto-play holds a card on screen for `duration` ms, pauses while the
 * player is reading it (pointer over it, focus inside it), and calls `onDone` when it runs out.
 *
 * @param {number} duration - Hold time in ms
 * @param {() => void} onDone - Called once when the hold runs out (never after cancel)
 * @param {{now?: () => number}} [clock] - Injectable clock for tests
 */
export function createHoldTimer(duration, onDone, { now = () => performance.now() } = {}) {
	let elapsed = 0;
	let startedAt = null;
	let handle = null;
	let finished = false;

	function finish() {
		handle = null;
		startedAt = null;
		elapsed = duration;
		finished = true;
		onDone();
	}

	function resume() {
		if (finished || startedAt !== null) return;
		startedAt = now();
		handle = setTimeout(finish, Math.max(0, duration - elapsed));
	}

	function pause() {
		if (startedAt === null) return;
		elapsed += now() - startedAt;
		startedAt = null;
		clearTimeout(handle);
		handle = null;
	}

	function cancel() {
		pause();
		finished = true;
	}

	/** @returns {number} 0 at the start, 1 when the hold has run out */
	function progress() {
		const spent = elapsed + (startedAt === null ? 0 : now() - startedAt);
		return duration > 0 ? Math.min(1, spent / duration) : 1;
	}

	resume();
	return {
		pause,
		resume,
		cancel,
		progress,
		get paused() {
			return !finished && startedAt === null;
		}
	};
}
