/**
 * useRuleCaptions - one-time rule captions taught through play (design polish DP-1-09)
 *
 * Watches gameState and notes the first time each rule comes up in a game (odd card, King,
 * the Ace of Hearts, other Aces, on Easy the fourth Ace, Lucid, Surreal, and on Hard a missed
 * Salvation adding a Token). A noted caption waits for a screen where its rule applies: each
 * time the player arrives at a table screen (Roll for Tasks, a Stability check, Salvation),
 * the most important waiting caption that can show there starts, at most one per arrival.
 *
 *   Priority: salvation, fourth-ace, lucid, surreal, king, ace, token, odd.
 *   salvation: Salvation, before its roll. fourth-ace: the final check (Easy), before its roll.
 *   lucid, surreal: any roll step, before its roll, and only while still true (a Lucid that
 *   was used up before it could show is dropped). king, ace, token: any table screen.
 *   odd: a Stability check.
 *
 * On the Ace of Hearts' own Stability check no caption starts: "Salvation unlocked" is the
 * first caption after that card, on the first Salvation screen. The text is built when the
 * caption shows, from the live values, so it never disagrees with the HUD.
 *
 * The "seen" set lives in memory and resets with every new game; each id is also recorded
 * once (markRuleTipSeen) for the Help modal's "Rules you've met" when it shows. Nothing is
 * noted while rule tips are off (Settings › Gameplay › Rule tips).
 *
 * `createRuleCaptions` holds the trigger and choice logic (plain state, easy to test);
 * `useRuleCaptions` wires it to gameState and the RuleCaption component.
 */
import { gameState } from '../stores/gameStore.svelte.js';
import { diceState } from '../stores/diceStore.svelte.js';
import { fourthAceWins } from '../constants/difficulty.js';
import { areRuleTipsEnabled, markRuleTipSeen } from '../utils/instructionsStorage.js';

const ODD_RANKS = ['A', '3', '5', '7', '9'];
const RESET_STATES = ['loadGame', 'showIntro'];
/** The screens a caption can start on: the table's roll steps */
export const TABLE_SCREENS = ['rollForTasks', 'failureCheck', 'successCheck'];
/** Most important first */
export const CAPTION_PRIORITY = [
	'salvation',
	'fourth-ace',
	'lucid',
	'surreal',
	'king',
	'ace',
	'token',
	'odd'
];
const tipsOff = () => !areRuleTipsEnabled();

const isHeartsAce = (card) => card?.card === 'A' && card?.suit === 'hearts';
const lastLogged = (g) => g.log?.[g.log.length - 1] ?? null;

/** The fourth Ace's Stability check on Easy (see isFinalStabilityCheck in gameActions) */
const isFinalCheck = (g) =>
	g.state === 'failureCheck' && fourthAceWins(g) && (g.acesRevealed ?? 0) >= 4;

/** What each caption says, built from the live game when it shows */
const TEXT = {
	odd: () => 'Odd cards call for a Stability check.',
	king: (g) => `King ${g.kingsRevealed} of 4. When all four are revealed, your journey ends.`,
	ace: (g) => {
		const aces = g.acesRevealed ?? 0;
		const fourthWins = fourthAceWins(g);
		if (aces >= 4 && !fourthWins) {
			return 'With all four Aces, Salvation has no target: each Salvation roll is a Stability check.';
		}
		const rule = 'Each Ace makes Salvation easier: 17+ with one, 14+ with two, 11+ with three.';
		return aces === 3 && fourthWins
			? `${rule} One more Ace and you escape, if you survive its check.`
			: rule;
	},
	salvation: () =>
		'Salvation unlocked. Each round ends with a roll to remove a Token. Remove them all to escape.',
	'fourth-ace': () => 'On Easy, the fourth Ace ends the game.',
	lucid: () => 'A natural 20 makes you Lucid, for one roll: this one.',
	surreal: () => 'A natural 1 makes you Surreal, for one roll: this one.',
	token: () => 'On Hard, a missed Salvation roll adds a Token. Hope costs.'
};

/** Whether a waiting caption can show on this screen, and whether it is still true */
function canShowHere(id, g) {
	switch (id) {
		case 'salvation':
			return g.state === 'successCheck';
		case 'fourth-ace':
			return isFinalCheck(g);
		case 'odd':
			return g.state === 'failureCheck';
		default:
			return TABLE_SCREENS.includes(g.state);
	}
}
const stillTrue = (id, g) =>
	id === 'lucid' ? !!g.isLucid : id === 'surreal' ? !!g.isSurreal : true;

/** Pick the fields we compare between observations. */
function snapshot(g) {
	const last = lastLogged(g);
	return {
		state: g.state,
		round: g.round,
		kings: g.kingsRevealed,
		aces: g.acesRevealed,
		heartsAce: g.aceOfHeartsRevealed,
		tokens: g.tokens,
		fourthWins: fourthAceWins(g),
		lucid: g.isLucid,
		surreal: g.isSurreal,
		lastCard: last ? last.card : null,
		lastIsHeartsAce: isHeartsAce(last),
		gameOver: g.gameOver
	};
}

/**
 * @param {{ isDisabled?: () => boolean, onSeen?: (id: string) => void }} [options]
 *   isDisabled returns true when captions are turned off; onSeen records a caption once shown
 */
export function createRuleCaptions({ isDisabled = () => false, onSeen = markRuleTipSeen } = {}) {
	let seen = [];
	/** Noted, waiting for a screen where they apply */
	let waiting = [];
	let prev = null;

	function note(id) {
		if (!seen.includes(id) && !waiting.includes(id)) waiting.push(id);
	}

	function reset() {
		seen = [];
		waiting = [];
		prev = null;
	}

	/** Compare a new game snapshot with the last one and note any rule that just came up. */
	function observe(g) {
		const next = snapshot(g);
		const before = prev;
		prev = next;

		// New game: clear everything and take a fresh baseline
		if (RESET_STATES.includes(next.state) || (before && next.round < before.round)) {
			seen = [];
			waiting = [];
			return;
		}
		if (next.gameOver || isDisabled()) {
			waiting = [];
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
			note('odd');
		}

		if (next.kings > before.kings) note('king');

		if (next.aces > before.aces) {
			if (next.aces >= 4 && next.fourthWins) {
				// Easy: the fourth Ace ends the game, its Stability check the last roll
				note('fourth-ace');
			} else if (next.lastIsHeartsAce) {
				// The Ace of Hearts itself (its flag is set as it is drawn, before the count rises)
				note('salvation');
			} else if (next.heartsAce) {
				note('ace');
			}
		}

		if (next.lucid && !before.lucid) note('lucid');
		if (next.surreal && !before.surreal) note('surreal');

		// Easy starts with the Ace of Hearts revealed, so teach Salvation on its first screen
		if (next.state === 'successCheck' && before.state !== 'successCheck') note('salvation');

		// Only Hard adds Tokens (a missed Salvation roll); on Normal they only ever fall
		if (next.tokens > before.tokens && next.heartsAce) note('token');
	}

	/**
	 * The player has arrived at a table screen: start the most important waiting caption that
	 * can show here, or none. A Lucid or Surreal caption that is no longer true is dropped.
	 * Nothing starts on the Ace of Hearts' own Stability check.
	 * @returns {{ id: string, text: string } | null}
	 */
	function take(g) {
		if (isDisabled() || !TABLE_SCREENS.includes(g.state)) return null;
		waiting = waiting.filter((id) => stillTrue(id, g));
		if (g.state === 'failureCheck' && isHeartsAce(g.lastCard ?? lastLogged(g))) return null;
		const id = CAPTION_PRIORITY.find(
			(candidate) => waiting.includes(candidate) && canShowHere(candidate, g)
		);
		if (!id) return null;
		waiting = waiting.filter((other) => other !== id);
		seen.push(id);
		onSeen(id);
		return { id, text: TEXT[id](g) };
	}

	return {
		observe,
		take,
		reset,
		/** How many captions are waiting */
		get pending() {
			return waiting.length;
		},
		/** The captions waiting, most important first */
		get waiting() {
			return CAPTION_PRIORITY.filter((id) => waiting.includes(id));
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
 * A caption starts only as the player arrives at a table screen, at most one per arrival. It
 * goes when that step's roll starts (the dice, or the reduced-motion roll), on a tap, on
 * Escape, or after displayMs. While isPaused() is true (an overlay or dialog covers the
 * table) it is hidden and its countdown stops, so no caption runs out unseen.
 *
 * @param {{ displayMs?: number, isPaused?: () => boolean }} [options]
 */
export function useRuleCaptions({ displayMs = 6000, isPaused = () => false } = {}) {
	const tracker = createRuleCaptions({ isDisabled: tipsOff });
	let current = $state(null);
	let timer = null;
	let remaining = 0;
	let startedAt = 0;
	/** The screen the player last arrived at */
	let arrivedOn = null;

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

	function dismiss() {
		clearTimer();
		current = null;
	}

	$effect(() => {
		const g = gameState;
		tracker.observe(g);
		const paused = isPaused();
		const rolling = diceState.isRolling || !!diceState.staticRoll;
		if (RESET_STATES.includes(g.state) || g.gameOver || tipsOff()) {
			dismiss();
			arrivedOn = null;
			return;
		}
		// Arriving at a screen: a table screen may start one caption (once the table is in view)
		if (g.state !== arrivedOn && !paused) {
			arrivedOn = g.state;
			if (!current) {
				current = tracker.take(g);
				remaining = displayMs;
			}
		}
		if (!current) return;
		if (rolling)
			dismiss(); // the step's roll has started: the table is the dice's now
		else if (paused) pauseTimer();
		else if (!timer) startTimer(remaining);
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
