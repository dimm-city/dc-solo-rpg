/**
 * useRuleCaptions - one-time rule captions taught through play
 *
 * Watches gameState and queues a short caption the first time each rule shows up
 * in a game (odd card, King, Ace of Hearts, other Aces, Lucid, Surreal, failed Salvation).
 * The "seen" set lives in memory and resets with every new game. Nothing is queued when
 * the player chose "I know how to play, never show instructions again".
 *
 * `createRuleCaptions` holds the trigger logic (plain state, easy to test);
 * `useRuleCaptions` wires it to gameState and the RuleCaption component.
 */
import { gameState } from '../stores/gameStore.svelte.js';
import { getSalvationThreshold } from '../services/d20Mechanics.js';
import { hasSeenInstructions } from '../utils/instructionsStorage.js';

const ODD_RANKS = ['A', '3', '5', '7', '9'];
const RESET_STATES = ['loadGame', 'showIntro'];

/** Pick the fields we compare between observations. */
function snapshot(g) {
	const last = g.log?.[g.log.length - 1];
	return {
		state: g.state,
		round: g.round,
		kings: g.kingsRevealed,
		aces: g.acesRevealed,
		heartsAce: g.aceOfHeartsRevealed,
		tokens: g.tokens,
		lucid: g.isLucid,
		surreal: g.isSurreal,
		lastCard: last ? last.card : null,
		lastModifier: last ? (last.modifier ?? null) : null,
		gameOver: g.gameOver
	};
}

/**
 * @param {{ isDisabled?: () => boolean }} [options] isDisabled returns true when captions are turned off
 */
export function createRuleCaptions({ isDisabled = () => false } = {}) {
	let seen = [];
	let prev = null;
	/** @type {{ id: string, text: string }[]} */
	let queue = [];

	function fire(id, text) {
		if (seen.includes(id)) return;
		seen.push(id);
		queue.push({ id, text });
	}

	function reset() {
		seen = [];
		queue = [];
		prev = null;
	}

	/** Compare a new game snapshot with the last one and queue captions for anything new. */
	function observe(g) {
		const next = snapshot(g);
		const before = prev;
		prev = next;

		// New game: clear everything and take a fresh baseline
		if (RESET_STATES.includes(next.state) || (before && next.round < before.round)) {
			seen = [];
			queue = [];
			return;
		}
		if (next.gameOver || isDisabled()) {
			queue = [];
			return;
		}
		// First look (e.g. a resumed game): baseline only, so nothing replays
		if (!before) return;

		// An odd card was just confirmed and sent to a Stability check
		if (
			next.state === 'failureCheck' &&
			before.state !== 'failureCheck' &&
			ODD_RANKS.includes(next.lastCard)
		) {
			fire('odd', 'Odd cards test your Stability. Roll the d20; low rolls cost Stability.');
		}

		if (next.kings > before.kings) {
			fire('king', `${next.kings} of 4. When all four Kings are revealed, your journey ends.`);
		}

		if (next.aces > before.aces) {
			if (next.heartsAce && !before.heartsAce) {
				fire(
					'salvation',
					'Salvation unlocked. At the end of each round, roll to remove a token. Clear them all to win.'
				);
			} else if (next.heartsAce) {
				const need = getSalvationThreshold(next.aces);
				fire(
					'ace',
					need > 0
						? `Each Ace makes salvation easier. You now need ${need}+.`
						: 'Each Ace makes salvation easier. With all four, it is automatic.'
				);
			}
		}

		if (next.lucid && !before.lucid) {
			fire('lucid', 'Lucid. Your next roll uses two dice and keeps the higher.');
		}
		if (next.surreal && !before.surreal) {
			fire('surreal', 'Surreal. Your next roll uses two dice and keeps the lower.');
		}

		if (next.tokens > before.tokens && next.heartsAce) {
			fire('token', 'A failed salvation roll adds a token. Hope costs.');
		}
	}

	return {
		observe,
		reset,
		/** Remove and return the next queued caption, or null. */
		next() {
			return queue.shift() ?? null;
		},
		get pending() {
			return queue.length;
		},
		get seenIds() {
			return [...seen];
		}
	};
}

/**
 * Component wiring: call once in RuleCaption. Returns the visible caption and a dismiss function.
 */
export function useRuleCaptions({ displayMs = 6000 } = {}) {
	const tracker = createRuleCaptions({ isDisabled: () => hasSeenInstructions() });
	let current = $state(null);
	let timer = null;

	function clearTimer() {
		if (timer) clearTimeout(timer);
		timer = null;
	}

	function showNext() {
		clearTimer();
		current = tracker.next();
		if (current) timer = setTimeout(dismiss, displayMs);
	}

	function dismiss() {
		showNext();
	}

	$effect(() => {
		const g = gameState;
		tracker.observe(g);
		if (RESET_STATES.includes(g.state) || g.gameOver || hasSeenInstructions()) {
			clearTimer();
			current = null;
		} else if (!current) {
			showNext();
		}
	});

	$effect(() => clearTimer);

	return {
		get current() {
			return current;
		},
		dismiss
	};
}
