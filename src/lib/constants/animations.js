/**
 * The animation standard: one token set for JS and CSS.
 *
 * `animationTokensCss()` writes the same values as CSS custom properties on :root
 * (rendered in the head by src/routes/+layout.svelte), so components never define
 * their own numbers. Use the `--dur-*` and `--ease-*` properties in CSS and these
 * constants in JS.
 *
 * - 120ms state change: hover, press, a chip or a label changing
 * - 200ms enter or exit: anything appearing or leaving (fade plus at most an 8px move)
 * - 300ms overlay: a dialog or overlay opening
 * - 400ms beat: a held moment (a King igniting, Salvation unlocking)
 * - 1.5s maximum for any staged sequence
 * - ambient loops at 4s or 8s only, at most one per screen, paused when covered,
 *   when the tab is hidden and under reduced motion
 *
 * Alert loops (critical Stability, lit Kings) are not ambient: their speed carries the
 * urgency. They stop under reduced motion too.
 *
 * @see docs/animation-style-guide.md
 */
export const ANIMATION_DURATION = {
	/** State change (120ms): hover, press, chip, label swap */
	STATE: 120,

	/** Enter or exit (200ms): fades, rises, screen swaps */
	ENTER: 200,

	/** Overlay (300ms): a dialog or overlay opening */
	OVERLAY: 300,

	/** Beat (400ms): a held moment, e.g. a King igniting */
	BEAT: 400,

	/** The longest any staged sequence may run (1.5s) */
	SEQUENCE_MAX: 1500,

	/**
	 * Result hold (2s): how long a roll's result line stays up before the game moves on by
	 * itself (the deal after Roll for Tasks, a Stability check, Salvation). A reading pause, not
	 * an animation, so the 1.5s sequence cap does not apply. It is long enough to read the
	 * longest everyday line ("Rolled 2 · needed 14+ · +1 token · 11 left", 8 words: about 1.6s at
	 * 300 words a minute, once the eye leaves the dice) and for a screen reader to speak it, and it
	 * matches auto-play's default delay, so a result holds as long with auto-play on or off.
	 */
	RESULT_HOLD: 2000,

	/** Ambient loop period (4s) */
	AMBIENT: 4000,

	/** Slow ambient loop period (8s) */
	AMBIENT_SLOW: 8000,

	// Older names, kept for existing callers. Their values follow the standard above.

	/** Fast transitions (120ms, = STATE) */
	FAST: 120,

	/** Normal transitions (200ms, = ENTER) */
	NORMAL: 200,

	/** Slow transitions (300ms, = OVERLAY) */
	SLOW: 300,

	/** Card dismiss sequence (600ms) - owned by the card; the standard asks for 220ms */
	CARD_DISMISS: 600,

	/** Dice fade (250ms) - Dice fade-out with scale */
	DICE_FADE: 250,

	/** Dice delay (500ms) - Pause before dice fade begins */
	DICE_DELAY: 500,

	/**
	 * Dice sink (800ms, OWN-6) - landed dice drop beneath the board and fade as the result
	 * appears (ease-in-out, ANIMATION_EASING.DICE_SINK). Slow enough to see them settle and
	 * leave (350ms read as a blink); with the 400ms rest on top the roll's staging is 1.2s,
	 * inside the 1.5s cap, and it ends well inside the 2s result hold.
	 */
	DICE_SINK: 800,

	/** Dice sink under reduced motion (350ms) - no movement, a plain short fade */
	DICE_SINK_REDUCED: 350,

	/**
	 * Draw pause (300ms, OWN-7) - the beat on the empty table between dismissing a card and the
	 * next card rising, so each card lands as its own moment (card to card about 0.8s: 220ms
	 * dismiss, this pause, 250ms rise). A tap or Space during it draws at once. A pause, not
	 * motion, so it holds under reduced motion too.
	 */
	DRAW_PAUSE: 300,

	/** Story mode transitions (250ms) - Story library and save animations */
	STORY_MODE: 250,

	/** Round crossfade (300ms) - kept for compatibility; story mode's round swap now uses STATE */
	ROUND_TRANSITION: 300
};

/**
 * Animation easing constants
 * Following mechanical/ethereal aesthetic - NO bounce or spring effects
 */
export const ANIMATION_EASING = {
	/** Mechanical ease - Precise, controlled deceleration */
	MECHANICAL: 'cubic-bezier(0.4, 0, 0.6, 1)',

	/** Standard ease-out - Smooth deceleration */
	EASE_OUT: 'ease-out',

	/** Standard ease-in - Smooth acceleration */
	EASE_IN: 'ease-in',

	/** Linear - Constant speed, no easing (progress bars only) */
	LINEAR: 'linear',

	/** Cubic out - Entering: modal scale, fades and rises */
	CUBIC_OUT: 'cubic-bezier(0.33, 1, 0.68, 1)',

	/** Cubic in - Leaving: dismissals and exits */
	CUBIC_IN: 'cubic-bezier(0.32, 0, 0.67, 0)',

	/** Quint out - Smooth deceleration for upward motion */
	QUINT_OUT: 'cubic-bezier(0.22, 1, 0.36, 1)',

	/** Dice sink - ease-in-out: the landed dice ease away and the fade is spread evenly (OWN-6) */
	DICE_SINK: 'cubic-bezier(0.4, 0, 0.6, 1)'
};

/** Distance for an enter or exit move: a rise of at most 8px */
export const ANIMATION_DISTANCE = {
	RISE: 8
};

/**
 * Z-index layering constants
 * Ensures proper stacking order across the application
 */
export const Z_INDEX = {
	/** Background content */
	BACKGROUND: 0,

	/** Main game/page content */
	CONTENT: 1,

	/** Status display (always visible) */
	STATUS_DISPLAY: 100,

	/** Fog overlay backdrop */
	FOG_OVERLAY: 49,

	/** Modal content */
	MODAL: 50,

	/** Dice during roll (temporary high z-index) */
	DICE_ROLLING: 9999,

	/** Dice behind content (after fade) */
	DICE_HIDDEN: -10
};

const ms = (value) => `${value}ms`;

/**
 * The tokens as CSS custom properties. The older `--transition-*` and `--anim-*` names
 * map onto the same values, so no stylesheet defines a second set of numbers.
 * @returns {Record<string, string>}
 */
export function animationCssVariables() {
	const d = ANIMATION_DURATION;
	const e = ANIMATION_EASING;
	return {
		'--dur-state': ms(d.STATE),
		'--dur-enter': ms(d.ENTER),
		'--dur-overlay': ms(d.OVERLAY),
		'--dur-beat': ms(d.BEAT),
		'--dur-sequence-max': ms(d.SEQUENCE_MAX),
		'--dur-ambient': ms(d.AMBIENT),
		'--dur-ambient-slow': ms(d.AMBIENT_SLOW),
		'--dur-dice-sink': ms(d.DICE_SINK),
		'--dur-dice-sink-reduced': ms(d.DICE_SINK_REDUCED),
		'--ease-dice-sink': e.DICE_SINK,
		'--ease-enter': e.CUBIC_OUT,
		'--ease-exit': e.CUBIC_IN,
		'--ease-mechanical': e.MECHANICAL,
		'--rise-enter': `${ANIMATION_DISTANCE.RISE}px`,
		// Older names
		'--transition-fast': `${ms(d.STATE)} ${e.CUBIC_OUT}`,
		'--transition-base': `${ms(d.ENTER)} ${e.CUBIC_OUT}`,
		'--transition-slow': `${ms(d.OVERLAY)} ${e.CUBIC_OUT}`,
		'--anim-instant': ms(d.STATE),
		'--anim-fast': ms(d.ENTER),
		'--anim-normal': ms(d.OVERLAY),
		'--anim-slow': ms(d.BEAT),
		'--ease-out': e.CUBIC_OUT
	};
}

/**
 * A `:root { ... }` rule declaring every animation custom property.
 * @returns {string}
 */
export function animationTokensCss() {
	const body = Object.entries(animationCssVariables())
		.map(([name, value]) => `${name}:${value}`)
		.join(';');
	return `:root{${body}}`;
}
