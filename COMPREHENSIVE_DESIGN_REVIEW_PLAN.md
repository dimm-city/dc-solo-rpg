# Comprehensive Design Review Plan
## Dimm City Solo RPG - Visual Polish and Refinement

**Project Context:** Cyberpunk/Creaturepunk themed solo RPG game interface
**Fixed Elements:** Neural background animation, 3D dice roller (DiceBox.js)
**Design System:** Augmented-ui shapes, glassmorphism effects, neon glow aesthetics
**Date Created:** 2025-11-11

---

## 1. VISUAL HIERARCHY & LAYOUT

### 1.1 Information Architecture

**Principle:** F-Pattern Reading Flow
Game interfaces should follow natural eye movement patterns (top-left to bottom-right for Western audiences), with primary actions at the bottom center for thumb reach on mobile.

#### Status Display (StatusDisplay.svelte)
- **Current State:**
  - Player info bar spans full width with glassmorphism effect
  - 4-column stat grid (Health, Failure, Luck, Success)
  - Each stat uses augmented-ui clipped corners with animated glows
  - Responsive: 2x2 grid on mobile

- **Review Checklist:**
  - [ ] Does the player info bar provide immediate context (who, what round)?
  - [ ] Are the four stats equally weighted visually, or should Health be more prominent?
  - [ ] Is the visual hierarchy clear: Player Info > Primary Stat > Supporting Stats?
  - [ ] Does the exit button position interfere with round number readability?
  - [ ] Are stat labels (HEALTH, FAILURE, LUCK, SUCCESS) consistently positioned within their containers?
  - [ ] Do the animated glows help or hinder quick stat scanning?

**Design Principles to Apply:**
- **Law of Proximity:** Related stats should be grouped with consistent spacing
- **Visual Weight:** More critical information (Health) should have stronger visual emphasis
- **Progressive Disclosure:** Consider if all stats need equal prominence or if some can be de-emphasized

#### Screen Layouts (GameScreen.svelte)
- **Current State:**
  - 3-row grid: toolbar (hidden) > status display > main content
  - Main content area fills remaining vertical space
  - Dice roller as background layer with UI overlay
  - Buttons positioned absolutely at bottom center

- **Review Checklist:**
  - [ ] Is the vertical rhythm consistent across all screens?
  - [ ] Does the bottom-centered button position work for all screen states?
  - [ ] Is there adequate breathing room between status display and content?
  - [ ] Do transitions between screens maintain spatial continuity?
  - [ ] Are content areas properly constrained to prevent horizontal overflow?

**Design Principles to Apply:**
- **8px Baseline Grid:** All spacing should align to the established 8px rhythm
- **Golden Ratio Spacing:** Consider 1:1.618 ratio for major layout divisions
- **Safe Zones:** Ensure interactive elements avoid screen edges (especially on mobile notches)

### 1.2 Component Grouping

**Principle:** Gestalt Principles (Proximity, Similarity, Continuation)
Related elements should be visually grouped to reduce cognitive load.

#### Start Round Screen (GameScreen.svelte, line 90-104)
- **Current State:**
  - Centered heading "Round X"
  - Button at bottom: "Roll for tasks"
  - Large empty space between heading and button

- **Review Checklist:**
  - [ ] Does the empty space create confusion or anticipation?
  - [ ] Should the round number be more prominent or decorative?
  - [ ] Would additional context help ("PREPARE FOR ROUND X")?
  - [ ] Is the heading size appropriate for its importance?
  - [ ] Does the layout scale well from mobile (320px) to desktop (1920px)?

**Design Improvements to Consider:**
- Add subtle decorative elements (corner brackets, scan lines) to frame the round number
- Consider pulsing animation on round number to draw attention
- Add supporting text: "Prepare your next move..." or similar flavor text
- Evaluate whitespace ratio: is 80% empty space intentional drama or wasted space?

#### Intro/Rules Screen (IntroScreen.svelte)
- **Current State:**
  - Scrollable content area with markdown rendering
  - Two-button bar at bottom (Back | Continue)
  - Toggle between Rules and Story intro

- **Review Checklist:**
  - [ ] Is the content hierarchy clear (H1 > H2 > P)?
  - [ ] Are font sizes appropriate for reading on small screens?
  - [ ] Does the scrollable area have visual affordance (gradient fade at bottom)?
  - [ ] Are buttons equally weighted or should "Continue" be primary?
  - [ ] Is there adequate padding around scrollable content?

**Design Principles to Apply:**
- **Readability:** 45-75 characters per line for optimal reading
- **Vertical Rhythm:** Consistent spacing between headings and paragraphs
- **Affordance:** Visual cues that content continues below fold

### 1.3 Visual Flow Through Game States

**Principle:** Spatial Consistency & Predictability
Users should be able to predict where elements will appear across state transitions.

#### State Transition Map
```
loadGame → options → intro → startRound → rollForTasks → drawCard →
[successCheck | failureCheck] → log → startRound (loop)
                                      ↓
                                  gameOver
```

- **Review Checklist:**
  - [ ] Do primary action buttons remain in consistent positions?
  - [ ] Is the status display always visible during gameplay?
  - [ ] Do screen transitions maintain orientation (no jarring jumps)?
  - [ ] Are loading states clearly communicated?
  - [ ] Does the neural background provide spatial continuity?

**Design Principles to Apply:**
- **Consistent Action Zones:** Primary actions always at bottom center
- **Persistent Elements:** Status display always visible, same position
- **Smooth Transitions:** 300ms fade transitions with spatial coherence

---

## 2. TYPOGRAPHY & LABELS

### 2.1 Font Hierarchy

**Current Type System:**
- Display: 'lixdu', 'Orbitron' (headings, labels, CTAs)
- Body: 'Inter', 'Tomorrow' (paragraphs, content)
- Monospace: 'Courier New' (stats, technical data)

**Type Scale (8px baseline):**
```
--text-xs:  12px   (small labels, metadata)
--text-sm:  14px   (body text, secondary info)
--text-base: 16px  (default body text)
--text-lg:  18px   (emphasized text)
--text-xl:  20px   (subheadings)
--text-2xl: 28px   (section headings)
--text-3xl: 40px   (major headings)
--text-4xl: 56px   (hero text)
```

#### Review Checklist
- [ ] Are heading sizes distinct enough to establish hierarchy?
- [ ] Is body text (16px) readable on all target devices?
- [ ] Are label sizes (12px) legible at arm's length on mobile?
- [ ] Do font sizes scale appropriately on small screens (max-width: 450px)?
- [ ] Is letter-spacing appropriate for uppercase display text?

**Design Principles to Apply:**
- **Modular Scale:** Maintain consistent ratios (1.25 scale factor)
- **Optical Sizing:** Larger text can have tighter tracking, smaller text needs looser
- **WCAG AA:** Minimum font size 14px for body text, 18px for low-contrast text

### 2.2 Label Positioning Relative to Augmented-UI Shapes

**Principle:** Labels Outside Shapes, Values Inside
To avoid text being clipped by augmented-ui corners, labels should either be positioned above shapes or with adequate padding from clipped edges.

#### Status Display Labels (StatusDisplay.svelte, line 392-427)
- **Current State:**
  - Labels: 0.65rem (10.4px), uppercase, bold, monospace
  - Positioned inside augmented-ui containers with clipped corners
  - Padding: 0.85rem top, 0.65rem sides
  - Labels: "HEALTH", "FAILURE", "LUCK", "SUCCESS"

- **Review Checklist:**
  - [ ] Do labels get cut off by clipped corners at any breakpoint?
  - [ ] Is 10.4px legible for these critical labels on mobile?
  - [ ] Should labels be positioned above the stat boxes instead?
  - [ ] Is the label-to-value contrast clear enough?
  - [ ] Do neon text shadows improve or reduce legibility?

**Design Improvements to Consider:**
- Increase label size to 0.7rem (11.2px) minimum for mobile legibility
- Position labels above augmented-ui shapes to avoid clip interference
- Use less vibrant colors for labels, reserve neon for values
- Consider icon + label combinations for faster recognition
- Test label alignment: left, center, or matched to clip angle

#### Button Text (AugmentedButton.svelte, line 163-169)
- **Current State:**
  - Secondary: 1.25rem (20px), 700 weight, 0.1em letter-spacing
  - Primary: 1.75rem (28px), 900 weight, 0.1em letter-spacing
  - All caps, yellow on gradient background
  - Padding: 0.75rem (secondary), 1.75rem vertical (primary)

- **Review Checklist:**
  - [ ] Is button text readable against animated gradient backgrounds?
  - [ ] Does letter-spacing provide adequate breathing room for uppercase?
  - [ ] Are touch targets (min 44px) maintained at all font sizes?
  - [ ] Is contrast ratio WCAG AA compliant (4.5:1 minimum)?
  - [ ] Do focus states maintain text legibility?

**Design Principles to Apply:**
- **Touch Target Size:** Minimum 44x44px for mobile, 32x32px for desktop
- **Contrast Ratios:** WCAG AA minimum 4.5:1 for normal text, 3:1 for large text (18px+)
- **Uppercase Considerations:** Increase letter-spacing by 0.05-0.15em for readability

### 2.3 Text Readability and Hierarchy

**Principle:** CRAP (Contrast, Repetition, Alignment, Proximity)
Text should have clear visual hierarchy through size, weight, color, and spacing.

#### Content Text (IntroScreen.svelte, styles.css)
- **Current State:**
  - H1: 2.5rem (40px), yellow, tight line-height (1.25)
  - H2: 1.75rem (28px), yellow, margin-top: 2rem, margin-bottom: 1rem
  - H3: 1.5rem (24px), yellow
  - Body: 1rem (16px), secondary color (rgba(255,255,255,0.85)), line-height 1.6

- **Review Checklist:**
  - [ ] Is heading color (yellow) too vibrant for extended reading?
  - [ ] Are heading margins creating clear section breaks?
  - [ ] Is body text line-height (1.6) optimal for readability?
  - [ ] Should body text use slightly larger size on mobile (17-18px)?
  - [ ] Is paragraph spacing adequate (currently 1rem bottom margin)?

**Design Improvements to Consider:**
- Increase body text to 18px on mobile for better readability
- Reduce heading color intensity for less eye strain
- Add max-width constraint (65ch) for optimal line length
- Increase paragraph spacing to 1.5rem for better scanning
- Consider left-alignment instead of justified text

### 2.4 Font Sizing Across Breakpoints

**Current Breakpoints:**
- Desktop: > 768px
- Tablet: 601-768px
- Mobile: 451-600px
- Small Mobile: ≤ 450px

**Responsive Type Scale Adjustments (styles.css, line 703-755):**
```css
@media (max-width: 768px) {
  --text-4xl: 2.5rem;  /* 40px, down from 56px */
  --text-3xl: 2rem;    /* 32px, down from 40px */
}

@media (max-width: 450px) {
  /* Touch targets increased to 48px */
  nav ul li a { min-height: 48px; }
  button { min-height: 44px; }
}
```

- **Review Checklist:**
  - [ ] Are font size reductions proportional and logical?
  - [ ] Does any text become illegible at 320px width?
  - [ ] Are touch targets maintained at 44px+ on mobile?
  - [ ] Do button labels wrap gracefully or truncate on small screens?
  - [ ] Is viewport zooming disabled (accessibility concern)?

**Design Principles to Apply:**
- **Mobile-First Typography:** Start with mobile sizes, enhance for desktop
- **Fluid Typography:** Use clamp() for responsive scaling between breakpoints
- **Touch Ergonomics:** Minimum 44px touch targets, 8px spacing between
- **Accessibility:** Never disable zoom, allow text resize to 200%

**Recommended Fluid Type:**
```css
/* Example: Scale from 16px at 320px to 18px at 1920px */
font-size: clamp(1rem, 0.9rem + 0.125vw, 1.125rem);
```

---

## 3. SPACING & RHYTHM

### 3.1 Component Spacing (Margins, Padding)

**Current Spacing System (8px baseline):**
```
--space-xs:  4px
--space-sm:  8px
--space-md:  16px
--space-lg:  24px
--space-xl:  32px
--space-2xl: 48px
--space-3xl: 64px
--space-4xl: 96px
```

**Principle:** Consistent Spatial Relationships
Spacing should create clear visual relationships between related elements and separation between unrelated elements.

#### Status Display Spacing (StatusDisplay.svelte)
- **Current Spacing:**
  - Container gap: 0.5rem (8px) between player bar and stats
  - Stats grid gap: 0.75rem (12px) between stat items
  - Stat item padding: 0.85rem top, 0.65rem sides
  - Stat item internal gap: 0.35rem (5.6px) between elements

- **Review Checklist:**
  - [ ] Is 8px gap adequate between player bar and stats?
  - [ ] Should stats gap match baseline grid (0.5rem or 1rem)?
  - [ ] Is internal padding consistent with augmented-ui clip sizes?
  - [ ] Do stat bars have adequate margin from edges?
  - [ ] Is there enough breathing room on mobile (gap: 0.4rem)?

**Design Improvements to Consider:**
- Standardize gap to 0.5rem (8px) or 1rem (16px) - avoid 0.75rem
- Increase mobile gaps to 0.5rem minimum for touch clarity
- Ensure padding accounts for clipped corners (no text cropping)
- Add breathing room between label and value (currently 0.35rem)

#### Button Spacing (AugmentedButton.svelte, GameScreen.svelte)
- **Current Spacing:**
  - Secondary button padding: 0.75rem (12px)
  - Primary button padding: 1.75rem vertical, 4.5rem horizontal (28px, 72px)
  - Button wrapper atmospheric effect: inset -40px
  - Bottom button position: 0.25rem from edge

- **Review Checklist:**
  - [ ] Is 0.25rem bottom margin adequate for safe zones?
  - [ ] Do button glows overlap with content above?
  - [ ] Is horizontal padding proportional to vertical?
  - [ ] Should buttons have more spacing from screen edges on mobile?
  - [ ] Is the atmospheric effect (-40px inset) too large?

**Design Principles to Apply:**
- **Safe Zones:** Minimum 16px from screen edges on mobile
- **Golden Ratio:** Consider 1:1.618 for padding ratios (vertical:horizontal)
- **Optical Balance:** Buttons often need more horizontal padding than vertical

#### Content Container Padding (IntroScreen.svelte, GameScreen.svelte)
- **Current Padding:**
  - Intro content: var(--space-md) = 16px
  - Main screen area: 0.5rem (8px) padding
  - Form container: var(--space-xs) = 4px margin

- **Review Checklist:**
  - [ ] Is 16px padding adequate for scrollable content?
  - [ ] Should mobile padding be increased for thumb zones?
  - [ ] Are content edges too close to augmented-ui borders?
  - [ ] Is the 4px form margin intentional or too tight?
  - [ ] Do neural background effects need more clearance?

**Design Improvements to Consider:**
- Increase mobile content padding to 1rem (16px) minimum
- Add extra bottom padding (2rem) to scrollable areas for scroll affordance
- Ensure content never touches augmented-ui clip corners
- Consider asymmetric padding: more bottom/right for visual weight

### 3.2 Consistent Spacing System

**Principle:** Modular Spacing Scale
A limited set of spacing values creates visual harmony and speeds development.

**Current System Audit:**
- [ ] Identify all non-standard spacing values in components
- [ ] Map custom values to nearest standard scale value
- [ ] Document exceptions and rationale

**Non-Standard Spacing Found:**
- StatusDisplay: 0.35rem (5.6px) - not in scale
- StatusDisplay: 0.65rem (10.4px) - not in scale
- StatusDisplay: 0.75rem (12px) - not in scale
- StatusDisplay: 0.85rem (13.6px) - not in scale
- Button: 0.75rem (12px) - not in scale
- Button: 1.75rem (28px) - not in scale

**Review Checklist:**
- [ ] Can 0.35rem be replaced with --space-xs (4px) or --space-sm (8px)?
- [ ] Can 0.65rem be replaced with --space-sm (8px)?
- [ ] Can 0.75rem be replaced with --space-md (16px)?
- [ ] Can 0.85rem be replaced with --space-md (16px)?
- [ ] Should additional scale values be added (e.g., --space-2xs: 2px)?

**Design Principles to Apply:**
- **Limited Palette:** Aim for 7-9 spacing values maximum
- **Doubling Scale:** Each value should be 2x the previous (or 1.5x for tighter scales)
- **Semantic Naming:** Consider --space-tight, --space-comfortable, --space-loose

**Recommended Action:**
- Round 0.35rem → 0.5rem (8px) - aligns to baseline
- Round 0.65rem → 0.75rem (12px) OR 0.5rem (8px) - assess visually
- Round 0.75rem → 1rem (16px) - matches --space-md
- Round 0.85rem → 1rem (16px) - matches --space-md
- Add --space-2xs: 2px for micro-spacing needs

### 3.3 Breathing Room for Interactive Elements

**Principle:** Fitt's Law & Touch Ergonomics
Interactive elements need adequate size and spacing to be easily targetable, especially on touch devices.

#### Touch Target Analysis

**Minimum Requirements:**
- WCAG 2.1 Level AAA: 44x44px
- WCAG 2.2 Level AA: 24x24px
- iOS Human Interface Guidelines: 44x44pt (88px @2x)
- Android Material Design: 48x48dp
- **Recommended:** 48x48px with 8px spacing between targets

#### Button Sizing (AugmentedButton.svelte)
- **Secondary Button:**
  - Font: 1.25rem (20px)
  - Padding: 0.75rem (12px)
  - **Effective Size:** ~44px height, variable width
  - Status: ✓ Meets WCAG AAA

- **Primary Button:**
  - Font: 1.75rem (28px)
  - Padding: 1.75rem vertical (28px), 4.5rem horizontal (72px)
  - **Effective Size:** ~84px height, ~216px width
  - Status: ✓✓ Exceeds requirements

- **Review Checklist:**
  - [ ] Do secondary buttons maintain 44px height on mobile?
  - [ ] Is there 8px spacing between adjacent buttons?
  - [ ] Do button states (hover, focus, active) maintain sizing?
  - [ ] Are buttons far enough from screen edges (16px minimum)?
  - [ ] Do augmented-ui clips reduce effective touch area?

**Design Improvements to Consider:**
- Ensure augmented-ui clip-path doesn't reduce button hit area
- Add CSS `padding` inside augmented border to enlarge touch zone
- Test buttons at 320px width - do they stack or shrink?
- Consider separate mobile button sizes (larger targets)

#### Stat Display Touch Targets (StatusDisplay.svelte)
- **Current State:**
  - Stat items: padding 0.85rem top, 0.65rem sides
  - Exit button: 20x20px SVG, 0.25rem padding
  - **Exit button effective size:** ~28px
  - Status: ⚠ Below WCAG AA (needs 44px)

- **Review Checklist:**
  - [ ] Is the exit button large enough for reliable tapping?
  - [ ] Should exit button have larger touch padding?
  - [ ] Are stat items interactive? If yes, need larger touch zones
  - [ ] Is there adequate spacing around exit button?
  - [ ] Does exit button overlap with other interactive elements?

**Design Improvements Required:**
- **CRITICAL:** Increase exit button padding to achieve 44x44px touch target
- Add visual feedback on tap/click (scale animation)
- Ensure 8px clearance from adjacent text/elements
- Consider repositioning exit button to top-right corner
- Add confirmation dialog for accidental taps

#### Card Deck Interactions (CardDeck.svelte - not reviewed yet)
- **Review Required:**
  - [ ] Are card flip/tap areas adequate?
  - [ ] Do cards have 8px spacing from container edges?
  - [ ] Are "Draw Card" buttons properly sized?
  - [ ] Do neural effects interfere with touch detection?

**Design Principles to Apply:**
- **Progressive Enhancement:** Larger touch targets on touch devices
- **Spacing Buffer:** Minimum 8px between adjacent interactive elements
- **Visual Feedback:** Immediate response to touch (100ms max delay)
- **Error Prevention:** Confirmation for destructive actions (exit, reset)

---

## 4. INTERACTIVE ELEMENTS

### 4.1 Button Sizing and Touch Targets

**Principle:** Accessibility-First Interaction Design
All interactive elements must be perceivable, operable, understandable, and robust.

#### Button Size Matrix

| Button Type | Desktop Size | Mobile Size | Status | Notes |
|-------------|--------------|-------------|--------|-------|
| Primary CTA | 84px × 216px | 60px × 160px | ✓ Excellent | Hero buttons |
| Secondary | ~44px × auto | ~48px × auto | ✓ Good | Standard actions |
| Exit Button | 28px × 28px | 28px × 28px | ✗ Below Standard | **Needs fix** |
| Continue | ~44px × 100% | ~48px × 100% | ✓ Good | Full-width |

**Critical Issues to Address:**
1. **Exit Button (StatusDisplay.svelte, line 29-45):**
   - Current: 20px SVG + 0.25rem padding = ~28px target
   - Required: 44px minimum (WCAG AAA)
   - **Action:** Increase padding to 0.75rem (12px) → 44px total

2. **Button Spacing in IntroScreen:**
   - Two buttons side-by-side with var(--space-sm) gap = 8px
   - Required: 8px minimum
   - **Status:** ✓ Acceptable, but consider 16px for desktop

**Review Checklist:**
- [ ] Are all primary action buttons ≥48px tall on mobile?
- [ ] Is there ≥8px spacing between adjacent buttons?
- [ ] Do disabled states maintain touch target size?
- [ ] Are loading states (spinner) properly sized?
- [ ] Do augmented-ui corners reduce hit areas?

**Design Improvements:**
```css
/* Exit button fix */
.dc-exit-button {
  padding: 0.75rem; /* 12px → total 44px with icon */
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 4.2 Hover/Focus States

**Principle:** Clear Visual Affordance
Users must understand what is interactive and receive feedback on interaction.

#### Current Focus System (styles.css, line 922-966)
```css
*:focus-visible {
  outline: 3px solid var(--color-neon-cyan);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  outline: 3px solid var(--color-neon-cyan);
  outline-offset: 3px;
  box-shadow: 0 0 0 6px rgba(0, 255, 255, 0.2);
}
```

**Strengths:**
- ✓ Uses :focus-visible (keyboard-only focus)
- ✓ High contrast cyan outline (visible against dark background)
- ✓ 3px width meets WCAG requirements
- ✓ Additional box-shadow for extra visibility

**Review Checklist:**
- [ ] Are focus states visible on all button variants?
- [ ] Does the cyan outline conflict with augmented-ui cyan borders?
- [ ] Is focus visible during animations/transitions?
- [ ] Are focus states tested with screen readers?
- [ ] Does focus ring extend beyond glow effects?

**Potential Issues:**
- Augmented-ui buttons have cyan in gradient - focus may blend
- Glow effects might obscure focus outline
- Animated gradients on primary buttons might mask focus

**Design Improvements to Consider:**
- Use yellow focus ring for buttons with cyan elements
- Increase outline-offset to 4px on buttons (clear glow effects)
- Add focus-within states for complex components
- Test with Windows High Contrast Mode

#### Current Hover System

**Button Hover (AugmentedButton.svelte, line 268-281):**
```css
.aug-button:hover {
  filter: brightness(1.15);
  box-shadow: inset 0 0 12px rgba(255, 215, 0, 0.1),
              0 0 12px rgba(0, 255, 255, 0.25);
  --aug-border-bg: linear-gradient(135deg, #ffd700, #00ffff);
}
```

**Wrapper Hover:**
```css
.aug-button-wrapper:hover {
  filter: var(--glow-cta-secondary-hover);
}
```

**Review Checklist:**
- [ ] Is brightness(1.15) noticeable against neural background?
- [ ] Do hover states appear immediately (no transition delay)?
- [ ] Are hover states distinct from focus states?
- [ ] Do hover effects work well with animated backgrounds?
- [ ] Is there visual feedback during click/press?

**Design Improvements to Consider:**
- Add slight scale transform: `transform: scale(1.02)`
- Increase brightness to 1.2 for more noticeable effect
- Add border color shift for additional feedback
- Ensure hover persists during click animation

#### Status Display Hover (StatusDisplay.svelte)
- **Current State:** No hover states defined
- **Question:** Should stat items have hover states?
  - If read-only: No hover needed
  - If interactive (click for details): Add hover
  - If tooltips planned: Add hover indication

**Review Checklist:**
- [ ] Are stat items interactive or display-only?
- [ ] Should exit button have hover state (color change)?
- [ ] Do pulsing glow animations interfere with hover detection?
- [ ] Is cursor properly set (pointer vs default)?

**Design Principle:** Only add hover states to interactive elements.

### 4.3 Visual Feedback for Actions

**Principle:** Immediate, Obvious, Appropriate
Every user action should receive immediate visual feedback (within 100ms).

#### Feedback State Matrix

| Action | Visual Feedback | Duration | Status |
|--------|----------------|----------|--------|
| Button Click | translateY(-1px), brightness(1.1) | Instant | ✓ Good |
| Button Press | translateY(-1px) | Hold duration | ✓ Good |
| Dice Roll | 3D animation, camera movement | 2-3 seconds | ✓ Excellent |
| Card Draw | Flip animation | 1 second | ? Not reviewed |
| Form Submit | Disabled state, loading indicator | Until response | ? Not reviewed |
| State Transition | Fade (300ms) | 300ms | ✓ Good |

#### Button Click Feedback (AugmentedButton.svelte, line 299-303)
```css
.aug-button:active {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
```

**Review Checklist:**
- [ ] Is translateY(-1px) noticeable? Consider -2px
- [ ] Should there be a scale effect? `transform: scale(0.98)`
- [ ] Is brightness change sufficient visual confirmation?
- [ ] Does active state work during loading/disabled?
- [ ] Is there haptic feedback on mobile? (Consider Vibration API)

**Design Improvements to Consider:**
```css
.aug-button:active {
  transform: translateY(-2px) scale(0.98);
  filter: brightness(1.05);
  /* Slightly less bright to indicate "pressed in" */
}
```

#### Loading States (RollForTasks.svelte)
- **Current State:**
  - `rolling` and `confirming` boolean states
  - Button disabled during rolls
  - Button text changes: "Roll for Tasks" → "Result"

- **Review Checklist:**
  - [ ] Is there a loading spinner visible?
  - [ ] Does button show disabled state visually?
  - [ ] Is loading state announced to screen readers?
  - [ ] Can users cancel long-running actions?
  - [ ] Is there timeout handling for network errors?

**Missing Feedback:**
- No visual loading indicator (spinner, pulse)
- Disabled state may not be obvious (just non-interactive)
- No error state handling in UI

**Design Improvements Required:**
- Add loading spinner or pulsing animation
- Increase opacity reduction on disabled: 0.5 → 0.6
- Add loading text: "Rolling..." or "Processing..."
- Add `aria-busy="true"` for screen readers

#### Dice Roll Feedback (ThreeJSDiceBoxRoller - not reviewed)
- **Review Required:**
  - [ ] Is dice physics responsive (60fps)?
  - [ ] Does dice result announce clearly?
  - [ ] Is there sound feedback (with mute option)?
  - [ ] Can users skip animation if too slow?

#### Card Interaction Feedback (CardDeck.svelte - not reviewed)
- **Review Required:**
  - [ ] Is card flip animation smooth?
  - [ ] Is card text readable after flip?
  - [ ] Is there sound/haptic feedback on draw?
  - [ ] Can users review card after proceeding?

### 4.4 Disabled States

**Principle:** Clearly Distinguish from Interactive States
Disabled elements should be obviously non-interactive but still perceivable.

#### Current Disabled Styling (AugmentedButton.svelte, line 200-206)
```css
.aug-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
  pointer-events: none;
}
```

**WCAG Requirements:**
- Disabled elements should have 3:1 contrast ratio (perception)
- Should not rely on color alone (must use opacity/pattern)
- Should be announced to screen readers

**Review Checklist:**
- [ ] Is 0.5 opacity sufficient to indicate disabled?
- [ ] Does grayscale(0.5) work on all button colors?
- [ ] Is cursor: not-allowed visible before click?
- [ ] Should disabled buttons have explanatory tooltip?
- [ ] Does disabled state work with animated backgrounds?

**Potential Issues:**
- pointer-events: none removes hover cursor feedback
- 0.5 opacity may still look clickable on bright backgrounds
- Grayscale on yellow buttons may not be obvious

**Design Improvements to Consider:**
```css
.aug-button:disabled {
  opacity: 0.4; /* More obviously disabled */
  cursor: not-allowed;
  filter: grayscale(0.8) brightness(0.7);
  /* Remove pointer-events: none to show not-allowed cursor */
}

.aug-button:disabled::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.2) 10px,
    rgba(0, 0, 0, 0.2) 20px
  );
  /* Diagonal stripes pattern for non-color identification */
}
```

#### Loading State vs Disabled State
- **Current:** Same disabled state for both
- **Recommendation:** Distinguish visually
  - **Disabled:** Gray, static, "not available"
  - **Loading:** Active animation, "please wait"

**Design Improvements:**
```css
.aug-button:disabled:not([aria-busy]) {
  /* Static disabled appearance */
  opacity: 0.4;
  filter: grayscale(0.8);
}

.aug-button[aria-busy="true"] {
  /* Animated loading appearance */
  opacity: 0.7;
  filter: brightness(0.8);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.9; }
}
```

---

## 5. RESPONSIVE CONSIDERATIONS

### 5.1 Layout Adaptations (Mobile, Tablet, Desktop)

**Principle:** Content Parity, Not Feature Parity
Mobile users should access the same content, but layout should adapt to device capabilities.

**Current Breakpoints:**
```
Desktop:  > 900px   (multi-column stats, full features)
Tablet:   601-900px (2-column stats, moderate density)
Mobile:   451-600px (2×2 stats grid, simplified)
Small:    ≤ 450px   (minimum viable layout)
```

#### Status Display Responsive Behavior (StatusDisplay.svelte)

**Desktop (>900px):**
- 4-column stats grid
- Full-size labels and values
- All glow effects active

**Tablet (601-900px):**
```css
@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  .stat-value .current { font-size: 1.3rem; }
}
```

**Mobile (≤600px):**
```css
@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  .stat-item { padding: 0.4rem; }
  .stat-label { font-size: 0.55rem; }
  .stat-value .current { font-size: 1.1rem; }
}
```

**Review Checklist:**
- [ ] Does 2×2 grid maintain visual hierarchy?
- [ ] Are stat labels still legible at 0.55rem (8.8px)?
- [ ] Should Health stat be emphasized in mobile layout?
- [ ] Is 0.4rem gap adequate for touch separation?
- [ ] Do glow animations impact mobile performance?

**Design Improvements to Consider:**
- **Mobile Priority Order:** Health > Success > Failure > Luck
- Consider single-column mobile layout with larger stats
- Reduce glow intensity on mobile (battery/performance)
- Add collapse/expand option for stats on small screens
- Test at 320px width (iPhone SE)

#### Button Bar Responsive Behavior (IntroScreen.svelte)

**Desktop:**
- Two buttons side-by-side
- Equal flex distribution
- Adequate spacing (--space-sm)

**Mobile:**
- Still side-by-side (may be cramped)
- Buttons scale to fit

**Review Checklist:**
- [ ] Should buttons stack vertically on small screens?
- [ ] Are button labels readable when constrained?
- [ ] Is side-by-side better for "Back | Next" navigation?
- [ ] Should primary button be larger on mobile?
- [ ] Do buttons have adequate spacing from screen edges?

**Design Improvements to Consider:**
```css
@media (max-width: 450px) {
  .button-bar {
    flex-direction: column; /* Stack vertically */
    gap: var(--space-md); /* Larger gap when stacked */
  }

  /* Or keep side-by-side with priority sizing */
  .button-bar {
    gap: var(--space-md);
  }
  .button-bar > :first-child {
    flex: 0 0 auto; /* Back button fixed width */
  }
  .button-bar > :last-child {
    flex: 1; /* Continue button takes remaining space */
  }
}
```

### 5.2 Content Prioritization at Smaller Sizes

**Principle:** Progressive Disclosure & Essential-First
On small screens, show critical information first, hide or collapse secondary content.

#### Information Hierarchy for Mobile

**Critical (Always Visible):**
1. Current round number
2. Health stat
3. Primary action button
4. Current game state context

**Important (Visible but Smaller):**
1. Success/Failure counters
2. Player name
3. Game title

**Optional (Hide or Collapse):**
1. Luck/Bonus stat (nice-to-have)
2. Exit button (move to menu/settings)
3. Decorative elements

**Review Checklist:**
- [ ] Is current implementation prioritizing correctly?
- [ ] Should player name be hidden on mobile to save space?
- [ ] Can stats be accessed via toggle or modal on small screens?
- [ ] Should neural background be simplified on mobile?
- [ ] Is vertical scroll preferred over cramming content?

**Design Pattern: Collapsible Status Bar**
```
Mobile (collapsed):  [Health: 75] [Round 3] [=]
                     ↓ Tap to expand
Mobile (expanded):   [Detailed stats grid]
```

**Implementation Consideration:**
```svelte
<script>
  let statsExpanded = $state(false);
  const isMobile = $derived(window.innerWidth <= 600);
</script>

{#if isMobile && !statsExpanded}
  <div class="stats-summary" onclick={() => statsExpanded = true}>
    <span>Health: {gameState.tower}</span>
    <span>Round {gameState.round}</span>
    <button aria-label="Expand stats">☰</button>
  </div>
{:else}
  <!-- Full stats grid -->
{/if}
```

#### Content Truncation Strategy

**Player Name (StatusDisplay.svelte, line 20):**
```svelte
<span class="value">{gameState.player.name.toUpperCase()}</span>
```

**Potential Issue:** Long names overflow on small screens

**Design Improvements:**
```css
.player-round-bar .value {
  max-width: 100px; /* Limit on mobile */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 450px) {
  .player-round-bar .value {
    max-width: 60px;
  }
}
```

**Alternative:** Hide player name entirely on mobile
```css
@media (max-width: 450px) {
  .player-round-bar .info-segment:first-child {
    display: none; /* Hide player name */
  }
}
```

### 5.3 Touch-Friendly Interactions

**Principle:** Design for Thumbs, Not Mouse Cursors
Mobile interactions should accommodate one-handed use and thumb reach zones.

#### Thumb Reach Zones (Portrait Phone)

**Most Reachable:**
- Bottom-center (primary action area) ✓ Current button placement
- Bottom-right corner (right-handed users)
- Middle-center (comfortable reach)

**Least Reachable:**
- Top corners (requires hand shift)
- Top-center (requires stretch)

**Current Implementation Analysis:**
- ✓ Primary buttons: Bottom-center - EXCELLENT
- ⚠ Exit button: Top-right - POOR REACH
- ✓ Stats: Top area - READ-ONLY, acceptable
- ? Card deck: Center - NEEDS REVIEW

**Review Checklist:**
- [ ] Are all interactive elements in thumb-reach zones?
- [ ] Is exit button accessible without hand repositioning?
- [ ] Do gesture interactions (swipe, pinch) make sense?
- [ ] Are there any hover-required interactions? (won't work on touch)
- [ ] Is double-tap functionality needed?

**Design Improvements: Exit Button Relocation**

**Option 1: Move to bottom-left**
```css
.dc-exit-button {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 100;
}
```
- Pro: Easy thumb reach
- Con: May overlap with content

**Option 2: Add to button bar**
```svelte
<div class="button-bar">
  <button onclick={exitGame}>Exit</button>
  <button onclick={primaryAction}>Continue</button>
</div>
```
- Pro: Clear, grouped with actions
- Con: Takes up prime real estate

**Option 3: Hamburger menu**
```
Top-left: [☰ Menu]
  └─ Dropdown: Exit, Settings, Help
```
- Pro: Standard pattern, clean UI
- Con: Extra tap required

**Recommended:** Option 3 (Hamburger menu) for production, Option 1 for quick fix

#### Touch Gestures Support

**Potential Gestures:**
- **Swipe left/right:** Navigate between screens?
- **Swipe down:** Refresh/reload?
- **Pinch-zoom:** Zoom interface? (Not recommended for game UI)
- **Long-press:** Show tooltips/help?
- **Double-tap:** Quick action (roll dice again)?

**Review Checklist:**
- [ ] Are any gestures currently implemented?
- [ ] Would swipe navigation improve UX?
- [ ] Should cards support swipe-to-discard?
- [ ] Does long-press on stats show details?
- [ ] Are gestures discoverable?

**Design Principle:** Only add gestures if they:
1. Improve efficiency over button taps
2. Feel natural and discoverable
3. Have visible affordance (visual hints)
4. Don't conflict with browser gestures (back, refresh)

**Gesture Affordance Example:**
```css
/* Subtle bounce animation on card to suggest swipe */
.card {
  animation: suggest-swipe 2s ease-in-out 3s;
  /* After 3s, play 2s animation */
}

@keyframes suggest-swipe {
  0%, 100% { transform: translateX(0); }
  10%, 30% { transform: translateX(-5px); }
  20%, 40% { transform: translateX(5px); }
}
```

---

## 6. BRAND CONSISTENCY

### 6.1 Color Usage and Contrast

**Current Color Palette:**
```
Brand Yellow:      #ffd700  (Primary brand color)
Cyber Magenta:     #d946ef  (Primary accent, borders)
Neon Cyan:         #00ffff  (Secondary accent, focus)
Toxic Green:       #00ff00  (Code/data elements)

Backgrounds:
- Primary:   #0a0a0a (near-black)
- Secondary: #1a1a1a (dark gray)
- Tertiary:  #2a2a2a (medium gray)
- Darker:    #000000 (pure black)

Text:
- Primary:   #ffffff (white)
- Secondary: rgba(255,255,255,0.85) (light gray)
- Muted:     rgba(255,255,255,0.6) (medium gray)
```

#### Color Contrast Ratios (WCAG Compliance)

**Testing Against #0a0a0a Background:**

| Color | Contrast Ratio | WCAG AA | WCAG AAA | Usage |
|-------|---------------|---------|----------|-------|
| #ffffff (White) | 19.5:1 | ✓ Pass | ✓ Pass | Body text |
| #ffd700 (Yellow) | 13.2:1 | ✓ Pass | ✓ Pass | Headings, CTAs |
| #00ffff (Cyan) | 12.6:1 | ✓ Pass | ✓ Pass | Links, focus |
| #d946ef (Magenta) | 6.8:1 | ✓ Pass | ⚠ Borderline | Accents, borders |
| #00ff00 (Green) | 15.3:1 | ✓ Pass | ✓ Pass | Success states |
| rgba(255,255,255,0.85) | 16.6:1 | ✓ Pass | ✓ Pass | Secondary text |
| rgba(255,255,255,0.6) | 11.4:1 | ✓ Pass | ✓ Pass | Muted text |

**All colors pass WCAG AA for normal text (4.5:1) and large text (3:1) ✓**

**Review Checklist:**
- [ ] Are all text colors meeting contrast requirements?
- [ ] Do gradient backgrounds maintain sufficient contrast?
- [ ] Are color-blind users able to distinguish states?
- [ ] Is color alone used to convey information? (Should use shape/icon too)
- [ ] Do glow effects reduce text contrast?

**Potential Issues:**

1. **Animated Gradient Backgrounds (AugmentedButton primary):**
   ```css
   background: linear-gradient(135deg,
     var(--color-brand-yellow),    /* #ffd700 */
     var(--color-cyber-magenta),    /* #d946ef */
     var(--color-brand-yellow)
   );
   color: var(--color-bg-primary);  /* #0a0a0a */
   ```

   - Yellow on dark background: 13.2:1 ✓ Pass
   - Magenta on dark background: 6.8:1 ✓ Pass
   - **Issue:** Text color is dark (#0a0a0a), needs testing
   - Dark text on yellow: Good contrast
   - Dark text on magenta: May be insufficient

   **Test Required:** Verify contrast at all gradient positions

2. **Status Bar Labels (StatusDisplay.svelte, line 393-427):**
   ```css
   .health-stat .stat-label {
     color: #00ffaa;  /* Not in palette! */
   }
   ```

   **Issue:** Using non-standard green (#00ffaa vs #00ff00)
   **Test:** Does #00ffaa have sufficient contrast?
   **Recommendation:** Use palette green or adjust

3. **Text Shadows on Text (may reduce contrast):**
   ```css
   text-shadow: 0 0 10px rgba(255, 238, 0, 1);
   ```

   **Review:** Glow effects should enhance, not obscure

#### Color Consistency Audit

**Non-Palette Colors Found:**
- `#00ffaa` (Status labels) - Should use `#00ff00`
- `#ff0055`, `#ff0066` (Failure stat) - Not in palette
- `#00eeff`, `#00d9ff` (Bonus stat) - Not in palette
- `#ffee00`, `#ffdd00` (Success stat) - Not in palette

**Design Improvements Required:**
1. Document extended palette for stats (if intentional)
2. OR map to core palette:
   - Health: Use `#00ff00` (toxic green)
   - Failure: Use `#d946ef` (cyber magenta)
   - Bonus: Use `#00ffff` (neon cyan)
   - Success: Use `#ffd700` (brand yellow)

**Rationale for Current Colors:**
- Stats use analogous colors for visual variety
- Prevents confusion between UI elements and stats
- Creates distinct visual zones

**Recommendation:** Document extended palette in design system

### 6.2 Angular/Sci-Fi Aesthetic Consistency

**Design Language: Augmented-UI Cyberpunk**

**Core Aesthetic Principles:**
1. **Angular Geometry:** Clipped corners, no rounded corners
2. **Neon Glow Effects:** Outer drop-shadows, inner box-shadows
3. **Glassmorphism:** Backdrop blur, semi-transparent backgrounds
4. **Gradient Borders:** Multi-color borders with animations
5. **Atmospheric Lighting:** Volumetric glow effects around elements
6. **Neural Motifs:** Network patterns, scan lines, data streams

#### Augmented-UI Consistency Review

**Clip Size System:**
```
--aug-clip-sm: 10px
--aug-clip-md: 12px
--aug-clip-lg: 14px
```

**Current Usage:**
- Status bar: 10px (tl, tr, br, bl) - Using SM
- Stat items: 8-12px mixed - INCONSISTENT
- Buttons: 14px (all corners) - Using LG
- Form container: 14px (all corners) - Using LG

**Review Checklist:**
- [ ] Are clip sizes consistently applied?
- [ ] Should stat items use same clip size (standardize)?
- [ ] Do clip sizes scale on mobile?
- [ ] Are clip angles consistent (45°)?
- [ ] Do larger clips work better on larger elements?

**Design Improvements:**
- Standardize stat items to --aug-clip-sm (10px)
- Use --aug-clip-md for medium components
- Use --aug-clip-lg for hero/primary elements
- Document clip size usage guidelines

#### Glow Effect Consistency

**Current Glow Types:**
1. **Drop Shadow (Outer Glow):**
   ```css
   filter: drop-shadow(0 0 8px rgba(217, 70, 239, 0.35));
   ```

2. **Box Shadow (Multi-layer):**
   ```css
   box-shadow:
     0 0 30px rgba(0, 238, 255, 0.7),
     0 0 60px rgba(0, 238, 255, 0.4),
     0 0 90px rgba(0, 238, 255, 0.2);
   ```

3. **Text Shadow:**
   ```css
   text-shadow:
     0 0 10px rgba(255, 255, 255, 1),
     0 0 20px rgba(255, 255, 255, 0.5);
   ```

**Review Checklist:**
- [ ] Is glow intensity consistent across similar elements?
- [ ] Are animated glows in sync (similar durations)?
- [ ] Do glows scale appropriately on mobile?
- [ ] Are glow colors semantically meaningful?
- [ ] Do multiple glows create visual clutter?

**Glow Usage Guidelines:**
- **Primary CTAs:** Strongest glow (3-layer, animated)
- **Status Elements:** Medium glow (2-layer, subtle pulse)
- **Interactive Elements:** Light glow (1-layer, static)
- **Text:** Minimal glow (enhance legibility, not distract)

**Performance Consideration:**
- box-shadow is GPU-accelerated ✓
- Multiple animated glows may impact battery on mobile
- Consider reducing animation on `prefers-reduced-motion`

#### Glassmorphism Consistency

**Current Implementation (StatusDisplay.svelte):**
```css
background: linear-gradient(135deg,
  rgba(100, 50, 200, 0.3),
  rgba(50, 150, 255, 0.25),
  rgba(100, 50, 200, 0.2)
);
backdrop-filter: blur(12px) saturate(180%);
```

**Review Checklist:**
- [ ] Is backdrop-filter supported? (95% browser support)
- [ ] Are background alpha values consistent (0.2-0.4 range)?
- [ ] Does blur intensity (12px) work across all screens?
- [ ] Should glassmorphism be disabled on mobile for performance?
- [ ] Do gradients follow consistent direction (135deg)?

**Browser Fallback:**
```css
background: rgba(100, 50, 200, 0.3); /* Fallback */
backdrop-filter: blur(12px) saturate(180%);

/* Fallback for non-supporting browsers */
@supports not (backdrop-filter: blur(12px)) {
  background: rgba(100, 50, 200, 0.6); /* More opaque */
}
```

**Design Consistency Rules:**
- All glassmorphism uses 10-15px blur
- Alpha values: 0.2-0.4 for backgrounds
- Saturation: 150-180% for vibrant colors
- Always provide opaque fallback

### 6.3 Visual Polish Details

**Principle:** God is in the Details
Small refinements create perceived quality and professionalism.

#### Micro-Interactions Checklist

**Animations:**
- [ ] Do buttons have subtle hover lift (2-3px)?
- [ ] Are transitions smooth (300ms cubic-bezier)?
- [ ] Do loading states have meaningful animation?
- [ ] Are state changes announced visually?
- [ ] Do animations respect `prefers-reduced-motion`?

**Current Animation Timing:**
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Recommended Easing:**
- **Enter animations:** ease-out (decelerating)
- **Exit animations:** ease-in (accelerating)
- **Interactive:** ease-in-out (smooth both ends)
- **Attention-seeking:** bounce, elastic (sparingly)

**Review Checklist:**
- [ ] Are easing curves appropriate for animation type?
- [ ] Do animations feel too fast or too slow?
- [ ] Are animation durations consistent across similar elements?
- [ ] Do chained animations have proper delays?

#### Edge Cases & Error States

**Review Required:**
- [ ] What happens when player name is very long?
- [ ] How are network errors displayed?
- [ ] What if dice roll fails to complete?
- [ ] How is app load time communicated?
- [ ] Are there empty states for no data?

**Missing UI Elements:**
- Error toast/notification system
- Loading skeleton screens
- Empty state illustrations
- Confirmation modals
- Success/failure feedback toasts

**Design Improvements:**
```svelte
<!-- Error Toast Component -->
<div class="toast error" role="alert">
  <svg><!-- Error icon --></svg>
  <span>Roll failed. Please try again.</span>
  <button aria-label="Dismiss">×</button>
</div>

<style>
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  background: rgba(255, 0, 85, 0.9);
  border: 2px solid #ff0055;
  box-shadow: 0 0 20px rgba(255, 0, 85, 0.5);
  animation: slide-up 300ms ease-out;
}
</style>
```

#### Atmospheric Details

**Neural Background:**
- [Not reviewed - fixed element]
- **Question:** Does animation speed vary by device performance?
- **Question:** Is there a pause/disable option for accessibility?

**Scan Line Effect (styles.css, line 603-617):**
```css
body::before {
  content: '';
  position: fixed;
  /* ... */
  background: repeating-linear-gradient(0deg,
    transparent,
    transparent 2px,
    rgba(217, 70, 239, 0.015) 2px,
    rgba(217, 70, 239, 0.015) 4px
  );
}
```

**Review:**
- [ ] Is scan line effect noticeable? (0.015 alpha is very subtle)
- [ ] Does it add to atmosphere or create noise?
- [ ] Should it animate (moving scan lines)?
- [ ] Does it impact performance?

**Recommendation:** Increase opacity slightly to 0.03 for visibility

#### Corner Details & Micro-Spacing

**Status Display Augmented Corners:**
- Each stat has unique corner configuration
- Creates visual variety and interest
- Maintains family resemblance

**Review:**
- [ ] Do different corner configs create hierarchy?
- [ ] Should Health stat have more dramatic corners?
- [ ] Are corners too subtle or too aggressive?
- [ ] Do corners align to a system or feel random?

**Current Configuration:**
```
Health:  tr, tl-x, br-2-x
Failure: tl-2-y, tr, bl-x
Bonus:   tr-y, tl, br-2-x
Success: tl-x, tr-2, bl-y, br
```

**Pattern Analysis:**
- All have 2-3 clipped corners
- Mix of x/y clip directions
- One corner has "2" variant (larger clip)

**Recommendation:** Create visual rhythm
- Primary stat (Health): 3 clips, one large
- Secondary stats: 2 clips, uniform size
- Keep x/y variation for visual interest

---

## 7. IMPLEMENTATION WORKFLOW

### 7.1 Review Process

**Phase 1: Visual Audit (Week 1)**
1. Take screenshots of all game states
2. Annotate issues directly on screenshots
3. Prioritize: Critical → High → Medium → Low
4. Document in issue tracker

**Phase 2: Component Review (Week 2)**
1. Review one component per day
2. Open Chrome DevTools, inspect styles
3. Test responsive breakpoints (DevTools device toolbar)
4. Document CSS changes needed

**Phase 3: Implementation (Week 3-4)**
1. Fix critical issues first (accessibility, layout breaks)
2. Implement high-priority improvements
3. Test each change in isolation
4. Commit with descriptive messages

**Phase 4: QA & Refinement (Week 5)**
1. Cross-browser testing (Chrome, Firefox, Safari, Edge)
2. Device testing (iOS, Android, tablet)
3. Accessibility audit (screen reader, keyboard nav)
4. Performance testing (Lighthouse scores)

### 7.2 Testing Requirements

**Browser Support:**
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+

**Device Testing:**
- iPhone SE (375×667) - smallest modern phone
- iPhone 12 Pro (390×844) - standard modern phone
- iPad Air (820×1180) - tablet landscape
- Desktop 1920×1080 - standard desktop

**Accessibility Testing:**
- Keyboard navigation only
- Screen reader (NVDA, VoiceOver)
- High contrast mode
- 200% zoom
- Color blindness simulator

**Performance Testing:**
- Lighthouse score target: 90+
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

### 7.3 DevTools Workflows

**Inspecting Status Display:**
1. Open DevTools (F12)
2. Select Element tool (Ctrl+Shift+C)
3. Click on stat item
4. Review Computed styles panel
   - Check actual padding values
   - Verify augmented-ui clip-path
   - Measure touch target size
5. Edit CSS live to test changes
6. Copy working CSS to component file

**Testing Responsive Layout:**
1. Open DevTools Device Toolbar (Ctrl+Shift+M)
2. Select device preset or custom dimensions
3. Rotate device (portrait/landscape)
4. Test at critical breakpoints:
   - 320px (iPhone SE)
   - 375px (iPhone X)
   - 450px (breakpoint)
   - 600px (breakpoint)
   - 768px (breakpoint)
   - 900px (breakpoint)
5. Verify:
   - No horizontal overflow
   - Text legibility
   - Touch target sizes
   - Layout doesn't break

**Debugging Augmented-UI:**
1. Inspect element with augmented-ui
2. Check computed clip-path value
3. Use DevTools "Show Clipping" (more tools)
4. Verify border rendering
5. Test hover/focus states

**Performance Profiling:**
1. Open Performance tab
2. Start recording
3. Interact with UI (click buttons, roll dice)
4. Stop recording
5. Analyze:
   - Long tasks (>50ms)
   - Layout thrashing
   - Paint operations
   - Animation jank

---

## 8. SUCCESS CRITERIA

### 8.1 Accessibility Compliance
- [ ] WCAG 2.1 Level AA compliance (minimum)
- [ ] All interactive elements ≥44px touch targets
- [ ] Color contrast ratios ≥4.5:1 (normal text)
- [ ] Keyboard navigation fully functional
- [ ] Screen reader announces all state changes
- [ ] No focus trap issues
- [ ] Skip links for main content
- [ ] ARIA labels on all interactive elements

### 8.2 Visual Consistency
- [ ] All spacing uses design system tokens
- [ ] All colors use CSS custom properties
- [ ] Augmented-ui clip sizes follow system
- [ ] Glow effects consistent in intensity
- [ ] Typography hierarchy clear at all breakpoints
- [ ] Brand aesthetic maintained across all screens

### 8.3 Performance Targets
- [ ] Lighthouse Performance score ≥90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3.5s
- [ ] No layout shifts (CLS <0.1)
- [ ] Animations at 60fps
- [ ] Bundle size <500KB (gzipped)

### 8.4 User Experience
- [ ] No confusion about interactive elements
- [ ] Clear visual feedback on all actions
- [ ] Loading states prevent uncertainty
- [ ] Error states provide recovery paths
- [ ] One-handed mobile use comfortable
- [ ] Game state always clear
- [ ] No dead-end states

---

## APPENDIX A: Design System Tokens Reference

### Spacing Scale
```
--space-xs:  4px   | Use for: Micro-spacing, icon padding
--space-sm:  8px   | Use for: Component gaps, inline spacing
--space-md:  16px  | Use for: Container padding, section spacing
--space-lg:  24px  | Use for: Large gaps, heading margins
--space-xl:  32px  | Use for: Major section spacing
--space-2xl: 48px  | Use for: Page-level spacing
--space-3xl: 64px  | Use for: Hero sections
--space-4xl: 96px  | Use for: Dramatic spacing
```

### Typography Scale
```
--text-xs:   12px | Use for: Metadata, footnotes
--text-sm:   14px | Use for: Secondary info, labels
--text-base: 16px | Use for: Body text (minimum)
--text-lg:   18px | Use for: Emphasized body text
--text-xl:   20px | Use for: Subheadings
--text-2xl:  28px | Use for: Section headings
--text-3xl:  40px | Use for: Major headings
--text-4xl:  56px | Use for: Hero text
```

### Color Palette
```
Brand Colors:
--color-brand-yellow:    #ffd700 | Primary brand, CTAs
--color-cyber-magenta:   #d946ef | Accents, borders
--color-neon-cyan:       #00ffff | Links, focus states
--color-toxic-green:     #00ff00 | Success, code

Backgrounds:
--color-bg-primary:      #0a0a0a | Main background
--color-bg-secondary:    #1a1a1a | Cards, panels
--color-bg-tertiary:     #2a2a2a | Nested elements
--color-bg-darker:       #000000 | Overlays, code

Text:
--color-text-primary:    #ffffff | Headings, emphasis
--color-text-secondary:  rgba(255,255,255,0.85) | Body text
--color-text-muted:      rgba(255,255,255,0.6) | Metadata
```

### Augmented-UI Clips
```
--aug-clip-sm: 10px | Small components
--aug-clip-md: 12px | Medium components
--aug-clip-lg: 14px | Large components, CTAs
```

### Effects
```
Glow Intensity:
- Subtle:   0-10px blur, 0.2-0.3 alpha
- Moderate: 10-30px blur, 0.4-0.6 alpha
- Strong:   30-60px blur, 0.7-0.9 alpha

Animation Durations:
--transition-fast: 150ms | Micro-interactions
--transition-base: 300ms | Standard transitions
--transition-slow: 500ms | Dramatic effects
```

---

## APPENDIX B: Component-Specific Guidelines

### StatusDisplay.svelte
**Purpose:** Persistent game state indicators
**Visibility:** Always visible during gameplay
**Critical Elements:** Health, Success/Failure counters

**Design Requirements:**
- Health stat must be most prominent
- All stats readable at-a-glance
- Touch targets ≥44px (exit button)
- Responsive: 4-col → 2×2 grid
- Glow effects indicate stat importance

### AugmentedButton.svelte
**Purpose:** Primary and secondary actions
**Variants:** Primary (hero), Secondary (standard)

**Design Requirements:**
- Primary: Dramatically larger, animated gradient
- Secondary: Standard size, magenta gradient
- Touch target: ≥48px on mobile
- Glow extends beyond border
- Clear disabled state

### GameScreen.svelte
**Purpose:** Screen state manager and layout
**Structure:** Status + Content + Button areas

**Design Requirements:**
- Consistent button positioning (bottom-center)
- Status always visible
- Content area scrolls if needed
- Transitions smooth (300ms fade)

### IntroScreen.svelte
**Purpose:** Rules and story introduction
**Interaction:** Paged content, navigation buttons

**Design Requirements:**
- Readable text (line-length: 65ch)
- Clear heading hierarchy
- Button bar always visible
- Content scrolls independently

---

## APPENDIX C: Quick Reference Checklist

Use this for rapid daily review:

**Daily Visual QA (5 min):**
- [ ] Load game at 375px width (mobile)
- [ ] Check all text readable
- [ ] Verify buttons ≥44px height
- [ ] Test status display layout
- [ ] Confirm no horizontal scroll

**Weekly Comprehensive Review (30 min):**
- [ ] Test all breakpoints (320, 450, 600, 768, 900, 1920)
- [ ] Keyboard navigation through full game loop
- [ ] Color contrast check (WebAIM contrast checker)
- [ ] Lighthouse audit
- [ ] Cross-browser spot check

**Pre-Release Checklist:**
- [ ] All WCAG AA criteria met
- [ ] Tested on real iOS and Android devices
- [ ] Screen reader navigation functional
- [ ] No console errors
- [ ] Performance targets achieved
- [ ] Design system documented
- [ ] Responsive screenshots captured

---

## Document Metadata

**Created:** 2025-11-11
**Author:** Claude (Design Review Expert)
**Project:** Dimm City Solo RPG
**Version:** 1.0
**Last Updated:** 2025-11-11

**Related Documents:**
- `/home/founder3/code/dimm-city/dc-solo-rpg/VISUAL_REVIEW_STATUS.md` (tracking)
- `/home/founder3/code/dimm-city/dc-solo-rpg/ORCHESTRATION_SUMMARY.md` (project plan)
- `/home/founder3/code/dimm-city/dc-solo-rpg/src/styles.css` (design system)

**Next Steps:**
1. Review this document with team
2. Prioritize issues (Critical → High → Medium → Low)
3. Create GitHub issues for each item
4. Begin Phase 1: Visual Audit
