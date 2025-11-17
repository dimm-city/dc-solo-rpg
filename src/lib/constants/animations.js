/**
 * Animation duration constants (in milliseconds)
 * All values follow the mechanical/ethereal aesthetic established in Phase 1
 *
 * @see docs/animation-style-guide.md for usage guidelines
 */
export const ANIMATION_DURATION = {
	/** Fast transitions (150ms) - Quick interactions, button hovers */
	FAST: 150,

	/** Normal transitions (200ms) - Standard modal, fade transitions */
	NORMAL: 200,

	/** Slow transitions (300ms) - Page transitions, major state changes */
	SLOW: 300,

	/** Card dismiss sequence (600ms) - Card fade-out before state change */
	CARD_DISMISS: 600,

	/** Dice fade (250ms) - Dice fade-out with scale */
	DICE_FADE: 250,

	/** Dice delay (500ms) - Pause before dice fade begins */
	DICE_DELAY: 500,

	/** Story mode transitions (250ms) - Story library and save animations */
	STORY_MODE: 250,

	/** Round crossfade (300ms) - Story mode round-to-round transitions */
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

	/** Linear - Constant speed, no easing */
	LINEAR: 'linear',

	/** Cubic out - Used for modal scale transitions */
	CUBIC_OUT: 'cubic-bezier(0.33, 1, 0.68, 1)',

	/** Quint out - Smooth deceleration for upward motion */
	QUINT_OUT: 'cubic-bezier(0.22, 1, 0.36, 1)'
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
