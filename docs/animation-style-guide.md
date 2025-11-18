# Animation Style Guide

**Version:** 1.0
**Last Updated:** November 2025
**Status:** Active Standard

---

## Table of Contents

1. [Animation Principles](#animation-principles)
2. [Duration Standards](#duration-standards)
3. [Common Patterns with Code Examples](#common-patterns-with-code-examples)
4. [Component Library Reference](#component-library-reference)
5. [Testing Checklist](#testing-checklist)
6. [Anti-Patterns](#anti-patterns)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility](#accessibility)
9. [Quick Reference Table](#quick-reference-table)
10. [Migration Guide](#migration-guide)

---

## Animation Principles

### Mechanical vs Ethereal Aesthetic

DC Solo RPG uses a **mechanical/ethereal** animation aesthetic that reflects the cyberpunk, creaturepunk atmosphere of Dimm City. This means:

**What We Do:**

- Precise, controlled deceleration (ease-out, cubic-out)
- Smooth, flowing transitions with natural physics
- Subtle scale effects (0.95 to 1.0)
- Layered fog effects with controlled timing
- Ghost-like fades and dissolves

**What We Avoid:**

- Bounce effects (too playful, breaks immersion)
- Spring animations (feels cartoonish)
- Overly energetic motion (distracting)
- Excessive elasticity or rubber-band effects

**Example Comparison:**

```javascript
// ✅ GOOD - Mechanical/ethereal
import { scale } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

<div transition:scale={{
  duration: 200,
  start: 0.95,
  opacity: 0,
  easing: cubicOut
}}>
  Modal content
</div>

// ❌ BAD - Too bouncy/springy
<div transition:scale={{
  duration: 400,
  start: 0.8,
  easing: backOut  // Creates bounce effect
}}>
  Modal content
</div>
```

### Why We Avoid Bounce/Spring Effects

Bounce and spring animations create a playful, casual feeling that conflicts with the atmospheric tension of a solo survival horror game. Players should feel:

- **Immersed** in a mysterious, dangerous world
- **Focused** on strategic decisions
- **Tense** during high-stakes moments

Bouncy animations break this immersion by:

- Creating visual noise during critical moments
- Drawing attention away from content
- Feeling too lighthearted for the tone

### Timing Standards (150-300ms)

All standard animations fall within **150-300ms** to maintain:

1. **Responsiveness** - Fast enough to feel immediate
2. **Clarity** - Slow enough to perceive what changed
3. **Performance** - Short enough to hit 60fps consistently
4. **Polish** - Long enough to feel intentional, not abrupt

**Exception:** Card dismiss animations (600ms) are intentionally longer to allow players to absorb narrative content before screen transitions.

### Easing Functions Philosophy

We use easing functions from `$lib/constants/animations.js`:

```javascript
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
```

**When to use each:**

- **CUBIC_OUT** - Default for modals, scale transitions (feels smooth and natural)
- **EASE_OUT** - Standard fades, opacity changes (simple and reliable)
- **MECHANICAL** - Button hovers, UI state changes (precise and controlled)
- **QUINT_OUT** - Upward motion, rising elements (ethereal lift)
- **LINEAR** - Progress bars, loading indicators (consistent progress)
- **EASE_IN** - Exit animations (accelerating away)

### Performance Considerations (60fps Target)

All animations target **60fps** (16.67ms per frame) on standard hardware:

**Performance Rules:**

1. Only animate GPU-accelerated properties (`transform`, `opacity`)
2. Avoid animating `width`, `height`, `top`, `left` (causes layout thrashing)
3. Use `will-change` sparingly (only during animation)
4. Test on throttled CPU (Chrome DevTools: Performance > CPU 4x slowdown)
5. Keep total animation duration under 500ms unless narratively justified

**Target Performance:**

- **Desktop:** Solid 60fps
- **Mobile:** Minimum 30fps (acceptable), target 60fps
- **Low-end devices:** Graceful degradation via `prefers-reduced-motion`

---

## Duration Standards

All duration constants are defined in `src/lib/constants/animations.js`:

```javascript
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
```

### Decision Tree: Choosing the Right Duration

```
Is it a button hover or small UI state change?
├─ YES → Use ANIMATION_DURATION.FAST (150ms)
└─ NO → Continue

Is it a modal opening/closing or standard fade?
├─ YES → Use ANIMATION_DURATION.NORMAL (200ms)
└─ NO → Continue

Is it a screen transition or major state change?
├─ YES → Use ANIMATION_DURATION.SLOW (300ms)
└─ NO → Continue

Is it a card dismissal with narrative content?
├─ YES → Use ANIMATION_DURATION.CARD_DISMISS (600ms)
└─ NO → Continue

Is it dice-related animation?
├─ Fade out → Use ANIMATION_DURATION.DICE_FADE (250ms)
├─ Delay before fade → Use ANIMATION_DURATION.DICE_DELAY (500ms)
└─ NO → Continue

Is it story mode navigation?
├─ YES → Use ANIMATION_DURATION.ROUND_TRANSITION (300ms)
└─ NO → Consult with team or use NORMAL (200ms) as default
```

### When to Use Each Duration

#### FAST (150ms) - Quick Interactions

**Use for:**

- Button hover states
- Status indicator changes
- Small tooltip reveals
- Icon state toggles
- Navigation button highlights

**Example:**

```svelte
<script>
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
</script>

<button class="status-btn"> Status </button>

<style>
	.status-btn {
		transition:
			background-color 150ms ease-out,
			transform 150ms ease-out;
	}

	.status-btn:hover {
		background-color: var(--color-cyber-magenta);
		transform: translateY(-2px);
	}
</style>
```

#### NORMAL (200ms) - Standard Transitions

**Use for:**

- Modal open/close
- Standard fade in/out
- Component mount/unmount
- Overlay reveals
- Fog effects

**Example:**

```svelte
<script>
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
</script>

{#if isVisible}
	<div
		transition:scale={{
			duration: ANIMATION_DURATION.NORMAL,
			start: 0.95,
			opacity: 0,
			easing: cubicOut
		}}
	>
		Modal content
	</div>
{/if}
```

#### SLOW (300ms) - Major State Changes

**Use for:**

- Screen-to-screen transitions
- Page navigation
- Game state changes (intro → game → victory)
- Story mode round transitions
- Major layout shifts

**Example:**

```svelte
<script>
	import { crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	const [send, receive] = crossfade({
		duration: ANIMATION_DURATION.ROUND_TRANSITION, // 300ms
		easing: cubicOut
	});
</script>

{#key currentRound}
	<div in:receive={{ key: currentRound }} out:send={{ key: currentRound }}>
		Round {currentRound}
	</div>
{/key}
```

#### CARD_DISMISS (600ms) - Narrative Absorption

**Use for:**

- Card dismissal animations
- Moments where player needs time to read/absorb content
- Transitions between narrative beats

**Why 600ms?**
Players need time to:

1. Read the card prompt (150ms)
2. Process their decision (250ms)
3. Prepare for next screen (200ms)

**Example:**

```javascript
async function onDismiss() {
	if (animationStage !== 'revealed') return;

	// Start dismiss animation (600ms)
	animationStage = 'dismissing';
	await sleep(ANIMATION_DURATION.CARD_DISMISS);

	// Reset animation stage
	animationStage = 'idle';

	// Small pause before next screen
	await sleep(100);

	// Now safe to transition
	onConfirmCard();
}
```

#### DICE_FADE (250ms) / DICE_DELAY (500ms) - Dice Animations

**Use for:**

- Dice fade-out after roll complete
- Delay before dice disappear (allows result reading)

**Example:**

```svelte
<script>
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
	import { fade, scale } from 'svelte/transition';

	// After dice roll completes
	async function onRollComplete() {
		// Wait for player to see result
		await sleep(ANIMATION_DURATION.DICE_DELAY);

		// Fade out dice
		showDice = false; // Triggers transition:fade
	}
</script>

{#if showDice}
	<div
		class="dice-container"
		transition:fade={{
			duration: ANIMATION_DURATION.DICE_FADE
		}}
	>
		<!-- Dice canvas -->
	</div>
{/if}
```

#### STORY_MODE (250ms) - Story Library Transitions

**Use for:**

- Story mode save list animations
- Save game card reveals
- Library navigation

---

## Common Patterns with Code Examples

### Pattern 1: Modal with Fog Overlay

**Use case:** Help modal, settings modal, confirmation dialogs

**Implementation:**

```svelte
<script>
	import OverlayModal from '$lib/components/OverlayModal.svelte';

	let showModal = $state(false);
</script>

<button onclick={() => (showModal = true)}> Open Modal </button>

<OverlayModal isVisible={showModal}>
	<div class="modal-content">
		<h2>Modal Title</h2>
		<p>Modal content goes here...</p>
		<button onclick={() => (showModal = false)}>Close</button>
	</div>
</OverlayModal>
```

**How it works:**

- `OverlayModal.svelte` handles all animation timing
- Fog overlay fades in simultaneously with modal (200ms)
- Modal scales from 0.95 to 1.0 with cubicOut easing
- Both fog and modal use `ANIMATION_DURATION.NORMAL`

**Custom fog transition:**

```javascript
// From OverlayModal.svelte
function cloudFogTransition(node, { delay = 0, duration = ANIMATION_DURATION.NORMAL }) {
	return {
		delay,
		duration,
		tick: (t) => {
			const eased = cubicOut(t);
			const scale = 0.95 + eased * 0.05; // Subtle scale from 0.95 to 1.0

			const clouds = node.querySelectorAll('.cloud');
			clouds.forEach((cloud) => {
				cloud.style.transform = `translate(-50%, -50%) scale(${scale})`;
			});

			node.style.opacity = `${eased}`;
		}
	};
}
```

### Pattern 2: Sequential Animation (Card Dismiss)

**Use case:** Card dismissal, multi-step transitions, narrative pacing

**Implementation:**

```svelte
<script>
	import { sleep } from '$lib/utils/timing.js';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	let animationStage = $state('revealed');

	/**
	 * Sequential animation pattern:
	 * 1. Start dismiss animation (600ms)
	 * 2. Wait for animation to complete
	 * 3. Reset animation stage
	 * 4. Brief pause (100ms)
	 * 5. Trigger next screen
	 */
	async function onDismiss() {
		if (animationStage !== 'revealed') return;

		// Phase 1: Start dismiss animation
		animationStage = 'dismissing';
		await sleep(ANIMATION_DURATION.CARD_DISMISS);

		// Phase 2: Reset to idle
		animationStage = 'idle';
		await sleep(100);

		// Phase 3: Safe to transition to next screen
		onConfirmCard();
	}
</script>

{#if animationStage === 'revealed'}
	<div class="card" transition:fade={{ duration: ANIMATION_DURATION.CARD_DISMISS }}>
		<p>{card.story}</p>
		<button onclick={onDismiss}>Continue</button>
	</div>
{/if}
```

**Why this pattern?**

- Prevents jarring jumps between screens
- Gives player time to absorb narrative content
- Ensures animation completes BEFORE state change
- Creates smooth, cinematic transitions

**Critical timing:**

```
CARD_DISMISS (600ms)  → Animation completes
+ PAUSE (100ms)       → Brief buffer
= 700ms total         → Next screen appears
```

### Pattern 3: Crossfade Transitions (Story Mode)

**Use case:** Round-to-round navigation, seamless content transitions

**Implementation:**

```svelte
<script>
	import { crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	// Create crossfade pair
	const [send, receive] = crossfade({
		duration: ANIMATION_DURATION.ROUND_TRANSITION,
		easing: cubicOut
	});

	let currentRound = $state(1);

	function nextRound() {
		currentRound++;
	}

	function previousRound() {
		currentRound--;
	}
</script>

<div class="story-container">
	{#key currentRound}
		<div class="round-content" in:receive={{ key: currentRound }} out:send={{ key: currentRound }}>
			<h2>Round {currentRound}</h2>
			<p>Round content goes here...</p>
		</div>
	{/key}

	<nav class="round-nav">
		<button onclick={previousRound} disabled={currentRound === 1}> Previous </button>
		<button onclick={nextRound}> Next </button>
	</nav>
</div>
```

**How it works:**

- `send` transition fades out old content
- `receive` transition fades in new content
- Svelte handles position interpolation between matching keys
- Smooth crossfade over 300ms with cubicOut easing

### Pattern 4: Button Hover Animations

**Use case:** Interactive buttons, status indicators, navigation elements

**Implementation:**

```svelte
<script>
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';
</script>

<button class="augmented-button"> Click Me </button>

<style>
	.augmented-button {
		/* Base state */
		background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
		border: 2px solid var(--color-cyber-magenta);
		color: var(--color-text-primary);
		padding: var(--space-md) var(--space-lg);

		/* Transition using FAST duration */
		transition:
			background-color 150ms ease-out,
			transform 150ms ease-out,
			box-shadow 150ms ease-out;
	}

	.augmented-button:hover {
		background: linear-gradient(135deg, #2a2a2a, #3a3a3a);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(217, 70, 239, 0.4);
	}

	.augmented-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(217, 70, 239, 0.3);
	}
</style>
```

**Why 150ms?**

- Fast enough to feel immediate
- Slow enough to be perceived as intentional
- Creates responsive, polished feel

### Pattern 5: Dice Roll with Fade-Out

**Use case:** 3D dice animations, temporary UI elements

**Implementation:**

```svelte
<script>
	import { fade, scale } from 'svelte/transition';
	import { ANIMATION_DURATION, Z_INDEX } from '$lib/constants/animations.js';
	import { sleep } from '$lib/utils/timing.js';

	let showDice = $state(false);
	let rolling = $state(false);

	async function onRoll() {
		showDice = true;
		rolling = true;

		// Dice roll animation (handled by DiceBox)
		const result = await rollDice();
		rolling = false;

		// Show result for DICE_DELAY duration
		await sleep(ANIMATION_DURATION.DICE_DELAY);

		// Fade out dice
		showDice = false;

		// Process result
		onRollComplete(result);
	}
</script>

{#if showDice}
	<div
		class="dice-container"
		style="z-index: {rolling ? Z_INDEX.DICE_ROLLING : Z_INDEX.DICE_HIDDEN};"
		transition:fade={{
			duration: ANIMATION_DURATION.DICE_FADE
		}}
	>
		<!-- Dice canvas rendered here -->
	</div>
{/if}

<style>
	.dice-container {
		position: fixed;
		inset: 0;
		pointer-events: none;
		transition: z-index 0s 250ms; /* Delay z-index change until fade completes */
	}
</style>
```

**Timing breakdown:**

```
1. Roll animation     → 1-2 seconds (DiceBox handles)
2. Show result        → 500ms (DICE_DELAY)
3. Fade out          → 250ms (DICE_FADE)
4. Z-index change    → After fade completes
```

### Pattern 6: Status Indicator Animations

**Use case:** Tower/stability changes, token updates, progress indicators

**Implementation:**

```svelte
<script>
	import { gameState } from '$lib/stores/gameStore.svelte.js';

	// Reactive tower value
	const tower = $derived(gameState.tower);

	// Track previous value for animation
	let previousTower = $state(tower);

	// Animate when value changes
	$effect(() => {
		if (tower !== previousTower) {
			// Trigger animation class
			const element = document.querySelector('.tower-value');
			element?.classList.add('value-changed');

			setTimeout(() => {
				element?.classList.remove('value-changed');
				previousTower = tower;
			}, ANIMATION_DURATION.FAST);
		}
	});
</script>

<div class="tower-stat">
	<span class="tower-label">Stability</span>
	<span class="tower-value">{tower}</span>
</div>

<style>
	.tower-value {
		font-size: var(--text-2xl);
		font-weight: 700;
		transition: all 150ms ease-out;
	}

	.tower-value.value-changed {
		transform: scale(1.2);
		color: var(--color-neon-cyan);
		text-shadow: 0 0 16px currentColor;
	}
</style>
```

---

## Component Library Reference

### OverlayModal.svelte

**Purpose:** Base modal component with fog overlay effect

**Features:**

- Layered fog clouds (back, mid, front) with SVG filters
- Simultaneous fog + modal fade-in (200ms)
- Scale transition (0.95 to 1.0) with cubicOut easing
- Custom `cloudFogTransition` function
- Configurable z-index and height
- Responsive behavior (mobile, landscape)

**Usage:**

```svelte
<OverlayModal isVisible={showModal} zIndex={50} fixedHeight="70dvh">
	<!-- Modal content -->
</OverlayModal>
```

**File:** `src/lib/components/OverlayModal.svelte`

### CardDeck.svelte

**Purpose:** Card drawing interface with sequential animations

**Features:**

- Multi-stage animation states: `idle`, `anticipating`, `materializing`, `revealed`, `dismissing`
- Auto-triggered card draw on idle state
- 600ms dismiss animation before state transition
- Canvas-based cyberpunk particle effects

**Animation stages:**

1. **Idle** → Auto-triggers card request
2. **Anticipating** (400ms) → Grid accelerates
3. **Materializing** (1000ms) → Card appears with glitch
4. **Revealed** → Stable display, player reads card
5. **Dismissing** (600ms) → Fade out before next screen

**File:** `src/lib/components/CardDeck.svelte`

### StoryMode.svelte

**Purpose:** Story viewer for completed games with round navigation

**Features:**

- Crossfade transitions between rounds (300ms)
- `[send, receive]` pattern for smooth content swapping
- Navigation throttling to prevent rapid clicking
- Journal entry integration

**Usage:**

```svelte
<StoryMode savedGame={gameData} onExit={() => exitStoryMode()} />
```

**File:** `src/lib/components/StoryMode.svelte`

### ThreeJSDiceBoxRoller.svelte

**Purpose:** 3D dice visualization with DiceBox library

**Features:**

- Shared DiceBox instance (prevents multiple WebGL contexts)
- Z-index management (9999 while rolling, -10 when hidden)
- 250ms fade-out with 500ms delay before fade
- Automatic resize handling

**File:** `src/lib/components/ThreeJSDiceBoxRoller.svelte`

### StatusDisplay.svelte

**Purpose:** Always-visible HUD showing game stats

**Features:**

- Z-index: 100 (always on top)
- Reactive stat updates with smooth transitions
- Responsive augmented-ui configurations
- Color-coded stability gradient (green = high, red = low)

**File:** `src/lib/components/StatusDisplay.svelte`

---

## Testing Checklist

Use this checklist when creating or reviewing animations:

### Duration & Easing

- [ ] Duration is within 150-300ms range (or documented exception)
- [ ] Uses animation constants from `$lib/constants/animations.js`
- [ ] Easing is mechanical/ethereal (cubicOut, ease-out, quintOut)
- [ ] NO bounce or spring easing functions
- [ ] Total animation sequence is under 1000ms (unless narratively justified)

### Performance

- [ ] Only animates `transform` and `opacity` (GPU-accelerated)
- [ ] Does NOT animate width, height, top, left, margin, padding
- [ ] Tested at 60fps in Chrome DevTools Performance panel
- [ ] Tested with CPU throttling (4x slowdown)
- [ ] Uses `will-change` only during animation (removed after)
- [ ] No layout thrashing (checked in DevTools)

### Accessibility

- [ ] Respects `prefers-reduced-motion` media query
- [ ] Focus management correct (modal opened = focus trapped)
- [ ] Background content uses `inert` attribute when modal open
- [ ] ARIA announcements for important state changes
- [ ] Keyboard navigation works during/after animations

### Visual Quality

- [ ] No visual glitches or incomplete fades
- [ ] Z-index layering correct (uses constants from `animations.js`)
- [ ] Smooth entry and exit (no jarring jumps)
- [ ] Animation completes before state transition
- [ ] Works in mobile viewport (tested at 375px width)

### Cross-Browser

- [ ] Tested in Chrome/Edge (Chromium)
- [ ] Tested in Firefox
- [ ] Tested in Safari (if available)
- [ ] Mobile Safari (iOS) tested for touch interactions
- [ ] No vendor prefix issues

### Code Quality

- [ ] Uses imported constants (not magic numbers)
- [ ] Includes explanatory comments for complex sequences
- [ ] Sequential animations use `async/await` pattern
- [ ] Error handling for interrupted animations
- [ ] Component cleanup (removes event listeners, clears timeouts)

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Using Bounce or Spring Easing

**Why it's wrong:**
Bounce and spring effects feel playful and cartoonish, breaking the atmospheric tension of the game.

**Bad example:**

```javascript
import { backOut, elasticOut } from 'svelte/easing';

// ❌ BAD - Creates bounce effect
<div transition:scale={{
  duration: 400,
  easing: backOut  // Overshoots then settles
}}>
```

**Good example:**

```javascript
import { cubicOut } from 'svelte/easing';

// ✅ GOOD - Smooth, controlled deceleration
<div transition:scale={{
  duration: 200,
  easing: cubicOut
}}>
```

### ❌ Anti-Pattern 2: Hardcoded Duration Values

**Why it's wrong:**

- Inconsistent timing across app
- Hard to update globally
- No documentation of purpose
- Breaks animation system standards

**Bad example:**

```javascript
// ❌ BAD - Magic number, no context
<div transition:fade={{ duration: 250 }}>
```

**Good example:**

```javascript
import { ANIMATION_DURATION } from '$lib/constants/animations.js';

// ✅ GOOD - Uses documented constant
<div transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
```

### ❌ Anti-Pattern 3: Animations Longer Than 500ms

**Why it's wrong:**

- Feels sluggish and unresponsive
- Blocks user interaction
- Increases perceived loading time
- Annoys users on repeated interactions

**Exception:** Narrative moments (card dismiss = 600ms) where absorption time is intentional.

**Bad example:**

```javascript
// ❌ BAD - Too slow for modal
<div transition:scale={{ duration: 800 }}>
```

**Good example:**

```javascript
// ✅ GOOD - Fast and responsive
<div transition:scale={{ duration: ANIMATION_DURATION.NORMAL }}>
```

### ❌ Anti-Pattern 4: Overlapping State Transitions

**Why it's wrong:**

- Creates race conditions
- Visual glitches (partial fades, jumps)
- Unpredictable behavior
- Difficult to debug

**Bad example:**

```javascript
// ❌ BAD - State changes immediately, animation still running
function onDismiss() {
	animationStage = 'dismissing';
	onConfirmCard(); // Called immediately!
}
```

**Good example:**

```javascript
// ✅ GOOD - Sequential pattern with async/await
async function onDismiss() {
	animationStage = 'dismissing';
	await sleep(ANIMATION_DURATION.CARD_DISMISS);
	animationStage = 'idle';
	await sleep(100);
	onConfirmCard(); // Called after animation completes
}
```

### ❌ Anti-Pattern 5: Forgetting `prefers-reduced-motion`

**Why it's wrong:**

- Excludes users with vestibular disorders
- Violates WCAG 2.1 accessibility standards
- Can cause nausea, dizziness, headaches
- Legal compliance issue in some jurisdictions

**Bad example:**

```css
/* ❌ BAD - No reduced motion support */
.animated-element {
	animation: slideIn 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Good example:**

```css
/* ✅ GOOD - Respects user preferences */
.animated-element {
	animation: slideIn 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
	.animated-element {
		animation: none !important;
		opacity: 1 !important;
	}
}
```

### ❌ Anti-Pattern 6: Using `z-index: 9999` Without Cleanup

**Why it's wrong:**

- Creates permanent high z-index elements
- Causes overlapping issues later
- Makes debugging difficult
- Interferes with modals and overlays

**Bad example:**

```css
/* ❌ BAD - Permanent high z-index */
.dice-container {
	z-index: 9999;
}
```

**Good example:**

```javascript
// ✅ GOOD - Conditional z-index with cleanup
import { Z_INDEX } from '$lib/constants/animations.js';

let rolling = $state(false);

<div
  class="dice-container"
  style="z-index: {rolling ? Z_INDEX.DICE_ROLLING : Z_INDEX.DICE_HIDDEN};"
>
```

### ❌ Anti-Pattern 7: Animating Layout Properties

**Why it's wrong:**

- Causes layout thrashing (forces browser reflow)
- Terrible performance (can drop to 15fps)
- Janky, stuttering animations
- Blocks main thread

**Bad example:**

```css
/* ❌ BAD - Animates layout properties */
.expanding-panel {
	transition:
		width 300ms ease-out,
		height 300ms ease-out,
		margin 300ms ease-out;
}
```

**Good example:**

```css
/* ✅ GOOD - Only animates GPU-accelerated properties */
.expanding-panel {
	transition:
		transform 300ms ease-out,
		opacity 300ms ease-out;
}

/* Use transform: scale() instead of width/height */
.expanding-panel.expanded {
	transform: scale(1.2);
}
```

### ❌ Anti-Pattern 8: Missing Animation Cleanup

**Why it's wrong:**

- Memory leaks from orphaned listeners
- Animations continue in background
- Components don't unmount cleanly
- Unexpected behavior when re-mounting

**Bad example:**

```javascript
// ❌ BAD - setTimeout not cleaned up
onMount(() => {
	setTimeout(() => {
		showModal = true;
	}, 1000);
});
```

**Good example:**

```svelte
<script>
	// ✅ GOOD - Cleanup in $effect return
	$effect(() => {
		const timeout = setTimeout(() => {
			showModal = true;
		}, 1000);

		return () => clearTimeout(timeout); // Cleanup
	});
</script>
```

---

## Performance Guidelines

### GPU-Accelerated Properties Only

**Always animate:**

- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (use sparingly, can be expensive)

**Never animate:**

- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `font-size`

**Why?**
GPU-accelerated properties don't trigger layout recalculation, allowing smooth 60fps animations.

### Using `will-change` Sparingly

`will-change` tells the browser to optimize for animation, but overuse causes memory issues.

**Good pattern:**

```javascript
// Apply will-change only during animation
function startAnimation() {
	element.style.willChange = 'transform, opacity';

	// Run animation
	element.classList.add('animating');

	setTimeout(() => {
		element.style.willChange = 'auto'; // Remove after animation
		element.classList.remove('animating');
	}, ANIMATION_DURATION.NORMAL);
}
```

### Profiling with Chrome DevTools Performance Tab

**Steps to profile animations:**

1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click **Record** (Ctrl+E)
4. Trigger your animation
5. Stop recording
6. Analyze the flame graph

**What to look for:**

- **Green bars** (Paint) should be minimal
- **Purple bars** (Layout/Reflow) should be absent during animation
- **Frame rate** should stay above 60fps (green line)
- **Yellow bars** (Scripting) should be brief

**Red flags:**

- Dropped frames (red triangles)
- Long purple layout bars
- Frame rate dipping below 30fps

### CPU Throttling Test

Always test animations with CPU throttling to simulate low-end devices:

1. Open Chrome DevTools
2. Go to **Performance** tab
3. Click gear icon (⚙️)
4. Set CPU throttling to **4x slowdown**
5. Test your animations

**Acceptance criteria:**

- Minimum 30fps on 4x slowdown
- No visual glitches or incomplete animations
- Smooth perceived motion (even if technically lower fps)

### Target Performance Benchmarks

| Device Type      | Target FPS | Acceptable FPS | Unacceptable FPS |
| ---------------- | ---------- | -------------- | ---------------- |
| Desktop          | 60fps      | 45fps          | Below 30fps      |
| Mobile (modern)  | 60fps      | 30fps          | Below 24fps      |
| Mobile (low-end) | 30fps      | 24fps          | Below 20fps      |

**Optimization strategies if below target:**

1. Reduce animation duration
2. Simplify easing function (use linear or ease-out)
3. Remove decorative animations (fog layers, particle effects)
4. Implement `prefers-reduced-motion` fallback

---

## Accessibility

### Respecting `prefers-reduced-motion`

All animations must respect the `prefers-reduced-motion` media query. This is a WCAG 2.1 Level AA requirement.

**Global implementation:**

```css
/* From src/styles.css */
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
	}
}
```

**Component-level implementation:**

```css
.modal {
	transition:
		opacity 200ms ease-out,
		transform 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
	.modal {
		transition: opacity 0.01ms linear !important;
		/* Skip transform animation entirely */
	}
}
```

**Svelte transition variant:**

```svelte
<script>
	import { fade } from 'svelte/transition';

	// Check for reduced motion preference
	const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const transitionDuration = prefersReducedMotion ? 1 : ANIMATION_DURATION.NORMAL;
</script>

{#if visible}
	<div transition:fade={{ duration: transitionDuration }}>Content</div>
{/if}
```

### Focus Management

When modals open, focus must be trapped to prevent keyboard navigation escaping the modal.

**Implementation:**

```svelte
<script>
	import { onMount } from 'svelte';

	let modalElement;
	let previousActiveElement;

	function trapFocus(e) {
		const focusableElements = modalElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (e.key === 'Tab') {
			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					lastElement.focus();
					e.preventDefault();
				}
			} else {
				if (document.activeElement === lastElement) {
					firstElement.focus();
					e.preventDefault();
				}
			}
		}
	}

	onMount(() => {
		previousActiveElement = document.activeElement;
		modalElement.focus();

		document.addEventListener('keydown', trapFocus);

		return () => {
			document.removeEventListener('keydown', trapFocus);
			previousActiveElement?.focus();
		};
	});
</script>

<div bind:this={modalElement} tabindex="-1" role="dialog">
	<!-- Modal content -->
</div>
```

### Inert Background Content

When a modal is open, background content should be marked as `inert` to prevent interaction.

**Implementation:**

```svelte
<script>
	let showModal = $state(false);

	$effect(() => {
		const gameContent = document.querySelector('#game-content');
		if (showModal) {
			gameContent?.setAttribute('inert', '');
		} else {
			gameContent?.removeAttribute('inert');
		}
	});
</script>

<div id="game-content">
	<!-- Main game content -->
</div>

{#if showModal}
	<OverlayModal>
		<!-- Modal content -->
	</OverlayModal>
{/if}
```

### ARIA Announcements

Important state changes should be announced to screen readers.

**Implementation:**

```svelte
<script>
	import { announce } from '$lib/utils/a11y.js';

	function onCardDrawn(card) {
		// Visual animation
		animationStage = 'revealed';

		// Announce to screen readers
		announce(`Drew ${card.description}. ${card.story}`);
	}
</script>

<!-- ARIA live region -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
	{announcementText}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
```

---

## Quick Reference Table

| Animation Type    | Duration | Easing   | Properties            | Example               |
| ----------------- | -------- | -------- | --------------------- | --------------------- |
| Button hover      | 150ms    | ease-out | transform, opacity    | Status button hover   |
| Button press      | 100ms    | ease-in  | transform             | Active state          |
| Tooltip reveal    | 150ms    | ease-out | opacity, transform    | Help icon tooltip     |
| Modal open        | 200ms    | cubicOut | opacity, scale        | Help modal            |
| Modal close       | 200ms    | cubicOut | opacity, scale        | Settings modal        |
| Fog overlay       | 200ms    | cubicOut | opacity, scale        | OverlayModal backdrop |
| Screen transition | 300ms    | ease-out | opacity, transform    | Intro → Game          |
| Round crossfade   | 300ms    | cubicOut | opacity, position     | Story mode navigation |
| Card reveal       | 1000ms   | ease-out | opacity, transform    | Card materialization  |
| Card dismiss      | 600ms    | ease-out | opacity, transform    | Continue to next card |
| Dice fade         | 250ms    | ease-out | opacity, scale        | After roll complete   |
| Dice delay        | 500ms    | N/A      | N/A                   | Pause before fade     |
| Status change     | 150ms    | ease-out | transform, color      | Tower value update    |
| Progress bar      | varies   | linear   | width (via transform) | Card deck progress    |

---

## Migration Guide

### How to Add Animations to Existing Components

Follow these steps to add animations that conform to this style guide:

#### Step 1: Import Constants

```javascript
import { ANIMATION_DURATION, ANIMATION_EASING, Z_INDEX } from '$lib/constants/animations.js';
import { fade, scale } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';
```

#### Step 2: Choose Appropriate Duration/Easing

Refer to the [Decision Tree](#decision-tree-choosing-the-right-duration) to select duration.

**Common choices:**

- Button hover → `ANIMATION_DURATION.FAST` + `ease-out`
- Modal → `ANIMATION_DURATION.NORMAL` + `cubicOut`
- Screen transition → `ANIMATION_DURATION.SLOW` + `ease-out`

#### Step 3: Apply Svelte Transition or CSS Animation

**Svelte transition:**

```svelte
{#if visible}
	<div transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}>Content</div>
{/if}
```

**CSS animation:**

```css
.element {
	transition:
		opacity 200ms ease-out,
		transform 200ms ease-out;
}
```

#### Step 4: Add `prefers-reduced-motion` Support

```css
@media (prefers-reduced-motion: reduce) {
	.element {
		transition: opacity 0.01ms linear !important;
	}
}
```

#### Step 5: Test in DevTools

1. Open Chrome DevTools Performance panel
2. Record animation
3. Verify 60fps
4. Test with 4x CPU throttling
5. Enable `prefers-reduced-motion` in DevTools Rendering panel

#### Step 6: Review Against This Guide

Use the [Testing Checklist](#testing-checklist) to verify:

- ✅ Duration within standards
- ✅ Uses constants
- ✅ GPU-accelerated properties only
- ✅ Accessibility support
- ✅ Cross-browser tested

---

## Examples from the Codebase

### Example 1: OverlayModal.svelte (Modal Pattern)

**Location:** `src/lib/components/OverlayModal.svelte`

**Features:**

- Custom `cloudFogTransition` function
- Simultaneous fog + modal fade-in
- Scale from 0.95 to 1.0
- 200ms duration with cubicOut easing

**Key code:**

```svelte
<script>
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	function cloudFogTransition(node, { delay = 0, duration = ANIMATION_DURATION.NORMAL }) {
		return {
			delay,
			duration,
			tick: (t) => {
				const eased = cubicOut(t);
				const scale = 0.95 + eased * 0.05;

				const clouds = node.querySelectorAll('.cloud');
				clouds.forEach((cloud) => {
					cloud.style.transform = `translate(-50%, -50%) scale(${scale})`;
				});

				node.style.opacity = `${eased}`;
			}
		};
	}
</script>

{#if isVisible}
	<div
		class="fog-overlay"
		in:cloudFogTransition={{ duration: ANIMATION_DURATION.NORMAL }}
		out:cloudFogTransition={{ duration: ANIMATION_DURATION.NORMAL }}
	>
		<div class="cloud back"></div>
		<div class="cloud mid"></div>
		<div class="cloud front"></div>
	</div>

	<div
		class="modal-wrapper"
		in:scale={{ duration: ANIMATION_DURATION.NORMAL, start: 0.95, opacity: 0, easing: cubicOut }}
		out:scale={{ duration: ANIMATION_DURATION.NORMAL, start: 0.95, opacity: 0, easing: cubicOut }}
	>
		{@render children()}
	</div>
{/if}
```

### Example 2: CardDeck.svelte (Sequential Animation)

**Location:** `src/lib/components/CardDeck.svelte`

**Features:**

- Multi-stage animation states
- Sequential async/await pattern
- 600ms dismiss before state transition

**Key code:**

```javascript
async function onDismiss() {
	if (animationStage !== 'revealed') return;

	// Start dismiss animation (600ms)
	animationStage = 'dismissing';
	await sleep(ANIMATION_DURATION.CARD_DISMISS);

	// Reset animation stage
	animationStage = 'idle';

	// Small pause before next screen
	await sleep(100);

	// Now safe to transition
	onConfirmCard();
}
```

### Example 3: StoryMode.svelte (Crossfade)

**Location:** `src/lib/components/StoryMode.svelte`

**Features:**

- Crossfade transitions between rounds
- Navigation throttling
- 300ms duration with cubicOut easing

**Key code:**

```svelte
<script>
	import { crossfade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ANIMATION_DURATION } from '$lib/constants/animations.js';

	const [send, receive] = crossfade({
		duration: ANIMATION_DURATION.ROUND_TRANSITION,
		easing: cubicOut
	});

	let currentRoundIndex = $state(0);
	let isNavigating = $state(false);

	function nextRound() {
		if (!canGoNext || isNavigating) return;
		isNavigating = true;
		setTimeout(() => {
			currentRoundIndex++;
			isNavigating = false;
		}, ANIMATION_DURATION.FAST);
	}
</script>

{#key currentRound}
	<div in:receive={{ key: currentRound }} out:send={{ key: currentRound }}>
		<!-- Round content -->
	</div>
{/key}
```

---

## Versioning and Updates

**Current Version:** 1.0
**Effective Date:** November 2025

**Change Log:**

- **v1.0 (Nov 2025):** Initial style guide based on Phase 1/2 animation work

**Future Updates:**

- Add video/GIF examples for each pattern
- Create interactive animation playground
- Document advanced patterns (gesture-based animations, parallax)
- Expand cross-browser testing guidelines

---

## Additional Resources

- **Animation Constants:** `src/lib/constants/animations.js`
- **Example Components:** `src/lib/components/OverlayModal.svelte`, `CardDeck.svelte`, `StoryMode.svelte`
- **Global Styles:** `src/styles.css`
- **WCAG 2.1 Animation Guidelines:** https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- **Svelte Transitions Docs:** https://svelte.dev/docs/svelte/transition
- **Chrome DevTools Performance:** https://developer.chrome.com/docs/devtools/performance

---

**Questions or feedback?** Open an issue or contact the development team.
