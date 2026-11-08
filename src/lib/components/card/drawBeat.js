/**
 * A newly shown card takes no dismiss input (a tap, Space, Enter, the step button) until it has
 * been up 400ms, with or without motion (game-copy-s-01), as the step button does (GameScreen's
 * STEP_GUARD_MS): CardDeck keeps it 'materializing' until then. A quick second input after a
 * dismiss never dismisses the next card unread. With motion on the 250ms rise is most of it;
 * under reduced motion, where the card is up at once, it is the only guard.
 */
export const CARD_GUARD_MS = 400;

/**
 * createDrawBeat - the pause on the empty table before the next card of a round (OWN-7)
 *
 * When a card is dismissed and more remain, the next one is drawn `ms` later, so each card
 * lands as its own moment. A tap or Space during the beat draws at once (`now()`), and the
 * draw happens once either way: a draw already in hand clears the pending one.
 *
 * @param {Object} options
 * @param {() => void} options.draw - Draws the next card
 * @param {() => boolean} [options.canDraw] - Checked when the beat runs out; false drops the draw
 *   (the round ended, the game left the draw step)
 * @param {number} options.ms - The beat
 */
export function createDrawBeat({ draw, canDraw = () => true, ms }) {
	let timer = null;

	function cancel() {
		clearTimeout(timer);
		timer = null;
	}

	/** Draw after the beat (a beat already running starts over) */
	function schedule() {
		cancel();
		timer = setTimeout(() => {
			timer = null;
			if (canDraw()) draw();
		}, ms);
	}

	/** Draw now: an input during the beat brings the draw forward, it is never lost */
	function now() {
		cancel();
		draw();
	}

	return {
		schedule,
		now,
		cancel,
		/** A draw is waiting for the beat to run out */
		get pending() {
			return timer !== null;
		}
	};
}
