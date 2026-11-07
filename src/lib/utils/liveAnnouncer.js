/**
 * liveAnnouncer - one queue for the game's single polite live region.
 *
 * Screen readers drop or merge messages that change in the same moment, so messages are
 * delivered one at a time, at least `gapMs` apart. A roll's result line goes first
 * (`{ first: true }`); a rule caption fired by the same roll follows a second later.
 *
 * @param {(message: string) => void} deliver - Puts a message in the live region
 * @param {{ gapMs?: number }} [options]
 */
export function createAnnouncer(deliver, { gapMs = 1000 } = {}) {
	/** @type {string[]} */
	let queue = [];
	let timer = null;
	let lastAt = -Infinity;

	function flush() {
		timer = null;
		const next = queue.shift();
		if (next === undefined) return;
		deliver(next);
		lastAt = Date.now();
		schedule();
	}

	function schedule() {
		if (timer || queue.length === 0) return;
		// Always async, so messages raised in the same tick are ordered before delivery
		timer = setTimeout(flush, Math.max(0, lastAt + gapMs - Date.now()));
	}

	return {
		/**
		 * @param {string} message
		 * @param {{ first?: boolean }} [options] first: ahead of anything queued (result lines)
		 */
		announce(message, { first = false } = {}) {
			if (!message) return;
			if (first) queue.unshift(message);
			else queue.push(message);
			schedule();
		},
		/** Drop everything not yet delivered */
		clear() {
			queue = [];
			if (timer) clearTimeout(timer);
			timer = null;
		}
	};
}
