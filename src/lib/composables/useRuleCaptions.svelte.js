/**
 * useRuleCaptions - one-time rule captions taught through play
 *
 * Watches gameState and queues a short caption the first time each rule shows up
 * in a game (odd card, King, Ace of Hearts, other Aces, Lucid, Surreal, failed Salvation).
 * The "seen" set lives in memory and resets with every new game; each id is also recorded
 * once (markRuleTipSeen) for the Help modal's "Rules you've met". Nothing is queued while
 * rule tips are off (Settings › Gameplay › Rule tips).
 *
 * `createRuleCaptions` holds the trigger logic (plain state, easy to test);
 * `useRuleCaptions` wires it to gameState and the RuleCaption component.
 */
import { gameState } from '../stores/gameStore.svelte.js';
import { getSalvationThreshold } from '../services/d20Mechanics.js';
import { areRuleTipsEnabled, markRuleTipSeen } from '../utils/instructionsStorage.js';

const ODD_RANKS = ['A', '3', '5', '7', '9'];
const SALVATION_CAPTION =
	'Salvation unlocked. At the end of each round, roll to remove a token. Clear them all to win.';
const RESET_STATES = ['loadGame', 'showIntro'];
const tipsOff = () => !areRuleTipsEnabled();

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
 * @param {{ isDisabled?: () => boolean, onSeen?: (id: string) => void }} [options]
 *   isDisabled returns true when captions are turned off; onSeen records a caption once shown
 */
export function createRuleCaptions({ isDisabled = () => false, onSeen = markRuleTipSeen } = {}) {
	let seen = [];
	let prev = null;
	/** @type {{ id: string, text: string }[]} */
	let queue = [];

	function fire(id, text) {
		if (seen.includes(id)) return;
		seen.push(id);
		queue.push({ id, text });
		onSeen(id);
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
				fire('salvation', SALVATION_CAPTION);
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

		// Easy starts with the Ace of Hearts revealed, so teach Salvation on its first screen
		if (next.state === 'successCheck' && before.state !== 'successCheck') {
			fire('salvation', SALVATION_CAPTION);
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
 * Component wiring: call once (GameScreen) and hand the result to RuleCaption.
 * Returns the visible caption and a dismiss function.
 *
 * At most one caption starts per screen; the rest wait for the next screen. While
 * isPaused() is true (an overlay or dialog covers the table) the visible caption's
 * countdown stops and nothing new starts, so no caption runs out unseen.
 *
 * @param {{ displayMs?: number, isPaused?: () => boolean }} [options]
 */
export function useRuleCaptions({ displayMs = 6000, isPaused = () => false } = {}) {
	const tracker = createRuleCaptions({ isDisabled: tipsOff });
	let current = $state(null);
	let timer = null;
	let remaining = 0;
	let startedAt = 0;
	/** The screen the latest caption started on */
	let shownOn = null;

	function clearTimer() {
		if (timer) clearTimeout(timer);
		timer = null;
	}

	function startTimer(ms) {
		clearTimer();
		remaining = ms;
		startedAt = Date.now();
		timer = setTimeout(dismiss, ms);
	}

	function pauseTimer() {
		if (!timer) return;
		clearTimer();
		remaining = Math.max(0, remaining - (Date.now() - startedAt));
	}

	function showNext(screen) {
		current = tracker.next();
		if (current) {
			shownOn = screen;
			startTimer(displayMs);
		}
	}

	function dismiss() {
		clearTimer();
		current = null;
	}

	$effect(() => {
		const g = gameState;
		tracker.observe(g);
		const paused = isPaused();
		if (RESET_STATES.includes(g.state) || g.gameOver || tipsOff()) {
			clearTimer();
			current = null;
			shownOn = null;
		} else if (paused) {
			pauseTimer();
		} else if (current) {
			if (!timer) startTimer(remaining);
		} else if (g.state !== shownOn) {
			showNext(g.state);
		}
	});

	$effect(() => clearTimer);

	return {
		get current() {
			return current;
		},
		/** True while the caption is covered (RuleCaption hides it, its countdown is stopped) */
		get paused() {
			return isPaused();
		},
		dismiss
	};
}
