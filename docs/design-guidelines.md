# Design Guidelines: Dimm City Solo RPG

**Purpose:** Translate the emotional impact of physical Wretched & Alone games into digital form through intentional design of every interaction.

**Version:** 1.0
**Last Updated:** 2025-11-11

---

## Core Design Philosophy

Every design decision should answer these questions:

1. **Does this feel weighted?** - Animations have physics, interactions have consequence
2. **Does this build tension?** - Progression creates mounting dread or hope
3. **Does this create ritual?** - Pacing allows contemplation
4. **Does this support narrative?** - Details reinforce theme

---

## 1. Atmospheric Foundation

### 1.1 Background Design

**Don't:** Leave vast empty dark spaces (feels like UI bugs)

**Do:** Layer subtle atmospheric elements

```css
.dc-table-bg {
	background-color: #1a1520; /* Darker, moodier base */
	background-image:
    /* Subtle mood lighting */
		radial-gradient(circle at 20% 80%, rgba(217, 70, 239, 0.03) 0%, transparent 50%),
		radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.02) 0%, transparent 50%),
		/* Thematic pattern (e.g., detective's evidence board grid) */
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 40px,
				rgba(217, 70, 239, 0.03) 40px,
				rgba(217, 70, 239, 0.03) 41px
			),
		repeating-linear-gradient(
			90deg,
			transparent,
			transparent 40px,
			rgba(217, 70, 239, 0.03) 40px,
			rgba(217, 70, 239, 0.03) 41px
		);
	/* Focus attention with vignette */
	box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
}
```

**Key Principles:**

- Patterns should be subtle (2-5% opacity)
- Use 2-3 layered gradients maximum
- Add depth without clutter
- Theme-specific patterns reinforce narrative

### 1.2 Sound Design

**Critical:** Sound is 50% of immersion

**Sound Categories:**

- **Ambient** - Continuous mood (30-40% volume, looped, fades in/out)
- **Interaction** - Card draws, dice rolls, button clicks (50-70% volume)
- **Emotional** - Damage, failure cards, victory (60-80% volume)
- **Atmospheric** - Round starts, journal moments (40-50% volume)

**Implementation Pattern:**

```javascript
// Create centralized sound manager
class SoundManager {
	play(soundKey, options = {}) {
		if (!this.enabled) return;
		// Clone to allow overlapping sounds
		// Apply volume, fade-in if specified
	}

	startAmbient(soundKey) {
		// Loop with fade-in over 3 seconds
		// Keep at 30-40% of main volume
	}
}

// Use in components
soundManager.play('card-draw', { volume: 0.6 });
await sleep(300);
soundManager.play('card-flip', { volume: 0.5 });
```

**Sound Sourcing:**

- freesound.org (CC0), zapsplat.com (free tier)
- MP3, 128kbps, mono for effects, stereo for ambient
- Keep total under 5MB

---

## 2. Tactile Interaction & Animation

### 2.1 Animation Principles

Follow Disney's 12 principles, especially:

- **Anticipation** - Lift before action
- **Follow-through** - Settle bounce after action
- **Timing** - Slow in, fast through, slow out

### 2.2 Card Animation Pattern

**Multi-stage with sound coordination:**

```css
/* Stage 1: Anticipation (300ms) */
.card.lifting {
	transform: translateY(-20px) scale(1.05);
	box-shadow:
		0 20px 40px rgba(0, 0, 0, 0.5),
		0 0 30px rgba(217, 70, 239, 0.4);
}

/* Stage 2: Action (800ms) */
.card.flipping {
	animation: card-3d-flip 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	transform-style: preserve-3d;
}

/* Stage 3: Follow-through (600ms) */
.card.revealed {
	animation: card-settle 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

**Timing:** Total ~1.7 seconds matches contemplative pace of physical card drawing

**JavaScript Pattern:**

```javascript
async function drawCard(cardData) {
	cardElement.classList.add('lifting');
	soundManager.play('card-draw');
	await sleep(300);

	cardElement.classList.remove('lifting');
	cardElement.classList.add('flipping');
	await sleep(400); // Halfway through flip
	soundManager.play('card-flip');
	updateCardContent(cardData); // Update when edge-on
	await sleep(400);

	cardElement.classList.remove('flipping');
	cardElement.classList.add('revealed');
	soundManager.play('card-place', { volume: 0.4 });
}
```

### 2.3 Hover States

**Pattern:** Lift, rotate slightly, enhance glow

```css
.interactive-element:hover {
	transform: translateY(-8px) rotate(-2deg);
	box-shadow:
		0 12px 30px rgba(0, 0, 0, 0.5),
		0 0 20px rgba(0, 255, 255, 0.3);
	transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	cursor: grab;
}

.interactive-element:active {
	cursor: grabbing;
	transform: translateY(-4px) scale(0.98);
}
```

---

## 3. Emotional Progression & Tension

### 3.1 Health Meter - Make Damage HURT

**Visual Feedback:**

```css
/* Progressive color states */
.health-value[data-percent='high'] {
	/* 70-100% */
	color: var(--color-toxic-green);
}
.health-value[data-percent='medium'] {
	/* 40-69% */
	color: var(--color-brand-yellow);
}
.health-value[data-percent='low'] {
	/* 20-39% */
	color: #ff6b00;
	animation: health-warning-pulse 1.5s ease-in-out infinite;
}
.health-value[data-percent='critical'] {
	/* 1-19% */
	color: #ff0000;
	animation: health-critical-pulse 1s ease-in-out infinite;
}
```

**Damage Impact:**

```javascript
function handleDamage(amount) {
	// Visual: shake screen and flash meter
	healthMeterElement.classList.add('damage-flash');
	gameScreenElement.classList.add('taking-damage');

	// Audio: heavy heartbeat
	soundManager.play('health-loss', { volume: 0.7 });

	// Haptic: if supported
	if (navigator.vibrate) {
		navigator.vibrate([100, 50, 100]);
	}

	// Cleanup after 600ms
}
```

### 3.2 Failure Cards - Build Dread

**Different animation to signal danger:**

```css
.card.failure-card {
	/* Hesitation before flip creates suspense */
	animation: failure-card-reveal 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.card.failure-card.revealed {
	/* Ominous red glow */
	box-shadow:
		0 8px 32px rgba(0, 0, 0, 0.6),
		0 0 30px rgba(255, 0, 0, 0.3);
	animation: failure-ominous-pulse 2s ease-in-out infinite;
}

/* Screen darkens with each failure */
.game-screen.failure-active {
	animation: screen-darken 0.8s ease-out forwards;
	filter: brightness(0.85);
}
```

**Escalating counter tension:**

```css
.failure-meter[data-count='1'] {
	color: var(--color-brand-yellow);
}
.failure-meter[data-count='2'] {
	color: #ff6b00;
	animation: failure-escalation 1.5s ease-in-out infinite;
}
.failure-meter[data-count='3'] {
	color: #ff0000;
	animation: failure-imminent 1s ease-in-out infinite;
}
```

---

## 4. Pacing & Ritual

### 4.1 Screen Transitions

**Create breathing room between game states:**

```javascript
async function nextScreen(screenName) {
	// Exit animation (400ms)
	currentElement.classList.add('screen-transition-out');
	soundManager.play('screen-transition', { volume: 0.3 });
	await sleep(400);

	// Change screen
	currentScreen.set(screenName);
	await tick();

	// Enter animation (600ms)
	newElement.classList.add('screen-transition-in');
}
```

**Transition Types:**

- **Standard screens:** Fade + scale/slide
- **Round transitions:** Page-turn effect (like journal)
- **Journal:** Book-opening animation

**Total transition time:** 800-1200ms provides contemplation moment

---

## 5. Theme-Specific Enhancement

### 5.1 Visual Storytelling

**Match UI elements to game theme:**

**Detective Theme Example:**

```css
/* Magnifying glass cursor */
.card:hover {
	cursor:
		url('/cursors/magnifying-glass.png') 12 12,
		pointer;
}

/* Notebook ruled lines */
.journal-container {
	background-image: repeating-linear-gradient(
		transparent,
		transparent 29px,
		rgba(0, 255, 255, 0.1) 29px,
		rgba(0, 255, 255, 0.1) 30px
	);
}

/* Push-pin holding evidence photos */
.card.revealed::after {
	/* Pin graphic in corner */
}
```

**Sci-Fi Theme Example:**

- Holographic flicker effects
- Scanline overlays
- Terminal/console aesthetics

**Horror Theme Example:**

- Blood drip effects
- Torn paper textures
- Flickering lights

---

## 6. Performance & Accessibility

### 6.1 Animation Performance

**Use GPU-accelerated properties only:**

✅ **Do use:** `transform`, `opacity`
❌ **Don't use:** `width`, `height`, `top`, `left` (causes reflow)

**Pattern:**

```css
/* Good - GPU accelerated */
.animate {
	transform: translateX(100px);
	opacity: 0.5;
}

/* Bad - causes reflow */
.animate {
	left: 100px;
	width: 200px;
}
```

### 6.2 Reduced Motion

**Respect user preferences:**

```css
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

### 6.3 Sound Controls

**Always provide toggle:**

```javascript
function toggleSound() {
	soundEnabled = !soundEnabled;
	soundManager.setEnabled(soundEnabled);
	localStorage.setItem('soundEnabled', soundEnabled);
}
```

---

## 7. Design Tokens

### 7.1 Animation Timing Constants

```css
:root {
	/* Durations */
	--anim-instant: 0.1s;
	--anim-fast: 0.3s;
	--anim-normal: 0.5s;
	--anim-slow: 0.8s;
	--anim-very-slow: 1.2s;

	/* Easing functions */
	--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
	--ease-smooth: cubic-bezier(0.175, 0.885, 0.32, 1.275);
	--ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
	--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
}
```

### 7.2 Health/Tension Thresholds

```javascript
const HEALTH_THRESHOLDS = {
	high: 70, // Green, no concern
	medium: 40, // Yellow, caution
	low: 20, // Orange, warning pulse
	critical: 1 // Red, urgent heartbeat
};
```

---

## 8. Implementation Priority

### Quick Wins (2 hours total)

1. **Background atmosphere** (15 min) - Layered gradients
2. **Card hover state** (10 min) - Lift and glow
3. **Health color progression** (30 min) - State-based colors

### Phase 1: Foundation (Week 1)

1. Sound system (6 hours)
2. Card animation enhancement (2 hours)
3. Screen transitions (2 hours)

### Phase 2: Emotional Impact (Week 2)

4. Health damage feedback (3 hours)
5. Failure card dread (2 hours)
6. Dice ceremony (1 hour)

### Phase 3: Polish (Week 3)

7. Theme-specific details (3 hours)
8. Success celebrations (2 hours)
9. Hover state refinement (2 hours)

---

## 9. Success Criteria

### Qualitative Goals

Players should report:

- Feeling genuinely nervous during critical moments
- Wanting to complete games even when failing
- Remembering specific moments vividly
- Describing it as "immersive" or "atmospheric"

### Quantitative Metrics

- Average time per decision increases by 30% (more contemplative)
- Session completion rate increases by 25%
- Maintains 60fps during all animations
- Sound assets load in under 3 seconds on 3G

---

## 10. Common Patterns

### Async Animation Sequence

```javascript
async function complexAnimation() {
	element.classList.add('phase-1');
	soundManager.play('sound-1');
	await sleep(300);

	element.classList.remove('phase-1');
	element.classList.add('phase-2');
	soundManager.play('sound-2');
	await sleep(500);

	element.classList.add('phase-3');
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### State-Based Styling

```javascript
// Calculate state
$: healthState = (() => {
	const percent = (health / maxHealth) * 100;
	if (percent >= 70) return 'high';
	if (percent >= 40) return 'medium';
	if (percent >= 20) return 'low';
	return 'critical';
})();

// Apply to element
<div class="health-value" data-percent={healthState}>
	{health}
</div>;
```

### Sound + Visual Coordination

```javascript
async function coordinatedFeedback() {
	// Start visual and audio together
	element.classList.add('impact');
	soundManager.play('impact-sound');

	// Time visual cleanup to audio end
	await sleep(600);
	element.classList.remove('impact');
}
```

---

## Remember

> **Transform from utility app to experience**
>
> W&A games succeed through tactile tension, ritual pacing, and inevitable doom. Every design choice should amplify these feelings digitally.

**Questions to ask:**

- Would this feel satisfying to repeat 50+ times in a game?
- Does this create a moment of pause/contemplation?
- Does this make success feel earned and failure feel consequential?
- Does this enhance or distract from the narrative?

---

**Next Steps:**

1. Implement Quick Wins (validate approach)
2. Build Phase 1 Foundation (test with players)
3. Iterate based on emotional feedback
4. Layer in Phase 2 & 3 enhancements

**Document Status:** Living document - update as patterns emerge
